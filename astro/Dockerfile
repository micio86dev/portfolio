# syntax=docker/dockerfile:1
#
# Astro 5 frontend — built static client + @astrojs/node standalone server.
# The runtime stage runs the Node server (it also serves dist/client), so the
# server-rendered /api/contact endpoint works. No secrets are baked in: only
# PB_URL / SITE_URL are passed as build args (both are public values).

# ── Stage 1: build ────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install full deps first (cached unless the lockfile changes).
COPY package.json package-lock.json ./
RUN npm ci

# Build-time config. PB_URL is the PocketBase base URL the build fetches
# projects/services from (falls back to bundled seed data if unreachable);
# SITE_URL is the canonical origin for <link rel="canonical">, hreflang, sitemap.
ARG PB_URL=""
ARG SITE_URL="http://localhost:4321"
ENV PB_URL=${PB_URL} \
    SITE_URL=${SITE_URL}

COPY . .
RUN npm run build

# ── Stage 2: production dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Stage 3: runtime ──────────────────────────────────────────────────
FROM node:20-alpine AS runtime
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
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:4321/ || exit 1

CMD ["node", "./dist/server/entry.mjs"]
