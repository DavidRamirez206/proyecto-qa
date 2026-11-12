#!/bin/sh
set -e

# Crea el .env la primera vez a partir de la plantilla.
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Sincroniza vendor/ con composer.lock (no hace nada si ya está al día).
composer install --no-interaction --prefer-dist

# Genera APP_KEY solo si aún no existe.
if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force
fi

php artisan migrate --force

exec "$@"
