BOUNDARIES = [0.557, 0.572, 0.581, 0.6]


def multisort(xs, specs):
    # efficient sort with multiple keys & orders https://docs.python.org/3/howto/sorting.html#sort-stability-and-complex-sorts
    # specs: list of (key, reverse) tuples. reverse=True: descending order
    for key, reverse in reversed(specs):
        xs.sort(key=lambda x: x[key], reverse=reverse)

    return xs