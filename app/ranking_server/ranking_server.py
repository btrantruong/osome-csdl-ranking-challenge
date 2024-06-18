import json
import logging
import os
from concurrent.futures.thread import ThreadPoolExecutor

import redis
from fastapi import FastAPI
from ranking_challenge.request import RankingRequest
from ranking_challenge.response import RankingResponse
from scorer_worker.scorer_basic import compute_scores as compute_scores_basic
from utils import multisort
from osomerank import audience_diversity, topic_diversity, elicited_response

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s.%(msecs)03d [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S,%f",
)
logger = logging.getLogger(__name__)
logger.info("Starting up")

REDIS_DB = f"{os.getenv('REDIS_CONNECTION_STRING', 'redis://localhost:6379')}/0"

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


# Straw-man fake hypothesis for why this ranker example is worthwhile:
# Paying too much attention to popular things or people makes a user sad.
# So let's identify the popular named entities in the user's feeds and
# down-rank anything with text that contains them. Then maybe they
# will be less sad.
@app.post("/rank")
def rank(ranking_request: RankingRequest) -> RankingResponse:
    logger.info("Received ranking request")
    ranked_results = []
    # get the named entities from redis
    result_key = "my_worker:scheduled:top_named_entities"

    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity

    data = [{"item_id": x.id, "text": x.text} for x in ranking_request.items]
    
    with ThreadPoolExecutor() as executor:
        
        future = executor.submit(
            compute_scores_basic, "scorer_worker.tasks.sentiment_scorer", data
        )
        try:
            # logger.info("Submitting score computation task")
            scoring_result = future.result(timeout=0.5)
        except TimeoutError:
            logger.error("Timed out waiting for score results")
        except Exception as e:
            logger.error(f"Error computing scores: {e}")
        else:
            logger.info(f"Computed scores: {scoring_result}")
    # preprocess posts
    # Filtering text: remove special characters, alphanumeric, return None if text doesn't meet some criterial like just one word or something
    # get audience diversity score
    # ad_scores = audience_diversity.ad_prediction(post_items, platform)
    ad_link_scores = audience_diversity.ad_prediction(post_items, platform)
    td_scores = topic_diversity.td_prediction(post_items, platform)
    # assuming that order is preserved
    har_scores = elicited_response.har_prediction(post_items, platform)
    ar_scores = elicited_response.ar_prediction(post_items, platform)

    for item, har_score, ar_score, ad_link_score, td_score in zip(
        post_items, har_scores, ar_scores, ad_link_scores, td_scores
    ):
        har_normalized = bisect(BOUNDARIES, har_score)
        ad_score = ad_link_score
        if ad_score == -1000:
            ad_score = td_score
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

    for item in ranking_request.items:
        score = -1 if any(ne in item.text for ne in top_entities) else 1
        ranked_results.append({"id": item.id, "score": score})

    ranked_results.sort(key=lambda x: x["score"], reverse=True)

    ranked_ids = [content["id"] for content in ranked_results]

    result = {
        "ranked_ids": ranked_ids,
    }
    return RankingResponse(**result)
