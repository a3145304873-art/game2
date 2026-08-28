# Unreal Testing

## Purpose
Define testing strategy for Unreal gameplay code, Blueprints, editor tooling, and integration-sensitive systems.

## Scope
Extends the common testing rule for Unreal projects.

## Test Layers
- Use plain C++ tests for deterministic domain logic where practical.
- Use Unreal automation tests for engine-integrated logic that benefits from engine context.
- Use map or feature-level integration tests for startup flow, save/load, replication, and content-sensitive behavior when justified.
- Use smoke tests for startup, critical path validation, and packaged build verification.

## Strategy Rules
- Do not push all confidence into manual editor play sessions.
- Prioritize regression coverage for systems that frequently break due to asset references, lifecycle order, map flow, packaging, or multiplayer conditions.
- Editor tooling with project-wide content impact should include validation tests where practical.

## Reliability Rules
- Tests should minimize timing fragility and hidden map assumptions.
- Test setup must make world state, save state, and network assumptions explicit.
- Flaky tests are defects and must be repaired, isolated, or removed with justification.

## CI Rules
- CI must distinguish failing tests from infrastructure or cook failures.
- The team should know which tests are gating, informative, or experimental.
- Long-running automation suites require ownership and value justification.

## Done Criteria
Unreal testing is healthy when critical systems are protected by deliberate test layers and engine-sensitive failures are caught before release crunch.
