#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export BUILD_REVISION="rebuild-$(date +%s)"

echo "BUILD_REVISION=$BUILD_REVISION"
docker compose build --no-cache --progress=plain facebook_clone_api
docker compose up -d --force-recreate facebook_clone_api

sleep 8
docker ps --filter name=facebook_clone_api
echo "--- logs ---"
docker logs facebook_clone_api --tail 40
echo "--- curl ---"
curl -sf "http://127.0.0.1:3301/home" && echo
