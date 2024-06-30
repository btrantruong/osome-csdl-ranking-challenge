import json
from osomerank.audience_diversity import ad_prediction
from osomerank.utils import save_to_json, clean_text

ranking_request = json.load(
    open(
        "debug/data/facebook_request_short.json",
        "r",
    )
)

platform = ranking_request.get("session")["platform"]
post_items = ranking_request.get("items")
# preprocess posts: clean text
post_data = [
    {"id": x["id"], "text": clean_text(x["text"]), "urls": x["embedded_urls"]}
    for x in post_items
]
print("Calculating audience diversity scores...")
ad_scores = ad_prediction(post_data, platform="twitter")
print(ad_scores)
