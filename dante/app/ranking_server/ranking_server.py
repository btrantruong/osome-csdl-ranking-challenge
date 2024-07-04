<<<<<<< HEAD
## Run with: uvicorn --host 0.0.0.0 --port 8000 dante.app.ranking_server.ranking_server:app --reload
# Standard library imports
import json
import os

from bisect import bisect
from concurrent.futures import ThreadPoolExecutor, as_completed

# External dependencies
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
=======
from bisect import bisect
# from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
import os
import sys

from fastapi import FastAPI
>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
from ranking_challenge.request import RankingRequest, ContentItem
from ranking_challenge.response import RankingResponse
import redis
import uvicorn

<<<<<<< HEAD
# Package dependencies
from ...utils import getconfig, multisort, clean_text, get_logger
from ..scorer_worker.scorer_basic import compute_batch_scores

logger = get_logger(__name__)
logger.info("Starting up")

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

=======
from utils import multisort, clean_text

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

>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
memoized_redis_client = None


def redis_client():
    global memoized_redis_client
<<<<<<< HEAD
    c = getconfig()
    # Get connection string from environment or use value from configuration
    # file as a fallback
    REDIS_DB = os.getenv('REDIS_CONNECTION_STRING',
                         c.get("RANKER", "redis_db"))
=======
>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
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
<<<<<<< HEAD

    1. non_har_posts: an ordered list of Non-HaR (low-harm) posts. These posts
       are further ranked by audience diversity, break tie by AR score
       (sentiment)

    2. har_posts: an ordered list of HaR (harmful). These posts are further
       ranked by AR score (sentiment)

    Args:
        har_scores, ar_scores, ad_scores, td_scores (dict[str, float]):
            dictionary where k,v are item IDs, scores
=======
    1. non_har_posts: an ordered list of Non-HaR (low-harm) posts. These posts are further ranked by audience diversity, break tie by AR score (sentiment)
    2. har_posts: an ordered list of HaR (harmful). These posts are further ranked by AR score (sentiment)
    Args:
        har_scores, ar_scores, ad_scores, td_scores (dict[str, float]): dictionary where k,v are item IDs, scores
