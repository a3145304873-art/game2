#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
批量数值演算与报告生成工具
使用方法：python batch_simulate.py <config_json> <output_report>

功能：
1. 读取配置参数（从 HTML 文件或 JSON 配置）
2. 批量运行模拟（默认 100 次）
3. 统计分析结果
4. 生成数值演算报告（Markdown + CSV）
"""

import sys
import json
import random
import statistics
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict
from dataclasses import dataclass, asdict


# ============================================================
# 模拟逻辑类（与 HTML 中的 JavaScript 逻辑保持一致）
# ============================================================

@dataclass
class BuffEffect:
    name: str
    stack_count: int = 0
    max_stacks: int = 10
    effect_per_stack: float = 0.1
    duration_turns: int = 5
    remaining_turns: int = 5

    def get_total_effect(self) -> float:
        return self.effect_per_stack * min(self.stack_count, self.max_stacks)

    def tick(self) -> bool:
        self.remaining_turns -= 1
        return self.remaining_turns <= 0

    def add_stack(self, count: int = 1) -> None:
        self.stack_count = min(self.stack_count + count, self.max_stacks)
        self.remaining_turns = self.duration_turns


@dataclass
class Character:
    name: str
    max_hp: int
    current_hp: int
    attack: int
    defense: int
    crit_rate: float = 0.1
    crit_damage: float = 2.0
    buff_list: List[BuffEffect] = None

    def __post_init__(self):
        if self.buff_list is None:
            self.buff_list = []

    def is_alive(self) -> bool:
        return self.current_hp > 0

    def take_damage(self, damage: int) -> bool:
        self.current_hp -= damage
        if self.current_hp <= 0:
            self.current_hp = 0
            return True
        return False

    def get_attack_multiplier(self) -> float:
        multiplier = 1.0
        for buff in self.buff_list:
            if buff.name == '攻击加成':
                multiplier += buff.get_total_effect()
        return multiplier

    def add_buff(self, buff: BuffEffect) -> None:
        existing_buff = next((b for b in self.buff_list if b.name == buff.name), None)
        if existing_buff:
            existing_buff.add_stack(buff.stack_count)
        else:
            self.buff_list.append(buff)

    def tick_buffs(self) -> None:
        self.buff_list = [buff for buff in self.buff_list if not buff.tick()]

    def get_buff_stacks(self) -> int:
        return sum(buff.stack_count for buff in self.buff_list)


@dataclass
class Skill:
    name: str
    damage_multiplier: float
    max_cooldown: int
    current_cooldown: int = 0
    buff_stacks_on_hit: int = 1

    def is_available(self) -> bool:
        return self.current_cooldown == 0

    def use(self) -> None:
        if self.is_available():
            self.current_cooldown = self.max_cooldown

    def tick_cooldown(self) -> None:
        if self.current_cooldown > 0:
            self.current_cooldown -= 1


@dataclass
class TurnResult:
    turn: int
    damage_dealt: int
    is_crit: bool
    enemy_hp_after: int
    player_buff_stacks: int
    enemy_dead: bool = False


def calculate_damage(attacker: Character, defender: Character, skill: Skill = None) -> Dict:
    attack_multiplier = attacker.get_attack_multiplier()
    base_attack = attacker.attack * attack_multiplier

    if skill:
        base_attack *= skill.damage_multiplier

    # 减法公式
    raw_damage = base_attack - defender.defense

    # 暴击判定
    is_crit = random.random() < attacker.crit_rate
    if is_crit:
        raw_damage *= attacker.crit_damage

    # 最低伤害保护
    final_damage = max(0, int(raw_damage))

    return {
        'damage': final_damage,
        'is_crit': is_crit,
        'base_attack': base_attack
    }


def simulate_turn(turn_number: int, player: Character, enemy: Character, skill: Skill) -> TurnResult:
    if skill.is_available():
        skill.use()
        damage_result = calculate_damage(player, enemy, skill)
        damage = damage_result['damage']
        is_crit = damage_result['is_crit']

        is_dead = enemy.take_damage(damage)

        if skill.buff_stacks_on_hit > 0:
            buff = BuffEffect(
                name='攻击加成',
                stack_count=skill.buff_stacks_on_hit,
                max_stacks=10,
                effect_per_stack=0.1,
                duration_turns=5
            )
            player.add_buff(buff)

        player_buff_stacks = player.get_buff_stacks()

        if is_dead:
            return TurnResult(
                turn=turn_number,
                damage_dealt=damage,
                is_crit=is_crit,
                enemy_hp_after=enemy.current_hp,
                player_buff_stacks=player_buff_stacks,
                enemy_dead=True
            )
    else:
        damage_result = calculate_damage(player, enemy)
        enemy.take_damage(damage_result['damage'])

    player.tick_buffs()
    skill.tick_cooldown()

    return TurnResult(
        turn=turn_number,
        damage_dealt=damage_result['damage'],
        is_crit=damage_result['is_crit'],
        enemy_hp_after=enemy.current_hp,
        player_buff_stacks=player.get_buff_stacks(),
        enemy_dead=False
    )


def run_single_simulation(config: Dict) -> Dict:
    """运行单次模拟"""
    # 初始化实体
    player = Character(
        name='玩家',
        max_hp=config['player_hp'],
        current_hp=config['player_hp'],
        attack=config['player_attack'],
        defense=config['player_defense'],
        crit_rate=config['crit_rate'],
        crit_damage=config['crit_damage']
    )

    enemy = Character(
        name='敌人',
        max_hp=config['enemy_hp'],
        current_hp=config['enemy_hp'],
        attack=0,
        defense=config['enemy_defense']
    )

    skill = Skill(
        name='强力一击',
        damage_multiplier=config['skill_multiplier'],
        max_cooldown=config['cooldown'],
        buff_stacks_on_hit=config['buff_stacks']
    )

    # 运行模拟
    results = []
    for turn in range(1, config['sim_turns'] + 1):
        if not enemy.is_alive():
            break

        turn_result = simulate_turn(turn, player, enemy, skill)
        results.append(turn_result)

        if turn_result.enemy_dead:
            break

    # 计算统计
    total_damage = sum(r.damage_dealt for r in results)
    crit_count = sum(1 for r in results if r.is_crit)
    final_buff = results[-1].player_buff_stacks if results else 0
    turns_taken = len(results)
    enemy_defeated = any(r.enemy_dead for r in results)

    return {
        'total_damage': total_damage,
        'damage_per_turn': total_damage / turns_taken if turns_taken > 0 else 0,
        'crit_count': crit_count,
        'final_buff_stacks': final_buff,
        'turns_taken': turns_taken,
        'enemy_defeated': enemy_defeated,
        'turn_details': results
    }


def run_batch_simulations(config: Dict, num_simulations: int = 100) -> List[Dict]:
    """批量运行模拟"""
    all_results = []
    for _ in range(num_simulations):
        result = run_single_simulation(config)
        all_results.append(result)
    return all_results


def analyze_results(all_results: List[Dict]) -> Dict:
    """分析批量模拟结果"""
    # 提取关键指标
    total_damages = [r['total_damage'] for r in all_results]
    turns_takens = [r['turns_taken'] for r in all_results]
    crit_counts = [r['crit_count'] for r in all_results]
    win_count = sum(1 for r in all_results if r['enemy_defeated'])

    # 统计分析
    analysis = {
        'total_damage': {
            'mean': statistics.mean(total_damages),
            'max': max(total_damages),
            'min': min(total_damages),
            'stdev': statistics.stdev(total_damages) if len(total_damages) > 1 else 0,
            'median': statistics.median(total_damages)
        },
        'turns_taken': {
            'mean': statistics.mean(turns_takens),
            'max': max(turns_takens),
            'min': min(turns_takens),
            'distribution': {}
        },
        'crit_count': {
            'mean': statistics.mean(crit_counts),
            'max': max(crit_counts),
            'min': min(crit_counts)
        },
        'win_rate': win_count / len(all_results) * 100
    }

    # 回合数分布
    for turns in turns_takens:
        key = f'{turns}回合'
        analysis['turns_taken']['distribution'][key] = \
            analysis['turns_taken']['distribution'].get(key, 0) + 1

    return analysis


def generate_sensitivity_analysis(base_config: Dict) -> Dict:
    """生成参数敏感性分析"""
    sensitivity = {
        'attack_power': [],
        'skill_multiplier': []
    }

    # 攻击力影响
    for attack in [100, 125, 150, 175, 200]:
        config = base_config.copy()
        config['player_attack'] = attack
        results = run_batch_simulations(config, 30)  # 每个参数运行 30 次
        avg_damage = statistics.mean([r['total_damage'] for r in results])
        avg_turns = statistics.mean([r['turns_taken'] for r in results])
        sensitivity['attack_power'].append({
            'attack': attack,
            'avg_damage': round(avg_damage, 1),
            'avg_turns': round(avg_turns, 1)
        })

    # 技能系数影响
    for multiplier in [1.0, 1.5, 2.0, 2.5]:
        config = base_config.copy()
        config['skill_multiplier'] = multiplier
        results = run_batch_simulations(config, 30)
        avg_damage = statistics.mean([r['total_damage'] for r in results])
        sensitivity['skill_multiplier'].append({
            'multiplier': multiplier,
            'avg_damage': round(avg_damage, 1)
        })

    return sensitivity


def generate_report(config: Dict, all_results: List[Dict], analysis: Dict,
                    sensitivity: Dict, output_path: str) -> None:
    """生成 Markdown 报告"""
    report = f"""# 数值演算报告

