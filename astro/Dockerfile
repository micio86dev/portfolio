# syntax=docker/dockerfile:1
#
# Astro 5 frontend — SSR (output: 'server') via the @astrojs/node standalone
# adapter. The runtime stage runs the Node server (`dist/server/entry.mjs`),
# which also serves the static client assets. PocketBase is reached at runtime
# via PUBLIC_PB_URL (injected by the compose `environment:` block) — NOT baked
# in at build time. The only build arg is SITE_URL (canonical/hreflang/sitemap),
# which is a public value.

# ── Stage 1: build ────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# Install full deps first (cached unless the lockfile changes).
COPY package.json package-lock.json ./
RUN npm ci

# Build-time config: canonical origin for <link rel="canonical">, hreflang, sitemap.
ARG SITE_URL="http://localhost:4321"
ENV SITE_URL=${SITE_URL}

COPY . .
RUN npm run build

# ── Stage 2: production dependencies ──────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Stage 3: runtime ──────────────────────────────────────────────────
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

# `node` is a built-in non-root user in the official image.
COPY --from=deps    --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist          ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 4321
# `/` renders even if PocketBase is unreachable (seed-data fallback), so this
# checks the Node server is up without coupling liveness to PocketBase.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:4321/ || exit 1

CMD ["node", "./dist/server/entry.mjs"]
