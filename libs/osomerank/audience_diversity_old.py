#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Apr  3 10:34:34 2024

@author: saumya
"""

from sentence_transformers import SentenceTransformer
import pandas as pd
import re
import requests
import nltk
import numpy as np
import json

audience_diversity_file = 'data/audience_diversity_2022-2023_visitor_level.csv'
pd_audience_diversity_URLs = pd.read_csv(audience_diversity_file)#Need to remove domains whih are platform corref from NewsGuard data
pd_audience_diversity_URLs = pd_audience_diversity_URLs.loc[pd_audience_diversity_URLs['n_visitors'] >= 10]
audience_diversity_domains = pd_audience_diversity_URLs['private_domain'].unique().tolist()

model = SentenceTransformer('sentence-transformers/average_word_embeddings_glove.6B.300d')

centroids = {}
radius = {}
audience_diversity_text = {}

with open('models/clustering_centroids.json') as ff:
    centroids = json.load(ff)

with open('models/clustering_radius.json') as ff:
    radius = json.load(ff)

with open('models/clustering_audience_diversity.json') as ff:
    audience_diversity_text = json.load(ff)

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

#Filtering text: remove special characters, alphanumeric, return None if text doesn't meet some criterial like just one word or something
def process_text(text):
    return text

def audience_diversity(feed_post,sm_type):
    url_available = ''
    
    audience_diversity_val = -1000
    
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
        if process_text(sm_text):
            sm_text = process_text(sm_text)
            embeddings = model.encode(sm_text)
            min_distance = 10000
            selected_cluster = -1
            for cluster in centroids.keys():
                centroid_numpy = np.array(centroids[cluster])
                distance = nltk.cluster.util.cosine_distance(embeddings,centroid_numpy)
                if distance < min_distance:
                    min_distance = distance
                    selected_cluster = cluster
            if min_distance < radius[selected_cluster]:
                audience_diversity_val = audience_diversity_text[selected_cluster]
    
    return audience_diversity_val

if __name__ == "__main__":
    sample_post_twitter = {}
    with open('sample_posts/sample_post_twitter.json') as ff:
        sample_post_twitter = json.load(ff)
    print("Audience Diversity for Twitter : ")
    print(audience_diversity(sample_post_twitter, "twitter"))
    
    sample_post_facebook = {}
    with open('sample_posts/sample_post_facebook.json') as ff:
        sample_post_facebook = json.load(ff)
    print("Audience Diversity for Facebook : ")
    print(audience_diversity(sample_post_facebook, "facebook"))
    
    sample_post_reddit = {}
    with open('sample_posts/sample_post_reddit.json') as ff:
        sample_post_reddit = json.load(ff)
    print("Audience Diversity for Reddit : ")
    print(audience_diversity(sample_post_reddit, "reddit"))