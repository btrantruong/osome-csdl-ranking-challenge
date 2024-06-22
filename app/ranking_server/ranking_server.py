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
from concurrent.futures import ThreadPoolExecutor, as_completed

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


def execute_task(task_name, post_data, platform):
    return compute_batch_scores(task_name, post_data, platform)


def combine_scores(har_scores, ar_scores, ad_scores, td_scores):
    """
    Combine scores into a single list of dictionaries.
    Items are ordered as follows:
    1. non_har_posts: an ordered list of Non-HaR (low-harm) posts. These posts are further ranked by audience diversity, break tie by AR score (sentiment)
    2. har_posts: an ordered list of HaR (harmful). These posts are further ranked by AR score (sentiment)
    Args:
        har_scores, ar_scores, ad_scores, td_scores (list of dict): list of dictionaries, each with 'id' and 'score' keys for batch scoring"

    Returns:
        (list of dict): a reordered list of dictionaries
    """
    ## Helper: normalization for HaR scores
    BOUNDARIES = [0.557, 0.572, 0.581, 0.6]

    ranked_results = []
    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity

    for item_id, har_score in har_scores.items():
        ar_score = ar_scores[item_id]
        har_normalized = bisect(BOUNDARIES, har_score)
        ad_score = ad_scores[item_id] if ad_score != -1000 else td_scores[item_id]

        processed_item = {
            "id": item_id,
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

    return ranked_results


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

    # preprocess posts: clean text
    post_data = [
        {"id": x["id"], "text": clean_text(x["text"]), "urls": x["embedded_urls"]}
        for x in post_items
    ]

    # get different scores
    tasks = {
        "har_scores": (
            "scorer_worker.tasks.har_batch_scorer",
            post_data,
            platform,
        ),
        "ar_scores": ("scorer_worker.tasks.ar_batch_scorer", post_data, platform),
        "ad_scores": ("scorer_worker.tasks.ad_batch_scorer", post_data, platform),
        "td_scores": ("scorer_worker.tasks.td_batch_scorer", post_data, platform),
    }

    scores = {}
    with ThreadPoolExecutor() as executor:
        future_to_task = {
            executor.submit(execute_task, *args): name for name, args in tasks.items()
        }
        for future in as_completed(future_to_task):
            task_name = future_to_task[future]
            try:
                scores[task_name] = future.result()
            except Exception as exc:
                logger.error(f"{task_name} generated an exception: {exc}")

    har_scores = scores["har_scores"]
    ar_scores = scores["ar_scores"]
    ad_link_scores = scores["ad_scores"]
    td_scores = scores["td_scores"]

    ranked_results = combine_scores(har_scores, ar_scores, ad_link_scores, td_scores)
    ranked_ids = [content.get("id", None) for content in ranked_results]
    result = {"ranked_ids": ranked_ids}

    return RankingResponse(**result)


if __name__ == "__main__":
    uvicorn.run(
        "ranking_server:app", workers=2, host="127.0.0.1", port=5001, log_level="debug"
    )
