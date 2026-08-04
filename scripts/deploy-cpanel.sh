#!/usr/bin/env bash
# =============================================================================
# Master Touch — cPanel / Passenger deployment preparation
# Builds Next.js (Webpack + standalone) and assembles the Passenger runtime tree.
# Usage (on the VPS, from the application root):
#   bash scripts/deploy-cpanel.sh
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Master Touch cPanel deploy"
echo "    Root: $ROOT"
echo "    Node: $(node -v 2>/dev/null || echo 'missing')"
echo "    npm:  $(npm -v 2>/dev/null || echo 'missing')"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required (use Node 20 on cPanel)." >&2
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo "ERROR: Node.js 20+ required (found $(node -v))." >&2
  exit 1
fi

echo ""
echo "==> 1/5 npm install (includes build tooling)"
# cPanel often sets NODE_ENV=production on the app; that would skip
# devDependencies (Tailwind, TypeScript, ESLint) and break `next build`.
# Install with build tooling, then keep production mode for the build itself.
npm install --include=dev

echo ""
echo "==> 2/5 production build (Webpack + standalone)"
export NODE_ENV=production
npm run build

STANDALONE="$ROOT/.next/standalone"
STATIC_SRC="$ROOT/.next/static"
PUBLIC_SRC="$ROOT/public"
SERVER_JS="$STANDALONE/server.js"

if [[ ! -f "$SERVER_JS" ]]; then
  echo "ERROR: Missing $SERVER_JS after build." >&2
  exit 1
fi

echo ""
echo "==> 3/5 copy static assets into standalone"
mkdir -p "$STANDALONE/.next"
rm -rf "$STANDALONE/.next/static"
cp -R "$STATIC_SRC" "$STANDALONE/.next/static"

echo ""
echo "==> 4/5 copy public/ into standalone"
rm -rf "$STANDALONE/public"
cp -R "$PUBLIC_SRC" "$STANDALONE/public"

echo ""
echo "==> 5/5 optimize standalone size"
# Drop source maps (not needed at runtime)
find "$STANDALONE" -type f \( -name '*.map' -o -name '*.tsbuildinfo' \) -delete 2>/dev/null || true
# Drop Next.js build cache if accidentally present inside standalone
rm -rf "$STANDALONE/.next/cache" 2>/dev/null || true

# Verify required tree
MISSING=0
for path in \
  "$SERVER_JS" \
  "$STANDALONE/.next/static" \
  "$STANDALONE/public" \
  "$ROOT/server.js"
do
  if [[ ! -e "$path" ]]; then
    echo "ERROR: Required path missing: $path" >&2
    MISSING=1
  fi
done

if [[ "$MISSING" -ne 0 ]]; then
  exit 1
fi

BUILD_ID="unknown"
if [[ -f "$STANDALONE/.next/BUILD_ID" ]]; then
  BUILD_ID="$(tr -d '\r\n' < "$STANDALONE/.next/BUILD_ID")"
elif [[ -f "$ROOT/.next/BUILD_ID" ]]; then
  BUILD_ID="$(tr -d '\r\n' < "$ROOT/.next/BUILD_ID")"
fi

VERSION="$(node -p "require('./package.json').version" 2>/dev/null || echo '0.1.0')"

STATIC_COUNT="$(find "$STANDALONE/.next/static" -type f 2>/dev/null | wc -l | tr -d ' ')"
PUBLIC_COUNT="$(find "$STANDALONE/public" -type f 2>/dev/null | wc -l | tr -d ' ')"

echo ""
echo "=============================================="
echo " Deployment summary"
echo "=============================================="
echo " App version     : $VERSION"
echo " Build ID        : $BUILD_ID"
echo " Standalone      : $STANDALONE"
echo " server.js       : OK ($SERVER_JS)"
echo " Root entry      : $ROOT/server.js (Passenger)"
echo " Static files    : $STATIC_COUNT"
echo " Public files    : $PUBLIC_COUNT"
echo " Start command   : node server.js   (or npm run start)"
echo " Health check    : GET /api/health"
echo ""
echo " Next steps on cPanel:"
echo "  1. Set Application root to this project folder"
echo "  2. Set Application startup file to: server.js"
echo "  3. Set Node.js version to 20.x"
echo "  4. Add production env vars (see docs/CPANEL_DEPLOYMENT.md)"
echo "  5. Restart the Node.js app in cPanel"
echo "=============================================="
