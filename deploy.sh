#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Ayan Taraz — Auto-Deploy Script (1405) — Fully Automated
# ═══════════════════════════════════════════════════════════════
# استفاده:
#   ./deploy.sh              → دیپلوی کامل (IP-First) + تولید خودکار .env
#   ./deploy.sh domain <dom> → فعال‌سازی دامنه + SSL خودکار (Certbot)
#   ./deploy.sh ssl <dom>    → فقط نصب SSL روی دامنه موجود
#   ./deploy.sh status       → بررسی وضعیت سرویس‌ها
#   ./deploy.sh logs [svc]   → مشاهده لاگ‌ها
#   ./deploy.sh down         → توقف همه سرویس‌ها
#   ./deploy.sh restart      → راه‌اندازی مجدد
#   ./deploy.sh reset        → توقف + حذف دیتابیس (خطر!)
#
# پیش‌نیازها: Ubuntu/Debian با دسترسی root/sudo
# اسکریپت به‌صورت خودکار:
#   - Docker و Docker Compose را نصب می‌کند
#   - فایل .env را با پسوردها و کلیدهای تصادفی امن تولید می‌کند
#   - فقط شماره موبایل ادمین و کلید SMS API را از شما می‌پرسد
#   - دیتابیس را migrate و seed می‌کند
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GOLD='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[ℹ]${NC} $1"; }
gold() { echo -e "${GOLD}$1${NC}"; }
cyan() { echo -e "${CYAN}$1${NC}"; }
banner() {
  echo -e "${GOLD}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GOLD}║${NC}  $1  ${GOLD}║${NC}"
  echo -e "${GOLD}╚════════════════════════════════════════════════════════════╝${NC}"
}

# ── Config ──
SERVER_IP="${SERVER_IP:-$(curl -s --max-time 5 ifconfig.me 2>/dev/null || echo 'localhost')}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="$SCRIPT_DIR/.env"

cd "$SCRIPT_DIR"

# ═══════════════════════════════════════════════════════════════
# 1. INSTALL DOCKER (if not present)
# ═══════════════════════════════════════════════════════════════
install_docker() {
  if command -v docker &>/dev/null && docker compose version &>/dev/null; then
    log "Docker is already installed: $(docker --version)"
    return 0
  fi

  info "Installing Docker..."
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

# ═══════════════════════════════════════════════════════════════
# 2. GENERATE .env AUTOMATICALLY
# ═══════════════════════════════════════════════════════════════
# This function creates a complete .env with all passwords, JWT
# secrets, and keys generated automatically using openssl.
# The user only needs to fill in API keys AFTER the script runs.
generate_env() {
  # If .env already exists and has no placeholders, keep it
  if [ -f "$ENV_FILE" ] && ! grep -q "CHANGE_ME\|PLACEHOLDER\|__GENERATE__" "$ENV_FILE" 2>/dev/null; then
    log ".env already configured (no placeholders found)"
    return 0
  fi

  # Backup old .env if exists
  if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$SCRIPT_DIR/.env.bak.$(date +%s)"
    warn "Old .env backed up to .env.bak.*"
  fi

  banner "تولید خودکار فایل .env"
  echo ""

  # ── Generate all secrets automatically ──
  info "Generating secure random secrets..."

  local PG_PASSWORD JWT_SECRET

  # PostgreSQL password — 32 chars alphanumeric
  PG_PASSWORD=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 32)
  if [ -z "$PG_PASSWORD" ]; then
    # Fallback if openssl not available
    apt-get install -y openssl >/dev/null 2>&1 || true
    PG_PASSWORD=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 32)
  fi
  [ -z "$PG_PASSWORD" ] && PG_PASSWORD="Ayan$(date +%s)Taraz$(head -c 16 /dev/urandom | xxd -p | head -c 16)"
  log "PostgreSQL password generated"

  # JWT secret — 64 hex chars (256-bit)
  JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
  [ -z "$JWT_SECRET" ] && JWT_SECRET="$(date +%s)$(head -c 48 /dev/urandom | xxd -p)"
  log "JWT secret generated (256-bit)"

  echo ""
  info "All internal secrets generated automatically."
  echo ""

  # ── Ask user for super-admin phone number ──
  echo -e "${CYAN}━━━ اطلاعات ادمین ━━━${NC}"
  echo ""
  echo -e "  شماره موبایل ادمین ارشد (برای ورود به پنل ادمین):"
  echo -e "  ${YELLOW}فرمت: 989121234567 (با کد کشور، بدون + و بدون ۰ اول)${NC}"
  echo -e "  اگر چند شماره است، با کاما جدا کنید."
  echo ""
  local admin_phones=""
  while true; do
    read -rp "$(echo -e ${BOLD}'  شماره موبایل ادمین: '${NC})" admin_phones
    if [ -n "$admin_phones" ]; then
      # Basic validation
      if echo "$admin_phones" | grep -qP '^98\d{10}(,98\d{10})*$'; then
        log "شماره ادمین تأیید شد: $admin_phones"
        break
      else
        warn "فرمت صحیح: 989121234567 — لطفاً دوباره وارد کنید (بدون +، با کد کشور 98)"
      fi
    else
      warn "لطفاً حداقل یک شماره وارد کنید (یا 'skip' برای رد کردن)"
      read -rp "$(echo -e ${BOLD}'  شماره موبایل ادمین: '${NC})" admin_phones
      if [ "$admin_phones" = "skip" ] || [ -n "$admin_phones" ]; then
        break
      fi
    fi
  done

  echo ""
  echo -e "${CYAN}━━━ کلیدهای API (اختیاری — بعداً هم می‌توانید اضافه کنید) ━━━${NC}"
  echo ""
  echo -e "  ${YELLOW}اگر الان کلید SMS API ندارید، Enter بزنید تا خالی بماند.${NC}"
  echo -e "  بدون SMS API، کد OTP فقط در لاگ کنسول نمایش داده می‌شود."
  echo -e "  می‌توانید بعداً این مقادیر را در فایل .env ویرایش کنید."
  echo ""

  local sms_url sms_key sms_sender
  read -rp "$(echo -e '  SMS API URL (اینتر=خالی): ')" sms_url
  read -rp "$(echo -e '  SMS API Key  (اینتر=خالی): ')" sms_key
  read -rp "$(echo -e '  SMS Sender   (اینتر=خالی): ')" sms_sender

  echo ""

  # ── Write the complete .env file ──
  info "Writing .env file..."

  cat > "$ENV_FILE" <<EOF
