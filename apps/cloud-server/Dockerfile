# syntax=docker/dockerfile:1
# Build context = repo root (vritti-cloud). @vritti/* resolve from public npm.

# ============================================================================
# Builder — install the pnpm workspace and build just this app via Nx
# ============================================================================
FROM node:20-alpine AS builder
WORKDIR /repo
RUN npm install -g pnpm@10.28.0

# Full workspace install (lockfile must match — regenerate after dropping the
# link: overrides). Heavy, but runs on the CI runner, never on the VM.
COPY . .
RUN pnpm install --frozen-lockfile

# Build only this project — output lands in apps/cloud-server/dist
RUN pnpm exec nx build vritti-cloud-server

# ============================================================================
# Production — prod-only deps + compiled output, non-root
# ============================================================================
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apk add --no-cache wget

# Install ONLY this app's production deps. @vritti/* come from public npm, so a
# plain npm install works without the workspace. Native modules (argon2/bcrypt)
# compile with build tools that are dropped in the same layer.
COPY --from=builder /repo/apps/cloud-server/package.json ./package.json
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
 && npm install --omit=dev --no-audit --no-fund \
 && apk del .build-deps

# Compiled application
COPY --from=builder /repo/apps/cloud-server/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs \
 && chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -q --spider http://localhost:3000/ || exit 1

CMD ["node", "dist/main.js"]
