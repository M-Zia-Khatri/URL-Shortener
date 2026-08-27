.DEFAULT_GOAL := help

.PHONY: help install dev build test format format-check lint check ci clean db-generate db-migrate prepare

help:
	@echo "URL Shortener commands:"
	@echo "  make install       Install dependencies and initialize Husky"
	@echo "  make dev           Start client and server in development mode"
	@echo "  make build         Build all workspaces"
	@echo "  make test          Run all tests"
	@echo "  make format        Format the repository with Biome"
	@echo "  make format-check  Check formatting with Biome"
	@echo "  make lint          Lint the repository with Biome"
	@echo "  make check         Run Biome checks"
	@echo "  make ci            Run CI checks, tests, and build"
	@echo "  make db-generate   Generate database migrations"
	@echo "  make db-migrate    Apply database migrations"
	@echo "  make clean         Remove generated workspace output"

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
	pnpm ci

db-generate:
	pnpm db:generate

db-migrate:
	pnpm db:migrate

prepare:
	pnpm prepare

clean:
	pnpm --filter client exec rm -rf dist
	pnpm --filter server exec rm -rf dist
