import nltk
from flask import Flask, jsonify, request
from flask_cors import CORS
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from osomerank import audience_diversity, negative_affect, positive_affect
from sample_data import NEW_POSTS

nltk.download("vader_lexicon")

app = Flask(__name__)
CORS(app)
analyzer = SentimentIntensityAnalyzer()


@app.route("/rank", methods=["POST"])  # Allow POST requests for this endpoint
def rank():

    post_data = request.json

    non_nar_posts = [] # these posts are ok
    nar_posts = [] # these posts elicit negative affect
    for item in post_data.get("items"):
        text = item.get("text")
        id = item.get("id")
        platform = item.get("platform")
        # get audience diversity score
        ad_score = audience_diversity(item, platform)
        nar_score = negative_affect(item, platform)
        par_score = positive_affect(item, platform)

        processed_item  = {"id": id, "text": text, "audience_diversity": ad_score, "negative_affect": nar_score, "positive_affect": par_score}
        if nar_score == 1:
            nar_posts.append(processed_item)
        else:
            non_nar_posts.append(processed_item)

    # rank non-NAR posts by audience diversity, break tie by PAR
    non_nar_posts.sort(key=lambda x: (x["audience_diversity"], x["positive_affect"]), reverse=True)
    
    # rank NAR posts by positive affect
    nar_posts.sort(key=lambda x: x["positive_affect"], reverse=True)
    
    # concat the two lists, prioritizing non-NAR posts 
    ranked_results = non_nar_posts.extend(nar_posts)

    ranked_ids = [content.get("id", None) for content in ranked_results]

    result = {
        "ranked_ids": ranked_ids
    }

    return jsonify(result)

# ORGANIZER EXAMPLE CODE 
# def analyze_sentiment():
#     post_data = request.json
#     ranked_results = []

#     for item in post_data.get("items"):
#         text = item.get("text")
#         id = item.get("id")
#         scores = analyzer.polarity_scores(text)
#         sentiment = (
#             "positive"
#             if scores["compound"] > 0
#             else "negative" if scores["compound"] < 0 else "neutral"
#         )
#         ranked_results.append(
#             {"id": id, "text": text, "sentiment": sentiment, "scores": scores}
#         )

#     ranked_results.sort(key=lambda x: x["scores"]["compound"], reverse=True)
#     ranked_ids = [content.get("id", None) for content in ranked_results]

#     # Add a new post (not part of the candidate set) to the top of the result
#     new_post = NEW_POSTS[0]
#     ranked_ids.insert(0, new_post["id"])

#     result = {
#         "ranked_ids": ranked_ids,
#         "new_items": [
#             {
#                 "id": new_post["id"],
#                 "url": new_post["url"],
#             }
#         ],
#     }

#     return jsonify(result)


if __name__ == "__main__":
    app.run(port=5001, debug=True)
