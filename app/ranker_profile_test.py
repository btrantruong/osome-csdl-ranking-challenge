import sys

sys.path.append(".")  # allows for importing from the current directory

import pytest

import ranker_profile
import time
from osomerank.utils import get_file_logger
import os
import glob
import json
from datetime import datetime

formatted_time = datetime.now().strftime("%m%d%Y_%H:%M:%S")
log_dir = "/N/u/baotruon/BigRed200/osome-csdl-ranking-challenge/app/logs"
logger = get_file_logger(
    log_dir=log_dir,
    full_log_path=os.path.join(log_dir, f"ranker_profile_test__{formatted_time}.log"),
    also_print=True,
)


@pytest.fixture
def app():
    app = ranker_profile.app
    yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_rank(client):
    for fpath in glob.glob(
        "/N/u/baotruon/BigRed200/osome-csdl-ranking-challenge/data/extension_dowon/twitter_raw__2024-06-07T14:54:47.090Z.json"
    ):
        fname = os.path.basename(fpath)
        payload = json.load(open(fpath))
        logger.info(f"** Testing {fname}")

        start = time.time()
        # Send POST request to the API
        response = client.post("/rank", json=payload)

        total_time = time.time() - start
        logger.info(f"Request took {total_time:.2f} seconds")

        # Check if the request was successful (status code 200)
        assert response.status_code == 200
        logger.info(f"Tested {fname} successfully")


if __name__ == "__main__":
    pytest.main([__file__])
