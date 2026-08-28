# Unreal Telemetry

## Purpose
Define telemetry expectations for Unreal implementations of analytics, crash reporting, and operational instrumentation.

## Scope
Extends the common telemetry rule for Unreal projects.

## Rules
- Telemetry integration must respect privacy, consent, platform policy, and data minimization.
- Event names and payloads should be stable and documented.
- Crash reporting and fatal error capture paths must be understood for each shipping platform.
- Telemetry should help answer product and operational questions, not become undirected event spam.

## Unreal Considerations
- Packaged build telemetry behavior must be validated separately from editor behavior.
- Version, build, platform, map, and reproducibility context should be included where appropriate.
- Online or session-sensitive telemetry must be consistent across host, client, and reconnect scenarios when relevant.

## Done Criteria
Unreal telemetry is healthy when shipped builds produce trustworthy signals and teams can relate telemetry back to concrete gameplay and platform contexts.
