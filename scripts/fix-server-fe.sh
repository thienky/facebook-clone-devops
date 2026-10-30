#!/usr/bin/env bash
# Chạy trên VPS: bash scripts/fix-server-fe.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FE="$ROOT/facebook-clone-fe"

echo "==> Fix FE tại $FE"
mkdir -p "$FE/public" "$FE/src/lib" "$FE/src/pages"

cat > "$FE/src/lib/api.ts" << 'API'
import axios from 'axios';

declare global {
  interface Window {
    __APP_CONFIG__?: { apiBaseUrl?: string };
  }
}

export function getApiBaseUrl(): string {
  const runtime = window.__APP_CONFIG__?.apiBaseUrl;
  if (runtime !== undefined && runtime !== null) {
    return String(runtime).trim();
  }
  const fromEnv = import.meta.env.VITE_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim();
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3301';
  }
  return '';
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function setAccessToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('access_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('access_token');
  }
}

const saved = localStorage.getItem('access_token');
if (saved) setAccessToken(saved);

export type HomeResponse = { message: string };
API

FE="$FE" python3 << 'PY'
import os
from pathlib import Path
hp = Path(os.environ["FE"]) / "src/pages/HomePage.tsx"
if hp.exists():
    t = hp.read_text(encoding="utf-8")
    if "getApiBaseUrl" not in t:
        t = t.replace(
            "import { api, type HomeResponse }",
            "import { api, getApiBaseUrl, type HomeResponse }",
        )
        t = t.replace(
            "import.meta.env.VITE_API_URL ?? 'http://localhost:3301'",
            "getApiBaseUrl() || window.location.origin",
        )
        if "getApiBaseUrl()" not in t:
            t = t.replace(
                "const apiUrl =",
                "const apiUrl = getApiBaseUrl() || window.location.origin; const _unused =",
            )
        hp.write_text(t, encoding="utf-8")
PY

cat > "$FE/nginx.conf" << 'NGINX'
resolver 127.0.0.11 valid=30s ipv6=off;
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location /backend/ {
        set $u http://facebook_clone_api:3301;
        proxy_pass $u$request_uri;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    location = /home {
        set $u http://facebook_clone_api:3301;
        proxy_pass $u/home;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    location /api/ {
        set $u http://facebook_clone_api:3301;
        proxy_pass $u$request_uri;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    location / { try_files $uri $uri/ /index.html; }
}
NGINX

cat > "$FE/docker-entrypoint.sh" << 'ENTRY'
#!/bin/sh
set -eu
echo 'window.__APP_CONFIG__={apiBaseUrl:""};' > /usr/share/nginx/html/config.js
exec nginx -g 'daemon off;'
ENTRY
chmod +x "$FE/docker-entrypoint.sh"

cat > "$FE/public/config.js" << 'CFG'
window.__APP_CONFIG__ = { apiBaseUrl: "" };
CFG

IDX="$FE/index.html"
grep -q config.js "$IDX" || sed -i '/<div id="root"><\/div>/a\    <script src="/config.js"><\/script>' "$IDX"

cat > "$FE/Dockerfile" << 'DOCKER'
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci || npm install
COPY . .
ENV VITE_API_URL=
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
DOCKER

cd "$ROOT"
docker compose build --no-cache facebook_clone_fe
docker compose up -d --force-recreate facebook_clone_fe
sleep 4

echo "--- curl ---"
curl -s "http://127.0.0.1:3001/home" || echo "FAIL /home via FE"
curl -s "http://127.0.0.1:3001/config.js" | head -1

echo "Trình duyệt: http://192.168.105.125:3001 (Ctrl+Shift+R)"
