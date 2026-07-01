# syntax=docker/dockerfile:1
#
# PocketBase — single-binary backend. The binary committed to this repo is a
# local (macOS) build, so the image downloads the pinned Linux release instead.
# debian:bookworm-slim (not alpine) for glibc compatibility with the PB binary.

FROM debian:bookworm-slim

ARG PB_VERSION=0.36.3
ARG TARGETARCH=amd64

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates unzip wget gosu \
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

# Create the unprivileged runtime user. PB runs as `pocketbase` (uid 1001), but
# the container STARTS as root so the entrypoint can chown a root-owned mounted
# volume (Railway) before dropping privileges with gosu — see entrypoint.sh.
RUN useradd --system --uid 1001 --no-create-home pocketbase \
 && mkdir -p /pb/pb_data \
 && chown -R pocketbase:pocketbase /pb

COPY entrypoint.sh /pb/entrypoint.sh
RUN chmod +x /pb/entrypoint.sh

EXPOSE 8090
# NB: no `VOLUME` instruction — persistence is provided by the host bind mount
# (docker-compose `volumes:`) or a Railway Volume. Railway's builder rejects the
# Docker `VOLUME` directive outright, and docker-compose overrides it anyway, so
# declaring it here buys nothing.

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:8090/api/health || exit 1

ENTRYPOINT ["/pb/entrypoint.sh"]
