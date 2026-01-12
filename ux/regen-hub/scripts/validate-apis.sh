#!/usr/bin/env bash
set -euo pipefail

# Validate that the running Regen Hub can reach its configured upstreams.
#
# Usage:
#   REGEN_HUB_URL=http://localhost:3000 bash scripts/validate-apis.sh
#
# Notes:
# - This script hits the *UI* endpoints (/regen-api/* and /api/koi/*), so it
#   validates Next rewrites/proxies in addition to upstream behavior.

BASE_URL=${REGEN_HUB_URL:-http://localhost:3000}

green() { printf "\033[32m%s\033[0m\n" "$*"; }
red() { printf "\033[31m%s\033[0m\n" "$*"; }
header() { printf "\n== %s ==\n" "$*"; }

require() {
  command -v "$1" >/dev/null 2>&1 || {
    red "Missing required command: $1";
    exit 1;
  }
}

require curl

header "Regen Hub base"
echo "BASE_URL=$BASE_URL"

check_get() {
  local path=$1
  header "GET $path"
  local url="${BASE_URL%/}${path}"

  # Show status + small body preview.
  local status
  status=$(curl -sS -o /tmp/regen_hub_validate_body --write-out "%{http_code}" "$url" || true)
  echo "HTTP $status"

  if [[ "$status" =~ ^2 ]]; then
    green "OK"
  else
    red "FAIL"
  fi

  head -c 500 /tmp/regen_hub_validate_body || true
  echo
}

check_post_json() {
  local path=$1
  local payload=$2
  header "POST $path"
  local url="${BASE_URL%/}${path}"

  local status
  status=$(curl -sS -o /tmp/regen_hub_validate_body --write-out "%{http_code}" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$url" || true)
  echo "HTTP $status"

  if [[ "$status" =~ ^2 ]]; then
    green "OK"
  else
    red "FAIL"
  fi

  head -c 500 /tmp/regen_hub_validate_body || true
  echo
}

check_get "/regen-api/projects"
check_get "/regen-api/rewards"
check_get "/regen-api/governance/actions"

check_post_json "/api/koi/chat" '{"messages":[{"role":"user","content":"healthcheck"}]}'

header "Done"
green "If any calls failed, confirm your .env values and that the upstreams are reachable from the environment running Next.js."
