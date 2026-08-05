#!/bin/bash
set -euo pipefail

echo "Ayan Taraz Deploy"
[ ! -f .env ] && echo "Missing .env. Run ./scripts/setup-vps.sh first." && exit 1

docker compose build --no-cache
docker compose up -d postgres redis
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npm run db:seed
docker compose up -d
sleep 10
docker compose ps
curl -sf http://localhost:4000/api/health && echo "Backend OK"
curl -sf http://localhost:3000 && echo "Frontend OK"
echo "Done - ${PUBLIC_BASE_URL:-http://202.133.91.13}"
