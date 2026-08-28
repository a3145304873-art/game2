# Alignment Checklist (Intent Fidelity)

> 对齐审核员（alignment-reviewer）使用此清单，校验 PLANNING 产出（spec.md + plan.md +
> tasks.md）是否**忠实服务于原始需求意图**（REQUIREMENTS.md）。
>
> **与 consistency-checklist.md 的区别**：一致性清单检查三份文档**之间**的内部一致性
> （FR↔plan↔tasks 追溯、无矛盾）。本清单检查**外部保真度**——产出是否解决了对的问题。
> 一份完全自洽的方案仍可能解决错误的问题（feat-1 的教训：全部 PASS 却偏离了原始意图）。

## 前置：读取 REQUIREMENTS.md

审核的基准是 `specs/{N}-{slug}/REQUIREMENTS.md`（Phase 0 需求确认环节沉淀的原始意图），
不是 spec.md 本身。若 REQUIREMENTS.md 缺失 → CRITICAL（对齐审核无基准，直接 FAIL）。

同时读取：spec.md、plan.md、tasks.md。

## CRITICAL (必须通过)

### 维度 1: 意图保真度 (Intent Fidelity)
- [ ] spec.md 的背景/问题陈述复述了 REQUIREMENTS.md 的**问题**，而非一个重新措辞的**解决方案**
- [ ] spec.md 的目标与 REQUIREMENTS.md 的目标 1:1 对应（无目标被凭空发明或丢弃）
- [ ] spec.md 中的「为什么」与 Phase 0 中用户陈述的动机一致

### 维度 2: 范围蔓延 / 漂移 (Scope Creep / Drift)
- [ ] 每个 FR 都能追溯到一条 REQUIREMENTS.md 需求（无解决未被问及问题的「孤儿 FR」）
- [ ] plan.md 没有任何段落实现了 REQUIREMENTS.md「Out of Scope」中明确排除的内容
- [ ] 无任务在既定目标之外镀金（例如用户未要求的 admin UI、SSO、审计日志）

### 维度 3: 遗漏需求检测 (Missed-Requirement Detection)
- [ ] REQUIREMENTS.md 的每个目标都有 ≥1 个 FR 覆盖（反向追溯：need → FR，不只 FR → plan）
- [ ] Phase 0 中用户**确认过的**每条「隐含假设」都被 plan.md 尊重（plan 不得静默推翻已确认假设）
- [ ] 用户点名的每个 actor/stakeholder 至少被一个 FR 服务

### 维度 4: AC 对原始需求的可追溯性
- [ ] 每个 AC 都能追溯到一条 REQUIREMENTS.md 目标，而不仅仅追溯到一个 FR
      （一个 AC 可以为某个本身已漂移的 FR 而存在）
- [ ] 用户陈述的 Success Metric 能被 ≥1 个 AC 验证

### 维度 5: 边界用例与既定需求的对齐
- [ ] Phase 0 对话中用户提出的破坏性/边界用例出现在 spec.md 的 Edge Cases 中
- [ ] 不存在**仅为满足模板**而存在的 spec Edge Case（每条必须映射到真实风险）

### 维度 6: 假设漂移 (Assumption Drift)
- [ ] plan.md 的技术决策不与任何**已确认**的 Phase 0 假设矛盾
- [ ] 若 plan.md **需要**一个用户**未确认**的假设 → 至少 WARNING（必须浮出，不得静默决定）

## WARNING (应当通过)
- [ ] REQUIREMENTS.md 的「Open Questions Resolved」中的每条决议都在 spec/plan 中被忠实体现
- [ ] 无需求被「技术上回应了字面意思但错过了本质」的情况（逐条复核 top-3 关键需求）
- [ ] 优先级一致：REQUIREMENTS.md 标记的核心目标在 tasks 中被优先处理

## 审核结论规则

- 任何 CRITICAL 未通过 → FAIL，必须**指出是哪条 REQUIREMENTS.md 需求被背叛**
  （引用 REQUIREMENTS.md 的章节编号 / 目标 G# / 假设 A# / 边界 E#）。
- 全部通过 → PASS。
- **Adversarial 规则**：若 genuinely 找不到任何问题（0 CRITICAL + 0 WARNING），
  **MUST** 写一段显式的「Why No Issues Found」论证，引用 REQUIREMENTS.md 章节编号 +
  Cross-Reference 行，说明检查了哪些薄弱点且确认无漂移。一份「0/0 且无论证段」的报告
  视为 INVALID，等同于 FAIL。

## 最大审核轮次

默认复用 `roundsPerPhase.readiness`（= 2）。FAIL 后修复对应文档并重跑对齐审核；
到达上限仍 FAIL → 上报人类（escalation，P4）。

## 结构化输出

返回 JSON（per `~/.spec-workflow/schemas/reviewer-return-schema.json`），`reviewType` 取
`"consistency"`（最近语义邻居，避免 schema 变更），`reportFile` 路径用
`alignment-review-<round>.md` 区分。`conclusion=PASS` 当且仅当 `criticalCount==0`，
且 `criticalCount` 必须等于 `findings` 中 severity=CRITICAL 的条目数——编排器校验此自洽性
后才写 `.alignment-passed` marker。
