# /review — Formal Code Review (On-Demand)

> Multi-tier independent code review triggered by user command.
> Replaces the automatic Stop Hook review with on-demand execution.
> User controls WHEN to review — no more forced reviews on every conversation end.

## Arguments

$ARGUMENTS — Optional. Can be:
- (empty) — Auto-detect tier based on diff size
- `light` — Force Light tier (1 reviewer)
- `standard` — Force Standard tier (2 reviewers)
- `deep` — Force Deep tier (3 reviewers)
- `quick` — Alias for Light tier
- `--auto` — Orchestrator mode flag (passed by /kickoff Phase 7). Skips all
  "Proceed?" / "fix & re-review?" confirmation gates: auto-proceeds with the
  auto-detected tier and auto-executes the fix loop on FAIL. Marker write is
  owned by this command (the local review orchestrator) after validating the
  reviewer JSON. Escalates to the human at the round ceiling (3 rounds, D3).

## Step 1: Collect Change Scope

```bash
git diff --name-only HEAD
git diff --stat HEAD
```

If no uncommitted changes, check staged:
```bash
git diff --name-only --cached
git diff --stat --cached
```

If still no changes:
- Check recent commits: `git log --oneline -5`
- If user wants to review recent commits, redirect to `/re-code`

## Step 2: Auto-Determine Review Tier

### Tier Rules

| Tier | Conditions | Reviewers | Est. Tokens |
|------|-----------|-----------|-------------|
| **Light** | <= 3 files AND no architecture changes AND no new files > 200 lines | 1 | ~10-15k |
| **Standard** | 4-10 files OR new significant feature | 2 (independent) | ~30-40k |
| **Deep** | > 10 files OR architecture changes OR DB schema changes | 3 (independent) | ~50-70k |

### Override Rules

- If `$ARGUMENTS` specifies a tier, use that tier regardless of auto-detection
- If user has `.review-in-progress` marker, resume from previous review round

### Architecture Change Detection

A change is "architecture" if it:
- Adds/removes/renames directories in `src/` or `backend/`
- Changes `package.json` dependencies (not devDependencies)
- Modifies database schema files
- Changes API endpoint structure (routes, contracts)
- Modifies shared utility modules used by 3+ files

## Step 3: Present Review Plan

Display to user:

```
==========================================
  REVIEW PLAN
==========================================

  Tier:     {Light/Standard/Deep}
  Files:    {N} changed
  Reviewers: {1/2/3} independent

  Dimensions:
  {list applicable dimensions}

  Estimated tokens: ~{N}k

  Proceed? (or specify tier: light/standard/deep)
==========================================
```

Wait for user confirmation before proceeding.
**If `--auto` is set**: skip the confirmation — auto-proceed with the displayed tier.

## Step 4: Generate Review Prompt

Generate the review prompt using the same structure as `stop-review-status.js`:

1. Read project CLAUDE.md for context
2. Read HARNESS.md if exists (highest priority constraints)
3. Read SPEC.md if exists (spec conformance check)
4. Read code checklist: `~/.spec-workflow/checklists/code-checklist.md`
5. Read visual checklist if frontend files changed: `~/.spec-workflow/checklists/visual-checklist.md`
6. Read report template: `~/.spec-workflow/checklists/report-template.md`

### Prompt Structure

Each reviewer agent receives this prompt:

```
You are an INDEPENDENT code reviewer — reviewer #{N} of {total}.
You have ZERO prior context about this project. Judge solely by what you observe.

## Tier: {Light/Standard/Deep}

## Your Focus (Reviewer #{N})

{For Light: All dimensions}
{For Standard/Deep with 2+ reviewers, each gets a primary focus:}
- Reviewer 1: Correctness + Security + Spec Conformance
- Reviewer 2: Code Quality + Best Practices + CUPID
- Reviewer 3 (Deep only): Architecture + Performance + Data Scale

## Changed Files
{file list}

## Diff Content
{diff content}

## Execution Steps
{same as stop-review-status.js prompt structure}
```

## Step 5: Launch Reviewer Agent(s)

### For Light (1 reviewer)

```javascript
Agent tool, subagent_type="reviewer", prompt=<full review prompt>
```

### For Standard (2 independent reviewers)

Launch 2 agents IN PARALLEL:
- Agent 1: Focus on Correctness + Security + Spec
- Agent 2: Focus on Quality + Best Practices + CUPID

### For Deep (3 independent reviewers)

