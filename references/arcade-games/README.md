# 🕹️ Arcade Hub

A lightweight collection of classic arcade games implemented in multiple technologies, starting from vanilla JavaScript and progressively ported to compiled languages with native and WebAssembly backends.

> This project was created as a zero-shot experiment to explore how far a single conversational prompt can take a codebase — from browser-based prototypes to a compiled Rust/Bevy bundle that runs everywhere.

> ⚠️ **Vibe-coded warning** — This repository was built almost entirely via conversational AI prompts in a single session. It is not a serious, production-grade, or actively maintained project. Expect rough edges, missing features, and no long-term support. Fork and fix at your own leisure!

---

## ✨ What's Inside

| Game | Description |
|------|-------------|
| **Snake** | The timeless classic. Eat food, grow longer, don't crash. |
| **Breakout** | Destroy all bricks with a bouncing ball. Don't let it fall. |

---

## 📁 Project Structure

```
.
├── web/            # Vanilla JavaScript + HTML5 Canvas (original)
├── raylib/         # C + Raylib port (native desktop)
└── bevy/           # Rust + Bevy port (native desktop + WASM web)
```

### `web/` — Browser (original)
Self-contained HTML/JS games served by a small shell script.

```bash
cd web
./serve.sh        # http://localhost:8080
```

### `raylib/` — Native C (desktop)
Requires [Raylib](https://www.raylib.com/) development libraries.

```bash
cd raylib
make              # builds ./arcade
make run          # play directly
```

### `bevy/` — Rust (desktop + WebAssembly)
A modern rewrite using [Bevy](https://bevyengine.org/) that compiles to both a native binary and a WASM module runnable in any browser.

#### Native
```bash
cd bevy
cargo run --release
```

#### WebAssembly
```bash
cd bevy
./build.sh        # installs wasm target & wasm-bindgen if needed
./serve.sh        # http://localhost:8080
```

After building, open `bevy/index.html` (or serve the folder) to play the exact same game in your browser with no plugins required.

---

## 🎮 Controls

| Action | Keys |
|--------|------|
| Move (Snake / Paddle) | `↑ ↓ ← →` or `W A S D` |
| Select game on Hub | `1` (Snake), `2` (Breakout), or **Click** |
| Return to Hub | `Escape` |

---

## 🏆 Score Persistence

- **`web/`** — `localStorage` in the browser.
- **`raylib/`** — `.arcade_scores` file next to the binary.
- **`bevy/`** — `.arcade_scores` on desktop; `localStorage` when running in WASM.

---

## 🛠️ Tech Stack

| Layer | Technology | Output |
|-------|------------|--------|
| Web (classic) | JavaScript + HTML5 Canvas | Browser |
| Native (C) | C11 + Raylib | Linux / macOS / Windows binary |
| Modern + Web | Rust + Bevy 0.14 + WebGL2 | Native binary + WASM |

---

## 📦 Build Requirements

### Web (no build)
Any modern browser + Python 3 / Node for `serve.sh`.

### Raylib (C)
- `gcc`
- `raylib` + system libraries (`-lraylib -lm -lpthread -ldl -lrt -lX11`)

### Bevy (Rust)
- [Rust toolchain](https://rustup.rs/) (1.75+)
- `wasm32-unknown-unknown` target (auto-installed by `build.sh`)
- `wasm-bindgen-cli` (auto-installed by `build.sh`)
- `wasm-opt` (optional, for smaller binaries)

---

## 🚀 Quick Start

```bash
# Clone
git clone <repo-url>
cd arcade-games

# Run whichever version you prefer

# --- Web (original) ---
cd web && ./serve.sh

# --- Native C ---
cd raylib && make run

# --- Rust + WebAssembly ---
cd bevy && ./build.sh && ./serve.sh
```

Open your browser at the printed localhost URL.

---

## 🤝 License

MIT — feel free to fork, port, and expand the arcade.
