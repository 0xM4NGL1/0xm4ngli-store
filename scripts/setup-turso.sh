#!/usr/bin/env bash
set -euo pipefail

# Creates a Turso database and prints the Vercel environment values.
# Requires the Turso CLI: https://docs.turso.tech/cli/installation
NAME="${1:-0xm4ngli-store}"

if ! command -v turso >/dev/null 2>&1; then
  echo "Install the Turso CLI first: curl -sSfL https://get.tur.so/install.sh | bash"
  exit 1
fi

turso auth login
turso db create "$NAME" || true
URL="$(turso db show "$NAME" --url)"
TOKEN="$(turso db tokens create "$NAME")"

cat <<TEXT
Add these to Vercel -> Project -> Settings -> Environment Variables:

TURSO_DATABASE_URL=$URL
TURSO_AUTH_TOKEN=$TOKEN
APP_URL=https://0xm4ngli-store.vercel.app
CART_SECRET=$(openssl rand -hex 32)
ADMIN_TOKEN=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)

Then redeploy. Never commit these values.
TEXT
