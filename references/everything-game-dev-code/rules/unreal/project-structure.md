# Unreal Project Structure

## Purpose
Define Unreal-specific project organization rules inside the broader repository.

## Scope
Applies to source folders, content folders, config, plugins, platform folders, and build-related project assets.

## Structure Principles
- Unreal project paths should reflect ownership, module boundaries, and content domains.
- Folder structure must support authoring, build automation, and safe refactoring.
- Avoid catch-all folders that accumulate unrelated assets or code.

## Recommended Boundaries
- Separate runtime source, editor source, plugins, config, maps, UI, audio, cinematic content, and third-party assets.
- Organize gameplay by feature or domain when it improves discoverability and ownership.
- Mirror important module and plugin boundaries in source layout.

## Content Rules
- Map organization should make startup flow, test maps, and production maps easy to identify.
- Imported source files, generated content, and shipping assets should remain distinguishable where practical.
- Feature folders should not hide cross-project utilities or shared framework code.

## Documentation
- The Unreal project should have a short structure map explaining where code, content, plugins, config, tools, and tests live.
- Non-obvious folder conventions must be documented for new contributors.

## Done Criteria
Unreal structure is healthy when contributors can predict where systems and assets belong and structural decisions reinforce clear ownership.
