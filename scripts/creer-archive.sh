#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="rihla-platform-$(date +%Y%m%d)"
OUT="${ROOT}/../${NAME}.zip"
cd "$ROOT/.."
echo ""
echo "  Archive Rihla — ${NAME}.zip"
zip -r "$OUT" "rihla-platform" \
  -x "rihla-platform/node_modules/*" \
  -x "rihla-platform/server/node_modules/*" \
  -x "rihla-platform/dist/*" \
  -x "rihla-platform/server/data/*" \
  -x "rihla-platform/server/.env" \
  -x "rihla-platform/.env" \
  -x "rihla-platform/.DS_Store" \
  -x "rihla-platform/**/.DS_Store" \
  -x "rihla-platform/*.zip" \
  -x "rihla-platform/rihla-platform-*.zip" \
  > /dev/null
echo "  OK : $OUT ($(du -h "$OUT" | cut -f1))"
echo ""
