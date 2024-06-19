import sys

sys.path.append(".")  # allows for importing from the current directory

import pytest

import ranking_server
import time
import os
import glob
import json
from datetime import datetime


@pytest.fixture
def app():
    app = ranking_server.app
    yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_rank(client):
    fpath = "../data/test_data/twitter_raw__2024-06-14T15:26:28.072Z.json"
    payload = json.load(open(fpath))

    start = time.time()
    # Send POST request to the API
    response = client.post("/rank", json=payload)

    total_time = time.time() - start
    print(f"Request took {total_time:.2f} seconds")

    # Check if the request was successful (status code 200)
    assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__])
