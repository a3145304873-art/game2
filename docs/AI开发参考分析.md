# 三个参考游戏的 AI 开发模式分析报告

> 分析对象（均来自 `E:\` 下的 zip，解压至 `E:\game\reference\`）：
> - `baka-yusha` = 笨蛋勇者斗恶龙（Game Jam 作品，UE5.7 壳 + HTML 玩法）
> - `blackscroll-zhongkui` = Black Scroll · 钟馗（Godot 4.7 分支，类吸血鬼幸存者）
> - `dighole-v02` = DigHoleTest03（UE 5.8 + Voxel Plugin 体素挖掘原型）
>
> ⚠️ 说明：这三个 zip 都是**打包产物**（exe/pck/pak），不含源码仓库和对外 agent 文档。本报告全部结论来自对产物的"取证式"分析（日志、二进制内嵌字符串、资源目录结构、元数据），证据链已在文中标注。真正写给 agent 的说明文档在作者源码仓库里，但钟馗项目把"任务看板"编译进了游戏数据，让我们能还原其 AI 协作流程。

---

## 一、三项目总览

| 项目 | 引擎 | 类型 | AI 参与方式（证据） | 打包时间 |
|------|------|------|---------------------|----------|
| 笨蛋勇者斗恶龙 | UE 5.7（CL-51494982）壳 + **单文件 HTML 玩法** | 解谜/编程拼图 | HTML 原型即 AI 产物；UE 只做"浏览器壳" | 2026-08-23（美术 08-22 晚完成） |
| Black Scroll · 钟馗 | Godot（fork 4.7.1，GDScript） | 类吸血鬼幸存者 + 时间流速机制 | 编辑器内置 **MCP 服务器**让 AI agent 直连项目；游戏数据里内嵌**开发任务看板**（含 git commit、砍单顺序） | 2026-08-23 15:27 |
| DigHoleTest03 | UE 5.8（CL-56057345）+ Voxel Plugin | 体素挖洞 | 快速迭代的原型构建（Test03/V02 命名、pdb 未剥离、CG 转场视频） | 2026-08-23 17:19 |

---

## 二、笨蛋勇者斗恶龙 —— "HTML 原型先行"模式

### 2.1 玩法
- 类型：**编程解谜**。玩家扮演"黑进游戏的程序员"，通过**拖拽代码块重写恶龙的 AI 循环**（if/else 分支），让笨蛋勇者活过 20 秒。
- 三幕式 meta 叙事（第一幕：让勇者活下去 → 第二幕：故意制造 null 崩溃 → 第三幕：利用时序 bug 造 4 个勇者），每幕解锁更多"代码树"。
- 核心证据：完整玩法就是这一个文件 `E:\game\reference\baka-yusha\Windows\GameJam\Content\DragonQuestGame.html`（837 行，单文件含 CSS/JS/剧情文案/音效引用/通关演出）。

### 2.2 UI 设计
- 全部 UI 为**手写 CSS**（深色底 `#0b0e14` + 紫色/橙色强调色），风格接近现代 IDE 主题。
- 布局：顶部倒计时读条（紧张感）→ 状态条（恶龙HP/勇者数/距离/尸体数）→ 左侧"代码树"（循环=紫圆、判断=黄菱形、分支=列、结束=红菱）→ 右侧日志流（带颜色分类：`sys/dragon/hero/err`）。
- 教学手法值得学：**把规则说明做成世界观的一部分**——"黑客手册"弹窗、`?` 提示按钮、图例弹窗，教学文案本身就是剧情。
- 细节：弹窗分 4 种风格（story 故事 / guide 教学 / result 结果 / glitch 报错抖动），死亡/通关有全屏演出 + 字幕 + 14 秒滚屏制作人名单。

