You are creating a technical implementation plan based on an approved spec.

> This is Step 3 in the Spec-First workflow: Spec (approved) → Plan → Tasks → Implement

## Prerequisites

Before proceeding, verify:
1. A spec.md exists in `specs/{number}-{feature-slug}/`
2. The spec has `status: approved` in its frontmatter
3. If spec is not approved, tell the user to run `/write-spec` first and get it reviewed

## Orchestrator Awareness (v1.2.0)

This command runs in one of two modes:

- **Standalone mode** (default): invoked directly by the user (`/write-plan`). Run the full flow INCLUDING "Step 6: Notify User".
- **Orchestrator mode**: invoked by `/kickoff`. Detect via the `[ORCHESTRATOR-MODE]` token in the calling context. In this mode:
  1. **Skip "Step 6: Notify User"** — the orchestrator drives the next phase.
  2. **Do not signal end-of-turn.** Return control silently.
  3. **Return a structured result**:
     ```json
     { "command": "write-plan", "specDir": "specs/{N}-{slug}/", "artifact": "specs/{N}-{slug}/plan.md", "status": "written", "marker": ".plan-in-progress" }
     ```

## Instructions

### Step 1: Read the Spec

1. Find the latest spec directory in `specs/`
2. Read `specs/{number}-{feature-slug}/spec.md` completely
3. Understand every requirement (FR-XX) and acceptance criteria (AC-XX)
4. Note any open questions or clarifications

### Step 2: Read Templates

1. Read the plan template: `~/.spec-workflow/templates/plan-template.md`
2. Read project constraints: `{project_root}/CLAUDE.md` (if exists)

### Step 3: Create plan.md

Create `specs/{number}-{feature-slug}/plan.md` with this structure:

```markdown
---
spec: {feature-slug}
status: draft
created: {today YYYY-MM-DD}
updated: {today YYYY-MM-DD}
---

# Technical Plan: {Feature Name}

## Technical Approach
{Architecture, tech stack, implementation strategy}
{Why this approach was chosen over alternatives}
{Reference spec requirements by ID: FR-01, FR-02, etc.}

## Data Model
{If DB changes needed: new tables, modified tables, indexes, migration}
{If complex → create separate data-model.md and reference it here}

## API Contracts
{If API changes needed: new endpoints, modified endpoints, request/response}
{If complex → create contracts/ directory and reference here}

## Key Decisions
| # | Decision | Options Considered | Choice | Rationale |
|---|----------|-------------------|--------|-----------|
| 1 | ... | A, B, C | A | ... |

## Risks & Mitigations
| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 1 | ... | High/Med/Low | High/Med/Low | ... |

## Testing Strategy
- [ ] Unit Tests: {what to unit test}
- [ ] Integration Tests: {what to integration test}
- [ ] E2E Tests: {critical user journeys}

## Dependencies
- [ ] {new library / external service / team dependency}
```

### Step 4: Create Additional Files (if needed)

Based on the plan content, optionally create:

- **data-model.md** — If 3+ tables or complex migration needed
  - Use template: `~/.spec-workflow/templates/data-model-template.md`
  - Path: `specs/{number}-{feature-slug}/data-model.md`

- **contracts/api-spec.json** — If 3+ API endpoints
  - Path: `specs/{number}-{feature-slug}/contracts/api-spec.json`

- **research.md** — If new/unfamiliar tech stack
  - Path: `specs/{number}-{feature-slug}/research.md`
  - Include: library versions, compatibility notes, gotchas

### Step 5: Coverage Check

Verify the plan covers ALL spec requirements:

```markdown
## Requirement Coverage
| Spec Requirement | Plan Section | Status |
|-----------------|--------------|--------|
| FR-01 | {plan section} | Covered |
| FR-02 | {plan section} | Covered |
| AC-01 | Testing Strategy | Covered |
| AC-02 | Testing Strategy | Covered |
```

If any requirement is NOT covered, add it to the plan.

### Step 6: Notify User

Inform the user:
1. Plan created at `specs/{number}-{feature-slug}/plan.md`
2. Additional files created (if any)
3. Next steps:
   - **Review**: Check the plan, especially Key Decisions and Risks
   - **Tasks**: After plan approval, run `/write-tasks` to create task breakdown
   - **Implement**: Run `/implement-spec` to execute

### CRITICAL RULES

1. **Every FR must be addressed** — No orphan requirements
2. **Every tech choice needs a reason** — Not just "because it's popular"
3. **Risks must be real** — Don't list "server might catch fire" if it's irrelevant
4. **Testing strategy must cover all ACs** — Map ACs to test types
5. **Keep plan.md focused on HOW** — Refer back to spec.md for WHAT and WHY

### Step 7: Create Marker

Create marker file INSIDE the spec directory: `specs/{number}-{feature-slug}/.plan-in-progress`
This signals to kickoff's state machine that a plan has been written for this specific spec and needs independent review.

After the review passes, the **orchestrator** (not the reviewer — reviewers are read-only in v1.2.0) writes `specs/{number}-{feature-slug}/.plan-passed`, then `.plan-in-progress` can be cleaned up.
