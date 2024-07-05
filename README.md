# Dante (diverse-audiences-non-toxic-engagements) -- a prosocial algorithm
A submission to the Prosocial Ranking Challenge

**Note** — the main project files for each of the components are located in `app`. This directory structure is a relic of starting from the template code which we can fix at some point.

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

| Variable            | Description                                    |
| ------------------- | ---------------------------------------------- |
| `DANTE_CACHE_DIR`   | Location for data / model cache                |
| `DANTE_CONFIG_PATH` | Path to configuration file                     |

## How to run locally

All commands are executed from the root directory of the repository.

### Setup

#### Once

1. Make sure you have docker and docker-compose installed.
2. Make sure you have celery, redis-py, and pytest installed.

#### Every time

3. Start the docker daemon.

### Build and run ALL components

To (i) build the Docker images for all components and (ii) start them running in containers with a single command, use the following steps.

1. Run `make run`

### Build and run a SINGLE component

1. Build image: e.g., `docker build -f docker/Dockerfile.ranker -t ranker .`
2. Run: e.g., `docker run ranker`


### Add models artifacts to dante

Download all the contents of this [Google Drive
folder](https://drive.google.com/drive/folders/1PCv57AxHhdwhkLGQbhT4o_6qke_NL2dC?usp=sharing)
into, keeping the folder names, locally. Then you can can run a component and
use a bind mount to give it access to the models artifacts needed to run dante.
For example:

```shell
export DANTE_CACHE_DIR=/path/to/files
docker build -f docker/Dockerfile.ranker -t ranker .
docker run --mount type=bind,src=${DANTE_CACHE_DIR},dst=/app/cache ranker
```

Where `/path/to/files` should be replaced with the path where you downloaded the Google Drive contents.

### Clearing Space

Your personal machine might fill up when repeatedly building all these docker images and volumes. To clear space, run:

1. `sudo docker system prune -a`
2. `sudo docker volume prune -a`

## Setting up development environment

When developing, an optional dependency group for development is provided in pyproject file. This can be installed with:
```
poetry install --with=dev
```
