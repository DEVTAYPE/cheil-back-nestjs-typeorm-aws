# Despliegue en producción

## Arquitectura

```
Usuario
   ↓
Frontend (Vercel · Next.js 16)
   ↓
API calls
   ↓
EC2 (t2.micro · Ubuntu 24.04)
   ↓
Nginx :80 → NestJS :3000 (PM2)
   ↓
RDS PostgreSQL (db.t3.micro)
   ↓
AWS S3 (imágenes productos)
   ↓
AWS SES (emails)

```

---

## Backend — EC2 + RDS

### Requisitos en EC2

- Ubuntu 24.04 LTS
- Node.js 20, pnpm 10, PM2, Nginx

### Variables de entorno (`.env`)

```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://postgres:PASSWORD@RDS_ENDPOINT:5432/postgres?sslmode=no-verify"
JWT_SECRET="genera con: openssl rand -hex 32"
JWT_EXPIRES_IN="1d"
CORS_ORIGINS="https://TU_APP.vercel.app"
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=cheil-productos-images
AWS_SES_FROM_EMAIL=noreply@tudominio.com
AWS_SES_ADMIN_EMAIL=admin@tudominio.com
```

### Despliegue inicial

```bash
git clone https://github.com/taypedev/cheil-backend-nestjs.git
cd cheil-backend-nestjs
cp .env.example .env && nano .env          # completa los valores
bash scripts/deploy.sh                     # instala, migra y levanta PM2
sudo cp nginx/cheil-backend.conf /etc/nginx/sites-available/cheil-backend
sudo ln -s /etc/nginx/sites-available/cheil-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
npx prisma db seed                         # crea admin + datos de prueba
```

### Actualizar

```bash
bash scripts/deploy.sh
```

### Verificar

```bash
curl http://TU_EC2_IP/api/v1/health
# { "status": "ok", "info": { "database": { "status": "up" } } }
```

## Costos estimados

> Los servicios marcados con ★ entran en el **AWS Free Tier** durante los primeros 12 meses.

| Servicio            | Tier usado   | Free Tier                       | Costo tras free tier      |
| ------------------- | ------------ | ------------------------------- | ------------------------- |
| **EC2** t2.micro    | Servidor app | ★ 750 h/mes × 12 meses          | ~$8.50/mes                |
| **RDS** db.t3.micro | PostgreSQL   | ★ 750 h/mes + 20 GB × 12 meses  | ~$13/mes                  |
| **S3**              | Imágenes     | ★ 5 GB + 20k GET + 2k PUT       | $0.023/GB + $0.005/1k PUT |
| **SES**             | Emails       | ★ 62,000 emails/mes (desde EC2) | $0.10/1,000 emails        |
| **IAM**             | Credenciales | Siempre gratis                  | $0                        |

**Costo estimado tras el free tier: ~$22/mes** (EC2 + RDS + tráfico mínimo de S3/SES).

---

## Credenciales de prueba (tras el seed)

| Campo    | Valor          |
| -------- | -------------- |
| Email    | admin@cheil.pe |
| Password | Admin123!      |

---

## Troubleshooting rápido

```bash
pm2 logs cheil-backend --lines 50   # logs de la app
pm2 restart cheil-backend           # reiniciar
sudo tail -f /var/log/nginx/error.log
```
