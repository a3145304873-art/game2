# 01 · SPEC 审核清单

> **审核对象**：`SPEC.md`（技术规格书）
> **执行者**：spec-reviewer（独立 Agent，`/kickoff` 自动调用）；降级时协作者人工对照本清单。
> **通过判据**：所有 CRITICAL 项清零 → 写入 `.spec-passed`。
> **轮次上限**：5 轮。

---

## 审核维度

### A. 完整性（CRITICAL）
- [ ] frontmatter 齐全：`id / title / status / priority / created / updated`
- [ ] 六段齐备：背景动机 / 详细需求(FR) / 验收标准(AC) / 技术方案 / 边界异常 / 范围边界
- [ ] 有明确的 Out of Scope（不做什么）

### B. 功能需求 FR 质量（CRITICAL）
- [ ] 每条 FR 用 `SHALL` / `SHALL NOT`（不是"应该""可以"等模糊词）
- [ ] 每条 FR 可观测、可实现（不是"优化体验""提升好感"等口号）
- [ ] FR 编号连续（FR-01、FR-02…）
- [ ] 无臆测需求（每条 FR 能追溯到 ISSUE.md）

### C. 验收标准 AC 质量（CRITICAL）
- [ ] 每条 AC 用 `GIVEN / WHEN / THEN` 格式
- [ ] 每条 AC 可测试（有明确的前置、操作、可观测结果）
- [ ] **每条 FR 至少有一条 AC 覆盖**（无落空的 FR）
- [ ] AC 编号清晰（AC-01、AC-02…，标注覆盖哪个 FR）

### D. 技术方案（WARNING）
- [ ] 高层方案与 FR 对齐，能支撑所有 FR
- [ ] 未过度设计（方案与需求匹配，不堆砌）

### E. 边界与异常（WARNING）
- [ ] 异常场景有处理方案
- [ ] 错误情况有降级/提示

### F. 边界一致性（WARNING）
- [ ] Out of Scope 与 PLAN/TASKS/DIFF 的"不改什么"一致（后续一致性审核复核）

---

## 常见 FAIL 原因与修复

| FAIL 原因 | 严重性 | 修复 |
|----------|--------|------|
| FR 不可观测（口号化） | CRITICAL | 改写成可观测行为 |
| AC 缺失或不可测试 | CRITICAL | 补 GIVEN/WHEN/THEN |
| FR 有但无 AC 覆盖 | CRITICAL | 补 AC |
| 缺 Out of Scope | CRITICAL | 补"不做什么" |
| 臆测需求（追溯不到 ISSUE） | CRITICAL | 删或回 ISSUE 确认 |
| 技术方案过度设计 | WARNING | 精简到匹配需求 |

---

## 备注

- SPEC 是后续所有文档的源头，质量问题会级联放大，**务必在 Phase 1 就过审**。
- 参考 spec-reviewer 的零信任原则：不假设作者意图，只看文档本身是否合格。
