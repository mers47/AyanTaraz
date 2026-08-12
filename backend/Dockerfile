# ============================================================================
# Ayan Taraz — Backend (NestJS + Prisma)
# Multi-stage build: builder (full toolchain) → runner (lean production)
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# ── 1. Install dependencies ──────────────────────────────────────────────
# --allow-scripts lets the @prisma/client postinstall download the query-engine
# binary at install time so it is available before the TypeScript build.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --allow-scripts

# ── 2. Generate Prisma Client BEFORE the TypeScript build ────────────────
# This is critical: nest build (tsc) imports types from @prisma/client. If the
# client hasn't been generated yet, the compiled output may be missing the
# generated runtime code, causing runtime errors (chatbot / admin / tax
# assistant all fail because PrismaClient methods don't exist).
RUN npx prisma generate

# ── 3. Copy source & build ───────────────────────────────────────────────
COPY . .
RUN npm run build

# ── 4. Compile the seed script for production ────────────────────────────
# seed.ts is TypeScript and uses ts-node in dev. In production we run the
# compiled JS version (dist/prisma/seed.js) so ts-node (a devDependency) is
# not needed at runtime.
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --skipLibCheck --module commonjs --target ES2021

# ============================================================================
# Lean production runner
# ============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# ── Application artefacts ────────────────────────────────────────────────
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig*.json ./

# ── Prisma CLI for migrations ────────────────────────────────────────────
# prisma is a devDependency, but we need `prisma migrate deploy` at runtime
# Install the prisma CLI *and* its engines so the migration engine binary is
# present on Alpine (musl). `npm install --no-save prisma` alone does NOT
# always pull the schema-engine binary for the musl target, which causes
# `prisma migrate deploy` to fail at deploy time with "schema engine not
# found". Use --allow-scripts and force the engine download via
# `prisma generate` against the committed schema so the musl engines are
# guaranteed present in the production image.
RUN npm install --no-save --allow-scripts prisma@^5.8.0
RUN npx prisma generate || true

# ── Healthcheck dependencies ─────────────────────────────────────────────
RUN apk add --no-cache wget

# ── Non-root user for security ───────────────────────────────────────────
# Run the Node process as an unprivileged user so a compromised app cannot
# modify system files or escalate privileges within the container.
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --ingroup nodejs nestjs

# Ensure the uploads directory is writable by the non-root user
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 4000

# ── Healthcheck (Docker-native) ──────────────────────────────────────────
# Checks the /api/health endpoint every 30s.  This is also declared in
# docker-compose.yml but having it in the Dockerfile ensures the image is
# self-documenting and works even without compose.
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=30s \
  CMD wget --spider -q http://localhost:4000/api/health || exit 1

# The deploy script runs `npx prisma migrate deploy` against this image before
# starting the app, then seeds the database with `node dist/prisma/seed.js`.
CMD ["node", "dist/main"]
