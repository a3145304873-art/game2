# Unreal Networking and Replication

## Purpose
Define Unreal-specific rules for networking architecture, replication, authority, and online-sensitive gameplay systems.

## Scope
Applies to multiplayer gameplay, replicated Actors and components, RPC usage, prediction-sensitive systems, session flows, and online feature integration.

## Principles
- Networking behavior must be designed, not inferred from defaults.
- Authority boundaries should be explicit in code, Blueprints, and documentation.
- Replication cost must be treated as a production constraint.

## Rules
- Document what is authoritative, replicated, client-predicted, or purely local.
- RPCs should express intent clearly and avoid becoming hidden state transport.
- Replicated data should be minimized to what clients need.
- Multiplayer assumptions must be testable outside of ideal local conditions.

## Validation
Networking changes require:
- authority flow review
- dedicated or representative multiplayer testing as appropriate
- replication cost awareness
- join-in-progress, reconnect, and failure-path consideration where relevant

## Done Criteria
Unreal networking is healthy when authority is obvious, replication is controlled, and gameplay behavior remains understandable under real multiplayer conditions.