# ═══════════════════════════════════════════════════════════════
# Ayan Taraz — Production Environment (Auto-Generated)
# ═══════════════════════════════════════════════════════════════
# این فایل توسط deploy.sh به‌صورت خودکار تولید شده است.
# تاریخ تولید: $(date '+%Y-%m-%d %H:%M:%S')
#
# ⚠️  این فایل را هرگز در Git commit نکنید!
# ⚠️  مقادیر زیر محرمانه هستند — با دقت نگه دارید.
#
# ── کلیدهای API که باید جای‌گذاری کنید ──
# اگر در زمان اجرای deploy.sh خالی گذاشتید، بعداً این بخش را ویرایش کنید:
#   nano .env
#   سپس: ./deploy.sh restart

# ── General ──
NODE_ENV=production
PORT=4000

# ── Database (PostgreSQL) ──
POSTGRES_USER=ayan_user
POSTGRES_PASSWORD=${PG_PASSWORD}
POSTGRES_DB=ayan_taraz
DATABASE_URL=postgresql://ayan_user:${PG_PASSWORD}@postgres:5432/ayan_taraz?schema=public

# ── Redis ──
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# ── Auth / JWT ──
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=86400

# ── CORS ──
CORS_ORIGINS=http://${SERVER_IP},http://localhost

# ── Frontend (Next.js) ──
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_BASE_URL=http://${SERVER_IP}
PUBLIC_BASE_URL=http://${SERVER_IP}

# ── Seed super-admin phone numbers ──
SEED_SUPER_ADMIN_PHONES=${admin_phones}

# ── SMS Provider (Kavenegar / Farapayamak / etc.) ──
# 🔑 این مقادیر را با کلید API سرویس پیامک خود جای‌گذاری کنید
# اگر خالی باشد، OTP فقط در لاگ کنسول نمایش داده می‌شود
SMS_API_URL=${sms_url}
SMS_API_KEY=${sms_key}
SMS_SENDER=${sms_sender}

