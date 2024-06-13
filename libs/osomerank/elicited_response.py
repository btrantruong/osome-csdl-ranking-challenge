#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue June 4 2024

@author: Ozgur (modified by Bao)
"""

from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    TextClassificationPipeline,
)
import re
import configparser
import os
from collections import defaultdict
from osomerank.utils import get_file_logger

libs_path = os.path.dirname(__file__)
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__), "config.ini"))

logger = get_file_logger(os.path.join(libs_path, config.get("ELICITED_RESPONSE", "log_dir")),
                         os.path.join(libs_path, config.get("ELICITED_RESPONSE", "training_log_file")),
                         also_print=True)

model_names = ["toxicity_trigger", "attracted_sentiment"]
platforms = ["twitter", "reddit"]


# load MODEL_PIPELINES
MODEL_PIPELINES = defaultdict()
for model_name in model_names:
    for platform in platforms:
        logger.info(f"Loading {model_name}_{platform} model..")
        model_path = os.path.join(libs_path, config.get("ELICITED_RESPONSE", f"{model_name}_{platform}"))
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
            device="cuda",  # switch to 0 when using CPU
        )
        MODEL_PIPELINES[f"{model_name}_{platform}"] = pipeline
        logger.info(f"Loaded {model_name}_{platform} model.")


def clean_text(text):

    text = re.sub(r"(?:\@|https?\://)\S+", "", text)  # remove mentions and URLs

    text = text.lower()  # lowercase the text

    remove_tokens = [
        "&gt;",
        "&gt",
        "&amp;",
        "&lt;",
        "#x200B;",
        "…",
        "!delta",
        "δ",
        "tifu",
        "cmv:",
        "cmv",
    ]

    for t in remove_tokens:  # remove unwanted tokens
        text = text.replace(t, "")

    text = " ".join(
        re.split("\s+", text, flags=re.UNICODE)
    )  # remove unnecessary white space

    text = text.strip()  # strip

    return text


def har_prediction(feed_post, platform):
    """
    Calculates the HArmful Response (HaR) score for a given social media post.

    Parameters:
    feed_post (json object): the social media post. It should contain keys like 'text', 'expanded_url' etc.
    platform (str): the type of social media: {'twitter', 'reddit', 'facebook'}

    Returns:
    HaR score (float): The predicted HaR score for a feed_post
    """
    if (platform.lower() == "twitter") | (platform.lower() == "facebook"):
        model = MODEL_PIPELINES["toxicity_trigger_twitter"]
    else:
        model = MODEL_PIPELINES["toxicity_trigger_reddit"]

    try:
        text = feed_post.get("text")  # get the post text
        text = clean_text(text)  # pre-process the post text
        score = model.predict(text)[0]["score"]  # generate the score
        return score

    except Exception as e:
        logger.info(e)
        return 0.54  # .54 is the avg score generated by the model for a test set of 250k posts


def ar_prediction(feed_post, platform):
    """
    Calculates the Affect Response (AR) score for a given social media post.

    Parameters:
    feed_post (json object): the social media post. It should contain keys like 'text', 'expanded_url' etc.
    platform (str): the type of social media: {'twitter', 'reddit', 'facebook'}

    Returns:
    AR score (float): The predicted AR score for a feed_post
    """
    if (platform.lower() == "twitter") | (platform.lower() == "facebook"):
        model = MODEL_PIPELINES["attracted_sentiment_twitter"]
    else:
        model = MODEL_PIPELINES["attracted_sentiment_reddit"]

    try:
        text = feed_post.get("text")  # get the post text
        text = clean_text(text)  # pre-process the post text
        score = model.predict(text)[0]["score"]  # generate the score
        return score

    except Exception as e:
        logger.info(e)
        return 0.5  # .5 is the avg score generated by the model for a test set of 250k posts
