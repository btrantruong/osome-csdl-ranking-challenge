#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Jun 16 03:45:55 2024

@author: saumya (modified by Bao)
"""

__all__ = ['td_prediction', 'load_td_data']

# Standard library imports
import json
import os

# External dependencies imports
from bertopic import BERTopic
from platformdirs import user_cache_dir

# Package imports
from .utils import getconfig, fetchfroms3, get_logger

# XXX compute on the fly?
TD_MEAN = 2.66
TD_STD = 1.77
mean_topic_diversity = 0

TD_DATA = None
TD_MODEL = None


def load_td_data():
    global TD_DATA, TD_MODEL
    logger = get_logger(__name__)
    if TD_DATA is not None:
        logger.warn("Topic diversity data and model have been already loaded! "
                    "Reloading from scratch.")
    config = getconfig()
    cache_path = user_cache_dir("dante", ensure_exists=True)
    prefix = config.get("TOPIC_DIVERSITY", "topic_diversity_dir")
    cached_model_dir = os.path.join(cache_path, prefix)
    if not os.path.exists(cached_model_dir):
        logger.warning("No cached model found! Retrieving from S3.")
        fetchfroms3(prefix, cache_path)
    TD_MODEL = BERTopic.load(cached_model_dir)
    logger.info(f"Loaded BERTopic model from: {cached_model_dir}")
    json_fn = config.get("AUDIENCE_DIVERSITY", "topic_diversity_json")
    cached_json_path = os.path.join(cache_path, json_fn)
    with open(cached_json_path) as ff:
        TD_DATA = json.load(ff)
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
        audience_diversity_val (list): the audience diversity scores of these
        posts.
    """
    global TD_DATA, TD_MODEL
    if TD_DATA is None or TD_MODEL is None:
        raise RuntimeError("Topic diversity data/models have not been loaded! "
                           f"Call {__name__}.{load_td_data.__name__}() first.")
    audience_diversity_val = [default] * len(feed_posts)
    try:
        sm_texts_processed = [feed_post["text"] for feed_post in feed_posts]
        texts_processed = []
        text_index_processed = []
        for idx, text in enumerate(sm_texts_processed):
            if text != "NA":
                texts_processed.append(text)
                text_index_processed.append(idx)
        topics = TD_MODEL.transform(texts_processed)[0]
        for idx, topic in enumerate(topics):
            if int(topic) != -1:
                td_val = TD_DATA[str(topic)]
                audience_diversity_val[text_index_processed[idx]] = (
                    td_val - TD_MEAN
                ) / TD_STD
    except Exception:
        get_logger(__name__).exception("Error computing topic "
                                       "diversity scores")
        return [mean_topic_diversity] * len(feed_posts)
    for idx, ad in enumerate(audience_diversity_val):
        if ad == default:
            audience_diversity_val[idx] = mean_topic_diversity
    return audience_diversity_val


# XXX remove?
def ad_prediction_single(feed_post, platform, default=-1000):
    global TD_MODEL, TD_DATA
    audience_diversity_val = default
    try:
        sm_text = feed_post["text"]
        if sm_text != "NA":
            topic = TD_MODEL.transform([sm_text])[0][0]
            if int(topic) != -1:
                audience_diversity_val = TD_DATA[str(topic)]
    except Exception:
        get_logger(__name__).exception("Error computing topic diversity score")
        return mean_topic_diversity
    if audience_diversity_val == default:
        audience_diversity_val = mean_topic_diversity
    return audience_diversity_val
