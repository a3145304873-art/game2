#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Ensuring wasm32 target..."
rustup target add wasm32-unknown-unknown 2>/dev/null || true

echo "==> Ensuring wasm-bindgen-cli..."
cargo install wasm-bindgen-cli 2>/dev/null || true

echo "==> Building WASM release..."
cargo build --target wasm32-unknown-unknown --release

echo "==> Running wasm-bindgen..."
mkdir -p pkg
wasm-bindgen \
    "target/wasm32-unknown-unknown/release/arcade-bevy.wasm" \
    --out-dir pkg \
    --target web \
    --no-typescript

if command -v wasm-opt >/dev/null; then
    echo "==> Optimizing with wasm-opt..."
    wasm-opt -Oz pkg/arcade-bevy_bg.wasm -o pkg/arcade-bevy_bg.wasm
fi

cp pkg/arcade-bevy.js     . 2>/dev/null || true
cp pkg/arcade-bevy_bg.wasm . 2>/dev/null || true

echo "==> Done. Serve this directory (e.g., ./serve.sh or python3 -m http.server 8080)."