>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)

    Returns:
        (list of dict): a reordered list of dictionaries
    """
<<<<<<< HEAD
    # Helper: normalization for HaR scores
    c = getconfig()
    boundaries = json.loads(c.get("RANKER", "boundaries"))
=======
    ## Helper: normalization for HaR scores
    BOUNDARIES = [0.557, 0.572, 0.581, 0.6]
>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)

    ranked_results = []
    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity
<<<<<<< HEAD
    for item_id, har_score in har_scores:
        ar_score = ar_scores[item_id]
        har_normalized = bisect(boundaries, har_score)
        ad_score = ad_scores[item_id] if ad_scores[item_id] \
            != -1000 else td_scores[item_id]
=======

    for item_id, har_score in har_scores:
        ar_score = ar_scores[item_id]
        har_normalized = bisect(BOUNDARIES, har_score)
        ad_score = ad_scores[item_id] if ad_scores[item_id] != -1000 else td_scores[item_id]

>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
        processed_item = {
            "id": item_id,
            "audience_diversity": ad_score,
            "har_score": har_score,
            "ar_score": ar_score,
            "har_normalized": har_normalized,  # {0,1,2,3,4}
        }
<<<<<<< HEAD
        if har_normalized == (2 | 3 | 4):
            # posts that have interval 2, 3, 4: hars
            har_posts.append(processed_item)
        else:
            # posts that have interval 0 or 1: non-hars
            non_har_posts.append(processed_item)
    # rank non-HaR posts by audience diversity, break tie by AR score
    # (sentiment)
=======

        if har_normalized == (2 | 3 | 4):  # posts that have interval 2, 3, 4: hars
            har_posts.append(processed_item)
        else:  # posts that have interval 0 or 1: non-hars
            non_har_posts.append(processed_item)

    # rank non-HaR posts by audience diversity, break tie by AR score (sentiment)
>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
    multisort(
        non_har_posts,
        [("har_normalized", False), ("audience_diversity", True), ("ar_score", True)],
    )
    multisort(har_posts, [("har_normalized", False), ("ar_score", True)])
<<<<<<< HEAD
    # concat the two lists, prioritizing non-HaR posts
    # ranked_results = non_har_posts + har_posts
    ranked_results = non_har_posts + har_posts
=======

    # concat the two lists, prioritizing non-HaR posts
    # ranked_results = non_har_posts + har_posts
    ranked_results = non_har_posts + har_posts

>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
    return ranked_results


@app.post("/rank")
def rank(ranking_request: RankingRequest) -> RankingResponse:
<<<<<<< HEAD
    logger.info("Received ranking request")
    redis_client_obj = redis_client()
=======

    logger.info("Received ranking request")
    redis_client_obj = redis.Redis.from_url(REDIS_DB)
>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
    if ranking_request.survey:
        redis_client_obj[ranking_request.session.user_id] = (
            ranking_request.survey.ideology
        )
<<<<<<< HEAD
=======

>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
    platform = ranking_request.session.platform
    post_items = ranking_request.items
    post_data = [
        {
            "id": item.id,
            "text": (
                clean_text(item.text)
                if platform != "reddit"
                else clean_text(get_reddit_text(item))
            ),
<<<<<<< HEAD
            "urls": jsonable_encoder(item.embedded_urls) if item.embedded_urls else [],
        }
        for item in post_items
    ]
    # # Using ThreadPoolExecutor instead, see below
    #
    # # get different scores
    # har_scores = compute_batch_scores(
    #     "dante.app.scorer_worker.tasks.har_batch_scorer", post_data, platform
    # )
    # ar_scores = compute_batch_scores(
    #     "dante.app.scorer_worker.tasks.ar_batch_scorer", post_data, platform
    # )
    # ad_link_scores = compute_batch_scores(
    #     "dante.app.scorer_worker.tasks.ad_batch_scorer", post_data, platform
    # )
    # td_scores = compute_batch_scores(
    #     "dante.app.scorer_worker.tasks.td_batch_scorer", post_data, platform
    # )
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


# if __name__ == "__main__":
#     uvicorn.run(
#         "dante.app.ranking_server.ranking_server:app",
#         host="127.0.0.1",
#         port=5001,
#         log_level="debug",
#         reload=True,
#     )
=======
            "urls": item.embedded_urls if item.embedded_urls else [],
        }
        for item in post_items
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

    ## Using ThreadPoolExecutor doesn't work?
    # tasks = {
    #     "har_scores": (
    #         "scorer_worker.tasks.har_batch_scorer",
    #         post_data,
    #         platform,
    #     ),
    #     "ar_scores": ("scorer_worker.tasks.ar_batch_scorer", post_data, platform),
    #     "ad_scores": ("scorer_worker.tasks.ad_batch_scorer", post_data, platform),
    #     "td_scores": ("scorer_worker.tasks.td_batch_scorer", post_data, platform),
    # }

    # scores = {}
    # with ThreadPoolExecutor() as executor:
    #     future_to_task = {
    #         executor.submit(execute_task, *args): name for name, args in tasks.items()
    #     }
    #     for future in as_completed(future_to_task):
    #         task_name = future_to_task[future]
    #         try:
    #             scores[task_name] = future.result()
    #         except Exception as exc:
    #             logger.error(f"{task_name} generated an exception: {exc}")

    # har_scores = scores["har_scores"]
    # ar_scores = scores["ar_scores"]
    # ad_link_scores = scores["ad_scores"]
    # td_scores = scores["td_scores"]

    ranked_results = combine_scores(har_scores, ar_scores, ad_link_scores, td_scores)
    ranked_ids = [content.get("id", None) for content in ranked_results]
    result = {"ranked_ids": ranked_ids}

    return RankingResponse(**result)


if __name__ == "__main__":
    uvicorn.run(
        "ranking_server:app",
        host="127.0.0.1",
        port=5001,
        log_level="debug",
        reload=True,
    )
>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
