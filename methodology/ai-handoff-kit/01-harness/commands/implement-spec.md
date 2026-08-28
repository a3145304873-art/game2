You are implementing a feature by executing tasks from an approved spec and plan.

> This is Step 5 in the Spec-First workflow: Spec → Plan → Tasks → **Implement**

## Prerequisites

Before proceeding, verify:
1. `specs/{number}-{feature-slug}/spec.md` exists with `status: approved`
2. `specs/{number}-{feature-slug}/plan.md` exists with `status: approved`
3. `specs/{number}-{feature-slug}/tasks.md` exists
4. If any file is missing or not approved, tell the user which step to complete first

## Orchestrator Awareness (v1.3.0)

This command runs in one of two modes:

- **Standalone mode** (default): invoked directly by the user (`/implement-spec`). Run the full flow as written.
- **Orchestrator mode**: invoked by a parent orchestrator that prepends the `[ORCHESTRATOR-MODE]` token. (Note: kickoff v1.3.0 no longer drives implement — it ends at the Phase 5.5 planning gate; this branch is retained for future/standalone orchestrators.) In this mode:
  1. **Do not signal end-of-turn or ask the user to proceed** after each phase — the caller drives subsequent phases.
  2. **Return a structured result** when all tasks complete:
     ```json
     { "command": "implement-spec", "specDir": "specs/{N}-{slug}/", "status": "implemented", "tasksTotal": 0, "tasksDone": 0, "deferred": [] }
     ```
  3. Any **Major deviation / defer decision** still MUST stop and escalate to the orchestrator (which pauses for human input) — never silent.

## Instructions

### Step 1: Load All Context

Read ALL spec files before writing any code:
1. `spec.md` — requirements and acceptance criteria
2. `plan.md` — technical approach and decisions
3. `data-model.md` — database schema (if exists)
4. `contracts/` — API specifications (if exists)
5. `research.md` — tech stack notes (if exists)
6. `tasks.md` — the task breakdown to execute
7. `CLAUDE.md` — project-level rules and constraints

### Step 2: Execute Tasks in Order

Process tasks from `tasks.md` following these rules:

1. **Respect phase order** — Complete Phase 1 before starting Phase 2
2. **Respect dependencies** — Don't start a task until its dependencies are done
3. **Mark tasks as you go** — Update `[ ]` to `[x]` in tasks.md after each task
4. **Commit after each task** — One atomic commit per completed task

#### Task Execution Pattern

