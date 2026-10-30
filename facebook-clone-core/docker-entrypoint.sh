#!/bin/sh
set -eu

echo "=== facebook_clone_api startup ==="
echo "PORT=${PORT:-unset}"
echo "DB_POSTGRES_HOST=${DB_POSTGRES_HOST:-unset}"
echo "FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-<empty>}"

exec node dist/main
