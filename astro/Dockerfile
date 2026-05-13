# syntax=docker/dockerfile:1
#
# Astro 5 frontend — SSR (output: 'server') via the @astrojs/node standalone
# adapter. The runtime stage runs the server entrypoint (`dist/server/entry.mjs`)
# under Bun, which also serves the static client assets. PocketBase is reached at
# runtime via PUBLIC_PB_URL (injected by the compose `environment:` block) — NOT
# baked in at build time. The only build arg is SITE_URL (canonical/hreflang/
# sitemap), which is a public value.

# ── Stage 1: build ────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Install full deps first (cached unless the lockfile changes).
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build-time config: canonical origin for <link rel="canonical">, hreflang, sitemap.
ARG SITE_URL="http://localhost:4321"
ENV SITE_URL=${SITE_URL}

COPY . .
RUN bun run build

# ── Stage 2: production dependencies ──────────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ── Stage 3: runtime ──────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

# The Bun image has no built-in non-root app user — create one (uid/gid 1001).
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S astro -G nodejs

COPY --from=deps    --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/dist          ./dist
COPY --chown=astro:nodejs package.json ./

USER astro
EXPOSE 4321
# `/` renders even if PocketBase is unreachable (seed-data fallback), so this
# checks the server is up without coupling liveness to PocketBase.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:4321/ || exit 1

CMD ["bun", "./dist/server/entry.mjs"]
