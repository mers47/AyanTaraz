#!/bin/bash
set -e
echo "Ayan Taraz Deploy"
[ ! -f .env ] && echo "Missing .env" && exit 1
docker compose build --no-cache
docker compose up -d
sleep 10
docker compose ps
curl -sf http://localhost:4000/api/health && echo "Backend OK"
curl -sf http://localhost:3000 && echo "Frontend OK"
echo "Done - http://202.133.91.13"