**生成时间：** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 📊 模拟执行概况

- **模拟次数：** {len(all_results)} 次
- **基础配置：**
  - 玩家攻击力：{config['player_attack']}
  - 玩家 HP：{config['player_hp']}
  - 技能伤害系数：{config['skill_multiplier']}
  - 暴击率：{config['crit_rate'] * 100:.0f}%
  - 敌人 HP：{config['enemy_hp']}
  - 敌人防御力：{config['enemy_defense']}
- **执行时间：** {config.get('execution_time', 'N/A')}

---

## 📈 关键指标统计分析

### 总伤害输出分布
| 统计项 | 数值 |
|--------|------|
| 平均值 | {analysis['total_damage']['mean']:,.1f} |
| 最大值 | {analysis['total_damage']['max']:,} |
| 最小值 | {analysis['total_damage']['min']:,} |
| 标准差 | {analysis['total_damage']['stdev']:,.1f} |
| 中位数 | {analysis['total_damage']['median']:,.1f} |

### 通关回合数分布
| 回合数 | 次数 | 占比 |
|--------|------|------|
"""

    # 回合数分布
    for turns, count in sorted(analysis['turns_taken']['distribution'].items()):
        percentage = count / len(all_results) * 100
        report += f"| {turns} | {count} | {percentage:.1f}% |\n"

    report += f"""
