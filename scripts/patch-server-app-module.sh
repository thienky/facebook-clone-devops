#!/usr/bin/env bash
# Sửa tạm container/image cũ: xóa Firebase trong dist/app.module.js (chỉ khi chưa sync source mới)
set -euo pipefail

FILE="${1:-./facebook-clone-core/dist/app.module.js}"
if [[ ! -f "$FILE" ]]; then
  echo "Không thấy $FILE — hãy sync source mới và docker compose build --no-cache"
  exit 1
fi

python3 <<'PY'
from pathlib import Path
import re
path = Path("""'"$FILE"'""".strip('"'))
text = path.read_text(encoding="utf-8")
# Xóa constructor nếu còn initializeApp / credential.cert
new = re.sub(
    r"constructor\(\)\s*\{[\s\S]*?credential\.cert[\s\S]*?\}\s*\}",
    "constructor() {}",
    text,
    count=1,
)
if new == text:
    print("Không tìm thấy block Firebase — có thể đã patch hoặc cần build lại từ source.")
else:
    path.write_text(new, encoding="utf-8")
    print("Đã patch", path)
PY

echo "Chạy: docker compose build --no-cache facebook_clone_api && docker compose up -d facebook_clone_api"
