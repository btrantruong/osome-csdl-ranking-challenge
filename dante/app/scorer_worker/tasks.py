"""
Batch scoring tasks for the scoring job queue.

## Attributes

There are read from configuration file, see `dante.utils:getconfig`.

    - KILL_DEADLINE_SECONDS (float): Timeout before a task is killed by Celery

    - TIME_LIMIT_SECONDS (float): Timeout before Celery raises a timeout error.
      Must be less than KILL_DEADLINE_SECONDS

## Functions

These have actually all the signature of a method, where self is the celery
app. The `*_batch_scorer` are runners for batch scoring, so they return a list
of dictionaries instead of just a dictionary with id and score:

    har_scorer(**kwargs) -> dict[str, float]: runner for har scorer
    har_batch_scorer(**kwargs) -> list[dict[str, float]]:
    ar_batch_scorer(**kwargs) -> list[dict[str, float]]:
    ad_batch_scorer(**kwargs) -> list[dict[str, float]]:
    td_batch_scorer(**kwargs) -> list[dict[str, float]]:

Other utility functions:

    do_har_scoring(input: SentimentScoreInput) -> SentimentScoreOutput: helper
        function for har_scorer.

    init_osomerank(*args, **kwargs) -> None: Signal sent to Celery workers to
        load all model artifacts on worker init.

    do_batch_scoring(input: BatchScoreInput,
                     prediction_function: Callable[[list[str], str],
                                                   list[float]],
                     onlytext: Optional[bool] = False) -> dict[str, float]:
        utility function for the *_batch_scorer functions

## Models
    SentimentScoreInput
    SentimentScoreOutput
    BatchScoreInput
    ScoreOutput
"""

# Standard library imports
import time

from typing import Any, List, Dict, Callable, Optional

# External dependencies imports
from pydantic import BaseModel, Field
from celery.exceptions import SoftTimeLimitExceeded
from celery.signals import worker_init
from .celery_app import app

# Package imports
from dante.osomerank import (
    ar_prediction,
    har_prediction,
    ad_prediction,
    td_prediction,
    load_all,
    ER_AVG_SCORES,
    AD_AVG_SCORE,
)
from ...utils import getconfig, get_logger

logger = get_logger(__name__)

c = getconfig()

# hard time limit
KILL_DEADLINE_SECONDS = int(c.get("SCORER", "KILL_DEADLINE_SECONDS"))
# soft time limit
TIME_LIMIT_SECONDS = int(c.get("SCORER", "TIME_LIMIT_SECONDS"))


class SentimentScoreInput(BaseModel):
    id: str = Field(description="The ID of the item to score")
    text: str = Field(description="The body of the post for scoring")


class BatchScoreInput(BaseModel):
    batch: List[Dict[str, Any]] = Field(
        description="A list of dictionaries, each with 'id', 'text', 'urls' "
        "and 'platform' keys for batch scoring"
    )
    platform: str = Field(description="The platform of the items to score")


class ScoreOutput(BaseModel):
    id: str = Field(description="The ID of the item to score")
    score: float = Field(description="Numerical score")
    t_start: float = Field(description="Start time (seconds)", default=0)
    t_end: float = Field(description="End time (seconds)", default=0)


class BatchScoreOutput(BaseModel):
    batch: Dict[str, float] = Field(
        description="A dictionary where keys are item IDs and values " "are scores"
    )
    t_start: float = Field(description="Start time (seconds)", default=0)
    t_end: float = Field(description="End time (seconds)", default=0)


class TimeoutException(Exception):
    pass


class SentimentScoreOutput(ScoreOutput):
    pass


def do_har_scoring(input: SentimentScoreInput) -> SentimentScoreOutput:
    har_score, _ = har_prediction([input.text], "twitter")
    return SentimentScoreOutput(
        id=input.id,
        score=har_score,
    )


