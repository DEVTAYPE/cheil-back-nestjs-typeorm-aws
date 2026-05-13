despues de instalar prisma

npx prisma init --datasource-provider postgresql

pnpm add -D dotenv

npx prisma validate

npx prisma migrate dev --name init-schema

npx prisma generate

pnpm add @prisma/adapter-pg pg && pnpm add -D @types/pg
