# 模块2：协同 Harness（通用多轮自主审核工具）

> **版本**：v1.4.0（spec-workflow）| **跨项目通用** | **不绑定任何项目**
>
> 一套给 Claude Code 增加"自动规划 + 多轮独立审核"能力的工具包。任何项目装上都能用。

---

## 这是什么

Harness 的核心是 `/kickoff` 命令：输入一个需求，自动产出**技术规格书 → 计划 → 任务**，并对每份文档做独立审核、再交叉做一致性检查，全部通过才放行。审核由**独立的 AI Agent**执行（与写作过程上下文隔离，不是"自己审自己"）。

它来自 spec-workflow 内核（v1.4.0），被 Claude Code 和 Codex 共同引用，**与具体项目无关**。

---

## 装了什么

| 类别 | 内容 | 部署到 |
|------|------|--------|
| **命令（9 个）** | `kickoff` `ship` `write-spec` `write-plan` `write-tasks` `implement-spec` `review` `qa` `merge-ready` | `~/.claude/commands/` |
| **审核 Agent（7 个）** | spec / plan / tasks / consistency / alignment-reviewer + reviewer + qa-tester | `~/.claude/agents/` |
| **共享资源** | 5 个模板 + 9 个清单 + 2 个 JSON 契约 + README + VERSION | `~/.spec-workflow/` |

---

## 安装（Windows）

```powershell
# 1. 打开 PowerShell
# 2. 进入本目录（01-harness）
cd "你解压的路径\ai-handoff-kit\01-harness"

# 3. 运行安装
.\install.ps1
```

脚本会自动部署到你的用户目录。**已有同名文件会备份**（加 `.bak-harness-时间戳` 后缀），绝不静默覆盖你的东西。可重复运行（升级时再跑一次即可）。

**若提示"禁止运行脚本"**（PowerShell 执行策略）：
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
然后重跑 `.\install.ps1`。

**验证**：打开 Claude Code（任意目录运行 `claude`），输入 `/`，应看到 `/kickoff` `/write-spec` 等命令。看不到就关掉 Claude Code 重开（命令在启动时加载）。

---

## 装完能做什么

| 命令 | 用途 |
|------|------|
| `/kickoff <需求>` | 自动规划 + 四步独立审核，到一致性审核通过为止（**本项目协作者主要用这个**） |
| `/write-spec` `/write-plan` `/write-tasks` | 单阶段写作（kickoff 内部会调用） |
| `/implement-spec` | 按任务清单写代码（写代码的开发者用） |
| `/review` `/qa` `/merge-ready` | 代码审核 / 浏览器测试 / 合并检查（写代码阶段用） |

本项目（AI 文案助手）的协作者：装好 harness 后，按 `02-collaboration/快速开始.md` 用 `/kickoff` 即可。

---

## 与 02-collaboration 的关系

| | 01-harness | 02-collaboration |
|---|---|---|
| **本质** | 工具（怎么自动规划和审核） | 规则（在这个项目里按什么协作） |
| **通用性** | 任何项目都能用 | 仅 AI 文案助手项目 |
| **版本** | v1.4.0（spec-workflow） | v1.0.0 |

两者**正交**：harness 可单独装到任何项目；collaboration 只服务本项目。配合使用 = harness 提供自动化能力，collaboration 提供项目规则。

---

## 独立使用（撇开本项目）

装了 harness 后，在**任何项目**目录里跑 `/kickoff <需求>`，都能走"需求 → 规格 → 计划 → 任务 → 审核"流程，不依赖 02-collaboration。想给别的项目用？直接在这套 harness 上加该项目的规范即可。

---

## 版本与升级

- **当前版本**：v1.4.0
- **升级方式**：项目负责人发新版 harness zip，重跑 `install.ps1`（自动备份旧文件）
- **hooks 说明**：spec-workflow 还有一层"强制轮次门禁"的 hooks（兜底防止静默退出），本包**未纳入默认安装**（装 hooks 需改 `settings.json`，有覆盖风险）。`/kickoff` 自身的轮次逻辑已足够，hooks 作可选增强——需要可找项目负责人。

---

## 常见问题

**Q：装了 harness 会影响我已有的 Claude Code 命令/agent 吗？**
A：不会覆盖。同名文件会自动备份成 `.bak-harness-时间戳`，你的原文件还在。

**Q：能在 Mac 上用吗？**
A：本包的 `install.ps1` 是 Windows 版。Mac 用户需要 `install.sh`（bash 版）——找项目负责人获取，或参考 `install.ps1` 逻辑手动复制文件到 `~/.claude/` 和 `~/.spec-workflow/`。

**Q：`/kickoff` 和 `/ship` 有什么区别？**
A：`/kickoff` 只跑到规划+审核（到人审 gate 停），适合非代码交付；`/ship` 是一条龙（规划→实现→审核→QA→合并），适合自己写代码的场景。本项目协作者只用 `/kickoff`。
