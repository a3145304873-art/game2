# 02 · PLAN 审核清单

> **审核对象**：`PLAN.md`（技术实现计划）
> **执行者**：plan-reviewer（独立 Agent）；降级时协作者人工对照本清单。
> **通过判据**：所有 CRITICAL 项清零 → 写入 `.plan-passed`。
> **轮次上限**：5 轮。

---

## 审核维度

### A. 完整性（CRITICAL）
- [ ] 七段齐备：Technical Approach / Data Model / API Contracts / Key Decisions / Risks / Testing / Dependencies
- [ ] 技术方案覆盖 SPEC 的所有 FR

### B. Key Decisions（CRITICAL · 最易 FAIL）
- [ ] **每个关键决策都有 ≥2 备选方案**
- [ ] 每个备选列了优缺点
- [ ] 选定方案给了**理由**（为什么选 A 不选 B）
- [ ] 无"就这么做"式无备选决策

### C. API Contracts（CRITICAL）
- [ ] 新增/修改接口都列了路径、方法
- [ ] 入参、出参具体到字段（不是"加个接口"）
- [ ] 错误码/异常情况说明

### D. Data Model（CRITICAL · 项目约束）
- [ ] 涉及数据库变更时，**未修改源数据库表**（源 DB 只读）
- [ ] 如需新数据，用新表/新库，不改 `data/*.db` 源表
- [ ] 数据结构变更说明清楚

### E. 与现状对齐（CRITICAL）
- [ ] 技术方案对照 DIFF-ANALYSIS 的 main 现状，**不脱离代码实际**
- [ ] 引用的现有模块/函数真实存在

### F. 风险（WARNING）
- [ ] 识别了主要技术风险
- [ ] 每个风险有应对建议
- [ ] 未隐瞒已知风险（如项目历史坑：DSML、SSE 双重序列化等）

### G. 测试策略（WARNING）
- [ ] 有单元/集成/E2E 测试规划
- [ ] 测试覆盖关键路径

---

## 常见 FAIL 原因与修复

| FAIL 原因 | 严重性 | 修复 |
|----------|--------|------|
| 决策无备选（最常见） | CRITICAL | 每个"就这么做"补 ≥2 备选 + 理由 |
| API Contract 模糊 | CRITICAL | 细化到字段 |
| 改了源数据库表 | CRITICAL | 改为新表/新库 |
| 方案脱离 main 现状 | CRITICAL | 对照 DIFF-ANALYSIS 修正 |
| 未覆盖某条 FR | CRITICAL | 补方案或回 SPEC 调整 |

---

## 备注

- plan-reviewer 的核心是 **Key Decisions 要有备选**——这是避免"拍脑袋方案"的关键。
- PLAN 必须能落地：接收方看完应知道"技术上怎么做"。
