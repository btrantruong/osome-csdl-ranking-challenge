## Run with: uvicorn --host 0.0.0.0 --port 8000 dante.app.ranking_server.ranking_server:app --reload
# Standard library imports
import json
import os

from bisect import bisect
from concurrent.futures import ThreadPoolExecutor, as_completed

# External dependencies
import redis
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from ranking_challenge.request import RankingRequest, ContentItem
from ranking_challenge.response import RankingResponse

# Package dependencies
from ...utils import getconfig, multisort, clean_text, get_logger
from ..scorer_worker.scorer_basic import compute_batch_scores

logger = get_logger(__name__)
logger.info("Starting up")

# XXX read version from __version__ file?
app = FastAPI(
    title="Prosocial Ranking Challenge combined example",
    description="Ranks input based on how unpopular the things "
    "and people in it are.",
    version="0.1.0",
)

# Set up CORS. This is necessary if calling this code directly from a browser extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["HEAD", "OPTIONS", "GET", "POST"],
    allow_headers=["*"],
)

memoized_redis_client = None


def redis_client():
    global memoized_redis_client
    c = getconfig()
    # Get connection string from environment or use value from configuration
    # file as a fallback
    REDIS_DB = os.getenv("REDIS_CONNECTION_STRING", c.get("RANKER", "redis_db"))
    if memoized_redis_client is None:
        memoized_redis_client = redis.Redis.from_url(REDIS_DB)
    return memoized_redis_client


def execute_task(task_name, post_data, platform):
    return compute_batch_scores(task_name, post_data, platform)


def get_reddit_text(post: ContentItem):
    # post: dict with at least the key "text", optional: "title"
    title = post.title if post.title else ""
    text = post.text
    return title + text


def combine_scores(har_scores, ar_scores, ad_scores, td_scores):
    """
    Combine scores into a single list of dictionaries.
    Items are ordered as follows:

    1. non_har_posts: an ordered list of Non-HaR (low-harm) posts. These posts
       are further ranked by audience diversity, break tie by AR score
       (sentiment)

    2. har_posts: an ordered list of HaR (harmful). These posts are further
       ranked by AR score (sentiment)

    Args:
        har_scores, ar_scores, ad_scores, td_scores (dict[str, float]):
            dictionary where k,v are item IDs, scores

    Returns:
        (list of dict): a reordered list of dictionaries
    """
    # Helper: normalization for HaR scores
    c = getconfig()
    boundaries = json.loads(c.get("RANKER", "boundaries"))
    ranked_results = []
    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity
    # TODO: find a way to vectorize this aggregation
    for item_id, har_score in har_scores.items():
        ar_score = ar_scores[item_id]
        har_normalized = bisect(boundaries, har_score)
        ad_score = (
            ad_scores[item_id] if ad_scores[item_id] != -1000 else td_scores[item_id]
        )
        processed_item = {
            "id": item_id,
            "audience_diversity": ad_score,
            "har_score": har_score,
            "ar_score": ar_score,
            "har_normalized": har_normalized,  # {0,1,2,3,4}
        }
        if har_normalized == (2 | 3 | 4):
            # posts that have interval 2, 3, 4: hars
            har_posts.append(processed_item)
        else:
            # posts that have interval 0 or 1: non-hars
            non_har_posts.append(processed_item)
    # rank non-HaR posts by audience diversity, break tie by AR score
    # (sentiment)
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
    try:
        logger.info("Received ranking request")
        redis_client_obj = redis_client()
        if ranking_request.survey:
            redis_client_obj[ranking_request.session.user_id] = (
                ranking_request.survey.ideology
            )
        platform = ranking_request.session.platform.lower()
        post_items = ranking_request.items
        post_data = [
            {
                "id": item.id,
                "text": (
                    clean_text(item.text)
                    if platform != "reddit"
                    else clean_text(get_reddit_text(item))
                ),
                "urls": (
                    jsonable_encoder(item.embedded_urls) if item.embedded_urls else []
                ),
            }
            for item in post_items
        ]
        tasks = {
            "har_scores": (
                "dante.app.scorer_worker.tasks.har_batch_scorer",
                post_data,
                platform,
            ),
            "ar_scores": (
                "dante.app.scorer_worker.tasks.ar_batch_scorer",
                post_data,
                platform,
            ),
            "ad_scores": (
                "dante.app.scorer_worker.tasks.ad_batch_scorer",
                post_data,
                platform,
            ),
            "td_scores": (
                "dante.app.scorer_worker.tasks.td_batch_scorer",
                post_data,
                platform,
            ),
        }
        scores = {}
        with ThreadPoolExecutor() as executor:
            future_to_task = {
                executor.submit(execute_task, *args): name
                for name, args in tasks.items()
            }
            for future in as_completed(future_to_task):
                task_name = future_to_task[future]
                try:
                    scores[task_name] = future.result()
                except Exception as exc:
                    logger.error(f"{task_name} generated an exception: {exc}")


    # har_scores dict[str, float]: Output dictionary for the task: (k-v) pairs are (item ID-score)
        ranked_results = combine_scores(
            har_scores=scores["har_scores"],
            ar_scores=scores["ar_scores"],
            ad_scores=scores["ad_scores"],
            td_scores=scores["td_scores"],
        )
        ranked_ids = [content.get("id", None) for content in ranked_results]
        result = {"ranked_ids": ranked_ids}
        return RankingResponse(**result)
    except Exception as e:
        logger.error(f"Failed to rank posts: {e}")
        return RankingResponse(ranked_ids=[])


# if __name__ == "__main__":
#     uvicorn.run(
#         "dante.app.ranking_server.ranking_server:app",
#         host="127.0.0.1",
#         port=5001,
#         log_level="debug",
#         reload=True,
#     )