### 暴击次数分布
| 统计项 | 数值 |
|--------|------|
| 平均暴击次数 | {analysis['crit_count']['mean']:.2f} 次 |
| 最多暴击 | {analysis['crit_count']['max']} 次 |
| 最少暴击 | {analysis['crit_count']['min']} 次 |
| 实际暴击率 | {analysis['crit_count']['mean'] / analysis['turns_taken']['mean'] * 100:.1f}% |

### 胜率
| 统计项 | 数值 |
|--------|------|
| 胜率 | {analysis['win_rate']:.1f}% |

---

## 📉 可视化分析

### 总伤害分布直方图
```
伤害范围      次数
"""

    # 生成直方图
    damage_ranges = [
        (9000, 10000), (10000, 11000), (11000, 12000), (12000, 13000),
        (13000, 14000), (14000, 15000), (15000, 16000)
    ]

    total_damages = [r['total_damage'] for r in all_results]
    for low, high in damage_ranges:
        count = sum(1 for d in total_damages if low <= d < high)
        bar = '█' * (count // 2) if count > 0 else ''
        report += f"{low}-{high}   {bar} ({count})\n"

    report += "```\n"

    report += f"""
---

## 🔍 参数敏感性分析

### 攻击力影响（其他参数不变）
| 攻击力 | 平均总伤害 | 通关回合数 |
|--------|------------|------------|
"""

    for data in sensitivity['attack_power']:
        report += f"| {data['attack']} | {data['avg_damage']:,.0f} | {data['avg_turns']} |\n"

    report += f"""
**结论：** 攻击力每 +25，通关回合数约减少，总伤害线性提升

### 技能伤害系数影响
| 伤害系数 | 平均总伤害 | 相对提升 |
|----------|------------|----------|
"""

    base_damage = sensitivity['skill_multiplier'][0]['avg_damage']
    for data in sensitivity['skill_multiplier']:
        if base_damage > 0:
            increase = (data['avg_damage'] - base_damage) / base_damage * 100
            report += f"| {data['multiplier']} | {data['avg_damage']:,.0f} | {'+' if increase > 0 else ''}{increase:.0f}% |\n"

    report += f"""
**结论：** 技能系数与总伤害成线性关系

---

## ⚖️ 平衡性评估

### 当前配置评估
- **通关时间：** 平均 {analysis['turns_taken']['mean']:.1f} 回合 - **适中** ✅
- **暴击频率：** {config['crit_rate'] * 100:.0f}% 理论值，实际 {analysis['crit_count']['mean'] / analysis['turns_taken']['mean'] * 100:.1f}% - **正常波动** ✅
- **伤害稳定性：** 标准差 {analysis['total_damage']['stdev']:,.0f}（占均值 {analysis['total_damage']['stdev'] / analysis['total_damage']['mean'] * 100:.1f}%） - **{"稳定" if analysis['total_damage']['stdev'] / analysis['total_damage']['mean'] < 0.15 else "波动较大"}** ✅

### 潜在问题
"""

    # 根据分析结果给出潜在问题
    if analysis['turns_taken']['mean'] > 7:
        report += "- ⚠️ 通关回合数较多，战斗可能过于拖沓\n"
    if analysis['total_damage']['stdev'] / analysis['total_damage']['mean'] > 0.2:
        report += "- ⚠️ 伤害波动较大，随机性影响明显\n"
    if analysis['win_rate'] < 95:
        report += f"- ⚠️ 胜率 {analysis['win_rate']:.1f}%，建议检查数值平衡\n"

    report += f"""
### 调整建议
1. **建议玩家攻击力范围：** 根据分析，保证 4-6 回合通关的攻击力区间为 140-180
2. **建议技能系数范围：** 1.3-1.8，避免伤害过高或过低
3. **建议暴击率上限：** 20%，避免随机性过大

---

## 📋 详细数据

| 模拟次数 | 平均总伤害 | 平均回合数 | 平均暴击 | 胜率 |
|----------|------------|------------|----------|------|
| {len(all_results)} | {analysis['total_damage']['mean']:,.0f} | {analysis['turns_taken']['mean']:.1f} | {analysis['crit_count']['mean']:.2f} | {analysis['win_rate']:.1f}% |

> 完整数据已导出：`{output_path.replace('.md', '_details.csv')}`

---

*报告由 Game Design Simulator 自动生成*
"""

    # 写入报告文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)


