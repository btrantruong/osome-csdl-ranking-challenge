import pytest
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))
from scorer_worker.scorer_basic import compute_batch_scores
from ranking_challenge.request import ContentItem
from ranking_challenge.fake import fake_request
from fastapi.encoders import jsonable_encoder
import pandas as pd
from osomerank.utils import save_to_json, clean_text

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
    # a = content_items[0].__fields__.keys()
    return content_items


@pytest.fixture
def sample_data_reddit():
    items = generate_items("Reddit")
    request = fake_request(n_posts=4, n_comments=1, platform="Reddit".lower())
    return request


@pytest.fixture
def sample_data_facebook():
    items = generate_items("Facebook")
    request = fake_request(n_posts=4, n_comments=1, platform="Facebook".lower())
    return request


@pytest.fixture
def sample_data_twitter():
    items = generate_items("Twitter")
    request = fake_request(n_posts=4, n_comments=1, platform="Twitter".lower())
    return request


def test_har_batch(my_celery_app, celery_worker, sample_data_facebook):
    # print(my_celery_app.control.inspect().registered())
    # ^ uncomment to figure out the names of the registered tasks
    # when running pytest from the parent directory of this test,
    # the task name is the following
    ranking_request = jsonable_encoder(sample_data_facebook)
    platform = ranking_request.get("session")["platform"]
    post_items = ranking_request.get("items")
    # preprocess posts: clean text
    post_data = [
        {"id": x["id"], "text": clean_text(x["text"]), "urls": x["embedded_urls"]}
        for x in post_items
    ]

    har_scores = compute_batch_scores(
        "scorer_worker.tasks.har_batch_scorer", post_data, platform
    )
    assert len(har_scores) == len(post_data)
    ar_scores = compute_batch_scores(
        "scorer_worker.tasks.ar_batch_scorer", post_data, platform
    )
    assert len(ar_scores) == len(post_data)
    ad_link_scores = compute_batch_scores(
        "scorer_worker.tasks.ad_batch_scorer", post_data, platform
    )
    assert len(ad_link_scores) == len(post_data)
    td_scores = compute_batch_scores(
        "scorer_worker.tasks.td_batch_scorer", post_data, platform
    )
    assert len(td_scores) == len(post_data)
