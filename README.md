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

## How to run locally

All commands are executed from the root directory.

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

To (i) build the Docker image for a single component and (ii) start it running, there are two options.

#### Option 1

If you have already run `make run`, the images for all components should already exist (you can check this with `docker images`). In that case you just need to start a container running the relevant image, which can be done with (e.g.)

Command: (to be updated): 

#### Option 2

You can also just build a single component and run it.

1. Build image: e.g., `docker build -f docker/Dockerfile.ranker -t ranker .`
2. Run: e.g., `docker run ranker`


### Add models artifacts to osomerank

Put all the folders (prediction models and data) from this [Google Drive folder](https://drive.google.com/drive/folders/1PCv57AxHhdwhkLGQbhT4o_6qke_NL2dC?usp=sharing) into `libs/osomerank`, keeping the folder names. 

### Clearing Space

Your personal machine might fill up when repeatedly building all these docker images and volumes. To clear space, run:

1. `sudo docker systemctl prune -a`
2. `sudo docker volume prune -a`
