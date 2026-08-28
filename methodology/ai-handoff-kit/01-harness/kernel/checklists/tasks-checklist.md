# Tasks Quality Checklist

> Tasks 审核员使用此清单逐项检查 TASKS.md 质量。
> TASKS.md 把 PLAN 拆成原子、可独立验证的工作单元；任何「声明覆盖但实际 defer」的 silent defer 必须在这里被拦截。

---

## CRITICAL (必须通过)

### 原子性与可验证性
- [ ] 每个 task 有唯一 ID（T01, T02...），无重复、无错号
- [ ] 每个 task 的 **Verify 字段是可执行断言**，必须满足以下任一形式：
  - 可运行命令（如 `npm test -- user.spec`、`curl -X GET ...`）
  - 测试引用（如 `tests/auth.test.ts:L20`）
  - 文件路径（如 `src/auth.ts` 存在且导出 `login`）
  - 具体 AC 引用（如 `满足 AC-03 的 GIVEN/WHEN/THEN`）
  - **不允许**「check it works」「确保功能正常」「测试通过」这类纯文字描述
- [ ] 每个 task 的 **Files 字段列出具体文件路径**（不能是「相关文件」「前端代码」等模糊描述）
- [ ] 每个 task 的 **Depends 字段完整**：所有前置 task 都已列出，无循环依赖
- [ ] 每个 task 映射到至少一个 AC（无「孤儿任务」），除非有显式理由（如基础设施 task）

### 颗粒度（防止大 task 隐含 defer）
- [ ] **任何 task 若满足以下任一条件，必须拆分为多个 task：**
  - 包含 4 个及以上子步骤（「先 A 再 B 然后 C 最后 D」）
  - 跨越 3 个及以上文件或模块
  - 影响范围覆盖 2 个及以上不相交 FR
- [ ] 单个 task 不应同时实现多个 FR（合并会导致 defer 一个 FR 时无法精确定位，是 silent defer 的主要来源）

### Coverage Matrix 规范
- [ ] TASKS.md 包含 Coverage Matrix（覆盖矩阵）
- [ ] **Matrix 的 Status 字段只能取以下 6 个值之一：**
  - `Pending` — 未开始
  - `In-Progress` — 实现中
  - `Implemented` — 已完成且验证通过
  - `Partial` — 部分完成（必须说明哪部分缺失）
  - `Deferred` — 显式推迟（必须在 Deferral Log 记录）
  - `Blocked` — 被阻塞（必须说明阻塞原因）
- [ ] **不允许整体留空，也不允许所有行只写 `Pending` 而无具体状态**（空 Matrix = 审核不通过）
- [ ] 每个 AC-XX 至少被一个 task 覆盖（无遗漏）
- [ ] Matrix 中标记 `Implemented` / `Partial` / `Deferred` 的行，必须有对应 git commit 证据（实现期一致性复核时检查）

### Deferral Log（若存在 defer）
- [ ] TASKS.md 包含 **Deferral Log** 章节（若任何 FR/AC 被 defer 则必填）
- [ ] Deferral Log 每行包含：Task ID / Deferred FR或AC / Reason / Follow-up Spec ID / Approved By
- [ ] Deferral Log 中的 FR/AC 必须与 Coverage Matrix 中标 `Deferred` 或 `Partial` 的行一一对应（不能 Matrix 标 Deferred 但 Log 缺失，反之亦然）

---

## WARNING (应当通过)

### 依赖与顺序
- [ ] Phase 分组合理（同 Phase 内 task 可并行或紧密相关）
- [ ] 跨 Phase 依赖方向正确（后置 Phase 依赖前置 Phase，不反向）
- [ ] 并行 task 用 `[P]` 标注且确实无相互依赖

### 完整性
- [ ] PLAN 的 Testing Strategy 在 TASKS 中有对应测试编写 task
- [ ] PLAN 提到的每个文件路径在至少一个 task 中出现
- [ ] SPEC 的 Edge Cases 在 TASKS 中有处理 task

---

## INFO (建议)

### 文档质量
- [ ] task 描述简洁清晰，无歧义
- [ ] 编号体系一致（FR-XX / AC-XX / T0X 引用准确）
- [ ] 与 spec.md / plan.md 术语一致

---

## 对抗式审核规则（Adversarial Mindset）

> 审核员必须以「找问题」而非「确认无误」的心态工作。

- [ ] **若报告 0 CRITICAL + 0 WARNING，必须给出显式的「为何无问题」论证段落。**
  - 论证必须引用具体证据（task ID / Verify 字段内容 / Matrix 行号），不能是空泛的「看起来没问题」。
  - 一份「0 CRITICAL + 0 WARNING 且无论证段」的报告视为 **INVALID**，等同于 FAIL。
- [ ] **重点「证伪」假设**：假设实现者会在某个 task 上 silent defer 一个 FR（如 feat-1 T09 模式），反推哪个 task 的 Verify 字段无法检测出 defer，并要求加强该 Verify。
- [ ] 报告至少列出 1 条「最弱项」（最接近 WARNING 但未达阈值的薄弱点），即使最终未升级为 WARNING。

---

## 审核结论规则

| 条件 | 结论 |
|------|------|
| 任何 CRITICAL 未通过 | **FAIL** — 指出具体 task ID，要求拆分 / 补 Verify / 补 Matrix 状态 |
| 所有 CRITICAL 通过，有 WARNING | **PASS**（附建议） |
| 0 CRITICAL + 0 WARNING + 有论证段 | **PASS** |
| 0 CRITICAL + 0 WARNING + 无论证段 | **INVALID**（视为 FAIL） |

**最大审核轮次：2 轮。**
