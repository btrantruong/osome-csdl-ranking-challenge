"""Scoring tasks for the scoring job queue.

We illustrate two types of scoring tasks: random scoring and har scoring.
Random scoring tasks additionally provide optional parameters to control task
duration and raise exceptions for testing.

In this example, the output format of the different types of scoring tasks is
identical; if the output format differs the client code must keep track of task
types and deserialize the output accordingly.

We provide Pydantic models for inputs and outputs, as they are self-documenting
and provide built-in validation. They can optionally be used by the client code
to construct tasks. Keep in mind that Celery's default serialization protocol is
JSON, so the implementer is free to choose any favorite data type that can be
easily converted to and from JSON, such as dataclasses, Pydantic models, vanilla
dicts, etc.

Timing information in the output is included for illustration/benchmarking.


Attributes:
    KILL_DEADLINE_SECONDS (float): Timeout before a task is killed by Celery
    TIME_LIMIT_SECONDS (float): Timeout before Celery raises a timeout error. Must
                                be less than KILL_DEADLINE_SECONDS

Functions:
    har_scorer(**kwargs) -> dict[str, Any]: runner for har scorer

Models:
    SentimentScoreInput
    SentimentScoreOutput
"""

import logging
import random
import time
from typing import Any, List, Dict, Callable
from osomerank import elicited_response, audience_diversity
from pydantic import BaseModel, Field
from scorer_worker.celery_app import app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


KILL_DEADLINE_SECONDS = 10
TIME_LIMIT_SECONDS = 4


class SentimentScoreInput(BaseModel):
    item_id: str = Field(description="The ID of the item to score")
    text: str = Field(description="The body of the post for scoring")


class BatchScoreInput(BaseModel):
    batch: List[Dict[str, Any]] = Field(
        description="A list of dictionaries, each with 'item_id' and 'text' keys for batch scoring"
    )


class AudienceDiversityInput(BaseModel):
    item_id: str = Field(description="The ID of the item to score")
    text: str = Field(description="The body of the post for scoring")
    url: str = Field(description="The URL of the post for scoring")


class AudienceDiversityBatchInput(BaseModel):
    batch: List[Dict[str, Any]] = Field(
        description="A list of dictionaries, each with 'item_id', 'text', 'embedded_urls' keys for batch scoring"
    )
    platform: str = Field(description="The platform of the posts for scoring")


class ScoreOutput(BaseModel):
    item_id: str = Field(description="The ID of the item to score")
    score: float = Field(description="Numerical score")
    t_start: float = Field(description="Start time (seconds)", default=0)
    t_end: float = Field(description="End time (seconds)", default=0)


class BatchScoreOutput(BaseModel):
    batch: List[Dict[str, Any]] = Field(
        description="A list of dictionaries, each with 'item_id' and 'text' keys for batch scoring"
    )
    t_start: float = Field(description="Start time (seconds)", default=0)
    t_end: float = Field(description="End time (seconds)", default=0)


class TimeoutException(Exception):
    pass


class SentimentScoreOutput(ScoreOutput):
    pass


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


def do_har_scoring(input: SentimentScoreInput) -> SentimentScoreOutput:
    har_score = elicited_response.har_prediction([input.text], "twitter")
    return SentimentScoreOutput(
        item_id=input.item_id,
        score=har_score,
    )


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def har_scorer(self, **kwargs) -> dict[str, Any]:
    """Use pretrained model to perform HaR (Harmful Response) scoring

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to SentimentScoreInput,
                  thus the input should contain `item_id` and `text`

    Returns:
        dict[str, Any]: The result of the har scoring task. The result is a dictionary
                        representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """
    start = time.time()
    task_id = self.request.id
    worker_id = self.request.hostname
    logger.info(f"Task {task_id} started by {worker_id}")
    input = SentimentScoreInput(**kwargs)
    result = do_har_scoring(input)
    result.t_start = start
    result.t_end = time.time()
    return result.model_dump()


