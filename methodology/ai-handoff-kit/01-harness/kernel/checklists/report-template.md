# Review Report Template

> The reviewer agent fills in this template and saves it to `review-logs/YYYY-MM-DD_HHMMSS_review.md`.

---

```markdown
# Code Review Report

## Basic Info

| Item | Value |
|------|-------|
| Review Time | {YYYY-MM-DD HH:MM:SS} |
| Project | {project name} |
| Review Round | {1/2/3} |
| Review Type | Code Analysis {+ Visual Review} |
| Commit SHA | {run `git rev-parse --short HEAD` and paste result, or "pre-commit"} |

## Changed Files

{numbered list of changed files with their change type: [Modified] / [Created] / [Deleted]}

---

## Review Conclusion

**{PASS / FAIL}**

{One sentence summary of the review result.}

---

## CUPID Ratings

| File | Composable | Unix | Predictable | Idiomatic | Domain | Weakest |
|------|-----------|------|-------------|-----------|--------|---------|
| {path} | {★xN} | {★xN} | {★xN} | {★xN} | {★xN} | {property} |

{For any property rated ★★ or below, add a brief explanation of what to improve.}

---

## Issue List

### CRITICAL (must fix)

{If no CRITICAL issues: "None"}

| # | File | Lines | Issue | Suggested Fix |
|---|------|-------|-------|---------------|
| C1 | `path/to/file` | L10-15 | Description | Fix suggestion |

### WARNING (should fix)

| # | File | Lines | Issue | Suggested Fix |
|---|------|-------|-------|---------------|
| W1 | `path/to/file` | L20 | Description | Fix suggestion |

### INFO (notes)

| # | File | Note |
|---|------|------|
| I1 | `path/to/file` | Description |

---

## HARNESS.md Constraints

{If no HARNESS.md exists: "No project constraint file found."}

{If HARNESS.md exists:}
| Constraint | Status | Details |
|------------|--------|---------|
| {constraint description} | {PASS / FAIL} | {evidence or violation details} |

---

## Visual Review

### Screenshot Record

| Page | URL | Status |
|------|-----|--------|
| {Page Name} | {url} | {Captured / Skipped / Error} |

### Visual Issues

{If visual review was skipped: "Skipped - no frontend changes detected."}

{If visual issues found, list by severity: CRITICAL / WARNING / INFO}

---

## Review Log

```
{timestamp} [INFO] [REVIEW] [CODE_CHECK] file={path} checks={N} critical={N} warning={N} info={N}
{timestamp} [INFO] [REVIEW] [CUPID] file={path} composable={N} unix={N} predictable={N} idiomatic={N} domain={N}
{timestamp} [INFO] [REVIEW] [VISUAL] page={name} url={url} checks={N} critical={N} warning={N} info={N}
{timestamp} [INFO] [REVIEW] [DONE] files={N} critical={N} warning={N} info={N} result={PASS|FAIL}
```

---

## Review Statistics

| Metric | Value |
|--------|-------|
| Files reviewed | {N} |
| CRITICAL issues | {N} |
| WARNING issues | {N} |
| INFO notes | {N} |
| Visual pages checked | {N} |
| Average CUPID score | {N.N}/5 |
| Conclusion | {PASS / FAIL} |
```

---

## Structured Output (for /evolve)

> This JSON block is extracted by the /evolve command to update the failure pattern database.
> It MUST be included at the end of every review report.

```json
{
  "tiktool_review": {
    "conclusion": "{PASS or FAIL}",
    "files_reviewed": {N},
    "issues": {
      "critical": {N},
      "warning": {N},
      "info": {N}
    },
    "findings": [
      {
        "severity": "{CRITICAL|WARNING|INFO}",
        "file": "{path/to/file}",
        "line": "{L42}",
        "description": "{issue description}",
        "fix": "{suggested fix}"
      }
    ],
    "cup_id_scores": {
      "{path/to/file}": {
        "composable": {1-5},
        "unix": {1-5},
        "predictable": {1-5},
        "idiomatic": {1-5},
        "domain": {1-5}
      }
    },
    "review_round": {N}
  }
}
```
