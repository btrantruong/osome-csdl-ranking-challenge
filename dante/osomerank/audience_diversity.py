#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 13 16:06:26 2024

@author: Saumya, modified by Bao and Giovanni

Functions to calculate the audience diversity of a single or a list of posts.
The model is trained on the audience diversity of the URLs in the NewsGuard
dataset.

Inputs:
    - ???
"""

__all__ = ['ad_prediction', 'load_ad_data']

# standard library imports
import io
import os
import re

from urllib.parse import urlsplit

# external dependencies imports
import pandas as pd

from unshorten_fast import unshorten

# Package imports
from .utils import getconfig, get_logger, gets3

platform_urls = [
    "amazon.com",
    "bing.com",
    # "chatgpt.com",
    "discord.com",
    "duckduckgo.com",
    "ebay.com",
    "etsy.com",
    "facebook.com",
    "flickr.com",
    "google.com",
    "imgur.com",
    "instagram.com",
    "linkedin.com",
    "medium.com",
    "ncbi.nlm.nih.gov",
    # "openai.com",
    "pbs.twimg.com",
    "pubmed.ncbi.nlm.nih.gov",
    "quora.com",
    "reddit.com",
    "tiktok.com",
    "tumblr.com",
    "twitch.tv",
    "twitter.com",
    "wikipedia.org",
    "x.com",
    "yahoo.com",
    "yelp.com",
    "youtu.be",
    "youtube.com",
]


def _list_to_pattern(*args):
    return re.compile("|".join([d + "$" for d in args]))


_DF = None  # data frame
_PAT = None  # compiled regexp
_PLATFORM_PAT = _list_to_pattern(*platform_urls)


def load_ad_data():
    """
    Download and load models from S3
    """
    global _DF, _PAT, _PLATFORM_PAT
    logger = get_logger(__name__)
    if _DF is not None:
        logger.warn("Audience diversity data have been already loaded! "
                    "Reloading from scratch.")
    else:
        logger.info("Loading audience diversity data.")
    config = getconfig()
    libs_path = os.path.dirname(__file__)
    fn = config.get("AUDIENCE_DIVERSITY", "audience_diversity_file")
    ad_model_path = os.path.join(libs_path, fn)
    COLS = ['n_visitors', 'private_domain', 'visitor_var']
    if not os.path.exists(ad_model_path):
        s3 = gets3()
        s3_bucket = config.get("S3", "S3_BUCKET")
        response = s3.get_object(Filename=ad_model_path,
                                 Bucket=s3_bucket, Key=fn)
        _DF = pd.read_csv(io.BytesIO(response["Body"].read()), usecols=COLS)
    else:
        # TODO: Need to remove domains whih are platform corref from NewsGuard
        # data
        _DF = pd.read_csv(ad_model_path, usecols=COLS)
    _DF = _DF.query("n_visitors >= 10")
    _DF.set_index("private_domain", inplace=True)
    _ad_mean = _DF['visitor_var'].mean()
    _ad_std = _DF['visitor_var'].std()
    _DF['visitor_var'] = (_DF['visitor_var'] - _ad_mean) / _ad_std
    _PAT = _list_to_pattern(*_DF.index)


def ad_prediction(feed_posts, platform=None, default=-1000):
    """
    Calculates the audience diversity of a list of posts.

    Args:
        feed_posts (list of dict): list of posts where each dict is a post with
            the keys: {"id", "text", "urls"}

        platform (str): platform type: {"twitter", "facebook", "reddit"}

        default (int): default AD value to return for domains without a
            diversity score

    Returns:
        audience_diversity_val (list): the audience diversity scores of these
        posts.
    """
    global _DF, _PAT, _PLATFORM_PAT
    if _DF is None or _PAT is None:
        raise RuntimeError("Audience diversity data have not been loaded! "
                           f"Call {__name__}.{load_ad_data.__name__}() first.")
    urls_available = []
    urls_index = []
    audience_diversity_val = [default] * len(feed_posts)
    try:
        for idx, feed_post in enumerate(feed_posts):
            for urll in feed_post["urls"]:
                # Not a platform
                if re.search(_PLATFORM_PAT, urll) is None:
                    urls_index.append(idx)
                    urls_available.append(urll)
        if urls_available:
            urls_available_unshortened = unshorten(*urls_available,
                                                   cache_redis=True)
        else:
            urls_available_unshortened = []
        for idx, url_available in enumerate(urls_available_unshortened):
            domain = urlsplit(url_available).netloc
            if ((m := re.search(_PAT, domain)) is not None) \
                    and (re.search(_PLATFORM_PAT, urll) is None):
                matched_domain = m.group()
                audience_diversity_val[urls_index[idx]] = \
                    _DF.loc[matched_domain]['visitor_var']
        return audience_diversity_val
    # XXX remove?
    except Exception:
        get_logger(__name__).exception("Error computing audience "
                                       "diversity score")
        return audience_diversity_val
