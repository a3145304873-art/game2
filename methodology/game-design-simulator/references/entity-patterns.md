# 游戏实体模式参考

本文档列出游戏中常见的实体类型及其典型属性，供 Agent 在步骤 3（整理实体与属性列表）时参考。

---

## 基础实体类型

### 1. 角色类实体 (Character)

**适用：** 玩家、敌人、NPC、队友等

**典型属性：**
```python
# 生存属性
current_hp: int           # 当前生命值
max_hp: int               # 最大生命值
current_mp: int           # 当前法力值
max_mp: int               # 最大法力值
current_stamina: int      # 当前体力值

# 战斗属性
attack: int               # 攻击力
defense: int              # 防御力
magic_attack: int         # 魔法攻击
magic_defense: int        # 魔法防御
speed: int                # 速度/先手值
crit_rate: float          # 暴击率
crit_damage: float        # 暴击伤害倍率
dodge_rate: float         # 闪避率

# 状态属性
level: int                # 等级
experience: int           # 经验值
status_effects: list      # 状态效果列表（中毒、燃烧等）
buff_list: list           # BUFF 列表
position: tuple           # 位置坐标 (x, y)
```

---

### 2. 技能类实体 (Skill)

**适用：** 主动技能、被动技能、天赋等

**典型属性：**
```python
# 基础信息
skill_id: str             # 技能 ID
skill_name: str           # 技能名称
skill_type: str           # 技能类型（主动/被动）

# 消耗参数
mana_cost: int            # 法力消耗
stamina_cost: int         # 体力消耗
cooldown_turns: int       # 冷却回合数
current_cooldown: int     # 当前冷却剩余

# 效果参数
damage_multiplier: float  # 伤害系数
heal_multiplier: float    # 治疗系数
effect_duration: int      # 效果持续回合
target_count: int         # 目标数量
effect_range: float       # 效果范围

# 触发条件
trigger_condition: str    # 触发条件（回合开始/受到伤害时等）
activation_rate: float    # 触发概率
```

---

### 3. BUFF 类实体 (BuffEffect)

**适用：** 增益效果、减益效果、持续伤害等

**典型属性：**
```python
# 基础信息
buff_id: str              # BUFF ID
buff_name: str            # BUFF 名称
buff_type: str            # BUFF 类型（增益/减益/持续伤害）

# 叠加规则
stack_count: int          # 当前叠加层数
max_stacks: int           # 最大叠加层数
stack_policy: str         # 叠加策略（replace/stack/independent）

# 持续时间
duration_turns: int       # 持续回合数
remaining_turns: int      # 剩余回合数
is_permanent: bool        # 是否永久

# 效果数值
effect_value: float       # 效果数值
effect_type: str          # 效果类型（攻击加成/速度加成/DOT 等）
effect_rate: float        # 效果比率（每层效果）

# 触发器
trigger_on_turn_start: bool   # 回合开始触发
trigger_on_turn_end: bool     # 回合结束触发
trigger_on_damage: bool       # 受到伤害时触发
```

---

### 4. 物品类实体 (Item)

**适用：** 消耗品、装备、材料等

**典型属性：**
```python
# 基础信息
item_id: str              # 物品 ID
item_name: str            # 物品名称
item_type: str            # 物品类型（消耗品/装备/材料）
rarity: str               # 稀有度（R/SR/SSR）

# 数量信息
quantity: int             # 持有数量
max_stack: int            # 最大堆叠数

# 效果参数（消耗品）
effect_hp_restore: int    # HP 恢复量
effect_mp_restore: int    # MP 恢复量
effect_buff_id: str       # 附加 BUFF ID
effect_duration: int      # 效果持续时间

# 装备属性（装备）
equip_slot: str           # 装备部位
equip_attack_bonus: int   # 攻击加成
equip_defense_bonus: int  # 防御加成
equip_hp_bonus: int       # HP 加成
equip_special_effect: str # 特殊效果
```

---

### 5. 资源类实体 (Resource)

**适用：** 金币、钻石、体力、材料等

**典型属性：**
```python
# 基础信息
resource_id: str          # 资源 ID
resource_name: str        # 资源名称
resource_type: str        # 资源类型（货币/材料/体力）

# 数量信息
current_amount: int       # 当前持有量
max_capacity: int         # 最大容量（体力等有上限的）
natural regen_rate: int   # 自然恢复速率（如体力/小时）

# 产出参数
base_production: float    # 基础产出量
production_multiplier: float  # 产出倍率
production_interval: int  # 产出间隔（秒）
```

