# /kickoff — Planning Orchestrator (v1.3.0)

> Orchestrates the PLANNING pipeline (Phase 1–5) autonomously, then pauses for ONE human
> review gate. The human participates at exactly **one** gate: the planning batch review
> after Phase 5 (read spec.md, confirm plan/tasks are consistent). Implementation onwards
> (implement → code review → QA → merge-ready) is driven by standalone commands that the
> human launches in a NEW session. Planning runs fully autonomously, cross-session resumable.
>
> **Source of truth**: `specs/{N}-{slug}/.pipeline-state.json`
> **Markers**: written by THIS orchestrator only (reviewers are read-only).

## Arguments

$ARGUMENTS — Feature description (e.g., "user authentication with OAuth2").
- With a description AND no in-progress spec → start a new pipeline.
- With NO argument AND an in-progress spec exists → **resume** the pipeline.

## Core Design

This command is a **state machine**. State lives in `specs/{N}-{slug}/.pipeline-state.json`
(the single source of truth for current phase, sub-step, per-phase round counts, and
human-ack gates). On every entry the orchestrator reads it; on every phase boundary it
writes it. If the file is missing or corrupted, state is rebuilt from the marker set
(markers are simpler and rarely corrupt — they win on conflict).

### Structural guarantees (do not rely on LLM honesty)

1. **Reviewers are read-only named subagents.** Each review phase launches the matching
   named agent (`spec-reviewer`, `plan-reviewer`, `tasks-reviewer`, `consistency-reviewer`,
   `reviewer`, `qa-tester`) whose `allowed-tools` forbid marker writes. The reviewer
   returns a structured JSON conclusion — it NEVER writes a marker (M2/M3).
2. **The orchestrator owns marker writes.** After receiving reviewer JSON, the orchestrator
   validates it for self-consistency (see §Orchestrator Primitives) and only then writes
   the `.xxx-passed` marker. A reviewer cannot forge a pass.
3. **`.pipeline-state.json` is the fact source.** Round ceilings, current phase, and ack
   state all live here. A `Stop` hook (`stop-round-gate.js`, Claude side) reads it on
   session exit and blocks the stop if a phase is over ceiling without a human ack.

### Round ceilings (from `state.roundsPerPhase` — single source of truth, M1)

| Phase | Key | Ceiling |
|-------|-----|---------|
| 1 SPEC / 2 PLAN / 3 TASKS | spec/plan/tasks | 5 |
| 4 Consistency | consistency | 2 |
| 5 Readiness | readiness | 2 |

Phase 6–9 (implement / code review / QA / merge-ready) are **standalone commands**
(`/implement-spec`, `/review`, `/qa`, `/merge-ready`), launched by the human in a new
session — NOT driven by kickoff. Their ceilings (review=3, qa=2) remain in
`roundsPerPhase` for those standalone commands to use.
Escalation is mandatory at any planning ceiling — see P4.

---

## Step 0a: Project Override Detection

Before any state work, check for a project override.

```
1. Detect <project-root>/docs/development/spec-workflow.md
   - NOT present → global defaults:
       spec_dir = specs/   file_naming = uppercase   status_mechanism = marker
   - PRESENT → read its YAML frontmatter `spec_workflow` block for spec_dir /
     file_naming / status_mechanism / templates.project_override /
     deferral_requires_user_approval
2. Display detected mode.
```

Substitute detected values wherever this doc writes `specs/{N}-{slug}/` and `SPEC.md`.

## Step 0b: Migrate Legacy Markers (backward compatibility)

