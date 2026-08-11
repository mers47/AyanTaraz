# ============================================================================
# Ayan Taraz — Frontend (Next.js standalone)
# Multi-stage build: builder (full toolchain) → runner (lean production)
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir -p public
RUN npm run build

# ---- Lean production runner (standalone output) ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# ── Healthcheck dependency ───────────────────────────────────────────────
# Alpine does NOT include wget by default.  The docker-compose healthcheck
# uses `wget --spider` so we must install it here, otherwise the healthcheck
# always fails and the container is marked unhealthy.
RUN apk add --no-cache wget

# Copy the standalone server bundle + static assets + public folder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# ── Healthcheck (Docker-native) ──────────────────────────────────────────
# Checks the Next.js server is responding.  Also declared in docker-compose
# but kept in the Dockerfile for self-documentation.
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=20s \
  CMD wget --spider -q http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
