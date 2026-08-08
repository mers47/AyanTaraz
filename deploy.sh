#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Ayan Taraz — Auto-Deploy Script (1405)
# ═══════════════════════════════════════════════════════════════════════════
# استفاده:
#   ./deploy.sh              → دیپلوی کامل (IP-First: 202.133.91.13)
#   ./deploy.sh domain <dom> → فعال‌سازی دامنه (مثال: ./deploy.sh domain ayantaraz.com)
#   ./deploy.sh status       → بررسی وضعیت سرویس‌ها
#   ./deploy.sh logs         → مشاهده لاگ‌ها
#   ./deploy.sh down         → توقف همه سرویس‌ها
#   ./deploy.sh restart      → راه‌اندازی مجدد
#
# پیش‌نیازها: Ubuntu/Debian با دسترسی root/sudo
# اسکریپت به‌صورت خودکار Docker و Docker Compose را نصب می‌کند.
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[ℹ]${NC} $1"; }

# ── Config ──
SERVER_IP="202.133.91.13"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="$SCRIPT_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"

cd "$SCRIPT_DIR"

# ═══════════════════════════════════════════════════════════════════════════
# 1. INSTALL DOCKER (if not present)
# ═══════════════════════════════════════════════════════════════════════════
install_docker() {
  if command -v docker &>/dev/null; then
    log "Docker is already installed: $(docker --version)"
    return 0
  fi

  info "Installing Docker..."
  # Try official script first
  if curl -fsSL https://get.docker.com | sh; then
    log "Docker installed via official script"
  else
    warn "Official script failed, trying apt..."
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    log "Docker installed via apt"
  fi

  systemctl enable docker
  systemctl start docker
  log "Docker service started"
}

# ═══════════════════════════════════════════════════════════════════════════
# 2. ENSURE .env EXISTS
# ═══════════════════════════════════════════════════════════════════════════
ensure_env() {
  if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
      warn ".env یافت نشد — از .env.example کپی شد."
      cp "$ENV_EXAMPLE" "$ENV_FILE"
      warn "⚠️  فایل .env را ویرایش کنید و مقادیر CHANGE_ME را جای‌گذاری کنید:"
      warn "   nano $ENV_FILE"
      warn "   سپس دوباره اجرا کنید: ./deploy.sh"
      exit 1
    else
      err "نه .env و نه .env.example یافت نشد! در دایرکتوری صحیح هستید؟"
      exit 1
    fi
  fi

  # Check for placeholder values
  if grep -q "CHANGE_ME" "$ENV_FILE"; then
    warn "⚠️  فایل .env شامل مقادیر CHANGE_ME است!"
    warn "   لطفاً مقادیر زیر را جای‌گذاری کنید:"
    grep "CHANGE_ME" "$ENV_FILE" | sed 's/^/     /'
    warn ""
    warn "   برای JWT_SECRET تصادفی:"
    warn "   openssl rand -hex 32"
    warn ""
    warn "   پس از ویرایش، دوباره اجرا کنید: ./deploy.sh"
    exit 1
  fi

  log ".env is configured (no placeholder values found)"
}

# ═══════════════════════════════════════════════════════════════════════════
# 3. BUILD & DEPLOY (IP-First)
# ═══════════════════════════════════════════════════════════════════════════
deploy() {
  info "Building and deploying Ayan Taraz (IP-First: $SERVER_IP)..."

  # Verify NEXT_PUBLIC_API_URL is empty (critical for Nginx proxy to work)
  if grep -q "^NEXT_PUBLIC_API_URL=.\\+" "$ENV_FILE" 2>/dev/null; then
    warn "NEXT_PUBLIC_API_URL should be EMPTY for production behind Nginx. Fixing..."
    sed -i 's/^NEXT_PUBLIC_API_URL=.*/NEXT_PUBLIC_API_URL=/' "$ENV_FILE"
  fi

  # Build all services
  info "Building Docker images (this may take several minutes on first run)..."
  docker compose -f "$COMPOSE_FILE" build --no-cache

  # Start infrastructure first
  info "Starting PostgreSQL and Redis..."
  docker compose -f "$COMPOSE_FILE" up -d postgres redis
  sleep 5

  # Run migrations
  info "Running database migrations..."
  docker compose -f "$COMPOSE_FILE" run --rm backend npx prisma migrate deploy 2>/dev/null || warn "Migration step: check logs if issues"

  # Start all services
  info "Starting all services..."
  docker compose -f "$COMPOSE_FILE" up -d

  # Wait for services to be healthy
  info "Waiting for services to become healthy..."
  sleep 15

  # Seed database with 1405 tax law data
  info "Seeding database with 1405 tax law data..."
  docker exec ayan-backend npm run db:seed 2>/dev/null || warn "Seed: may need manual run — docker exec ayan-backend npm run db:seed"

  # Health checks
  health_check
}

