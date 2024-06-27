import json
from datetime import UTC, datetime
from unittest.mock import patch

import fakeredis
import pytest
import test_data
from fastapi.testclient import TestClient

import ranking_server


@pytest.fixture
def app(redis_client):
    with patch("ranking_server.redis_client", return_value=redis_client):
        app = ranking_server.app
        yield app


@pytest.fixture
def client(app):
    return TestClient(app)


@pytest.fixture
def redis_client(request):
    redis_client = fakeredis.FakeRedis()
    return redis_client


def test_rank(client, redis_client):
    # Send POST request to the API
    response = client.post("/rank", json=test_data.BASIC_EXAMPLE)

    # Check if the request was successful (status code 200)
    if response.status_code != 200:
        print(f"Request failed with status code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        assert False

    result = response.json()
    print("Finished test ")
