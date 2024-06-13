from flask import Flask, jsonify, request, json
import os
from flask_cors import CORS
from osomerank import audience_diversity, elicited_response
from osomerank.utils import profile
import rbo
import numpy as np
from bisect import bisect
from datetime import datetime


app = Flask(__name__)
CORS(app)

# Change the file path
JSON_OUTDIR = "data/extension_data"


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


## timing

# @profile
# def toxicity_and_profile(item, platform):
#     return elicited_response.toxicity_score(item, platform)


@profile
def ad_and_profile(item, platform):
    return audience_diversity(item, platform)


@profile
def har_and_profile(item, platform):
    return elicited_response.har_prediction(item, platform)


@profile
def ar_and_profile(item, platform):
    return elicited_response.ar_prediction(item, platform)


BOUNDARIES = [0.557, 0.572, 0.581, 0.6]


def find_interval(post_list):
    return [
        {
            "id": post["id"],
            "text": post["text"],
            "interval": bisect(BOUNDARIES, post["HaR"]),
            "AR": post["AR"],
        }
        for post in post_list
    ]


@app.route("/rank", methods=["POST"])  # Allow POST requests for this endpoint
def rank_batch():
    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity

    print("** BATCH Received POST request.. Begin processing... ** ")

    print("** Received POST request.. Begin processing... ** ")
    post_data = request.get_json()  # receive the data coming
    post_items = post_data.get("items")  # get the post items array

    platform = "twitter"

    # get audience diversity score
    # ad_score = audience_diversity(item, platform)
    # assuming that order is preserved
    har_scores = elicited_response.har_prediction(post_items, platform)
    ar_scores = elicited_response.ar_prediction(post_items, platform)

    for item, har_score, ar_score in zip(post_items, har_scores, ar_scores):
        har_interval = bisect(BOUNDARIES, har_score)
        print(har_interval)
        processed_item = {
            "id": item["id"],
            "text": item["text"],
            # "audience_diversity": ad_score,
            "har_score": har_score,
            "ar_score": ar_score,
            "har_interval": har_interval,  # {0,1,2,3,4}
        }
        if har_interval == (2 | 3 | 4):  # posts that have interval 2, 3, 4: hars
            har_posts.append(processed_item)
        else:  # posts that have interval 0 or 1: non-hars
            non_har_posts.append(processed_item)

    # rank non-HaR posts by audience diversity, break tie by AR score (sentiment)
    # har_interval 0 is ranked higher than 1
    # TODO: Add batch mode to AD
    non_har_posts.sort(
        key=lambda x: (x["har_interval"], x["audience_diversity"], x["ar_score"]),
        reverse=(False, True, True),
    )
    # non_har_posts.sort(key=lambda x: x["ar_score"], reverse=True)

    # Assumption: HaR & AR works in opposite direction: high HaR - low AR
    # HaR & AD works in the same direction: high HaR - high AD
    # rank HaR posts by AR score TODO: Check correlation between HaR & AR; HaR & AD
    har_posts.sort(
        key=lambda x: (x["har_interval"], x["ar_score"]), reverse=(False, True)
    )

    # concat the two lists, prioritizing non-HaR posts
    # ranked_results = non_har_posts + har_posts + toxic_posts
    ranked_results = non_har_posts + har_posts
    ranked_ids = [content.get("id", None) for content in ranked_results]
    result = {"ranked_ids": ranked_ids}

    # # get rbo
    # rbo = calculate_rbo(post_data, ranked_ids)

    # # write the json file
    # Format the current time
    formatted_time = datetime.now().strftime("%m%d%Y_%H:%M:%S")
    rank_fpath = os.path.join(JSON_OUTDIR, f"{platform}_ranked--{formatted_time}.json")
    save_to_json(
        {
            # "rbo": rbo,
            "ranked_posts": ranked_results,
        },
        rank_fpath,
    )
    # print(
    #     f"** Rank-biased Overlap (RBO): {np.round(rbo, 3)}. Ranked json data saved to {rank_fpath} **"
    # )

    return jsonify(result)


# @app.route("/rank", methods=["POST"])  # Allow POST requests for this endpoint
def rank():
    toxic_posts = []  # these posts get removed
    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity

    print("** Received POST request.. Begin processing... ** ")
    post_data = request.get_json()  # receive the data coming
    post_items = post_data.get("items")  # get the post items array

    platform = "twitter"

    for item in post_items:
        id = item["id"]
        text = item["text"]

        # toxicity = toxicity_and_profile(
        #     item, platform
        # )  # first run toxicity detection

        # get audience diversity score
        ad_score = ad_and_profile(item, platform)
        har_score = har_and_profile(item, platform)
        ar_score = ar_and_profile(item, platform)

        processed_item = {
            "id": id,
            "text": text,
            "audience_diversity": ad_score,
            "har_score": har_score,
            "ar_score": ar_score,
            # "toxicity": toxicity,
        }
        # if toxicity > 0.8:
        #     toxic_posts.append(processed_item)
        if har_score == 1:
            har_posts.append(processed_item)
        else:
            non_har_posts.append(processed_item)

    # # rank toxic posts in ascending order of toxicity
    # toxic_posts.sort(key=lambda x: x["toxicity"], reverse=False)

    # rank non-HaR posts by audience diversity, break tie by AR score
    non_har_posts.sort(
        key=lambda x: (x["audience_diversity"], x["ar_score"]), reverse=True
    )

    # rank HaR posts by AR score
    har_posts.sort(key=lambda x: x["ar_score"], reverse=True)

    # concat the two lists, prioritizing non-HaR posts
    # ranked_results = non_har_posts + har_posts + toxic_posts
    ranked_results = non_har_posts + har_posts
    ranked_ids = [content.get("id", None) for content in ranked_results]
    result = {"ranked_ids": ranked_ids}

    # get rbo
    rbo = calculate_rbo(post_data, ranked_ids)

    # write the json file
    # Format the current time
    formatted_time = datetime.now().strftime("%m%d%Y_%H:%M:%S")
    rank_fpath = os.path.join(JSON_OUTDIR, f"{platform}_ranked--{formatted_time}.json")
    save_to_json(
        {
            "rbo": rbo,
            "ranked_posts": ranked_results,
        },
        rank_fpath,
    )
    print(
        f"** Rank-biased Overlap (RBO): {np.round(rbo, 3)}. Ranked json data saved to {rank_fpath} **"
    )

    return jsonify(result)


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


def save_to_json(post_content, fpath):
    """
    Get post content and write to a json file.
    Parameters
    -----------
    - post_content: get all the post content as it is received from platform.
    Returns
    -----------
    None
    """
    file_dir = os.path.dirname(fpath)
    if not os.path.exists(file_dir):
        os.makedirs(file_dir)

    # write the json to file.
    with open(fpath, "w") as file:
        json.dump(post_content, file)


if __name__ == "__main__":
    app.run(port=5001, debug=True)
