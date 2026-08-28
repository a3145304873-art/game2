#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
从设计文档中提取实体和属性
使用方法：python extract_entities.py <input_file>
"""

import sys
import re
import json
from typing import List, Dict, Any

# 常见实体类型模式
ENTITY_PATTERNS = {
    "玩家": ["玩家", "角色", "英雄", "player", "character", "hero"],
    "敌人": ["敌人", "怪物", "BOSS", "enemy", "monster", "boss"],
    "技能": ["技能", "法术", "ability", "skill", "spell"],
    "BUFF": ["BUFF", "增益", "减益", "效果", "buff", "debuff", "effect"],
    "物品": ["物品", "道具", "装备", "item", "equipment", "artifact"],
    "资源": ["资源", "货币", "材料", "resource", "currency", "material"],
}

# 常见属性关键词
ATTRIBUTE_KEYWORDS = {
    "生命值": ["生命值", "HP", "血量", "life", "health"],
    "攻击力": ["攻击力", "攻击", "ATK", "damage", "attack"],
    "防御力": ["防御力", "防御", "DEF", "defense", "armor"],
    "速度": ["速度", "先手", "speed", "initiative"],
    "冷却": ["冷却", "CD", "cooldown", "cool time"],
    "伤害系数": ["伤害系数", "倍率", "multiplier", "damage ratio"],
    "层数": ["层数", "叠加", "stack", "stack count"],
    "持续时间": ["持续", "回合", "duration", "turns"],
    "概率": ["概率", "几率", "率", "probability", "chance", "rate"],
}


def extract_entities_from_text(text: str) -> List[Dict[str, Any]]:
    """
    从文本中提取实体和属性
    """
    entities = []

    # 按行分析
    lines = text.split('\n')

    current_entity = None
    current_attributes = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 检查是否是实体标题
        entity_match = None
        for entity_type, keywords in ENTITY_PATTERNS.items():
            for keyword in keywords:
                if keyword.lower() in line.lower():
                    # 尝试提取实体名
                    name_match = re.search(r'[:：]\s*(\S+)', line)
                    if name_match:
                        entity_name = name_match.group(1)
                    else:
                        entity_name = line.replace(keyword, '').strip()

                    if current_entity:
                        current_entity['attributes'] = current_attributes
                        entities.append(current_entity)

                    current_entity = {
                        'type': entity_type,
                        'name': entity_name or f"未命名_{entity_type}",
                        'source_line': line
                    }
                    current_attributes = []
                    break

        # 如果当前有实体，尝试提取属性
        if current_entity:
            for attr_type, keywords in ATTRIBUTE_KEYWORDS.items():
                for keyword in keywords:
                    if keyword.lower() in line.lower():
                        # 尝试提取数值
                        number_match = re.search(r'(\d+(?:\.\d+)?)', line)
                        value = number_match.group(1) if number_match else "未指定"

                        # 检查是否已有此属性
                        existing_attr = next((a for a in current_attributes if a['type'] == attr_type), None)
                        if not existing_attr:
                            current_attributes.append({
                                'type': attr_type,
                                'value': value,
                                'source': line
                            })
                        break

    # 添加最后一个实体
    if current_entity:
        current_entity['attributes'] = current_attributes
        entities.append(current_entity)

    return entities


def print_entities(entities: List[Dict[str, Any]]) -> None:
    """
    格式化输出实体列表
    """
    print("\n" + "=" * 60)
    print("提取的实体与属性")
    print("=" * 60)

    for i, entity in enumerate(entities, 1):
        print(f"\n### 实体 {i}: {entity['type']} - {entity['name']}")
        print(f"来源行：{entity['source_line']}")

        if entity['attributes']:
            print("\n| 属性类型 | 值 | 来源 |")
            print("|----------|-----|------|")
            for attr in entity['attributes']:
                print(f"| {attr['type']} | {attr['value']} | {attr['source'][:30]}... |")
        else:
            print("未提取到属性")

    print("\n" + "=" * 60)


def main():
    if len(sys.argv) < 2:
        print("使用方法：python extract_entities.py <input_file>")
        print("或：python extract_entities.py @<query_file>")
        sys.exit(1)

    input_arg = sys.argv[1]

    # 处理 @file 形式的输入
    if input_arg.startswith('@'):
        with open(input_arg[1:], 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        with open(input_arg, 'r', encoding='utf-8') as f:
            text = f.read()

    # 提取实体
    entities = extract_entities_from_text(text)

    # 输出结果
    print_entities(entities)

    # 输出 JSON 格式（供后续处理）
    print("\n\nJSON 格式输出:")
    print(json.dumps(entities, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
