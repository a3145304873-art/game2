# Unreal Version Control

## Purpose
Define version control expectations for Unreal projects with large binary assets and generated metadata.

## Scope
Applies to source code, content assets, config, plugins, generated files, and collaboration workflows involving locks or large files.

## Principles
- Source control strategy must protect both code collaboration and content authoring.
- Binary-heavy workflows require stronger coordination than text-only workflows.
- Ignore rules and checked-in generated files must be explicit.

## Rules
- Commit only files that are required to reproduce project state and builds.
- Generated caches, machine-local files, and transient outputs must stay out of version control.
- Large asset moves, renames, and folder restructures should be coordinated because they amplify redirector and merge risk.
- Teams should define when asset locking, branch discipline, or dedicated integration windows are required.

## Review Triggers
Review source control workflow when:
- merges frequently break maps or content references
- large binary assets block collaboration
- plugin or engine upgrades create broad churn
- build reproducibility depends on files currently ignored or unmanaged

## Done Criteria
Unreal version control is healthy when contributors can collaborate on code and content without frequent hidden breakage or repository drift.
