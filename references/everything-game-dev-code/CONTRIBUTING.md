# Contributing

## Goal
Contributions should strengthen the scaffold without breaking naming consistency, engine isolation, or harness portability.

## Contribution Types
You can contribute:
- new or improved rules
- new agents
- new commands
- new skills
- context refinements
- hook improvements
- harness adapter improvements
- tests and validation logic
- root-file maintenance and repo operations

## Structure Rules
Follow the repository structure exactly unless there is a strong reason to evolve it:
- one agent per file in `agents/`
- one command per file in `commands/`
- one skill per folder with `SKILL.md`
- engine-specific rules stay inside their engine layer
- harness-specific files should stay thin and point back to shared content

## Writing Standards
Use English for repository-facing content unless the project intentionally forks localized versions.

Prefer:
- explicit ownership
- operational clarity
- reviewable steps
- maintainable naming
- reusable patterns

Avoid:
- placeholder-only content where a real operational draft is expected
- duplicated standards across multiple layers without a clear extension model
- engine mixing inside common files

## Before Opening Changes
Check:
- naming consistency
- engine boundary correctness
- whether a command or skill already covers the pattern
- whether docs and hooks need updates too
- whether tests or validation should change

## Local Git Hooks
This repository can keep structure artifacts synchronized before each commit.

Run:
- `npm run setup:hooks`

That command configures Git to use the versioned hooks in `.githooks/`.

The current pre-commit hook will:
- run `npm run sync:structure`
- run `npm run validate:structure-artifacts`
- stage `STRUCTURE-TREE.txt` and `docs/structure-overview.md` automatically if they changed

## Pull Request Expectations
A good change should explain:
- what changed
- why it is needed
- which repository layer it affects
- whether it is common or engine-specific
- whether any harness adapters need to be updated

## Review Criteria
Changes should be reviewed for:
- structural alignment
- clarity and completeness
- cross-engine contamination risk
- maintainability
- compatibility with existing commands, agents, and skills
