# ============================================================
# 游戏数值模拟原型模板
# 生成日期：[DATE]
# 功能名称：[FUNCTION_NAME]
# ============================================================

# ==================== 配置区 (可修改) ====================
# 说明：所有可调整的数值参数都应放在这里
# 修改后直接运行代码即可看到效果

# --- 玩家基础属性 ---
PLAYER_BASE_HP = 1000           # 玩家基础生命值
PLAYER_BASE_ATTACK = 150        # 玩家基础攻击力
PLAYER_BASE_DEFENSE = 80        # 玩家基础防御力
PLAYER_BASE_SPEED = 100         # 玩家基础速度
PLAYER_BASE_CRIT_RATE = 0.1     # 玩家基础暴击率 (10%)
PLAYER_BASE_CRIT_DAMAGE = 2.0   # 玩家基础暴击伤害 (200%)

# --- 敌人基础属性 ---
ENEMY_BASE_HP = 5000            # 敌人基础生命值
ENEMY_BASE_ATTACK = 200         # 敌人基础攻击力
ENEMY_BASE_DEFENSE = 100        # 敌人基础防御力

# --- 技能参数 ---
SKILL_DAMAGE_MULTIPLIER = 1.5   # 技能伤害系数 (150%)
SKILL_COOLDOWN_TURNS = 3        # 技能冷却回合数
SKILL_MANA_COST = 50            # 技能法力消耗
SKILL_BUFF_STACKS = 1           # 技能命中后叠加 BUFF 层数

# --- BUFF 参数 ---
BUFF_MAX_STACKS = 10            # BUFF 最大叠加层数
BUFF_EFFECT_PER_STACK = 0.1     # 每层 BUFF 效果 (10% 加成)
BUFF_DURATION_TURNS = 5         # BUFF 持续回合数

# --- 战斗参数 ---
MIN_DAMAGE = 0                  # 最低伤害保护 (0=不破防也有 0 伤害)
MAX_DAMAGE_RATIO = 3.0          # 最大伤害倍率上限 (相对于攻击力)
CRIT_ENABLED = True             # 是否启用暴击机制

# --- 公式参数 ---
DAMAGE_FORMULA_TYPE = "subtract"  # 伤害公式类型："subtract"(减法) 或 "ratio"(比例)
DEFENSE_RATIO_CONSTANT = 5000   # 比例公式常数 K (用于防御减伤计算)

# --- 模拟参数 ---
SIMULATION_TURNS = 10           # 模拟总回合数
PRINT_DEBUG_INFO = True         # 是否打印调试信息

# ==================== 导入模块 ====================
import random
from dataclasses import dataclass, field
from typing import List, Dict, Optional

# ==================== 数据类定义 ====================

@dataclass
class BuffEffect:
    """BUFF 效果类"""
    name: str
    stack_count: int = 0
    max_stacks: int = BUFF_MAX_STACKS
    effect_per_stack: float = BUFF_EFFECT_PER_STACK
    duration_turns: int = BUFF_DURATION_TURNS
    remaining_turns: int = BUFF_DURATION_TURNS
    effect_type: str = "attack_multiplier"  # 效果类型

    def get_total_effect(self) -> float:
        """获取总效果值"""
        return self.effect_per_stack * min(self.stack_count, self.max_stacks)

    def tick(self) -> bool:
        """回合流逝，返回是否已到期"""
        self.remaining_turns -= 1
        return self.remaining_turns <= 0

    def add_stack(self, count: int = 1) -> None:
        """叠加层数"""
        self.stack_count = min(self.stack_count + count, self.max_stacks)
        self.remaining_turns = self.duration_turns  # 刷新持续时间


