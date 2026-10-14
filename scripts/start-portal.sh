#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

set -a
. ./.env.local
set +a

# The portal uses the existing VM Postgres server but its own database. When a
# dedicated URL is not set locally, reuse the VM-only connection configuration.
if [[ -z "${PORTAL_DATABASE_URL:-}" && -z "${DATABASE_URL:-}" ]]; then
  postgres_env="/home/lightship/.openclaw/workspace/lightship-success-tracker/.env.postgres"
  if [[ -f "$postgres_env" ]]; then
    set -a
    . "$postgres_env"
    set +a
  fi
fi

exec node dist/index.js
