# Unreal Technical Design

## Purpose
Define how Unreal-specific technical decisions should be recorded on top of the common TDD process.

## Scope
Applies to architecture decisions involving modules, plugins, gameplay framework, Blueprints, data assets, streaming, online features, rendering, and build pipeline behavior.

## Required Unreal Sections
When an Unreal-specific TDD addendum is needed, include:
- target Unreal version and critical plugins
- affected modules or plugins
- relevant gameplay framework or subsystem boundaries
- Blueprint versus C++ ownership decisions
- asset loading and reference strategy
- networking or replication assumptions if applicable
- map, streaming, or world partition implications
- packaging, patching, or platform constraints
- testing and profiling expectations

## Decision Rules
- Unreal implementation details should remain out of the engine-neutral TDD unless they materially affect project-wide tradeoffs.
- Unreal-specific tradeoffs must be explicit when they affect designer workflows, content authoring, scalability, or maintenance cost.
- Major engine integrations should be supported by ADRs when they influence multiple teams.

## Done Criteria
Unreal technical design is healthy when Unreal-specific constraints and tradeoffs are documented early enough to guide implementation and review.
