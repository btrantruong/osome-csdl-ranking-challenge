# Dockerfile, image, container
# delete comments after

FROM python:3.12.2-slim
WORKDIR /app
COPY . .
RUN conda install -y -c anaconda -c conda-forge \
    black \
    isort \
    flake8 \
    pytest \
    neovim \
    scikit-learn \
    scipy \
    seaborn \
    pandas \
    hdbscan
RUN pip install --upgrade pip && \
    pip install -e ./libs/ && \
    pip install flask-cors flask requests sentence-transformers nltk bertopic
RUN pip install -r requirements.txt
EXPOSE 5000
#fix CMD to flask instead of python
CMD ["flask", "run", "--host=0.0.0.0"]