# UI reconstruction QA

## Structural

- Every reference screenshot maps to a page and state.
- No modal or drawer state is implemented as duplicate page HTML.
- Shared assets are referenced from the shared library.
- Manifest JSON parses and every listed file exists.

## Visual

- Test the original reference width.
- Test 390×844 or the closest supported narrow viewport.
- Check crop position, visual hierarchy, panel proportions, text contrast, and overlay dimming.
- Confirm `scrollWidth <= clientWidth` at both widths.
- Confirm all raster images load with nonzero natural dimensions.

## Interaction

- Create and verify `analysis/interaction-map.md`; every visible actionable surface must have a stable control ID, result, and browser-tested click path.
- Trigger every state through user actions, not only query parameters.
- Verify confirm and cancel paths.
- Verify counters, selected states, disabled items, and navigation targets.
- Verify visible focus states and 44px minimum targets.
- Inspect each interactive rect for accidental overlap and confirm the intended control receives a click at its visual centre.
- Verify scene, frame, glow, and other decorative layers cannot intercept pointer events.
- Verify reduced-motion behavior.

## Technical

- No console errors.
- No broken images or 404 responses.
- Page works from a plain static server.
- Direct state URLs used for visual QA do not break normal interaction.
- Final package includes the runnable entry point and current manifests.