@dataclass
class Character:
    """角色基类"""
    name: str
    max_hp: int = PLAYER_BASE_HP
    current_hp: int = PLAYER_BASE_HP
    attack: int = PLAYER_BASE_ATTACK
    defense: int = PLAYER_BASE_DEFENSE
    speed: int = PLAYER_BASE_SPEED
    crit_rate: float = PLAYER_BASE_CRIT_RATE
    crit_damage: float = PLAYER_BASE_CRIT_DAMAGE
    buff_list: List[BuffEffect] = field(default_factory=list)

    def is_alive(self) -> bool:
        """是否存活"""
        return self.current_hp > 0

    def take_damage(self, damage: int) -> bool:
        """
        承受伤害
        返回：是否死亡
        """
        self.current_hp -= damage
        if self.current_hp <= 0:
            self.current_hp = 0
            return True  # 死亡
        return False

    def get_attack_multiplier(self) -> float:
        """获取攻击力加成系数（来自 BUFF）"""
        multiplier = 1.0
        for buff in self.buff_list:
            if buff.effect_type == "attack_multiplier":
                multiplier += buff.get_total_effect()
        return multiplier

    def add_buff(self, buff: BuffEffect) -> None:
        """添加或叠加 BUFF"""
        existing_buff = next((b for b in self.buff_list if b.name == buff.name), None)
        if existing_buff:
            existing_buff.add_stack(buff.stack_count)
        else:
            self.buff_list.append(buff)

    def tick_buffs(self) -> None:
        """更新所有 BUFF 的持续时间"""
        self.buff_list = [buff for buff in self.buff_list if not buff.tick()]

    def get_stats(self) -> Dict:
        """获取当前状态"""
        return {
            "name": self.name,
            "current_hp": self.current_hp,
            "max_hp": self.max_hp,
            "attack": self.attack,
            "defense": self.defense,
            "buff_count": len(self.buff_list),
            "total_attack_multiplier": self.get_attack_multiplier()
        }


@dataclass
class Skill:
    """技能类"""
    name: str = "基础技能"
    damage_multiplier: float = SKILL_DAMAGE_MULTIPLIER
    max_cooldown: int = SKILL_COOLDOWN_TURNS
    current_cooldown: int = 0
    mana_cost: int = SKILL_MANA_COST
    buff_stacks_on_hit: int = SKILL_BUFF_STACKS

    def is_available(self) -> bool:
        """技能是否可用"""
        return self.current_cooldown == 0

    def use(self) -> bool:
        """
        使用技能
        返回：是否成功使用
        """
        if self.is_available():
            self.current_cooldown = self.max_cooldown
            return True
        return False

    def tick_cooldown(self) -> None:
        """冷却更新"""
        if self.current_cooldown > 0:
            self.current_cooldown -= 1


# ==================== 核心公式 ====================

def calculate_damage(attacker: Character, defender: Character,
                     skill: Optional[Skill] = None) -> Dict:
    """
    伤害计算核心公式
    返回：包含伤害详细信息的字典
    """
    # 1. 计算基础攻击力（含 BUFF 加成）
    attack_multiplier = attacker.get_attack_multiplier()
    base_attack = attacker.attack * attack_multiplier

    # 2. 应用技能系数
    if skill:
        base_attack *= skill.damage_multiplier

    # 3. 根据公式类型计算伤害
    if DAMAGE_FORMULA_TYPE == "subtract":
        # 减法公式：伤害 = 攻击 - 防御
        raw_damage = base_attack - defender.defense
    elif DAMAGE_FORMULA_TYPE == "ratio":
        # 比例公式：伤害 = 攻击 × (1 - 防御/(防御 + K))
        defense_ratio = 1.0 - (defender.defense / (defender.defense + DEFENSE_RATIO_CONSTANT))
        raw_damage = base_attack * defense_ratio
    else:
        raw_damage = base_attack

    # 4. 暴击判定
    is_crit = False
    if CRIT_ENABLED and random.random() < attacker.crit_rate:
        raw_damage *= attacker.crit_damage
        is_crit = True

    # 5. 应用边界限制
    final_damage = max(MIN_DAMAGE, int(raw_damage))
    final_damage = min(final_damage, int(base_attack * MAX_DAMAGE_RATIO))

    return {
        "damage": final_damage,
        "is_crit": is_crit,
        "base_attack": base_attack,
        "raw_damage": raw_damage
    }


# ==================== 战斗逻辑 ====================

