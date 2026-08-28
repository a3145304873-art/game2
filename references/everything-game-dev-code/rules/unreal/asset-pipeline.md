# unreal/asset-pipeline

Extends `../common/asset-pipeline.md` with Unreal-specific content.

## Import Rules
- Import settings, compression, LOD strategy, material assignment, and reimport workflows are part of the source of truth.
- Asset naming and folder conventions must support searchability, redirector cleanup, and ownership.
- High-cost asset categories require documented import expectations and validation.

## Content Types
- Textures, materials, skeletal meshes, static meshes, animations, Niagara systems, audio, and UI assets need category-specific strategy.
- Do not apply one generic import profile to all assets.

## Validation
- Catch broken references, incorrect collision setup, oversized assets, invalid LOD policies, and unsupported formats as early as possible.
- High-risk assets should be reviewed in representative gameplay context, not only in preview windows.

## Done Criteria
The Unreal asset pipeline is healthy when import behavior is intentional, repeatable, and aligned with runtime budgets.
