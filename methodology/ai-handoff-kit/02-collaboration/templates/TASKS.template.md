---
id: {kebab-case-slug}
title: {中文标题 - 与 SPEC/PLAN 一致}
status: draft
created: 2026-XX-XX
---

# 任务分解 · {标题}

> **用途**：把 PLAN 拆成原子任务，可独立执行、独立验证。接收方写代码的施工清单。
> **产出方式**：通常由 `/kickoff` Phase 3 自动生成并审核。
> **红线**：任务原子化 + Coverage Matrix 覆盖所有 AC。

## Phase 1 · {阶段名，如 后端}

### T01 · {任务标题}
- **Description**: {这个任务做什么，一句话}
- **Files**: `{文件路径1}`, `{文件路径2}`
- **Verify**: {怎么验证完成}
- **Depends**: {前置任务 ID，如"无"或"T01"}
- **AC Covered**: {AC-01, AC-02}

### T02 · {任务标题}
- **Description**: {...}
- **Files**: {...}
- **Verify**: {...}
- **Depends**: {...}
- **AC Covered**: {...}

## Phase 2 · {阶段名，如 前端}

### T03 · {任务标题}
- **Description**: {...}
- **Files**: {...}
- **Verify**: {...}
- **Depends**: {...}
- **AC Covered**: {...}

## Phase 3 · {阶段名，如 测试}

### T04 · {...}
- ...

---

## Coverage Matrix（AC × Task 覆盖矩阵）

> 每条 AC 至少被一个任务覆盖。有落空的 AC 必须补任务。

| AC | T01 | T02 | T03 | T04 | ... |
|----|-----|-----|-----|-----|-----|
| AC-01 | ✓ | | | | |
| AC-02 | | ✓ | | | |
| AC-03 | | | ✓ | ✓ | |

---

## 自查（提交审核前）

- [ ] 每个任务原子化（一事一任务，可独立验证）
- [ ] 每个任务有 Description / Files / Verify / Depends / AC Covered
- [ ] Coverage Matrix 完整，每条 AC 有任务覆盖
- [ ] 任务与 PLAN 对齐，不越界 SPEC 范围
- [ ] Files 路径与 DIFF-ANALYSIS 改动点对应
