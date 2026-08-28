# unreal/networking

Extends `../common/technical-design.md` with Unreal-specific content.

## Scope
Applies when the Unreal project contains multiplayer, replicated gameplay, backend-driven gameplay, or network-adjacent systems.

## Rules
- Authority, replication ownership, relevancy, prediction, rollback strategy if used, and disconnect behavior must be documented.
- Client input must be treated as untrusted where authority matters.
- GameMode, GameState, PlayerState, PlayerController, Pawn, and replicated Actor responsibilities must be explicit.
- Third-party networking or backend integrations must be wrapped or documented well enough to replace or upgrade safely.

## Done Criteria
Unreal networking is acceptable when authority, ownership, sync, and failure handling are explicit and testable.
