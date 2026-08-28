# Unreal Modules and Plugins

## Purpose
Define how Unreal modules and plugins should be organized and governed.

## Scope
Applies to game modules, editor modules, developer modules, runtime plugins, third-party plugins, and internal reusable feature plugins.

## Principles
- Module and plugin boundaries must reflect ownership and dependency direction.
- Dependencies should be explicit, minimal, and reviewable.
- Reuse should not come at the cost of unclear coupling.

## Rules
- Separate runtime and editor concerns into appropriate module types.
- Avoid dependency graphs where low-level modules depend on feature or UI modules.
- Introduce plugins when ownership, reuse, or isolation clearly benefits from it.
- Third-party plugins require version, support, and removal-risk tracking.

## Review Triggers
Escalate changes when:
- a plugin becomes foundational to shipping behavior
- many modules begin depending on one shared utility without clear scope
- circular or layered dependency violations appear
- engine upgrades increase plugin compatibility risk

## Done Criteria
Unreal module and plugin architecture is healthy when ownership is clear, compile boundaries are intentional, and reuse does not create hidden fragility.
