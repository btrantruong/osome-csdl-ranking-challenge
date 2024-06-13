#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to train Audience Diversity model using BERTopic on Rockwell engagement data

Created on Wed May 22 15:55:15 2024

@author: saumya
"""

import pandas as pd
import numpy as np
import json
import re
from bertopic import BERTopic
import os
import configparser
from osomerank.utils import get_file_logger

libs_path = os.path.dirname(__file__)
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__), "config.ini"))

logger = get_file_logger(
    os.path.join(libs_path, config.get("AUDIENCE_DIVERSITY", "log_dir")),
    os.path.join(libs_path, config.get("AUDIENCE_DIVERSITY", "training_log_file")),
    also_print=True,
)


def remove_urls(text, replacement_text=""):
    # Define a regex pattern to match URLs
    url_pattern = re.compile(r"https?://\S+|www\.\S+")

    # Use the sub() method to replace URLs with the specified replacement text
    text_without_urls = url_pattern.sub(replacement_text, text)

    return text_without_urls


def process_text(text):
    text_urls_removed = remove_urls(text)
    if len(text.strip().split(" ")) <= 3:
        return "NA"
    return text_urls_removed


logger.info("Loading Rockwell engagement data..")
data = pd.read_csv(
    os.path.join(
        libs_path, config.get("AUDIENCE_DIVERSITY", "engagement_data_rockwell")
    )
)
if "Unnamed: 0" in data.columns:
    data = data.drop(columns=["Unnamed: 0"])
data = data.dropna().reset_index(drop=True)

logger.info("Preprocessing text..")
data["Text_processed"] = [process_text(tt) for tt in data["Text"].values.tolist()]
data = data.drop(data[data["Text_processed"] == "NA"].index).reset_index(drop=True)

partisanship_map = {
    "Very conservative": 1,
    "Somewhat conservative": 2,
    "Slightly conservative": 3,
    "Moderate; middle of the road": 4,
    "Slightly liberal": 5,
    "Somewhat liberal": 6,
    "Very liberal": 7,
}
data["partisanship_numeric"] = [
    partisanship_map[pp] for pp in data["partisanship"].values
]


logger.info("Training BERTopic model..")
sentences = data["Text_processed"].values.tolist()

topic_model = BERTopic(verbose=True)

topics, probs = topic_model.fit_transform(sentences)

logger.info("Finished training! ")
pd_topic_model = topic_model.get_document_info(sentences)

data["topic"] = pd_topic_model["Topic"].values.tolist()

topic_diversity = {}
unique_topics = data["topic"].unique()

for topic in unique_topics:
    if int(topic) == -1:
        continue
    partisanship_values = data.loc[data["topic"] == topic][
        "partisanship_numeric"
    ].values.tolist()
    topic_diversity[int(topic)] = np.var(partisanship_values)

logger.info("Saving model and topic diversity..")
with open(
    os.path.join(libs_path, config.get("AUDIENCE_DIVERSITY", "topic_diversity_json")),
    "w",
) as outfile:
    json.dump(topic_diversity, outfile)

logger.info(f"Saved topic diversity!")

embedding_model = "sentence-transformers/all-MiniLM-L6-v2"
model_outpath = os.path.join(
    libs_path, config.get("AUDIENCE_DIVERSITY", "audience_diversity_rockwell")
)
if not os.path.exists(model_outpath):
    os.makedirs(model_outpath)
topic_model.save(
    model_outpath,
    serialization="safetensors",
    save_ctfidf=True,
    save_embedding_model=embedding_model,
)

logger.info(f"Saved model to {model_outpath}")
