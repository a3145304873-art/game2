---
name: visual-flow-to-ui
description: Reconstruct screenshot-led UI flows as reusable, interactive HTML/CSS/JS: deduplicate reference assets, plan an image-backed component library, map page states and controls, then visually and behaviorally QA every transition. Use for batches of UI screenshots, game flows, UI mockups, or requests to 拆图、查重、拆素材、复用资产、还原页面、搭交互、分页面存 HTML、整合流程、持续追加新截图. Do not use for a single static image or a purely textual wireframe.
---

# Visual Flow to UI

Build a maintainable, screenshot-faithful interactive flow. The deliverable is not a collage of screens: every visible control must have a deliberate hit target and a verified result.

## Required companion skills

- Use `visual-to-spec` when extracting layout evidence, component boundaries, or tokens from screenshots.
- Use `frontend-design` for implementation decisions and responsive UI quality.
- Use `imagegen` for complex, illustration-quality visual assets that are missing from the existing component library.
- Use the available browser-control skill for final visual and interaction QA.

Read [references/project-contract.md](references/project-contract.md) before creating or extending a project. Read [references/asset-generation.md](references/asset-generation.md) before generating imagery. Read [references/interaction-qa.md](references/interaction-qa.md) before writing interactive code or browser QA. Read [references/qa-checklist.md](references/qa-checklist.md) before final packaging.

## Working rules

1. **The reference is the visual source of truth.** Do not invent navigation, controls, or decoration absent from it. Treat uncertain areas as assumptions and record them.
2. **Separate appearance from interaction.** Raster scenes, frames, lights, and ornaments are decorative layers with `pointer-events: none`; the actual button, card, panel, or hotspot is a semantic DOM control above them.
3. **Never bake editable information into an image.** Labels, counters, card ranks, names, response text, and values are DOM. Generated assets must be empty of variable text.
4. **Reuse before generating.** Reuse the same visual asset and the same component when role, silhouette, material, and behavior match. A changed page state does not automatically justify a new asset.
5. **Choose the right rendering medium.** Use existing assets first; use ImageGen for missing complex frames, ornaments, textures, character/scene art, or item illustrations; use CSS/SVG only for simple geometry, glows, particles, separators, and state effects. Do not redraw a complex hand-painted frame with ad hoc CSS when an image asset is appropriate.
6. **A visible control is a contract.** It needs a stable ID, semantic label, hit target, action, success state, keyboard behavior, and a browser-verified click path.

## Workflow

### 1. Stabilize and inspect the batch

- Copy supplied images unchanged into `source-references/` with stable semantic names; record source filename, dimensions, and aspect ratio.
- Create a contact sheet for batches over three screenshots, then crop evidence for backgrounds, characters, panels, buttons, cards, headers, and state-only overlays.
- Read existing `manifests/` before adding a new batch. Run `scripts/index_assets.py <project-root>` before proposing generation.

### 2. Produce the visual and interaction contracts before coding

- Classify each screenshot as a new page or a state of an existing page. Use a separate page only when navigation, persistent shell, or information architecture materially changes. Model temporary overlays, selection, dialogue, and results as states.
- Build a state matrix in `manifests/pages.json`.
- Create `analysis/interaction-map.md` using [references/interaction-qa.md](references/interaction-qa.md). List every visible actionable surface—not merely primary CTAs—with its DOM ID, label, target state/action, success signal, and expected hit region.
- If the screenshot needs measurement or component evidence, produce/update the `03_visual_spec/` contract with `visual-to-spec` before implementation.

### 3. Build the reusable visual library

- Inventory assets by visual role: scene/background, character/pose, frame, plaque/button, card/item, ornament, icon, and effect.
- Compare exact hashes, normalized perceptual similarity, local crops, then semantic identity. Record the decision in `manifests/assets.json` and `manifests/reuse-map.json`.
- Prefer an approved shared component over a new one. Generate only the unmatched visual contract.
- For ImageGen, create one reusable asset per request; specify empty content, exact intended role, aspect ratio, material, and alpha requirement. Keep generated text out of the asset. Inspect alpha, crop bounds, and edge quality before copying a selected version into `shared/assets/`.
- Preserve source/prompt intent, version, use sites, and whether an asset is user-provided, generated, or code-native in the manifest.

### 4. Implement in independent layers

- Keep opaque scene art in the scene layer and use absolute canvas coordinates for image-led/mobile UI.
- Implement a shared shell, image-backed frames, primary actions, modal treatment, text system, and focus treatment before page-only components.
- Each page keeps its own `index.html`, page stylesheet, state data, and direct `?state=<id>` URLs. Shared assets/styles/scripts live outside page folders.
- Put each interaction on one semantic control (`button`, link, or equivalent). Avoid invisible full-screen controls. Decorative pseudo-elements, images, overlays, and vignettes must not intercept pointer events.
- Keep controls at least 44×44 CSS px where practical. Use `:focus-visible`, Escape/modal-close behavior, and `prefers-reduced-motion` support.

### 5. Reconcile visual hierarchy and hit testing

- Check at the reference viewport and 390×844 (or the nearest required narrow viewport).
- Compare scene crop, hierarchy, typography, panel padding, and optical alignment against the reference—not only box coordinates. Reposition number/label overlays by the visual centre of their artwork where necessary.
- Inspect every control’s bounding rectangle, z-index, and overlap. Any overlap must be intentional and documented.
- Trigger every action through actual browser clicks, including each option in a choice set, panel continuation, modal open/close, primary flow, back path, and menu navigation. A query-string state load is not an interaction test.
- Confirm the intended control receives the hit at its visual centre and that its visible sub-elements do not capture the click. Record failures before calling the work complete.

### 6. Validate and package

- Run `scripts/validate_ui_project.py <project-root> --require-interaction-map` and fix invalid manifests, missing files, duplicate page paths, unknown state references, and a missing interaction contract.
- Rerun the asset index after new assets. Update statuses and the interaction map with the final outcomes.
- Package only after all reference states, viewport checks, actual transition checks, broken images, and console errors are clean.

## Incremental batches

When new screenshots arrive, load existing manifests and compare them against the library before adding code or generating an image. Extend the existing page when the shell is unchanged, preserve approved asset IDs, and update the contracts immediately. Never regenerate an approved shared asset merely because it appears in a new crop.

## Completion criteria

Do not declare a flow complete until:

- every screenshot maps to a page and stable state;
- every visible actionable surface is in `analysis/interaction-map.md` and has a verified browser click path;
- decorative layers cannot block controls;
- shared assets have stable IDs, valid files, and documented reuse;
- reference-width and narrow-width layouts have no horizontal overflow, broken images, or illegible/escaping text;
- all primary, secondary, modal, selection, and back-path interactions have passed;
- console errors are zero and the runnable entry point and package are current.
