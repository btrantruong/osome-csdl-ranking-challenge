import pickle
from sentence_transformers import SentenceTransformer
from transformers import AutoModelForSequenceClassification, AutoTokenizer, TextClassificationPipeline
import os 

# import gaussian NB model for HaR
with open(os.path.join(os.path.dirname(__file__), 'models', 'AR', 'gaussian_nb.pkl'), 'rb') as f:
    gnb = pickle.load(f)

# import linear regression model for AR
with open(os.path.join(os.path.dirname(__file__), 'models', 'AR', 'linear_regression.pkl'), 'rb') as f:
    lr = pickle.load(f)

# load the sentence-BERT model
cache_dir = "..."  # space to save the model
model_name = "multi-qa-mpnet-base-dot-v1"  # specify the model name

qa_model = SentenceTransformer(model_name_or_path = "multi-qa-mpnet-base-dot-v1", 
                               #cache_folder = cache_dir,
                               #device='cuda', # if we can use GPU
                               )

# load the toxicity model
model_path = 'unitary/toxic-bert'
tokenizer = AutoTokenizer.from_pretrained(pretrained_model_name_or_path=model_path,
                                          #cache_dir=cache_dir,
                                          )
model = AutoModelForSequenceClassification.from_pretrained(pretrained_model_name_or_path=model_path,
                                                           #cache_dir=cache_dir,
                                                           )
toxicity_model =  TextClassificationPipeline(model=model,
                                             tokenizer=tokenizer,
                                             max_length=512,
                                             truncation=True,
                                             #device=0 # if we can use GPU
                                             )


def har_prediction(feed_post, platform):
    """
    Calculates the HArmful Response (HaR) score for a given social media post.

    Parameters:
    feed_post (json object): the social media post. It should contain keys like 'text', 'expanded_url' etc.
    platform (str): the type of social media: {'twitter', 'reddit', 'facebook'}

    Returns:
    HaR score (int): The predicted HaR class for `feed_post, {0,1}
    """
    try:
        text = feed_post.get('text')

        emb = qa_model.encode(text)
        prob_of_har = gnb.predict_proba([emb])[0][1]
    except Exception as e:
        print(e)
        return 0 
    if prob_of_har > .8:
        return 1
    else:
        return 0


def ar_prediction(feed_post, platform):
    """
    Calculates the Affect Response (AR) score for a given social media post.

    Parameters:
    feed_post (json object): the social media post. It should contain keys like 'text', 'expanded_url' etc.
    platform (str): the type of social media: {'twitter', 'reddit', 'facebook'}

    Returns:
    AR score (int): The AR score for `feed_post` in (0,1)
    """
    try:
        text = feed_post.get('text')
        emb = qa_model.encode(text)
        ar_score = lr.predict([emb])[0]
    except Exception as e:
        print(e)
        return 0.5 
    return ar_score

def toxicity_score(feed_post, platform):
    mean_toxicity = 0.3

    try:
        text = feed_post.get('text')
        # model returns a list of toxic score, e.g: [{'label': 'toxic', 'score': 0.0005410030717030168}]
        results , = toxicity_model(text)
        toxicity = results['score']
    except Exception as e:
        print(e)
        return mean_toxicity 
    
    return toxicity

