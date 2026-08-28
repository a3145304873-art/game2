# Interaction contract and browser QA

## Before implementation: make an interaction map

Create `analysis/interaction-map.md` before implementation. One row per visible actionable surface, including cards, full dialogue panels, close/back controls, floating notes, menu icons, and choice bubbles.

| State | Visual surface | DOM control ID | Accessible label | Hit region | Action | Success signal | Keyboard path |
|---|---|---|---|---|---|---|---|
| `night:round` | upper-left ink choice | `choice-win` | `喝酒，也要有输赢` | visible bubble bounds | select response | panel text updates and selected state appears | Enter/Space |

Use this as a contract, not decoration. A visual-only label is not an interaction unless the brief explicitly says so.

## Layer and hit-target rules

- Each visible control has one semantic top-level `button`, link, or equivalent with a stable `data-control-id`.
- Its text, decorative image, and pseudo-elements live inside that control or have `pointer-events: none`.
- Scene images, vignettes, rain, glows, frames, and page-wide texture overlays use `pointer-events: none`.
- Do not place an invisible full-page button behind or above a group of independent controls.
- Avoid nested interactive elements. Do not overlap controls unless the intended priority and test point are explicit.
- If an artwork contains a click target (card, plaque, bubble), make the semantic hit area match its visible silhouette or bounding area, not an unrelated container.

## Browser acceptance

At both the reference viewport and a narrow viewport:

1. Load each direct state URL and verify no overflow, broken raster, or clipped/illegible text.
2. Read visible controls from the DOM; compare count and labels with the interaction map.
3. For each control, inspect its rect, visibility, enabled state, and z-index. Flag accidental overlap with another interactive rect.
4. Click every control through its visible labelled target. Verify the specified success signal; do not treat a URL change alone as success if the requested state/UI did not appear.
5. Verify choice controls independently—one passing option does not validate a choice set.
6. Open and close every modal using its visible close/cancel path and Escape where relevant.
7. Navigate the complete primary path from entry through completion, then test the documented back/restart path.
8. Check console errors after the flow and confirm reduced-motion keeps the UI usable.

## Visual acceptance

- Check optical, not merely mathematical, alignment. For example, number overlays align with the visual centre of a gemstone, not the lower edge of a card.
- Reuse approved image-backed frames and ornaments. If a complex reference frame is missing, generate or source one; do not substitute a generic CSS rectangle.
- Keep generated assets textless. Use DOM for every variable label/value so the same material can serve multiple states.
- Record viewport, control, result, and any intentional overlap in the final QA report.
