.PHONY : create_conda_env
.ONESHELL:

SHELL=/bin/bash
PROJ_NAME=osomerank
ENV_PATH=$$(conda info --base)
CONDA_ACTIVATE=source $$(conda info --base)/etc/profile.d/conda.sh ; conda activate $(PROJ_NAME)
DEPENDENCIES=conda install -y -c anaconda -c conda-forge black isort flake8 pytest neovim scikit-learn scipy seaborn pandas hdbscan transformers

create_conda_env:
	echo "Creating conda environent at ${ENV_PATH}/envs/${PROJ_NAME} (Delete any existing conda env with the same name).."
	rm -rf "${ENV_PATH}/envs/${PROJ_NAME}"
	conda create --force -y -n $(PROJ_NAME) python=3.8  
	$(CONDA_ACTIVATE); conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia; $(DEPENDENCIES); pip install -e ./libs/; pip install flask-cors flask requests sentence-transformers nltk bertopic rbo