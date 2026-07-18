# ============================================================
# TERA EXAM — API Server Dockerfile
# Multi-stage build: build → production
# ============================================================

# --- Stage 1: Builder ---
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /workspace

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all packages
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Install ALL dependencies (including devDeps for build)
RUN pnpm install --frozen-lockfile

# Build the API server
RUN pnpm --filter @workspace/api-server run build

# --- Stage 2: Production ---
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S -u 1001 -G nodejs teraexam

WORKDIR /app

# Copy built artifacts
COPY --from=builder /workspace/artifacts/api-server/dist ./dist
COPY --from=builder /workspace/artifacts/api-server/package.json ./package.json

# Install production deps only
RUN pnpm install --prod --frozen-lockfile

# Switch to non-root user
USER teraexam

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
