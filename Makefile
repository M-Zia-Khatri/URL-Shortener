.DEFAULT_GOAL := help

.PHONY: help install dev build test format format-check lint check ci clean db-generate db-migrate prepare docker-up docker-down docker-restart docker-logs docker-ps docker-build docker-up-build docker-clean docker-shell-server docker-shell-client docker-db docker-redis

help:
	@echo "URL Shortener commands:"
	@echo "  make install            Install dependencies and initialize Husky"
	@echo "  make dev               Start client and server in development mode"
	@echo "  make build             Build all workspaces"
	@echo "  make test              Run all tests"
	@echo "  make format            Format the repository with Biome"
	@echo "  make format-check      Check formatting with Biome"
	@echo "  make lint              Lint the repository with Biome"
	@echo "  make check             Run Biome checks"
	@echo "  make ci                Run CI checks, tests, and build"
	@echo "  make db-generate       Generate database migrations"
	@echo "  make db-migrate        Apply database migrations"
	@echo "  make docker-up         Start Docker services"
	@echo "  make docker-down       Stop Docker services"
	@echo "  make docker-restart    Restart Docker services"
	@echo "  make docker-logs       Follow Docker service logs"
	@echo "  make docker-ps         Show Docker service status"
	@echo "  make docker-build      Build Docker images"
	@echo "  make docker-up-build   Build images and start Docker services"
	@echo "  make docker-clean      Stop services and remove volumes"
	@echo "  make docker-shell-server Open a shell in the server container"
	@echo "  make docker-shell-client Open a shell in the client container"
	@echo "  make docker-db         Open a PostgreSQL shell"
	@echo "  make docker-redis      Open a Redis CLI"
	@echo "  make clean             Remove generated workspace output"

install:
	pnpm install
	pnpm prepare

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

format:
	pnpm format

format-check:
	pnpm format:check

lint:
	pnpm lint

check:
	pnpm check

ci:
	pnpm run ci

db-generate:
	pnpm db:generate

db-migrate:
	pnpm db:migrate

prepare:
	pnpm prepare

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-restart:
	docker compose restart

docker-logs:
	docker compose logs -f

docker-ps:
	docker compose ps

docker-build:
	docker compose build

docker-up-build:
	docker compose up -d --build

docker-clean:
	docker compose down -v --remove-orphans

docker-shell-server:
	docker compose exec server sh

docker-shell-client:
	docker compose exec client sh

docker-db:
	docker compose exec postgres psql -U postgres -d url_shortener

docker-redis:
	docker compose exec redis redis-cli

clean:
	pnpm --filter client exec rm -rf dist
	pnpm --filter server exec rm -rf dist
