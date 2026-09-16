#!/usr/bin/env bash
# Sync gateway from repo to production VPS. Does NOT init git in /opt/yaarzo/gateway.
set -euo pipefail

VPS="${VPS_HOST:-yaarzo-vps}"
REMOTE_DIR="/opt/yaarzo/gateway"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"

echo "==> Backing up live gateway on ${VPS}"
ssh "$VPS" "cp -a ${REMOTE_DIR}/index.js ${REMOTE_DIR}/index.js.bak-${STAMP} 2>/dev/null || true; mkdir -p ${REMOTE_DIR}/lib"

echo "==> Uploading gateway index + lib modules"
scp "${REPO_ROOT}/gateway-index-vps.js" "${VPS}:${REMOTE_DIR}/index.js"
scp "${REPO_ROOT}/scripts/gateway/irc-room-discovery.cjs" "${VPS}:${REMOTE_DIR}/lib/irc-room-discovery.cjs"
scp "${REPO_ROOT}/scripts/gateway/irc-moderation.cjs" "${VPS}:${REMOTE_DIR}/lib/irc-moderation.cjs"
scp "${REPO_ROOT}/scripts/gateway/irc-nick.cjs" "${VPS}:${REMOTE_DIR}/lib/irc-nick.cjs"
scp "${REPO_ROOT}/scripts/gateway/irc-guest-auth.cjs" "${VPS}:${REMOTE_DIR}/lib/irc-guest-auth.cjs"
scp "${REPO_ROOT}/scripts/gateway/irc-pm.cjs" "${VPS}:${REMOTE_DIR}/lib/irc-pm.cjs"
scp "${REPO_ROOT}/scripts/gateway/irc-user-session.cjs" "${VPS}:${REMOTE_DIR}/lib/irc-user-session.cjs"
scp "${REPO_ROOT}/scripts/gateway/irc-names.cjs" "${VPS}:${REMOTE_DIR}/lib/irc-names.cjs"

echo "==> Syntax check"
ssh "$VPS" "node --check ${REMOTE_DIR}/index.js"

echo "==> Restart gateway container"
ssh "$VPS" "docker restart yaarzo-gateway"

echo "==> Health check"
sleep 3
ssh "$VPS" "curl -fsS http://127.0.0.1:3000/health | head -c 400; echo"
ssh "$VPS" "curl -fsS http://127.0.0.1:3000/rooms | head -c 400; echo"

echo "Done. Backup: index.js.bak-${STAMP}"