For each task:
1. Read the task description, files, and verification criteria
2. Implement the code changes
3. Run verification (as specified in the task's Verify field)
4. If verification passes:
   - Update tasks.md: mark task as `[x]`
   - Update tasks.md frontmatter: `status: in-progress`
   - **Run Pre-Commit Gate (see Step 2b)** — must PASS before committing
   - Commit with message: `feat({feature-slug}): {task title}`
5. If verification fails:
   - Fix the issue
   - Re-verify
   - Then commit (still subject to Pre-Commit Gate)

### Step 2b: Pre-Commit Gate (silent-defer blocker)

Before every `git commit`, run this gate. It prevents the feat-1 T09 failure mode where a commit message claims coverage of FR-XX but the notes defer it.

**Procedure:**

1. Read the staged commit message + the current task's Notes field.
2. Scan for defer keywords using this regex (case-insensitive):
   ```
   /\b(defer|deferred|TODO|follow-up|follow up|后续\s*spec|后续\s*任务|后续\s*阶段|Phase\s*[2-9]|out of scope|split\s+into|not\s+in\s+this\s+task|留到|留待|暂不实现|暂缓)\b/i
   ```
3. If NO defer keyword detected → **GATE PASS**, proceed to commit.
4. If a defer keyword IS detected → require ALL THREE of the following before committing, else **BLOCK**:
   - **(a) Coverage Matrix** — the affected FR/AC row's Status is updated to `Deferred` (or `Partial` if partly implemented). It must NOT still say `Implemented` / `Pending`.
   - **(b) Deferral Log** — a row exists in TASKS.md's Deferral Log for this FR/AC (Task / Deferred FR或AC / Reason / Follow-up Spec ID / Approved By).
   - **(c) Commit Message** — the title no longer claims coverage of the deferred FR. If the title says `(FR-06)` but notes say deferred, remove `(FR-06)` from the title.
5. If any of (a)/(b)/(c) is missing → **BLOCK the commit** and instruct:
   - "Defer keyword detected but Coverage Matrix / Deferral Log / commit title not synced. Complete the three-sync before committing."
6. Gate PASS → commit.

### Step 3: Update Progress

After each task, update `tasks.md`:

```markdown
- [x] T01: {Task title}
  - **Committed:** {short hash} "feat: {message}"
  - **Notes:** {any deviations from plan}
```

### Step 3b: Phase-level Review Gate

At the end of every Phase (not just at the end of all implementation), run a mini consistency check. This catches silent-defer / stale-coverage-matrix problems before they compound across phases.

**When triggered:** after the last task of a Phase is committed, before starting the first task of the next Phase.

**Procedure:**

1. Launch **reviewer Agent** in "Phase-level mini check" mode:
   - Use Agent tool, subagent_type="general-purpose"
   - Pass: Phase number, list of FR/AC this Phase claims to cover, and the spec dir path
2. The mini check does:
   - Read every commit message in this Phase (`git log <phase-start-sha>..HEAD --oneline`)
   - For each FR the commits claim to cover (title mentions `(FR-XX)`), compare against Coverage Matrix:
     - Is the FR row still marked `Implemented` / `Pending` while commits actually defer it? → FAIL
     - Is the FR row marked `Deferred` but a commit landed real code for it? → FAIL (stale matrix)
   - Read `git diff --stat` to confirm the commits touched the files the tasks listed
3. Result:
   - **PASS**: proceed to next Phase
   - **FAIL**: BLOCK entry to the next Phase. Force one of:
     - Update Coverage Matrix to reflect reality (`Implemented` / `Partial` / `Deferred`)
     - Add missing commit / split commit to match the claimed coverage
     - Explicitly defer with full three-sync (Matrix + Deferral Log + commit title)

### Step 4: Handle Deviations

If implementation deviates from the spec or plan:

1. **Minor deviation** (judgment criteria below):
   - Note it in the task's Notes field
   - Continue implementation
   - Update plan.md if the deviation affects subsequent tasks

2. **Major deviation** (judgment criteria below):
   - STOP implementation
   - Discuss with user
   - Update spec.md or plan.md as needed
   - Resume after approval

**Minor vs Major judgment criteria:**

| Dimension | Minor | Major |
|-----------|-------|-------|
| Files touched | Single file | Cross-file / cross-module |
| Behavior | Same behavior, different internal approach | Different observable behavior |
| Requirements | No FR/AC affected | Any FR/AC missing or changed |
| Defer | None | **Any defer of an FR/AC = automatically Major** |

**Defer auto-escalation rule:** Any decision to defer an FR/AC (SHALL or SHOULD) is **automatically Major**, regardless of scope size. Minor deviations never defer requirements — they only change how an already-met requirement is implemented. If you find yourself wanting to defer, STOP and discuss with the user.

**Rule: Code that deviates from spec = Bug. Fix the code or update the spec.**

### Step 5: Final Verification

After all tasks are complete:

1. Run through ALL acceptance criteria from spec.md
2. For each AC, verify:
   - GIVEN preconditions are set up
   - WHEN action is triggered
   - THEN expected result occurs
3. Run the testing strategy from plan.md:
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] E2E tests pass (if applicable)
4. Update spec.md frontmatter: `status: implemented`
5. Update tasks.md frontmatter: `status: completed`

### Step 6: Final Commit

```bash
git add specs/
git commit -m "docs(spec): complete implementation of {feature-slug}"
```

### CRITICAL RULES

1. **Read before write** — Read ALL spec files before writing any code
2. **One task = one commit** — Atomic commits for traceability
3. **Spec is truth** — Code that deviates from spec is a bug
4. **Verify as you go** — Don't batch verification to the end
5. **Update tasks.md** — Keep task status current so progress is visible
6. **Don't skip phases** — Foundation before logic, logic before UI
7. **Follow CLAUDE.md rules** — Port numbers, coding style, testing requirements
8. **Pre-Commit Gate is mandatory** — Step 2b runs before every commit; defer keywords require three-sync
9. **Phase-level Review Gate** — Step 3b runs at every Phase boundary; cannot enter next Phase with a stale Coverage Matrix
10. **Defer = Major deviation** — Any defer of an FR/AC auto-escalates to Major; STOP and discuss with user
