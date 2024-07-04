""" Functions for profiling, text cleaning, logging, JSON """

import configparser
import cProfile
import io
import json
import logging
import os
import pstats
import re
import sys

from datetime import datetime

import boto3

_logger = None

# limit 'from .utils import *' to only these functions/variables
__all__ = [
    'getconfig',
    'gets3', 
    'remove_urls', 
    'clean_text', 
    'profileit', 
    'prof_to_csv', 
    'profile', 
    'save_to_json', 
    'get_logger']


def getconfig():
    # XXX use platformdirs
    config = configparser.ConfigParser()
    config.read(os.path.join(os.path.dirname(__file__), "config.ini"))
    return config


def gets3(resource=False):
    """
    Get S3 Bucket

    Parameters
    ==========
    config : configparser.ConfigParser
        The configuration object for S3

    return : bool
        Whether to return a low-level service client (default) or a resource
        service client (pass resource=True)
    """
    config = getconfig()
    s3_region_name = config.get("S3", "S3_REGION_NAME")
    s3_access_key = config.get("S3", "S3_ACCESS_KEY")
    s3_access_key_secret = config.get("S3", "S3_SECRET_ACCESS_KEY")
    s3_bucket = config.get("S3", "S3_BUCKET")
    if resource:
        s3 = boto3.resource(service_name="s3", 
                            region_name=s3_region_name, 
                            aws_access_key_id=s3_access_key, 
                            aws_secret_access_key=s3_access_key_secret)
    else:
        s3 = boto3.client(service_name="s3",
                          region_name=s3_region_name,
                          aws_access_key_id=s3_access_key,
                          aws_secret_access_key=s3_access_key_secret)
    return s3


def remove_urls(text, replacement_text=""):
    # Define a regex pattern to match URLs
    url_pattern = re.compile(r"https?://\S+|www\.\S+")
    # Use the sub() method to replace URLs with the specified replacement text
    text_without_urls = url_pattern.sub(replacement_text, text)
    return text_without_urls


def clean_text(text):
    text = re.sub(r"(?:\@|https?\://)\S+", "", text)  # remove mentions and URLs
    text = text.lower()  # lowercase the text
    remove_tokens = [
        "&gt;",
        "&gt",
        "&amp;",
        "&lt;",
        "#x200B;",
        "…",
        "!delta",
        "δ",
        "tifu",
        "cmv:",
        "cmv",
    ]
    for t in remove_tokens:  # remove unwanted tokens
        text = text.replace(t, "")
    text = " ".join(
        re.split("\s+", text, flags=re.UNICODE)
    )  # remove unnecessary white space
    text = text.strip()  # strip
    # return None if text is too short
    if len(text.strip().split(" ")) <= 3:
        return "NA"
    return text


# Adapted from https://stackoverflow.com/a/53619707
def profileit(func):
    def wrapper(*args, **kwargs):
        datafn = func.__name__ + ".profile"  # Name the data file sensibly
        prof = cProfile.Profile()
        retval = prof.runcall(func, *args, **kwargs)
        s = io.StringIO()
        sortby = "cumulative"
        ps = pstats.Stats(prof, stream=s).sort_stats(sortby)
        ps.print_stats()
        with open(datafn, "w") as perf_file:
            perf_file.write(s.getvalue())
        return retval
    return wrapper


# Code from https://gist.github.com/ralfstx/a173a7e4c37afa105a66f371a09aa83e
def prof_to_csv(prof: cProfile.Profile):
    out_stream = io.StringIO()
    pstats.Stats(prof, stream=out_stream).sort_stats("cumulative").print_stats()
    # pstats.print_stats()
    result = out_stream.getvalue()
    # chop off header lines
    result = "ncalls" + result.split("ncalls")[-1]
    lines = [",".join(line.rstrip().split(None, 5)) for line in result.split("\n")]
    return "\n".join(lines)


def profile(func):
    # Save to .csv file
    def wrapper(*args, **kwargs):
        now = datetime.now()
        timestr = now.strftime("%m%d%Y_%H%M%S")
        datafn = func.__name__ + "_profile_%s.csv" % timestr  # Name the data file sensibly
        prof = cProfile.Profile()
        retval = prof.runcall(func, *args, **kwargs)
        csv_line = prof_to_csv(prof)
        with open(datafn, "w+") as perf_file:
            perf_file.write(csv_line)
        return retval
    return wrapper


def save_to_json(post_content, fpath):
    """
    Get post content and write to a json file.

    Parameters
    ----------
    - post_content: get all the post content as it is received from platform.

    Returns
    -------
    None
    """
    file_dir = os.path.dirname(fpath)
    if not os.path.exists(file_dir):
        os.makedirs(file_dir)
    # write the json to file.
    with open(fpath, "w") as file:
        json.dump(post_content, file)


def _get_file_logger(path, also_print=False, level=logging.INFO):
    """Create logger."""
    # Create log_dir if it doesn't exist already
    dirpath = os.dirname(path)
    if not os.exists(dirpath):
        os.makedirs(dirpath)
    # Create logger and set level
    logger = logging.getLogger(__name__)
    logger.setLevel(level=level)
    # Configure file handler
    formatter = logging.Formatter(fmt="%(asctime)s:%(levelname)s:%(message)s")
    fh = logging.FileHandler(path)
    fh.setFormatter(formatter)
    fh.setLevel(level=level)
    logger.addHandler(fh)
    if also_print:
        ch = logging.StreamHandler(sys.stdout)
        ch.setFormatter(formatter)
        ch.setLevel(level=level)
        logger.addHandler(ch)
    return logger


def get_logger():
    global _logger
    # XXX use platformdirs instead of module's own path
    libs_path = os.path.dirname(__file__)
    formatted_time = datetime.now().strftime("%m%d%Y_%H:%M:%S")
    # XXX use rotating logger instead of timestamped filename
    path = os.path.join(libs_path,
                        config.get("LOGGING", "log_dir"),
                        f"osomerank__{formatted_time}.log"),
    if _logger is not None:
        _logger = _get_file_logger(path, also_print=True)
    return _logger

