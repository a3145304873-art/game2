# ============================================================
# 游戏数值模拟原型 - Web 界面版模板
# 技术栈：Streamlit (纯 Python 编写 Web 界面)
# 运行方式：streamlit run simulation_template_web.py
# ============================================================

import streamlit as st
import pandas as pd
import time
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import random

# ============================================================
# 页面配置
# ============================================================
st.set_page_config(
    page_title="游戏数值模拟器",
    page_icon="🎮",
    layout="wide"
)

# ============================================================
# 标题和说明
# ============================================================
st.title("🎮 游戏数值模拟器 - 战斗系统验证")
st.markdown("**用途：** 验证战斗数值公式、BUFF 叠加、技能冷却等机制")
st.divider()

# ============================================================
# 侧边栏：参数配置区
# ============================================================
st.sidebar.header("⚙️ 参数配置")

# --- 玩家基础属性 ---
st.sidebar.subheader("📊 玩家属性")
player_base_hp = st.sidebar.number_input(
    "基础生命值 (HP)",
    min_value=100,
    max_value=10000,
    value=1000,
    step=50,
    help="玩家的初始生命值"
)
player_base_attack = st.sidebar.number_input(
    "基础攻击力",
    min_value=10,
    max_value=1000,
    value=150,
    step=10
)
player_base_defense = st.sidebar.number_input(
    "基础防御力",
    min_value=0,
    max_value=500,
    value=80,
    step=5
)
player_crit_rate = st.sidebar.slider(
    "暴击率 (%)",
    min_value=0,
    max_value=100,
    value=10,
    step=1,
    help="触发暴击的概率百分比"
) / 100
player_crit_damage = st.sidebar.slider(
    "暴击伤害 (%)",
    min_value=150,
    max_value=300,
    value=200,
    step=10
) / 100

# --- 技能参数 ---
st.sidebar.subheader("⚔️ 技能参数")
skill_name = st.sidebar.text_input("技能名称", value="强力一击")
skill_damage_multiplier = st.sidebar.slider(
    "技能伤害系数",
    min_value=1.0,
    max_value=5.0,
    value=1.5,
    step=0.1,
    help="1.5 表示 150% 伤害"
)
skill_cooldown_turns = st.sidebar.number_input(
    "冷却回合数",
    min_value=1,
    max_value=10,
    value=3
)
skill_buff_stacks = st.sidebar.slider(
    "命中叠加 BUFF 层数",
    min_value=0,
    max_value=5,
    value=1
)

# --- BUFF 参数 ---
st.sidebar.subheader("🔄 BUFF 参数")
buff_max_stacks = st.sidebar.slider(
    "BUFF 最大叠加层数",
    min_value=1,
    max_value=20,
    value=10
)
buff_effect_per_stack = st.sidebar.slider(
    "每层 BUFF 效果 (%)",
    min_value=5,
    max_value=50,
    value=10,
    step=5
) / 100
buff_duration_turns = st.sidebar.number_input(
    "BUFF 持续回合数",
    min_value=1,
    max_value=10,
    value=5
)

# --- 边界参数 ---
st.sidebar.subheader("⚙️ 边界参数")
min_damage = st.sidebar.number_input(
    "最低伤害",
    min_value=0,
    max_value=100,
    value=0,
    help="伤害计算的最低值（破防保护）"
)
damage_formula_type = st.sidebar.selectbox(
    "伤害公式类型",
    options=["subtract", "ratio"],
    format_func=lambda x: "减法公式 (攻击 - 防御)" if x == "subtract" else "比例公式 (防御减伤)",
    help="减法：伤害=攻击 - 防御；比例：伤害=攻击× (1-防御/(防御 +K))"
)
defense_ratio_constant = st.sidebar.number_input(
    "比例公式常数 K",
    min_value=100,
    max_value=10000,
    value=5000,
    step=500,
    disabled=(damage_formula_type != "ratio")
)