@worker_init.connect
def init_osomerank(*args, **kwargs) -> None:
    """
    Load all the model artifacts
    """
    load_all()


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def har_scorer(self, **kwargs) -> dict[str, float]:
    """Use pretrained model to perform HaR (Harmful Response) scoring

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible
                  to SentimentScoreInput, thus the input should contain
                  `id` and `text`

    Returns:
        dict[str, float]: The result of the har scoring task. The result is a
                          dictionary representation of SentimentScoreOutput

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
    input: BatchScoreInput,
    prediction_function: Callable[[list[str], str], list[float]],
    onlytext: Optional[bool] = False,
) -> dict[str, float]:
    """
    Call prediction_function with given input.batch, return a dict of results
    keyed by the item id

    Args:
        input: a BatchScoreInput object. input.batch is a list of dictionaries,
            each dictionary including the id, text, and urls of a post to
            score.

        preduction_function: a prediction function from dante.osomerank for
            scoring. See dante.osomerank.*_prediction.

        onlytext: an optional boolean (default False):
            if True, pass only the text of the posts to the scoring function.

    Returns:
        dict[str, float]: A dictionary of post ID -> score value entries.
    """
    if onlytext:
        records = (item["text"] for item in input.batch)
    else:
        records = input.batch
    scores, metrics = prediction_function(records, input.platform)
    result = dict()
    for item, score in zip(input.batch, scores):
        result[item["id"]] = score
    return result


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def har_batch_scorer(self, **kwargs) -> list[dict[str, float]]:
    """
    Use pretrained model to perform HaR (Harmful Response) scoring (batch mode)

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to
                  SentimentScoreInput, thus the input should contain `id` and
                  `text`

    Returns:
        dict[str, float]: The result of the har scoring task. The result is a
                          dictionary representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """
    try:
        start = time.time()
        task_id = self.request.id
        worker_id = self.request.hostname
        logger.info(f"Task {task_id} started by {worker_id}")
        input = BatchScoreInput(**kwargs)
        batch_result = BatchScoreOutput(
            batch=do_batch_scoring(input, har_prediction, onlytext=True),
            t_start=start,
            t_end=time.time(),
        )
        return batch_result.batch
    except SoftTimeLimitExceeded:
        # Return a default value when the soft time limit is exceeded
        return {item["id"]: ER_AVG_SCORES[input.platform]['HAR'] for item in input.batch}


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def ar_batch_scorer(self, **kwargs) -> list[dict[str, float]]:
    """
    Use pretrained model to perform AR (Affectiv Response) scoring (batch mode)

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to
                  SentimentScoreInput, thus the input should contain `id` and
                  `text`

    Returns:
        dict[str, float]: The result of the har scoring task. The result is a
                          dictionary representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """
    try:
        start = time.time()
        task_id = self.request.id
        worker_id = self.request.hostname
        logger.info(f"Task {task_id} started by {worker_id}")
        input = BatchScoreInput(**kwargs)
        batch_result = BatchScoreOutput(
            batch=do_batch_scoring(input, ar_prediction, onlytext=True),
            t_start=start,
            t_end=time.time(),
        )
        return batch_result.batch
    except SoftTimeLimitExceeded:
        # Return a default value when the soft time limit is exceeded
        return {item["id"]: ER_AVG_SCORES[input.platform]['AR'] for item in input.batch}


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def ad_batch_scorer(self, **kwargs) -> list[dict[str, float]]:
    """Use pretrained model to perform Audience diversity scoring (batch mode)

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to
                  SentimentScoreInput, thus the input should contain `id` and
                  `text`

    Returns:
        dict[str, float]: The result of the ad scoring task. The result is a
                          dictionary representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """
    try:
        start = time.time()
        task_id = self.request.id
        worker_id = self.request.hostname
        logger.info(f"Task {task_id} started by {worker_id}")
        input = BatchScoreInput(**kwargs)
        batch_result = BatchScoreOutput(
            batch=do_batch_scoring(input, ad_prediction),
            t_start=start,
            t_end=time.time(),
        )
        return batch_result.batch
    except SoftTimeLimitExceeded:
        # Return a default value when the soft time limit is exceeded
        return {item["id"]: AD_AVG_SCORE for item in input.batch}


@app.task(
    bind=True, time_limit=KILL_DEADLINE_SECONDS, soft_time_limit=TIME_LIMIT_SECONDS
)
def td_batch_scorer(self, **kwargs) -> list[dict[str, float]]:
    """Use pretrained model to perform Topic diversity scoring (batch mode)

    Args:
        **kwargs: Arbitrary keyword arguments. These should be convertible to
                  SentimentScoreInput, thus the input should contain `id` and
                  `text`

    Returns:
        dict[str, float]: The result of the ad scoring task. The result is a
                          dictionary representation of SentimentScoreOutput

    The results are stored in the Celery result backend.
    """
    try:
        start = time.time()
        task_id = self.request.id
        worker_id = self.request.hostname
        logger.info(f"Task {task_id} started by {worker_id}")
        input = BatchScoreInput(**kwargs)
        batch_result = BatchScoreOutput(
            batch=do_batch_scoring(input, td_prediction),
            t_start=start,
            t_end=time.time(),
        )
        return batch_result.batch
    except SoftTimeLimitExceeded:
        # Return a default value when the soft time limit is exceeded
        return {item["id"]: AD_AVG_SCORE for item in input.batch}
