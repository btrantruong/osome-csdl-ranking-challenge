#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Jun 16 03:45:55 2024

@author: saumya (modified by Bao)
"""

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