# ── Upload paths ──
UPLOAD_DIR=/app/uploads
EOF

  chmod 600 "$ENV_FILE"
  log ".env file created with secure permissions (600)"

  echo ""
  banner "فایل .env آماده شد!"
  echo ""
  if [ -z "$sms_key" ]; then
    warn "⚠️  SMS API خالی است — کد OTP فقط در لاگ کنسول نشان داده می‌شود"
    warn "   برای فعال‌سازی پیامک واقعی، بعداً ویرایش کنید:"
    cyan "   nano .env   →   بخش SMS_API_URL / SMS_API_KEY / SMS_SENDER"
    cyan "   ./deploy.sh restart"
    echo ""
  fi
  log "پسوردها و کلیدها به‌صورت خودکار تولید شدند ✅"
  if [ -n "$sms_key" ]; then
    log "کلید SMS API تنظیم شد ✅"
  fi
  log "شماره ادمین ارشد تنظیم شد ✅"
  echo ""
}

# ═══════════════════════════════════════════════════════════════
# 3. BUILD & DEPLOY (IP-First)
# ═══════════════════════════════════════════════════════════════
deploy() {
  info "Building and deploying Ayan Taraz (IP-First: $SERVER_IP)..."

  # Verify NEXT_PUBLIC_API_URL is empty (critical for Nginx proxy)
  if grep -q "^NEXT_PUBLIC_API_URL=.\+" "$ENV_FILE" 2>/dev/null; then
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

# ═══════════════════════════════════════════════════════════════
# 4. DOMAIN MODE — Switch from IP to domain + SSL
# ═══════════════════════════════════════════════════════════════
switch_domain() {
  local domain="$1"
  if [ -z "$domain" ]; then
    err "Usage: ./deploy.sh domain <your-domain.com>"
    exit 1
  fi

  banner "فعال‌سازی دامنه: $domain"
  echo ""

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

  echo ""
  info "Waiting for services to restart..."
  sleep 10

  # Auto-install SSL with Certbot
  install_ssl "$domain"

  health_check
}

# ═══════════════════════════════════════════════════════════════
# 4b. INSTALL SSL — Certbot / Let's Encrypt
# ═══════════════════════════════════════════════════════════════
install_ssl() {
  local domain="$1"
  if [ -z "$domain" ]; then
    err "Usage: ./deploy.sh ssl <your-domain.com>"
    exit 1
  fi

  banner "نصب SSL/TLS برای $domain"
  echo ""

  # Check if DNS resolves to this server
  local resolved_ip
  resolved_ip=$(dig +short "$domain" 2>/dev/null | head -1 || getent hosts "$domain" | awk '{print $1}' || echo "")
  if [ -z "$resolved_ip" ]; then
    warn "DNS برای $domain تنظیم نشده است!"
    warn "ابتدا رکورد A دامنه را به IP زیر اشاره دهید:"
    gold "  $SERVER_IP"
    echo ""
    warn "سپس منتظر ۵-۱۰ دقیقه تا DNS propagate شود و دوباره اجرا کنید:"
    cyan "  ./deploy.sh ssl $domain"
    return 1
  fi

  info "DNS: $domain → $resolved_ip"
  if [ "$resolved_ip" != "$SERVER_IP" ]; then
    warn "IP DNS ($resolved_ip) با IP سرور ($SERVER_IP) مطابقت ندارد!"
    warn "اگر از Cloudflare پراکسی استفاده می‌کنید، این طبیعی است."
    warn "در غیر این صورت، رکورد DNS را اصلاح کنید."
    echo ""
    warn "ادامه با Cloudflare mode — Certbot نیاز به DNS direct دارد."
    warn "اگر Cloudflare پراکسی فعال است (نارنجی)، آن را خاکستری کنید."
    read -rp "$(echo -e ${BOLD}'  ادامه می‌دهید؟ (y/N): '${NC})" confirm
    [ "$confirm" != "y" ] && [ "$confirm" != "Y" ] && return 1
  fi

  # Install certbot if needed
  if ! command -v certbot &>/dev/null; then
    info "Installing Certbot..."
    apt-get update -y
    apt-get install -y certbot python3-certbot-nginx
    log "Certbot installed"
  else
    log "Certbot already installed"
  fi

  # We need to stop nginx temporarily to free port 80 for certbot standalone
  # OR use --nginx plugin if nginx is on host. Since our nginx is in Docker,
  # we use webroot or standalone mode.

  # Create SSL directory
  mkdir -p "$SCRIPT_DIR/nginx/ssl"

  info "Obtaining SSL certificate via Let's Encrypt..."
  info "(Nginx will be temporarily stopped on port 80)"

  # Stop nginx container to free port 80
  docker compose -f "$COMPOSE_FILE" stop nginx 2>/dev/null || true
  sleep 2

  # Obtain certificate using standalone mode
  if certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    -d "$domain" 2>&1; then

    log "SSL certificate obtained for $domain"

    # Copy certs to nginx/ssl directory for Docker mount
    cp "/etc/letsencrypt/live/$domain/fullchain.pem" "$SCRIPT_DIR/nginx/ssl/fullchain.pem"
    cp "/etc/letsencrypt/live/$domain/privkey.pem" "$SCRIPT_DIR/nginx/ssl/privkey.pem"
    chmod 644 "$SCRIPT_DIR/nginx/ssl/fullchain.pem"
    chmod 600 "$SCRIPT_DIR/nginx/ssl/privkey.pem"

    log "Certificates copied to nginx/ssl/"

    # Update nginx config for HTTPS
    update_nginx_ssl "$domain"

    # Update docker-compose to expose port 443 and mount SSL certs
    update_compose_ssl

    # Restart nginx with SSL
    docker compose -f "$COMPOSE_FILE" up -d nginx
    sleep 5

    # Set up auto-renewal cron
    setup_ssl_renewal "$domain"

    log "SSL is now active!"
    gold "  🔒 https://$domain"
  else
    err "Failed to obtain SSL certificate"
    warn "Restarting nginx without SSL..."
    docker compose -f "$COMPOSE_FILE" up -d nginx
    warn "You can retry later with: ./deploy.sh ssl $domain"
    return 1
  fi
}

# Update nginx.conf to serve HTTPS
update_nginx_ssl() {
  local domain="$1"
  local nginx_conf="$SCRIPT_DIR/nginx/nginx.conf"

  info "Updating nginx config for HTTPS..."

  # Backup original
  cp "$nginx_conf" "$SCRIPT_DIR/nginx/nginx.conf.nossl.bak"

  cat > "$nginx_conf" << 'NGINX_EOF'
worker_processes auto;
worker_rlimit_nofile 65535;

events {
  worker_connections 4096;
  multi_accept on;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  access_log /var/log/nginx/access.log combined buffer=32k flush=5s;
  error_log /var/log/nginx/error.log warn;

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  keepalive_requests 100;
  server_tokens off;
  client_max_body_size 25m;

  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_min_length 1024;
  gzip_buffers 16 8k;
  gzip_types
    text/plain text/css text/xml text/javascript
    application/javascript application/x-javascript
    application/json application/xml application/xml+rss
    application/atom+xml image/svg+xml font/woff2 application/manifest+json;

  upstream backend { server backend:4000; least_conn; }
  upstream frontend { server frontend:3000; least_conn; }

  limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
  limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;

  # ── HTTP → HTTPS redirect ──
  server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
  }

  # ── HTTPS (SSL) ──
  server {
    listen 443 ssl;
    http2 on;
    server_name _;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    location /api/ {
      limit_req zone=api burst=60 nodelay;
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_read_timeout 60s;
    }

    location ~ ^/api/(auth|admin)/ {
      limit_req zone=login burst=10 nodelay;
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
      proxy_pass http://backend;
      proxy_set_header Host $host;
      expires 7d;
      add_header Cache-Control "public" always;
    }

    location /_next/static/ {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      expires 1y;
      add_header Cache-Control "public, immutable" always;
    }

    location /_next/ {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      expires 30d;
      add_header Cache-Control "public" always;
    }

    location /images/ {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      expires 7d;
      add_header Cache-Control "public" always;
    }

    location ~* \.(ico|png|jpg|jpeg|webp|svg|css|js|woff2|manifest)$ {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      expires 7d;
      add_header Cache-Control "public" always;
    }

    location / {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_read_timeout 60s;
      proxy_buffering on;
      proxy_buffer_size 16k;
      proxy_buffers 8 32k;
    }
  }
}
NGINX_EOF

  log "nginx.conf updated for HTTPS"
}

