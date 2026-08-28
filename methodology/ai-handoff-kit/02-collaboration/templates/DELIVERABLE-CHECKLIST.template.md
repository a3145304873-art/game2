# 交付自检清单 · {Issue 标题}

> **用途**：协作者交付前的总自检。**全部勾选才能交付**。复制本文件填入实际信息，连同 spec 目录一起回传。
> **填写人**：协作者。

---

## 元信息

| 项 | 内容 |
|----|------|
| Issue | {标题} |
| spec 目录 | `specs/{N}-{slug}/` |
| 协作者 | {姓名} |
| 自检日期 | 2026-XX-XX |
| 交付接收方 | N8872 |

---

## 一、交付物齐备性

- [ ] `REQUIREMENTS.md` 存在（/kickoff 产出的需求确认）
- [ ] `SPEC.md` / `spec.md` 存在
- [ ] `PLAN.md` / `plan.md` 存在
- [ ] `TASKS.md` / `tasks.md` 存在，且含 **Coverage Matrix**
- [ ] `DIFF-ANALYSIS.md` 存在（模式 B 独有）
- [ ] `reviews/` 目录含四步审核报告

---

## 二、四步独立审核全部通过

- [ ] `.spec-passed` 存在（SPEC 审核通过）
- [ ] `.plan-passed` 存在（PLAN 审核通过）
- [ ] `.tasks-passed` 存在（TASKS 审核通过）
- [ ] `.consistency-passed` 存在（一致性审核通过）
- [ ] 一致性复审已纳入 DIFF-ANALYSIS（四份文档对齐）
- [ ] 未在 `.consistency-passed` 后继续跑 readiness/alignment/implement

---

## 三、文档质量

### SPEC
- [ ] 每条 FR 用 SHALL/SHALL NOT，可观测可实现
- [ ] 每条 AC 是 GIVEN/WHEN/THEN，可测试
- [ ] 每个 FR 有 AC 覆盖
- [ ] Out of Scope 明确

### PLAN
- [ ] 技术方案对齐 SPEC
- [ ] Key Decisions 每个有 ≥2 备选 + 理由
- [ ] API Contracts 具体到字段

### TASKS
- [ ] 任务原子化，可独立验证
- [ ] 每个任务有 Description/Files/Verify/Depends/AC Covered
- [ ] Coverage Matrix 覆盖所有 AC

### DIFF-ANALYSIS ★
- [ ] 每个改动点有**具体文件路径**
- [ ] 每个改动点可追溯到 SPEC 的 FR
- [ ] 每个改动点在 TASKS 有对应任务，无越界
- [ ] 现状描述引用真实 main 代码（文件/函数）
- [ ] 风险诚实，不确定项标注"需接收方确认"
- [ ] 源数据库只读等约束已遵守
- [ ] **未写业务代码**（只分析）

---

## 四、一致性

- [ ] 四份文档术语统一（同一概念用相同称呼）
- [ ] 四份文档的 Out of Scope 说法一致
- [ ] 无脱节：SPEC.FR → PLAN 方案 → TASKS 任务 → DIFF 改动点 全链贯通

---

## 五、洁净度

- [ ] 全文通读，无错别字、无 TODO 残留
- [ ] 无placeholder未填（如 `{xxx}`）
- [ ] 文档间无矛盾表述

---

## 六、需接收方确认的点（汇总）

> 把 DIFF-ANALYSIS 第 5.3 节及各文档中标注"需确认"的项汇总在此，方便接收方对齐审核时重点关注。

1. {需确认点 1}
2. {需确认点 2}

---

## 交付声明

```
本次交付为模式 B（非代码交付）。
四步独立审核已全部通过（.consistency-passed）。
DIFF-ANALYSIS 已含，改动点 {X} 处，涉及文件 {Y} 个。
已知风险/需确认点见第六节。
未包含任何业务代码。
```

**自检人签字**：{协作者}　　**日期**：2026-XX-XX

---

> 全部勾选后，将本清单连同 `specs/{N}-{slug}/` 整个目录回传接收方。
