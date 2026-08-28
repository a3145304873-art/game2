# Unreal Blueprints

## Purpose
Define when and how Blueprints should be used in an Unreal project.

## Scope
Applies to Blueprint classes, Blueprint function libraries, Blueprint interfaces, widgets, animation Blueprints, level Blueprints, and editor utility Blueprints.

## Usage Principles
- Use Blueprints where iteration speed, designer ownership, or Unreal-native workflows justify them.
- Keep business logic, architecture-critical logic, and performance-sensitive loops out of large opaque Blueprint graphs when C++ seams are more maintainable.
- Choose Blueprint or C++ based on ownership, testability, runtime risk, and expected change rate.

## Structure Rules
- Prefer small, purpose-built Blueprints over monolithic graphs.
- Keep event flow readable and avoid deeply nested graph logic.
- Shared behavior should move into components, function libraries, interfaces, or C++ bases when duplication grows.
- Level Blueprints should remain thin and should not become system backbones.

## Boundary Rules
- Blueprint-callable APIs should be explicit, stable, and documented.
- Exposed variables must have clear edit intent and sensible defaults.
- Do not expose internal engine or gameplay state broadly without a reason.

## Review Triggers
Escalate Blueprint-heavy work when:
- profiling shows graph overhead in critical paths
- ownership becomes unclear between design and engineering
- bugs are hard to diagnose because state is spread across many graphs
- inheritance depth or graph size prevents safe maintenance

## Done Criteria
Blueprint usage is healthy when iteration remains fast, ownership is clear, and the resulting systems stay readable, debuggable, and sustainable.
