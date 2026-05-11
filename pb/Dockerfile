# syntax=docker/dockerfile:1
#
# PocketBase — single-binary backend. The binary committed to this repo is a
# local (macOS) build, so the image downloads the pinned Linux release instead.
# debian:bookworm-slim (not alpine) for glibc compatibility with the PB binary.

FROM debian:bookworm-slim

ARG PB_VERSION=0.36.3
ARG TARGETARCH=amd64

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates unzip wget \
 && rm -rf /var/lib/apt/lists/* \
 && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" -O /tmp/pb.zip \
 && unzip /tmp/pb.zip -d /pb \
 && rm /tmp/pb.zip \
 && chmod +x /pb/pocketbase \
 # Optional hardening: verify the SHA256 against the checksum published on the
 # PocketBase release page before the unzip step above.
 && apt-get purge -y --auto-remove unzip

WORKDIR /pb

# Versioned schema migrations — committed to the repo, applied with `migrate up`.
COPY pb_migrations ./pb_migrations

# Run as a non-root user. The host directory bound to /pb/pb_data must be
# writable by this uid (see README "VPS layout").
RUN useradd --system --uid 1001 --no-create-home pocketbase \
 && mkdir -p /pb/pb_data \
 && chown -R pocketbase:pocketbase /pb
USER pocketbase

EXPOSE 8090
VOLUME ["/pb/pb_data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:8090/api/health || exit 1

CMD ["/pb/pocketbase", "serve", \
     "--http=0.0.0.0:8090", \
     "--dir=/pb/pb_data", \
     "--migrationsDir=/pb/pb_migrations"]