### 2.3 美术资源放置与来源
```
GameJam\Content\
├── DragonQuestGame.html          ← 玩法本体（浏览器直接加载）
├── cave_empty.png / stage_cave.png   ← 场景底图
├── dragon_live.png (4390×5370) / dragon_dead.png / 龙 死亡.png
├── hero_standee.png / yongzhe.png / yongzhe_new.png / 人物 勇者.png
├── fire2.png / 龙 爆炸.png / 龙 爪击.png / wtf.png
└── UNDERTALE Soundtrack - 46 Spear of Justice.mp3 / 87 Hopes and Dreams.mp3
```
取证结果：
- **AI 生成 + Photoshop 后期**：PNG 内嵌 Adobe XMP 记录，`softwareAgent="Adobe Photoshop 22.0 (Windows)"`，保存时间为 2026-08-22 20:09 与 22:02（比赛前一夜集中出图）；巨龙立绘 4390×5370 的超大分辨率、纯色背景"立牌式"透明 cutout 都是 AI 生图流程特征。
- **版本迭代痕迹**：`yongzhe.png → yongzhe_new.png → 人物 勇者.png`、`dragon_live.png / 人物 龙.png`（同一张图两个命名）——AI 迭代时直接复制重命名，没有清理。
- **资源与代码同目录放置**：HTML 用相对路径 `src="cave_empty.png"` 引用，所有资源平铺在 Content 根目录（Game Jam 作品常见做法，也是 AI 单文件原型最省事的方式）。
- 风险点：直接使用 **Undertale 原声 mp3**（版权风险，仅在 Game Jam 场景可接受）。

### 2.4 UE 壳怎么包 HTML
- 日志 `GameJam\Saved\Logs\GameJam.log` 关键两行：
  - `LogLoad: LoadMap: /Game/Blueprints/Map/MainMap`
  - `LogTemp: OpenGameHTML: path=D:/gamejam/out2/Windows/GameJam/Content/DragonQuestGame.html url=file:///...`
- 即：UE 工程只有一个 MainMap + 浏览器控件，启动后加载本地 HTML。日志还暴露了作者开发目录 `D:/gamejam/out2/`。
- **启示**：AI 产出的 HTML 原型可以直接变成可参赛的桌面包——UE/Electron 都只是壳。

---

## 三、Black Scroll · 钟馗 —— "MCP 直连编辑器 + 任务看板"模式（重点）

这是三个项目里 AI 集成度最深、证据最完整的一个。

### 3.1 玩法与设计
- 类型：类吸血鬼幸存者。核心卖点（任务看板原文）：**"时间流速"机制**——TimeManager 提供 凝/疾 两态强制交替，滥用则触发"时停气竭"。
- 系统清单（从 pck 内路径复原）：
  - 战斗：转刀环绕攻击、自动攻击/投射物、斩邪符（方向剑气，复用 PlayerProjectile）、镇鬼符（范围定身=局部调 TimeManager 减速）、元素协同（雷/火/冰冻/星落/燃域）。
  - 怪物：Ghoul 小怪、三足鬼（远程投掷+DoT）、两头鬼（近身360°）、精英（高血慢速高"阴时"掉落），全部派生 `BaseMonster`；ZhongKuiBoss 阶段/硬直/召唤。
  - 成长：经验→升级→暂停弹三选一 UI→转刀 4 维强化（数量/转速/范围/穿透）+符箓强化。
  - 节奏：`WaveManager 45s×6波≈270s` 难度递增，第 3 波教学战、最终波 Boss 狂暴；Endless 无尽模式、怪物等级成长配置。
  - 叙事：Intro 开场动画 + **影神图鉴 22 条** + 序章/结尾文案。

### 3.2 目录结构 = 给 AI 的"地图"（美术资源怎么放）
```
res://game/                  ← 所有玩法代码，按系统分目录
├── combat/  wave/  monster/(config/ special/ scaling/ effects/)
├── boss/  drop/  hero/  map/  progression/  balance/
├── ui/(mainmenu/ hud/ boss/ codex/ pause/ upgrade/ result/
│        settings/ time/ transition/ credits/ debug/)
├── tutorial_boss/  showcase/  endless/  intro/  cg/  systems/
res://assets/                ← 所有美术，按"类型/对象/帧"三级
├── characters/<角色名>/walk-1..9.png, attack-1..8.png, idle.png, shadow.png, aperture.png
├── items/<武器名>/walk-1..N.png（七星护体剑/离火剑/符箓/爆符…）
├── environment/<场景>/  effects/<boss>/<特效>/
├── drop/  ui/(mainmenu/ tutorial_boss/ …)  sprites/(hero/knife/monster/)
├── audio/  ← 注意：看板里写着"assets/audio/ 为空目录！确认BGM/SFX位置并提交"（曾出过事故）
res://autoload/              ← 全局单例：TimeManager, AudioManager, BalanceRuntime,
│                              CodexManager, PlayerServer, ImpactFeedbackHub
res://addons/funplay_mcp/    ← ★ AI 开发插件（见 3.4）
res://addons/wuzu_bridge/
res://game/ui/debug/         ← 游戏内调试管理面板（DebugAdminController/Panel/MainMenuDebugPanel）
```
规律：**代码按"系统"分、美术按"类型/对象/帧"分、数值全部 .tres 数据化**（`game_balance.tres`、`monster_balance.tres`、`endless_mode_config.tres`、`first_level_wave_plan.tres`）。这套结构对 AI agent 极友好：改数值动 .tres、加怪建目录、加特效放 effects。

