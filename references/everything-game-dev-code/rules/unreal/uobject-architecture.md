# Unreal UObject and Actor Architecture

## Purpose
Define architecture expectations for UObjects, Actors, components, subsystems, and gameplay framework ownership.

## Scope
Applies to reflected gameplay code, framework classes, components, subsystems, data assets, and lifecycle-sensitive systems.

## Principles
- Choose the lightest Unreal type that matches the responsibility.
- Actor count, component complexity, and lifecycle cost are architecture concerns, not only implementation details.
- System ownership must be understandable without opening many unrelated classes or assets.

## Rules
- Use Actors for world-present entities and world-owned behavior, not as generic containers for unrelated logic.
- Prefer components when behavior is reusable and naturally attaches to an owning Actor.
- Prefer subsystems for cross-cutting services with clear scope and lifecycle.
- Keep UObject usage intentional when no world presence is needed but reflection, serialization, or tooling support is required.

## Lifecycle Rules
- Initialization order, BeginPlay, possession, replication setup, teardown, and save/load hooks must be considered explicitly.
- Avoid architecture that depends on incidental execution order.
- Async operations must guard against invalidation and world teardown.

## Done Criteria
Unreal object architecture is healthy when type choices are intentional, lifecycles are respected, and ownership remains understandable under scale.
