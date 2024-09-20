#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue June 4 2024

@author: Ozgur (modified by Bao, Giovanni)
"""

__all__ = [
    "har_prediction",
    "ar_prediction",
    "load_er_models",
    "AR_AVG_SCORE",
    "HAR_AVG_SCORE",
]

# Standard library imports
import os
import configparser
from collections import defaultdict

# External dependencies imports
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    TextClassificationPipeline,
)

# Package imports
from ..utils import getcachedir, getconfig, get_logger, fetchfroms3


MODEL_PIPELINES = defaultdict()

# The avg score generated by the model for a test set of 250k posts
AR_AVG_SCORE = 0.5

# The avg score generated by the model for a test set of 250k posts
HAR_AVG_SCORE = 0.54

logger = get_logger(__name__)


def load_er_models():
    global MODEL_PIPELINES
    if MODEL_PIPELINES:  # non-empty dict
        logger.warning("Models have been already loaded! Reloading from scratch.")
    model_names = ["toxicity_trigger", "attracted_sentiment"]
    platforms = ["twitter", "reddit"]
    cache_path = getcachedir()
    config = getconfig()

    prefix = config.get("ELICITED_RESPONSE", "elicited_response_dir", fallback=None)
    er_model_dir = os.path.join(cache_path, prefix)
    if not os.path.exists(er_model_dir) or not os.listdir(er_model_dir):
        logger.warning("No cached model found! Retrieving from S3.")
        fetchfroms3(prefix, cache_path)

    # load MODEL_PIPELINES
    for model_name in model_names:
        for platform in platforms:
            mod_prefix = config.get(
                "ELICITED_RESPONSE", f"{model_name}_{platform}", fallback=None
            )
            if not mod_prefix:
                continue
            model_path = os.path.join(cache_path, mod_prefix)
            try:
                tokenizer = AutoTokenizer.from_pretrained(
                    pretrained_model_name_or_path=model_path
                )
                model = AutoModelForSequenceClassification.from_pretrained(
                    pretrained_model_name_or_path=model_path,
                    num_labels=1,
                    ignore_mismatched_sizes=True,
                )
                pipeline = TextClassificationPipeline(
                    model=model,
                    tokenizer=tokenizer,
                    max_length=512,
                    truncation=True,
                    batch_size=8,
                    # top_k=None,
                    # device="cuda",  # uncomment if GPU is available
                )
                MODEL_PIPELINES[f"{model_name}_{platform}"] = pipeline
                logger.info(f"Loaded {model_name}_{platform} model.")
            except OSError as e:
                logger.error(f"Failed to load {model_name}_{platform} model: {e}")
            except Exception as e:
                logger.error(
                    f"Unexpected error while loading {model_name}_{platform} model: {e}"
                )

    if not MODEL_PIPELINES:
        logger.error("No models were loaded successfully.")
        raise RuntimeError("Failed to load any elicited_response models.")


def har_prediction(texts, platform):
    """
    Calculates the HArmful Response (HaR) score for a given social media post.

    Parameters:
        texts (list of str): texts from social media posts.

        platform (str): the type of social media: {'twitter', 'reddit',
        'facebook'}

    Returns:
        HaR score (float): The predicted HaR score for a feed_post
    """
    global MODEL_PIPELINES
    if not MODEL_PIPELINES:  # empty dict
        logger.warning(
            "Models have not been loaded! "
            f"Call {__name__}.{load_er_models.__name__}() "
            "first."
        )
        # Return the same AD_AVG_SCORE for all posts if one of the ingredients for the prediction is missing for some reason
        return [HAR_AVG_SCORE] * len(texts)

    if (platform.lower() == "twitter") | (platform.lower() == "facebook"):
        model = MODEL_PIPELINES["toxicity_trigger_twitter"]
    else:
        model = MODEL_PIPELINES["toxicity_trigger_reddit"]
    if not isinstance(texts, list):
        # convert iterator to list
        texts = list(texts)
    try:
        # generate the score
        scores = [res["score"] for res in model.predict(texts)]
        return scores
    except Exception as e:
        logger.warning(f"Failed to generate HAR scores. Returning HAR_AVG_SCORE: {e}")
        return [HAR_AVG_SCORE] * len(texts)


def ar_prediction(texts, platform):
    """
    Calculates the Affect Response (AR) score for a given social media post.

    Parameters:
        texts (list of str): texts from social media posts.

        platform (str): the type of social media: {'twitter', 'reddit',
        'facebook'}

    Returns:
        AR score (float): The predicted AR score for a feed_post
    """
    global MODEL_PIPELINES
    if not MODEL_PIPELINES:  # empty dict
        logger.warning(
            "Elicited Response models have not been loaded! "
            f"Call {__name__}.{load_er_models.__name__}() "
            "first."
        )
        return [AR_AVG_SCORE] * len(texts)

    if (platform.lower() == "twitter") | (platform.lower() == "facebook"):
        model = MODEL_PIPELINES["attracted_sentiment_twitter"]
    else:
        model = MODEL_PIPELINES["attracted_sentiment_reddit"]
    if not isinstance(texts, list):
        # convert iterator to list
        texts = list(texts)
    try:
        # generate the scores
        scores = [res["score"] for res in model.predict(texts)]
        return scores
    except Exception as e:
        logger.warning(
            f"Failed to generate AR scores. Returning default AR_AVG_SCORE: {e}"
        )
        return [AR_AVG_SCORE] * len(texts)
