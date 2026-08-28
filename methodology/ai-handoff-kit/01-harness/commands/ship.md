# /ship — Autonomous Spec-Workflow Runner (v1.4.0)

> Runs the ENTIRE spec-workflow lifecycle autonomously: requirements dialogue → spec → plan →
> tasks → consistency → readiness → **alignment review** → implement → code review → QA →
> merge-ready check. **At most two human touchpoints**: (1) a requirements intake at the start
> (an interactive dialogue in standard mode, or a one-shot one-liner in `--yes` express mode),
> and (2) final merge acceptance at the end. Everything between runs autonomously, with
> mandatory ceiling-escalation halts (implement defer, review round-3, QA round-2) and a manual
> push. Cross-session resumable.
>
> **Express mode (`--yes`)**: `/ship --yes <one-line requirement>` skips the requirements
> dialogue entirely — Phase 0 auto-decides every ambiguous point from available info and starts
> the run immediately (see Phase 0 Mode A). Same pipeline, same safety nets; only the up-front
> dialogue is dropped.
>
> `/ship` SUBSUMES kickoff's Phases 1–5 (it reuses the same `write-*`/reviewer building blocks)
> but does NOT invoke `/kickoff` — kickoff's Phase 5.5 gate ends the turn and no caller can
> continue past it. The kickoff human gate is replaced by (a) an explicit requirements dialogue
> up front and (b) the `alignment-reviewer` AI gate before implementation.
>
> **Additive:** this command edits no existing command. It reuses `/write-spec` `/write-plan`
> `/write-tasks`, the 6 reviewer agents, `/implement-spec`, `/review`, `/qa`, `/merge-ready`
> as-is via their `[ORCHESTRATOR-MODE]` / `--auto` seams. Only the thin orchestration glue is
> mirrored from kickoff (sync-comment marks it).
>
> **Source of truth**: `specs/{N}-{slug}/.pipeline-state.json`
> **Markers**: written by THIS orchestrator only (reviewers are read-only).

## Arguments

$ARGUMENTS — Feature description (e.g., "user authentication with OAuth2"). An optional leading
`--yes` token selects **express mode**.

- `/ship <description>` → standard mode: Phase 0 runs an interactive requirements dialogue.
- `/ship --yes <description>` → **express mode**: Phase 0 auto-decides every ambiguous point
  from available info and starts immediately — NO dialogue, no turn-ending wait. The `--yes`
  token must sit right after `/ship` on the same line; the rest of `$ARGUMENTS` is the
  requirement and may span multiple lines (`$ARGUMENTS` preserves newlines). Do NOT wrap the
  requirement in `<>` — that is documentation notation only, never typed.
- With NO argument AND an in-progress spec exists → **resume** the run (the original intake
  mode is irrelevant on resume).
- With NO argument AND a completed spec (`.merge-ready-passed`) → show final summary, hint at new.

## Core Design

This command is a **state machine**, identical in shape to kickoff's but extended to drive
Phases 6–9 in-process. State lives in `specs/{N}-{slug}/.pipeline-state.json` (schema v1.3.0 —
unchanged; `/ship` does NOT alter the state schema). On every entry the orchestrator reads it;
on every phase boundary it writes it. Markers win on conflict vs state (self-heal).

### Structural guarantees (do not rely on LLM honesty)

1. **Reviewers are read-only named subagents** (`spec-reviewer`, `plan-reviewer`,
   `tasks-reviewer`, `consistency-reviewer`, **`alignment-reviewer`**, `reviewer`, `qa-tester`)
   whose `allowed-tools` forbid marker writes. They return JSON — they NEVER write a marker.
2. **The orchestrator owns marker writes** — only after validating reviewer JSON
   self-consistency (see §Orchestrator Primitives P2/P3).
