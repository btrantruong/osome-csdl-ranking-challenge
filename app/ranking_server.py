from flask import Flask, jsonify, request, json
import os
from flask_cors import CORS
from osomerank import audience_diversity, topic_diversity, elicited_response
import osomerank.utils as utils
import rbo
import numpy as np
from bisect import bisect
import configparser

app = Flask(__name__)
CORS(app)

# Change the file path
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__), "config.ini"))
JSON_OUTDIR = config.get("DATA", "data_path")

## HELPERS
BOUNDARIES = [0.557, 0.572, 0.581, 0.6]


def multisort(xs, specs):
    # efficient sort with multiple keys & orders https://docs.python.org/3/howto/sorting.html#sort-stability-and-complex-sorts
    # specs: list of (key, reverse) tuples. reverse=True: descending order
    for key, reverse in reversed(specs):
        xs.sort(key=lambda x: x[key], reverse=reverse)

    return xs


def calculate_rbo(post_data, ranked_hashs):
    """
    Calculate the RBO score for a payload.

    Args:
        post_data (json object): raw json payload as given by the extension (unranked)
        ranked_hashs (list of str): list of hashed id of posts, in the ranked order.
    """
    raw_hashs = [item["id"] for item in post_data["items"]]
    raw_id_map = {hash_id: idx for idx, hash_id in enumerate(raw_hashs)}
    raw_ids = list(range(len(raw_hashs)))
    ranked_ids = [raw_id_map[hash_id] for hash_id in ranked_hashs]
    return rbo.RankingSimilarity(raw_ids, ranked_ids).rbo()


@app.route("/")
def welcome():
    return """
   <h1>CHAI Prosocial ranking algorithm submission</h1>

    <p> We aim to create a “bridging” algorithm that enhances mutual understanding and trust (Ovadya & Thorburn, 2022) in social media interactions. It prioritizes posts that evoke civil discussions while appealing to an ideologically diverse audience. To this end, we rerank content based on 2 criteria: elicited response and diverse engagement. Additionally, we remove toxic posts.
    <br>

    We developed two different models for elicited response: one assessing the intensity of Affective Response (AR) to a post, such as happiness or sadness, and another assessing whether a post attracts Harmful Response (HaR), such as toxicity or offensiveness. These models are trained using the emotional content and toxicity levels of responses, predicted using state-of-the-art pre-trained language models, as variables. Note that a post can simultaneously evoke positive emotions and toxic reactions; therefore, the AR and HaR are treated as separate dimensionsin our analysis.
    <br>
    We measure the diverse engagement of a post through a metric we call "audience diversity” (AD). It estimates the range of ideological slants of the audience engaging with the content (Bhadani et al., 2022). If a post includes a URL, we assess its "source level" diversity by examining the ideological range of the domain's typical audience, which will be pre-calculated using a similar approach as described in Bhadani et al., 2022. Additionally, regardless of whether a post contains a URL, we determine the “topic level” diversity using the textual content.
    <br>
    Our algorithm first removes highly toxic posts, then reranks the rest as follows: Non-HaR posts with high AD scores are prioritized, while all HaR posts are demoted. Where there are ties, posts are ordered by their AR scores to enhance engagement. </p>

    <h2> References </h2>
    <ul>
    <li> Ovadya, Aviv, and Luke Thorburn. "Bridging-based ranking." Harvard Kennedy School Belfer Center for Science and International Affairs (2022). </li>

    <li> Bhadani, Saumya, et al. "Political audience diversity and news reliability in algorithmic ranking." Nature Human Behaviour 6.4 (2022).</li>
    </ul>

    """


@app.route("/log", methods=["POST"])  # Allow POST requests for this endpoint
def log():
    if request.method == "POST":
        payload = request.get_json()
        print("Received payload:", payload)
        return jsonify(payload)


@app.route("/rank", methods=["POST"])  # Allow POST requests for this endpoint
def rank():
    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity

    print("** BATCH Received POST request.. Begin processing... ** ")

    post_data = request.get_json("post_content").get(
        "post_content"
    )  # receive the data coming
    post_items = post_data.get("items")  # get the post items array
    platform = post_data.get("session")["platform"]  # platform which the posts received

    # get audience diversity score
    #ad_scores = audience_diversity.ad_prediction(post_items, platform)
    ad_link_scores = audience_diversity.ad_prediction(post_items, platform)
    td_scores = topic_diversity.td_prediction(post_items, platform)
    # assuming that order is preserved
    har_scores = elicited_response.har_prediction(post_items, platform)
    ar_scores = elicited_response.ar_prediction(post_items, platform)

    for item, har_score, ar_score, ad_link_score, td_score in zip(
        post_items, har_scores, ar_scores, ad_link_scores, td_scores
    ):
        har_normalized = bisect(BOUNDARIES, har_score)
        ad_score = ad_link_score
        if ad_score == -1000:
            ad_score = td_score
        processed_item = {
            "id": item["id"],
            "text": item["text"],
            "audience_diversity": ad_score,
            "har_score": har_score,
            "ar_score": ar_score,
            "har_normalized": har_normalized,  # {0,1,2,3,4}
        }
        if har_normalized == (2 | 3 | 4):  # posts that have interval 2, 3, 4: hars
            har_posts.append(processed_item)
        else:  # posts that have interval 0 or 1: non-hars
            non_har_posts.append(processed_item)

    # rank non-HaR posts by audience diversity, break tie by AR score (sentiment)
    multisort(
        non_har_posts,
        [("har_normalized", False), ("audience_diversity", True), ("ar_score", True)],
    )
    multisort(har_posts, [("har_normalized", False), ("ar_score", True)])

    # concat the two lists, prioritizing non-HaR posts
    # ranked_results = non_har_posts + har_posts
    ranked_results = non_har_posts + har_posts
    ranked_ids = [content.get("id", None) for content in ranked_results]
    result = {"ranked_ids": ranked_ids}

    # Save ranked resultswrite the json file
    rbo = calculate_rbo(post_data, ranked_ids)
    session_id = post_data["session"]
    rank_fpath = os.path.join(JSON_OUTDIR, f"{platform}_ranked__{session_id}.json")
    post_data["rbo"] = rbo
    post_data["ranked_posts"] = ranked_results
    utils.save_to_json(
        post_data,
        rank_fpath,
    )
    print(
        f"** Rank-biased Overlap (RBO): {np.round(rbo, 3)}. Ranked json data saved to {rank_fpath} **"
    )

    return jsonify(result)


if __name__ == "__main__":
    app.run(port=5001, debug=True)
