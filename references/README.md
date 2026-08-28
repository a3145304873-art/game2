# 参考资料 · AI 生成小游戏

本文件夹存放从 GitHub 拉取的 AI 小游戏开发提示词与示例仓库快照（2026-08-27 抓取），供后续设计小游戏时参考。原仓库持续更新，建议定期回上游查看。

## 目录索引

| 文件夹 | 来源 | 是什么 | 怎么用 |
|---|---|---|---|
| `ai-game-prompts/` | [Glitch-Gaming-Platform/AI-Prompts-For-Game-Development](https://github.com/Glitch-Gaming-Platform/AI-Prompts-For-Game-Development) (67★) | 游戏开发提示词教程：教你怎么写提示词、按什么顺序提问才能让 AI 做出完整可玩游戏 | **做游戏前先读这个**的 README |
| `ai-good-games/` | [EmbraceAGI/AIGoodGames](https://github.com/EmbraceAGI/AIGoodGames) (379★) | 中文 AI 游戏合集，含《Dungeon-Adventurer》《Journey2West》《WorldSimulator》等完整项目 | 看别人如何描述玩法规则；借鉴选题和文案风格 |
| `awesome-ai-game/` | [bowen-aigame/awesome-ai-game](https://github.com/bowen-aigame/awesome-ai-game) (107★) | 最新 AI 游戏精选清单（链接型 awesome 列表） | 找灵感、找同类产品对标 |
| `wonderful-prompts/` | [langgptai/wonderful-prompts](https://github.com/langgptai/wonderful-prompts) | 中文 Prompt 精选，含大量可玩的角色扮演/互动玩法提示词（`examples/` 下有完整案例） | 学中文提示词的表达套路 |
| `html5-gamedev-skill/` | [Sudhanshu5669/Html5-Gamedev-Skill](https://github.com/Sudhanshu5669/Html5-Gamedev-Skill) | 打包好的 Claude Code Skill：把"如何做 HTML5 游戏"写成系统提示词 | 可直接装进 `.claude/skills` 或抄它的结构自建 skill |
| `everything-game-dev-code/` | [MRCalderon3D/everything-game-dev-code](https://github.com/MRCalderon3D/everything-game-dev-code) (78★) | 完整脚手架：42 agents / 51 commands / 86 skills 的多引擎 AI 游戏开发体系，附示例项目 | 参考它怎么把"做游戏流程"拆成结构化提示词；大体积演示素材已裁剪 |
| `arcade-games/` | [luksamuk/arcade-games](https://github.com/luksamuk/arcade-games) | 一次性(one-shot)提示词生成的街机小游戏实测（web/raylib/bevy 三套），配 Kimi K2.6 | 对照"提示词 vs 成品"，直观感受哪些要求模型能稳定实现 |
| `html5-games-collection/` | [Anionex/html5-games-collection](https://github.com/Anionex/html5-games-collection) | 经典小游戏合集，每个都是独立单文件 HTML，AI 制作 | 直接当模板：改主题/换皮肤就能得到新游戏 |

其他入口：GitHub Topics [`ai-game`](https://github.com/topics/ai-game)、[`html-games`](https://github.com/topics/html-games)，新项目会持续出现。

## 对标样例

> 另有本地生成目录 **`demos/`**（非外部抓取，为按提示词库产出的轻量成品）：
> [`demos/pasture-goose-lite.html`](demos/pasture-goose-lite.html) —— 《鹅鹅牧场·攒金币》2D 版，贪吃蛇式成长玩法 × 奖励发放模块样例：单文件零依赖、API/埋点/分享均为占位接口、程序化绘制可被 `window.ASSETS` 整体替换，用于评审与对接演示。
> [`demos/pasture-goose-3d.html`](demos/pasture-goose-3d.html) —— **3D 版**（对标《大鹅吃草》参照设计）：Three.js 第三人称跟尾相机 + 内嵌原版鹅 GLB 模型 + 虚拟摇杆（pointer/mouse/touch 三通道兜底）+ 键盘双操作，奖励层（黑金风+福利二选一）与 2D 版同源。**已内联 three.js vendor（data:URL importmap，单文件离线可用，1.77MB）**；构建链：`build-3d.js`（复用 2D 版 CSS/DOM 组装 importmap，自动改写 GLTFLoader 相对导入）+ `inject-assets.js`；游戏核心在 `game3d.module.js`（512 写实草地纹理+地形起伏/**3800 株实例化草叶：风向+湍流 uniforms、根梢渐变、逆光透光，参数对标原作着色器**/镂空草丛贴图/**程序化骨骼走路**——GLB 有 rig 无动画剪辑，按骨骼名抓四肢正弦摆腿+屈膝/**真实阴影贴图**（castShadow+PCFSoft，替代假圆片）/**啄草动作**（gooseInner 俯仰，对标原作 neckPivot）/**rAF 停摆兜底定时器**——嵌入环境节流导致"模型不动"的根因修复）。自动化验收钩子：`?test=1` 自动行走、`?shot=1` 回传截图、`?autostart=1` 跳过菜单；`serve-and-save.js` 为本地托管+截图回收服务，`vendor-fetch.html` 为 CDN 文件的浏览器代理下载器（shell 直连 CDN 被拦时用）。
> 已接入《大鹅吃草》复用素材 4 件（宝箱/手势/福袋/卷轴，`demos/assets_ref/` 存有解码原图，`demos/inject-assets.js` 为幂等的 base64 注入打包脚本——新素材按映射文件名丢进 assets_ref 后重跑即可）。
> **大鹅 3D 模型已找回并完成 2D 化**：原作把模型以 `window.GOOSE_GLB_B64` 裸 base64 内嵌（400KB GLB，Meshopt 压缩，系 Tripo AI 生成的卡通鸭模型），已导出 `demos/assets_ref/goose.glb`；并通过「本地服务 `serve-and-save.js` + 自动渲染页 `goose-auto.html`」的浏览器自动化管线完成 GLB→PNG 转换（`?sweep=1` 可渲 8 方向标定图，正式导出用 `?rot=90`，即嘴朝 12 点的俯视背身视角；**改参数重渲时 URL 需带时间戳参数防浏览器缓存**）。已注入 `goose` 键上屏，demo 中鹅/宝箱/草/背景全部支持素材热替换。手动版渲染器为 `goose-render.html`。
> 两点注意：① 草地在原作中为纯着色器程序化绘制，无资源可提取——demo 已内置**同思路的 GLSL 草地烘焙**（噪声色斑+修剪条纹+草叶+小花，启动时烘一次零运行开销），外部 `bg_tile.png` 素材仍可随时覆盖；② 该批素材为燕云黑金风（疑似燕云十六声相关物料），**正式对外投放前务必确认其版权归属与跨项目复用许可**。
> [`demos/coupon-rain.html`](demos/coupon-rain.html) —— 《福袋雨·接住就有券》，接落物（红包雨）原型 × **A+C 奖励结构**（完成必得保底券包 + 连续 3 日累计解锁抽奖资格）的发券促转化评审版：竖屏单文件零依赖、Canvas 程序化绘制红金喜庆风、WebAudio 合成音效；领奖链路完整走通（两段式结算→礼包卡→留资校验→券码复制），getConfig/submitScore/claimReward/shareToFriend 及 onGameStart/onGameOver/onGiftClick/reward_* 埋点全为占位接口、调用位置与后端约定对齐；频控每日 5 局耗尽自动切"邀请好友"裂变入口。玩法与奖项数值集中在文件头 CONFIG 常量区，改文案换肤即可提测。

- **`benchmarks/大鹅吃草_单文件版.html`**（1.3MB，4175 行，原始出处：`C:\Users\N31738\Documents\我的POPO\`）
  运营活动小游戏的对标成品，值得拆解的要点：
  - **技术形态**：内嵌压缩版 Three.js（WebGL 渲染）+ 单 HTML 文件交付，零外部依赖，可直接投递
  - **移动端适配**：`viewport-fit=cover`、`env(safe-area-inset-*)` 刘海/底部安全区、`touch-action:none` 防滚动
  - **运营模块**：顶部 HUD 计分条、结束弹窗、"福利二选一"礼包卡（黑金风格奖励 UI）——活动游戏必备的转化位设计
  - **美术资源**：约 7 处 base64 内嵌资源（图片/音频），打包进单文件不裂图
  - 中文界面 + 宋体标题字 + 高对比配色，符合微信内传播场景
- **`benchmarks/netease_ref_1.html`**（《式神福气赏》，阴阳师 IP，2026-08-27 抓取自 act-test.ds.163.com）
  - **形态归属**：与大鹅吃草正相反的另一极——DA 活动搭建平台产出：`DA_GROUP_ID/PROJECT_ID` 注入变量，逻辑在外链 bundle，登录(URS)/任务(ds-act-sdk)/验证码(易盾)/小程序导航胶囊均为组件注入，资源走 CDN 不内联
  - **玩法本质**："任务累积型"发奖（无单局胜负）：做任务→得召唤券→召唤式神攒「福气值」→全场累计推进"红包开放倒计时"→每日限定时段（示例 12:55 开）领奖，大奖含 30 元红包、"欧皇降临"金光抽赏变体
  - **防刷细节**：已领取后整体换静态素材并禁点防重复；单日最高福气值即日榜维度；规则页半透明遮罩压在主界面上（上下文不丢）
  - **工程细节值得抄**：2160×3840 设计基准配 `--du: calc(var(--sw)/2160)` 缩放单位保证任意设备与设计稿一致；`100dvh` 兼容鸿蒙地址栏/手势条；楷体 woff2 WebFont 全端统一字形；**设计标注与实现说明直接以注释嵌在源码里（代码即需求文档）**

## 小游戏生成提示词速查模板

> 另见 [`运营小游戏提示词库.md`](运营小游戏提示词库.md)：一条挖空骨架 + 10 个活动常用玩法原型（接落物/打地鼠/跳一跳/翻牌配对等），按"骨架 + 选原型 + 运营模块"三段拼装即可直接投喂 AI；第六章附配套 **AI 生图提示词包**（梦幻西游系 Q 版国风 / 第五人格系哥特暗黑 / 清新休闲三种画风块 × 角色、道具、tile、弹窗、特效、KV 全套资产模板）；第七章为 **奖励发放设计**——先定奖励档位与频控预算，再反推游戏数值，含可直接拼装的「奖励发放模块」提示词与服务端防超发要点。

生成 HTML5 单文件小游戏时，以下要素覆盖越全，一次成功率越高：

```
请用【单个 HTML 文件】(内联 CSS/JS，无外部依赖)实现一个小游戏：<玩法主题>

- 核心循环：玩家如何操作(键盘方向键/WASD/鼠标)、目标是什么
- 难度曲线：随时间/得分递增的具体规则
- 计分与结束条件：分数规则、失败判定、最高分(localStorage)
- 反馈：得分/碰撞/游戏结束要有视觉反馈，尽量加音效(WebAudio 合成，不引音频文件)
- 视觉：Canvas 绘制，深色背景高对比配色，按钮hover效果
- 适配：窗口自适应 + 移动端触控支持
- 边界：暂停功能(P键)、防作弊不需要但逻辑要严谨
```

迭代修复时在原对话继续追加即可，如"移动端上画面溢出了，把画布限制为 max-width:100%"。
