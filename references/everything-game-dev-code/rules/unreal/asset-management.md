# Unreal Asset Management

## Purpose
Define Unreal-specific rules for asset naming, ownership, references, loading, and lifecycle management.

## Scope
Applies to content assets such as Blueprints, materials, textures, skeletal meshes, animations, Niagara systems, data assets, maps, widgets, and imported source content.

## Principles
- Asset organization must support discoverability, ownership, and safe refactoring.
- Naming conventions must allow contributors to distinguish asset type and purpose quickly.
- Asset dependencies should be intentional and visible.

## Reference Rules
- Prefer dependency direction from foundational systems toward higher-level feature content.
- Avoid accidental hard references that force unrelated content into memory.
- Use soft references or asset manager patterns where asynchronous loading and memory control matter.
- Circular references between feature packages or content domains should be treated as defects.

## Authoring Rules
- Data assets should hold data, not hidden behavioral complexity.
- Blueprint inheritance trees should remain understandable and justified.
- Maps should not become the only place where system wiring is understandable.
- Redirectors should be fixed promptly after content moves or renames.

## Review Triggers
Review asset management decisions when:
- load times or memory footprint grow unexpectedly
- asset moves affect many references
- content duplication becomes a maintenance burden
- cross-feature references make ownership unclear

## Done Criteria
Unreal asset management is healthy when content is predictable to find, references are controlled, and loading behavior is intentional.
