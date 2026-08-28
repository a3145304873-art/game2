# Unreal Editor Tooling

## Purpose
Define expectations for Unreal editor extensions, automation, and content validation tools.

## Scope
Applies to editor modules, commandlets, editor utility Blueprints, Python-based editor automation if used, custom details panels, validation tools, and import helpers.

## Principles
- Editor tooling should reduce repeated manual work, not introduce opaque project magic.
- Tools with high content impact require ownership, documentation, and safe failure behavior.
- Validation should happen as early as practical in the authoring workflow.

## Rules
- Keep editor-only code out of runtime modules.
- Tool inputs and side effects must be explicit.
- Destructive operations should support preview, backup strategy, or clear confirmation pathways.
- Validation tools should report actionable failures rather than vague pass/fail output.

## Review Triggers
Review tooling when:
- it mutates many assets
- it changes project-wide settings
- it becomes part of the release pipeline
- it creates new dependencies on plugins or external services

## Done Criteria
Unreal editor tooling is healthy when it speeds up content production safely and leaves a clear audit trail of important project-wide actions.
