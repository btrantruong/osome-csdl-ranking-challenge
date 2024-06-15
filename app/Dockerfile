# Stage 1: Build Stage
FROM python:3.12 AS builder

# Install Poetry
RUN pip install poetry

# Set working directory
WORKDIR /app

# Copy only necessary files
COPY app/ /app/
COPY libs/osomerank /app/osomerank/
COPY poetry.lock pyproject.toml /app/

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev

# Stage 2: Production Stage
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# Copy application files
COPY --from=builder /app /app

# Set environment variables
ENV FLASK_APP=ranking_server.py
ENV FLASK_ENV=production
ENV FLASK_RUN_PORT=5001

# Expose port 5001
EXPOSE 5001

# Command to run the Flask application
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]

