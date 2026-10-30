#!/usr/bin/env bash
# Tắt Firebase trên VPS khi thiếu/sai credential (tránh API Restarting)
set -euo pipefail

ENV_FILE="${1:-./facebook-clone-core/.env.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Không tìm thấy $ENV_FILE"
  exit 1
fi

grep -q '^PORT=' "$ENV_FILE" || echo 'PORT=3301' >> "$ENV_FILE"

sed -i.bak '/^FIREBASE_/d' "$ENV_FILE"
echo "Đã xóa FIREBASE_* khỏi $ENV_FILE (backup: ${ENV_FILE}.bak)"
echo "Chạy tiếp: docker compose up -d --build --force-recreate facebook_clone_api"
