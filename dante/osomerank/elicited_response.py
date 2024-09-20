#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue June 4 2024

@author: Ozgur (modified by Bao, Giovanni)
"""

__all__ = [
    "har_prediction",
    "ar_prediction",
    "load_er_models",
    "ER_AVG_SCORES"
]

# Standard library imports
import os
from collections import defaultdict
import torch 
# External dependencies imports
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    TextClassificationPipeline,
)

# Package imports
from ..utils import getcachedir, getconfig, get_logger, fetchfroms3

config = getconfig()

MODELS = defaultdict()
TOKENIZERS = defaultdict()

# The avg score generated by the model for test sets
ER_AVG_SCORES = {'reddit':{'AR':-0.318, 'HAR':0.162},
            'twitter':{'AR':0.504, 'HAR':0.144}}

logger = get_logger(__name__)


def load_er_models():
    global MODELS
    global TOKENIZERS
    logger = get_logger(__name__)
    if MODELS and TOKENIZERS:  # non-empty dict
        logger.warning("Models have been already loaded! Reloading from scratch.")
    model_names = ["toxicity_trigger", "attracted_sentiment"]
    platforms = ["twitter", "reddit"]
    cache_path = getcachedir()

    try:
        prefix = config.get("ELICITED_RESPONSE", "elicited_response_dir")
        er_model_dir = os.path.join(cache_path, prefix)
        if not os.path.exists(er_model_dir) or not os.listdir(er_model_dir):
            logger.warning("No cached model found! Retrieving from S3.")
            fetchfroms3(prefix, cache_path)
        # load MODEL_PIPELINES
        for model_name in model_names:
            for platform in platforms:
                mod_prefix = config.get("ELICITED_RESPONSE",
                                        f"{model_name}_{platform}")
                model_path = os.path.join(cache_path, mod_prefix)
                tokenizer = AutoTokenizer.from_pretrained(
                    pretrained_model_name_or_path=model_path,
                    truncation=True,
                    max_length=512,
                    device='cuda'
                )
                model = AutoModelForSequenceClassification.from_pretrained(
                    pretrained_model_name_or_path=model_path,
                    num_labels=1,
                    ignore_mismatched_sizes=True,
                    output_attentions=True,
                    max_length=512,
                    device_map = 'cuda',
                )

                MODELS[f"{model_name}_{platform}"] = model
                TOKENIZERS[f"{model_name}_{platform}"] = tokenizer
                logger.info(f"Loaded {model_name}_{platform} model.")
    except Exception as e:
        logger.error(f"Failed to load all elicited_response models: {e}")
        raise

def predict(texts, tokenizer, model, initial_batch_size=32, uninf_indices={0, 1, 2, 3, 4, 6, 17, 27, 35, 113, 116}):
    scores = []
    keywords = []
    batch_size = initial_batch_size
    
    model.eval()
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)

    idx = 0
    while idx < len(texts):
        current_batch_size = min(batch_size, len(texts) - idx)
        batch_texts = texts[idx:idx + current_batch_size]

        try:
            with torch.no_grad():
                inputs = tokenizer(
                    batch_texts,
                    return_tensors='pt',
                    max_length=512,
                    truncation=True,
                    padding=True
                ).to(device)

                outputs = model(**inputs, output_attentions=True)
                last_layer_attention = outputs.attentions[-1]
                avg_attention = last_layer_attention.mean(dim=1)
                cls_attention = avg_attention[:, 0, :]

                for i in range(len(batch_texts)):
                    temp = []
                    input_ids = inputs['input_ids'][i]
                    attention_weights = cls_attention[i]
                    length = input_ids.shape[0]

                    # Determine 'k', number of keywords to extract
                    if length > 1:
                        if length >= 10:
                            k = 10
                        elif 5 <= length < 10:
                            k = 5
                        elif 3 < length <= 5:
                            k = 3
                        else:
                            k = 1

                        values, indices = attention_weights.topk(k)

                        for idx_token in indices:
                            token_id = input_ids[idx_token].item()
                            if token_id not in uninf_indices:
                                token = tokenizer.convert_ids_to_tokens(token_id)
                                temp.append(token)
                    else:
                        pass
            
                    # Get the logit (score) for the current input
                    logit = outputs.logits[i].item()
                    scores.append(logit)
                    keywords.append(temp)

            idx += current_batch_size  # Move to next batch

        except RuntimeError as e:
            if 'out of memory' in str(e):
                #print(f"Out of memory at batch size {current_batch_size}, reducing batch size.")
                torch.cuda.empty_cache()
                batch_size = max(1, batch_size // 2)  # Reduce batch size
                if batch_size == 1 and current_batch_size == 1:
                    raise e  # Cannot reduce batch size further
            else:
                raise e

    return scores, keywords


def har_prediction(texts, platform):
    """
    Calculates the HArmful Response (HaR) score for a given social media post.

    Parameters:
        texts (list of str): texts from social media posts.

        platform (str): the type of social media: {'twitter', 'reddit',
        'facebook'}

    Returns:
        HaR score (float): The predicted HaR score for a feed_post
    """
    default_har = [ER_AVG_SCORES[platform]['HAR']] * len(texts), []
    global MODELS
    global TOKENIZERS
    if (not MODELS) | (not TOKENIZERS):  # empty dict
        logger.warning(
            "Models have not been loaded! "
            f"Call {__name__}.{load_er_models.__name__}() "
            "first."
        )
        # Return the same AD_AVG_SCORE for all posts if one of the ingredients for the prediction is missing for some reason
        return default_har
    if (platform == "twitter") | (platform == "facebook"):
        model = MODELS["toxicity_trigger_twitter"]
        tokenizer = TOKENIZERS["toxicity_trigger_twitter"]
    else:
        model = MODELS["toxicity_trigger_reddit"]
        tokenizer = TOKENIZERS["toxicity_trigger_reddit"]
    if not isinstance(texts, list):
        # convert iterator to list
        texts = list(texts)
    try:
        # generate the score
        scores, keywords = predict(texts, tokenizer, model)
        return scores, keywords
    except Exception as e:
        logger.warning(f"Failed to generate HAR scores. Returning ER_AVG_SCORES['{platform}']['HAR']: {e}")
        return default_har


def ar_prediction(texts, platform):
    """
    Calculates the Affect Response (AR) score for a given social media post.

    Parameters:
        texts (list of str): texts from social media posts.

        platform (str): the type of social media: {'twitter', 'reddit',
        'facebook'}

    Returns:
        AR score (float): The predicted AR score for a feed_post
    """
    default_ar = [ER_AVG_SCORES[platform]['AR']] * len(texts), []
    global MODELS
    global TOKENIZERS
    if (not MODELS) | (not TOKENIZERS):  # empty dict
        logger.warning(
            "Elicited Response models have not been loaded! "
            f"Call {__name__}.{load_er_models.__name__}() "
            "first."
        )
        # Return the same AD_AVG_SCORE for all posts if one of the ingredients for the prediction is missing for some reason
        return default_ar

    if (platform == "twitter") | (platform == "facebook"):
        model = MODELS["attracted_sentiment_twitter"]
        tokenizer = TOKENIZERS["attracted_sentiment_twitter"]
    else:
        model = MODELS["attracted_sentiment_reddit"]
        tokenizer = TOKENIZERS["attracted_sentiment_reddit"]

    if not isinstance(texts, list):
        # convert iterator to list
        texts = list(texts)
    try:
        # generate the score
        scores, keywords = predict(texts, tokenizer, model)
        return scores, keywords
    except Exception as e:
        logger.warning(
            f"Failed to generate AR scores. Returning default ER_AVG_SCORES['{platform}']['AR']: {e}"
        )
        return default_ar