### 3.3 美术与音频来源
- 角色帧动画是 **Kenney 素材包**风格（`Ghoul Sprite Sheet 62 x 33`、`Hero Blue 54x53 Sprite`、`Tiny Alchemist Sprite Sheet 48x32`——文件名带尺寸是 Kenney 命名习惯），并记录了"三足鬼/两头鬼 sprite（沿用 Ghoul 风格）"——即 AI 建议统一画风复用同一素材包。
- 图层命名 `图层 26.png`~`图层 40 拷贝.png`：PS 分层素材直接进工程。
- UI：主菜单为整张 PNG 两态切换（`入画斩鬼(暗/亮)`、`影神图鉴(暗/亮)`、`游戏设置(暗/亮)`）；HUD 用"血条/血框"九宫格拼；组件命名统一 `Ornate` 前缀（OrnateTimePanel/OrnateBossHealthFrame/OrnateResultScreen）——**先定视觉主题词，再统一命名**。
- 字体独立成 .tres：`ZhongKuiDisplayFont.tres` / `ZhongKuiUIFont.tres` / `ZhongKuiTheme.tres`。
- 音频：`爱给网(aigei_com)` 中文命名音效 + freesound.org CC0（文件名带作者归因）。看板把音频列为"⚠️头号风险"。

### 3.4 给 agent 的"文档"：funplay_mcp 插件（关键证据）
pck 里打包了一整套编辑器插件（说明它们随项目一起提交、跟随导出）：

```
addons/funplay_mcp/
├── plugin.cfg / icon.svg
├── core/  funplay_mcp_server.gdc         ← MCP 服务端（跑在 Godot 编辑器里）
│          funplay_http_transport.gdc     ← HTTP 传输
│          funplay_mcp_request_handler.gdc
│          funplay_core_tools.gdc         ← 工具集（读/改场景、节点、资源）
│          funplay_tool_registry.gdc
│          funplay_resource_provider.gdc  ← 把资源内容喂给 agent
│          funplay_project_skill_manager.gdc ← ★ 项目级 skill 管理
│          funplay_prompt_provider.gdc    ← ★ 提示词提供器（"给 agent 的说明文档"）
│          funplay_client_config_writer.gdc ← 自动写客户端配置（Claude Code 等）
│          funplay_update_checker.gdc
├── runtime/ funplay_mcp_runtime_bridge.gdc
└── ui/      funplay_mcp_dock.gdc         ← 编辑器内 Dock 面板
```
这等于把 **"MCP 服务器装进游戏引擎"**：外部 AI（Claude Code 之类）通过 HTTP 连接正在运行的 Godot 编辑器，直接读写场景/脚本/资源；`prompt_provider` + `project_skill_manager` 就是"给 agent 的说明文档"的载体——项目规则、术语、skill 随仓库走，agent 一进来就知道怎么干。另有 `wuzu_bridge` 插件协同。

### 3.5 内嵌"开发任务看板"（最强证据）
pck 中有一个数据资源，字段含 `任务名称`/`岗位`，内容是一份完整的 AI 协作开发看板。节选原文：

**功能拆解（类似 feature 分支列表）：**
> 转刀系统 · 时间流速控制 · 波次管理 · 自动攻击/投射物 · Boss框架 · 阴时资源+TimeShard · 开场动画+图鉴+暂停菜单 · 钟馗+小鬼美术 · Web发布链路 · 符箓法术×2 · 小怪差异化×3 · 数值表v2 · 新怪sprite×2+符箓图标 · 音频资产落库⚠️头号风险 · 推送本地提交 · 术语统一+看板 · build升级三选一框架 · Boss弹幕×3+狂暴 · Boss战+升级文案 …

