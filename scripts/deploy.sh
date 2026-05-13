#!/bin/bash
# deploy.sh — Deploy script para EC2 (Ubuntu 22.04)
# usando: bash scripts/deploy.sh
set -e

echo "=== Cheil Backend — Deploy ==="

# 1. Pull latest code
echo "[1/6] Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo "[2/6] Installing dependencies..."
pnpm install --frozen-lockfile

# 3. Generate Prisma client
echo "[3/6] Generating Prisma client..."
npx prisma generate

# 4. Run migrations
echo "[4/6] Running database migrations..."
npx prisma migrate deploy

# 5. Build
echo "[5/6] Building application..."
pnpm run build

# 6. Restart PM2
echo "[6/6] Restarting PM2..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

echo "=== Deploy completed ==="
pm2 status
