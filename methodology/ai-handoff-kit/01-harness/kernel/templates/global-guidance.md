# Global Spec Template

> Based on: github/spec-kit (106K stars), gsd-build/get-shit-done (63K stars), Fission-AI/OpenSpec (51K stars)
> Deploy: `~/.claude/spec-templates/global-guidance.md`
> `/write-spec` reads this template as the base structure.

---

## Core Rules

1. **Spec only describes WHAT and WHY, never HOW** — tech stack belongs in plan.md, not spec.md
2. **Use RFC 2119 keywords** — SHALL (mandatory), SHOULD (recommended), MAY (optional)
3. **Acceptance Criteria must use Given/When/Then format** — no vague language like "works properly"
4. **Out of Scope is mandatory** — explicitly list what is NOT included
5. **Edge cases are mandatory** — do not only describe happy paths
6. **Max 10 ACs per spec** — split into multiple specs if more are needed

---

## Spec Document Structure

Every spec.md MUST contain ALL of the following sections. None can be empty.

### Frontmatter (YAML)

```yaml
---
id: feature-slug          # kebab-case identifier
title: Feature Name
status: draft             # draft | review | approved | implemented | deprecated
priority: medium          # low | medium | high | critical
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

### 1. Overview

Explain WHY this change is needed:
- What problem currently exists
- What value the solution provides
- Who is affected (users, systems, data)

**Rules:**
- Describe business context only
- Do NOT mention tech stack, frameworks, or implementation details
- Keep it concise (3-5 sentences)

### 2. Goals

List explicit goals as checkboxes:
```markdown
## Goals
- [ ] Goal 1: {measurable outcome}
- [ ] Goal 2: {measurable outcome}
```

### 3. Out of Scope

Explicitly list what is NOT included in this change:
```markdown
## Out of Scope
- {Feature X} — will be addressed in a future iteration
- {Feature Y} — out of scope for this release
- {Known limitation} — accepted as-is
```

**Why this matters:** Without Out of Scope, scope creep is inevitable. Be aggressive about excluding things.

### 4. Requirements

#### 4.1 Functional Requirements

Number each requirement (FR-01, FR-02, etc.) and use SHALL/SHOULD language:
```markdown
### Functional Requirements
1. FR-01: The system SHALL {specific behavior}
2. FR-02: The system SHALL {specific behavior}
3. FR-03: The system SHOULD {recommended behavior}
```

**Rules:**
- Each FR must be independently verifiable
- Each FR must be specific (not "optimize performance" but "response time < 200ms")
- Use measurable criteria, not subjective terms

#### 4.2 Non-Functional Requirements

Cover at minimum:
```markdown
### Non-Functional Requirements
- Performance: {response time, throughput, concurrency}
- Security: {authentication, authorization, data protection}
- Compatibility: {browsers, devices, OS versions}
- Reliability: {error handling, recovery, uptime}
```

**Rules:**
- Each NFR must have a concrete metric
- If not applicable, state "N/A" with a reason (do not simply omit)

### 5. Acceptance Criteria

Each AC uses the Given/When/Then format:
```markdown
## Acceptance Criteria

AC-01: {Short description}
  GIVEN {initial state / precondition}
  WHEN {action / trigger}
  THEN {expected result}
  Edge Cases: {boundary conditions if applicable}

AC-02: {Short description}
  GIVEN ...
  WHEN ...
  THEN ...
```

**Rules:**
- Each AC must have a unique ID (AC-01, AC-02, ...)
- Each AC must be independently testable
- Expected result must be concrete enough to determine PASS/FAIL
- Include edge cases and error states as separate ACs
- Map each AC to a test type:
  - UI interaction → Playwright headed mode
  - API response → curl / fetch
  - Visual rendering → Playwright screenshot
  - Data correctness → DB query or page comparison

### 6. Edge Cases & Error Handling

List all non-happy-path scenarios:
```markdown
## Edge Cases & Error Handling
- Input validation failures: {what invalid inputs, how to handle}
- Network errors: {timeout, connection refused, retry strategy}
- Permission issues: {unauthorized, forbidden, role mismatch}
- Concurrency: {race conditions, double-submit, stale data}
- Empty data: {no results, first-time user, blank state}
- Large data: {pagination, virtual scroll, memory limits}
```

### 7. Open Questions

Track unresolved issues:
```markdown
## Open Questions
| # | Question | Status | Owner |
|---|----------|--------|-------|
| 1 | {question} | Open | {who decides} |
```

### 8. Clarifications

Record Q&A from spec review:
```markdown
## Clarifications
- **Q:** {question from review}
  **A:** {answer / decision}
- **Q:** {question from review}
  **A:** {answer / decision}