**设计备注（prompt 级的粒度）：**
> - 环绕转刀攻击 · TimeManager 凝/疾强制交替+时停气竭机制 · WaveManager 45s×6波≈270s 难度递增
> - 斩邪符=方向剑气(复用PlayerProjectile)；镇鬼符=范围定身(局部调TimeManager减速)；自动释放+对象池
> - 三足鬼(远程投掷+DoT)/两头鬼(近身360°)/精英(高血慢速高阴时掉落) 派生 BaseMonster
> - 300s波次曲线/阴时经济/符箓CD与伤害/新怪三维；build选项×5清单
> - 经验→升级→暂停弹三选一UI→接转刀4维(数量/转速/范围/穿透)+符箓强化
> - **推送 e541c11(时停气竭机制)到远端**（← git commit hash 也写进看板）
> - 统一「阴时」术语+更新任务看板
> - **assets/audio/ 为空目录！确认 BGM/SFX 文件位置并提交进仓库**（← agent 检查并留 bug 备注）

**里程碑/发布节奏（Game Jam 倒排）：**
> 第一轮全程实测 → 第二轮平衡定稿 → 内容冻结 → 参赛文档 → 封面图+截图×3 → Web最终部署+域名验证 → 热修待命+性能终验 → 最终构建+参赛提交 → 最终冒烟

**砍单顺序（超预算时的降级清单）：**
> ①符箓砍至1个(只留斩邪) ②小怪砍至2种(砍精英) ③Boss砍至2阶段(狂暴并入P2) ④build砍至3选项 ⑤不动TimeManager

这就是他们"给 agent 的说明文档"的实操形态：**不是 README，而是一张随项目走、被 agent 持续更新的任务看板**（含术语表、风险、砍单序、commit 记录）。

---

## 四、DigHoleV02 —— 引擎功能原型模式

- UE 5.8 + 市售 **Voxel Plugin**（`Plugins\VoxelPlu…V13_UE58`，含 embree3 光线追踪库）→ 体素挖洞玩法。
- `DigHoleTest03` + zip 名 `V02`：快速迭代编号（Test03 说明至少试了 3 版）。
- 打包含 `DigHoleTest03.pdb`（调试符号未剥离）→ 开发中构建，非发布版。
- `Content\Movies\CG\入场.mp4`（27MB）+ `离场.mp4`（22MB）：入场/离场 CG 转场，很可能是 AI 视频生成或引擎 Sequencer 渲染——**用 CG 视频包装原型观感**是低成本提质感的手法。
- 游戏资源全部在加密/压缩的 `.ucas` 里，无法直接读取（UE 5.8 IoStore 默认加密签名），说明作者**没有刻意开放内容**，这项目更像"功能验证"而非"AI 深度协作"样本。
- 可学的一点：**先验证核心机制（挖洞手感），再包装（CG、UI）**；依赖成熟插件省时间。

---

## 五、可复用的 AI 开发方法论（提炼）

1. **HTML 单文件原型先行**（笨勇者）：玩法验证期用单个 HTML 交付，浏览器即运行环境，改起来最快；验证通过后 UE/Electron 只当壳。你甚至可以保持 HTML 原型与正式版并存（笨勇者直接把 HTML 打进包里）。
2. **让 agent 直连引擎**（钟馗）：用 MCP（Funplay/wuzu 这套 Godot 插件，或 UE 的类似方案）把"读写项目"变成 agent 的工具调用，而不是让 agent 靠猜。配套 `prompt_provider`（项目提示词）与 `project_skill_manager`（项目规则），随仓库提交。
3. **任务看板内嵌项目**（钟馗）：看板条目按"功能拆解 + 设计备注 + 风险 + commit hash + 砍单顺序"写；每个新功能先写一行看板任务，agent 完成后更新状态。术语要统一（"阴时"）。
4. **数值与文案数据化**：`.tres`/JSON 配置独立于代码（balance/wave_plan/monster_balance），AI 调平衡不碰逻辑；升级选项、图鉴文案放数据表。
5. **目录即文档**：`game/<系统>/` 代码、`assets/<类型>/<对象>/walk-N.png` 美术、`autoload/` 单例。新资产放哪里一目了然，agent 不需要问。
6. **美术流水线**：AI 生图（高分率/纯背景立绘）→ PS 22 修图抠图 → 透明 PNG 立牌式使用；小怪/场景用 Kenney 类免费素材包统一画风；帧动画命名 walk/attack/idle + 序号；UI 整图暗/亮两态 + 九宫格血条。
7. **音效来源**：爱给网 / freesound(CC0)，文件名写清来源与用途；把音频当作"头号风险"提前落库。
8. **发布倒排**：内容冻结 → 文档/物料 → Web 导出+域名验证 → 构建参赛 → 冒烟。Web 版可玩链接是参赛/分享关键。

