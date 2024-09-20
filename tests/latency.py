import glob
import json
import requests

import argparse
import time
from collections import defaultdict

import numpy as np
import pandas as pd
import requests
from fastapi.encoders import jsonable_encoder
from ranking_challenge.fake import fake_request
from ranking_challenge.response import RankingResponse
from ranking_challenge.request import RankingRequest
import os

TARGET_LATENCY = 0.5  # Target latency in seconds (500ms p95)

# Main function to run the test
latencies = defaultdict(list)


# make a request and add it to results_df
def issue_request(ranking_request, url, results_df, platform):
    start_time = time.time()

    session = requests.Session()
    response = session.post(f"{url}/rank", json=jsonable_encoder(ranking_request))
    end_time = time.time()
    session.close()
    if response.status_code != 200:
        raise Exception(
            "Request failed with status code: {}, error: {}".format(
                response.status_code, response.text
            )
        )

    # Validate response is JSON-parsable, and is a valid response
    try:
        json_response = RankingResponse.model_validate_json(response.text)
    except Exception as e:
        raise Exception("Response did not validate: {}".format(e))

    latency = end_time - start_time

    # Store latency, platform, and number of items in DataFrame
    results_df.loc[len(results_df)] = [platform, latency, len(ranking_request.items)]

    return json_response


def get_p95_latency(results_df):
    latencies = results_df["Latency"].values
    print("Latencies", latencies)
    return np.percentile(latencies, 95)


if __name__ == "__main__":
    PLATFORMS = ["facebook", "reddit", "twitter"]
    # Step 1: Find all matching JSON files
    file_pattern = "rc-extension-data/twitter_2024-07-19*.json"
    json_files = glob.glob(file_pattern)

    url = "http://127.0.0.1:5001"

    

    result_dir = f"{os.path.dirname(__file__)}/results"
    if not os.path.exists(result_dir):
        os.makedirs(result_dir)

    for platform in PLATFORMS:
        results_df = pd.DataFrame(columns=["Platform", "Latency", "Num_Items"])
        # Step 2: Loop through each file and process it
        for idx, file_path in enumerate(json_files):
            print("idx", idx)
            fname = os.path.basename(file_path).replace(".json", "")
            with open(file_path, "r") as file:
                # Step 3: Parse the JSON content
                data = json.load(file)

            # Step 4: Extract the URL
            payload = data.get("raw", {})
            ranking_request = RankingRequest(**payload)

            response = issue_request(ranking_request, url, results_df, platform)
            # save the response to a file
            with open(f"{result_dir}/{platform}__response_{fname}.json", "w") as file:
                json.dump(jsonable_encoder(response), file)
            # latencies[platform].append(latency)

        p95 = get_p95_latency(results_df)
        print(f"\nLatency p95 for {platform} was {p95:.3f} seconds.")