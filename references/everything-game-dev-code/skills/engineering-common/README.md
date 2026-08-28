# engineering-common

Cross-engine engineering skills for architecture, systems, tooling, budgets, and instrumentation.

## Included skills
- `gameplay-architecture`: Define system ownership, boundaries, state flow, and extensibility for gameplay code across engines.
- `input-abstraction`: Design input around player intent and supported device families instead of hardcoding device-specific behavior everywhere.
- `save-system-patterns`: Define reliable persistence boundaries, save formats, recovery behavior, and migration policy.
- `event-bus-patterns`: Use events and messaging without creating hidden coupling, ordering bugs, or impossible debugging paths.
- `ui-hud-patterns`: Structure HUD and menu implementation so UI remains understandable, maintainable, and aligned with UX goals.
- `ai-behavior-patterns`: Design maintainable AI behavior structures for decision-making, navigation, combat, and systemic interaction.
- `physics-gameplay-patterns`: Use physics and collision in a way that supports feel, determinism expectations, and performance constraints.
- `animation-state-patterns`: Structure animation state, blending, events, and sync so authored motion remains reliable under gameplay pressure.
- `multiplayer-netcode-patterns`: Define ownership, authority, replication, prediction, rollback or reconciliation strategy for multiplayer systems.
- `tools-pipeline-patterns`: Design internal tools and content pipelines that reduce manual work and make authoring safer.
- `build-pipeline-patterns`: Structure build and CI pipelines so builds are reproducible, diagnosable, and release-friendly.
- `telemetry-instrumentation`: Implement analytics and observability hooks that answer product questions without creating noise or privacy risk.
- `performance-budgeting`: Set and manage frame, load, memory, streaming, or bandwidth budgets before performance debt becomes structural.
- `memory-budgeting`: Define residency and memory budgets so content, streaming, and runtime systems fit target platforms.
- `asset-management`: Keep content discoverable, versioned, licensed, budgeted, and safe to move through the pipeline.