3. **`.pipeline-state.json` is the fact source.** The `stop-round-gate.js` Stop hook reads it
   and blocks exit when a gated phase (1–5, 7, 8) is at its `roundsPerPhase` ceiling without a
   passed ack. `/ship` drives phases 6–9 too, but phases 6 (implement, per-task) and 9 (merge,
   no round loop) are not hook-gated — correct.

### Round ceilings (from `state.roundsPerPhase` — single source of truth, M1)

| Phase | Key | Ceiling |
|-------|-----|---------|
| 1 SPEC / 2 PLAN / 3 TASKS | spec/plan/tasks | 5 |
| 4 Consistency | consistency | 2 |
| 5 Readiness | readiness | 2 |
| 5.6 Alignment | (reuses `readiness` slot, rounds reset on entry) | 2 |
| 7 Code Review | review | 3 |
| 8 QA | qa | 2 |

Phase 6 (implement) is per-task; Phase 9 (merge) has no round loop. Escalation is mandatory at
any ceiling — see P4.

---

<!-- SYNC-NOTE: The §Orchestrator Primitives (P1–P4), §Step 0a/0b, §Step 1 below MIRROR
     kickoff.md. If kickoff changes these, update here too. (Additive strategy: we duplicate
     the thin glue, reuse every underlying skill/agent.) -->

## Step 0a: Project Override Detection

Before any state work, detect `<project-root>/docs/development/spec-workflow.md`.
- NOT present → global defaults: `spec_dir = specs/`, `file_naming = uppercase`,
  `status_mechanism = marker`.
- PRESENT → read its YAML `spec_workflow` block for spec_dir / file_naming / status_mechanism /
  templates.project_override / deferral_requires_user_approval.
Display detected mode. Substitute values wherever this doc writes `specs/{N}-{slug}/` and `SPEC.md`.

## Step 0b: Migrate Legacy Markers

If legacy root-level markers (`.spec-passed`, etc.) exist AND `specs/` exists: move them into
the latest numbered spec dir (don't overwrite), delete root copies, display "Migrated legacy markers".

## Step 1: Load / Reconcile Pipeline State

### 1.1 Resolve the spec directory ONCE (fixes the cross-spec handoff bug)

`/ship` resolves `specDir` **once** and passes it explicitly to every downstream stage. Never
let a downstream command re-derive "latest `specs/{N}-*/`" — that heuristic breaks if two specs
coexist.

- `specs/` absent → (Phase 0 creates it)
- `specs/` present, `.pipeline-state.json` exists & valid → `specDir = state.specDir`
- `specs/` present, no state → `specDir` = highest-numbered dir; (rebuild state from markers)

### 1.2 Read `.pipeline-state.json` (or rebuild from markers)

- Present & valid → use as `state`.
- Missing/unparseable → rebuild from the marker set: for each `.xxx-passed`, set
  `phaseStatus[<phase>].status = completed`, `marker = ".xxx-passed"`; derive
  `currentPhase` = highest completed phase + 1. Write the rebuilt file.
- State vs marker conflict → markers win, self-heal state.

### 1.3 Decide: resume or start new

| Active spec state | $ARGUMENTS? | Action |
|-------------------|-------------|--------|
| `.merge-ready-passed` present (run done) | any | show FINAL-ACCEPTANCE summary, hint at new run |
| In progress (any phase 0–9 pending/in-progress) | any | **resume**: read `currentPhase`/`currentSubStep`, display "Resuming from Phase X round Y/Z", continue |
| `escalatedToHuman === true` and unresolved | any | re-display the escalation, WAIT (do not silently retry) |
| No spec dir / no markers | YES | **new run**: Phase 0 dialogue, then create spec dir |
| No spec dir / no markers | NO | ask user for a description |

When creating a new spec dir: number = highest existing + 1, zero-padded 3 digits.

---

## Orchestrator Primitives (used by every phase) — MIRROR of kickoff

### P1: Write-Phase (delegate to a write-* command)

Invoke the matching `/write-*` command with the literal token **`[ORCHESTRATOR-MODE]`**
prepended to its input, so it suppresses its Notify-User step and returns a structured JSON
result. Wait for it to create the artifact + `.xxx-in-progress`.

### P2: Review-Phase (launch reviewer → validate → marker → round-loop)

For review phases (1.2, 2.2, 3.2, 4, 5, 5.6):

1. **Assemble the reviewer prompt dynamically**: read the target doc(s) + the matching checklist
   (`~/.spec-workflow/checklists/`) + review instructions. (In orchestrator mode do NOT depend
   on a standalone `.xxx-review-prompt.md` file — M8.)
2. **Launch the named reviewer agent** with `subagent_type` = the agent name. Pass the
   assembled prompt + `specDir`.
3. **Receive the reviewer's JSON** (reviewType / conclusion / roundNumber / reportFile /
   criticalCount / warningCount / findings / reviewerSelfReport).
