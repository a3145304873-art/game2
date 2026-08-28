# 数值公式模板

本文档列出游戏中常见的数值公式模板，供 Agent 在步骤 5（生成模拟原型代码）时参考。

---

## 基础公式类型

### 1. 伤害计算公式

#### 减法公式
```python
# 最简单直接的公式
damage = attack - defense

# 带最低伤害保护
damage = max(MIN_DAMAGE, attack - defense)

# 带系数调整
damage = max(MIN_DAMAGE, attack * multiplier - defense)
```

**适用场景：** 数值较小、防御直接抵消攻击的游戏

---

#### 比例公式
```python
# 防御按百分比减伤
damage_ratio = 1.0 - (defense / (defense + CONSTANT))
damage = attack * damage_ratio

# 常见变形（魔兽世界的护甲减伤）
damage_ratio = 1.0 / (1.0 + (defense / CONSTANT))
damage = attack * damage_ratio

# 常数 K 的常见取值
# K = 5000 适用于 defense 在 0-10000 范围
# K = 500 适用于 defense 在 0-1000 范围
```

**适用场景：** 需要防御收益递减的游戏

---

#### 乘区公式
```python
# 多个独立乘区相乘
damage = base_damage * skill_multiplier * buff_multiplier * crit_multiplier * element_multiplier

# 各乘区定义
base_damage = attack * attack_multiplier
skill_multiplier = skill_damage_percent  # 如 1.5 = 150%
buff_multiplier = 1.0 + sum(buff_effects)  # 所有 BUFF 加成相加
crit_multiplier = 1.0 + (crit_rate * (crit_damage - 1.0))  # 期望暴击乘区
element_multiplier = element_effectiveness  # 属性克制 (2.0/1.0/0.5)
```

**适用场景：** 复杂战斗系统、多 BUFF 叠加的游戏

---

#### 随机浮动公式
```python
import random

# 在基础伤害上增加随机浮动
damage_range = random.uniform(DAMAGE_VARIANCE_LOW, DAMAGE_VARIANCE_HIGH)
damage = base_damage * damage_range

# 常见浮动范围
DAMAGE_VARIANCE_LOW = 0.85   # -15%
DAMAGE_VARIANCE_HIGH = 1.15  # +15%

# 或固定浮动值
damage = base_damage + random.randint(-FLOAT_VALUE, FLOAT_VALUE)
```

**适用场景：** 增加战斗随机性、避免数值过于确定

---

### 2. 成长公式

#### 线性成长
```python
# 每级固定增长
value_at_level = base_value + (level - 1) * growth_per_level

# 示例
max_hp_at_50 = 1000 + (50 - 1) * 50  # 3450
```

**适用场景：** 简单直接的养成系统

---

#### 指数成长
```python
# 指数增长（常见于 HP、攻击等主属性）
value_at_level = base_value * (1.0 + growth_rate) ** (level - 1)

# 示例（5% 增长率）
max_hp_at_50 = 1000 * (1.05) ** 49  # 约 10921

# 或带常数修正的指数公式
value_at_level = base_value * (1 + (level - 1) * growth_rate + ((level - 1) ** 2) * quadratic_coefficient)
```

**适用场景：** 需要后期数值快速膨胀的游戏

---

#### 分段成长
```python
def get_value_at_level(base_value, level):
    if level <= 10:
        growth_rate = 0.10  # 1-10 级，10% 增长
    elif level <= 30:
        growth_rate = 0.08  # 11-30 级，8% 增长
    elif level <= 50:
        growth_rate = 0.05  # 31-50 级，5% 增长
    else:
        growth_rate = 0.03  # 51 级以上，3% 增长

    return int(base_value * (1 + growth_rate) ** (level - 1))
```

**适用场景：** 不同阶段有不同成长曲线的游戏

---

#### S 型成长曲线
```python
# S 型曲线（先加速后减速）
def sigmoid_growth(level, max_level):
    # 归一化到 0-1
    x = (level - 1) / (max_level - 1)
    # S 型函数
    s_curve = 1 / (1 + math.exp(-10 * (x - 0.5)))
    # 映射到实际数值范围
    min_value = base_value
    max_value = base_value * 10
    return min_value + (max_value - min_value) * s_curve
```

**适用场景：** 需要平滑过渡的成长系统

---

### 3. 概率公式

#### 基础概率
```python
import random

# 简单概率判定
def check_probability(probability):
    return random.random() < probability

# 使用示例
if check_probability(0.2):  # 20% 概率触发
    apply_crit()
```

---

