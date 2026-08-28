# unreal/memory

Extends `../common/memory.md` with Unreal-specific content.

## Asset Lifetime
- Define ownership for streaming, level residency, soft references, hard references, and loaded object lifetime.
- Large maps, shared assets, animation data, audio content, and UI assets must have platform-aware memory budgets.

## Data Rules
- Save data, replicated state, config data, and content-authored defaults must have explicit boundaries.
- Avoid accidental retention through broad hard references when soft references or controlled loading would be safer.

## Streaming Rules
- Level streaming, world partition behavior, and asset loading strategies must be documented for large worlds or content-heavy projects.
- Memory spikes during travel, streaming, or cinematic-heavy flows must be profiled and owned.

## Done Criteria
Unreal memory management is healthy when residency, loading, and ownership are explicit and testable.
