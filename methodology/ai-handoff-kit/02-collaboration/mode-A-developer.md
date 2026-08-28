# 模式 A：开发者协同模式

> 适用对象：**会写代码、能独立跑通本项目**的开发同学。
>
> 这是简版规范。开发者协同的核心是「分支开发 + 合并主干」，项目已有成熟的 Git worktree 工作流，本文件只做协同视角的指引，技术细节以仓库根 `CLAUDE.md` 的「Git 工作流」「新建 Worktree 标准流程」「Merge 到主干的 Checklist」为准。

---

## 1. 模式定位

协作者拿到接收方同步的最新 main 源码，在独立分支上完成功能开发与自测，交付可运行代码。接收方做 Code Review + QA，合并回主干。

**与模式 B 的区别**：模式 A 协作者写代码、跑测试、交付可运行分支；模式 B 协作者只交付文档、不碰代码。

---

## 2. 前置条件

协作者需具备：
- 本地能跑通项目（Python 后端 + React 前端，参考仓库根 `CLAUDE.md` 的「启动命令」）
- 掌握 Git 基本操作（worktree、commit、push）
- 安装 Claude Code（推荐，用于辅助开发与自测）

---

## 3. 流程

```
[接收方]                                    [协作者·开发同学]
   ├─ ① 同步最新 main 源码
   ├─ ② 分配测试服端口号（8501-8508）
   ├─ ③ 说明需求（Issue 或口头）
   │ ─────────────────────────────→
   │                                      ├─ ④ 按「新建 Worktree 标准流程」建分支
   │                                      ├─ ⑤ 改端口配置（config.py / vite.config.js / .bat）
   │                                      ├─ ⑥ 在分支上开发 + 自测
   │                                      ├─ ⑦ （推荐）用 Claude Code 自查代码质量
   │                                      └─ ⑧ 提交 commit，通知接收方
   │ ←─────────────────────────────
   ├─ ⑨ Code Review（独立 reviewer）
   ├─ ⑩ QA（Playwright 端到端验收）
   ├─ ⑪ 合并回 main + 打 tag + 升版本号
   └─ ⑫ 通知协作者合并完成（merge 后需 npm install）
```

---

## 4. 接收方准备（步骤 ①②③）

1. **同步源码**：把最新 main 代码给到协作者（打包、克隆或内部 git）。
2. **分配端口**：从 8501-8508 中选一个未占用的前端端口，后端 = 前端 − 5000。端口分配见仓库根 `CLAUDE.md` 的「服务器端口号记录」。
3. **说明需求**：写清要做什么、验收标准。可借用 [templates/ISSUE.template.md](./templates/ISSUE.template.md)。

---

## 5. 协作者操作（步骤 ④⑤⑥⑦⑧）

### ⑤ 建 Worktree 并改端口配置

严格按仓库根 `CLAUDE.md` 的「新建 Worktree 标准流程」执行，要点：
- worktree 目录与 main 同级：`F:/0-私域AI素材agent/feat-<feature>-<前端端口>/`
- 分支命名：`feat-<feature>-<前端端口>`
- **必改 3 个文件**：`backend/config.py`（PORT、ENV、CORS_ORIGINS）、`frontend/vite.config.js`（process.title、port、proxy target）、新建 `<前端端口>.bat`
- `.bat` 脚本**全部用英文**（避免 CMD 编码乱码）
- `npm install` 同步前端依赖

### ⑥ 开发与自测

- 每次改代码后重启测试服（杀端口 → 重启）
- **源数据库必须只读打开**：`sqlite3.connect(f"file:{path}?mode=ro", uri=True)`，禁止读写模式
- 禁止关闭非自己启动的进程（浏览器、编辑器等用户窗口）
- 用 [templates/DELIVERABLE-CHECKLIST.template.md](./templates/DELIVERABLE-CHECKLIST.template.md) 自检

### ⑦⑧ 提交

- commit message 用中文，遵循 `<类型>: <描述>`（feat / fix / refactor / docs / test / chore / perf / ci）
- 开发期间不碰版本号（merge 时才升）
- 推送后通知接收方 review

---

## 6. 接收方验收与合并（步骤 ⑨⑩⑪⑫）

按仓库根 `CLAUDE.md` 的「Merge 到主干的 Checklist」逐项执行：
1. 确定版本号（MINOR+1 新功能 / PATCH+1 修复 / MAJOR+1 重构）
2. 更新代码中版本号源文件
3. 更新 CLAUDE.md 版本信息
4. merge commit 标注版本号
5. 打 git tag
6. **关键路径 UI 验证**（启动镜像测试服 8509，真实操作核心功能）
7. 数据规模影响检查
8. 合并后通知协作者 `npm install`

---

## 7. 关键约束（红线）

| 约束 | 说明 |
|------|------|
| 端口规范 | 测试服前端 8501-8508，后端 = 前端 − 5000；正式服 3500/8500 禁碰 |
| 进程保护 | 只杀自己启动的进程，禁止 taskkill 用户的浏览器/编辑器 |
| SQLite 只读 | 源数据库只读打开，任何脚本操作前先复制到临时目录 |
| 不碰正式服 | 正式服由用户手动启动，CC 禁止启停正式服进程 |
| 不碰版本号 | 开发期间不改版本号，merge 时统一升 |
| 中文交互 | 所有沟通、commit message 用中文；bat 脚本用英文 |

---

## 8. 常见问题

**Q：协作者环境跑不起来怎么办？**
A：先确认 Python 依赖（`requirements.txt`）、前端依赖（`npm install`）、`.env` 配置（API key 等）齐全。仍不行则反馈接收方协助。

**Q：协作者能不能直接改 main？**
A：不能。所有开发在 `feat-*` 分支 worktree 进行，main 只接收 review 通过的 merge。

**Q：开发中发现需求本身有问题？**
A：停止编码，回到接收方澄清需求（参考模式 B 的「需求变更 → 回到 spec」原则）。不要带着错误理解硬写。