Launch 3 agents IN PARALLEL:
- Agent 1: Correctness + Security + Spec
- Agent 2: Quality + Best Practices + CUPID + Visual
- Agent 3: Architecture + Performance + Data Scale

## Step 6: Aggregate Results

After all reviewers complete:

1. Merge findings from all reviewers
2. Deduplicate identical issues (same file, same line, same problem)
3. If reviewers disagree on severity:
   - Both say CRITICAL → CRITICAL
   - One says CRITICAL, one says WARNING → CRITICAL (erring on caution)
   - Both say WARNING → WARNING
4. Generate unified report using report template
5. Save to `review-logs/{YYYY-MM-DD_HHMMSS}_review.md`

## Step 7: Determine Conclusion (orchestrator owns the marker)

Reviewers are **read-only** (v1.2.0): they return a structured JSON conclusion, they do NOT write `.review-passed`. **This command** is the local review orchestrator — it validates each reviewer's returned JSON, then writes the marker itself.

### 7.1 Validate reviewer JSON self-consistency

For every returned reviewer JSON, assert ALL of:
- `conclusion ∈ {PASS, FAIL}`
- `criticalCount == findings.filter(f => f.severity === "CRITICAL").length`
- `conclusion === "PASS" ⟺ criticalCount === 0`

If any reviewer JSON fails these invariants → **reject**: do NOT write the marker. Treat as FAIL with a CRITICAL finding "reviewer returned self-contradictory JSON" and re-run that reviewer.

### 7.2 Aggregate conclusion

- **PASS**: every reviewer `conclusion === PASS` (zero CRITICAL across all)
- **FAIL**: any reviewer has CRITICAL

### 7.3 Write marker (if PASS, into the latest `specs/{N}/`)

Write `.review-passed` (or into project root if no spec dir exists):

```json
{
  "type": "review",
  "conclusion": "PASS",
  "tier": "{Light/Standard/Deep}",
  "reviewers": {N},
  "reportFile": "review-logs/{filename}",
  "rounds": {round},
  "criticalCount": 0,
  "warningCount": {N},
  "orchestratorVerified": true,
  "reviewerAgent": "reviewer",
  "reviewerToolset": ["Read", "Glob", "Grep", "Bash", "Playwright"],
  "reviewerModel": "glm-5.1"
}
```

> `orchestratorVerified:true` replaces the old self-attesting `reviewerAgent:true` — it proves this command validated the JSON before writing (M4).

### 7.4 If FAIL — fix loop

1. Display all CRITICAL issues with file:line:fix
2. **If `--auto`**: auto-fix CRITICAL issues, increment round counter, loop back to Step 1 (do NOT ask the user). Track rounds in `.review-round`.
3. **If standalone (no `--auto`)**: ask "Fix issues and re-review? (max 3 rounds)"; on agreement, fix and loop back.
4. **Round ceiling = 3 (D3).** On the 3rd FAIL round, STOP auto-fixing and **escalate to the human**: report remaining CRITICALs and pause. This is a mandatory escalation point (D6) — do not silently end.

## Step 8: Present Summary

```
==========================================
  REVIEW COMPLETE
==========================================

  Tier:     {Light/Standard/Deep}
  Files:    {N} reviewed
  Reviewers: {N}

  CRITICAL:  {N}
  WARNING:   {N}
  INFO:      {N}

  Conclusion: {PASS / FAIL}
  Report:     review-logs/{filename}

  {If PASS: "Ready to proceed to /qa or /merge-ready"}
  {If FAIL: "Fix CRITICAL issues above, then /review again"}
==========================================
```

## Error Handling

| Scenario | Action |
|----------|--------|
| No changes detected | Suggest `/re-code` for recent commits |
| User cancels review plan | Abort cleanly, no markers created |
| Reviewer agent errors | Re-launch failed reviewer, keep successful results |
| Max 3 rounds exceeded | STOP, present remaining issues to user |
| `.review-in-progress` exists | Resume previous review round |

## Differences from /code-review

| | /code-review | /review |
|---|---|---|
| Purpose | Quick self-check during dev | Formal pre-merge review |
| Tier system | None (single pass) | Light/Standard/Deep |
| Multiple reviewers | No | Yes (1-3 independent) |
| Report file | None | Saved to review-logs/ |
| Marker file | None | .review-passed |
| Token cost | ~5k | ~10-70k (by tier) |
| When to use | During development, quick check | After implementation, before QA |
