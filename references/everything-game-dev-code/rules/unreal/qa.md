# Unreal QA

## Purpose
Define QA expectations for Unreal-specific risk areas and workflows.

## Scope
Extends the common QA rule for Unreal projects.

## Focus Areas
QA should pay special attention to:
- map transitions and startup flow
- packaged build behavior versus editor behavior
- save/load state integrity
- input and UI state changes
- multiplayer and replication-sensitive features
- performance regressions on representative hardware
- asset loading, streaming, and cook-related failures

## Collaboration Rules
- QA must receive reproducible setup notes for map, platform, profile, save state, and network topology when relevant.
- High-risk Unreal changes should be paired with targeted regression notes before broad content testing begins.
- Crash, hitch, and load failures must be triaged with build and engineering owners promptly.

## Done Criteria
Unreal QA is healthy when Unreal-specific failures are caught in packaged and target-like environments before release pressure hides root causes.
