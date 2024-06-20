#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed May 22 15:55:15 2024

@author: saumya

This is the code for the worker script to retrain the BERTopic model with the ranking challenge participants' engagements and ideology.

The script first gets the existing training file from S3. It then reads the engagements of participants from postgres and the ideology
from redis and appends the textual content of the posts that the participants engaged with and their self reported ideology to the existing
training file, and then finally uploads the new training file to S3. It also undshortens the URLs present in the engagement posts and stores 
them to redis for increasing the efficiency of the audience diversity scorer. 

Lastly, it trains the BERTopic model from scratch using the updated training file and uploads the models to S3.

To successfully run this file, please specify the S3 and postgres params in the config.ini file which is present in the same foleder as this script.
please note that I am not reading the S3 and postgres URIs using the environment variables. 

However, I am reading the redis URL using the envionment variable REDIS_URL.
"""

import pandas as pd
import numpy as np
import json
import re
import os
import boto3
import io
import psycopg2
import redis
import requests
from bertopic import BERTopic

import configparser

negative_engagements = ['comment','downvote','angry']

libs_path = os.path.dirname(__file__)
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__), "config_worker.ini"))

s3_region_name = config.get("S3", "S3_REGION_NAME")
s3_access_key = config.get("S3", "S3_ACCESS_KEY")
s3_access_key_secret = config.get("S3", "S3_SECRET_ACCESS_KEY")
s3_bucket = config.get("S3", "S3_BUCKET")

db_host = config.get("POSTGRES", "host")
db_port = config.get("POSTGRES", "port")
db_name = config.get("POSTGRES", "database")
db_user = config.get("POSTGRES", "user")
db_password = config.get("POSTGRES", "password")

REDIS_DB = f"{os.getenv('REDIS_URL', 'redis://localhost:6379')}/0"

def redis_client():
    global memoized_redis_client
    if memoized_redis_client is None:
        memoized_redis_client = redis.Redis.from_url(REDIS_DB)
    return memoized_redis_client

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

def get_text_from_db():
    conn = psycopg2.connect (
            host = db_host,
            dbname = db_name,
            user = db_user,
            password = db_password,
            port = db_port,
        )
    cur =  conn.cursor()
    script = """ select session_user_id,type,post_blob from posts """
    cur.execute(script)
    res = []
    res_urls = []
    for element in cur.fetchall():
        user_id = element[0]
        typee = element[1]
        post_blob = element[2]
        post = json.loads(post_blob)
        full_text = ''
        if 'title' in post.keys():
            if post['title']:
                full_text = full_text + post['title']
        if 'text' in post.keys():
            if post['text']:
                full_text = full_text + post['text']
        if typee not in negative_engagements:
            res.append((user_id,full_text))
        if 'embedded_urls' in post.keys():
            for url in post['embedded_urls']:
                res_urls.append(url)
    return res,res_urls

def fill_cache_with_url(urls_db,redis_client_obj):
    for uu in urls_db:
        try:
            r = requests.head(uu, allow_redirects=True,timeout=10)
            redis_client_obj[uu] = r.url
        except:
            continue

def main():

    s3 = boto3.client(
        service_name='s3',
        region_name=s3_region_name,
        aws_access_key_id=s3_access_key,
        aws_secret_access_key=s3_access_key_secret
    )

    s3_resource = boto3.resource(
        service_name='s3',
        region_name=s3_region_name,
        aws_access_key_id=s3_access_key,
        aws_secret_access_key=s3_access_key_secret
    )

    redis_client_obj = redis.Redis.from_url(REDIS_DB)

    response = s3.get_object(Bucket=s3_bucket, Key='topic_modelling_training_data.csv')

    data = pd.read_csv(io.BytesIO(response['Body'].read()))

    data_db,urls_db = get_text_from_db()

    if urls_db:
        fill_cache_with_url(urls_db, redis_client_obj)

    text_with_partisanship_exp = []

    if data_db:
        for dd in data_db:
            if redis_client_obj.get(dd[0]):
                text_with_partisanship_exp.append({"Text":dd[1],"partisanship":redis_client_obj.get(dd[0])})

    for ele in text_with_partisanship_exp:
        data.loc[len(data)] = ele

    data = data.drop_duplicates().reset_index(drop=True)
    #data = data.append(dict(zip(data.columns, text_with_partisanship_exp)), ignore_index=True)
    csv_buffer = io.StringIO()
    data.to_csv(csv_buffer)
    s3_resource.Object(s3_bucket,'topic_modelling_training_data.csv').put(Body=csv_buffer.getvalue())

    data = data.dropna().reset_index(drop=True)

    data['Text_processed'] = [process_text(tt) for tt in data['Text'].values.tolist()]
    data = data.drop(data[data['Text_processed'] == 'NA'].index).reset_index(drop=True)

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
        partisanship_values = data.loc[data['topic'] == topic]['partisanship'].values.tolist()
        topic_diversity[int(topic)] = np.var(partisanship_values)

    s3object = s3_resource.Object(s3_bucket, 'BERTopic_diversity.json')
    s3object.put(
        Body=(bytes(json.dumps(topic_diversity).encode('UTF-8')))
    )

    embedding_model = "sentence-transformers/all-MiniLM-L6-v2"
    topic_model.save("models/", serialization="safetensors", save_ctfidf=True, save_embedding_model=embedding_model)

    s3.upload_file(Filename="models/ctfidf.safetensors", Bucket=s3_bucket, Key="ctfidf.safetensors")
    s3.upload_file(Filename="models/topic_embeddings.safetensors", Bucket=s3_bucket, Key="topic_embeddings.safetensors")
    s3.upload_file(Filename="models/ctfidf_config.json", Bucket=s3_bucket, Key="ctfidf_config.json")
    s3.upload_file(Filename="models/topics.json", Bucket=s3_bucket, Key="topics.json")

if __name__ == '__main__':
    main()