# Update docker-compose.yml to add port 443 and SSL volume
update_compose_ssl() {
  info "Updating docker-compose.yml for SSL..."

  # Add SSL port and volume to nginx service
  sed -i 's|      - "80:80"|      - "80:80"\n      - "443:443"|' "$COMPOSE_FILE"

  # Add SSL volume mount if not already present
  if ! grep -q "nginx/ssl" "$COMPOSE_FILE"; then
    sed -i 's|      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro|      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro\n      - ./nginx/ssl:/etc/nginx/ssl:ro|' "$COMPOSE_FILE"
  fi

  log "docker-compose.yml updated for SSL (port 443 + cert volume)"
}

# Setup auto-renewal cron for SSL certificates
setup_ssl_renewal() {
  local domain="$1"

  info "Setting up SSL auto-renewal..."

  # Create renewal script
  cat > "$SCRIPT_DIR/scripts/renew-ssl.sh" << 'RENEW_EOF'
#!/usr/bin/env bash
# Auto-renew SSL certificate and reload nginx
set -e
DOMAIN="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

certbot renew --quiet --standalone --preferred-challenges http

# Copy renewed certs
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SCRIPT_DIR/nginx/ssl/fullchain.pem"
  cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SCRIPT_DIR/nginx/ssl/privkey.pem"
  chmod 644 "$SCRIPT_DIR/nginx/ssl/fullchain.pem"
  chmod 600 "$SCRIPT_DIR/nginx/ssl/privkey.pem"
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" exec nginx nginx -s reload 2>/dev/null || \
    docker compose -f "$SCRIPT_DIR/docker-compose.yml" restart nginx
  echo "[✓] SSL renewed and nginx reloaded for $DOMAIN"
fi
RENEW_EOF
  chmod +x "$SCRIPT_DIR/scripts/renew-ssl.sh"

  # Add cron job (runs every 12 days at 3am)
  CRON_CMD="0 3 */12 * * $SCRIPT_DIR/scripts/renew-ssl.sh $domain >> /var/log/ssl-renew.log 2>&1"
  (crontab -l 2>/dev/null | grep -v "renew-ssl.sh $domain"; echo "$CRON_CMD") | crontab -

  log "SSL auto-renewal cron installed (every 12 days at 3am)"
}

