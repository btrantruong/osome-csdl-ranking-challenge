from flask import Flask, jsonify, request, json
import os
from flask_cors import CORS
from ranking_challenge.request import RankingRequest
from ranking_challenge.response import RankingResponse
import random

# from osomerank import audience_diversity, topic_diversity, elicited_response
# import osomerank.utils as utils
# import rbo
# import numpy as np
# from bisect import bisect
# import configparser

app = Flask(__name__)
CORS(app)


# Straw-man fake hypothesis for why this ranker example is worthwhile:
# Paying too much attention to popular things or people makes a user sad.
# So let's identify the popular named entities in the user's feeds and
# down-rank anything with text that contains them. Then maybe they
# will be less sad.
@app.post("/rank")
def rank(ranking_request: RankingRequest) -> RankingResponse:
    ranked_results = []

    for item in ranking_request.items:
        # score = -1 if any(ne in item.text for ne in top_entities) else 1
        score = random.randint(0, 100)
        ranked_results.append({"id": item.id, "score": score})
        print({"id": item.id, "score": score})

    ranked_results.sort(key=lambda x: x["score"], reverse=True)

    ranked_ids = [content["id"] for content in ranked_results]

    result = {
        "ranked_ids": ranked_ids,
    }

    return RankingResponse(**result)
