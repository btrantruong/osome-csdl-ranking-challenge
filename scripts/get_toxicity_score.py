"""
PURPOSE:
    A script for downloading the probability of posts being toxic utilizing the Perspective
        API to gather.
        - Ref: https://developers.perspectiveapi.com/s/about-the-api
    This file also stores the post IDs for language errors* that the API cannot handle
        and can be restarted if the script falls over midway through data collection,
        without re-querying posts for that day again.

    * Language errors are either:
        1. The API does not handle the language in the post (e.g. Japanese is not supported)
        2. The API cannot recognize the language in the post
            - Sometimes this happens, e.g., simply because the post only contains a URL

INPUT:
    Project `config.ini` file with the necessary paths.

OUTPUT:
    Files containing:
     1. all toxicity probabilities for each post in a column called "toxicity"
        - rows contain one post per row
        - other columns will contain information to identify the source of the post and who
            may have been referenced
        Format: f"{file_date}--toxicity.parquet"
    2. files that represents a previously queried post ID that caused the Perspective
        API to throw a language error. (see above for more details)
        Format: f"{YYYY-MM-DD}--language_errors.parquet"

Author: Matthew DeVerna (modified by Bao Truong)
"""

### ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Load Packages ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
import datetime
import glob
import httplib2
import os
import random
import time

import pandas as pd

from osomerank.utils import get_logger
from googleapiclient import discovery

import os
import configparser
### ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Create Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
def switch_api_keys(api_key=str, all_keys=list):
    """
    Return the next api key from the provided list
    Parameters:
        - api_key (str) : the last used api_key
        - all_keys (list) : a list of all available
            api keys
    Returns:
        - the next api key in the string. If the
            last used key was the last key in the
            list, return the first key in the list.
    """
    logger.info("Switching keys...")

    idx = all_keys.index(api_key) + 1

    # If the next api key is the last one,
    # Change the index to 0 to select the first key
    if idx == len(all_keys):
        idx = 0
    return all_keys[idx]


def get_toxicity(post_text=str, api_key=str, tries=int, all_keys=list):
    """
    Query the Perspective API for toxicity scores, implement exponentially
        larger and larger wait periods based on number of retries, and
        cycle through provided keys when being rate limited.
        - Ref: https://developers.perspectiveapi.com/s/about-the-api
    Parameters:
        - post_text (str) : full post text
        - api_key (str) : the API key to utilize for the current call
        - tries (int) : how many attempts have been made already. This
            controls how long the exponential back-off function will wait
        - all_keys (list) : all possible keys to use. This still works if
            only one key is provided, but it must be placed into a list.
    Returns:
        - 'AnalyzeComment' response (dict) : a response from the
            Perspective API including only a toxicity probability
    """

    client = discovery.build(
        "commentanalyzer",
        "v1alpha1",
        developerKey=api_key,
        discoveryServiceUrl="https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1",
    )

    analyze_request = {
        "comment": {"text": post_text},
        "requestedAttributes": {"TOXICITY": {}},
    }

    try:
        # If we get a successful request, set switch to False.
        # This will break the while loop in the main script and go
        # to the next post
        response = client.comments().analyze(body=analyze_request).execute()
        switch = False

    # A server error we hit when `commentanalyzer.googleapis.com`
    # is not available
    except httplib2.error.ServerNotFoundError as e:
        logger.info(e)
        logger.info("Can't find server, waiting 15 seconds...")
        time.sleep(15)

        response = None
        tries += 1
        switch = True

        # Switch to the next API key, just in case
        api_key = switch_api_keys(api_key=api_key, all_keys=all_keys)

    # A server error we hit when the network is unreachable
    except OSError as e:
        logger.info(e)
        logger.info("Handling OS ERROR, waiting 15 seconds...")
        time.sleep(15)

        response = None
        tries += 1
        switch = True

        # Switch to the next API key, just in case
        api_key = switch_api_keys(api_key=api_key, all_keys=all_keys)

    # For other errors, we check the status code
    except Exception as e:
        # 429 = "rate limiting"
        # Employ an exponential backoff procedure
        if e.status_code == 429:
            secs_2_wait = (2**tries) + (random.uniform(0, 1))

            # We shouldn't have to wait more than two minutes
            if secs_2_wait > 120:
                secs_2_wait = 120

            logger.info(f"Waiting {secs_2_wait} seconds...")
            time.sleep(secs_2_wait)
            response = None
            tries += 1
            switch = True  # Ensures we try the same post again

            # Switch to the next API key, to minimize wait period
            api_key = switch_api_keys(api_key=api_key, all_keys=all_keys)

        # 400 = "bad request"
        # This catches queries that break because the post contains a
        # language not covered by the API
        elif (e.status_code == 400) and ("language" in e._get_reason()):
            response = "language_error"
            switch = False  # We can't fix this, so we move to the next post

        # Sometimes the language is undetectable, this handles that
        elif (e.status_code == 400) and ("language" in e.error_details):
            response = "language_error"
            switch = False  # We can't fix this, so we move to the next post

        else:
            # If none of the above, we are getting some weird error
            # wait 30 seconds and try again.
            logger.info("UNKNOWN ERROR!! Waiting for 30 seconds...")
            logger.info("~~STATUS CODE~~", e.status_code)
            logger.info("~~ERROR DETAILS~~", e.error_details)
            logger.info(e)
            response = None
            time.sleep(30)
            switch = False

            api_key = switch_api_keys(api_key=api_key, all_keys=all_keys)

    return response, switch, tries, api_key


