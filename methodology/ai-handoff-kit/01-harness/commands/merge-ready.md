# /merge-ready — Merge Readiness Check

> Final gate before merging a feature branch into main.
> Checks all prerequisite markers, code quality, and version consistency.
> Outputs the exact merge commands to run.

## Arguments

$ARGUMENTS — Optional. Can be:
- (empty) — Full check against all requirements (display only, no push)
- `check` or `--check` — Dry run: run all checks, show what's missing and print the
  exact merge commands, but **NEVER execute or push**. This is the only mode the
  `/kickoff` orchestrator (Phase 9) ever uses — push is always a manual human action.
- `execute` — Execute the merge after all checks pass (requires explicit human
  confirmation; never used by the orchestrator)

## Step 1: Detect Project Context

1. Determine current branch: `git branch --show-current`
2. Determine default branch: `git remote show origin` (look for "HEAD branch")
3. Check if we're on a feature branch (not main/master)
4. If on main/master: warn "You are on the default branch. Merge typically happens FROM a feature branch."
5. **Detect merge topology** (avoid printing no-op commands for trivial repos):
   - remote: `git remote -v` — is an `origin` configured?
   - branches: `git branch --list` — is there more than one branch (a feature branch to merge FROM)?
   - versioning: is there a version source (`package.json` `version`, `config/settings.py` `VERSION`, or a `v*` git tag)?
   - If **single-branch AND no remote AND no version scheme** → set `topology = "trivial"`
     (the work is already integrated on the default branch; there is no feature→main merge).
     Step 5 then prints an honest "already integrated" fast-path instead of fabricated
     checkout/merge/push commands.

## Step 2: Prerequisite Marker Check

Check for marker files. Look in both:
- Project root (legacy location)
- Latest spec directory: `specs/{N}-*/`

| Marker | Required? | Location | Status |
|--------|-----------|----------|--------|
| `.spec-passed` | Yes (if spec exists) | spec dir | Found / Missing |
| `.review-passed` | Yes (if code changed) | project root | Found / Missing |
| `.qa-passed` | Yes (if spec exists) | spec dir | Found / Missing |

Display status:

```
==========================================
  MERGE READINESS CHECK
==========================================

  Branch:   {current} → {target}
  Spec:     {spec path or "N/A"}

  Prerequisites:
  ✅ .spec-passed     — {Found at path / Missing}
  ✅ .review-passed   — {Found at path / Missing}
  ✅ .qa-passed       — {Found at path / Missing}
  {or}
  ❌ .review-passed   — Missing (run /review first)

==========================================
```

If any REQUIRED marker is missing:
- List what's missing
- Suggest the command to run (e.g., "Run /review to start code review")
- STOP — do not proceed to Step 3

## Step 3: Code Quality Checks

Run automated checks (fast, no token cost):

### 3.1 Uncommitted Changes

```bash
git status --porcelain
```

If uncommitted changes exist:
- List them
- Ask: "Commit these changes first, or stash them?"

### 3.2 Console.log Audit

```bash
grep -r "console\.log" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/
```

If found: FAIL — "Remove console.log statements before merging"

### 3.3 Secrets Scan

```bash
grep -rn "sk-\|password\s*=\s*\"\|secret\s*=\s*\"\|API_KEY\s*=\s*\"" --include="*.py" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" .
```

If found (excluding .env and config patterns): FAIL — "Hardcoded secrets detected"

### 3.4 Build Check

If the project has a build command (check package.json, Makefile, etc.):
- Run the build
- If fails: FAIL — "Build errors must be fixed before merge"

### 3.5 Test Suite

If the project has tests:
- Run tests
- If any fail: FAIL — "All tests must pass before merge"

Display results:

```
  Code Quality:
  ✅ No uncommitted changes
  ✅ No console.log statements
  ✅ No hardcoded secrets
  ✅ Build passes
  ✅ Tests pass (N/N)
```

## Step 4: Version Check

### 4.1 Determine Version Increment

Based on the changes in this branch:

```bash
git log {target_branch}..HEAD --oneline
git diff {target_branch}..HEAD --stat
```

Suggest version bump:
- **PATCH** (x.x.+1): Bug fixes, small tweaks, text changes
- **MINOR** (x.+1.0): New features, new pages, new APIs
- **MAJOR** (+1.0.0): Architecture refactor, breaking changes, data migration

