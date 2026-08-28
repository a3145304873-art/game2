# unreal/patterns

Extends `../common/documentation.md` with Unreal-specific content.

## Approved Direction
- Use explicit gameplay architecture rather than accidental framework coupling.
- Choose a clear strategy for GameInstance, GameMode, GameState, PlayerState, PlayerController, Pawn, subsystems, and data assets.
- Keep authoritative logic, replicated state, and presentation concerns distinct.

## Common Patterns
- Use plugins and modules to enforce stable feature boundaries where project scale justifies it.
- Use data assets, config objects, and authored content intentionally for design iteration.
- Use Blueprints for designer-facing workflows, but keep core architecture understandable without reverse-engineering graphs.

## Anti-Patterns
- giant Blueprint graphs with hidden ownership
- relying on Tick for systems that should be event-driven
- mixing authority and cosmetic behavior without explicit separation
- asset and map setup being the only place where system architecture can be understood

## Done Criteria
An Unreal pattern is acceptable when it clarifies ownership, scales with project complexity, and remains reviewable by both engineering and design.