# ═══════════════════════════════════════════════════════════════════════════
# 4. DOMAIN MODE — Switch from IP to domain
# ═══════════════════════════════════════════════════════════════════════════
switch_domain() {
  local domain="$1"
  if [ -z "$domain" ]; then
    err "Usage: ./deploy.sh domain <your-domain.com>"
    exit 1
  fi

  info "Switching to domain: $domain"

  if [ ! -f "$ENV_FILE" ]; then
    err ".env not found. Run ./deploy.sh first."
    exit 1
  fi

  # Update CORS_ORIGINS, NEXT_PUBLIC_BASE_URL, PUBLIC_BASE_URL in .env
  sed -i "s|^CORS_ORIGINS=.*|CORS_ORIGINS=https://$domain,http://$SERVER_IP|" "$ENV_FILE"
  sed -i "s|^NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=https://$domain|" "$ENV_FILE"
  sed -i "s|^PUBLIC_BASE_URL=.*|PUBLIC_BASE_URL=https://$domain|" "$ENV_FILE"

  log "Updated .env for domain: $domain"
  info "Rebuilding frontend with new domain config..."
  docker compose -f "$COMPOSE_FILE" build --no-cache frontend
  docker compose -f "$COMPOSE_FILE" up -d

  info ""
  info "══════════════════════════════════════════════════════════"
  info "  ✅ Domain mode activated!"
  info "  ─────────────────────────────────────────────────────"
  info "  🌐 Frontend: https://$domain"
  info "  🔌 API:      https://$domain/api"
  info ""
  warn "  برای HTTPS، باید SSL/TLS را فعال کنید:"
  warn "  1. رکورد DNS دامنه را به $SERVER_IP اشاره دهید"
  warn "  2. Certbot/Let's Encrypt را روی Nginx نصب کنید"
  warn "  یا از Cloudflare برای SSL رایگان استفاده کنید"
  info "══════════════════════════════════════════════════════════"

  health_check
}

# ═══════════════════════════════════════════════════════════════════════════
# 5. HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════
health_check() {
  info "Running health checks..."
  local all_ok=true

  # Check Nginx (port 80)
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP" 2>/dev/null || echo "000")
  if echo "$http_code" | grep -q "200\|301\|302"; then
    log "Nginx (port 80): OK (HTTP $http_code)"
  else
    warn "Nginx (port 80): HTTP $http_code — may still be starting"
    all_ok=false
  fi

  # Check Backend API
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP/api" 2>/dev/null || echo "000")
  if echo "$http_code" | grep -q "200\|404"; then
    log "Backend API (/api): OK (HTTP $http_code)"
  else
    warn "Backend API (/api): HTTP $http_code — may still be starting"
    all_ok=false
  fi

  # Check containers
  echo ""
  info "Container status:"
  for svc in ayan-postgres ayan-redis ayan-backend ayan-frontend ayan-nginx; do
    if docker ps --format '{{.Names}}' | grep -q "^${svc}$"; then
      log "  $svc: running"
    else
      err "  $svc: NOT running"
      all_ok=false
    fi
  done

  if [ "$all_ok" = true ]; then
    info ""
    info "══════════════════════════════════════════════════════════"
    info "  ✅ Deployment successful!"
    info "  ─────────────────────────────────────────────────────"
    info "  🌐 URL:      http://$SERVER_IP"
    info "  🔌 API:      http://$SERVER_IP/api"
    info "  📊 Status:   ./deploy.sh status"
    info "  📋 Logs:     ./deploy.sh logs"
    info "  🌍 Domain:   ./deploy.sh domain yourdomain.com"
    info "══════════════════════════════════════════════════════════"
  else
    warn ""
    warn "Some services may still be starting. Wait 30s and run:"
    warn "  ./deploy.sh status"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════
# 6. STATUS / LOGS / DOWN / RESTART
# ═══════════════════════════════════════════════════════════════════════════
show_status() {
  info "Service status:"
  docker compose -f "$COMPOSE_FILE" ps
  echo ""
  info "Health endpoints:"
  for url in "http://$SERVER_IP" "http://$SERVER_IP/api"; do
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    echo "  $url → HTTP $code"
  done
}

show_logs() {
  local svc="${1:-}"
  if [ -n "$svc" ]; then
    docker compose -f "$COMPOSE_FILE" logs -f "$svc"
  else
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100
  fi
}

down() {
  warn "Stopping all services..."
  docker compose -f "$COMPOSE_FILE" down
  log "All services stopped"
}

restart() {
  info "Restarting services..."
  docker compose -f "$COMPOSE_FILE" restart
  log "Services restarted"
  sleep 5
  health_check
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════
main() {
  local cmd="${1:-deploy}"

  case "$cmd" in
    deploy)
      install_docker
      ensure_env
      deploy
      ;;
    domain)
      switch_domain "${2:-}"
      ;;
    status)
      show_status
      ;;
    logs)
      show_logs "${2:-}"
      ;;
    down)
      down
      ;;
    restart)
      restart
      ;;
    *)
      echo "Ayan Taraz Deploy Script (1405)"
      echo ""
      echo "Usage:"
      echo "  ./deploy.sh              Deploy full stack (IP-First: $SERVER_IP)"
      echo "  ./deploy.sh domain <dom> Switch to domain mode"
      echo "  ./deploy.sh status       Show service status"
      echo "  ./deploy.sh logs [svc]   Show logs (optionally for specific service)"
      echo "  ./deploy.sh down         Stop all services"
      echo "  ./deploy.sh restart      Restart all services"
      echo ""
      exit 1
      ;;
  esac
}

main "$@"
