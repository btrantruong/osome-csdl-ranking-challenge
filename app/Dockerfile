FROM python:3.12

# Install Poetry
RUN pip install poetry

# Create directories and copy files
RUN mkdir -p /app/osomerank
COPY app/ranking_server.py /app/
COPY libs/osomerank /app/osomerank/
COPY poetry.lock pyproject.toml /app/

# Set environment variables
ENV FLASK_APP=ranking_server.py
ENV FLASK_ENV=development
ENV FLASK_RUN_PORT=5001
ENV POETRY_VIRTUALENVS_CREATE=false

# Set working directory
WORKDIR /app

# Install dependencies
RUN poetry install --no-root

# Expose port 5001 for Flask Application
EXPOSE 5001

# Command to run the Flask application
CMD ["poetry", "run", "python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]
