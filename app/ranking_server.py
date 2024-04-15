import nltk
from flask import Flask, jsonify, request
from flask_cors import CORS
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from osomerank import audience_diversity, elicited_response
from sample_data import NEW_POSTS

app = Flask(__name__)
CORS(app)

# load the toxicity model
model_path = 'unitary/toxic-bert'
tokenizer = AutoTokenizer.from_pretrained(pretrained_model_name_or_path=model_path,
                                          cache_dir=cache_dir)
model = AutoModelForSequenceClassification.from_pretrained(pretrained_model_name_or_path=model_path,
                                                           #cache_dir=cache_dir,
                                                           )
toxicity_model =  TextClassificationPipeline(model=model,
                                             tokenizer=tokenizer,
                                             max_length=512,
                                             truncation=True,
                                             #device=0 # if we can use GPU
                                             )


@app.route("/rank", methods=["POST"])  # Allow POST requests for this endpoint
def rank():

    post_data = request.json

    toxic_posts = [] # these posts get removed
    non_har_posts = [] # these posts are ok
    har_posts = [] # these posts elicit toxicity
    for item in post_data.get("items"):
        text = item.get("text")
        id = item.get("id")
        platform = item.get("platform")

        toxicity = toxicity_model(text) # first run toxicity detection

        if toxicity[0]['score']>.8: # check the toxicity score
            processed_item  = {"id": id, "text": text, "audience_diversity": ad_score, "har_score": har_score, "ar_score": ar_score}
            toxic_posts.append(processed_item)

        else:
            # get audience diversity score
            ad_score = audience_diversity(item, platform)
            har_score = elicited_response.har_prediction(item, platform)
            ar_score = elicited_response.ar_prediction(item, platform)
    
            processed_item  = {"id": id, "text": text, "audience_diversity": ad_score, "har_score": har_score, "ar_score": ar_score}
            if har_score == 1:
                har_posts.append(processed_item)
            else:
                non_har_posts.append(processed_item)

    # rank non-HaR posts by audience diversity, break tie by AR score
    non_har_posts.sort(key=lambda x: (x["audience_diversity"], x["ar_score"]), reverse=True)
    
    # rank HaR posts by AR score
    har_posts.sort(key=lambda x: x["ar_score"], reverse=True)
    
    # concat the two lists, prioritizing non-HaR posts 
    ranked_results = non_har_posts.extend(har_posts)

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