# ============================================================
# 主界面：运行控制区
# ============================================================
st.header("🚀 模拟运行")
col1, col2, col3 = st.columns(3)

with col1:
    simulation_turns = st.number_input(
        "模拟回合数",
        min_value=1,
        max_value=100,
        value=10
    )

with col2:
    enemy_base_hp = st.number_input(
        "敌人基础 HP",
        min_value=100,
        max_value=100000,
        value=5000,
        step=100
    )

with col3:
    enemy_base_defense = st.number_input(
        "敌人防御力",
        min_value=0,
        max_value=1000,
        value=100,
        step=10
    )

# 运行按钮
run_button = st.button("▶️ 开始模拟", type="primary", use_container_width=True)

# ============================================================
# 模拟逻辑区
# ============================================================

@dataclass
class BuffEffect:
    """BUFF 效果类"""
    name: str
    stack_count: int = 0
    max_stacks: int = buff_max_stacks
    effect_per_stack: float = buff_effect_per_stack
    duration_turns: int = buff_duration_turns
    remaining_turns: int = buff_duration_turns

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
    """角色类"""
    name: str
    max_hp: int
    current_hp: int
    attack: int
    defense: int
    crit_rate: float = 0.1
    crit_damage: float = 2.0
    buff_list: List[BuffEffect] = field(default_factory=list)

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
            if buff.name == "攻击加成":
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


@dataclass
class Skill:
    """技能类"""
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


def calculate_damage(attacker: Character, defender: Character,
                     skill: Optional[Skill] = None) -> Dict:
    """伤害计算核心公式"""
    attack_multiplier = attacker.get_attack_multiplier()
    base_attack = attacker.attack * attack_multiplier

    if skill:
        base_attack *= skill.damage_multiplier

    if damage_formula_type == "subtract":
        raw_damage = base_attack - defender.defense
    elif damage_formula_type == "ratio":
        defense_ratio = 1.0 - (defender.defense / (defender.defense + defense_ratio_constant))
        raw_damage = base_attack * defense_ratio
    else:
        raw_damage = base_attack

    is_crit = random.random() < attacker.crit_rate
    if is_crit:
        raw_damage *= attacker.crit_damage

    final_damage = max(min_damage, int(raw_damage))

    return {
        "damage": final_damage,
        "is_crit": is_crit,
        "base_attack": base_attack,
        "raw_damage": raw_damage
    }


def simulate_turn(turn_number: int, player: Character, enemy: Character,
                  skill: Skill) -> Dict:
    """模拟单个回合"""
    stats = {
        "turn": turn_number,
        "damage_dealt": 0,
        "is_crit": False,
        "player_hp_before": player.current_hp,
        "enemy_hp_before": enemy.current_hp,
        "player_hp_after": 0,
        "enemy_hp_after": 0,
        "player_buff_stacks": 0,
        "skill_ready": skill.is_available(),
    }

    if skill.is_available():
        skill.use()
        damage_result = calculate_damage(player, enemy, skill)
        damage = damage_result["damage"]
        stats["damage_dealt"] = damage
        stats["is_crit"] = damage_result["is_crit"]

        is_dead = enemy.take_damage(damage)
        stats["enemy_hp_after"] = enemy.current_hp

        if skill.buff_stacks_on_hit > 0:
            buff = BuffEffect(name="攻击加成", stack_count=skill.buff_stacks_on_hit)
            player.add_buff(buff)

        stats["player_buff_stacks"] = sum(b.stack_count for b in player.buff_list)

        if is_dead:
            stats["enemy_dead"] = True
    else:
        damage_result = calculate_damage(player, enemy)
        stats["damage_dealt"] = damage_result["damage"]
        stats["is_crit"] = damage_result["is_crit"]
        enemy.take_damage(damage_result["damage"])
        stats["enemy_hp_after"] = enemy.current_hp

    player.tick_buffs()
    skill.tick_cooldown()

    stats["player_hp_after"] = player.current_hp
    stats["player_buff_stacks"] = sum(b.stack_count for b in player.buff_list)

    return stats


