#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed May 22 15:55:15 2024

@author: saumya
"""

import pandas as pd
import numpy as np
import json
import re
from bertopic import BERTopic

def remove_urls(text, replacement_text=""):
    # Define a regex pattern to match URLs
    url_pattern = re.compile(r'https?://\S+|www\.\S+')
    
    # Use the sub() method to replace URLs with the specified replacement text
    text_without_urls = url_pattern.sub(replacement_text, text)
    
    return text_without_urls

def process_text(text):
    text_urls_removed = remove_urls(text)
    if len(text.strip().split(" ")) <= 3:
        return "NA"
    return text_urls_removed

data = pd.read_csv("data/rockwell_engagement_data_with_partisanship_just_text.csv")
if 'Unnamed: 0' in data.columns:
    data = data.drop(columns=["Unnamed: 0"])
data = data.dropna().reset_index(drop=True)

data['Text_processed'] = [process_text(tt) for tt in data['Text'].values.tolist()]
data = data.drop(data[data['Text_processed'] == 'NA'].index).reset_index(drop=True)

partisanship_map = {'Very conservative':1,
                    'Somewhat conservative':2,
                    'Slightly conservative':3,
                    'Moderate; middle of the road':4,
                    'Slightly liberal':5,
                    'Somewhat liberal':6,
                    'Very liberal':7}
data['partisanship_numeric'] = [partisanship_map[pp] for pp in data['partisanship'].values]

sentences = data['Text_processed'].values.tolist()

topic_model = BERTopic(verbose=True)

topics, probs = topic_model.fit_transform(sentences)

pd_topic_model = topic_model.get_document_info(sentences)

data['topic'] = pd_topic_model['Topic'].values.tolist()

topic_diversity = {}
unique_topics = data['topic'].unique()

for topic in unique_topics:
    if int(topic) == -1:
        continue
    partisanship_values = data.loc[data['topic'] == topic]['partisanship_numeric'].values.tolist()
    topic_diversity[int(topic)] = np.var(partisanship_values)

with open('models/BERTopic_diversity.json','w') as outfile:
    json.dump(topic_diversity,outfile)

embedding_model = "sentence-transformers/all-MiniLM-L6-v2"
topic_model.save("models/", serialization="safetensors", save_ctfidf=True, save_embedding_model=embedding_model)