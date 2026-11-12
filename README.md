# proyecto-qa

Proyecto base para enseñar automatización de pruebas y CI/CD.

| Servicio   | Tecnología                          | Puerto del host |
|------------|-------------------------------------|-----------------|
| `db`       | PostgreSQL 17                       | no se expone    |
| `backend`  | Laravel 13 (PHP 8.4) + Sanctum      | `8000`          |
| `frontend` | Next.js 16 (TypeScript, App Router) | `3000`          |

Todo corre en contenedores: no hace falta instalar PHP, Composer ni Node.js en el equipo.

## Requisitos

- Git
- Docker Engine 24+ con el plugin Docker Compose v2 (`docker compose version`)
- `make` (opcional: cada objetivo muestra el comando equivalente)

Versiones que usan las imágenes: PHP 8.4, Composer 2, Node.js 22, PostgreSQL 17.

## Levantar el proyecto

```bash
git clone <url-del-repositorio> proyecto-qa
cd proyecto-qa

# 1. Crear backend/.env y construir las imágenes
make install            # = cp backend/.env.example backend/.env && docker compose build

# 2. Levantar db, backend y frontend (espera a que estén sanos)
make up                 # = docker compose up -d --wait

# 3. Crear tablas y datos de ejemplo (usuario QA y 5 productos)
make seed               # = docker compose exec backend php artisan migrate --seed --force
```

Al terminar:

- Frontend: <http://localhost:3000/login>
- API: <http://localhost:8000/api>

### Qué ocurre al arrancar el backend

El script `backend/docker/entrypoint.sh` se ejecuta en cada arranque del contenedor:

1. Copia `.env.example` a `.env` si no existe.
2. Ejecuta `composer install` (no hace nada si `vendor/` ya está al día).
3. Genera `APP_KEY` si todavía no hay una.
4. Ejecuta `php artisan migrate --force`.

El frontend hace lo mismo con `npm install` antes de `npm run dev`.

### Credenciales del usuario de pruebas

| Campo      | Valor              |
|------------|--------------------|
| Correo     | `qa@proyecto.test` |
| Contraseña | `password`         |

La contraseña se toma de `QA_PASSWORD` en `backend/.env`. Si la cambia, vuelva a ejecutar
`make seed`.

## Operación diaria

| Acción                                 | Comando                                                 |
|----------------------------------------|---------------------------------------------------------|
| Ver estado de los contenedores         | `docker compose ps`                                     |
| Ver logs (todos / uno)                 | `make logs` / `docker compose logs -f backend`          |
| Detener (conserva los datos)           | `make down`                                             |
| Reiniciar un servicio                  | `docker compose restart backend`                        |
| Comando de Artisan                     | `docker compose exec backend php artisan <comando>`     |
| Consola de PostgreSQL                  | `docker compose exec db psql -U qa -d proyecto_qa`      |
| Reconstruir tras cambiar dependencias  | `docker compose up -d --build --wait`                   |
| Reiniciar la base de datos desde cero  | `docker compose exec backend php artisan migrate:fresh --seed --force` |
| Borrar todo (contenedores y volúmenes) | `docker compose down -v`                                |

El código de `backend/` y `frontend/` se monta en los contenedores, así que los cambios se ven sin
reconstruir. `vendor/` y `node_modules/` viven en volúmenes de Docker y no en su carpeta local.

## Pruebas

Las pruebas se ejecutan dentro de los contenedores. No necesitan que el stack esté levantado.

| Objetivo             | Qué hace                                                          |
|----------------------|-------------------------------------------------------------------|
| `make test-backend`  | Pest (`./vendor/bin/pest`) sobre SQLite en memoria                |
| `make test-frontend` | Vitest con cobertura (`npm run test:coverage`)                    |
| `make lint`          | ESLint y `tsc --noEmit` del frontend                              |
| `make test`          | `lint` + `test-backend` + `test-frontend`                         |

Comandos sueltos:

```bash
docker compose run --rm backend ./vendor/bin/pest --filter=OrderCalculator
docker compose run --rm --no-deps frontend npm run test:run
docker compose run --rm --no-deps frontend npm run build
```

- Backend: `phpunit.xml` fija `DB_CONNECTION=sqlite` y `DB_DATABASE=:memory:`, así que las pruebas
  nunca tocan la base de PostgreSQL.
- Frontend: los reportes de cobertura (`text`, `lcov` y `cobertura`) quedan en `frontend/coverage/`.

### Rama de demostración

La rama `demo/defecto-iva` cambia el IVA de `OrderCalculator` del 19 % al 18 % sin tocar las
pruebas, para mostrar cómo una suite detecta un defecto:

```bash
git switch demo/defecto-iva
make test-backend       # falla en OrderCalculatorTest
git switch main
```

## Endpoints

Todas las rutas usan el prefijo `/api`. Envíe `Accept: application/json`.

| Método   | Ruta                 | Autenticación | Respuestas               |
|----------|----------------------|---------------|--------------------------|
| `POST`   | `/api/login`         | No            | 200 `{ token }`, 422     |
| `GET`    | `/api/products`      | Bearer        | 200, 401                 |
| `POST`   | `/api/products`      | Bearer        | 201, 401, 422            |
| `GET`    | `/api/products/{id}` | Bearer        | 200, 401, 404            |
| `PUT`    | `/api/products/{id}` | Bearer        | 200, 401, 404, 422       |
| `DELETE` | `/api/products/{id}` | Bearer        | 204, 401, 404            |

Validación de productos: `name` obligatorio, de 3 a 120 caracteres; `price` obligatorio,
numérico, entre `0.01` y `99999.99`.

```bash
TOKEN=$(curl -s http://localhost:8000/api/login \
  -H 'Accept: application/json' -H 'Content-Type: application/json' \
  -d '{"email":"qa@proyecto.test","password":"password"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')

curl -s http://localhost:8000/api/products \
  -H 'Accept: application/json' -H "Authorization: Bearer $TOKEN"
```

## Configuración

| Archivo                | Para qué                                                                 |
|------------------------|--------------------------------------------------------------------------|
| `backend/.env`         | Laravel: conexión a `db`, `APP_KEY`, `QA_PASSWORD`. Se crea desde `.env.example`. |
| `.env` (raíz)          | Opcional. Cambia los puertos del host; ver `.env.example`.                |
| `frontend/.env.example`| Valor por defecto de `NEXT_PUBLIC_API_URL` (`http://localhost:8000`).     |

Las credenciales de PostgreSQL de `docker-compose.yml` (`POSTGRES_*`) deben coincidir con
`DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD` de `backend/.env`.

## Solución de problemas

- **`port is already allocated` en el 8000.** Cree un `.env` en la raíz con
  `BACKEND_PORT=8001` y `NEXT_PUBLIC_API_URL=http://localhost:8001`, y ejecute `make up`.
  El frontend debe seguir en el puerto 3000, porque CORS solo permite `http://localhost:3000`.
- **El backend no queda `healthy`.** Revise `docker compose logs backend`; suele ser una
  credencial de base de datos que no coincide entre `backend/.env` y `docker-compose.yml`.
- **Archivos creados con otro dueño.** Las imágenes usan el UID/GID 1000. Si su usuario tiene
  otro, construya con `docker compose build --build-arg UID=$(id -u) --build-arg GID=$(id -g) backend`.
- **Cambió `composer.lock` o `package-lock.json`.** Basta con reiniciar el servicio
  (`docker compose restart backend`); el entrypoint sincroniza las dependencias.
