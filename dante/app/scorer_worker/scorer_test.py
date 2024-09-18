"""
Created on Mon May 17 2021
This is a test for the scorer functions. 
Based on PRC scorer_test.py integration test, but use BASIC_EXAMPLE from ranking_server.test_data instead of generated data
How to run: call `pytest dante/app/scorer_worker/scorer_test.py` 
"""

from itertools import cycle

import pytest
from dante.app.scorer_worker.scorer_basic import compute_batch_scores
from dante.utils import getconfig, get_logger
from dante.app.ranking_server.test_data import BASIC_EXAMPLE
from fastapi.encoders import jsonable_encoder
from ranking_challenge.request import RankingRequest

# External dependencies imports
from pydantic import BaseModel, Field

c = getconfig()
logger = get_logger(__name__)

# soft time limit
TIME_LIMIT_SECONDS = int(c.get("SCORER", "TIME_LIMIT_SECONDS"))


class RandomScoreInput(BaseModel):
    item_id: str = Field(description="The ID of the item to score")
    text: str = Field(description="The body of the post for scoring")
    mean: float = Field(description="Mean of the random score", default=0.5)
    sdev: float = Field(
        description="Standard deviation of the radom score", default=0.1
    )
    sleep: float | None = Field(description="Sleep time for testing", default=None)
    raise_exception: bool = Field(
        description="Raise an exception for testing", default=False
    )


sample_posts = [
    "That's horrible",
    #
    "BREAKING NEWS- Active shooter at Bronx Lebanon Hospital in NYC. At least "
    "3 people have been shot and the shooter is still on the loose.The "
    "suspect is male wearing a lab coat and possibly armed with a M-16 rifle. "
    "There is smoke on the 16th floor and the bomb squad is also on the "
    "scene.",
    #
    "Arrest them all they deserve it. Getting scared now. We hate their "
    "treasonous actions at our expense",
    #
    "You Russian conmen always act like YOU are losing your minds..She has "
    "more integrity in her little finger than your entire, beloved, family "
    "trump. LOL... losers..lol...  keep whining, it is so becoming of "
    "'conservatives'..no substance, nothing to support, just whine, lie and "
    "distort.. we enjoy your dismay about American life.  haha. 🇺🇸",
    #
    "And the idiots were worried about Hillary's emails.  45 is using an "
    "unsecured phone but I guess that's okay.",
]


def datagen(n, task_latency_sec=0):
    items = cycle(sample_posts)
    for i in range(n):
        yield RandomScoreInput(
            item_id=str(i),
            text=next(items),
            sleep=task_latency_sec,
            mean=0.5,
            sdev=0.2,
        ).model_dump()


@pytest.fixture
def sample_data_prc():
    return list(datagen(n=4))


@pytest.fixture
def sample_data_with_timeout():
    data = list(datagen(n=4))
    data[-1]["sleep"] = TIME_LIMIT_SECONDS + 1
    return data


@pytest.fixture
def sample_data_with_exception():
    data = list(datagen(n=4))
    data[0]["raise_exception"] = True
    return data


@pytest.fixture
def sample_data():
    test_data = BASIC_EXAMPLE
    ranking_request = RankingRequest(**test_data)
    platform = ranking_request.session.platform
    post_items = ranking_request.items
    post_data = [
        {
            "id": item.id,
            "text": item.text,
            "urls": jsonable_encoder(item.embedded_urls) if item.embedded_urls else [],
        }
        for item in post_items
    ]
    return post_data


def test_har_batch_basic(my_celery_app, celery_worker, sample_data):
    # print(my_celery_app.control.inspect().registered())
    # ^ uncomment to figure out the names of the registered tasks
    # when running pytest from the parent directory of this test,
    # the task name is the following
    data = sample_data
    scores = compute_batch_scores(
        "dante.app.scorer_worker.tasks.har_batch_scorer", data, platform="twitter"
    )
    assert len(scores) == len(data)


def test_ar_batch_basic(my_celery_app, celery_worker, sample_data):
    # print(my_celery_app.control.inspect().registered())
    # ^ uncomment to figure out the names of the registered tasks
    # when running pytest from the parent directory of this test,
    # the task name is the following
    data = sample_data
    scores = compute_batch_scores(
        "dante.app.scorer_worker.tasks.ar_batch_scorer", data, platform="facebook"
    )
    assert len(scores) == len(data)


def test_td_batch_basic(my_celery_app, celery_worker, sample_data):
    print(my_celery_app.control.inspect().registered())
    # ^ uncomment to figure out the names of the registered tasks
    # when running pytest from the parent directory of this test,
    # the task name is the following
    data = sample_data
    scores = compute_batch_scores(
        "dante.app.scorer_worker.tasks.td_batch_scorer", data, platform="facebook"
    )
    assert len(scores) == len(data)
