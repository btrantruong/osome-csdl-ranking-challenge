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

s3_region_name = config.get("S3", "S3_REGION_NAME")
s3_access_key = config.get("S3", "S3_ACCESS_KEY")
s3_access_key_secret = config.get("S3", "S3_SECRET_ACCESS_KEY")
s3_bucket = config.get("S3", "S3_BUCKET")

s3 = boto3.client(
        service_name='s3',
        region_name=s3_region_name,
        aws_access_key_id=s3_access_key,
        aws_secret_access_key=s3_access_key_secret
)

s3.download_file(Filename="models/AD_rockwell/BERTopic_diversity.json", Bucket=s3_bucket, Key="models/AD_rockwell/BERTopic_diversity.json")
s3.download_file(Filename="models/AD_rockwell/ctfidf.safetensors", Bucket=s3_bucket, Key="models/AD_rockwell/ctfidf.safetensors")
s3.download_file(Filename="models/AD_rockwell/topic_embeddings.safetensors", Bucket=s3_bucket, Key="models/AD_rockwell/topic_embeddings.safetensors")
s3.download_file(Filename="models/AD_rockwell/ctfidf_config.json", Bucket=s3_bucket, Key="models/AD_rockwell/ctfidf_config.json")
s3.download_file(Filename="models/AD_rockwell/topics.json", Bucket=s3_bucket, Key="models/AD_rockwell/topics.json")

BERTopic_model_loaded = BERTopic.load(
    os.path.join(
        libs_path, config.get("AUDIENCE_DIVERSITY", "audience_diversity_BERTtopic")
    )
)
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


def td_prediction(feed_posts, sm_type):

    audience_diversity_val = [-1000] * len(feed_posts)

    try:

        sm_texts = []
        text_index = []

        for i in range(len(feed_posts)):
            if audience_diversity_val[i] == -1000:
                feed_post = feed_posts[i]
                if sm_type == "reddit":
                    if "title" in feed_post.keys() and "text" in feed_post.keys():
                        sm_texts.append(feed_post["title"] + ". " + feed_post["text"])
                        text_index.append(i)
                    elif "title" in feed_post.keys():
                        sm_texts.append(feed_post["title"])
                        text_index.append(i)
                    elif "text" in feed_post.keys():
                        sm_texts.append(feed_post["text"])
                        text_index.append(i)
                else:
                    if type(feed_post["text"]) != float:
                        sm_texts.append(feed_post["text"])
                        text_index.append(i)

        sm_texts_processed = [clean_text(text) for text in sm_texts]
        texts_processed = []
        text_index_processed = []

        for i in range(len(sm_texts_processed)):
            if sm_texts_processed[i] != "NA":
                texts_processed.append(sm_texts_processed[i])
                text_index_processed.append(text_index[i])

        topics = BERTopic_model_loaded.transform(texts_processed)[0]

        for i in range(len(topics)):
            if int(topics[i]) != -1:
                td_val = topic_diversity[str(topics[i])]
                audience_diversity_val[text_index_processed[i]] = (
                    td_val - TD_MEAN
                ) / TD_STD

    except Exception:
        print(traceback.format_exc())
        return [mean_topic_diversity] * len(feed_posts)

    for i in range(len(audience_diversity_val)):
        if audience_diversity_val[i] == -1000:
            audience_diversity_val[i] = mean_topic_diversity

    return audience_diversity_val


def ad_prediction_single(feed_post, sm_type):
    audience_diversity_val = -1000

    try:
        sm_text = ""
        if sm_type == "reddit":
            if "title" in feed_post.keys() and "text" in feed_post.keys():
                sm_text = feed_post["title"] + ". " + feed_post["text"]
            elif "title" in feed_post.keys():
                sm_text = feed_post["title"]
            else:
                sm_text = feed_post["text"]
        else:
            sm_text = feed_post["text"]
        if clean_text(sm_text) != "NA":
            sm_text = clean_text(sm_text)
            topic = BERTopic_model_loaded.transform([sm_text])[0][0]
            if int(topic) != -1:
                audience_diversity_val = topic_diversity[str(topic)]

    except Exception as e:
        print(e)
        return mean_topic_diversity

    if audience_diversity_val == -1000:
        audience_diversity_val = mean_topic_diversity

    return audience_diversity_val
