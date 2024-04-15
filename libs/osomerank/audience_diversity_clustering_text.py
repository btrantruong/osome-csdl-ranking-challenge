#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Apr  2 13:27:00 2024

@author: saumya
"""

from sentence_transformers import SentenceTransformer
import pandas as pd
from nltk.cluster import KMeansClusterer
import nltk
import numpy
import json

NUM_CLUSTERS = 10

model = SentenceTransformer('sentence-transformers/average_word_embeddings_glove.6B.300d')

data = pd.read_csv("data/random_synthetic_text_data.csv")
data = data.drop(columns=["Unnamed: 0"])

sentences = data['text'].values.tolist()
embeddings = model.encode(sentences)

kclusterer = KMeansClusterer(
        NUM_CLUSTERS, distance=nltk.cluster.util.cosine_distance,
        repeats=1,avoid_empty_clusters=True)

assigned_clusters = kclusterer.cluster(embeddings, assign_clusters=True)

centroids = {}
for i in range(NUM_CLUSTERS):
    centroids[i] = kclusterer.means()[i].tolist()

with open('models/clustering_centroids.json','w') as outfile:
    json.dump(centroids,outfile)

distances_arr = [nltk.cluster.util.cosine_distance(embeddings[i],kclusterer.means()[assigned_clusters[i]]) for i in range(len(assigned_clusters))]
radius_dict = {}
for i in range(NUM_CLUSTERS):
    distances_all = [distances_arr[t] for t in range(len(assigned_clusters)) if assigned_clusters[t] == i]
    radius_dict[i] = max(distances_all)

with open('models/clustering_radius.json','w') as outfile:
    json.dump(radius_dict,outfile)

pid = data['pid'].values.tolist()
variance = {}
for i in range(NUM_CLUSTERS):
    variance[i] = numpy.var([pid[t] for t in range(len(assigned_clusters)) if assigned_clusters[t] == i])

with open('models/clustering_audience_diversity.json','w') as outfile:
    json.dump(variance,outfile)