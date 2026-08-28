# Unreal Performance

## Purpose
Define Unreal-specific profiling and optimization expectations.

## Scope
Applies to CPU, GPU, memory, streaming, loading, Blueprint cost, render cost, animation cost, and platform-specific performance constraints.

## Principles
- Performance work must begin with measurement on representative content and hardware.
- Optimize bottlenecks, not guesses.
- Budgets should be visible to design, content, and engineering stakeholders.

## Profiling Rules
- Use Unreal profiling tools and platform tools appropriate to the issue.
- Capture the context of a measurement: map, camera state, actor count, platform, build configuration, and reproduction steps.
- Distinguish editor overhead from packaged runtime performance.

## Risk Areas
Pay special attention to:
- tick-heavy gameplay architecture
- excessive Blueprint graph cost
- draw call and material complexity
- skeletal mesh and animation overhead
- world partition, streaming, and async load stalls
- memory spikes during map transitions

## Done Criteria
Unreal performance is healthy when measured bottlenecks are tracked against platform budgets and fixes address root causes rather than symptoms.
