# Tasks Template

> This template is used by `/write-tasks` command.
> Tasks are created AFTER spec.md is approved AND plan.md is approved.
> Tasks break the plan into atomic, independently verifiable units of work.

---

## Tasks Document Structure

### Frontmatter (YAML)

```yaml
---
spec: feature-slug        # MUST match the spec.md id
plan: approved            # Plan must be approved before creating tasks
status: pending           # pending | in-progress | completed
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

### Task Format

```markdown
# Tasks: {Feature Name}

## Phase 1: {Phase Name}
> Objective: {what this phase achieves}

- [ ] T01: {Task title}
  - **Description:** {what to do, be specific}
  - **Files:** {file paths to create/modify}
  - **Verify:** {how to verify this task is complete}
  - **Depends:** none
  - **AC covered:** {which Acceptance Criteria this satisfies, e.g., AC-01}

- [ ] T02: {Task title}
  - **Description:** ...
  - **Files:** ...
  - **Verify:** ...
  - **Depends:** T01
  - **AC covered:** AC-01, AC-02

## Phase 2: {Phase Name}
> Objective: {what this phase achieves}

- [ ] T03: {Task title}
  - **Description:** ...
  - **Files:** ...
  - **Verify:** ...
  - **Depends:** T01, T02
  - **AC covered:** AC-03

- [P] T04: {Parallel task title}
  - **Description:** ...
  - **Files:** ...
  - **Verify:** ...
  - **Depends:** none
  - **AC covered:** AC-04
  - **Note:** [P] = can run in parallel with other tasks in same phase
```

### Task Rules

1. **Atomic** — Each task should be completable in a single context window
2. **Independently verifiable** — Each task has its own verification criteria
3. **Traceable** — Each task maps to at least one AC from spec.md
4. **Dependency-ordered** — Tasks respect dependencies, no circular references
5. **File-specific** — Each task lists the exact files to create or modify
6. **Parallel-aware** — Use `[P]` prefix for tasks that can run simultaneously

### Verify 字段格式规范（强制可执行）

**Verify 字段必须是可执行断言**，取以下任一形式：

```markdown
- **Verify:** `npm test -- auth.spec`                      # 可运行命令
- **Verify:** `tests/auth.test.ts:L20 passes`               # 测试引用
- **Verify:** `src/auth.ts exports function login()`         # 文件存在性 + 导出
- **Verify:** `satisfies AC-03 GIVEN/WHEN/THEN`              # 具体 AC 引用
- **Verify:** `curl -X GET /api/health returns 200`         # 可执行 HTTP 断言
```

**禁止**以下写法（视为审核 FAIL）：
- ❌ `Verify: check it works`
- ❌ `Verify: ensure functionality is correct`
- ❌ `Verify: test passes`（未指明哪个测试）
- ❌ `Verify: 确保功能正常`

### Dependency Notation

| Symbol | Meaning |
|--------|---------|
| `Depends: none` | No dependencies, can start immediately |
| `Depends: T01` | Must wait for T01 to complete |
| `Depends: T01, T02` | Must wait for both T01 and T02 |
| `[P]` prefix | Can run in parallel with other tasks in same phase |

### Phase Organization

- Phase 1: Foundation (models, database, base setup)
- Phase 2: Core logic (business rules, API endpoints)
- Phase 3: Integration (connect components, data flow)
- Phase 4: UI/Frontend (user-facing changes)
- Phase 5: Polish (testing, edge cases, documentation)

**Not all phases are required.** Skip phases that don't apply to the feature.

### Completion Tracking

After implementation, update each task:
```markdown
- [x] T01: {Task title}  ← checked off when complete
```

And add implementation notes:
```markdown
- [x] T01: Create user model
  - **Committed:** abc123f "feat: add user model"
  - **Notes:** Added email validation, skipped phone field (moved to T05)
```

---

## Coverage Matrix（覆盖矩阵，必填）

> 每个 AC 必须有对应 task；Status 字段反映真实实现状态，**禁止整体留空或只写 Pending**。

```markdown
## Coverage Matrix

| AC | Covered By | Status |
|----|-----------|--------|
| AC-01 | T01, T02 | Implemented |
| AC-02 | T02 | Implemented |
| AC-03 | T03 | Partial |
| AC-04 | T04 | Deferred |
```

### Status 字段取值（只能取这 6 个值之一）

| Status | 含义 | 附加要求 |
|--------|------|---------|
| `Pending` | 未开始 | — |
| `In-Progress` | 实现中 | — |
| `Implemented` | 已完成且验证通过 | 必须有对应 commit |
| `Partial` | 部分完成 | 必须在 Deferral Log 注明缺失部分 |
| `Deferred` | 显式推迟 | 必须在 Deferral Log 登记 |
| `Blocked` | 被阻塞 | 必须说明阻塞原因 |

---

## Deferral Log（延期登记，若存在 defer 则必填）

> **声明 defer 必须同步更新 Coverage Matrix + 此 Log。** 任何 commit message 里出现
> `defer / deferred / TODO / follow-up / 后续 spec / Phase N+ / out of scope / split into`
> 等关键词，对应 FR/AC 必须在此 Log 登记，否则视为 silent defer（审核 FAIL）。

```markdown
## Deferral Log

| Task | Deferred FR/AC | Reason | Follow-up Spec | Approved By |
|------|----------------|--------|----------------|-------------|
| T09 | FR-06, FR-07 | 实现 XXX 子模块需独立设计 | TBD-002 | @user (YYYY-MM-DD) |
```

### Deferral Log 与 Coverage Matrix 的一致性

- Matrix 标 `Deferred` 或 `Partial` 的 AC → **必须**在 Deferral Log 有对应行
- Deferral Log 的每行 → 对应 AC 在 Matrix 必须是 `Deferred` 或 `Partial`
- 两表不一致 = 审核直接 FAIL

