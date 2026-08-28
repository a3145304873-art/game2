# Consistency Cross-Check Checklist

> 一致性审核员使用此清单，对 SPEC.md + PLAN.md + TASKS.md 三份文档进行交叉审核。
> 同时支持「实现阶段一致性复核」（implementation-phase mode），在 implement-spec 每个 Phase 结束时触发。

## CRITICAL (必须通过)

### 维度 1: SPEC ↔ PLAN 一致性
- [ ] 每个 FR-XX 在 PLAN.md 中有对应的技术方案段落
- [ ] PLAN 的范围不超出 SPEC 的 Out of Scope
- [ ] SPEC 和 PLAN 对同一功能描述不矛盾
- [ ] SPEC 中的 AC 在 PLAN 的 Testing Strategy 中都有对应测试

### 维度 2: PLAN ↔ TASKS 一致性
- [ ] PLAN 的每个技术方案段落在 TASKS.md 中有对应任务
- [ ] PLAN 中提到的每个文件路径在至少一个任务中出现
- [ ] 如 PLAN 有 Data Model，TASKS 中有创建/迁移任务
- [ ] 如 PLAN 有 API Contracts，TASKS 中有实现任务
- [ ] PLAN 的 Testing Strategy 在 TASKS 中有对应测试任务

### 维度 3: SPEC ↔ TASKS 一致性
- [ ] 每个 AC-XX 被 TASKS.md 中至少一个任务覆盖
- [ ] 没有"孤儿任务"
- [ ] 任务的 Verify 步骤能够验证对应的 AC
- [ ] SPEC 中的 Edge Cases 在 TASKS 中有处理任务

### 维度 4: 跨文档矛盾
- [ ] 三份文档对同一事物的命名一致
- [ ] 优先级一致
- [ ] 依赖关系合理
- [ ] 数据字段定义一致

### 维度 5: Coverage Matrix ↔ 实际实现一致性（实现期 mode 重点）
- [ ] **Coverage Matrix 中标 `Implemented` 的任务，其 commit message 是否真的包含对应 FR 的代码改动？**
  - 必须读 `git log` 验证：`git log --oneline -- <files>` 找到对应 commit
  - commit message 或 diff 必须能对应到该 FR/AC
- [ ] Matrix 标 `Partial` 的任务：缺失部分是否已在 Deferral Log 登记？
- [ ] Matrix 标 `Deferred` 的任务：是否在 Deferral Log 有完整行（FR/AC + reason + follow-up spec + approved by）？
- [ ] **commit message 声称覆盖某 FR（标题含 "(FR-XX)"）但 notes 含 defer 关键词** → silent defer，直接 FAIL
- [ ] Deferral Log 与 Coverage Matrix 双向一致（Matrix 的 Deferred/Partial 行 = Log 的行）

## WARNING (应当通过)
- [ ] 术语统一、缩写一致、编号体系一致
- [ ] TASKS.md 包含 Coverage Matrix 且无遗漏 AC
- [ ] Coverage Matrix Status 字段只取 6 个允许值（Pending/In-Progress/Implemented/Partial/Deferred/Blocked），无空缺

## 实现阶段一致性复核（implementation-phase mode）

在 implement-spec 期间每个 Phase 结束触发本模式（而非只在规划阶段一次性审核）：

1. 读本 Phase 所有 commit message（`git log <since>..<until>`）
2. 提取每个 commit 声称覆盖的 FR/AC
3. 对比 Coverage Matrix：声称覆盖的 FR 是否仍标"覆盖"？
4. 读 git diff 验证代码改动确实落地（不是空 commit 或只改注释）
5. 若发现 commit 声称覆盖但 Matrix 标 Deferred/Partial → 阻塞进入下一 Phase，强制修复

## 审核结论规则
任何 CRITICAL 未通过 → FAIL（指出哪个文档/哪个 commit 导致问题）
全部通过 → PASS

最大审核轮次：1 轮（规划阶段）。实现期 mode 不限轮次，每个 Phase 结束必查。