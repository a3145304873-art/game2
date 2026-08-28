# unreal/documentation

Extends `../common/documentation.md` with Unreal-specific content.

## Required Unreal Notes
- Unreal version and important plugin versions
- module and plugin impact
- map and asset ownership
- replication or save/load impact
- packaging configuration implications
- platform-specific caveats
- tooling or pipeline changes

## Documentation Rules
- Unreal implementation details belong in Unreal docs, not in engine-neutral shared documents.
- Any architecture that depends on map setup, asset references, subsystem behavior, plugin state, or editor configuration must be documented clearly enough for another Unreal engineer to maintain it.
- Engine upgrades and plugin upgrades require migration notes when they create risk.

## Done Criteria
Unreal documentation is acceptable when engine-specific behavior is explicit, maintainable, and separated from common project policy.