4. **Validate JSON self-consistency** (M2):
   - `conclusion ∈ {PASS, FAIL}`
   - `criticalCount == findings.filter(severity==="CRITICAL").length`
   - `conclusion === "PASS" ⟺ criticalCount === 0`
   - On failure: do NOT write a marker; record a CRITICAL "reviewer returned self-contradictory
     JSON" and re-run the reviewer (counts as a round).
5. **Branch on conclusion**:
   - **PASS** → orchestrator writes the `.xxx-passed` marker (P3), clean up `.xxx-in-progress`,
     set doc frontmatter `status: approved`, advance phase.
   - **FAIL** → increment `phaseStatus[phase].rounds`. If `rounds < ceiling`: read the report,
     fix CRITICALs in the source artifact, re-run P2. If `rounds >= ceiling`: apply P4.
6. **Persist state** after every round.

### P3: Orchestrator writes the marker

```json
{
  "type": "<spec|plan|tasks|consistency|readiness|alignment|review|qa|implement>",
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

`orchestratorVerified:true` is the proof the JSON was validated (M4) — NOT a reviewer self-attestation.

### P4: Escalate (mandatory at any ceiling)

When any phase (1–5, 5.6, 7, 8) hits its ceiling still FAIL:
- Set `phaseStatus[phase].status = "escalated"` and `sessionHints.escalatedToHuman = true`.
- **STOP autonomous progress.** Surface the remaining CRITICALs / failed ACs with the report
  path. This is a hard escalation point — never silently end.
- Wait for human resolution, after which re-running `/ship` resumes from this phase. The human
  either fixes the artifact (rounds reset on the next PASS) or rejects the direction (see
  Phase 0 REDO below).

---

## Phase 0: Requirements Intake (human touchpoint #1)

**Only on a fresh start (skipped on resume).** This is the ONLY place the human shapes
direction before final merge acceptance. Two modes, selected by the `--yes` token:

### Mode A — `--yes` Express (zero-stop autonomous intake)

Triggered when `$ARGUMENTS` starts with the `--yes` token. The user has ~one minute and wants
the run to start immediately — no back-and-forth. Strip the `--yes` token; the remainder of
`$ARGUMENTS` is the raw requirement.

1. **Silently gather context** (do NOT ask the user, do NOT end the turn): read the raw
   requirement + scan the current session transcript and the project (conventions, prior
   discussion, sensible defaults).
2. **Self-decide all 5 probe axes** listed in Mode B below, choosing the most reasonable
   interpretation given what you gathered. Resolve, don't ask. Every self-decided point is an
   `[auto-decided]` assumption.
3. **Go straight to §Phase 0 Finalize** — write REQUIREMENTS.md, init state, advance to
   Phase 1, without pausing.

> **Express mode is a deliberate trade, not a shortcut past the rules.** It drops only the
> up-front dialogue; requirement fidelity equals your first-pass reading of the one-liner. A
> wrong `[auto-decided]` assumption surfaces at final acceptance and is recovered via REDO. Use
> it when the user has a clear intent but no time to elaborate — NOT for requirements the user
> hasn't thought through. **REQUIREMENTS.md is STILL written** (it is alignment-reviewer's
> baseline at Phase 5.6); every safety net (alignment gate, round ceilings/P4, REDO,
> cross-session resume) stays in force.

### Mode B — Standard (default): interactive confirmation dialogue

1. Read `$ARGUMENTS` as the raw requirement. Also scan the current session transcript for prior
   free discussion; summarize any decisions/assumptions already surfaced.
2. Analyze the requirement along 5 axes, producing a structured probe:
   - **a. Scope ambiguity** — 1–3 boundary questions ("does this include X?")
   - **b. Actors / stakeholders** — user roles; missing roles?
   - **c. Edge / breaking cases** — 2–3 failure/corner cases the user likely hasn't considered
   - **d. Implicit assumptions** — assumptions that, if wrong, would derail planning (e.g.
     "assumes Postgres already deployed")
   - **e. Success metric** — how will the user know it's done? (probe for a measurable signal)
3. Present the probe as a numbered dialogue. Use `AskUserQuestion` if the question fits its
   shape; otherwise present inline and END THE TURN waiting for answers.
4. Incorporate answers. Re-probe ONLY if answers reveal new ambiguity (max ~2 conversational
   rounds — this is NOT a round-gated phase; it is conversational).
5. On "confirmed" / "nothing more" / "proceed" → go to §Phase 0 Finalize.

### Phase 0 Finalize (both modes converge here)

a. Create the spec dir: number = highest existing + 1, zero-padded 3 digits; slug from the
   requirement.
b. Persist `specs/{N}-{slug}/REQUIREMENTS.md` — the dual-purpose artifact: primary input to
   `write-spec` AND reference for `alignment-reviewer`. Structure: **Original Request / Goals /
   Out of Scope / Actors / Confirmed Assumptions / Edge Cases / Success Metric / Open Questions
   Resolved.** **In express mode, fill every field from the self-decided axes; mark each
   Confirmed Assumption `[auto-decided]`; leave no field empty.**
c. Initialize `specs/{N}-{slug}/.pipeline-state.json` with **`specDir` pinned**
   (`schemaVersion:"1.3.0"`, all 9 `phaseStatus` entries `pending`/`rounds:0`,
   `roundsPerPhase` per schema, `humanAckGates:[]`, `sessionHints:{resumeHint:"",
   escalatedToHuman:false, intakeMode:"<standard|express>"}`, `currentPhase:1`,
   `currentSubStep:"write-spec"`). `intakeMode` records which intake ran, for traceability.
d. Advance to Phase 1. Pass `REQUIREMENTS.md` to `write-spec` as the primary input
   (supplementing `$ARGUMENTS`).

### Phase 0 REDO (the escape hatch, since there is no mid-run human gate)

If, at ANY later phase, the human rejects the direction (e.g. during an escalation halt they
say "redo: <explanation>"), run kickoff's REDO flow adapted to `/ship`:
1. Backup `REQUIREMENTS.md` + spec/plan/tasks + the planning/alignment markers into
   `.redo-backups/<redoN>/`.
2. Delete markers `.spec-passed` `.plan-passed` `.tasks-passed` `.consistency-passed`
   `.implement-readiness-passed` `.alignment-passed` and any phase-5 ack; remove REQUIREMENTS.md
   ack if any.
3. Reset `phaseStatus["1-spec"…"5-readiness"]` to pending/rounds:0; `currentPhase:1`;
   `sessionHints.resumeHint:"Redo: <explanation>"`. Rewrite REQUIREMENTS.md with the revision
   context prepended.
4. Re-run Phase 1 → 5.6 fully autonomously. (Markers cleared BEFORE state rewrite — else the
   "markers win" rule re-marks and skips the redo.)

---

## Phases 1–5: Planning (mirror kickoff, fully autonomous)

- **Phase 1 SPEC**: P1 `/write-spec [ORCHESTRATOR-MODE]` (input = REQUIREMENTS.md + $ARGUMENTS) →
  P2 `spec-reviewer` (ceiling 5). On PASS → `.spec-passed`. **Auto-advance — no pause.**
- **Phase 2 PLAN**: P1 `/write-plan [ORCHESTRATOR-MODE]` → P2 `plan-reviewer` (ceiling 5) → `.plan-passed`.
- **Phase 3 TASKS**: P1 `/write-tasks [ORCHESTRATOR-MODE]` → P2 `tasks-reviewer` doc-consistency
  mode (ceiling 5) → `.tasks-passed`.
- **Phase 4 Consistency**: `consistency-reviewer` planning-phase mode reading all three docs
  (ceiling 2). On FAIL → root-cause phase, clean its marker + later ones, loop back. On PASS →
  `.consistency-passed`.
- **Phase 5 Readiness**: `tasks-reviewer` implement-readiness mode (ceiling 2). On FAIL → fix
  tasks, loop back to Phase 3 review. On PASS → `.implement-readiness-passed`.

---

## Phase 5.5: AUTO-PROCEED (NOT a human gate)

After `.implement-readiness-passed`, `/ship` does **not** pause. Write a synthetic ack so the
stop-round-gate hook treats phase 5 as acked during the alignment sub-step that follows:

```
humanAckGates: [{ "phase": 5, "gate": "ship-auto-proceed", "status": "passed" }]
```

Then set `currentSubStep:"alignment-review"` and proceed to Phase 5.6. (This ack substitutes
for kickoff's human "proceed"; the `alignment-reviewer` is the real fidelity gate.)

## Phase 5.6: Alignment Review (NEW gate — replaces kickoff's human gate)

The holistic "does the planning serve the original intent?" check — the AI analogue of the
human planning-batch review.

1. **Reset the readiness round budget for alignment**: set `phaseStatus["5-readiness"].rounds = 0`
   (readiness itself is `completed`; the rounds field is repurposed for alignment so alignment
   gets its own fresh ceiling of `roundsPerPhase.readiness` = 2 — NO schema change needed).
2. Launch **`alignment-reviewer`** reading `REQUIREMENTS.md` + `spec.md` + `plan.md` + `tasks.md`
   against `~/.spec-workflow/checklists/alignment-checklist.md` (P2).
3. On PASS → orchestrator writes `.alignment-passed`, advance `currentPhase` to 6.
4. On FAIL → root-cause which doc drifted from REQUIREMENTS.md, fix it, loop back to that doc's
   review (P2), re-run alignment. At ceiling (2) → P4 escalate.

> **Hook note:** alignment is tracked under the phase-5/readiness slot. Because the synthetic
> phase-5 ack was written at 5.5, the stop hook allows a natural stop during alignment; the
> orchestrator's own P4 escalation (explicit surface to human) is the real guarantee — it is
> never silent.

---

## Phase 6: Implement (context isolation via subagent)

Implementation is the heaviest stage. Launch it **as a subagent** so it runs in a fresh context
window ("clear context for development"), returning only a JSON result to `/ship`.

1. Set `phaseStatus["6-implement"].status = "in-progress"`, `currentSubStep:"implement"`.
2. Launch a subagent (Agent tool, `subagent_type:"general-purpose"`) with a prompt that:
   - pins `specDir` explicitly,
   - instructs it to invoke the `/implement-spec` skill with `[ORCHESTRATOR-MODE]` prepended,
   - asks it to return the skill's structured JSON result.
3. Consume the JSON `{command, specDir, status, tasksTotal, tasksDone, deferred}`:
   - `status:"implemented"` and `deferred == []` → orchestrator writes `.implement-passed`
     (**fills the latent gap** — implement-spec does not write it), set
     `phaseStatus["6-implement"].status="completed"`, advance to Phase 7.
   - `deferred` non-empty OR `status:"deviated"` → **HALT** (implement-spec's defer=Major rule
     guarantees it never silently defers). Set `sessionHints.escalatedToHuman=true`,
     `currentSubStep:"implement-escalated"`, surface the deferrals to the human. Resume after
     the human resolves them.

> **Reliability fallback:** if a subagent cannot faithfully drive the full multi-commit
> `/implement-spec` flow (the genuine nesting unknown — verify in testing), `/ship` falls back
> to invoking `/implement-spec [ORCHESTRATOR-MODE]` in-process (accepting context growth), or
> halts and tells the user to run `/implement-spec` in a fresh session then resume `/ship`.

---

## Phase 7: Code Review

Set `currentSubStep:"code-review"`. Invoke **`/review --auto`** (it auto-detects tier, spawns
its own reviewer subagents, validates JSON, writes `.review-passed`, and escalates only at the
round ceiling of 3 — gated by the existing stop hook). Pin `specDir` in the invocation.

> ⚠️ **State writeback is YOUR job.** `/review` writes `.review-passed` but does NOT touch
> `.pipeline-state.json`. After it returns: set `currentPhase=7`,
> `phaseStatus["7-review"]={status:"completed", rounds:<n>, marker:".review-passed",
> lastReport:<review-logs/...path>}`, then advance `currentSubStep:"qa"`. (Phases 8 and 9 are
> identical — `/qa` and `/merge-ready` write only their own markers; the orchestrator persists
> state.) Setting `currentPhase=7`/`8` also lets the `stop-round-gate` hook enforce those ceilings.

> `--auto` skips only the per-round "Proceed?" / "fix & re-review?" prompts. The round-3
> ceiling is a mandatory human escalation — never bypassed.

## Phase 8: QA

Set `currentSubStep:"qa"`.

1. **Ensure the dev server is running.** Invoke the **`run`** skill (it looks for a project
   launch skill, else falls back to built-in patterns). If `run` cannot launch, **HALT**: tell
   the user to start the dev server manually, then re-run `/ship` (it resumes at Phase 8).
2. Invoke **`/qa --auto`** (writes `.qa-passed`, escalates at ceiling 2 — hook-gated). Pin
   `specDir`. After it returns: set `currentPhase=8`,
   `phaseStatus["8-qa"]={status:"completed", rounds:<n>, marker:".qa-passed", lastReport:<path>}`,
   advance `currentSubStep:"merge-ready"`.
3. Leave the server running for the final acceptance.

> QA needs Playwright installed (`npx playwright install`) and the app on a localhost port.

## Phase 9: Merge-Ready (TERMINUS — human touchpoint #2 begins)

Set `currentSubStep:"merge-ready"`. Invoke **`/merge-ready --check`** (NEVER `execute`). It
verifies the marker trio (`.spec-passed`/`.review-passed`/`.qa-passed`), runs code-quality
checks, prints the exact merge commands, and writes `.merge-ready-passed` with
`pushExecuted:false`. After it returns: set `currentPhase=9`,
`phaseStatus["9-merge"]={status:"completed", rounds:1, marker:".merge-ready-passed", lastReport:null}`,
`currentSubStep:"ship-run-complete"`, and update `sessionHints.resumeHint` to the run-complete
note. Then display the FINAL-ACCEPTANCE summary and **STOP**.

> **Push is ALWAYS manual by policy.** `/ship` ends here. The human reviews, accepts, and runs
> the printed merge/push commands.

---

## Cross-Session Resume Protocol

A new session running `/ship` with no argument:
1. Step 1 reads `.pipeline-state.json` (resolves `specDir` from `state.specDir`).
2. If `sessionHints.escalatedToHuman === true` and unresolved → re-display the escalation and
   WAIT (do not silently retry).
3. Otherwise display "Resuming from Phase X round Y/Z (sub-step: …)" and continue from
   `currentSubStep`. The `stop-round-gate` hook enforces that a session cannot silently end
   while a gated phase is over ceiling.

State-vs-marker drift on resume → markers win, self-heal state.

---

## FINAL-ACCEPTANCE Summary (human touchpoint #2)

After Phase 9 writes `.merge-ready-passed`, display:

```
==========================================
  SHIP RUN COMPLETE (v1.4.0)