---

### 6. 建筑类实体 (Building)

**适用：** 模拟经营类游戏中的建筑

**典型属性：**
```python
# 基础信息
building_id: str          # 建筑 ID
building_name: str        # 建筑名称
building_type: str        # 建筑类型（产出/功能/装饰）

# 等级信息
level: int                # 当前等级
max_level: int            # 最高等级
experience: int           # 建筑经验值

# 产出参数
base_output: float        # 基础产出量
output_per_level: float   # 每级提升产出
output_multiplier: float  # 产出倍率
output_interval: int      # 产出间隔（秒）

# 升级参数
upgrade_cost: dict        # 升级消耗 {resource_id: amount}
upgrade_time: int         # 升级时间（秒）
```

---

### 7. 关卡类实体 (Stage)

**适用：** 关卡、副本、地图等

**典型属性：**
```python
# 基础信息
stage_id: str             # 关卡 ID
stage_name: str           # 关卡名称
difficulty: str           # 难度等级

# 敌人配置
enemy_list: list          # 敌人列表
enemy_spawn_rate: float   # 敌人刷新率
boss_id: str              # BOSS ID

# 掉落配置
drop_table: dict          # 掉落表 {item_id: probability}
drop_rate_multiplier: float  # 掉落率倍率

# 通关条件
win_condition: str        # 胜利条件（击败所有敌人/存活 N 回合等）
time_limit: int           # 时间限制（秒）
star_condition: dict      # 星级条件
```

---

## 边界情况检查清单

在整理实体属性时，需要考虑以下边界情况：

### 数值边界
- [ ] HP/MP 归零时的处理
- [ ] 数值是否会变成负数
- [ ] 是否有上限值（如最大 HP、最大层数）
- [ ] 是否有下限值（如最低伤害、最低概率）
- [ ] 溢出处理（超过整数范围）

### 状态边界
- [ ] 同时存在多个同类型 BUFF 时的处理
- [ ] 互斥 BUFF 的优先级判定
- [ ] 状态叠加的计算方式（加算/乘算）
- [ ] 状态刷新时的逻辑（重置持续时间/延长/覆盖）

### 时间边界
- [ ] 冷却时间为 0 时是否立即可用
- [ ] 持续效果的最后 1 回合何时结算
- [ ] 同时触发的多个效果的顺序
- [ ] 跨回合/跨阶段的持续效果处理

### 条件边界
- [ ] 资源不足时的处理（技能失效/部分生效）
- [ ] 目标无效时的处理（目标已死亡/目标数量不足）
- [ ] 条件不满足时的处理（等级不足/前置未解锁）

---

## 使用示例

### 示例：回合制战斗实体设计

```markdown
## 实体列表

### 实体 1: 玩家 (Player)
| 属性名 | 类型 | 初始值 | 说明 |
|--------|------|--------|------|
| current_hp | int | 1000 | 当前生命值 |
| max_hp | int | 1000 | 最大生命值 |
| attack | int | 150 | 攻击力 |
| defense | int | 80 | 防御力 |
| speed | int | 100 | 速度（决定先手） |
| crit_rate | float | 0.1 | 暴击率（10%） |
| buff_list | list | [] | 当前 BUFF 列表 |

### 实体 2: 技能 - 强力一击 (Skill)
| 属性名 | 类型 | 初始值 | 说明 |
|--------|------|--------|------|
| damage_multiplier | float | 1.5 | 伤害系数 150% |
| cooldown_turns | int | 3 | 冷却 3 回合 |
| current_cooldown | int | 0 | 当前冷却 |
| mana_cost | int | 50 | 消耗 50 法力 |

### 实体 3: BUFF - 攻击力提升 (Buff)
| 属性名 | 类型 | 初始值 | 说明 |
|--------|------|--------|------|
| stack_count | int | 0 | 当前层数 |
| max_stacks | int | 10 | 最大 10 层 |
| effect_per_stack | float | 0.1 | 每层 +10% 攻击 |
| duration_turns | int | 5 | 持续 5 回合 |
```

---

## 扩展建议

如需支持更复杂的游戏类型，可扩展以下实体：

- **队伍类 (Team)：** 多角色编队、阵营加成
- **地形类 (Terrain)：** 场地效果、地形加成
- **天气类 (Weather)：** 全局效果、持续时间
- **任务类 (Quest)：** 任务目标、进度追踪
- **成就类 (Achievement)：** 完成条件、奖励发放
