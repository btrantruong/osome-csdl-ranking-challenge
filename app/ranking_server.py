import nltk
from flask import Flask, jsonify, request
from flask_cors import CORS
from osomerank import audience_diversity, elicited_response

app = Flask(__name__)
CORS(app)


@app.route("/rank", methods=["POST"])  # Allow POST requests for this endpoint
def rank():

    post_data = request.json

    non_har_posts = []  # these posts are ok
    har_posts = []  # these posts elicit toxicity

    for item in post_data.get("items"):
        text = item.get("text")
        id = item.get("id")
        platform = item.get("platform")

        toxicity = elicited_response.toxicity_score(
            item, platform
        )  # first run toxicity detection

        # remove extremely toxic posts
        if toxicity > 0.8:  
            pass

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

    result = {"ranked_ids": ranked_ids}

    return jsonify(result)


if __name__ == "__main__":
    app.run(port=5001, debug=True)
