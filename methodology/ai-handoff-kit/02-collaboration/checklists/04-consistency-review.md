# 04 · 一致性审核清单

> **审核对象**：`SPEC.md` + `PLAN.md` + `TASKS.md` + `DIFF-ANALYSIS.md` **四份文档交叉一致性**
> **执行者**：consistency-reviewer（独立 Agent）；降级时协作者人工对照本清单。
> **通过判据**：四维度 CRITICAL 全清零 → 写入 `.consistency-passed` → **四步审核全部完成，立即停止**。
> **轮次上限**：2 轮（比前三步紧，写作时就要保持对齐）。

---

## 审核四维度

### 维度一：需求覆盖（CRITICAL · 核心）

> 每条需求从 SPEC 到 DIFF 必须全链贯通，无断点。

- [ ] SPEC 的**每条 FR** 在 PLAN 有对应技术方案
- [ ] SPEC 的**每条 FR** 在 TASKS 有对应任务
- [ ] SPEC 的**每条 FR** 在 DIFF-ANALYSIS 有对应改动点
- [ ] SPEC 的**每条 AC** 在 TASKS 的 Coverage Matrix 中被覆盖
- [ ] PLAN 的技术方案在 TASKS 都被拆成任务
- [ ] TASKS 的每个任务在 DIFF-ANALYSIS 有对应改动点（除非纯测试类任务）

### 维度二：无越界（CRITICAL）

> 反向检查：有没有"多出来的东西"。

- [ ] DIFF-ANALYSIS 的**每个改动点**都在 TASKS 范围内（无越界改动）
- [ ] TASKS 的**每个任务**都在 SPEC 范围内（无 SPEC 没要求的任务）
- [ ] PLAN 的方案都在 SPEC 需求范围内（无自嗨方案）
- [ ] 无"幽灵改动"：DIFF 提到改某文件，但没任何 TASKS/FR 对应

### 维度三：术语一致（WARNING）

> 同一概念在四份文档用相同称呼。

- [ ] 模块/组件/函数名称四份文档一致（如都叫"输入护栏"而非一处"护栏"一处"限制器"）
- [ ] 业务术语一致（如游戏产品称呼、场景名）
- [ ] 状态/枚举值命名一致

### 维度四：边界一致（CRITICAL）

> Out of Scope 四份文档说法一致。

- [ ] SPEC 的 Out of Scope 与 DIFF-ANALYSIS 的"不改什么"一致
- [ ] PLAN/TASKS 未涉及 Out of Scope 里的内容
- [ ] 四份文档对"本次做什么/不做什么"的描述不矛盾

---

## 交叉追溯表（审核工具）

审核时画一张追溯表，逐条验证全链贯通：

| SPEC.FR | SPEC.AC | PLAN 方案 | TASKS 任务 | DIFF 改动点 | 全链贯通？ |
|---------|---------|----------|-----------|------------|-----------|
| FR-01 | AC-01 | {有} | T01 | {改动1} | ✓ |
| FR-02 | AC-02 | {有} | T02,T03 | {改动2} | ✓ |
| FR-03 | AC-03 | {有？} | {有？} | {有？} | ✗ ← 断点 |

**任一行有空缺或矛盾 = 一致性 FAIL**。

---

## 常见 FAIL 原因与修复

| FAIL 原因 | 严重性 | 修复 |
|----------|--------|------|
| 某 FR 在 TASKS/DIFF 落空 | CRITICAL | 补 TASKS 任务 + DIFF 改动点 |
| DIFF 改动越界（无对应 TASKS） | CRITICAL | 删 DIFF 该项 或 加 TASKS |
| TASKS 任务越界（无对应 FR） | CRITICAL | 删任务 或 回 SPEC 加 FR |
| 术语不统一 | WARNING | 统一四份文档术语 |
| Out of Scope 矛盾 | CRITICAL | 统一边界描述 |

---

## 降级方案（无 spec-workflow 时）

若协作者环境无 consistency-reviewer，**必须**用本清单 + 交叉追溯表人工核对。重点：
1. 画完整追溯表，逐 FR 验证全链。
2. 反向查越界（每个 DIFF 改动、每个 TASKS 任务都要能追溯到 FR）。
3. 人工核对术语和边界。

> 降级审核风险更高，接收方对齐审核时需加强力度。

---

## 备注

- 一致性是"四份文档作为一个整体是否自洽"的关卡，**只有 2 轮**，务必写作时就对齐。
- `.consistency-passed` 出现 = 四步审核全部完成 = 协作者停止点。
