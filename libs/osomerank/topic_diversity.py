#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Jun 16 03:45:55 2024

@author: saumya
"""

from bertopic import BERTopic
import re
import json
import traceback

import os
import configparser

TD_MEAN = 2.66
TD_STD = 1.77
mean_topic_diversity = 0

libs_path = os.path.dirname(__file__)
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__), "config.ini"))

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


# Filtering text: remove special characters, alphanumeric, return None if text doesn't meet some criterial like just one word or something
def process_text(text):
    text_urls_removed = remove_urls(text)
    if len(text.strip().split(" ")) <= 3:
        return "NA"
    return text_urls_removed


# Filtering text: remove special characters, alphanumeric, return None if text doesn't meet some criterial like just one word or something
def process_text_multiple(texts):
    processed_texts = []
    for text in texts:
        text_urls_removed = remove_urls(text)
        if len(text_urls_removed.strip().split(" ")) <= 3:
            processed_texts.append("NA")
        else:
            processed_texts.append(text_urls_removed)
    return processed_texts


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

        sm_texts_processed = process_text_multiple(sm_texts)
        texts_processed = []
        text_index_processed = []

        for i in range(len(sm_texts_processed)):
            if sm_texts_processed[i] != "NA":
                texts_processed.append(sm_texts_processed[i])
                text_index_processed.append(text_index[i])

        topics = BERTopic_model_loaded.transform(texts_processed)[0]

        for i in range(len(topics)):
            if int(topics[i]) != -1:
                td_val = topic_diversity[
                    str(topics[i])
                ]
                audience_diversity_val[text_index_processed[i]] = (td_val - TD_MEAN)/TD_STD

    except Exception:
        print(traceback.format_exc())
        return [mean_topic_diversity]*len(feed_posts)

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