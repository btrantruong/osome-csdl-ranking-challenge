FROM python:3.12

# change dir
WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy only the necessary files to install dependencies with Poetry
COPY pyproject.toml poetry.lock ./

# Install dependencies using Poetry
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev

# Copy the rest of the application code
COPY app/ /app
COPY /libs/osomerank /app/libs/osomerank

# Set environment variables
ENV FLASK_APP=ranking_server.py
ENV FLASK_ENV=production
ENV FLASK_RUN_PORT=5001
#ENV PYTHONPATH “${PYTHONPATH}:/libs/osomerank”

# Expose the port the app runs on
EXPOSE 5001

# Set the entrypoint to poetry run
ENTRYPOINT ["poetry", "run"]

# Define the command to run the application
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]