==========================================

  Spec:   specs/{N}-{slug}/

  REQUIREMENTS ✓  SPEC ✓  PLAN ✓  TASKS ✓  Consistency ✓  Readiness ✓
  Alignment ✓   Implement ✓  Code Review ✓  QA ✓  Merge-Ready ✓

  Docs:     specs/{N}-{slug}/ (REQUIREMENTS.md + spec/plan/tasks)
  Reports:  specs/{N}-{slug}/reviews/
  State:    specs/{N}-{slug}/.pipeline-state.json
  Merge:    (commands printed by /merge-ready --check)

  /ship's autonomous run ends here. Review the result, then run the
  printed merge/push commands manually to complete delivery.
==========================================
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Feature description missing & no in-progress spec | ask user for description |
| REQUIREMENTS.md missing at Phase 5.6 | alignment-reviewer FAILs (CRITICAL: no intent baseline) → P4 escalate |
| State file corrupted | rebuild from marker set (§1.2) |
| State vs marker conflict | markers win, self-heal state |
| Reviewer returns self-contradictory JSON | reject, re-run reviewer (counts as a round) |
| Planning/alignment ceiling hit (1–5, 5.6) | STOP, surface remaining issues, escalate (P4) |
| Implement defers an FR/AC / deviates | HALT, `escalatedToHuman=true`, surface to human |
| `/review --auto` hits ceiling 3 | HALT (review escalated internally) |
| `/qa --auto` hits ceiling 2 | HALT (qa escalated internally) |
| Dev server unreachable at Phase 8 | prompt user to start it; HALT, resume on re-run |
| Redo requested (during a halt) | Phase 0 REDO flow: clear markers, reset state, re-run Phase 1–5.6 |
| Ctrl+C / session crash | state + markers preserve progress; `/ship` resumes |
| stop-round-gate blocks exit | resolve the blocking phase (fix + re-run, or redo), then resume |

