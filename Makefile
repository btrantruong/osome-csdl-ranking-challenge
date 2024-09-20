.PHONY: test run clean

# use the new docker compose command if available or the legacy docker-compose command
DOCKER_COMPOSE := $(shell \
    docker compose version > /dev/null 2>&1; \
    if [ $$? -eq 0 ]; then \
        echo "docker compose"; \
    else \
        docker-compose version > /dev/null 2>&1; \
        if [ $$? -eq 0 ]; then \
            echo "docker-compose"; \
        fi; \
    fi; \
)

# Check if GPU is available
GPU_AVAILABLE := $(shell \
    if command -v nvidia-smi > /dev/null 2>&1; then \
        if [ $$(nvidia-smi -L | wc -l) -gt 0 ]; then \
            echo "gpu"; \
        else \
            echo "no-gpu"; \
        fi; \
    else \
        echo "no-gpu"; \
    fi; \
)

run:
	$(DOCKER_COMPOSE) --profile $(GPU_AVAILABLE) up --build

build:
	$(DOCKER_COMPOSE) build

clean:
	rm -rf dist