COMPOSE = docker compose

.PHONY: install up seed down logs test-backend test-frontend lint test

## Prepara el .env del backend y construye las imágenes
install:
	test -f backend/.env || cp backend/.env.example backend/.env
	$(COMPOSE) build

## Levanta db, backend y frontend en segundo plano y espera a que estén listos
up:
	$(COMPOSE) up -d --wait

## Ejecuta migraciones y seeders (usuario QA y 5 productos)
seed:
	$(COMPOSE) exec backend php artisan migrate --seed --force

## Detiene los contenedores (los datos de PostgreSQL se conservan)
down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

test-backend:
	$(COMPOSE) run --rm backend ./vendor/bin/pest

test-frontend:
	$(COMPOSE) run --rm --no-deps frontend npm run test:coverage

lint:
	$(COMPOSE) run --rm --no-deps frontend npm run lint
	$(COMPOSE) run --rm --no-deps frontend npm run typecheck

test: lint test-backend test-frontend
