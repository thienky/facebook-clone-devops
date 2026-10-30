#!/usr/bin/env bash
set -euo pipefail
FE="${1:-$HOME/facebook-clone-core/facebook-clone-fe}"
ROOT="$(dirname "$(dirname "$FE")")"

echo "Deploy FE at $FE"

mkdir -p "$FE/src/lib" "$FE/public"

cat > "$FE/src/lib/api.ts" << 'EOF'
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

export type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: Record<string, unknown>;
};
EOF

cat > "$FE/nginx.conf" << 'EOF'
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
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

cat > "$FE/docker-entrypoint.sh" << 'EOF'
#!/bin/sh
set -eu
printf '%s\n' 'window.__APP_CONFIG__={apiBaseUrl:""};' > /usr/share/nginx/html/config.js
exec nginx -g 'daemon off;'
EOF
chmod +x "$FE/docker-entrypoint.sh"

cat > "$FE/public/config.js" << 'EOF'
window.__APP_CONFIG__ = { apiBaseUrl: "" };
EOF

grep -q 'config.js' "$FE/index.html" || sed -i '/<div id="root"><\/div>/a\    <script src="/config.js"><\/script>' "$FE/index.html"

cat > "$FE/Dockerfile" << 'EOF'
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci 2>/dev/null || npm install
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
EOF

cd "$ROOT"
docker compose build --no-cache facebook_clone_fe
docker compose up -d --force-recreate facebook_clone_fe
sleep 3
curl -sf "http://127.0.0.1:3001/home"
echo
curl -sf "http://127.0.0.1:3001/config.js"
echo
