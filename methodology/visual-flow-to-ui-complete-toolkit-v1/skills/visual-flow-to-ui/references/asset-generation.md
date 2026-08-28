# Asset generation contract

## Generate only after deduplication

Create a queue sorted by priority:

1. structural frames needed by most states;
2. core character poses and scenes;
3. repeated item or feature illustrations;
4. rare decorative variants.

## Transparent element prompt pattern

Describe one empty reusable asset, the visual style, aspect ratio, material, symmetry, and prohibited content. Require no text, numbers, icons, characters, or shadows unless that item is the asset itself.

When direct alpha is unreliable, request a perfectly flat `#00FF00` background with generous padding and no green in the subject. Remove the chroma key with the imagegen skill helper, inspect edge spill, trim to the alpha bounds, and verify transparent corner pixels.

## Opaque scene prompt pattern

Provide the closest character and environment references. Preserve identity, costume, lighting direction, and art treatment. Specify the new pose and safe areas for UI overlays. Prohibit all UI, text, cards, panels, and counters.

## Quality rules

- Do not generate full screenshots when reusable layers are possible.
- Do not generate text inside images.
- Do not generate multiple unrelated assets in one image.
- Avoid baking selection glows into base assets; build states in CSS when possible.
- Retain raw generated files outside the approved shared library.
- Copy only cleaned, named, validated assets into `shared/assets/`.
- Record the prompt intent and generation mode in the handoff summary.
