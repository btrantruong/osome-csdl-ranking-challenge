#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 13 16:06:26 2024

@author: Saumya, modified by Bao

Functions to calculate the audience diversity of a single or a list of posts. The model is trained on the audience diversity of the URLs in the NewsGuard dataset.
Inputs: 
    - 
"""

import pandas as pd
import re
import requests
import traceback
import boto3
import io
from osomerank.unshorten_URLs_redis import unshorten_main

import os
import configparser

AD_MEAN = 4.86
AD_STD = 1.64

platform_urls = [
    "twitter.com",
    "x.com",
    "youtube.com",
    "youtu.be",
    "pubmed.ncbi.nlm.nih.gov",
    "ncbi.nlm.nih.gov",
    "tumblr.com",
    "wikipedia.org",
    "reddit.com",
    "facebook.com",
    "medium.com",
    "pbs.twimg",
    "amazon.com",
    "ebay.com",
    "etsy.com",
    "flickr.com",
    "google.com",
    "yahoo.com",
    "imgur.com",
    "instagram.com",
    "tiktok.com",
    "yelp.com",
    "linkedin.com",
    "bing.com",
    "discord.com",
    "twitch.tv",
    "quora.com",
    "duckduckgo.com",
    # "chatgpt.com",
    # "openai.com",
]

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

response = s3.get_object(Bucket=s3_bucket, Key='audience_diversity_2022-2023_visitor_level.csv')

# Need to remove domains whih are platform corref from NewsGuard data
#pd_audience_diversity_URLs = pd.read_csv(
#    os.path.join(libs_path, config.get("AUDIENCE_DIVERSITY", "audience_diversity_file"))
#)

pd_audience_diversity_URLs = pd.read_csv(io.BytesIO(response['Body'].read()))

pd_audience_diversity_URLs = pd_audience_diversity_URLs.loc[
    pd_audience_diversity_URLs["n_visitors"] >= 10
]
audience_diversity_domains = (
    pd_audience_diversity_URLs["private_domain"].unique().tolist()
)


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


def ad_prediction(feed_posts, sm_type):
    urls_available = []
    urls_index = []

    audience_diversity_val = [-1000] * len(feed_posts)

    try:
        if sm_type == "twitter":
            for i in range(len(feed_posts)):
                feed_post = feed_posts[i]
                if feed_post["embedded_urls"]:
                    for urll in feed_post["embedded_urls"]:
                        if not any(
                            [platform_url in urll for platform_url in platform_urls]
                        ):
                            urls_index.append(i)
                            urls_available.append(urll)

        else:
            for i in range(len(feed_posts)):
                feed_post = feed_posts[i]
                if "text" in feed_post.keys():
                    if type(feed_post["text"]) != float:
                        url_from_text = URL_from_text(feed_post["text"])
                        if url_from_text != "NA":
                            if not any(
                                [
                                    platform_url in url_from_text
                                    for platform_url in platform_urls
                                ]
                            ):
                                urls_index.append(i)
                                urls_available.append(url_from_text)

        if urls_available:
            urls_available_unshortened = unshorten_main(urls_available)
            # urls_available_unshortened = process_URL_multiple(urls_available)
        else:
            urls_available_unshortened = []

        for i in range(len(urls_available_unshortened)):
            url_available = urls_available_unshortened[i]
            domain = ".".join(url_available.split("/")[2].split(".")[-2:])
            if domain in audience_diversity_domains:
                if not any([platform_url in domain for platform_url in platform_urls]):
                    ad_val = pd_audience_diversity_URLs.loc[
                        pd_audience_diversity_URLs["private_domain"] == domain
                    ]["visitor_var"].values[0]
                    audience_diversity_val[urls_index[i]] = (ad_val - AD_MEAN) / AD_STD

        return audience_diversity_val

    except Exception:
        print(traceback.format_exc())
        return audience_diversity_val


def ad_prediction_single(feed_post, sm_type):
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

        return audience_diversity_val

    except Exception as e:
        print(e)
        return audience_diversity_val
