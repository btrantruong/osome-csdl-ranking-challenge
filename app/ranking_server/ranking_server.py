import json
import logging
import os
from concurrent.futures.thread import ThreadPoolExecutor

import uvicorn
import redis
from fastapi import FastAPI

from utils import multisort, clean_text
from bisect import bisect
from ranking_challenge.request import RankingRequest
from ranking_challenge.response import RankingResponse
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from scorer_worker.scorer_basic import compute_batch_scores

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s.%(msecs)03d [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S,%f",
)
logger = logging.getLogger(__name__)
logger.info("Starting up")

REDIS_DB = f"{os.getenv('REDIS_URL', 'redis://localhost:6379')}/0"

app = FastAPI(
    title="Prosocial Ranking Challenge combined example",
    description="Ranks input based on how unpopular the things and people in it are.",
    version="0.1.0",
)

memoized_redis_client = None


def redis_client():
    global memoized_redis_client
    if memoized_redis_client is None:
        memoized_redis_client = redis.Redis.from_url(REDIS_DB)
    return memoized_redis_client


## Helper: normalization for HaR scores
BOUNDARIES = [0.557, 0.572, 0.581, 0.6]


# Items are ordered as follows:
# 1. An ordered list of Non-HaR (low-harm) posts are further ranked by audience diversity, break tie by AR score (sentiment)
# 2. An ordered list of HaR (harmful) posts are ranked by AR score (sentiment)
@app.post("/rank")
def rank(ranking_request: RankingRequest) -> RankingResponse:

    logger.info("Received ranking request")
    redis_client_obj = redis.Redis.from_url(REDIS_DB)
    if "survey" in ranking_request.keys():
        redis_client_obj[ranking_request.session.user_id] = (
            ranking_request.survey.ideology
        )

    platform = ranking_request.session.platform
    post_items = ranking_request.items
    ranked_results = []
    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity

    # preprocess posts: clean text
    post_data = [
        {"id": x["id"], "text": clean_text(x["text"]), "urls": x["embedded_urls"]}
        for x in post_items
    ]

    # get different scores
    har_scores = compute_batch_scores(
        "scorer_worker.tasks.har_batch_scorer", post_data, platform
    )
    ar_scores = compute_batch_scores(
        "scorer_worker.tasks.ar_batch_scorer", post_data, platform
    )
    ad_link_scores = compute_batch_scores(
        "scorer_worker.tasks.ad_batch_scorer", post_data, platform
    )
    td_scores = compute_batch_scores(
        "scorer_worker.tasks.td_batch_scorer", post_data, platform
    )

    for item in post_texts:
        item_id = item["id"]
        har_score = har_scores[item_id]
        ar_score = ar_scores[item_id]
        har_normalized = bisect(BOUNDARIES, har_scores[item_id])
        ad_score = ad_link_scores[item_id] if ad_score != -1000 else td_scores[item_id]

        processed_item = {
            "id": item["id"],
            "text": item["text"],
            "audience_diversity": ad_score,
            "har_score": har_score,
            "ar_score": ar_score,
            "har_normalized": har_normalized,  # {0,1,2,3,4}
        }

        if har_normalized == (2 | 3 | 4):  # posts that have interval 2, 3, 4: hars
            har_posts.append(processed_item)
        else:  # posts that have interval 0 or 1: non-hars
            non_har_posts.append(processed_item)

    # rank non-HaR posts by audience diversity, break tie by AR score (sentiment)
    multisort(
        non_har_posts,
        [("har_normalized", False), ("audience_diversity", True), ("ar_score", True)],
    )
    multisort(har_posts, [("har_normalized", False), ("ar_score", True)])

    # concat the two lists, prioritizing non-HaR posts
    # ranked_results = non_har_posts + har_posts
    ranked_results = non_har_posts + har_posts
    ranked_ids = [content.get("id", None) for content in ranked_results]
    result = {"ranked_ids": ranked_ids}

    return RankingResponse(**result)


if __name__ == "__main__":
    uvicorn.run(
        "ranking_server:app", workers=2, host="127.0.0.1", port=5001, log_level="debug"
    )
