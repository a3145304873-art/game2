# Visual Flow to UI Complete Toolkit

This bundle contains the full working chain for screenshot-led UI reconstruction:

1. `visual-flow-to-ui` — workflow owner: state mapping, asset reuse, interaction contract, delivery acceptance.
2. `visual-to-spec` — evidence-based visual specification and component boundaries.
3. `frontend-design` — responsive implementation and reusable component quality.
4. `imagegen` — missing high-quality raster scenes, frames, ornaments, or items.
5. `control-in-app-browser` — browser-based visual and click-path QA.

## Install the skills

Copy the folders below into the receiving Codex installation's skills directory, normally `~/.codex/skills/`:

```text
skills/visual-flow-to-ui
skills/visual-to-spec
skills/frontend-design
skills/imagegen
```

Restart or refresh Codex after copying so it discovers the skills.

## Browser QA prerequisite

`browser-runtime/` is included so the Browser QA portion is auditable and complete. It needs Codex's Browser plugin/runtime to actually control a tab; a copied skill cannot create that platform capability by itself.

On a Codex installation that already provides the Browser plugin, use its installed `control-in-app-browser` skill and runtime. The included files document the exact expected skill and bridge layout for review or managed deployment.

## What the main skill now enforces

- Asset deduplication and manifest-backed component reuse before generation.
- ImageGen for missing complex visual materials; DOM for all variable text and values.
- An interaction map covering every visible clickable surface.
- Separation of decorative layers from semantic hit targets.
- Actual browser clicks for all choices, modals, navigation, and return paths.
- Reference-size and narrow-screen visual QA before delivery.

See `BUNDLE-MANIFEST.json` for exact contents and environment limitations.
