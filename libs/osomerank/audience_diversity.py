#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 13 16:06:26 2024

@author: Saumya, modified by Bao

Functions to calculate the audience diversity of a single or a list of posts. The model is trained on the audience diversity of the URLs in the NewsGuard dataset.
Inputs: 
    - 
"""

from bertopic import BERTopic
import pandas as pd
import re
import requests
import json
import traceback
from osomerank.unshorten_URLs import unshorten_main
import numpy as np
import os
import configparser

libs_path = os.path.dirname(__file__)
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__), "config.ini"))

# Need to remove domains whih are platform corref from NewsGuard data
pd_audience_diversity_URLs = pd.read_csv(
    os.path.join(libs_path, config.get("AUDIENCE_DIVERSITY", "audience_diversity_file"))
)
pd_audience_diversity_URLs = pd_audience_diversity_URLs.loc[
    pd_audience_diversity_URLs["n_visitors"] >= 10
]
audience_diversity_domains = (
    pd_audience_diversity_URLs["private_domain"].unique().tolist()
)

BERTopic_model_loaded = BERTopic.load(
    os.path.join(
        libs_path, config.get("AUDIENCE_DIVERSITY", "audience_diversity_rockwell")
    )
)
# BERTopic_model_loaded = BERTopic.load()

topic_diversity = {}
with open(
    os.path.join(libs_path, config.get("AUDIENCE_DIVERSITY", "topic_diversity_json"))
) as ff:
    topic_diversity = json.load(ff)

mean_topic_diversity = 0.17


def URL_from_text(myString):
    if not re.search("(?P<url>https?://[^\s]+)", myString):
        return "NA"
    return re.search("(?P<url>https?://[^\s]+)", myString).group("url")


def process_URL(url):
    try:
        r = requests.head(url, allow_redirects=True, timeout=10)
        return r.url
    except Exception:
        return url


def process_URL_multiple(urls):
    res = []
    for url in urls:
        try:
            r = requests.head(url, allow_redirects=True, timeout=10)
            res.append(r.url)
        except Exception:
            res.append(url)
    return res


def remove_urls(text, replacement_text=""):
    # Define a regex pattern to match URLs
    url_pattern = re.compile(r"https?://\S+|www\.\S+")

    # Use the sub() method to replace URLs with the specified replacement text
    text_without_urls = url_pattern.sub(replacement_text, text)

    return text_without_urls


def process_text(text):
    # Filtering text: remove special characters, alphanumeric, return None if text doesn't meet some criterial like just one word or something
    text_urls_removed = remove_urls(text)
    if len(text.strip().split(" ")) <= 3:
        return "NA"
    return text_urls_removed


def get_reddit_text(post):
    if "title" in post.keys() and "text" in post.keys():
        text = post["title"] + ". " + post["text"]
    elif "title" in post.keys():
        text = post["title"]
    elif "text" in post.keys():
        text = post["text"]
    return text


def audience_diversity_multiple(feed_posts, platform):
    """
    Calculates the Audience Diversity (AD) and Topic Diversity (TD) scores for social media timeline.

    Parameters:
    feed_posts (list of json objects): the timeline
    platform (str): the type of social media: {'twitter', 'reddit', 'facebook'}

    Returns:
    AD/TD scores (list of float): The predicted AD (if post contains URLs) or TD (if not) scores for a list of posts
    """

    ## Preprocess posts

    urls_available = []
    urls_index = []

    sm_texts = []
    text_index = []

    audience_diversity_val = np.empty(len(feed_posts))
    audience_diversity_val.fill(-1000)

    # keep track of index of post with/without URLs
    for i, post in enumerate(feed_posts):
        # Finding URLs is straightforward for twitter
        if platform == "twitter":
            if post["embedded_urls"]:
                for urll in post["embedded_urls"]:
                    urls_index.append(i)
                    urls_available.append(urll)
        else:
            if "text" in post.keys() and type(post["text"]) != float:
                # finding URLs for other platforms
                if URL_from_text(post["text"]) != "NA":
                    urls_index.append(i)
                    urls_available.append(URL_from_text(post["text"]))
                # posts without URLs:
                else:
                    if platform == "reddit":
                        sm_texts.append(get_reddit_text(post))
                    else:
                        sm_texts.append(post["text"])
                    text_index.append(i)

    ## Predict AD/TD scores
    # posts with URLs: get AD
    # first, unshorten URLs

    if urls_available:
        urls_available_unshortened = unshorten_main(urls_available)
        # urls_available_unshortened = process_URL_multiple(urls_available)
    else:
        urls_available_unshortened = []

    # fill in AD scores, preserving index
    ad_scores = []  # ad score index = urls_index

    for url_available in urls_available_unshortened:
        domain = ".".join(url_available.split("/")[2].split(".")[-2:])
        if "twitter" in domain:
            continue
        if domain in audience_diversity_domains:
            ad_score = pd_audience_diversity_URLs.loc[
                pd_audience_diversity_URLs["private_domain"] == domain
            ]["visitor_var"].values[0]
            ad_scores.append(ad_score)

    # posts without URLs: get TD
    # first, clean text
    texts_processed = []
    text_index_processed = []
    for i, text in enumerate(sm_texts):
        clean_text = process_text(text)
        if clean_text != "NA":
            texts_processed.append(clean_text)
            text_index_processed.append(text_index[i])

    topics = BERTopic_model_loaded.transform(texts_processed)[0]

    td_scores = []
    for i in range(len(topics)):
        if int(topics[i]) != -1:
            td_score = topic_diversity[str(topics[i])]
        else:
            td_score = mean_topic_diversity
        td_scores.append(td_score)

    audience_diversity_val[urls_index] = ad_scores
    audience_diversity_val[text_index_processed] = td_scores
    return audience_diversity_val


def audience_diversity(feed_post, sm_type):
    url_available = ""

    audience_diversity_val = -1000

    try:
        if sm_type == "twitter":
            if feed_post["expanded_url"]:
                url_available = feed_post["expanded_url"]

        else:
            if URL_from_text(feed_post["text"]) != "NA":
                url_available = URL_from_text(feed_post["text"])

        if url_available:
            # url_available = process_URL(url_available)
            domain = ".".join(url_available.split("/")[2].split(".")[-2:])
            if domain in audience_diversity_domains:
                audience_diversity_val = pd_audience_diversity_URLs.loc[
                    pd_audience_diversity_URLs["private_domain"] == domain
                ]["visitor_var"].values[0]

        if audience_diversity_val == -1000:
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
            if process_text(sm_text) != "NA":
                sm_text = process_text(sm_text)
                topic = BERTopic_model_loaded.transform([sm_text])[0][0]
                if int(topic) != -1:
                    audience_diversity_val = topic_diversity[str(topic)]
    except Exception as e:
        print(e)
        return mean_topic_diversity

    if audience_diversity_val == -1000:
        audience_diversity_val = mean_topic_diversity

    return audience_diversity_val
