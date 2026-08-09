#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log(){ echo -e "${GREEN}[✓]${NC} $1"; }; warn(){ echo -e "${YELLOW}[⚠]${NC} $1"; }; err(){ echo -e "${RED}[✗]${NC} $1"; }; info(){ echo -e "${BLUE}[ℹ]${NC} $1"; }

SERVER_IP="202.133.91.13"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE="$DIR/docker-compose.yml"; ENV="$DIR/.env"; EXAMPLE="$DIR/.env.example"
cd "$DIR"

[ "$EUID" -eq 0 ] || { err "Run as root."; exit 1; }
[ -f "$COMPOSE" ] || { err "docker-compose.yml not found."; exit 1; }

install_docker(){
  if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com | sh
  fi
  systemctl enable --now docker
  docker compose version >/dev/null 2>&1 || apt-get update -y && apt-get install -y docker-compose-plugin
}

setenv(){
  local k="$1" v="$2"
  if grep -q "^${k}=" "$ENV"; then
    sed -i "s|^${k}=.*|${k}=${v}|" "$ENV"
  else
    echo "${k}=${v}" >> "$ENV"
  fi
}

ensure_env(){
  [ -f "$ENV" ] || { [ -f "$EXAMPLE" ] && cp "$EXAMPLE" "$ENV" || { err ".env.example not found."; exit 1; }; }

  local pgpass jwt user db
  pgpass="$(grep '^POSTGRES_PASSWORD=' "$ENV" | cut -d= -f2- || true)"
  user="$(grep '^POSTGRES_USER=' "$ENV" | cut -d= -f2- || echo ayan_user)"
  db="$(grep '^POSTGRES_DB=' "$ENV" | cut -d= -f2- || echo ayan_taraz)"
  jwt="$(grep '^JWT_SECRET=' "$ENV" | cut -d= -f2- || true)"

  [[ -z "$pgpass" || "$pgpass" == CHANGE_ME* ]] && pgpass="$(openssl rand -hex 24)"
  [[ -z "$jwt" || "$jwt" == CHANGE_ME* ]] && jwt="$(openssl rand -hex 32)"

  setenv POSTGRES_USER "$user"
  setenv POSTGRES_DB "$db"
  setenv POSTGRES_PASSWORD "$pgpass"
  setenv DATABASE_URL "postgresql://${user}:${pgpass}@postgres:5432/${db}?schema=public"
  setenv JWT_SECRET "$jwt"
  setenv NODE_ENV production
  setenv PORT 4000
  setenv CORS_ORIGINS "http://${SERVER_IP},http://localhost"
  setenv NEXT_PUBLIC_API_URL ""
  setenv NEXT_PUBLIC_BASE_URL "http://${SERVER_IP}"
  setenv PUBLIC_BASE_URL "http://${SERVER_IP}"
  setenv UPLOAD_DIR "/app/uploads"

  chmod 600 "$ENV"

  grep -q 'CHANGE_ME' "$ENV" && {
    warn "Edit .env and enter SMS_API_KEY / SMS_SENDER."
    exit 1
  }

  log ".env ready"
}

deploy(){
  info "Building..."
  docker compose -f "$COMPOSE" build --no-cache

  info "Starting PostgreSQL and Redis..."
  docker compose -f "$COMPOSE" up -d postgres redis
  sleep 5

  info "Running migrations..."
  docker compose -f "$COMPOSE" run --rm backend npx prisma migrate deploy || warn "Migration failed."

  info "Starting services..."
  docker compose -f "$COMPOSE" up -d
  sleep 15

  info "Seeding..."
  docker exec ayan-backend npm run db:seed || warn "Seed failed."

  health
}

health(){
  local ok=true code

  code="$(curl -s -o /dev/null -w '%{http_code}' "http://${SERVER_IP}" 2>/dev/null || echo 000)"
  [[ "$code" =~ ^(200|301|302)$ ]] && log "Nginx: $code" || { warn "Nginx: $code"; ok=false; }

  code="$(curl -s -o /dev/null -w '%{http_code}' "http://${SERVER_IP}/api" 2>/dev/null || echo 000)"
  [[ "$code" =~ ^(200|401|403|404|405)$ ]] && log "API: $code" || { warn "API: $code"; ok=false; }

  for s in ayan-postgres ayan-redis ayan-backend ayan-frontend ayan-nginx; do
    docker ps --format '{{.Names}}' | grep -qx "$s" && log "$s: running" || { err "$s: NOT running"; ok=false; }
  done

  $ok && info "http://${SERVER_IP}" || warn "Run: ./deploy.sh status"
}

domain(){
  local d="${1:-}"
  [ -n "$d" ] || { err "Usage: ./deploy.sh domain example.com"; exit 1; }
  [ -f "$ENV" ] || { err ".env not found."; exit 1; }

  setenv CORS_ORIGINS "https://${d},http://${SERVER_IP}"
  setenv NEXT_PUBLIC_BASE_URL "https://${d}"
  setenv PUBLIC_BASE_URL "https://${d}"
  setenv NEXT_PUBLIC_API_URL ""

  docker compose -f "$COMPOSE" build --no-cache frontend
  docker compose -f "$COMPOSE" up -d
  health
}

status(){
  docker compose -f "$COMPOSE" ps
  echo
  curl -s -o /dev/null -w "http://${SERVER_IP} → %{http_code}\n" "http://${SERVER_IP}" || true
  curl -s -o /dev/null -w "http://${SERVER_IP}/api → %{http_code}\n" "http://${SERVER_IP}/api" || true
}

logs(){
  [ -n "${1:-}" ] && docker compose -f "$COMPOSE" logs -f "$1" || docker compose -f "$COMPOSE" logs -f --tail=100
}

case "${1:-deploy}" in
  deploy) install_docker; ensure_env; deploy ;;
  domain) domain "${2:-}" ;;
  status) status ;;
  logs) logs "${2:-}" ;;
  down) docker compose -f "$COMPOSE" down ;;
  restart) docker compose -f "$COMPOSE" restart; sleep 5; health ;;
  *) echo "Usage: ./deploy.sh [deploy|domain|status|logs|down|restart]"; exit 1 ;;
esac
