#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 13 15:27:50 2024

@author: saumya
"""

import pandas as pd
import numpy as np
import json
from bertopic import BERTopic

data = pd.read_csv("data/political_kaggle_tweets.csv")
if 'Unnamed: 0' in data.columns:
    data = data.drop(columns=["Unnamed: 0"])

partisanship_map = {'right':1,'left':2}
data['partisanship_numeric'] = [partisanship_map[pp] for pp in data['partisanship'].values]

sentences = data['text'].values.tolist()

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