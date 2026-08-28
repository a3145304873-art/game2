# AI行为系统参考

## 变量定义
- `game_mode` (Enum): 游戏模式，取值为：Single_Player（单人）、Online_Multiplayer（在线多人）
- `ai_complexity_requirement` (Level): AI复杂度需求，取值为：High（高）、Low（低）、Unit_Level（单元级）
- `卵数量` (Integer): 巢中当前的卵的数量，必须大于0
- `敌人距离` (Float): 敌人与巢穴之间的距离，单位：米
- `安全持续时间` (Float): 敌人离开50米范围后持续的时间，单位：秒

## 约束条件
- 不适用于非游戏类软件的智能需求分析
- 适用于任何时间的所有母龙（核心机制）

## 源示例
- 《激战》的PvE模式
- 实时策略游戏的单元级AI