---

## 六、对《末世后30天》的直接建议

你的项目是生存管理 + 每日循环 + 团队事件（见 `E:\game\docs\phase2\`），和三个参考项目互补性很强。建议：

### 6.1 技术路线
- 你的玩法是**回合/日循环管理**，天然适合"HTML 单文件原型先行"（笨勇者模式）：先用一个 HTML 把"日出→分配任务→日间事件→夜间结算"做通，2D UI 用 CSS 反而最快。
- 若走 Godot（钟馗路线）：装 funplay/wuzu MCP 插件，让 Claude 类 agent 直连编辑器；代码按 `game/` 分系统、数值全进 .tres。
- 若走 UE：仅当需要体素/3D 大场景（DigHole 路线）才值得。

### 6.2 给 agent 的说明文档（直接照抄钟馗形态）
在仓库根放三样东西，随代码提交：
- `AGENTS.md`：项目一句话定位、目录地图、术语表（把 phase2 文档里的"士气/精神压力/阴时"式术语固化）、美术命名规范、禁止事项（如"不要动 TimeManager 类核心系统"）。
- `TASKS.md`（任务看板）：按里程碑写行，含设计备注、风险标记、commit 号、砍单顺序。每个新系统先登记再开发。
- 数值/文案全部进 `data/`（任务类型表、士气加减表、事件选项后果表——你的 phase2 文档本身就是绝佳的 agent 上下文，建议转成结构化数据文件喂给 agent）。

### 6.3 UI 设计
- 参考笨勇者的"规则即世界观"教学：把生存手册做成游戏内物件（电台广播、生存笔记），教学不打断氛围。
- 参考钟馗的 UI 分层：主界面整图两态、HUD 九宫格血条/资源条、事件弹窗走"故事风"（类似笨勇者 story 弹窗）、结算页单独设计；先定一个视觉主题词（你的可以是"冷色+暖气炉光"）贯穿命名。
- 事件三选一（你的矛盾事件系统）≈ 钟馗的升级三选一 UI，可直接参考其结构。

### 6.4 美术资源放置
```
assets/
├── characters/<角色名>/(portrait.png, walk-1..N.png)   ← 每个 NPC 一个文件夹
├── environment/<地点名>/（安全屋/街区/雪地 背景）
├── ui/(mainmenu/ hud/ event/ result/)   ← UI 按界面分
├── effects/（暴风雪/火炉/受伤粒子）
└── audio/(bgm/ sfx/)   ← 提前建目录并放占位，避免钟馗的"音频事故"
```
素材来源优先级：AI 生图（立绘/背景）→ PS 修 → Kenney 类免费包（道具/图标）→ 爱给网/freesound（音效）。

### 6.5 开发节奏
按钟馗看板倒排：核心循环 HTML 原型（1-2 天）→ 系统逐个落地（每系统=一行看板任务）→ 第一轮实测 → 数值平衡轮 → **内容冻结** → 文案/图鉴补齐 → 物料（封面+截图×3+演示视频）→ Web 部署验证 → 提交/参赛。

---

## 附：取证产物位置
- 参考项目：`E:\game\reference\baka-yusha\`、`E:\game\reference\blackscroll-zhongkui\`、`E:\game\reference\dighole-v02\`
- 笨勇者玩法源码：`E:\game\reference\baka-yusha\Windows\GameJam\Content\DragonQuestGame.html`
- 钟馗 pck 解析脚本：`E:\game\reference\blackscroll-zhongkui\extract_pck.ps1` / `extract_pck2.ps1` / `probe_pck.ps1`（pck 为 Godot 4.7 定制格式，索引尾部加密/交错，脚本仅部分可用）
- 取证要点均可复现：UE 日志 `GameJam.log`（OpenGameHTML 行）、钟馗任务看板字符串在 pck 偏移 100,386,915 附近
