#!/bin/sh
set -eu

# Luôn dùng proxy Nginx — không embed localhost vào bundle
cat > /usr/share/nginx/html/config.js <<'EOF'
window.__APP_CONFIG__ = { apiBaseUrl: "" };
EOF

exec nginx -g 'daemon off;'
