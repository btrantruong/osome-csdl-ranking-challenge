import pytest
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))
from scorer_worker.scorer_basic import compute_batch_scores
from ranking_challenge.request import ContentItem
from fastapi.encoders import jsonable_encoder
import pandas as pd

ABS_PATH = "/Users/baott/ranking-challenge/verification/latency_test/"
facebook = pd.read_json(f"{ABS_PATH}/facebook_feed.json")
reddit = pd.read_json(f"{ABS_PATH}/reddit_feed.json")
twitter = pd.read_json(f"{ABS_PATH}/twitter_feed.json")

TARGET_LATENCY = 0.5  # Target latency in seconds (500ms p95)
NUM_REQUESTS = (
    600  # Number of requests for each platform to generate a statistically valid sample
)
PLATFORMS = ["Facebook", "Reddit", "Twitter"]
SAMPLES = {"Facebook": facebook, "Reddit": reddit, "Twitter": twitter}

results_df = pd.DataFrame(columns=["Platform", "Latency", "Num_Items"])


# Generates the next request for the platform by iterating through the
# dataframe for the next sample, and returning it in json format. Goes through
# each dataframe individually
def generate_items(platform):
    selected_rows = {}
    df = SAMPLES.get(platform)

    selected_indices = selected_rows.get(platform, [])
    filtered_df = df[~df.index.isin(selected_indices)]

    next_row = filtered_df.iloc[0] if not filtered_df.empty else None

    # Update selected_rows dictionary
    if next_row is not None:
        selected_indices.append(next_row.name)
        selected_rows[platform] = selected_indices

    content_items = [ContentItem.model_validate(item_df) for item_df in next_row]
    return content_items


@pytest.fixture
def sample_data_reddit():
    return generate_items("Reddit")


@pytest.fixture
def sample_data_facebook():
    return generate_items("Facebook")


@pytest.fixture
def sample_data_twitter():
    return generate_items("Twitter")


def test_har_batch_basic(my_celery_app, celery_worker, sample_data_facebook):
    # print(my_celery_app.control.inspect().registered())
    # ^ uncomment to figure out the names of the registered tasks
    # when running pytest from the parent directory of this test,
    # the task name is the following
    data = jsonable_encoder(sample_data_facebook)
    scores = compute_batch_scores("scorer_worker.tasks.har_batch_scorer", data)
    assert len(scores) == len(data)


def test_ar_batch_basic(my_celery_app, celery_worker, sample_data_facebook):
    # print(my_celery_app.control.inspect().registered())
    # ^ uncomment to figure out the names of the registered tasks
    # when running pytest from the parent directory of this test,
    # the task name is the following
    data = jsonable_encoder(sample_data_facebook)
    scores = compute_batch_scores("scorer_worker.tasks.ad_batch_scorer", data)
    assert len(scores) == len(data)


def test_ar_batch_basic(my_celery_app, celery_worker, sample_data_facebook):
    data = jsonable_encoder(sample_data_facebook)
    scores = compute_batch_scores("scorer_worker.tasks.td_batch_scorer", data)
    assert len(scores) == len(data)
