# Unreal Build and Release

## Purpose
Define Unreal-specific build, cook, package, and release expectations.

## Scope
Applies to local builds, CI builds, cooked builds, packaged releases, and platform submission preparation.

## Build Principles
- Build definitions must be reproducible and documented.
- Shipping output should be produced from controlled configuration, not ad hoc local editor actions.
- Platform-specific settings must be versioned and reviewable.

## Configuration Rules
- Separate development, test, staging, and shipping expectations clearly.
- Target settings, platform SDK assumptions, and packaging options must be documented.
- Build scripts and automation should make configuration differences explicit.

## Release Gates
Before a release candidate is approved:
- the intended maps and startup flow are verified
- cook and packaging complete without ignored critical warnings
- target platform compliance items are reviewed
- crash reporting and telemetry behavior are confirmed
- save compatibility and patch expectations are checked when relevant

## Ownership
- Build engineers own automation and package reliability.
- Gameplay or feature teams own the readiness of the systems included in the build.
- QA owns release validation coverage and defect triage input.

## Done Criteria
Unreal build and release workflow is healthy when the team can produce consistent packages, understand platform differences, and move toward submission without hidden manual steps.