# ============================================================
# 运行模拟
# ============================================================
if run_button:
    # 显示进度条
    progress_bar = st.progress(0)
    status_text = st.empty()

    # 初始化实体
    player = Character(
        name="玩家",
        max_hp=player_base_hp,
        current_hp=player_base_hp,
        attack=player_base_attack,
        defense=player_base_defense,
        crit_rate=player_crit_rate,
        crit_damage=player_crit_damage
    )
    enemy = Character(
        name="敌人",
        max_hp=enemy_base_hp,
        current_hp=enemy_base_hp,
        attack=0,
        defense=enemy_base_defense
    )
    skill = Skill(
        name=skill_name,
        damage_multiplier=skill_damage_multiplier,
        max_cooldown=skill_cooldown_turns,
        buff_stacks_on_hit=skill_buff_stacks
    )

    all_stats = []

    # 运行模拟
    for turn in range(1, simulation_turns + 1):
        if not enemy.is_alive():
            break

        status_text.text(f"正在模拟回合 {turn}/{simulation_turns}...")
        turn_stats = simulate_turn(turn, player, enemy, skill)
        all_stats.append(turn_stats)

        progress_bar.progress(turn / simulation_turns)
        time.sleep(0.1)

    status_text.text("模拟完成！")
    progress_bar.progress(1.0)

    # ============================================================
    # 结果显示区
    # ============================================================
    st.divider()
    st.header("📊 模拟结果")

    # 关键指标
    if len(all_stats) > 0:
        total_damage = sum(s["damage_dealt"] for s in all_stats)
        crit_count = sum(1 for s in all_stats if s["is_crit"])
        final_buff_stacks = all_stats[-1]["player_buff_stacks"]
        enemy_defeated = any(s.get("enemy_dead", False) for s in all_stats)
        dpt = total_damage / len(all_stats)

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("总伤害输出", f"{total_damage:,}")
        col2.metric("平均伤害/回合", f"{dpt:.1f}")
        col3.metric("暴击次数", crit_count)
        col4.metric("最终 BUFF 层数", final_buff_stacks)

        st.success("✅ 敌人被击败！") if enemy_defeated else st.warning("⚠️ 敌人未被击败")

        # 详细数据表格
        st.subheader("📋 回合详情")
        df = pd.DataFrame(all_stats)
        st.dataframe(
            df[["turn", "damage_dealt", "is_crit", "enemy_hp_after", "player_buff_stacks"]]
            .rename(columns={
                "turn": "回合",
                "damage_dealt": "伤害",
                "is_crit": "暴击",
                "enemy_hp_after": "敌人 HP",
                "player_buff_stacks": "BUFF 层数"
            }),
            use_container_width=True,
            hide_index=True
        )

        # 可视化图表
        st.subheader("📈 可视化")

        col1, col2 = st.columns(2)

        with col1:
            st.caption("HP 变化曲线")
            hp_data = []
            for s in all_stats:
                hp_data.append({
                    "回合": s["turn"],
                    "敌人 HP": s["enemy_hp_after"]
                })
            st.line_chart(pd.DataFrame(hp_data).set_index("回合"))

        with col2:
            st.caption("伤害分布")
            st.bar_chart(df.set_index("turn")[["damage_dealt"]])

        # 导出功能
        st.subheader("💾 导出数据")
        csv = df.to_csv(index=False, encoding="utf-8-sig")
        st.download_button(
            label="📥 下载 CSV",
            data=csv,
            file_name=f"simulation_result_{time.strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )

# ============================================================
# 底部说明
# ============================================================
st.divider()
st.caption(
    "💡 **提示：** 修改左侧参数后点击"开始模拟"重新运行 | "
    "数据表格支持排序和筛选 | CSV 可用 Excel 打开分析"
)
