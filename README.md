# Dante (diverse-audiences-non-toxic-engagements) -- a prosocial algorithm

## Description 
Our instantiation of “bridging” algorithm ([Ovadya & Thorburn, 2022](https://knightcolumbia.org/content/bridging-systems)) prioritizes posts that evoke civil discussions while appealing to an ideologically diverse audience. Except for toxic posts, content is ranked based on 2 criteria: 1) elicited response and 2) diverse engagement. 

1. Two different models are used to infer the potential responses : one assessing the intensity of Affective Response (AR) to a post, such as happiness or sadness, and another assessing whether a post attracts Harmful Response (HaR), such as toxicity or offensiveness. These models are trained using the emotional content and toxicity levels of responses, predicted using state-of-the-art pre-trained language models, as variables. Note that a post can simultaneously evoke positive emotions and toxic reactions; therefore, the AR and HaR are treated as separate dimensions in our analysis.
2. Diverse engagement is measured through a metric called "audience diversity” (AD). It estimates the range of ideological slants of the audience engaging with the content ([Bhadani et al., 2022](https://arxiv.org/abs/2007.08078)). If a post includes a URL, we assess its "source level" diversity by examining the ideological range of the domain's typical audience, which will be pre-calculated using a similar approach as described in Bhadani et al., 2022. Additionally, regardless of whether a post contains a URL, we determine the “topic level” diversity using the textual content.

Our algorithm first removes highly toxic posts, then reranks the rest as follows: Non-HaR posts with high AD scores are prioritized, while all HaR posts are demoted. Where there are ties, posts are ordered by their AR scores to enhance engagement.

**Note** 
- this was a submission to the [Prosocial Ranking Challenge](https://humancompatible.ai/news/2024/01/18/the-prosocial-ranking-challenge-60000-in-prizes-for-better-social-media-algorithms/)
— the main project files for each of the components are located in `app`. This directory structure is a relic of starting from the template code which we can fix at some point.

**Helpful Docs** — [Poetry](https://python-poetry.org/docs/basic-usage/),  [Celery](https://docs.celeryq.dev/en/stable/), [Redis](https://redis.io/docs/latest/commands/json.get/), [JSONPath](https://github.com/json-path/JsonPath)

## Quick Reference

These variables are specified in `docker-compose.yml` (To be updated). Copied here for reference.

### Component Locations

| Component           | Location                                     |
| ------------------- | -------------------------------------------- |
| ranker              | `0.0.0.0:5001`                               |
| postgres            | `postgres://postgres:postgres@database:5432` |
| redis               | `redis://redis:6379`                         |
| redis-celery-broker | `redis://redis-celery-broker:6380`           |

### Environment Variables

| Variable            | Description                     | Docker default    |
| ------------------- | ------------------------------- | ----------------- |
| `DANTE_CACHE_DIR`   | Location for data / model cache | `/app/cache/`     |
| `DANTE_CONFIG_PATH` | Path to configuration file      | `/app/config.ini` |
| `DANTE_LOG_DIR`     | Location for logs               | `/app/logs/       |

## Setup

1. Make sure you have docker and docker-compose installed.
2. Make sure you have celery, redis-py, and pytest installed.
3. Add models artifacts: Download all the contents of this [Google Drive
folder](https://drive.google.com/drive/folders/1PCv57AxHhdwhkLGQbhT4o_6qke_NL2dC?usp=sharing)
into your user cache dir (see on the platformdirs doc for where to find it on [mac os](https://platformdirs.readthedocs.io/en/latest/api.html#platformdirs.macos.MacOS.user_cache_dir), [windows](https://platformdirs.readthedocs.io/en/latest/api.html#platformdirs.windows.Windows.site_cache_dir), and [linux](https://platformdirs.readthedocs.io/en/latest/api.html#platformdirs.unix.Unix.user_cache_dir)). There is no `$version`, while the `$appname` is `dante`. So for example on my Linux laptop the user cache dir is located at `/home/<username>/.cache/dante/`.
4. Add a `config.ini` to the root of the repository. This is meant to supply the configuration without needing to rebuild the image, which will be helpful when deploying in production. But for now you can copy this file from our example config: `cp dante/osomerank/config.ini.sample config.ini`
5. Start the docker daemon.
6. Run the component(s) in 2 ways:
* 6.1. Build and run all components with a single command: `make run`
* 6.2. Build and run a single component (use a bind mount to give it access to the models artifacts needed to run dante)
```shell
export DANTE_CACHE_DIR=/path/to/files # The path where you store the Google Drive contents
docker build -f docker/Dockerfile.ranker -t ranker .
docker run --mount type=bind,src=${DANTE_CACHE_DIR},dst=/app/cache ranker
```

## Run test on the ranker 
- Ensure you have all the dependencies installed by using `poetry install` from root directory
- `poetry shell` 
- Once you have the container running, test the ranker using this command:
    `python tests/latency.py`

## Clearing Space

Your personal machine might fill up when repeatedly building all these docker images and volumes. To clear space, run:

1. `sudo docker system prune -a`
2. `sudo docker volume prune -a`

## Setting up development environment

When developing, an optional dependency group for development is provided in pyproject file. This can be installed with:
```
poetry install --with=dev
```
