#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 13 09:14:03 2024

@author: saumya
"""

from sentence_transformers import SentenceTransformer
import pandas as pd
from nltk.cluster import KMeansClusterer
import nltk
import numpy
import json

NUM_CLUSTERS = 10

model = SentenceTransformer("all-MiniLM-L6-v2")

