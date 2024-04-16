#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 13 16:06:26 2024

@author: saumya
"""

from bertopic import BERTopic
import pandas as pd
import re
import requests
import json

import os

audience_diversity_file = os.path.join(os.path.dirname(__file__), 'data', 'audience_diversity_2022-2023_visitor_level.csv')
pd_audience_diversity_URLs = pd.read_csv(audience_diversity_file)#Need to remove domains whih are platform corref from NewsGuard data
pd_audience_diversity_URLs = pd_audience_diversity_URLs.loc[pd_audience_diversity_URLs['n_visitors'] >= 10]
audience_diversity_domains = pd_audience_diversity_URLs['private_domain'].unique().tolist()

BERTopic_model_loaded = BERTopic.load(os.path.join(os.path.dirname(__file__), 'models', 'AD'))

topic_diversity = {}
with open(os.path.join(os.path.dirname(__file__), 'models', 'AD', 'BERTopic_diversity.json')) as ff:
    topic_diversity = json.load(ff)
    
mean_topic_diversity = 0.17

def URL_from_text(myString):
    if not re.search("(?P<url>https?://[^\s]+)", myString):
        return "NA"
    return re.search("(?P<url>https?://[^\s]+)", myString).group("url")

def process_URL(url):
    try:
        r = requests.head(url, allow_redirects=True,timeout=10)
        return r.url
    except Exception:
        return url

def remove_urls(text, replacement_text=""):
    # Define a regex pattern to match URLs
    url_pattern = re.compile(r'https?://\S+|www\.\S+')
 
    # Use the sub() method to replace URLs with the specified replacement text
    text_without_urls = url_pattern.sub(replacement_text, text)
 
    return text_without_urls

#Filtering text: remove special characters, alphanumeric, return None if text doesn't meet some criterial like just one word or something
def process_text(text):
    text_urls_removed = remove_urls(text)
    if len(text.strip().split(" ")) <= 3:
        return "NA"
    return text_urls_removed

def audience_diversity(feed_post,sm_type):
    url_available = ''
    
    audience_diversity_val = -1000
    
    try:
        if sm_type == 'twitter':
            if feed_post["expanded_url"]:
                url_available = feed_post["expanded_url"]
        
        else:
            if URL_from_text(feed_post["text"]) != "NA":
                url_available = URL_from_text(feed_post["text"])
        
        if url_available:
            url_available = process_URL(url_available)
            domain = ".".join(url_available.split("/")[2].split(".")[-2:])
            if domain in audience_diversity_domains:
                audience_diversity_val = pd_audience_diversity_URLs.loc[pd_audience_diversity_URLs['private_domain'] == domain]['visitor_var'].values[0]
        
        if audience_diversity_val == -1000:
            sm_text = ''
            if sm_type == 'reddit':
                if 'title' in feed_post.keys() and 'text' in feed_post.keys():
                    sm_text = feed_post['title'] + ". " + feed_post["text"]
                elif 'title' in feed_post.keys():
                    sm_text = feed_post['title']
                else:
                    sm_text = feed_post['text']
            else:
                sm_text = feed_post['text']
            if process_text(sm_text) != "NA":
                sm_text = process_text(sm_text)
                topic = BERTopic_model_loaded.transform([sm_text])[0][0]
                if int(topic) != -1:
                    audience_diversity_val = topic_diversity[int(topic)]
    except Exception as e:
        print(e)
        return mean_topic_diversity
    
    if audience_diversity_val == -1000:
        audience_diversity_val = mean_topic_diversity
    
    return audience_diversity_val