If legacy root-level markers (`.spec-passed`, `.plan-passed`, etc.) exist AND `specs/`
exists: move them into the latest numbered spec dir (don't overwrite existing), delete
the root copies, display "Migrated legacy markers".

---

## Step 1: Load / Reconcile Pipeline State

### 1.1 Find the active spec directory

```
specs/ absent  → create specs/, start fresh at Phase 1
specs/ present → pick the highest-numbered dir as the active spec
```

### 1.2 Read `.pipeline-state.json` (or rebuild from markers)

Read `specs/{N}-{slug}/.pipeline-state.json`:
- **Present & valid** → use it as `state`.
- **Missing or unparseable** → **rebuild from the marker set** (Phase 3 robustness):
  - For each `.xxx-passed` present, set `phaseStatus[<phase>].status = completed`,
    `marker = ".xxx-passed"`. Derive `currentPhase` = highest completed phase + 1.
  - `rounds` defaults to the marker's embedded `rounds` field if present, else 1.
  - Write the rebuilt state file. Display "Rebuilt .pipeline-state.json from markers".
- **State vs marker conflict** → **markers win**: if a marker exists but state says
  pending, trust the marker, set the phase completed, and self-heal state.

### 1.3 Decide: resume or start new

| Active spec state | $ARGUMENTS? | Action |
|-------------------|-------------|--------|
| `.implement-readiness-passed` present (planning done — even if `currentPhase` says 6–9 from a v1.2.0 state) | any | **planning-complete**: show PLANNING-COMPLETE summary + hint to run `/implement-spec` in a new window. Do NOT run Phase 6. |
| `currentPhase` 6–9 in state BUT `.implement-readiness-passed` MISSING (v1.2.0 drift) | any | markers win: derive `currentPhase` = highest present planning marker + 1, resume there. Warn "v1.2.0 state had currentPhase=N but planning markers incomplete; resuming at Phase M." |
| All phases complete (`.merge-ready-passed`) | YES | new spec dir, fresh pipeline |
| All phases complete | NO | show final summary, hint at new |
| In progress (planning phase 1–5 pending/in-progress) | any | **resume**: read `currentPhase`/`currentSubStep`, display "Resuming from Phase X round Y/Z", continue |
| No markers, dir exists | any | run Phase 1 write-spec for this dir |

When creating a new spec dir: number = highest existing + 1, zero-padded 3 digits.

---

## Orchestrator Primitives (used by every phase)

### P1: Write-Phase (delegate to a write-* command)

Invoke the matching `/write-*` command with the literal token **`[ORCHESTRATOR-MODE]`**
prepended to its input, so the command suppresses its Notify-User step and returns a
structured JSON result (M5). Wait for it to create the artifact + `.xxx-in-progress`.

### P2: Review-Phase (launch reviewer → validate → marker → round-loop)

For review phases (1.2, 2.2, 3.2, 4, 5):

1. **Assemble the reviewer prompt dynamically**: read the target doc(s) + the matching
   checklist (`~/.spec-workflow/checklists/`) + these review instructions. (In
   orchestrator mode, do NOT depend on a standalone `.xxx-review-prompt.md` file — M8.)
2. **Launch the named reviewer agent** with `subagent_type` = the agent name:
   `spec-reviewer` / `plan-reviewer` / `tasks-reviewer` / `consistency-reviewer` /
   `reviewer` / `qa-tester`. Pass the assembled prompt.
3. **Receive the reviewer's JSON** (reviewType / conclusion / roundNumber / reportFile /
   criticalCount / warningCount / findings / reviewerSelfReport).
4. **Validate JSON self-consistency** (M2 / Phase 3 hardening):
   - `conclusion ∈ {PASS, FAIL}`
   - `criticalCount == findings.filter(severity==="CRITICAL").length`
   - `conclusion === "PASS" ⟺ criticalCount === 0`
   - On failure: do NOT write a marker. Record a CRITICAL "reviewer returned
     self-contradictory JSON" and re-run the reviewer (counts as a round).
5. **Branch on conclusion**:
   - **PASS** → orchestrator writes `.xxx-passed` marker (see P3), clean up
     `.xxx-in-progress`, set doc frontmatter `status: approved`, advance phase.
   - **FAIL** → increment `phaseStatus[phase].rounds`. If `rounds < ceiling`:
     read the report, fix CRITICALs in the source artifact, re-run P2 (loop).
     If `rounds >= ceiling`: apply P4 (escalate).
6. **Persist state** after every round (update `rounds`, `lastTimestamp`, `sessionHints`).

### P3: Orchestrator writes the marker

When P2 validates PASS, the orchestrator (this command) writes the `.xxx-passed` marker:

```json
{
  "type": "<spec|plan|tasks|consistency|readiness|review|qa>",
  "conclusion": "PASS",
  "specDir": "specs/{N}-{slug}/",
  "reportFile": "reviews/<name>-review-<round>.md",
  "rounds": <N>,
  "criticalCount": 0,
  "warningCount": <N>,
  "orchestratorVerified": true,
  "reviewerAgent": "<agent-name>",
  "reviewerToolset": ["Read", "Glob", "Grep"],
  "reviewerModel": "glm-5.1"
}
```

`orchestratorVerified:true` is the proof the JSON was validated (M4) — it is NOT a
reviewer self-attestation.

