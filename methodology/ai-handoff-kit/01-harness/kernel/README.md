# Spec-Workflow Shared Kernel

> 跨 CLI 共享的 spec-first 开发工作流内核。
> 被 Claude Code (~/.claude/) 和 Codex (~/.codex/) 共同引用。

## 目录结构
```
~/.spec-workflow/
├── templates/          # 文档模板（5 个）
├── checklists/         # 审核清单（9 个）
├── schemas/            # JSON 契约（2 个）
├── README.md
├── VERSION
└── install.sh
```

## templates/（5 个）
global-guidance.md / plan-template.md / tasks-template.md / data-model-template.md / project-template.md

## checklists/（9 个）
spec-checklist.md / plan-checklist.md / tasks-checklist.md / consistency-checklist.md / alignment-checklist.md / code-checklist.md / visual-checklist.md / report-template.md / qa-report-template.md

## v1.1.0 加固项（防 silent defer）
- spec-checklist：大颗粒 FR 拆分检查 + 对抗式规则（0 问题必须论证）
- plan-checklist：plan-level task 拆分（4+ 子步骤/3+ 文件/2+ FR）+ KD defer 必须更新覆盖状态
- tasks-checklist：Verify 字段必须可执行 + Coverage Matrix 6 状态 + Deferral Log
- consistency-checklist：git log 验证 Matrix 真实性 + 实现阶段 mode（每 Phase 复核）
- global-guidance：Deferral Discipline（三同步义务）+ Project Override Detection

## 项目 override 检测
项目可在 `docs/development/spec-workflow.md` frontmatter 配 `spec_workflow` 块覆盖全局默认
（spec 目录 / 文件名大小写 / 状态机制）。全局 skill 启动时自动检测并遵循。

## 使用方式
两个 CLI 工具通过绝对路径引用本目录。修改模板/清单后两侧同时生效。

## 安装
Windows: powershell -File install.ps1
macOS:   bash install.sh