### 4.2 Check Version Consistency

Search for version definitions in the codebase:
- `config/settings.py` → `VERSION = "..."`
- `package.json` → `"version": "..."`
- `CLAUDE.md` → version info section
- Any other version files specific to the project

If version is NOT updated:
- Warn: "Version number not yet updated"
- Suggest the new version number based on Step 4.1
- Ask user to confirm the version number

### 4.3 Version Alignment

All version references must match:
- Code version file
- CLAUDE.md version
- git tag (will be created during merge)

Display:

```
  Version:
  Current:  {old version}
  New:      {suggested version} ({PATCH/MINOR/MAJOR})
  Updated in:
    ✅ config/settings.py
    ✅ CLAUDE.md
    ❌ package.json — needs update
```

## Step 5: Generate Merge Report

**Trivial-topology fast-path** (from Step 1.5): if `topology == "trivial"` (single-branch, no
remote, no version scheme), the work is already on the default branch — there is no
feature→main merge to perform. Print honestly:

```
==========================================
  MERGE READY — ALREADY INTEGRATED (trivial topology)
==========================================

  Branch:    {default} (single-branch repo; no feature branch to merge)
  Remote:    none configured
  Version:   no version scheme detected
  Commits:   {N} commits already on {default} ({range})

  All prerequisites + code-quality checks PASSED. No merge/push commands apply —
  the implementation is already committed on the default branch.
==========================================
```

Then write `.merge-ready-passed` (with `pushExecuted:false`, `topology:"trivial"`) and STOP.
Do NOT fabricate a version number, a feature branch, or push commands.

If ALL checks pass (non-trivial topology):

```
==========================================
  MERGE READY — ALL CHECKS PASSED
==========================================

  Source:   {feature branch}
  Target:   {main/master}
  Version:  v{new_version}

  Commits:  {N} commits to merge
  Files:    {N} files changed

  Prerequisites:  ALL PASSED
  Code Quality:   ALL PASSED
  Version:        v{new_version} confirmed

  MERGE COMMANDS:

  1. git checkout {target}
  2. git pull origin {target}
  3. git merge {feature_branch}
     (commit message: "merge: {branch} -> {target} (v{version})")
  4. git tag v{version}
  5. git push origin {target} --tags

  Execute merge now? (y/n)
==========================================
```

If `$ARGUMENTS` is `execute` AND user confirms:
- Execute the merge commands
- Create the tag
- Push to origin

If `$ARGUMENTS` is `check` or `--check` or empty:
- Only display the commands, let user execute manually
- **The `/kickoff` orchestrator (Phase 9) always calls `--check`**: it never pushes.
  Push remains an explicit, manual human action.

### Write merge-ready marker (when ALL checks pass, into the latest `specs/{N}/`)

When every prerequisite marker + code-quality check + version check passes, write
`.merge-ready-passed` so the pipeline state records Phase 9 completion:

```json
{
  "type": "merge-ready",
  "conclusion": "PASS",
  "branch": "{feature} -> {target}",
  "version": "v{new_version}",
  "orchestratorVerified": true,
  "pushExecuted": false,
  "note": "merge commands printed; push is manual"
}
```

## Step 6: Post-Merge Cleanup

After successful merge (if executed):

1. Clean up marker files:
   - `.review-passed`
   - `.qa-passed`
   - `.review-in-progress`
   - `.review-prompt.md`

2. Do NOT delete spec directory — keep for reference

3. Remind user about mirror test server:
   - "Start mirror test server (port 8509) for UAT verification"
   - "Run /qa on the mirror server to verify merged code"

## Error Handling

| Scenario | Action |
|----------|--------|
| On default branch | Warn, suggest switching to feature branch |
| Missing markers | List missing, suggest commands to run |
| Uncommitted changes | Ask to commit or stash first |
| Build/test failures | Report, block merge |
| Version not updated | Suggest version number, ask to confirm |
| Merge conflicts | Abort merge, list conflicting files |
| Push fails | Suggest checking remote permissions |

## Merge Checklist (Reference)

This checklist is based on CLAUDE.md "Merge to main Checklist":

1. ✅ Determine new version number
2. ✅ Update version in source files
3. ✅ Update CLAUDE.md version info
4. ✅ Commit message includes version
5. ✅ Create git tag
6. ✅ Critical path UI verification (mirror test server)
7. ✅ Data scale impact check