#### 多次独立判定
```python
# N 次独立判定，计算期望触发次数
def expected_triggers(probability, trials):
    return probability * trials

# 至少触发 1 次的概率
def at_least_once_probability(probability, trials):
    return 1.0 - (1.0 - probability) ** trials

# 示例：20% 暴击率，攻击 5 次至少暴击 1 次的概率
# = 1 - (0.8)^5 = 0.672 = 67.2%
```

---

#### 保底机制（硬保底）
```python
class PitySystem:
    def __init__(self, base_probability, pity_count):
        self.base_probability = base_probability  # 基础概率
        self.pity_count = pity_count              # 保底次数
        self.current_attempts = 0

    def draw(self):
        self.current_attempts += 1

        # 保底触发
        if self.current_attempts >= self.pity_count:
            self.current_attempts = 0
            return True

        # 基础概率
        if random.random() < self.base_probability:
            self.current_attempts = 0
            return True

        return False
```

**适用场景：** 抽卡系统、暴击保底等

---

#### 软保底（概率递增）
```python
class SoftPitySystem:
    def __init__(self, base_probability, pity_start, probability_increase):
        self.base_probability = base_probability      # 基础概率
        self.pity_start = pity_start                  # 从第几次开始递增
        self.probability_increase = probability_increase  # 每次增加的 probability
        self.current_attempts = 0

    def get_current_probability(self):
        if self.current_attempts < self.pity_start:
            return self.base_probability
        else:
            extra_attempts = self.current_attempts - self.pity_start
            increased_probability = self.base_probability + (extra_attempts * self.probability_increase)
            return min(increased_probability, 1.0)  # 不超过 100%
```

**适用场景：** 原神等游戏的抽卡机制

---

### 4. BUFF 叠加公式

#### 加法叠加
```python
# 所有 BUFF 效果简单相加
total_multiplier = 1.0 + sum(buff.effect_value for buff in active_buffs)

# 示例
# BUFF1: +10% 攻击
# BUFF2: +20% 攻击
# 最终 multiplier = 1.0 + 0.1 + 0.2 = 1.3 (130%)
```

**适用场景：** 简单叠加，收益线性

---

#### 乘法叠加
```python
# 每个 BUFF 独立乘算
total_multiplier = 1.0
for buff in active_buffs:
    total_multiplier *= (1.0 + buff.effect_value)

# 示例
# BUFF1: +10% 攻击
# BUFF2: +20% 攻击
# 最终 multiplier = 1.0 * 1.1 * 1.2 = 1.32 (132%)
```

**适用场景：** 防止叠加过强，收益递减

---

#### 同类加法、异类乘法
```python
# 将 BUFF 按类型分组
buff_groups = {}
for buff in active_buffs:
    if buff.type not in buff_groups:
        buff_groups[buff.type] = []
    buff_groups[buff.type].append(buff.effect_value)

# 组内加法，组间乘法
total_multiplier = 1.0
for group_type, effects in buff_groups.items():
    group_sum = 1.0 + sum(effects)
    total_multiplier *= group_sum

# 示例
# 攻击加成组：+10%, +20% → 1.3
# 伤害加成组：+15%, +25% → 1.4
# 最终 multiplier = 1.3 * 1.4 = 1.82 (182%)
```

**适用场景：** 复杂战斗系统、需要平衡多种 BUFF

---

#### 层数叠加
```python
# 每层固定效果
def get_stack_effect(base_effect, current_stacks, max_stacks):
    return base_effect * min(current_stacks, max_stacks)

# 每层递增效果
def get_stack_effect_increasing(base_effect, current_stacks, max_stacks):
    actual_stacks = min(current_stacks, max_stacks)
    # 等差数列求和：1 + 2 + 3 + ... + n = n(n+1)/2
    total_multiplier = actual_stacks * (actual_stacks + 1) / 2
    return base_effect * total_multiplier

# 每层递减效果（收益递减）
def get_stack_effect_diminishing(base_effect, current_stacks, max_stacks):
    actual_stacks = min(current_stacks, max_stacks)
    total_effect = 0
    for i in range(actual_stacks):
        # 每层效果为上一层的 80%
        total_effect += base_effect * (0.8 ** i)
    return total_effect
```

---

### 5. 冷却公式

#### 基础冷却
```python
# 每回合减少冷却
def tick_cooldown(current_cooldown):
    return max(0, current_cooldown - 1)

# 检查是否可用
def is_ready(current_cooldown):
    return current_cooldown == 0
```

---

#### 急速影响冷却
```python
# 急速百分比减少冷却
def get_actual_cooldown(base_cooldown, haste_percentage):
    # haste_percentage = 0.2 表示 +20% 急速
    return base_cooldown / (1.0 + haste_percentage)

# 示例
# 基础冷却 10 回合，急速 20%
# 实际冷却 = 10 / 1.2 = 8.33 → 8 回合（向下取整）
```

