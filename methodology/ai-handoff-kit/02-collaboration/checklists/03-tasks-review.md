# 03 · TASKS 审核清单

> **审核对象**：`TASKS.md`（任务分解）
> **执行者**：tasks-reviewer（独立 Agent，文档一致性维度）；降级时协作者人工对照本清单。
> **通过判据**：所有 CRITICAL 项清零 → 写入 `.tasks-passed`。
> **轮次上限**：5 轮。

---

## 审核维度

### A. 原子性（CRITICAL）
- [ ] 每个任务**只做一件事**，粒度合理（不是"实现后端"这种大任务）
- [ ] 每个任务可**独立验证**（有明确的 Verify）
- [ ] 任务可被一个开发者在一次连续工作中完成

### B. 五要素齐备（CRITICAL）
- [ ] 每个任务有唯一 ID（T01、T02…，全文档唯一）
- [ ] 每个任务有 **Description**（做什么）
- [ ] 每个任务有 **Files**（涉及文件路径）
- [ ] 每个任务有 **Verify**（怎么验证完成）
- [ ] 每个任务有 **Depends**（前置依赖，无则标"无"）
- [ ] 每个任务有 **AC Covered**（覆盖哪些 AC）

### C. 覆盖矩阵（CRITICAL · 最易 FAIL）
- [ ] **存在 Coverage Matrix**（AC × Task 表）
- [ ] **每条 AC 至少被一个任务覆盖**（无落空的 AC）
- [ ] 矩阵与正文任务对应一致

### D. 与 PLAN/SPEC 对齐（CRITICAL）
- [ ] 任务不越界 SPEC 范围（没有任务做了 SPEC 没要求的）
- [ ] 任务对应 PLAN 的技术方案
- [ ] Files 路径与 DIFF-ANALYSIS 的改动点对应

### E. 依赖关系（WARNING）
- [ ] Depends 关系合理，无循环依赖
- [ ] Phase 分组合理（如按后端/前端/测试分阶段）

### F. 可执行性（WARNING）
- [ ] Verify 是具体的验证手段（如"运行 xxx 测试""UI 上看到 xxx"），不是"完成即可"
- [ ] 任务顺序合理（被依赖的在前）

---

## 常见 FAIL 原因与修复

| FAIL 原因 | 严重性 | 修复 |
|----------|--------|------|
| 任务粒度过大 | CRITICAL | 拆成多个原子任务 |
| 缺 Coverage Matrix | CRITICAL | 补 AC × Task 矩阵 |
| 某 AC 无任务覆盖 | CRITICAL | 补任务覆盖该 AC |
| 任务缺五要素之一 | CRITICAL | 补齐（尤其 Files/Verify/AC Covered） |
| 任务越界 SPEC | CRITICAL | 删除或回 SPEC 调整范围 |
| Files 与 DIFF 不对应 | CRITICAL | 对齐两边 |

---

## 备注

- TASKS 是接收方写代码的施工清单，**原子化 + 覆盖完整**是两大核心。
- Coverage Matrix 是硬指标：有 AC 落空 = FAIL。
