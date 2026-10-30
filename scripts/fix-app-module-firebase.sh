#!/usr/bin/env bash
set -euo pipefail
FILE="${1:-$(dirname "$0")/../facebook-clone-core/src/app.module.ts}"
FILE="$(cd "$(dirname "$FILE")" && pwd)/$(basename "$FILE")"

if [[ ! -f "$FILE" ]]; then
  echo "Không tìm thấy: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%s)"

python3 - "$FILE" << 'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")

text = re.sub(r"^import .*firebase-admin.*\r?\n", "", text, flags=re.M)
text = re.sub(
    r"\r?\n    constructor\(\) \{[\s\S]*?\r?\n    \}\r?\n(?=    configure)",
    "\n",
    text,
    count=1,
)

path.write_text(text, encoding="utf-8")

if re.search(r"credential\.cert|initializeApp", text):
    print("LỖI: app.module.ts vẫn còn Firebase — mở file và xóa constructor thủ công.")
    sys.exit(1)

print("OK:", path)
PY

echo "--- 15 dòng cuối app.module.ts ---"
tail -15 "$FILE"