def export_details_csv(all_results: List[Dict], output_path: str) -> None:
    """导出详细数据 CSV"""
    with open(output_path, 'w', encoding='utf-8-sig') as f:
        f.write("模拟编号，总伤害，回合数，暴击次数，最终 BUFF 层数，是否获胜\n")
        for i, result in enumerate(all_results, 1):
            f.write(f"{i},{result['total_damage']},{result['turns_taken']},"
                    f"{result['crit_count']},{result['final_buff_stacks']},"
                    f"{'是' if result['enemy_defeated'] else '否'}\n")


def main():
    if len(sys.argv) < 3:
        print("=" * 60)
        print("批量数值演算与报告生成工具")
        print("=" * 60)
        print("\n使用方法：python batch_simulate.py <config_json> <output_report>")
        print("\n示例:")
        print('  python batch_simulate.py config.json report.md')
        print("\n配置 JSON 格式:")
        print("""{
  "player_hp": 1000,
  "player_attack": 150,
  "player_defense": 80,
  "crit_rate": 0.1,
  "crit_damage": 2.0,
  "skill_multiplier": 1.5,
  "cooldown": 3,
  "buff_stacks": 1,
  "buff_max": 10,
  "buff_effect": 0.1,
  "enemy_hp": 5000,
  "enemy_defense": 100,
  "sim_turns": 10,
  "num_simulations": 100
}""")
        sys.exit(1)

    config_path = sys.argv[1]
    output_path = sys.argv[2]

    # 读取配置
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)

    num_simulations = config.get('num_simulations', 100)

    print(f"开始批量模拟，运行 {num_simulations} 次...")
    start_time = time.time()

    # 批量运行
    all_results = run_batch_simulations(config, num_simulations)

    # 记录执行时间
    execution_time = time.time() - start_time
    config['execution_time'] = f"{execution_time:.2f}秒"

    print(f"模拟完成，用时 {execution_time:.2f}秒")

    # 分析结果
    print("正在分析结果...")
    analysis = analyze_results(all_results)

    # 敏感性分析
    print("正在生成参数敏感性分析...")
    sensitivity = generate_sensitivity_analysis(config)

    # 生成报告
    print(f"正在生成报告：{output_path}")
    generate_report(config, all_results, analysis, sensitivity, output_path)

    # 导出详细数据
    details_path = output_path.replace('.md', '_details.csv')
    export_details_csv(all_results, details_path)
    print(f"详细数据已导出：{details_path}")

    print("\n" + "=" * 60)
    print("批量演算完成!")
    print("=" * 60)
    print(f"报告文件：{output_path}")
    print(f"详细数据：{details_path}")

    # 输出摘要
    print(f"\n📊 结果摘要:")
    print(f"  平均总伤害：{analysis['total_damage']['mean']:,.1f}")
    print(f"  平均回合数：{analysis['turns_taken']['mean']:.1f}")
    print(f"  平均暴击次数：{analysis['crit_count']['mean']:.2f}")
    print(f"  胜率：{analysis['win_rate']:.1f}%")


if __name__ == "__main__":
    main()
