import re


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


BOUNDARIES = [0.557, 0.572, 0.581, 0.6]


def multisort(xs, specs):
    # efficient sort with multiple keys & orders https://docs.python.org/3/howto/sorting.html#sort-stability-and-complex-sorts
    # specs: list of (key, reverse) tuples. reverse=True: descending order
    for key, reverse in reversed(specs):
        xs.sort(key=lambda x: x[key], reverse=reverse)

    return xs
