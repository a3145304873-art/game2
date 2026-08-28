# unreal/tooling

Extends `../common/documentation.md` with Unreal-specific content.

## Tooling Rules
- Editor tooling, utility widgets, commandlets, validators, and pipeline helpers must reduce manual work or pipeline risk.
- Tools that modify many assets or content paths must fail safely and explain what changed.
- Production-critical tools need documentation and an owner.

## Workflow Rules
- Validation tooling should be easy to run locally and in automation where possible.
- Avoid hidden workflows that depend on one expert remembering editor rituals.
- Engine upgrades that affect tooling require compatibility review and migration notes.

## Done Criteria
Unreal tooling is acceptable when it is safe, discoverable, and worth the maintenance cost.
