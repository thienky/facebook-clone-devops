#!/usr/bin/env bash
# Chạy trên VPS: bash scripts/verify-stack.sh
set -euo pipefail

HOST="${1:-127.0.0.1}"

echo "=== API trực tiếp :3301 ==="
curl -sf "http://${HOST}:3301/home" && echo || echo "FAIL :3301/home"

echo "=== API qua Nginx FE :3001 ==="
curl -sf "http://${HOST}:3001/home" && echo || echo "FAIL :3001/home (proxy)"

echo "=== config.js FE ==="
curl -sf "http://${HOST}:3001/config.js" && echo

echo "=== Container logs API (10 dòng) ==="
docker logs facebook_clone_api --tail 10 2>&1 || true
