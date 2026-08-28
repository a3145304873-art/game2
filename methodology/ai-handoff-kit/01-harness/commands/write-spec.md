You are creating a specification document for the current task using the Spec-First methodology.

> Based on: github/spec-kit, gsd-build/get-shit-done, Fission-AI/OpenSpec

## Orchestrator Awareness (v1.2.0)

This command runs in one of two modes:

- **Standalone mode** (default): invoked directly by the user (`/write-spec`). Run the full flow INCLUDING "Step 6: Notify User".
- **Orchestrator mode**: invoked by `/kickoff` as part of the end-to-end pipeline. Detect this when the calling context contains the literal token `[ORCHESTRATOR-MODE]`. In this mode:
  1. **Skip "Step 6: Notify User"** — do not print next-steps or wait for input. The orchestrator drives the next phase.
  2. **Do not signal end-of-turn** as if awaiting the user. Return control silently to the orchestrator.
  3. **Return a structured result** as your final output so the orchestrator proceeds:
     ```json
     { "command": "write-spec", "specDir": "specs/{N}-{slug}/", "artifact": "specs/{N}-{slug}/spec.md", "status": "written", "marker": ".spec-in-progress" }
     ```

## Instructions

### Step 1: Gather Context

1. Read the global spec template:
   - Path: `~/.spec-workflow/templates/global-guidance.md`
   - This defines the required sections and quality standards

2. Read project-specific custom items (if exists):
   - Path: `{project_root}/.claude/spec-custom.md`
   - Merge custom items into the global template

3. Read project constraints (if exists):
   - Path: `{project_root}/CLAUDE.md`
   - Incorporate relevant constraints (port numbers, tech stack, coding rules)

### Step 2: Determine Feature Directory

1. Check if `specs/` directory exists in project root. If not, create it.
2. Determine the next feature number:
   - List existing directories in `specs/`
   - Find the highest numbered directory (e.g., `003-xxx`)
   - Next number = highest + 1 (e.g., `004-yyy`)
3. Create directory: `specs/{number}-{feature-slug}/`
   - slug = lowercase, hyphenated, descriptive (e.g., `user-auth`, `payment-retry`)

### Step 3: Create spec.md

Create `specs/{number}-{feature-slug}/spec.md` with this structure:

```markdown
---
id: {feature-slug}
title: {Feature Name}
status: draft
priority: medium
created: {today YYYY-MM-DD}
updated: {today YYYY-MM-DD}
---

# {Feature Name}

## Overview
{Background + motivation. WHY this is needed. No tech stack.}

## Goals
- [ ] {Goal 1: measurable outcome}
- [ ] {Goal 2: measurable outcome}

## Out of Scope
- {What is explicitly NOT included}
- {Future iteration items}

## Requirements

### Functional Requirements
1. FR-01: The system SHALL {specific behavior}
2. FR-02: The system SHALL {specific behavior}
3. FR-03: The system SHOULD {recommended behavior}

### Non-Functional Requirements
- Performance: {concrete metric, e.g., response time < 200ms}
- Security: {auth, data protection requirements}
- Compatibility: {browsers, devices, OS}
- Reliability: {error handling, recovery}

## Acceptance Criteria

AC-01: {Short description}
  GIVEN {initial state}
  WHEN {action}
  THEN {expected result}
  Edge Cases: {boundary conditions}

AC-02: {Short description}
  GIVEN ...
  WHEN ...
  THEN ...
  Edge Cases: ...

## Edge Cases & Error Handling
- Input validation failures: {what, how handled}
- Network errors: {timeout, retry}
- Permission issues: {unauthorized, forbidden}
- Concurrency: {race conditions, double-submit}
- Empty data: {no results, blank state}
- Large data: {pagination, limits}

## Open Questions
| # | Question | Status | Owner |
|---|----------|--------|-------|
| 1 | {unresolved question} | Open | {who decides} |

## Clarifications
{Will be filled during spec review}

## Review History
- [{today}] Initial draft
```

### Step 4: Quality Self-Check

Before finalizing, verify:
- [ ] No tech stack mentioned in Overview or Requirements (belongs in plan.md)
- [ ] Every FR uses SHALL/SHOULD language (no "maybe", "might", "probably")
- [ ] Every AC uses GIVEN/WHEN/THEN format
- [ ] Out of Scope has at least 1 item
- [ ] Edge Cases has at least 3 items
- [ ] No vague language ("etc", "similar", "about", "roughly")
- [ ] Max 10 Acceptance Criteria (split if more)

### Step 5: Create Marker File

After creating spec.md:
- Run: `echo. > specs\{number}-{feature-slug}\.spec-in-progress` (Windows) or `touch specs/{number}-{feature-slug}/.spec-in-progress`
- Marker files live INSIDE the spec directory, not in the project root
- This tells kickoff's state machine that spec writing is in progress for this specific spec

### Step 6: Notify User

Inform the user:
1. Spec created at `specs/{number}-{feature-slug}/spec.md`
2. Next steps:
   - **Clarify**: Review the spec and discuss any unclear points
   - **Review**: The spec-reviewer will audit the spec
   - **Plan**: After approval, run `/write-plan` to create the technical plan
   - **Tasks**: After plan approval, run `/write-tasks` to break down into tasks
   - **Implement**: Run `/implement-spec` to execute

### CRITICAL RULES

1. **Spec = What + Why, NOT How** — No tech stack, no file paths, no code
2. **SHALL/MUST/SHOULD only** — No fuzzy words
3. **Every AC must be testable** — Given/When/Then format, concrete PASS/FAIL
4. **Out of Scope is mandatory** — If you can't think of anything, you haven't thought enough
5. **Edge cases are mandatory** — Happy path only = incomplete spec
6. **Max 10 ACs** — Split into multiple specs if the feature is too large
