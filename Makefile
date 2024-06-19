.PHONY : create_conda_env install_modules
.ONESHELL:

SHELL=/bin/bash
PROJ_NAME=osomerank2
ENV_PATH=$$(conda info --base)
CONDA_ACTIVATE=source $$(conda info --base)/etc/profile.d/conda.sh ; conda activate $(PROJ_NAME)

all: create_conda_env install_modules

create_conda_env:
	echo "Creating conda enviroment at ${ENV_PATH}/envs/${PROJ_NAME} (Delete any existing conda env with the same name).."
	rm -rf "${ENV_PATH}/envs/${PROJ_NAME}"
	conda env create -f environment.yml -p "${ENV_PATH}/envs/${PROJ_NAME}"
	
install_modules:
	$(CONDA_ACTIVATE)
	echo "Install prediction modules"
	pip install -e ./libs/
	echo "Install pydantic models for the PRC API schema"
	pip install -e ./module/src/