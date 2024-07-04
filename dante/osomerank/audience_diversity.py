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

__all__ = ["ad_prediction", "load_ad_data", "AD_AVG_SCORE"]

# standard library imports
import os
import re
import json

from urllib.parse import urlsplit

# external dependencies imports
import pandas as pd
import numpy as np

from unshorten_fast import unshorten

# Package imports
from ..utils import getcachedir, getconfig, get_logger, fetchfroms3


AD_AVG_SCORE = 0  # default value. This is an average audience diversity

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
    cache_path = getcachedir()
    fn = config.get("AUDIENCE_DIVERSITY", "audience_diversity_file")
    path = os.path.join(cache_path, fn)
    COLS = ["n_visitors", "private_domain", "visitor_var"]
    if not os.path.exists(path):
        logger.warning("No cached data found! Retrieving from S3.")
        prefix = os.path.dirname(fn)
        fetchfroms3(prefix, cache_path)
    _DF = pd.read_csv(path, usecols=COLS)
    logger.info(f"Loaded: {path}")
    # TODO: Need to remove domains whih are platform corref from NewsGuard data
    _DF = _DF.query("n_visitors >= 10")
    _DF.set_index("private_domain", inplace=True)
    _ad_mean = _DF["visitor_var"].mean()
    _ad_std = _DF["visitor_var"].std()
    _DF["visitor_var"] = (_DF["visitor_var"] - _ad_mean) / _ad_std
    _ad_99_quantile = np.percentile(_DF['visitor_var'].values, 99)
    _ad_90_quantile = np.percentile(_DF['visitor_var'].values, 90)
    _ad_75_quantile = np.percentile(_DF['visitor_var'].values, 75)
    _ad_50_quantile = np.percentile(_DF['visitor_var'].values, 50)
    _ad_25_quantile = np.percentile(_DF['visitor_var'].values, 25)
    _ad_10_quantile = np.percentile(_DF['visitor_var'].values, 10)
    _ad_1_quantile = np.percentile(_DF['visitor_var'].values, 1)
    visitor_var_quantile = []
    for varr in _DF["visitor_var"].values.tolist():
        if varr >= _ad_99_quantile:
            visitor_var_quantile.append(7)
        elif varr >= _ad_90_quantile:
            visitor_var_quantile.append(6)
        elif varr >= _ad_75_quantile:
            visitor_var_quantile.append(5)
        elif varr >= _ad_50_quantile:
            visitor_var_quantile.append(4)
        elif varr >= _ad_25_quantile:
            visitor_var_quantile.append(3)
        elif varr >= _ad_10_quantile:
            visitor_var_quantile.append(2)
        elif varr >= _ad_1_quantile:
            visitor_var_quantile.append(1)
        else:
            visitor_var_quantile.append(0)
    _DF["visitor_var"] = visitor_var_quantile
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
    audience_diversity_val = []
    logger = get_logger(__name__)
    for idx, feed_post in enumerate(feed_posts):
        audience_diversity_val.append(default)
        logger.debug(f"Post-{idx}: {feed_post}")
        for urll in feed_post["urls"]:
            # Not a platform
            if re.search(_PLATFORM_PAT, urll) is None:
                logger.info(f"Got URL : {urll}")
                urls_index.append(idx)
                urls_available.append(urll)
    if urls_available:
        # XXX need redis connection string here
        urls_available_unshortened = unshorten(*urls_available,
                                               cache_redis=False)
    else:
        urls_available_unshortened = []
    log_url = []
    for idx, url_available in enumerate(urls_available):
        domain = urlsplit(url_available).netloc
        domain_unshorten = urlsplit(url_available).netloc
        found_domain = False
        if ((m := re.search(_PAT, domain)) is not None) and (
            re.search(_PLATFORM_PAT, urll) is None
        ):
            matched_domain = m.group()
            audience_diversity_val[urls_index[idx]] = _DF.loc[matched_domain][
                "visitor_var"
            ]
            found_domain = True
        if ((m := re.search(_PAT, domain_unshorten)) is not None) and (
            re.search(_PLATFORM_PAT, urll) is None
        ):
            matched_domain_unshorten = m.group()
            found_domain_unshorten = True
        else:
            matched_domain_unshorten = None
            found_domain_unshorten = False
        log_url.append({
            'url': url_available,
            'url_unshorten': urls_available_unshortened[idx],
            'domain': domain,
            'domain_unshorten': domain_unshorten,
            'found_domain': found_domain,
            'found_domain_unshorten': found_domain_unshorten,
            'matched_domain_unshorten': matched_domain_unshorten
        })
    with open('url_analysis.json', 'w') as fin:
        json.dump({'data': log_url}, fin)
    return audience_diversity_val
