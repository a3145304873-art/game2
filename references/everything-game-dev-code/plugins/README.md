# Plugins

This directory is the project-level plugin catalog for the game development scaffold.

It exists to answer four questions clearly:
1. Which plugins, SDKs, addons, or extensions are allowed?
2. Why does each one exist?
3. Who owns it?
4. What are the technical and production risks of changing it?

This folder is intentionally lightweight in the scaffold base.
The source of truth starts with this README.
If the project later needs plugin-specific records, they should extend this directory deliberately rather than becoming an untracked dump of vendor notes.

## Scope

Use `plugins/` to track non-engine-neutral plugin knowledge that affects:
- project architecture
- authoring workflows
- build and release
- platform support
- live operations
- compliance
- performance or memory risk
- migration planning
- third-party dependency policy

This directory does **not** replace:
- `rules/` for standards and policy
- `skills/` for reusable operating workflows
- `manifests/` for install profiles and packaging logic
- `hooks/` for workflow enforcement
- `docs/templates/` for document templates
- engine-specific rule layers for Unity, Unreal, or Godot implementation detail

## What counts as a plugin here

Treat the following as plugins for catalog purposes:
- engine packages or addons
- editor extensions
- import/export helpers
- gameplay frameworks
- networking frameworks
- backend SDKs
- analytics SDKs
- crash reporting SDKs
- monetization SDKs
- voice/chat SDKs
- localization tools
- build and deployment helpers
- platform integration packages
- rendering or VFX extensions
- internal company plugins and shared toolkits

## Plugin governance principles

### 1. Every plugin must have a reason to exist
Do not keep a plugin because it was once useful.
A plugin must have:
- a current use case
- an owner
- a known scope
- a known upgrade or replacement path

### 2. Prefer fewer, clearer dependencies
Do not stack multiple plugins that solve the same problem unless the overlap is intentional and documented.

### 3. Plugin choice is an architecture decision
A plugin can affect:
- runtime structure
- save/load
- content pipeline
- build stability
- package size
- performance
- platform compliance
- migration cost

Treat plugin adoption as a design and production decision, not only a coding shortcut.

### 4. Engine isolation must be preserved
Unity plugins belong to Unity workflows.
Unreal plugins belong to Unreal workflows.
Godot addons belong to Godot workflows.

Cross-engine comparisons may be documented here, but active production guidance must remain isolated in the correct engine layer.

### 5. Upgrades are controlled changes
Never upgrade a plugin casually near release.
Every upgrade should consider:
- API breakage
- content migration
- build changes
- serialization impact
- platform regressions
- licensing changes
- documentation drift

## Minimum record for every plugin

For every plugin adopted by the project, capture at least:

- **Name**
- **Category**
- **Engine or shared scope**
- **Owner**
- **Reason for adoption**
- **Current version**
- **Source** (vendor, package manager, repository, marketplace, internal)
- **Platforms affected**
- **Build or CI impact**
- **Runtime impact**
- **Performance or memory risk**
- **Licensing or legal notes**
- **Migration or rollback notes**
- **Documentation links**
- **Known caveats**

## Recommended plugin categories

### Engine workflow plugins
Use for:
- editor workflow improvement
- inspectors and authoring helpers
- import/export automation
- scene, prefab, Blueprint, or node validation
- environment or level authoring tooling

Risk focus:
- editor lock-in
- version breakage
- hidden workflow dependence

### Runtime systems plugins
Use for:
- gameplay systems
- dialogue systems
- AI frameworks
- ability systems
- camera frameworks
- save systems
- procedural generation

Risk focus:
- architecture coupling
- runtime ownership confusion
- serialization or save compatibility
- long-term maintainability

### Online and backend plugins
Use for:
- authentication
- economy
- matchmaking
- inventory
- cloud save
- analytics
- social or liveops services

Risk focus:
- trust boundaries
- secrets handling
- privacy and compliance
- outage and fallback behavior
- vendor lock-in

### Content pipeline plugins
Use for:
- localization
- VO pipeline
- subtitle tooling
- art pipeline
- VFX helpers
- cinematic sequencing helpers
- DCC integration

Risk focus:
- asset format drift
- import instability
- build pipeline coupling
- authoring team dependency

### Build and release plugins
Use for:
- CI helpers
- packaging
- patching
- crash reporting
- store submission automation
- deployment scripting

Risk focus:
- release blockers
- environment drift
- credential handling
- artifact integrity

## Adoption checklist

Before adopting a plugin, verify:

- the problem is real and current
- the team has capacity to own it
- the plugin is compatible with the chosen engine/version strategy
- the plugin does not create avoidable overlap with existing tools
- the runtime and pipeline cost is acceptable
- platform coverage is good enough for the project target
- documentation and onboarding burden are understood
- exit strategy exists if the plugin is abandoned or becomes risky

## Review checklist

When reviewing an existing plugin, ask:

- Is it still actively used?
- Does it still solve a problem we actually have?
- Does another current tool already cover the same need?
- Is it blocking upgrades or engine migration?
- Does it create hidden production dependency?
- Does it increase build or release fragility?
- Is ownership still clear?
- Is the version pinned and reproducible?
- Are setup steps documented?
- Are the risks still acceptable?

## Decommission checklist

When removing a plugin:

- identify all runtime and tooling dependencies
- identify all authored content that depends on it
- identify build and CI references
- document migration steps
- remove dead wrappers and adapter code
- update rules, skills, docs, and hooks if they referenced it
- verify save/load, content, and build integrity after removal

## Recommended future extension

If the project grows, this directory can be extended with one markdown file per plugin or per plugin family, for example:
- `plugins/unity-addressables.md`
- `plugins/playfab.md`
- `plugins/fmod.md`
- `plugins/steamworks.md`

That extension should happen only when the catalog becomes too large for a single README.

## Relationship with the rest of the scaffold

- Use `rules/*` to define what plugin usage is allowed.
- Use `skills/*` to define how to integrate, review, or maintain the plugin.
- Use `hooks/` to warn about plugin-sensitive workflow changes.
- Use `manifests/` to express plugin-related install profiles.
- Use `agents/` and `commands/` to route plugin decisions to the right specialists.

## Done criteria

The `plugins/` layer is healthy when:
- plugin ownership is explicit
- active plugin choices are justified
- engine boundaries are respected
- upgrade and rollback risk is visible
- build, runtime, and legal implications are documented