### P4: Escalate (mandatory at any planning ceiling)

When any planning phase (1 SPEC / 2 PLAN / 3 TASKS / 4 Consistency / 5 Readiness) hits its
round ceiling still FAIL:
- Set `phaseStatus[phase].status = "escalated"` and `sessionHints.escalatedToHuman = true`.
- **STOP autonomous progress.** Surface the remaining CRITICALs / failed ACs to the user
  with the report path. This is a hard escalation point — never silently end.
- Wait for human resolution, after which re-running `/kickoff` resumes from this phase.
  The human either fixes the source artifact (rounds reset on the next PASS) or triggers a
  redo (see Phase 5.5 REDO) to regenerate from Phase 1.

---

## Phase 1: SPEC

### 1.1 Write Spec (P1)
If `.spec-passed` absent: invoke `/write-spec` with `[ORCHESTRATOR-MODE]` + the feature
description. Wait for `spec.md` + `.spec-in-progress`.

### 1.2 Spec Review (P2)
Launch `spec-reviewer`. Validate JSON. On PASS → orchestrator writes `.spec-passed`,
clean up `.spec-in-progress`, set spec.md `status: approved`. Round ceiling = 5.

### 1.3 Auto-advance to PLAN

After `.spec-passed`, **advance to Phase 2 immediately — no pause.** The human review of
spec.md happens once, later, at the Phase 5.5 planning batch review gate (after ALL of
spec/plan/tasks + consistency + readiness are done), so the human judges a complete,
self-consistent planning set rather than a bare spec.

---

## Phase 2: PLAN

### 2.1 Write Plan (P1): `/write-plan` with `[ORCHESTRATOR-MODE]`.
### 2.2 Plan Review (P2): launch `plan-reviewer`. Ceiling = 5. On PASS → `.plan-passed`.

## Phase 3: TASKS

### 3.1 Write Tasks (P1): `/write-tasks` with `[ORCHESTRATOR-MODE]`.
### 3.2 Tasks Review (P2): launch `tasks-reviewer` (doc-consistency mode). Ceiling = 5. On PASS → `.tasks-passed`.

## Phase 4: Consistency Review