```

### 9. Review History

Track all review iterations:
```markdown
## Review History
- [YYYY-MM-DD] Initial draft by {author}
- [YYYY-MM-DD] Review #1: {PASS/FAIL} — {summary}
- [YYYY-MM-DD] Approved by {reviewer}
```

---

## QA Test Type Mapping

| AC Keyword | Test Type | Tool |
|------------|-----------|------|
| click, navigate, select, input | UI Interaction | Playwright headed |
| API response, status code, body | API Test | curl / fetch |
| display, render, layout | Visual Check | Playwright screenshot |
| data correct, value match | Data Validation | DB query / page comparison |

---

## Spec Review Criteria

Independent reviewer checks these dimensions:

1. **Completeness** — All required sections exist and are non-empty
2. **Feasibility** — Technical approach has no contradictions, dependencies are available
3. **Testability** — Each AC has clear verification method and expected result
4. **Edge Coverage** — Error states, boundary values, failure modes are covered
5. **Scope Control** — AC count is reasonable (<= 10), no implicit requirements
6. **No Ambiguity** — No "etc", "similar", "about", "roughly" — use exact language
7. **What Not How** — Spec describes behavior, not implementation; no tech stack mentioned

---

## Deferral Discipline（延期纪律，防 silent defer）

> feat-1 T09 事件的根因：commit notes 写 "defer to follow-up spec"，但 commit 标题声称覆盖 FR-06/FR-07、coverage matrix 仍标"覆盖"。
> 以下规则在 spec / plan / tasks / implement 全阶段强制执行。

### 声明 defer 的三同步义务

任何一次 defer（无论在 SPEC、PLAN、TASKS、commit message、还是代码注释里出现）必须**同时**完成以下三步，缺一不可：

1. **Coverage Matrix** — 把被 defer 的 FR/AC 对应行的 Status 改为 `Deferred`（或 `Partial` 若仍有部分实现）
2. **Deferral Log** — 在 TASKS.md 的 Deferral Log 加一行，包含：Task / Deferred FR或AC / Reason / Follow-up Spec ID / Approved By
3. **Commit Message** — 移除被 defer 的 FR 引用（不能 commit 标题仍写 "(FR-06)" 而 notes 说 defer）

### Defer 关键词触发清单（实现期 Pre-Commit Gate 自动检测）

以下关键词出现在 commit message 或 task notes 中时，Pre-Commit Gate 强制要求上述三同步：

```
defer / deferred / TODO / follow-up / follow up
后续 spec / 后续任务 / 后续阶段 / Phase N+ (N>=2)
out of scope / split into / not in this task / 留到 / 留待 / 暂不实现 / 暂缓
```

### Defer 审批门槛

- defer 单个 SHOULD 级 AC → Minor 偏差，记录即可
- defer 任何 SHALL 级 FR/AC → **Major 偏差，必须停止实现 + 与用户讨论**，不允许实现者单方面 defer
- defer 后必须创建一个 follow-up spec 占位（即使只是 `specs/NNN-tbd/`），不能"口头 defer"无落地

---

## Project Override Detection（项目层 override 检测）

> 全局 `/kickoff` `$kickoff` `/write-spec` `$write-spec` 等命令在启动时**必须先检测项目 override**，存在则遵循项目规范，不存在则用全局默认。

### 检测流程（每个 skill 的 Step 0）

1. 检测 `<project-root>/docs/development/spec-workflow.md` 是否存在
2. 存在 → 读其 YAML frontmatter 的 `spec_workflow` 块，提取：
   - `spec_dir`（默认 `docs/development/specs`）
   - `file_naming`：`lowercase`（项目用 `spec.md`）或 `uppercase`（全局用 `SPEC.md`）
   - `status_mechanism`：`frontmatter`（项目用 frontmatter status）或 `marker`（全局用 `.xxx-passed`）
   - `templates.project_override`：项目 override 模板目录
   - `deferral_requires_user_approval`（默认 true）
3. 不存在 → 使用全局默认：
   - `spec_dir = specs/`
   - `file_naming = uppercase`（`SPEC.md` / `PLAN.md` / `TASKS.md`）
   - `status_mechanism = marker`（`.spec-passed` 等 6 个 marker 文件）
4. 后续所有 Phase 的目录路径 / 文件名 / 状态机制都使用检测到的参数

### 模板叠加语义

项目 override 模板（如 `docs/development/specs/_templates/*.md`）**叠加**在全局模板之上，不替换：
- 全局模板 = 框架（保证跨项目一致性）
- 项目模板 = 补充（项目特有维度，如 Rollout / WebSocket / Agent 边界）

使用顺序：**先读全局模板，再读项目 override，最后合并**。冲突时项目 override 优先。

### 两套体系共存的边界

| 维度 | 全局默认 | 项目 override |
|------|---------|--------------|
| spec 目录 | `specs/{N}-{slug}/` | `docs/development/specs/NNN-feature-slug/` |
| 文件名 | 大写 `SPEC.md` | 小写 `spec.md` |
| 状态机制 | marker 文件（`.spec-passed`） | frontmatter `status` 字段 |
| 适用 | 本机任意新项目 | 本项目（已配置 override） |

项目 override 优先；全局默认仅在项目未配置时回退使用。

