import json

import pytest
import test_data

import ranking


@pytest.fixture
def app():
    app = ranking.app
    yield app


@pytest.fixture
def client(app):
    return app.test_client()


def test_rank(client):
    # # put named entities in redis
    # result_key = "my_worker:scheduled:top_named_entities"

    # fake_named_entities = ["foo", "bar", "baz"]
    # redis_client.set(
    #     result_key,
    #     json.dumps(
    #         {
    #             "top_named_entities": fake_named_entities,
    #             "timestamp": datetime.now(UTC).isoformat(),
    #         }
    #     ),
    # )

    # Send POST request to the API
    response = client.post("/rank", ranking_request=test_data.BASIC_EXAMPLE)
    print(response.json())

    # Check if the request was successful (status code 200)
    if response.status_code != 200:
        print(f"Request failed with status code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        assert False

    # result = response.json()

    # # Check if the response contains the expected ids, in the expected order
    # assert result["ranked_ids"] == [
    #     "should-rank-high",
    #     "should-rank-high-2",
    #     "should-rank-low",
    # ]


if __name__ == "__main__":
    pytest.main([__file__])