def simulate_turn(turn_number: int, player: Character, enemy: Character,
                  skill: Skill) -> Dict:
    """
    模拟单个回合
    返回：本回合统计数据
    """
    stats = {
        "turn": turn_number,
        "damage_dealt": 0,
        "is_crit": False,
        "player_hp_after": player.current_hp,
        "enemy_hp_after": enemy.current_hp,
        "player_buff_stacks": sum(b.stack_count for b in player.buff_list),
        "enemy_buff_stacks": sum(b.stack_count for b in enemy.buff_list),
    }

    if PRINT_DEBUG_INFO:
        print(f"\n{'='*50}")
        print(f"回合 {turn_number} 开始")
        print(f"{'='*50}")
        print(f"玩家 HP: {player.current_hp}/{player.max_hp}, BUFF 层数：{stats['player_buff_stacks']}")
        print(f"敌人 HP: {enemy.current_hp}/{enemy.max_hp}")

    # 1. 玩家行动阶段
    if skill.is_available():
        if PRINT_DEBUG_INFO:
            print(f"\n使用技能：{skill.name}")
        skill.use()

        # 2. 伤害计算
        damage_result = calculate_damage(player, enemy, skill)
        damage = damage_result["damage"]
        stats["damage_dealt"] = damage
        stats["is_crit"] = damage_result["is_crit"]

        if PRINT_DEBUG_INFO:
            crit_text = " [暴击!]" if stats["is_crit"] else ""
            print(f"造成伤害：{damage}{crit_text} (基础攻击：{damage_result['base_attack']:.1f})")

        # 3. 伤害应用
        is_dead = enemy.take_damage(damage)
        stats["enemy_hp_after"] = enemy.current_hp

        # 4. 叠加 BUFF
        if skill.buff_stacks_on_hit > 0:
            buff = BuffEffect(name="技能增益", stack_count=skill.buff_stacks_on_hit)
            player.add_buff(buff)
            if PRINT_DEBUG_INFO:
                print(f"叠加 BUFF，当前层数：{player.buff_list[0].stack_count}")

        if PRINT_DEBUG_INFO:
            print(f"敌人剩余 HP: {enemy.current_hp}")

        if is_dead:
            if PRINT_DEBUG_INFO:
                print("\n敌人已死亡!")
            stats["enemy_dead"] = True
            return stats

    else:
        if PRINT_DEBUG_INFO:
            print(f"\n技能冷却中 (剩余 {skill.current_cooldown} 回合)")
        # 普通攻击（无技能系数）
        damage_result = calculate_damage(player, enemy)
        damage = damage_result["damage"]
        enemy.take_damage(damage)
        stats["damage_dealt"] = damage
        stats["is_crit"] = damage_result["is_crit"]
        stats["enemy_hp_after"] = enemy.current_hp

    # 5. BUFF 更新
    player.tick_buffs()
    stats["player_buff_stacks"] = sum(b.stack_count for b in player.buff_list)

    # 6. 冷却更新
    skill.tick_cooldown()

    return stats


def run_simulation(total_turns: int = SIMULATION_TURNS) -> List[Dict]:
    """
    运行完整模拟
    返回：所有回合的统计数据列表
    """
    print("=" * 60)
    print("游戏数值模拟开始")
    print(f"模拟回合数：{total_turns}")
    print(f"伤害公式：{DAMAGE_FORMULA_TYPE}")
    print(f"玩家攻击力：{PLAYER_BASE_ATTACK}, 敌人防御力：{ENEMY_BASE_DEFENSE}")
    print("=" * 60)

    # 初始化实体
    player = Character(name="玩家")
    enemy = Character(name="敌人", max_hp=ENEMY_BASE_HP, current_hp=ENEMY_BASE_HP)
    skill = Skill(name="强力一击")

    all_stats = []

    for turn in range(1, total_turns + 1):
        # 检查敌人是否存活
        if not enemy.is_alive():
            break

        turn_stats = simulate_turn(turn, player, enemy, skill)
        all_stats.append(turn_stats)

    # 输出统计汇总
    print("\n" + "=" * 60)
    print("模拟结束 - 统计汇总")
    print("=" * 60)

    if len(all_stats) > 0:
        total_damage = sum(s["damage_dealt"] for s in all_stats)
        crit_count = sum(1 for s in all_stats if s["is_crit"])
        final_buff_stacks = all_stats[-1]["player_buff_stacks"] if all_stats else 0
        enemy_defeated = any(s.get("enemy_dead", False) for s in all_stats)

        print(f"实际回合数：{len(all_stats)}")
        print(f"总伤害输出：{total_damage}")
        print(f"暴击次数：{crit_count}")
        print(f"最终 BUFF 层数：{final_buff_stacks}")
        print(f"敌人是否被击败：{'是' if enemy_defeated else '否'}")

        # 计算 DPT (Damage Per Turn)
        dpt = total_damage / len(all_stats)
        print(f"平均伤害/回合：{dpt:.2f}")

    return all_stats


# ==================== 入口 ====================

if __name__ == "__main__":
    # 运行模拟
    results = run_simulation()

    # 可选：导出结果到 CSV
    # export_to_csv(results)
