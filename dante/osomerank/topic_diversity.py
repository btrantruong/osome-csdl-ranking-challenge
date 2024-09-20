#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Jun 16 03:45:55 2024

@author: saumya (modified by Bao and Giovanni)
"""

__all__ = ["td_prediction", "load_td_data", "TD_STD_MEAN"]

# Standard library imports
import json
import os
import configparser

# External dependencies imports
from bertopic import BERTopic
import numpy as np

# Package imports
from ..utils import getcachedir, getconfig, fetchfroms3, get_logger

TD_DATA = None
TD_MODEL = None
TD_STD_MEAN = 3

logger = get_logger(__name__)


def load_td_data():
    global TD_DATA, TD_MODEL
    if TD_DATA is not None:
        logger.warning(
            "Topic diversity data and model have been already loaded! "
            "Reloading from scratch."
        )
    # Attempt to load the BERTopic model

    config = getconfig()
    cache_path = getcachedir()
    prefix = config.get("TOPIC_DIVERSITY", "topic_diversity_dir", fallback=None)
    cached_model_dir = os.path.join(cache_path, prefix)
    if not os.path.exists(cached_model_dir):
        logger.warning("No cached model found! Retrieving from S3.")
        fetchfroms3(prefix, cache_path)
    try:
        # XXX: do not calculate probabilities?
        TD_MODEL = BERTopic.load(cached_model_dir)
        logger.info(f"Loaded BERTopic model from: {cached_model_dir}")

        json_fn = config.get(
            "AUDIENCE_DIVERSITY", "topic_diversity_json", fallback=None
        )

    except Exception as e:
        logger.error(
            f"Unexpected error while loading BERTopic model in {__name__}.{load_td_data.__name__}(): {e}"
        )

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
        # XXX: B: This should be elif, right?
        elif TD_DATA[k] >= TD_90_quantile:
            TD_DATA[k] = 6
        elif TD_DATA[k] >= TD_75_quantile:
            TD_DATA[k] = 5
        elif TD_DATA[k] >= TD_50_quantile:
            TD_DATA[k] = 4
        elif TD_DATA[k] >= TD_25_quantile:
            TD_DATA[k] = 3
        elif TD_DATA[k] >= TD_10_quantile:
            TD_DATA[k] = 2
        elif TD_DATA[k] >= TD_1_quantile:
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
        logger.warning(
            "Topic diversity data/models have not been loaded! "
            f"Call {__name__}.{load_td_data.__name__}() first."
        )
        # Return the same TD_STD_MEAN for all posts if one of the ingredients for the prediction is missing for some reason
        return [TD_STD_MEAN] * len(feed_posts)

    tmp = []
    docs = []
    docs_idx = []
    logger = get_logger(__name__)
    for i, post in enumerate(feed_posts):
        logger.debug(f"Post-{i}: {post}")
        # Initialize with the standardized mean
        tmp.append(TD_STD_MEAN)
        if post["text"] != "NA":
            docs.append(post["text"])
            docs_idx.append(i)
    if docs:
        # XXX create BERTopic model with calculate_probabilities=False? (Speeds
        # up things)
        topics, _ = TD_MODEL.transform(docs)
        for di, top in zip(docs_idx, topics):
            if int(top) != -1:
                # standardized diversity for that topic
                tmp[di] = TD_DATA[str(top)]
    return tmp
