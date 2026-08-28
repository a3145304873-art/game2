# Code Analysis Checklist

> Used by the independent reviewer agent during code review.
> Project-specific rules should be added in `.claude/checklists/code-checklist.md` at the project level.

---

## A. Python Backend (`**/*.py`)

### CRITICAL

| # | Check | Method |
|---|-------|--------|
| C1 | SQLite connection uses read-write mode instead of `mode=ro` | Grep for `sqlite3.connect` without `mode=ro` in the same line. Exception: connections that legitimately need write access. |
| C2 | SQL injection: string concatenation/format in SQL queries | Grep for `f"SELECT`, `f"INSERT`, `f"UPDATE`, `f"DELETE`, `+ "SELECT` patterns in query strings |
| C3 | API keys, passwords, or secrets hardcoded | Grep for `sk-`, `password = "`, `secret = "`, `API_KEY = "` patterns that are NOT wrapped in `os.environ.get()` |
| C4 | File write operations on source/read-only data files | Grep for `open(..., 'w')` or `shutil.copy` targeting read-only data paths |

### WARNING

| # | Check | Method |
|---|-------|--------|
| W1 | Database query without `limit` clamped to reasonable range | Check `limit` parameter handling in query functions |
| W2 | Bare `except:` or `except Exception:` catching all exceptions | Grep for `except:` and `except Exception` |
| W3 | Import of unused modules | Check import statements against actual usage in the file |
| W4 | Functions exceeding 50 lines | Read and estimate line count of function bodies |
| W5 | Missing input validation on API endpoints | Check that request parameters are validated before use |

### INFO

| # | Check | Method |
|---|-------|--------|
| I1 | Log format not matching `[BE] [PHASE] key=value` standard | Check logger calls for proper format |
| I2 | Missing docstrings on public functions | Visual check of function definitions |
| I3 | Magic numbers without named constants | Look for unexplained numeric literals |

---

## B. React / Frontend (`**/*.{jsx,js,css}`)

### CRITICAL

| # | Check | Method |
|---|-------|--------|
| C1 | React state closure trap: callback references stale state | Check `EventSource`, `fetch` stream handlers, `useEffect` callbacks for state references that should use refs instead |
| C2 | `JSON.parse()` without try-catch | Grep for `JSON.parse` and verify each call is wrapped in try-catch |
| C3 | `dangerouslySetInnerHTML` usage | Grep for `dangerouslySetInnerHTML` |
| C4 | Unprotected API calls: `fetch` without status code check | Check `fetch` calls that don't verify `res.ok` or `res.status` |

### WARNING

| # | Check | Method |
|---|-------|--------|
| W1 | Event listeners not cleaned up in useEffect | Check `useEffect` with `addEventListener` for corresponding `removeEventListener` in cleanup |
| W2 | Missing ErrorBoundary in component tree | Verify ErrorBoundary wraps main content areas |
| W3 | Direct state mutation instead of immutable update | Grep for patterns like `state.field =` or `array.push(` inside setState |
| W4 | Empty catch blocks `catch {}` or `catch(e) {}` | Grep for empty catch blocks that swallow errors |
| W5 | useEffect dependency array incomplete or incorrect | Check useEffect hooks for missing dependencies |
| W6 | Dropdown/select component without `max-height` + `overflow-y: auto` | Grep for `dropdown`, `select`, `menu` classes and verify CSS has max-height and scroll |
| W7 | State toggle component only tested one direction | When a component switches between states, verify both A→B and B→A transitions |
| W8 | List data source grew 3x+ without UI scroll verification | If the diff adds >3x items to any rendered list, flag as WARNING — requires UAT verification |

### INFO

| # | Check | Method |
|---|-------|--------|
| I1 | `console.log` debug statements remaining | Grep for `console.log` (excluding `console.error`) |
| I2 | Hardcoded port numbers or configuration values | Look for numeric port values that should be config |
| I3 | CSS hardcoded colors instead of CSS variables | In CSS files, check for `#hex` or `rgb()` values that should use `var(--ds-*)` |

---

## C. Configuration Files

| # | Check | Severity | Method |
|---|-------|----------|--------|
| C1 | CORS allows `*` origin | WARNING | Check CORS configuration for wildcard origin |
| C2 | `.env` file contains real secrets | CRITICAL | Check for `.env` files with actual API keys (not placeholder values) |
| C3 | Test environment configured as production | WARNING | Verify environment setting is correct for the branch |

---

## D. CUPID Property Review

> Rate each changed code file on 5 properties (1-5 stars each).
> Focus improvement effort on the **weakest property**, not on making everything perfect.
> Source: Daniel Terhorst-North's CUPID principles.

### Rating Scale

| Stars | Meaning |
|-------|---------|
| ★ | Severe violation — needs immediate attention |
| ★★ | Significant issues — should improve soon |
| ★★★ | Adequate — meets basic standards |
| ★★★★ | Good — follows best practices well |
| ★★★★★ | Excellent — exemplary implementation |

### Properties

| Property | Core Question | Code Smells (rate lower) |
|----------|---------------|--------------------------|
| **Composable** | Can this be used independently, without extra burden? | Implicit dependencies, oversized API surface, tight coupling to specific framework internals |
| **Unix philosophy** | Does it do one thing, and do it well? | Function names containing "and"/"or", mixed abstraction levels, modules doing both I/O and logic |
| **Predictable** | Does behavior match the name and expectations? | Implicit side effects, silent failure modes, different behavior on second call, hidden state mutations |
| **Idiomatic** | Does it follow language/team conventions? | Reinventing standard library features, inconsistent patterns within the same file, non-standard naming |
| **Domain-based** | Does the code speak in domain language? | Generic names like `data`/`item`/`manager`/`handler`, leaking implementation details into API, technical jargon where business terms fit |

### How to Apply

For each changed file, answer:
1. **Composable**: Can I import and use this module/function without importing 5 other things?
2. **Unix**: If I describe what it does, is it one clear sentence or a paragraph?
3. **Predictable**: If I call it twice with same inputs, do I get the same result? Any surprises?
4. **Idiomatic**: Would a senior engineer in this language recognize the patterns?
5. **Domain**: Would a non-technical stakeholder understand the names?

### Output Format

```
| File | Composable | Unix | Predictable | Idiomatic | Domain | Weakest |
|------|-----------|------|-------------|-----------|--------|---------|
| path/file.py | ★★★ | ★★★★ | ★★ | ★★★★ | ★★★ | Predictable |
```

When any property is rated ★★ or below, include a WARNING in the issue list explaining what to improve and why.

---

## E. HARNESS.md Constraint Check

> If the project has a HARNESS.md file, ALL "Banned Patterns" and "Constraints" listed in it
> are automatically checked. Any violation is CRITICAL regardless of the checklist sections above.
>
> Common constraint examples:
> - "SQLite must use read-only mode" → Grep for violations
> - "Frontend CSS must use --ds- variables" → Grep for hardcoded colors
> - "All API endpoints must validate input" → Check for missing validation
>
> The reviewer should read HARNESS.md first and apply its rules with highest priority.

---

## F. Evolved Checks (Auto-generated by /evolve)

> This section is populated automatically by the /evolve command based on failure pattern history.
> Patterns with confidence >= 50% are checked during every review.
> Patterns with confidence >= 70% are also added to HARNESS.md as Evolved Rules.

<!-- No evolved checks yet. Run /evolve to generate them from review history. -->
