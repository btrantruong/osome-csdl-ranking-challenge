# syntax=docker/dockerfile:1

FROM python:3.11
WORKDIR /app
RUN mkdir -p /app/data
RUN mkdir -p /app/models
COPY config.ini /app
COPY audience_diversity_BERTopic_Rockwell.py /app
RUN pip install --upgrade numpy
RUN pip install pandas
RUN pip install --upgrade pip setuptools wheel
RUN pip install bertopic --no-cache-dir
RUN pip uninstall hdbscan -y
RUN pip install hdbscan --no-cache-dir --no-binary :all: --no-build-isolation
RUN pip install boto3
RUN pip install psycopg2
RUN pip install redis
CMD python audience_diversity_BERTopic_Rockwell.py
