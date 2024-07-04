#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Jun 16 03:45:55 2024

@author: saumya (modified by Bao)
"""

<<<<<<< HEAD
__all__ = ["td_prediction", "load_td_data"]

# Standard library imports
import json
import os

# External dependencies imports
from bertopic import BERTopic
import numpy as np

# Package imports
from ..utils import getcachedir, getconfig, fetchfroms3, get_logger

TD_DATA = None
TD_MODEL = None


def load_td_data():
    global TD_DATA, TD_MODEL
    logger = get_logger(__name__)
    if TD_DATA is not None:
        logger.warn(
            "Topic diversity data and model have been already loaded! "
            "Reloading from scratch."
        )
    config = getconfig()
    cache_path = getcachedir()
    prefix = config.get("TOPIC_DIVERSITY", "topic_diversity_dir")
    cached_model_dir = os.path.join(cache_path, prefix)
    if not os.path.exists(cached_model_dir):
        logger.warning("No cached model found! Retrieving from S3.")
        fetchfroms3(prefix, cache_path)
    # XXX: do not calculate probabilities?
    TD_MODEL = BERTopic.load(cached_model_dir)
    logger.info(f"Loaded BERTopic model from: {cached_model_dir}")
    json_fn = config.get("AUDIENCE_DIVERSITY", "topic_diversity_json")
    cached_json_path = os.path.join(cache_path, json_fn)
    with open(cached_json_path) as ff:
        TD_DATA = json.load(ff)
    TD_MEAN = np.mean([TD_DATA[k] for k in TD_DATA])
    TD_STD = np.std([TD_DATA[k] for k in TD_DATA])
    for k in TD_DATA:
        TD_DATA[k] = (TD_DATA[k] - TD_MEAN) / TD_STD
    TD_99_quantile = np.percentile([TD_DATA[k] for k in TD_DATA], 99)
    TD_90_quantile = np.percentile([TD_DATA[k] for k in TD_DATA], 90)
    TD_75_quantile = np.percentile([TD_DATA[k] for k in TD_DATA], 75)
    TD_50_quantile = np.percentile([TD_DATA[k] for k in TD_DATA], 50)
    TD_25_quantile = np.percentile([TD_DATA[k] for k in TD_DATA], 25)
    TD_10_quantile = np.percentile([TD_DATA[k] for k in TD_DATA], 10)
    TD_1_quantile = np.percentile([TD_DATA[k] for k in TD_DATA], 1)
    for k in TD_DATA:
        if TD_DATA[k] >= TD_99_quantile:
            TD_DATA[k] = 7
        if TD_DATA[k] >= TD_90_quantile:
            TD_DATA[k] = 6
        if TD_DATA[k] >= TD_75_quantile:
            TD_DATA[k] = 5
        if TD_DATA[k] >= TD_50_quantile:
            TD_DATA[k] = 4
        if TD_DATA[k] >= TD_25_quantile:
            TD_DATA[k] = 3
        if TD_DATA[k] >= TD_10_quantile:
            TD_DATA[k] = 2
        if TD_DATA[k] >= TD_1_quantile:
            TD_DATA[k] = 1
        else:
            TD_DATA[k] = 0
    logger.info(f"Loaded topics data from: {cached_json_path}")


def td_prediction(feed_posts, platform=None, default=-1000):
    """
    Calculates the topic diversity of a list of posts as a proxy for audience
    diversity for both without urls.

    Args:
        feed_posts (list of dict): list of posts where each dict is a post with
            the keys: {"id", "text", "urls"}

        platform (str, optional): the platform of the posts.

    Returns:
        tmp (list): the audience diversity scores of these
        posts.
    """
    global TD_DATA, TD_MODEL
    if TD_DATA is None or TD_MODEL is None:
        raise RuntimeError(
            "Topic diversity data/models have not been loaded! "
            f"Call {__name__}.{load_td_data.__name__}() first."
        )
    tmp = []
    docs = []
    docs_idx = []
    logger = get_logger(__name__)
    for i, post in enumerate(feed_posts):
        logger.debug(f"Post-{i}: {post}")
        if post["text"] != "NA":
            docs.append(post["text"])
            docs_idx.append(i)
        else:
            # No text, return standardize mean
            tmp.append(0.0)  # the standardized mean
    if docs:
        # XXX create BERTopic model with calculate_probabilities=False? (Speeds
        # up things)
        topics, _ = TD_MODEL.transform(docs)
        for di, top in zip(docs_idx, topics):
            if int(top) != -1:
                # standardized diversity for that topic
                tmp[di] = TD_DATA[str(top)]
            else:
                # No topic, return standardized mean
                tmp[di] = 3
    return tmp
=======
from bertopic import BERTopic
import re
import json
import traceback
import boto3
import os
import configparser
from osomerank.utils import clean_text

TD_MEAN = 2.66
TD_STD = 1.77
mean_topic_diversity = 0

libs_path = os.path.dirname(__file__)
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__), "config.ini"))

model_dir = os.path.join(
    libs_path, config.get("TOPIC_DIVERSITY", "topic_diversity_dir")
)
# Download and load models from S3
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

    # S3 config
    s3_region_name = config.get("S3", "S3_REGION_NAME")
    s3_access_key = config.get("S3", "S3_ACCESS_KEY")
    s3_access_key_secret = config.get("S3", "S3_SECRET_ACCESS_KEY")
    s3_bucket = config.get("S3", "S3_BUCKET")

    s3 = boto3.client(
        service_name="s3",
        region_name=s3_region_name,
        aws_access_key_id=s3_access_key,
        aws_secret_access_key=s3_access_key_secret,
    )

    TD_files = [
        entry for entry in config.options("TOPIC_DIVERSITY") if "dir" not in entry
    ]
    for td_file in TD_files:
        s3.download_file(
            Filename=os.path.join(model_dir, td_file),
            Bucket=s3_bucket,
            Key=config.get("TOPIC_DIVERSITY", td_file),
        )

BERTopic_model_loaded = BERTopic.load(os.path.join(libs_path, model_dir))
# BERTopic_model_loaded = BERTopic.load()

topic_diversity = {}
with open(
    os.path.join(libs_path, config.get("AUDIENCE_DIVERSITY", "topic_diversity_json"))
) as ff:
    topic_diversity = json.load(ff)


def remove_urls(text, replacement_text=""):
    # Define a regex pattern to match URLs
    url_pattern = re.compile(r"https?://\S+|www\.\S+")

    # Use the sub() method to replace URLs with the specified replacement text
    text_without_urls = url_pattern.sub(replacement_text, text)

    return text_without_urls


def td_prediction(feed_posts, platform=None):
    """
    Calculates the topic diversity of a list of posts as a proxy for audience diversity for both without urls.
    Args:
        feed_posts (list of dict): list of posts where each dict is a post with the keys: {"id", "text", "urls"}
        platform (str, optional): the platform of the posts.

    Returns:
        audience_diversity_val (list): the audience diversity scores of these posts.
    """
    audience_diversity_val = [-1000] * len(feed_posts)

    try:
        sm_texts_processed = [feed_post["text"] for feed_post in feed_posts]
        texts_processed = []
        text_index_processed = []

        for idx, text in enumerate(sm_texts_processed):
            if text != "NA":
                texts_processed.append(text)
                text_index_processed.append(idx)

        topics = BERTopic_model_loaded.transform(texts_processed)[0]

        for idx, topic in enumerate(topics):
            if int(topic) != -1:
                td_val = topic_diversity[str(topic)]
                audience_diversity_val[text_index_processed[idx]] = (
                    td_val - TD_MEAN
                ) / TD_STD

    except Exception:
        print(traceback.format_exc())
        return [mean_topic_diversity] * len(feed_posts)

    for idx, ad in enumerate(audience_diversity_val):
        if ad == -1000:
            audience_diversity_val[idx] = mean_topic_diversity

    return audience_diversity_val


def ad_prediction_single(feed_post, platform):
    audience_diversity_val = -1000

    try:
        sm_text = feed_post["text"]
        if sm_text != "NA":
            topic = BERTopic_model_loaded.transform([sm_text])[0][0]
            if int(topic) != -1:
                audience_diversity_val = topic_diversity[str(topic)]

    except Exception as e:
        print(e)
        return mean_topic_diversity

    if audience_diversity_val == -1000:
        audience_diversity_val = mean_topic_diversity

    return audience_diversity_val
>>>>>>> 0db5997 (Converted libs to Python package (dante), convert app to submodule)
