FROM python:3.12

RUN pip install poetry

WORKDIR /app

COPY poetry.lock pyproject.toml /app/

RUN poetry install --no-root

COPY app/ranking_server.py /app

#SET ENV Variables
ENV FLASK_APP=ranking_server.py
ENV FLASK_RUN_PORT=5001

# Expose port 5001 for the Flask Application
EXPOSE 5001

CMD ["poetry", "run", "python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]


