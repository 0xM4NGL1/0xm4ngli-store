#!/usr/bin/env bash
set -euo pipefail

# Prints fresh secrets for Vercel. Add each line in Vercel -> Settings ->
# Environment Variables, then redeploy. Never commit the real values.
cat <<TEXT
ADMIN_TOKEN=$(openssl rand -hex 32)
CART_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)
TEXT