Launch `consistency-reviewer` (planning-phase mode) reading all three docs. Ceiling = 2.
On PASS → `.consistency-passed`. On FAIL → identify root-cause phase, clean that phase's
marker (and later phases'), loop back to the root phase.

## Phase 5: Implement-Readiness Final Check

Launch `tasks-reviewer` in **implement-readiness mode** (executable Verify, complete
Dependencies, actionable Files, honest AC coverage). Ceiling = 2. On PASS → write
`.implement-readiness-passed`. On FAIL → fix tasks, loop back to Phase 3 review
(doc-consistency), re-check readiness.

---

## Phase 5.5: HUMAN GATE — planning batch review (mandatory pause)

**This is the single human touchpoint.** After `.implement-readiness-passed`, do NOT
proceed to any implementation. Pause and ask the user to:
1. Read `specs/{N}-{slug}/spec.md` (the primary artifact).
2. Confirm plan.md / tasks.md are consistent with the spec (the consistency-reviewer and
   readiness check already passed; this is the human's final judgment).

**Idempotency:** if `.implement-passed` (or any later marker) already exists, the human has
already moved past planning in a prior session — skip the gate prompt and show the
PLANNING-COMPLETE summary only.

Only when the user explicitly responds:

- **`proceed` / `approved`** →
  - Record `humanAckGates: [{ phase:5, gate:"planning-batch-review", status:"passed" }]`.
  - Advance `currentPhase` to 6 and `currentSubStep` to `planning-complete`.
  - Display the PLANNING-COMPLETE summary (below) and **end kickoff**. Hint the user to
    open a NEW window and run `/implement-spec` there. Implementation, code review, QA,
    and merge-ready are separate commands the human drives in that new session.

- **`redo [explanation]`** (human rejects the direction) → trigger the **REDO** flow below.

### REDO flow (in-place, same spec number)

The reset order is critical: **clear markers BEFORE rewriting state**, otherwise the
§1.2 "markers win on conflict" rule would re-mark the phases completed and skip the redo.

1. **Backup**: copy `spec.md`, `plan.md`, `tasks.md` and the five planning markers into
   `specs/{N}-{slug}/.redo-backups/<timestamp-or-redoN>/` (use a timestamp; if no clock is
   available, use `redo-1`, `redo-2`, … incrementing). Never skip the backup.
2. **Delete the five markers**: `.spec-passed`, `.plan-passed`, `.tasks-passed`,
   `.consistency-passed`, `.implement-readiness-passed`. Also remove any `humanAckGates`
   entry for `{phase:5, gate:"planning-batch-review"}`.
3. **Rewrite `.pipeline-state.json`**:
   - `phaseStatus["1-spec"…"5-readiness"]`: `status:"pending"`, `rounds:0`, `marker:null`,
     `lastReport:null`.
   - `currentPhase:1`, `currentSubStep:"write-spec"`.
   - `sessionHints.resumeHint:"Redo in progress: <explanation>"`.
   - Keep `specDir`, `roundsPerPhase`, `schemaVersion`, `lastTimestamp`.
4. **Prepend the redo explanation** to the Phase 1.1 write-spec input as a
   `REVISION CONTEXT:` block above the original requirement, so the rewrite is informed by
   what the human rejected.
5. **Re-run Phase 1 → 5 fully autonomously** (Phase 1.3 no longer pauses). Arrive at this
   gate again for the next proceed/redo decision.

The spec directory number does NOT change — one requirement maps to one number, and a redo
revises that same requirement.

---

## Cross-Session Resume Protocol

A new session running `/kickoff` with no argument:
1. Step 1 reads `.pipeline-state.json`.
2. If `escalatedToHuman` is true and the blocking issue is unresolved → re-display the
   escalation and wait (do not silently retry).
3. Otherwise display "Resuming from Phase X round Y/Z (sub-step: …)" and continue from
   `currentSubStep`. The `stop-round-gate` hook enforces that a session cannot end while
   a planning phase is over ceiling — that is an escalation (P4), resolved by fixing the
   artifact + re-running (or a redo), not by an ack.

State-vs-marker drift on resume → markers win, self-heal state (§1.2).

---

## Final Summary (PLANNING-COMPLETE)

After the human `proceed`s at the Phase 5.5 gate, display:

```
==========================================
  PLANNING COMPLETE (v1.3.0)
==========================================

  Spec:   specs/{N}-{slug}/

  SPEC ✓  PLAN ✓  TASKS ✓  Consistency ✓  Readiness ✓

  Reports: specs/{N}-{slug}/reviews/
  State:   specs/{N}-{slug}/.pipeline-state.json

  NEXT STEPS (in a NEW window/session):
    /implement-spec   → execute tasks (one commit per task)
    /review           → independent code review
    /qa               → browser end-to-end acceptance
    /merge-ready      → merge readiness check

  kickoff's job ends here. Planning ran autonomously
  except the single planning batch review gate.
==========================================
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Feature description missing & no in-progress spec | ask user for description |
| State file corrupted | rebuild from marker set (§1.2) |
| State vs marker conflict | markers win, self-heal state |
| Reviewer returns self-contradictory JSON | reject, re-run reviewer (counts as a round) |
| Planning round ceiling hit (1–5) | STOP, surface remaining issues, escalate (P4) |
| Redo requested at Phase 5.5 gate | run REDO flow: clear markers, reset state, re-run Phase 1–5 |
| v1.2.0 state with currentPhase 6–9 | see §1.3 table: readiness marker present → planning-complete; missing → resume at highest marker+1 |
| Ctrl+C / session crash | state file + markers preserve progress; `/kickoff` resumes (mid-redo context in `sessionHints.resumeHint`) |
| stop-round-gate blocks exit | resolve the blocking phase (fix + re-run, or redo), then resume |

## CRITICAL RULES

1. **State file is truth** — `.pipeline-state.json` drives phase/round/sub-step; markers win on conflict.
2. **Reviewers are read-only named subagents** — never `general-purpose`, never write markers (M3).
3. **Orchestrator owns marker writes** — only after validating reviewer JSON self-consistency (M2).
4. **Never skip a review** — every phase passes its review before advancing.
5. **One human review gate only** — the planning batch review after Phase 5 (Phase 1.3 no longer pauses). Requirement alignment is implicit at kickoff start. Implementation onwards is standalone commands in a new session.
6. **Escalation is mandatory** at any planning ceiling (1–5) — never silently end (P4).
7. **Cross-session resumable** — every phase boundary persists state; resume reads it.
8. **Round ceilings come from `roundsPerPhase`** — never hardcode a different number elsewhere (M1).