# ═══════════════════════════════════════════════════════════════
# 5. HEALTH CHECK
# ═══════════════════════════════════════════════════════════════
health_check() {
  info "Running health checks..."
  local all_ok=true

  # Check Nginx (port 80)
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$SERVER_IP" 2>/dev/null || echo "000")
  if echo "$http_code" | grep -q "200\|301\|302"; then
    log "Nginx (port 80): OK (HTTP $http_code)"
  else
    warn "Nginx (port 80): HTTP $http_code — may still be starting"
    all_ok=false
  fi

  # Check Backend API
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$SERVER_IP/api" 2>/dev/null || echo "000")
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
    echo ""
    banner "✅ دیپلوی موفقیت‌آمیز بود!"
    echo ""
    gold "  🌐 URL:      http://$SERVER_IP"
    gold "  🔌 API:      http://$SERVER_IP/api"
    echo ""
    cyan "  📊 Status:   ./deploy.sh status"
    cyan "  📋 Logs:     ./deploy.sh logs"
    cyan "  🌍 Domain:   ./deploy.sh domain yourdomain.com"
    cyan "  🔒 SSL:      ./deploy.sh ssl yourdomain.com"
    echo ""

    # Show admin info
    local admin_phones
    admin_phones=$(grep "^SEED_SUPER_ADMIN_PHONES=" "$ENV_FILE" 2>/dev/null | cut -d= -f2)
    if [ -n "$admin_phones" ]; then
      gold "  👤 ادمین ارشد: $admin_phones"
      cyan "  ورود به پنل: http://$SERVER_IP/admin"
      echo ""
    fi

    # Check if SMS is configured
    if grep -q "^SMS_API_KEY=$\|^SMS_API_KEY=CHANGE" "$ENV_FILE" 2>/dev/null; then
      warn "  ⚠️  SMS API تنظیم نشده — برای فعال‌سازی پیامک واقعی:"
      cyan "     nano .env  →  بخش SMS_API_URL / SMS_API_KEY / SMS_SENDER"
      cyan "     ./deploy.sh restart"
      echo ""
    fi
  else
    echo ""
    warn "Some services may still be starting. Wait 30s and run:"
    cyan "  ./deploy.sh status"
  fi
}

