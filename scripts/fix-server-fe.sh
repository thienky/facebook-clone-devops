#!/usr/bin/env bash
# Rebuild frontend Next.js (facebook-clone-fe) and recreate the container.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"
docker compose build --no-cache facebook_clone_fe
docker compose up -d --force-recreate facebook_clone_fe
sleep 4

echo "--- curl ---"
curl -sf -o /dev/null -w "FE HTTP %{http_code}\n" "http://127.0.0.1:3001/" || echo "FAIL FE :3001"
echo "Trình duyệt: http://127.0.0.1:3001"
