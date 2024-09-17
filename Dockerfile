# Builder stage
# =============

# Use the standard python image for building
FROM python:3.12 as builder

ENV PIP_REQUESTS_TIMEOUT=300 \
    POETRY_REQUESTS_TIMEOUT=300 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \ 
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

COPY pyproject.toml poetry.lock .

# Install dependencies from lock file but not the package itself (--no-root),
# which is installed later. Separating this step from the package installation
# allows to take advantange of docker's caching system for repeated builds.
# For extra robustness, we also include --no-directory to skip installing any
# dependency that is specified as a path to a local directory
# (https://python-poetry.org/docs/dependency-specification/#path-dependencies)
# as these should be copied directly along with the package in the next step.
# Note we also clear the poetry cache to keep the overall image size low. 
RUN pip install poetry \
    && poetry install --only=main --no-root --no-directory \
    && rm -rf ${POETRY_CACHE_DIR}

# Build a wheel for package and install it into the virtual environment using
# pip. This is preferred as it actually installs the package as opposed to
# copying the source code into /app. Lastly, if there is any library specified
# as a path dependency we should copy those too here. 
COPY pyproject.toml poetry.lock README.md ./
COPY dante ./dante
RUN poetry build --format=wheel \
    && poetry run pip install --no-deps dist/*.whl \
    && rm -rf dist

# Runtime stage
# =============

# Use the python slim image (produces smaller images)
FROM python:3.12-slim as runtime

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:${PATH}" \
    DANTE_CACHE_DIR=/app/cache \
    DANTE_CONFIG_PATH="/app/config.ini" \
    DANTE_LOG_DIR=/app/logs

WORKDIR /app

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

# # Expose the port the app runs on
# EXPOSE 5001

# # Define the command to run the application
# CMD ["uvicorn", "--host", "0.0.0.0", "--port", "5001", "dante.app.ranking_server.ranking_server:app"]
