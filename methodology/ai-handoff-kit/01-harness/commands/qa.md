# /qa — QA Verification (On-Demand)

> Playwright-based automated QA verification triggered by user command.
> Tests against Spec Acceptance Criteria with screenshot evidence.
> Independent from /review — focuses on "does it work?" not "is code good?".

## Arguments

$ARGUMENTS — Optional. Can be:
- (empty) — Auto-detect tier based on change scope
- `smoke` — Force Smoke tier (basic health check only)
- `standard` — Force Standard tier (full AC coverage)
- `full` — Force Full tier (AC + regression + edge cases + compatibility)
- `--auto` — Orchestrator mode flag (passed by /kickoff Phase 8). Skips the
  "Proceed?" and "fix & re-run?" confirmation gates: auto-proceeds and
  auto-executes the fix loop on FAIL. Marker write is owned by this command
  after validating the qa-tester JSON. Escalates to the human at the round
  ceiling (2 rounds = initial + 1 retry, D3/D6).

## Step 0: Prerequisites Check

### 0.1 Find Spec File

Search for spec in priority order:
1. `specs/{latest-number}-*/spec.md` — inside kickoff-generated spec directories
2. `SPEC.md` — project root (legacy)

If no spec found:
- Inform user: "No spec found. QA requires acceptance criteria to test against."
- Suggest: "Run /kickoff to create a spec, or manually create SPEC.md"
- User can still proceed with Smoke tier (no spec needed)

### 0.2 Check Review Status

Check for `.review-passed` marker:
- If EXISTS: Note that code review passed, proceed normally
- If NOT EXISTS: Warn user "Code review (/review) has not been run yet. Continue anyway?"

### 0.3 Determine Test Target

Identify the running server:
1. Check project CLAUDE.md for port configuration
2. Try common patterns: `http://localhost:{port}` for the frontend port
3. Attempt to connect: `curl -s -o /dev/null -w "%{http_code}" http://localhost:{port}`
4. If server not running:
   - Inform user with the start command from project config
   - Offer to start the test server (if in development project)

### 0.4 Verify Playwright Availability (Python OR Node)

Playwright may be installed as a **Python** module or a **Node** package — probe BOTH and use
whichever is available. Do not assume one.

1. Python: `python3 -c "import playwright"` (and `python3 -m playwright --version`).
2. Node: `npx --no-install playwright --version` (or check `node_modules/playwright`).
3. If NEITHER is available, install for the project's toolchain:
   - Python project: `pip install playwright` then `python -m playwright install`.
   - Node project: `npm install playwright` (**installs the driver/module**) then
     `npx playwright install` (**installs browser binaries**).
   - ⚠️ `npx playwright install` ONLY downloads browsers — it does NOT install the playwright
     module. In a Node project that lacks the module, run `npm install playwright` FIRST.
4. If no display is available (headless server / CI), use **headless** mode
   (`chromium.launch({headless:true})` / `--headless`). Playwright runs headless without a
   display — do NOT treat "no DISPLAY" as a Playwright failure.
5. Record the runtime used (python/node) and mode (headed/headless) in the QA report.

## Step 1: Auto-Determine QA Tier

### Tier Rules

| Tier | Conditions | Test Scope | Est. Time |
|------|-----------|------------|-----------|
| **Smoke** | No spec / hotfix / small change | Page load + no errors + no overflow | 3-5 min |
| **Standard** | Spec exists AND functional changes | All ACs + smoke + regression | 10-20 min |
| **Full** | Major version / release / architecture change | All ACs + regression + edge cases + compat | 30+ min |

### Override Rules

- If `$ARGUMENTS` specifies a tier, use that tier
- If no spec exists, force Smoke tier regardless

## Step 2: Present QA Plan

Display to user:

