# Unreal Config and Settings

## Purpose
Define how project settings and config files should be managed in Unreal projects.

## Scope
Applies to `.ini` files, project settings, plugin settings, platform settings, scalability settings, input mappings, and other configuration data.

## Principles
- Configuration must be explicit, versioned, and environment-aware.
- Runtime behavior should not depend on undocumented editor-side settings.
- Platform overrides should be intentional and discoverable.

## Rules
- Treat config as production code: review it, document meaningful changes, and avoid casual drift.
- Distinguish defaults from environment-specific overrides.
- Input, networking, packaging, rendering, and scalability settings require change notes when altered.
- Secrets, credentials, and restricted endpoints must not be committed to project config.

## Review Triggers
Review config changes when they affect:
- startup behavior
- platform memory or performance
- online services
- save data or patching expectations
- asset loading, packaging, or streaming

## Done Criteria
Unreal configuration is healthy when the team can explain where a setting lives, why it exists, and how it affects runtime behavior across platforms.
