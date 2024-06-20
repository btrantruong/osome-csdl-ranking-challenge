.PHONY : create_conda_env
.ONESHELL:

SHELL=/bin/bash
PROJ_NAME=dante
ENV_PATH=$$(conda info --base)
CONDA_ACTIVATE=source $$(conda info --base)/etc/profile.d/conda.sh ; conda activate $(PROJ_NAME)
DEPENDENCIES=conda install -y -c anaconda -c conda-forge black isort flake8 pytest scikit-learn scipy pandas hdbscan

create_conda_env:
	echo "Creating conda environent at ${ENV_PATH}/envs/${PROJ_NAME} (Delete any existing conda env with the same name).."
	rm -rf "${ENV_PATH}/envs/${PROJ_NAME}"
	conda create --force -y -n $(PROJ_NAME) python=3.12
	$(CONDA_ACTIVATE); $(DEPENDENCIES); conda install pytorch::pytorch torchvision torchaudio -c pytorch; pip install requests sentence-transformers nltk bertopic rbo fastapi uvicorn faker boto3 aiohttp psycopg2-binary SQLAlchemy celery-redbeat redis ranking-challenge; 