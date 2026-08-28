# Project contract

## Required layout

```text
project/
├─ index.html
├─ source-references/
├─ analysis/
│  ├─ crops/
│  ├─ reference-contact-sheet.jpg
│  └─ visual-similarity.csv
├─ shared/
│  ├─ assets/
│  │  ├─ backgrounds/
│  │  ├─ scenes/
│  │  ├─ frames/
│  │  ├─ icons/
│  │  └─ ornaments/
│  ├─ styles/
│  └─ scripts/
├─ pages/
│  └─ <page-id>/
│     ├─ index.html
│     ├─ <page-id>.css
│     └─ <page-id>.js
├─ manifests/
│  ├─ assets.json
│  ├─ pages.json
│  ├─ reuse-map.json
│  └─ file-index.json
└─ tools/
```

## Assets manifest

Use stable IDs such as `scene.keeper.standard.v1` or `frame.battle.modal.v1`.

Each asset entry should contain:

- `id`
- `file`, or `null` for code-native effects
- `type`
- `status`
- `usedBy`
- optional `source`, `confidence`, `referenceBbox`, and `notes`

Do not rename an approved ID when adding a new batch. Add a version only when the visual contract changes.

## Pages manifest

Each page entry must contain a stable page ID, path, status, and its state IDs. A modal, drawer, selected control, or temporary effect belongs in the state list unless it is independently navigable.

## Reuse map

Map shared components to pages and state-only components to state IDs. This file explains intentional reuse that hashes alone cannot discover.

## Page isolation

Each page must work when opened directly. Shared paths must remain relative to the project root. Avoid page-specific copies of shared assets.
