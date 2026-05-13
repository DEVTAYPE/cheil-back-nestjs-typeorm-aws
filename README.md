# Cheil Perú — Backend API

REST API para gestión de productos y categorías con autenticación JWT.

[![CI](https://github.com/taypedev/cheil-backend-nestjs/actions/workflows/ci.yml/badge.svg)](https://github.com/taypedev/cheil-backend-nestjs/actions)

<!-- GANCHO PARA MANDAR A DEPLOY -->

> Si quieres ver la API en producción, puedes acceder a: []()

> o quieres aprender a desplegar sigue la guia de despliegue en el MD de despliegue en AWS. [archivo de despliegue](./DEPLOY.md)

## Stack

| Tecnología     | Versión | Uso                  |
| -------------- | ------- | -------------------- |
| NestJS         | 11      | Framework            |
| Prisma         | 7       | ORM                  |
| PostgreSQL     | 16      | Base de datos        |
| JWT / Passport | —       | Autenticación        |
| Swagger        | —       | Documentación de API |
| Docker         | —       | Entorno local        |
| Jest           | 29      | Tests                |

## Requisitos

- Node.js 20+
- pnpm
- Docker Desktop

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/DEVTAYPE/cheil-back-nestjs-typeorm-aws.git
cd cheil-backend-nestjs
pnpm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes. El `.env.example` contiene:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/cheil_db"
JWT_SECRET="mínimo 32 caracteres — generar con: openssl rand -hex 32"
JWT_EXPIRES_IN="1d"
CORS_ORIGINS="http://localhost:3001"

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cheil_db
```

> El puerto es **5433** para no conflictuar con PostgreSQL local en 5432.

### 3. Levantar base de datos

```bash
docker-compose up -d
```

Servicios disponibles:

- PostgreSQL: `localhost:5433`
- pgAdmin: `http://localhost:5050` (admin@cheil.pe / admin123)

### 4. Migraciones

```bash
npx prisma migrate deploy
```

### 5. Datos de prueba

```bash
npx prisma db seed
```

Crea: 1 usuario admin, 3 categorías y 3 productos de ejemplo.

```
Email:    admin@cheil.pe
Password: Admin123!
```

### 6. Iniciar servidor

```bash
pnpm run start:dev
```

Servidor en: `http://localhost:3000`
Swagger UI en: `http://localhost:3000/api/docs`

---

## Autenticación

Todos los endpoints de productos y categorías requieren un JWT válido.

**1. Obtener token:**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@cheil.pe",
  "password": "Admin123!"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "token_type": "Bearer"
  }
}
```

**2. Usar el token en los requests:**

```http
Authorization: Bearer eyJhbGci...
```

---

## Endpoints

### Auth

| Método | Ruta                 | Auth | Descripción    |
| ------ | -------------------- | ---- | -------------- |
| POST   | `/api/v1/auth/login` | ✗    | Iniciar sesión |

### Categorías

| Método | Ruta                     | Auth | Descripción            |
| ------ | ------------------------ | ---- | ---------------------- |
| POST   | `/api/v1/categorias`     | ✓    | Crear categoría        |
| GET    | `/api/v1/categorias`     | ✓    | Listar categorías      |
| GET    | `/api/v1/categorias/:id` | ✓    | Obtener por ID         |
| PATCH  | `/api/v1/categorias/:id` | ✓    | Actualizar             |
| DELETE | `/api/v1/categorias/:id` | ✓    | Eliminar (soft delete) |

### Productos

| Método | Ruta                    | Auth | Descripción            |
| ------ | ----------------------- | ---- | ---------------------- |
| POST   | `/api/v1/productos`     | ✓    | Crear producto         |
| GET    | `/api/v1/productos`     | ✓    | Listar con paginación  |
| GET    | `/api/v1/productos/:id` | ✓    | Obtener por ID         |
| PATCH  | `/api/v1/productos/:id` | ✓    | Actualizar             |
| DELETE | `/api/v1/productos/:id` | ✓    | Eliminar (soft delete) |

### Listado de productos — Query params

```
GET /api/v1/productos?page=1&limit=10&nombre=laptop&categoriaId=1&precioMin=100&precioMax=5000
```

| Param         | Tipo   | Default | Descripción                      |
| ------------- | ------ | ------- | -------------------------------- |
| `page`        | number | 1       | Página                           |
| `limit`       | number | 10      | Resultados por página (máx. 100) |
| `nombre`      | string | —       | Búsqueda parcial por nombre      |
| `categoriaId` | number | —       | Filtrar por categoría            |
| `precioMin`   | number | —       | Precio mínimo                    |
| `precioMax`   | number | —       | Precio máximo                    |

Respuesta paginada:

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 50,
    "page": 1,
    "lastPage": 5,
    "limit": 10
  }
}
```

### Otros

| Método | Ruta             | Auth | Descripción           |
| ------ | ---------------- | ---- | --------------------- |
| GET    | `/api/v1/health` | ✗    | Estado de la API y BD |

---

## Formato de respuestas

**Éxito:**

```json
{
  "success": true,
  "data": { ... },
  "message": "OK",
  "timestamp": "2026-05-13T10:00:00.000Z"
}
```

**Error:**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Producto #5 no encontrado",
  "code": "PRODUCTO_NOT_FOUND",
  "path": "/api/v1/productos/5",
  "timestamp": "2026-05-13T10:00:00.000Z"
}
```

---

## Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Cobertura
pnpm run test:cov
```

---

## Estructura del proyecto

```
src/
├── auth/           # Login, JWT strategy, guard, @CurrentUser
├── categorias/     # CRUD categorías con repository pattern
├── productos/      # CRUD productos con paginación y filtros
├── prisma/         # PrismaService + módulo global
├── health/         # Health check endpoint
└── common/
    ├── dto/        # PaginationDto, PaginatedResult<T>
    ├── exceptions/ # Excepciones de dominio tipadas
    ├── filters/    # HttpExceptionFilter global
    └── interceptors/ # LoggingInterceptor, TransformInterceptor
```
