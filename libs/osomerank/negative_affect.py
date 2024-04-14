
import random 
def negative_affect(feed_post, platform):
    """
    Calculates the negative affect response (NAR) score for a given social media post.

    Parameters:
    feed_post (json object): the social media post. It should contain keys like 'text', 'expanded_url' etc.
    platform (str): the type of social media: {'twitter', 'reddit', 'facebook'}

    Returns:
    nar_val (int): The NAR score for `feed_post, {0,1}
    """
    nar_val = random.choice([0,1])
    return nar_val


def positive_affect(feed_post, platform):
    """
    Calculates the positive affect response (PAR) score for a given social media post.

    Parameters:
    feed_post (json object): the social media post. It should contain keys like 'text', 'expanded_url' etc.
    platform (str): the type of social media: {'twitter', 'reddit', 'facebook'}

    Returns:
    par (int): The PAR score for `feed_post, {0,1}
    """
    par_val = random.random()
    return par_val

