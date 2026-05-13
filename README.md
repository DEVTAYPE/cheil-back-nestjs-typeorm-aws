despues de instalar prisma

npx prisma init --datasource-provider postgresql

pnpm add -D dotenv

npx prisma validate

npx prisma migrate dev --name init-schema

npx prisma generate

pnpm add @prisma/adapter-pg pg && pnpm add -D @types/pg

POST /api/v1/categorias → 201

GET /api/v1/categorias → 200

GET /api/v1/categorias/:id → 200 or 404

PATCH /api/v1/categorias/:id → 200 or 404/409

DELETE /api/v1/categorias/:id → 204 | 404
