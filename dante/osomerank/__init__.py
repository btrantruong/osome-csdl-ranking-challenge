from ..utils import get_logger

logger = get_logger(__name__)  # noqa

from .audience_diversity import *  # noqa: F401

logger.info(f"Imported {audience_diversity.__file__}")  # noqa

from .topic_diversity import *  # noqa: F401

logger.info(f"Imported {topic_diversity.__file__}")  # noqa

from .elicited_response import *  # noqa: F401

logger.info(f"Imported {elicited_response.__file__}")  # noqa


def load_all():
    load_ad_data()  # noqa
    load_td_data()  # noqa
    load_er_models()  # noqa
    logger.info("Completed loading all model artifacts.")
