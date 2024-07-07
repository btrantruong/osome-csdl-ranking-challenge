"""
Basic scorer

Adapted from examples/combined/scorer_worker/scorer_basic.py in the main
ranking_challenge repo.
"""

import time
from typing import Any

from celery import group
from celery.exceptions import TimeoutError
from celery.utils import uuid

from ...utils import get_logger, getconfig
from .celery_app import app as celery_app

logger = get_logger(__name__)
c = getconfig()
DEADLINE_SECONDS = c.get("SCORER", "DEADLINE_SECONDS")


def compute_scores(task_name: str,
                   input: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Task dispatcher/manager.

    Args:
        runner (Callable): The function that implements the task logic (from
                          `tasks.py`).
        input (list[dict[str, Any]]): List of input dictionaries for the tasks.

    Returns:
        list[dict[str, Any]]: List of output dictionaries for the tasks.
    """
    tasks = []
    for item in input:
        tasks.append(
            celery_app.signature(task_name,
                                 kwargs=item,
                                 options={"task_id": uuid()})
        )
    logger.info(f"Sending task group: {task_name}")
    async_result = group(tasks).apply_async()
    finished_tasks = []
    start = time.time()
    try:
        # if the tasks are very quick, you can try reducing the interval
        # parameter to get higher polling frequency
        finished_tasks = async_result.get(timeout=DEADLINE_SECONDS,
                                          interval=0.1)
    except TimeoutError:
        logger.error(
            f"Timed out waiting for results after {time.time() - start} "
            f"seconds: {task_name}"
        )
    except Exception:
        logger.exception(f"Exception in task runner: {task_name}")
    logger.info(f"Finished {len(finished_tasks)} tasks: {task_name}")
    return finished_tasks


def compute_batch_scores(
    task_name: str, input: list[dict[str, Any]], platform: str
) -> dict[str, float]:
    """Task dispatcher/manager.

    Args:
        runner (Callable): The function that implements the task logic (from
                          `tasks.py`).
        input (list[dict[str, Any]]): List of input dictionaries for the tasks.

    Returns:
        dict[str, float]: Output dictionary for the tasks. Each dictionary have
        item IDs as keys and values are scores
    """
    tasks = [
        celery_app.signature(
            task_name,
            kwargs={"batch": input, "platform": platform},
            options={"task_id": uuid()},
        )
    ]
    logger.info(f"Sending task group: {task_name}")
    async_result = group(tasks).apply_async()
    finished_tasks = []
    start = time.time()
    try:
        # if the tasks are very quick, you can try reducing the interval
        # parameter to get higher polling frequency
        (finished_tasks,) = async_result.get(timeout=DEADLINE_SECONDS,
                                             interval=0.1)
    except TimeoutError:
        logger.error(
            f"Timed out waiting for results after {time.time() - start} "
            f"seconds: {task_name}"
        )
    except Exception:
        logger.exception(f"Exception in task runner: {task_name}")
    logger.info(f"Finished {len(finished_tasks)} tasks: {task_name}")
    return finished_tasks
