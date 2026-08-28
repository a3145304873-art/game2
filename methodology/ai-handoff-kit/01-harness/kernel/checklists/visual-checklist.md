# Visual Review Checklist

> Used by the independent reviewer agent during visual review.
> Only executed when frontend files are changed.

---

## Screenshot Requirements

| Setting | Value |
|---------|-------|
| Viewport width | 1920px |
| Viewport height | 1080px |
| Device scale factor | 1x |
| Pages to capture | Every page affected by the code changes |
| Additional states | Modals, dropdowns, loading states if applicable |

### Screenshot Command Reference

```bash
# Open page with specific viewport
npx playwright open --viewport-size="1920,1080" <url>
```

---

## Visual Checks

### CRITICAL

| # | Check | What to Look For |
|---|-------|------------------|
| C1 | Blank page / rendering failure | Large white areas with no content, or error messages visible on screen |
| C2 | JavaScript console errors | Open browser DevTools Console tab. Any red error messages. |
| C3 | Layout overflow / element overlap | Elements extending beyond their containers, overlapping other elements, or causing horizontal scrollbars |
| C4 | Missing critical content | Text or components that should be visible but are not rendered |

### WARNING

| # | Check | What to Look For |
|---|-------|------------------|
| W1 | UI inconsistency with existing pages | Compare colors, fonts, spacing, button styles with the project's design system. Mismatch = finding. |
| W2 | Emoji usage on frontend pages | Per project rules: frontend pages must NOT use emoji. Any emoji characters visible. |
| W3 | Text truncation or overflow | Text being cut off, showing "..." unexpectedly, or overflowing its container |
| W4 | Interactive elements unreachable | Buttons, links, or inputs that are obscured by other elements or have `pointer-events: none` without clear intent |
| W5 | Broken images or missing assets | Image placeholders, broken image icons, or 404'd resources |
| W6 | Dropdown menus extend beyond viewport | Open ALL dropdown/select menus. Verify the list is fully visible and scrollable. Critical when list has >10 items. |

### INFO

| # | Check | What to Look For |
|---|-------|------------------|
| I1 | Missing loading states | Async operations with no spinner, skeleton, or progress indicator |
| I2 | Accessibility concerns | Low contrast text, missing focus indicators, images without alt text |
| I3 | Inconsistent spacing | Padding/margin differences between similar components |

---

## Design System Reference

> Project-specific design system values should be defined in the project's `.claude/review-config.json` under `designSystem`.

All CSS should use CSS variables (e.g. `--ds-*`), not hardcoded values.