---

#### 冷却缩减上限
```python
# 带上限的冷却缩减
def get_cooldown_with_cdr(base_cooldown, cdr_percentage, max_cdr):
    # max_cdr = 0.4 表示最多 40% 冷却缩减
    actual_cdr = min(cdr_percentage, max_cdr)
    return int(base_cooldown * (1.0 - actual_cdr))

# 示例
# 基础冷却 10 回合，冷却缩减 50%，上限 40%
# 实际冷却 = 10 * (1 - 0.4) = 6 回合
```

---

### 6. 经济公式

#### 资源产出
```python
# 基础产出
def get_resource_output(base_output, building_level, output_multiplier):
    return base_output * building_level * output_multiplier

# 带时间因素的产出
def get_resource_output_over_time(output_per_second, seconds):
    return output_per_second * seconds

# 离线产出（通常有衰减）
def get_offline_output(output_per_second, offline_seconds, decay_start_seconds, decay_rate):
    if offline_seconds <= decay_start_seconds:
        # 衰减前，全额产出
        return output_per_second * offline_seconds
    else:
        # 衰减后，超出部分按比例减少
        normal_output = output_per_second * decay_start_seconds
        decayed_output = output_per_second * (offline_seconds - decay_start_seconds) * decay_rate
        return normal_output + decayed_output
```

---

#### 升级消耗
```python
# 线性增长
def get_upgrade_cost(base_cost, current_level, cost_per_level):
    return base_cost + current_level * cost_per_level

# 指数增长
def get_upgrade_cost_exponential(base_cost, current_level, growth_rate):
    return int(base_cost * (1.0 + growth_rate) ** current_level)

# 分段增长
def get_upgrade_cost_tiered(base_cost, current_level):
    if current_level <= 10:
        multiplier = 1.0
    elif current_level <= 20:
        multiplier = 1.5
    elif current_level <= 30:
        multiplier = 2.0
    else:
        multiplier = 3.0
    return int(base_cost * multiplier * current_level)
```

---

#### 建筑产出曲线
```python
# 等级越高，单级提升越小（常见于模拟经营）
def get_building_output(base_output, level):
    # 1-10 级：每级 +100%
    # 11-20 级：每级 +50%
    # 21-30 级：每级 +25%
    if level <= 10:
        return base_output * level
    elif level <= 20:
        return base_output * (10 + (level - 10) * 0.5)
    else:
        return base_output * (15 + (level - 20) * 0.25)
```

---

## 公式参数分离模式

为了让策划能够方便地调整参数，建议采用以下代码结构：

```python
# ==================== 配置区 ====================

# 伤害公式参数
DAMAGE_FORMULA_TYPE = "subtract"  # "subtract" 或 "ratio"
SUBTRACT_CONSTANT = 1.0           # 减法公式系数
RATIO_CONSTANT = 5000             # 比例公式常数 K

# 成长公式参数
GROWTH_TYPE = "exponential"       # "linear" 或 "exponential" 或 "tiered"
LINEAR_GROWTH_PER_LEVEL = 50      # 线性成长每级增长
EXPONENTIAL_GROWTH_RATE = 0.05    # 指数成长率 5%

# 概率参数
BASE_CRIT_RATE = 0.1              # 基础暴击率 10%
PITY_SYSTEM_ENABLED = True        # 是否启用保底
PITY_THRESHOLD = 10               # 保底触发次数

# BUFF 叠加规则
BUFF_STACK_RULE = "additive"      # "additive" 或 "multiplicative"
BUFF_MAX_STACKS = 10              # 最大叠加层数

# 冷却参数
BASE_COOLDOWN = 3                 # 基础冷却回合
COOLDOWN_REDUCTION_CAP = 0.4      # 冷却缩减上限 40%

# ==================== 逻辑区 ====================
# 逻辑区代码引用配置区的参数进行计算
```

---

## 最佳实践

### 1. 公式选择原则
- **简单优先：** 能用简单公式就不用复杂公式
- **可解释性：** 策划能够理解公式的含义
- **可调性：** 参数调整不会导致系统崩溃
- **可预测性：** 结果在合理范围内波动

### 2. 参数设计原则
- **命名清晰：** 使用有意义的变量名
- **注释完整：** 每个参数的含义和单位都要注明
- **默认合理：** 默认值应该是常用值或安全值
- **范围限制：** 对参数可能的取值范围做说明

### 3. 测试验证原则
- **边界测试：** 测试最大值、最小值、零值
- **极端测试：** 测试异常大的输入
- **一致性测试：** 相同输入应该得到相同输出（除随机外）
- **回归测试：** 修改公式后验证之前的结果是否还能复现
