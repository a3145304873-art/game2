# Unreal Coding Style

## Purpose
Define Unreal-specific coding expectations on top of the common coding style rule.

## Scope
Applies to C++ code, reflected types, gameplay framework classes, subsystems, components, and Unreal-facing APIs.

## Core Rules
- Follow project style consistently and align with Unreal naming and reflection conventions where applicable.
- Public APIs should reveal gameplay intent and ownership clearly.
- Macros and reflected declarations should remain readable and minimal.

## Design Rules
- Prefer composition over inheritance when it improves flexibility and maintenance.
- Keep UObject and Actor responsibilities focused.
- Avoid creating giant manager classes when subsystems, components, or feature boundaries provide cleaner ownership.
- Distinguish engine integration code from project domain logic.

## Reflection and API Rules
- Expose only what Blueprints, serialization, networking, or tooling genuinely need.
- Metadata specifiers should support correct editor use, not compensate for unclear design.
- Avoid broad public mutability through reflected properties without validation rules.

## Reliability Rules
- Lifecycle-sensitive code must respect Unreal initialization and teardown order.
- Pointer ownership, object validity, and asynchronous work must be explicit.
- Do not bury critical side effects inside convenience helpers that obscure actor or component state changes.

## Done Criteria
Unreal code style is healthy when code is readable to both engine-aware reviewers and project contributors, and reflected APIs are intentional rather than excessive.