# ═══════════════════════════════════════════════════════════════
# 6. STATUS / LOGS / DOWN / RESTART / RESET
# ═══════════════════════════════════════════════════════════════
show_status() {
  banner "وضعیت سرویس‌ها"
  echo ""
  info "Containers:"
  docker compose -f "$COMPOSE_FILE" ps 2>/dev/null || err "docker compose not running"
  echo ""
  info "Health endpoints:"
  for url in "http://$SERVER_IP" "http://$SERVER_IP/api"; do
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    if echo "$code" | grep -q "200\|301\|302\|404"; then
      log "  $url → HTTP $code"
    else
      err "  $url → HTTP $code"
    fi
  done
  echo ""

  # Disk usage of Docker
  info "Docker disk usage:"
  docker system df 2>/dev/null | head -5
  echo ""
}

show_logs() {
  local svc="${1:-}"
  if [ -n "$svc" ]; then
    info "Logs for: $svc"
    docker compose -f "$COMPOSE_FILE" logs -f "$svc"
  else
    info "Logs for all services (last 100 lines, following):"
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

reset() {
  banner "⚠️  ریست کامل — حذف دیتابیس!"
  echo ""
  warn "این عملیات تمام داده‌ها را حذف می‌کند:"
  warn "  - دیتابیس PostgreSQL"
  warn "  - کش Redis"
  warn "  - فایل‌های آپلود شده"
  warn "  - کانتینرها و ایمیج‌ها"
  echo ""
  read -rp "$(echo -e ${RED}${BOLD}'  آیا مطمئن هستید؟ تایپ کنید: DELETE EVERYTHING '${NC})" confirm
  if [ "$confirm" = "DELETE EVERYTHING" ]; then
    err "Deleting everything..."
    docker compose -f "$COMPOSE_FILE" down -v --rmi all
    log "Everything deleted. Run ./deploy.sh to start fresh."
  else
    warn "انصراف شد — چیزی حذف نشد."
  fi
}

# ═══════════════════════════════════════════════════════════════
# 7. SHOW HELP
# ═══════════════════════════════════════════════════════════════
show_help() {
  banner "Ayan Taraz — اسکریپت دیپلوی"
  echo ""
  echo -e "${BOLD}استفاده:${NC}"
  echo ""
  echo -e "  ${GREEN}./deploy.sh${NC}              دیپلوی کامل + تولید خودکار .env"
  echo -e "  ${GREEN}./deploy.sh domain <dom>${NC} فعال‌سازی دامنه + SSL خودکار"
  echo -e "  ${GREEN}./deploy.sh ssl <dom>${NC}    فقط نصب SSL روی دامنه موجود"
  echo -e "  ${GREEN}./deploy.sh status${NC}       بررسی وضعیت سرویس‌ها"
  echo -e "  ${GREEN}./deploy.sh logs [svc]${NC}   مشاهده لاگ‌ها (اختیاری: سرویس خاص)"
  echo -e "  ${GREEN}./deploy.sh down${NC}         توقف همه سرویس‌ها"
  echo -e "  ${GREEN}./deploy.sh restart${NC}      راه‌اندازی مجدد"
  echo -e "  ${GREEN}./deploy.sh reset${NC}        ${RED}حذف کامل دیتابیس + کانتینرها${NC}"
  echo ""
  echo -e "${BOLD}ویژگی‌های خودکار:${NC}"
  echo -e "  ✓ نصب خودکار Docker"
  echo -e "  ✓ تولید خودکار پسوردها و کلیدهای امن"
  echo -e "  ✓ فقط شماره موبایل ادمین و کلید SMS از شما پرسیده می‌شود"
  echo -e "  ✓ Migrate و Seed خودکار دیتابیس"
  echo -e "  ✓ SSL خودکار با Certbot برای دامنه"
  echo -e "  ✓ تمدید خودکار SSL (هر ۱۲ روز)"
  echo ""
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
main() {
  # Check root
  if [ "$(id -u)" -ne 0 ]; then
    warn "توصیه: با sudo اجرا کنید — بعضی عملیات نیاز به root دارند"
  fi

  local cmd="${1:-deploy}"

  case "$cmd" in
    deploy)
      install_docker
      generate_env
      deploy
      ;;
    domain)
      switch_domain "${2:-}"
      ;;
    ssl)
      install_ssl "${2:-}"
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
    reset)
      reset
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      err "دستور ناشناخته: $cmd"
      echo ""
      show_help
      exit 1
      ;;
  esac
}

main "$@"
