import nltk
from flask import Flask, jsonify, request, json
import os
from flask_cors import CORS
from osomerank import audience_diversity, elicited_response

app = Flask(__name__)
CORS(app)

# Change the file path
JSON_OUTDIR = "extension_data"


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
    toxic_posts = []  # these posts get removed
    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity
    # print("Received payload:", request.get_json())
    post_data = request.get_json("post_content").get(
        "post_content"
    )  # receive the data coming
    post_items = post_data.get("items")  # get the post items array
    post_sessions = post_data["session"]  # get the sessions
    platform = post_data.get("session")["platform"]  # platform which the posts received

    # write the json file
    session_id = post_sessions["current_time"]
    unranked_fpath = os.path.join(JSON_OUTDIR, f"{platform}_raw__{session_id}.json")
    save_to_json(post_data, unranked_fpath)

    for item in post_items:
        id = item["id"]
        text = item["text"]

        toxicity = elicited_response.toxicity_score(
            item, platform
        )  # first run toxicity detection

        if toxicity > 0.8:  # check the toxicity score
            processed_item = {
                "id": id,
                "text": text,
                "audience_diversity": ad_score,
                "har_score": har_score,
                "ar_score": ar_score,
            }
            toxic_posts.append(processed_item)

        else:
            # get audience diversity score
            ad_score = audience_diversity(item, platform)
            har_score = elicited_response.har_prediction(item, platform)
            ar_score = elicited_response.ar_prediction(item, platform)

            processed_item = {
                "id": id,
                "text": text,
                "audience_diversity": ad_score,
                "har_score": har_score,
                "ar_score": ar_score,
            }
            if har_score == 1:
                har_posts.append(processed_item)
            else:
                non_har_posts.append(processed_item)

    # rank non-HaR posts by audience diversity, break tie by AR score
    non_har_posts.sort(
        key=lambda x: (x["audience_diversity"], x["ar_score"]), reverse=True
    )

    # rank HaR posts by AR score
    har_posts.sort(key=lambda x: x["ar_score"], reverse=True)

    # concat the two lists, prioritizing non-HaR posts
    ranked_results = non_har_posts + har_posts
    ranked_ids = [content.get("id", None) for content in ranked_results]
    result = {"ranked_post_ids": ranked_ids}

    # write the json file
    rank_fpath = os.path.join(JSON_OUTDIR, f"{platform}_ranked__{session_id}.json")
    save_to_json(result, rank_fpath)

    return jsonify(result)


def get_today():
    from datetime import datetime

    # Get current date and time
    now = datetime.now()

    # Format date and time
    formatted_time = now.strftime("%m%d%Y_%H%M%S")

    return formatted_time


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