## CRITICAL RULES

1. **State file is truth** — `.pipeline-state.json` drives phase/round/sub-step; markers win on conflict.
2. **Reviewers are read-only named subagents** — never `general-purpose` for reviews, never write markers (M3).
3. **Orchestrator owns marker writes** — only after validating reviewer JSON self-consistency (M2).
4. **Never skip a review** — every phase (incl. alignment) passes its review before advancing.
5. **At most two human touchpoints** — Phase 0 intake and final merge acceptance. In standard
   mode Phase 0 is an interactive dialogue; in express mode (`--yes`) it is a one-shot one-liner
   with the orchestrator self-deciding every ambiguous point. No mid-run planning gate (Phase 5.5
   auto-proceeds); fidelity is guarded by `alignment-reviewer` reading REQUIREMENTS.md as the
   baseline in both modes.
6. **Escalation is mandatory** at any ceiling (1–5, 5.6, 7, 8) and on implement defer — never silently end (P4).
7. **Cross-session resumable** — every phase boundary persists state; resume reads it.
8. **Round ceilings come from `roundsPerPhase`** — never hardcode a different number (M1). Alignment reuses the `readiness` slot (no schema change).
9. **`/ship` never invokes `/kickoff`** — it subsumes Phases 1–5 directly (kickoff's gate ends the turn).
10. **Push is always manual** — `/ship` stops at `/merge-ready --check`; `pushExecuted:false`.
11. **Resolve `specDir` once** from `state.specDir` and pass it explicitly to every stage (never re-scan "latest specs/").
