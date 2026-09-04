#!/usr/bin/env bash
# Idempotent Cloud Agent install for the Yaarzo (BooBubble) app.
# This is a Bun-native TanStack Start + Supabase project: bun.lock and
# bunfig.toml are the authoritative package-manager state.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# --- 1. Bun (package manager + runtime) --------------------------------------
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
fi

# --- 2. Node 22 LTS (>= 22.20) -----------------------------------------------
# The exec harness ships Node 22.14, which has a require(ESM) cycle bug that
# breaks @lovable.dev/vite-tanstack-config (vite.config.ts fails to load).
# Node 22.20+ fixes it. Provide a modern node/npm/npx ahead of the harness node
# by symlinking into ~/.bun/bin (prepended to PATH via ~/.bashrc).
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install 22 >/dev/null
NODE22_BIN="$(dirname "$(nvm which 22)")"
mkdir -p "$BUN_INSTALL/bin"
ln -sf "$NODE22_BIN/node" "$BUN_INSTALL/bin/node"
ln -sf "$NODE22_BIN/npm"  "$BUN_INSTALL/bin/npm"
ln -sf "$NODE22_BIN/npx"  "$BUN_INSTALL/bin/npx"

# --- 3. Project dependencies (bun.lock) --------------------------------------
bun install

echo "[install] bun $(bun --version) | node $("$BUN_INSTALL/bin/node" -v) | deps installed"