```
==========================================
  QA VERIFICATION PLAN
==========================================

  Tier:     {Smoke/Standard/Full}
  Target:   http://localhost:{port}
  Spec:     {spec path or "N/A (Smoke only)"}

  Test Scope:
  {Smoke: Page load, console errors, layout overflow}
  {Standard: All N acceptance criteria + regression}
  {Full: All N ACs + regression + edge cases + mobile/responsive}

  Evidence: Screenshots saved to review-logs/

  Proceed? (or specify tier: smoke/standard/full)
==========================================
```

Wait for user confirmation.
**If `--auto` is set**: skip the confirmation — auto-proceed with the displayed tier.

## Step 3: Execute QA Tests

### 3.1 Smoke Tests (All Tiers)

Using Playwright headed mode:

1. **Page Load**
   - Navigate to target URL
   - Verify HTTP 200 response
   - Verify page is not blank (has meaningful content)
   - Screenshot: `review-logs/qa_smoke_01_pageload.png`

2. **Console Error Check**
   - Listen for `console.error` and `window.onerror`
   - Verify zero uncaught errors
   - If errors found: record with stack trace

3. **Layout Overflow**
   - Check `document.documentElement.scrollWidth > document.documentElement.clientWidth`
   - Check for horizontal scroll on body
   - Screenshot: `review-logs/qa_smoke_02_layout.png`

4. **Response Time**
   - Measure page load time (navigationStart to loadEventEnd)
   - Flag if > 5 seconds

### 3.2 Acceptance Criteria Tests (Standard & Full)

For each AC from spec:

1. **Parse AC definition**
   ```
   AC-{NN}: {description}
   GIVEN: {preconditions}
   WHEN: {action}
   THEN: {expected result}
   ```

2. **Execute test steps**
   - Use Playwright to perform the WHEN action
   - Verify the THEN expected result
   - Take screenshot at each verification point
   - Record: PASS or FAIL with evidence

3. **Test evidence per AC**
   - Screenshots: `review-logs/qa_ac{NN}_step{M}.png`
   - For FAIL: include screenshot showing the failure

### 3.3 Regression Check (Standard & Full)

Verify core functionality still works:
- Basic navigation (home page, key pages)
- Core user flows (login, main actions)
- No new console errors on core pages
- Existing features unchanged

### 3.4 Edge Cases & Compatibility (Full Only)

- **Edge cases**: Empty states, max input length, special characters, concurrent operations
- **Responsive**: Test at 1920x1080, 1366x768, 768x1024 (tablet)
- **Browser**: If applicable, note browser-specific issues
- **Data scale**: If the change involves lists/collections, test with large datasets

## Step 4: Generate QA Report

Use the report template from:
`~/.spec-workflow/checklists/qa-report-template.md`

Save to: `review-logs/{YYYY-MM-DD_HHMMSS}_qa.md`

### Report Structure

```markdown
# QA Verification Report

## Basic Info

| Field | Value |
|-------|-------|
| Test Date | {date} |
| Spec File | {spec path} |
| Test Target | {URL} |
| Tier | {Smoke/Standard/Full} |
| Conclusion | {PASS/FAIL} |

---

## Smoke Tests

| Check | Result |
|-------|--------|
| Page loads | PASS/FAIL |
| No console errors | PASS/FAIL |
| No layout overflow | PASS/FAIL |
| Response time acceptable | PASS/FAIL |

---

## Acceptance Criteria Results

| AC ID | Description | Method | Result | Notes |
|-------|-------------|--------|--------|-------|
| AC-01 | {desc} | {UI/API/Visual} | PASS/FAIL | {evidence} |

---

## Test Details

### AC-01: {title}
**Steps**: {steps}
**Expected**: {expected}
**Actual**: {actual}
**Screenshot**: {path}
**Conclusion**: PASS/FAIL

---

## Regression

| Check | Result |
|-------|--------|
| Core flows intact | PASS/FAIL |
| No new errors | PASS/FAIL |

---

## Structured Output

{json block for automation}
```

## Step 5: Create Marker (orchestrator owns the marker)

