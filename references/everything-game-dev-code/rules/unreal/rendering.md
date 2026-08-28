# Unreal Rendering

## Purpose
Define rendering-specific rules for Unreal projects.

## Scope
Applies to material workflows, lighting strategy, post-process decisions, Niagara-heavy content, shader cost, and platform-specific render constraints.

## Principles
- Rendering decisions must align with art direction and hardware budgets.
- Visual quality targets should be documented alongside platform expectations.
- Rendering features should be chosen intentionally, not because they are available by default.

## Rules
- Materials should balance flexibility with maintainability and cost.
- Global rendering settings changes require review because they can affect the entire project.
- Expensive effects must have a use-case justification and fallback expectations where relevant.
- Technical art and engineering must collaborate when feature-level rendering changes impact memory, GPU cost, or loading.

## Done Criteria
Unreal rendering is healthy when visual fidelity targets are explicit, performance cost is measured, and project-wide rendering changes are governed carefully.
