DIST_DIR = ./dist
CURRENT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
NODE_ENV ?= develop
VALID_ENVIRONMENTS := develop test production
# Variables
COMPOSE_FILE := ../docker-compose.yml
SERVICE_NAME := frontend-acc

# Imprime el valor de NODE_ENV
print-env:
	@echo "NODE_ENV is set to $(NODE_ENV)"

ifeq ($(filter $(NODE_ENV),$(VALID_ENVIRONMENTS)),)
$(error Invalid environment specified. Valid values are $(VALID_ENVIRONMENTS))
endif

# Update the local repository to the current branch
update-repo:
	@echo "Updating repo..."
	git pull origin $(CURRENT_BRANCH)
	@echo "pull correctamente.."

# Build the Docker image with the specified NODE_ENV
docker-build:
	@echo "Building Docker image with NODE_ENV=$(NODE_ENV)"
	# Usamos build-arg para pasar el entorno al Dockerfile
	docker build --no-cache --build-arg BUILD_ENV=$(NODE_ENV) -t $(SERVICE_NAME) .

# Run the Docker containers for the ng_ecommerce service
docker-run:
	@echo "Updating $(SERVICE_NAME)..."
	# up -d con --no-deps actualiza SOLO este servicio sin tocar el back ni la base
	# --force-recreate asegura que use la nueva imagen construida
	docker compose -f $(COMPOSE_FILE) up -d --no-deps --force-recreate $(SERVICE_NAME)
	@echo "Checking status..."
	sleep 2
	docker compose -f $(COMPOSE_FILE) ps $(SERVICE_NAME)
	@echo "desplegado correctamente $(SERVICE_NAME)..."

# Deploy the application by updating the repo, building the Docker image, and running the containers
deploy: update-repo docker-build docker-run

# Display available Makefile targets and their descriptions
help:
	@echo "Available targets:"
	@echo "  update-repo   - Update the local repository to the current branch"
	@echo "  docker-build  - Build the Docker image with the specified NODE_ENV"
	@echo "  docker-run    - Run the Docker containers for the ng_ecommerce service"
	@echo "  deploy        - Deploy the application by updating the repo, building the Docker image, and running the containers"

.PHONY: update-repo docker-build run-docker deploy help