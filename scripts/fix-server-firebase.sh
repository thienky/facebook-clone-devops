#!/usr/bin/env bash
# Chạy trên VPS: bash scripts/fix-server-firebase.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/facebook-clone-core"
SRC="$APP/src"

echo "==> Fix Firebase crash (AppModule) tại $APP"

mkdir -p "$SRC/utils/firebase"
cat > "$SRC/utils/firebase/ensure-firebase-admin.ts" << 'EOF'
import { getApps, initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

export function ensureFirebaseAdmin(): boolean {
    if (getApps().length > 0) {
        return true;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')?.trim();

    if (!projectId || !clientEmail || !privateKey) {
        return false;
    }

    try {
        initializeApp({
            credential: credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        return true;
    } catch (error) {
        console.warn(
            'Firebase init failed:',
            error instanceof Error ? error.message : error,
        );
        return false;
    }
}
EOF

python3 << PY
from pathlib import Path
import re

p = Path("$SRC/app.module.ts")
text = p.read_text(encoding="utf-8")
text = re.sub(r"^import .*firebase-admin.*\n", "", text, flags=re.M)
text = re.sub(
    r"\n    constructor\(\) \{[\s\S]*?\n    \}\n(?=    configure)",
    "\n",
    text,
    count=1,
)
p.write_text(text, encoding="utf-8")
print("Patched", p)
PY

if ! grep -q ensureFirebaseAdmin "$SRC/modules/backend/auth/auth.service.ts" 2>/dev/null; then
  sed -i.bak "/import \* as nodemailer/a import { ensureFirebaseAdmin } from 'src/utils/firebase/ensure-firebase-admin';" \
    "$SRC/modules/backend/auth/auth.service.ts" 2>/dev/null || true
fi

sed -i.bak '/^FIREBASE_/d' "$APP/.env.production" 2>/dev/null || true
grep -q '^PORT=3301' "$APP/.env.production" || echo 'PORT=3301' >> "$APP/.env.production"

echo "==> Verify (phải không in gì):"
grep "credential.cert\|initializeApp" "$SRC/app.module.ts" && exit 1 || echo "app.module.ts OK"

cd "$ROOT"
export BUILD_REVISION="fix-$(date +%s)"
docker compose build --no-cache --progress=plain facebook_clone_api
docker compose up -d --force-recreate facebook_clone_api
sleep 12
docker logs facebook_clone_api --tail 20
curl -sf "http://127.0.0.1:3301/home" && echo
