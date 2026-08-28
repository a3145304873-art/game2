---
id: {kebab-case-slug}
title: {中文标题}
status: draft
priority: high
created: 2026-XX-XX
updated: 2026-XX-XX
---

# {中文标题}

> **用途**：技术规格书。定义"做什么"和"做到什么程度"。
> **产出方式**：通常由 `/kickoff` Phase 1 自动生成并审核。本模板供理解结构 / 手动修订时参照。
> **参考样例**：`specs/006-fix-long-announcement-crash/spec.md`

## Overview / 背景与动机

{为什么要做、解决什么问题。给足业务上下文，让没参与过的人也能懂。}

## Goals / 目标

- [ ] {可观测目标 1}
- [ ] {可观测目标 2}

## Out of Scope / 范围边界

- {不做什么 1} → {原因}
- {不做什么 2} → {原因}

## Requirements / 详细需求

### Functional Requirements（功能需求）

> 每条用 SHALL / SHALL NOT，编号 FR-01、FR-02…

1. FR-01: 系统 SHALL {可观测行为}。
2. FR-02: 系统 SHALL {在 X 条件下} {做 Y}。
3. FR-03: 系统 SHALL NOT {禁止的行为}。

### Acceptance Criteria（验收标准）

> 每条 GIVEN/WHEN/THEN，可测试。每条 FR 至少有一条 AC 覆盖。

1. **AC-01**（覆盖 FR-01）: GIVEN {前置} WHEN {操作} THEN {结果}。
2. **AC-02**（覆盖 FR-02）: GIVEN {前置} WHEN {操作} THEN {结果}。

## Technical Approach / 技术方案（高层）

{大致怎么实现。高层方案，不需到代码细节（那是 PLAN 的事）。}

## Edge Cases & Exceptions / 边界与异常

| 异常场景 | 处理方式 |
|---------|---------|
| {异常 1} | {降级/提示/阻断} |
| {异常 2} | {...} |

## Dependencies / 依赖

- {依赖的外部库/服务/其他 spec，无则填"无"}

---

## 自查（提交审核前）

- [ ] 每条 FR 用 SHALL/SHALL NOT，且可观测可实现
- [ ] 每条 AC 是 GIVEN/WHEN/THEN，可测试
- [ ] 每个 FR 至少有一条 AC 覆盖
- [ ] Out of Scope 明确
- [ ] 无模糊口号（如"优化体验"）
