# Unreal Agents

## Purpose
Define how Unreal-specific roles extend the common agent model without taking ownership away from design, QA, or production.

## Scope
Applies to all Unreal-focused agents, including gameplay programmers, engine programmers, technical artists, tools engineers, build engineers, and Unreal reviewers.

## Unreal Role Extensions
- `unreal-tech-lead` owns Unreal architecture choices, module/plugin strategy, engine integration, and Unreal-specific technical risk.
- `unreal-gameplay-engineer` owns gameplay implementation using approved C++ and Blueprint patterns.
- `unreal-tools-engineer` owns editor utility workflows, validation tools, import automation, and content pipeline helpers.
- `unreal-ui-engineer` owns UMG/Common UI implementation details and integration with input, localization, and presentation systems.
- `unreal-build-release-engineer` owns Unreal build automation, cooking, packaging, staging, and CI integration.
- `unreal-performance-engineer` owns profiling strategy, bottleneck diagnosis, and remediation on target hardware.

## Boundaries
- Unreal agents implement behavior inside Unreal. They do not redefine player-facing design intent or milestone scope.
- Engine-neutral documents must remain free of Unreal class names, Blueprint asset paths, module names, and editor menu instructions.
- Unreal-specific recommendations must be recorded in Unreal design notes, TDD sections, ADRs, or engine implementation docs.

## Collaboration Rules
- Unreal engineering must consume approved GDD and TDD inputs before locking architecture.
- Blueprint-heavy systems must be reviewed with both design and engineering stakeholders when maintainability or performance risk is high.
- Technical art decisions affecting materials, shaders, LODs, or streaming must be coordinated with rendering and asset pipeline owners.
- QA must be engaged before save/load, map flow, input, online, or packaging changes are considered complete.

## Handoff Requirements
Every Unreal handoff must include:
- target Unreal version and key plugins
- runtime boundary affected
- relevant modules, Blueprints, maps, or assets
- platform implications
- expected editor workflow impact
- validation or test expectations

## Escalation Triggers
- Unreal version or plugin changes
- UObject lifecycle or save data compatibility changes
- broad Blueprint architecture changes
- replication model redesign
- asset streaming or memory regressions
- cook or package instability
- performance regressions on target hardware

## Anti-Patterns
- using Blueprints as the only source of truth for critical architecture without documentation
- placing too much game logic in monolithic Actors or God Blueprints
- allowing module or plugin dependencies to grow without clear ownership
- mixing runtime, editor, and developer-only functionality without explicit boundaries

## Done Criteria
Unreal agent collaboration is healthy when Unreal implementation details are explicit, reviewable, testable, and clearly separated from common project policy.
