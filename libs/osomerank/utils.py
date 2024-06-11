import logging
import os
import sys 

""" Functions for method profiling """
import cProfile, pstats, io
from datetime import datetime 
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
        # datafn = func.__name__ + "_profile_%s.csv" %timestr  # Name the data file sensibly
        datafn = func.__name__ + "_profile.csv"  # Name the data file sensibly
        prof = cProfile.Profile()
        retval = prof.runcall(func, *args, **kwargs)

        csv_line = prof_to_csv(prof)
        with open(datafn, "w+") as perf_file:
            perf_file.write(csv_line)
        return retval

    return wrapper


def get_file_logger(log_dir, full_log_path, also_print=False, tqdm=False):

    """Create logger."""

    # Create log_dir if it doesn't exist already
    try:
        os.makedirs(f"{log_dir}")
    except:
        pass

    # Create logger and set level
    logger = logging.getLogger(__name__)
    logger.setLevel(level=logging.INFO)

    # Configure file handler
    formatter = logging.Formatter(
        fmt="%(asctime)s-%(name)s-%(levelname)s-%(message)s",
        datefmt="%Y-%m-%d_%H:%M:%S",
    )
    fh = logging.FileHandler(f"{full_log_path}")
    fh.setFormatter(formatter)
    fh.setLevel(level=logging.INFO)
    logger.addHandler(fh)

    # if tqdm:
    #     logger.addHandler(TqdmLoggingHandler())
    # If also_print is true, the logger will also print the output to the
    # console in addition to sending it to the log file
    if also_print:
        ch = logging.StreamHandler(sys.stdout)
        ch.setFormatter(formatter)
        ch.setLevel(level=logging.INFO)
        logger.addHandler(ch)

    return logger

