#!/bin/sh
# PocketBase launcher that works on both a host bind mount (docker-compose / the
# DO VPS) and a managed volume (Railway).
#
# Railway mounts the persistent volume owned by root, so a container that starts
# as the unprivileged `pocketbase` user cannot create the SQLite files → PB dies
# with "unable to open database file" (SQLITE_CANTOPEN). To stay non-root at
# runtime while still owning the volume, we start as root, fix ownership of the
# data dir, then drop to `pocketbase` via gosu. When the image is already run as
# a non-root user (nothing to fix), we just exec PB directly.
#
# We also bind PB to `[::]:8090` (IPv6, dual-stack) rather than `0.0.0.0`:
# Railway's private network — which its edge proxy uses to reach the container —
# is IPv6-only, so an IPv4-only listener answers the local healthcheck but is
# unreachable from the proxy (→ perpetual 502). `[::]` accepts both families.
set -e

DATA_DIR=/pb/pb_data

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  chown -R pocketbase:pocketbase "$DATA_DIR" 2>/dev/null || true
  exec gosu pocketbase /pb/pocketbase serve \
    --http=[::]:8090 --dir="$DATA_DIR" --migrationsDir=/pb/pb_migrations
fi

exec /pb/pocketbase serve \
  --http=[::]:8090 --dir="$DATA_DIR" --migrationsDir=/pb/pb_migrations
