# AI 协同交付工具包（AI Handoff Kit）

> **版本**：v1.0.0 | **日期**：2026-06-23 | **维护人**：N8872
>
> 一份 zip，让**不写代码的同学**也能参与 AI 文案助手项目的需求协作：下载 → 装工具 → 按规范产出文档，代码由项目负责人完成。

---

## 这是什么

本工具包含**两个独立模块**，配合使用：

| 模块 | 是什么 | 通用性 |
|------|--------|--------|
| **01-harness** | 通用多轮自主审核工具（spec-workflow v1.4.0） | 任何项目、任何 Claude Code 都能用 |
| **02-collaboration** | AI 文案助手项目的协同规范与模板 | 绑定本项目 |

**一句话理解**：harness 提供"怎么自动规划和审核"的工具；collaboration 定义"在这个项目里按什么规则协作"。前者通用，后者项目特定。两者正交——harness 可单独装到别的项目，collaboration 只服务本项目。

---

## 3 步上手（协作者）

```
① 解压        把本 zip 解压到任意位置
② 装工具      进入 01-harness，运行 install.ps1（见 01-harness/README.md）
③ 做任务      把 02-collaboration 重命名为 collaboration，
              放到项目代码根目录，按 02-collaboration/快速开始.md 操作
```

详细安装见 [01-harness/README.md](./01-harness/README.md) 和 [02-collaboration/环境准备.md](./02-collaboration/环境准备.md)。

---

## 目录结构

```
ai-handoff-kit/
├── README.md                ← 你在这里（总入口）
│
├── 01-harness/              模块2：通用审核工具（不绑定项目）
│   ├── README.md              说明 + 安装步骤
│   ├── install.ps1            一键安装（Windows）
│   ├── commands/              9 个命令（kickoff / ship / write-* / ...）
│   ├── agents/                7 个审核 agent
│   └── kernel/                共享资源（5 模板 + 9 清单 + 2 契约）
│
└── 02-collaboration/        模块1：项目协同规范（绑定 AI 文案助手）
    ├── README.md              项目协作总览
    ├── 快速开始.md             ★ 协作者首读：5 步上手
    ├── 环境准备.md             安装 Claude Code + Harness
    ├── mode-A-developer.md    模式 A：开发者协同（会写代码的同学）
    ├── mode-B-noncode/        模式 B：非代码交付（核心，大多数合作同学）
    ├── templates/             可直接 copy 的文档模板
    └── checklists/            审核清单
```

---

## 谁该看什么

| 你是 | 先看 |
|------|------|
| **协作者（不写代码）** | `01-harness/README.md`（装工具）→ `02-collaboration/快速开始.md`（做任务） |
| **协作者（会写代码）** | 同上，然后看 `02-collaboration/mode-A-developer.md` |
| **项目负责人（接收方）** | `02-collaboration/mode-B-noncode/01-接收方准备.md` + `05-交付与对齐验收.md` |

---

## 我该用哪个模式

- **会写代码、能跑通项目** → 模式 A（开发者）：拿代码、建分支、写代码、合并
- **不写代码、只交付需求文档** → 模式 B（非代码交付）：**大多数合作同学走这个**，产出规格书/计划/差异分析，代码由项目负责人写

详见 `02-collaboration/README.md` 的"两种模式速查"。

---

## 非代码交付的核心机制（一图记住）

```
你（协作者）：读规范 → 聊清需求 → AI 对比代码 → 跑 /kickoff
             → 看到一致性审核通过就停 → 写差异分析 → 自检交付
项目负责人：  收到交付 → 对齐审核（方向对不对）→ Spec 验收 → 接手写代码
```

**关键边界**：你交付文档、不碰代码；项目负责人判对错、写代码。四步独立审核由 harness 的独立 Agent 自动完成，对齐审核由项目负责人做。

---

## 版本与升级

| 组件 | 版本 |
|------|------|
| 工具包（本 kit） | v1.0.0 |
| 01-harness（spec-workflow） | v1.4.0 |
| 02-collaboration（项目规范） | v1.0.0 |

**升级**：项目负责人发新版本 zip，解压后重跑 `01-harness/install.ps1`（自动备份旧文件）。项目规范（02-collaboration）有更新时，替换该目录即可。

---

## 求助

- 装不上 / 命令用不了 → 看 `01-harness/README.md` 的常见问题，或 `02-collaboration/快速开始.md` 末尾的"卡住了？"
- 需求不清 → 直接问项目负责人，**不要自己猜**
- 审核反复失败 → 把问题转给项目负责人一起判断
