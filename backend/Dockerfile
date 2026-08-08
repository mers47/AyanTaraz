FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# --allow-scripts lets the @prisma/client postinstall download the query-engine
# binary at install time so the Redis/Prisma-backed build (ioredis + Prisma)
# does not fail with a missing engine at `npm run build` / `prisma:generate`.
RUN npm ci --allow-scripts

COPY . .
RUN npm run build
RUN npm run prisma:generate

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig*.json ./

EXPOSE 4000

CMD ["node", "dist/main"]