The qa-tester agent is **read-only for markers** (v1.2.0): it returns a structured JSON conclusion, it does NOT write `.qa-passed`. **This command** validates the JSON, then writes the marker itself.

### 5.1 Validate qa-tester JSON self-consistency

Assert ALL of:
- `conclusion ∈ {PASS, FAIL}`
- `criticalCount == findings.filter(f => f.severity === "CRITICAL").length`
- `conclusion === "PASS" ⟺ criticalCount === 0`

If the JSON fails these invariants → reject, re-run the qa-tester.

### 5.2 If ALL tests pass (smoke + ACs + regression)

Write `.qa-passed` into the latest `specs/{N}/`:
```json
{
  "type": "qa",
  "conclusion": "PASS",
  "tier": "{Smoke/Standard/Full}",
  "specFile": "{spec path}",
  "reportFile": "review-logs/{filename}",
  "rounds": {round},
  "criticalCount": 0,
  "warningCount": 0,
  "criteriaTested": {N},
  "criteriaPassed": {N},
  "criteriaFailed": [],
  "smokeTests": { "passed": {N}, "failed": 0 },
  "orchestratorVerified": true,
  "reviewerAgent": "qa-tester",
  "reviewerToolset": ["Read", "Glob", "Grep", "Bash", "Playwright"],
  "reviewerModel": "glm-5.1"
}
```

> `orchestratorVerified:true` replaces the old `reviewerAgent:true` self-attestation (M4).

## Step 6: Present Summary

```
==========================================
  QA VERIFICATION COMPLETE
==========================================

  Tier:     {Smoke/Standard/Full}
  Target:   {URL}

  Smoke:    {PASS/FAIL}
  ACs:      {N}/{N} passed
  Regression: {PASS/FAIL}

  Conclusion: {PASS / FAIL}
  Report:     review-logs/{filename}

  {If PASS: "Ready to proceed to /merge-ready"}
  {If FAIL: "Review failed ACs above. Fix and /qa again"}
==========================================
```

### If FAIL

1. List all failed ACs with screenshots
2. List smoke test failures
3. **If `--auto`**: auto-fix the failed ACs, increment round counter, loop back to Step 3 (do NOT ask the user). Track rounds.
4. **If standalone**: ask "Fix issues and re-run QA?"; user can fix and run `/qa` again.
5. **Round ceiling = 2 (initial + 1 retry, D3/D6).** On the 2nd FAIL, STOP auto-fixing and **escalate to the human**: report remaining failed ACs and pause. This is a mandatory escalation point — do not silently end.

## Error Handling

| Scenario | Action |
|----------|--------|
| No spec found | Offer Smoke tier only, or suggest /kickoff |
| Server not running | Prompt user to start, offer to start test server |
| Playwright not installed | Probe BOTH python and node (Step 0.4); install the matching module/driver (`pip install playwright` OR `npm install playwright`) THEN browsers (`playwright install`); fall back to headless if no display |
| Page timeout | Retry once, then report as FAIL |
| AC test crashes | Mark that AC as FAIL with error details |
| Spec has no ACs defined | Run smoke tests only, warn user |

## Differences from /re-qa

| | /re-qa | /qa |
|---|---|---|
| Trigger | Legacy command | New standard command |
| Tier system | None | Smoke/Standard/Full |
| Prerequisites | Strict (requires .spec-passed) | Flexible (Smoke works without spec) |
| Server check | Assumes running | Auto-detects and can offer to start |
| Report format | Basic | Enhanced with tier info |
| Backward compat | - | Replaces /re-qa as the primary QA command |

## Differences from /review

| | /review | /qa |
|---|---|---|
| Focus | Code quality, security | Functional correctness |
| Method | Static analysis | Dynamic testing (Playwright) |
| Input | git diff, source code | Running application, Spec ACs |
| Output | Code quality report | Test report + screenshots |
| Order | Before /qa | After /review |
