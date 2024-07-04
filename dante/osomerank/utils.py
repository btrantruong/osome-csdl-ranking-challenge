""" Functions for profiling, text cleaning, logging, JSON """

# Standard library imports
import configparser
import cProfile
import io
import json
import logging
import logging.handlers
import os
import pstats
import re
import shutil

from datetime import datetime
from importlib.resources import files

# External dependencies imports
import boto3
import platformdirs

# Root logger
_root_logger = None

# Configuration files
_config = None

# limit 'from .utils import *' to only these functions/variables
__all__ = ['getconfig', 'fetchfroms3', 'remove_urls', 'clean_text',
           'profileit', 'prof_to_csv', 'profile', 'save_to_json',
           'get_logger']


def getconfig(fn="config.ini"):
    """
    Load provided configuration file. The search path includes, in this order:
        - The current working directory
        - The user config directory per XDG specs
        - The site config directory per XDG specs
        - The module's location within the installed package

    We use platformdirs to follow XDG specs for user/site config directories.
    Missing files are silently ignored. If the user config directories does not
    exist, it is created for the purpose. If configuration file(s) have been
    already loaded, return previously loaded files. Finally, if no
    configuration file is found, we copy the sample bundled with the package to
    the user config dir.
    """
    global _config
    # Do not reload config if already loaded
    if _config is not None:
        return _config
    cwd_config_path = os.getcwd()
    # XXX switch to __package__ (once this is at the main package level)
    user_config_path = platformdirs.user_config_path("dante",
                                                     ensure_exists=True)
    site_config_path = platformdirs.site_config_path("dante")
    py_config_path = os.path.dirname(__file__)
    conf_search_path = [
        cwd_config_path,
        user_config_path,
        site_config_path,
        py_config_path,
    ]
    conf_search_path = [os.path.join(p, fn) for p in conf_search_path]
    _config = configparser.ConfigParser()
    found_files = _config.read(conf_search_path)
    logger = get_logger(__name__)
    if len(found_files) == 0:
        # Package has not been configured yet, copy sample ini to user conf dir
        # and retry
        sample_fn = fn + '.sample'
        sample_conf_path = str(files("dante.osomerank").joinpath(sample_fn))
        logger.warning(f"No config found! Copying {sample_conf_path} to "
                       "{user_config_path}")
        shutil.copy(sample_conf_path, os.path.join(user_config_path, fn))
        found_files = _config.read(conf_search_path)
    logger.info(f"Found configuration: {found_files}")
    return _config


def fetchfroms3(prefix, base_dir):
    """
    Fetch data from configured S3 bucket

    Parameters
    ==========
    prefix : str
        Fetches all objects with this prefix from S3 bucket

    base_dir : str
        Base path to destination dir where to copy objects

    S3 settings are obtained from configuration file
    """
    logger = get_logger(__name__)
    config = getconfig()
    region_name = config.get("S3", "S3_REGION_NAME")
    access_key = config.get("S3", "S3_ACCESS_KEY")
    access_key_secret = config.get("S3", "S3_SECRET_ACCESS_KEY")
    bucket_name = config.get("S3", "S3_BUCKET")
    logger.info(f"Fetching from s3://{bucket_name}/{prefix} region {region_name}")
    s3 = boto3.resource(service_name="s3",
                        region_name=region_name,
                        aws_access_key_id=access_key,
                        aws_secret_access_key=access_key_secret)
    bucket = s3.Bucket(bucket_name)
    for obj in bucket.objects.filter(Prefix=prefix):
        src_path = obj.key
        dest_path = os.path.join(base_dir, obj.key)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        bucket.download_file(src_path, dest_path)
        logger.info(f"Fetched: {dest_path}")


def remove_urls(text, replacement_text=""):
    # Define a regex pattern to match URLs
    url_pattern = re.compile(r"https?://\S+|www\.\S+")
    # Use the sub() method to replace URLs with the specified replacement text
    text_without_urls = url_pattern.sub(replacement_text, text)
    return text_without_urls


def clean_text(text):
    # remove mentions and URLs
    text = re.sub(r"(?:\@|https?\://)\S+", "", text)
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
    # remove unnecessary white space
    text = " ".join(re.split("\\s+", text, flags=re.UNICODE))
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
    (
        pstats
        .Stats(prof, stream=out_stream)
        .sort_stats("cumulative")
        .print_stats()
    )
    # pstats.print_stats()
    result = out_stream.getvalue()
    # chop off header lines
    result = "ncalls" + result.split("ncalls")[-1]
    lines = [",".join(line.rstrip().split(None, 5))
             for line in result.split("\n")]
    return "\n".join(lines)


def profile(func):
    # Save to .csv file
    def wrapper(*args, **kwargs):
        now = datetime.now()
        timestr = now.strftime("%m%d%Y_%H%M%S")
        # Name the data file sensibly
        datafn = func.__name__ + "_profile_%s.csv" % timestr
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


def _setup_logging(level=logging.INFO):
    """Setup root logger for the package."""
    # Get root logger and set level
    logger = logging.getLogger()
    logger.setLevel(level=level)
    logdir = platformdirs.user_log_dir(appname="dante",
                                       ensure_exists=True)
    path = os.path.join(logdir, "dante.log")
    # Configure formatter
    fmt = "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
    formatter = logging.Formatter(fmt=fmt)
    # Remove any existing handler
    for handler in logger.handlers:
        logger.removeHandler(handler)
    # Configure rotating file handler, keep 100MB logs max around
    fh = logging.handlers.RotatingFileHandler(path,
                                              maxBytes=1e7,
                                              backupCount=10)
    fh.setFormatter(formatter)
    fh.setLevel(level=level)
    logger.addHandler(fh)
    # Configure stream handler
    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    ch.setLevel(level=level)
    logger.addHandler(ch)
    logger.info(f"Logging messages to console and to {path}")
    return logger


_logger = _setup_logging()


def get_logger(name=None):
    """
    Get logger for name (pass __name__ to log messages for your own module)
    """
    return logging.getLogger(name)
