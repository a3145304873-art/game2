# Unreal Cooking and Packaging

## Purpose
Define rules for cooked content, staging, packaging, chunking, and patch readiness in Unreal.

## Scope
Applies to content cooking, packaged output, chunk layouts, patching strategies, and release artifact validation.

## Principles
- Cooking and packaging should be deterministic enough to diagnose failures and compare outputs.
- Content inclusion must be intentional; accidental package growth is a defect.
- Patch and DLC strategy should be considered before content structure hardens.

## Rules
- Primary maps, startup assets, and always-loaded content must be documented.
- Chunking or install bundle decisions must reflect real content usage and platform constraints.
- Packaging warnings should be triaged rather than normalized.
- Any content excluded from builds must be excluded deliberately and reviewably.

## Validation
Before sign-off:
- expected maps and assets are present
- package size deltas are explained
- cook warnings are reviewed
- patching assumptions are validated when relevant
- loading behavior is exercised on target hardware or equivalent environments

## Done Criteria
Unreal cooking and packaging is healthy when build outputs are explainable, content size is controlled, and release artifacts match product intent.
