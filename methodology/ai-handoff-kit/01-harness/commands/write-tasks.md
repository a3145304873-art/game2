You are creating an atomic task breakdown based on approved spec and plan.

> This is Step 4 in the Spec-First workflow: Spec → Plan (approved) → Tasks → Implement

## Prerequisites

Before proceeding, verify:
1. `specs/{number}-{feature-slug}/spec.md` exists with `status: approved`
2. `specs/{number}-{feature-slug}/plan.md` exists with `status: approved`
3. If either is not approved, tell the user to approve them first

## Orchestrator Awareness (v1.2.0)

This command runs in one of two modes:

- **Standalone mode** (default): invoked directly by the user (`/write-tasks`). Run the full flow INCLUDING "Step 6: Notify User".
- **Orchestrator mode**: invoked by `/kickoff`. Detect via the `[ORCHESTRATOR-MODE]` token in the calling context. In this mode:
  1. **Skip "Step 6: Notify User"** — the orchestrator drives the next phase.
  2. **Do not signal end-of-turn.** Return control silently.
  3. **Return a structured result**:
     ```json
     { "command": "write-tasks", "specDir": "specs/{N}-{slug}/", "artifact": "specs/{N}-{slug}/tasks.md", "status": "written", "marker": ".tasks-in-progress" }
     ```

## Instructions

### Step 1: Read All Spec Files

1. Read `spec.md` — understand requirements and acceptance criteria
2. Read `plan.md` — understand technical approach and architecture
3. Read `data-model.md` (if exists) — understand DB changes
4. Read `contracts/` (if exists) — understand API changes
5. Read `research.md` (if exists) — understand tech stack details

### Step 2: Read Template

1. Read the tasks template: `~/.spec-workflow/templates/tasks-template.md`

### Step 3: Break Down Into Tasks

Create `specs/{number}-{feature-slug}/tasks.md` following these principles:

1. **Organize by Phase** — Group related tasks:
   - Phase 1: Foundation (models, DB, base setup)
   - Phase 2: Core Logic (business rules, API endpoints)
   - Phase 3: Integration (connect components, data flow)
   - Phase 4: UI/Frontend (user-facing changes)
   - Phase 5: Polish (edge cases, error handling, tests)
   - Skip phases that don't apply

2. **Each Task Must Have:**
   - Unique ID (T01, T02, T03...)
   - Clear description of what to do
   - Specific file paths to create/modify
   - Verification criteria (how to know it's done)
   - Dependency reference (which tasks must complete first)
   - AC coverage (which acceptance criteria it satisfies)

3. **Task Granularity:**
   - Each task should be completable in ONE context window
   - If a task touches 5+ files, it's probably too big — split it
   - If a task is just "update a comment", it's too small — merge it

4. **Parallel Tasks:**
   - Use `[P]` prefix for tasks that can run simultaneously
   - Tasks in the same phase with `Depends: none` are implicitly parallel
   - Explicitly mark with `[P]` for clarity

5. **Traceability:**
   - Every task must map to at least one AC
   - Every AC must be covered by at least one task
   - No orphan tasks and no orphan ACs

### Step 4: Create tasks.md

```markdown
---
spec: {feature-slug}
plan: approved
status: pending
created: {today YYYY-MM-DD}
updated: {today YYYY-MM-DD}
---

# Tasks: {Feature Name}

## Phase 1: {Phase Name}
> Objective: {what this phase achieves}

- [ ] T01: {Task title}
  - **Description:** {what to do}
  - **Files:** {paths to create/modify}
  - **Verify:** {how to verify completion}
  - **Depends:** none
  - **AC covered:** AC-01

- [ ] T02: {Task title}
  - **Description:** ...
  - **Files:** ...
  - **Verify:** ...
  - **Depends:** T01
  - **AC covered:** AC-01, AC-02

## Phase 2: {Phase Name}
...

## Coverage Matrix
| AC | Tasks | Status |
|----|-------|--------|
| AC-01 | T01, T02 | Pending |
| AC-02 | T02, T03 | Pending |
```

### Step 5: Coverage Check

Verify:
- [ ] Every AC from spec.md is covered by at least one task
- [ ] Every task maps to at least one AC
- [ ] Dependencies are acyclic (no circular references)
- [ ] All file paths from plan.md appear in at least one task
- [ ] No task depends on a task from a later phase

### Step 6: Notify User

Inform the user:
1. Tasks created at `specs/{number}-{feature-slug}/tasks.md`
2. Total tasks: {N}, Phases: {M}
3. Next step: Run `/implement-spec` to start executing tasks

### CRITICAL RULES

1. **Atomic tasks** — Each task = one unit of work, one commit
2. **Every AC covered** — No acceptance criteria left without a task
3. **Real dependencies** — Only add `Depends` if there's a real technical dependency
4. **Concrete verification** — "It works" is not verification. Be specific about what to check
5. **File paths are exact** — List actual file paths, not "some file" or "etc."

### Step 7: Create Marker

Create marker file INSIDE the spec directory: `specs/{number}-{feature-slug}/.tasks-in-progress`
This signals to kickoff's state machine that tasks have been written for this specific spec and need independent review.

After the review passes, the **orchestrator** (not the reviewer — reviewers are read-only in v1.2.0) writes `specs/{number}-{feature-slug}/.tasks-passed`, then `.tasks-in-progress` can be cleaned up.