if __name__ == "__main__":
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    log_dir = "google_toxicity"
    logger = get_logger(
        log_dir=log_dir,
        full_log_path=os.path.join(log_dir, f"get_toxicity.log"),
        also_print=True,
    )

    input_fpath = # CHANGE THIS - .PARQUET FILE OF TEXT
    out_dir = # CHANGE THIS - DIRECTORY TO OUTPUT .PARQUET FILES OF TOXICITY SCORES

    # Load API Keys

    logger.info("Loading API keys...")
    config = configparser.ConfigParser()
    config.read(os.path.join(os.path.dirname(__file__), "config.ini")) 
    api_key = config.get("PERSPECTIVE", "API_KEY")
    list_of_api_keys = [api_key] #old code rotate & use a list of keys. We only have 1 key for now

    # Example basename: text--2022-12-15.parquet
    basename = os.path.basename(input_fpath)
    output_file = os.path.join(
        os.path.join(out_dir, f"{basename}--toxicity.parquet")
    )

    logger.info(f"Loading input data file: {basename}")
    df = pd.read_parquet(input_fpath)

    logger.info(f"Requesting toxicity scores from Perspective API...")
    toxicity_data = []
    language_errors = []
    for row_dict in df.to_dict(orient="records"):
        text = row_dict["text"]

        switch = True
        tries = 1
        while switch:
            # Wait 50 milliseconds before each call
            time.sleep(0.05)

            # If this query is successful, `switch` is returned False.
            # Otherwise, it waits and returns True to try again.
            # Will wait exponentially longer after each try.
            try:
                response, switch, tries, api_key = get_toxicity(
                    post_text=text,
                    api_key=api_key,
                    tries=tries,
                    all_keys=list_of_api_keys,
                )
            except OSError as e:
                logger.info(e)
                logger.info("Handling OS ERROR, wait 10 seconds...")
                time.sleep(10)
            except Exception as e:
                logger.info("Unknown error!!")
                logger.info(e)
                logger.info("Waiting 10 seconds...")
                time.sleep(10)

        # If successfull but returns None, we must skip
        if response is None:
            continue
        # If we get a language error, save post data in the errors list
        elif response == "language_error":
            language_errors.append(row_dict)
            continue
        # Save post id and score if request successful
        else:
            response_scores = response["attributeScores"]
            toxicity_score = response_scores["TOXICITY"]["summaryScore"]["value"]
            row_dict["toxicity"] = toxicity_score
            toxicity_data.append(row_dict)

    logger.info("Converting toxicity records to dataframe...")
    toxicity_df = pd.DataFrame.from_records(toxicity_data)

    logger.info(f"Saving data frames here: {out_dir}")
    logger.info(f"Toxicity file: {output_file}")
    toxicity_df.to_parquet(os.path.join(out_dir, output_file), engine="pyarrow")

    if len(language_errors) > 0:
        language_errors_df = pd.DataFrame.from_records(language_errors)
        lang_errors_file = f"{basename}--language_errors.parquet"
        logger.info(f"Language errors file: {lang_errors_file}")
        language_errors_df.to_parquet(
            os.path.join(out_dir, lang_errors_file), engine="pyarrow"
        )

    logger.info("~~~ Script Complete ~~~")