def do_batch_scoring(
    input: BatchScoreInput, prediction_function: Callable[[list[str], str], list[float]]
) -> list[dict[str, Any]]:
    scores = prediction_function([item["text"] for item in input.batch], "twitter")
    batch = [
        {
            "item_id": item["item_id"],
            "score": score,
        }
        for item, score in zip(input.batch, scores)
    ]

    return batch


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def har_batch_scorer(self, **kwargs) -> list[dict[str, Any]]:
    """Use pretrained model to perform HaR (Harmful Response) scoring (batch mode)

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to SentimentScoreInput,
                  thus the input should contain `item_id` and `text`

    Returns:
        dict[str, Any]: The result of the har scoring task. The result is a dictionary
                        representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """

    start = time.time()
    task_id = self.request.id
    worker_id = self.request.hostname
    logger.info(f"Task {task_id} started by {worker_id}")
    input = BatchScoreInput(**kwargs)
    batch_result = BatchScoreOutput(
        batch=do_batch_scoring(input, elicited_response.har_prediction),
        t_start=start,
        t_end=time.time(),
    )
    return batch_result.model_dump()


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def ar_batch_scorer(self, **kwargs) -> list[dict[str, Any]]:
    """Use pretrained model to perform AR (Affectiv Response) scoring (batch mode)

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to SentimentScoreInput,
                  thus the input should contain `item_id` and `text`

    Returns:
        dict[str, Any]: The result of the har scoring task. The result is a dictionary
                        representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """
    start = time.time()
    task_id = self.request.id
    worker_id = self.request.hostname
    logger.info(f"Task {task_id} started by {worker_id}")
    input = BatchScoreInput(**kwargs)
    batch_result = BatchScoreOutput(
        batch=do_batch_scoring(input, elicited_response.ar_prediction),
        t_start=start,
        t_end=time.time(),
    )
    return batch_result.model_dump()


def do_ad_td_batch_scoring(
    input: AudienceDiversityBatchInput,
    prediction_function: Callable[[list[str], str], list[float]],
) -> list[dict[str, Any]]:
    scores = prediction_function([item for item in input.batch], input.platform)
    batch = [
        {
            "item_id": item["item_id"],
            "score": score,
        }
        for item, score in zip(input.batch, scores)
    ]

    return batch


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def ad_batch_scorer(self, **kwargs) -> list[dict[str, Any]]:
    """Use pretrained model to perform Audience diversity scoring (batch mode)

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to SentimentScoreInput,
                  thus the input should contain `item_id` and `text`

    Returns:
        dict[str, Any]: The result of the ad scoring task. The result is a dictionary
                        representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """

    start = time.time()
    task_id = self.request.id
    worker_id = self.request.hostname
    logger.info(f"Task {task_id} started by {worker_id}")
    input = AudienceDiversityBatchInput(**kwargs)
    batch_result = BatchScoreOutput(
        batch=do_ad_td_batch_scoring(input, audience_diversity.ad_prediction),
        t_start=start,
        t_end=time.time(),
    )
    return batch_result.model_dump()


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def td_batch_scorer(self, **kwargs) -> list[dict[str, Any]]:
    """Use pretrained model to perform Topic diversity scoring (batch mode)

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to SentimentScoreInput,
                  thus the input should contain `item_id` and `text`

    Returns:
        dict[str, Any]: The result of the ad scoring task. The result is a dictionary
                        representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """

    start = time.time()
    task_id = self.request.id
    worker_id = self.request.hostname
    logger.info(f"Task {task_id} started by {worker_id}")
    input = AudienceDiversityBatchInput(**kwargs)
    batch_result = BatchScoreOutput(
        batch=do_ad_td_batch_scoring(input, audience_diversity.td_prediction),
        t_start=start,
        t_end=time.time(),
    )
    return batch_result.model_dump()
