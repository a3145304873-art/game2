#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
根据模糊点生成澄清问题
使用方法：python generate_questions.py <input_text>
"""

import sys
import re
from typing import List, Dict, Tuple

# 模糊词汇列表
VAGUE_TERMS = [
    # 程度副词
    ("大幅", "提升幅度具体是多少？建议：50%/100%/150%"),
    ("大量", "具体数量是多少？建议：定义具体数值或公式"),
    ("少量", "具体数量是多少？建议：定义具体数值或公式"),
    ("适度", "适度的具体范围是？建议：10%-30%"),
    ("显著", "显著的具体数值是？建议：定义百分比或倍率"),
    ("轻微", "轻微的具体数值是？建议：1%-5%"),

    # 时间描述
    ("短时间内", "\"短时间内\"具体指多少回合/秒？建议：1/2/3 回合"),
    ("长时间", "\"长时间\"具体指多少回合/秒？建议：5/10/15 回合"),
    ("持续一段时间", "持续时间具体是多久？建议：定义具体回合数"),
    ("几回合", "\"几回合\"具体是几回合？建议：定义固定值或范围"),
    ("立即", "\"立即\"是指当前时点还是下回合？建议：明确结算时点"),

    # 条件描述
    ("一定概率", "\"一定概率\"具体是多少？建议：10%/20%/30%"),
    ("大概率", "\"大概率\"具体是多大？建议：50%/70%/90%"),
    ("小概率", "\"小概率\"具体是多小？建议：5%/10%/20%"),
    ("可能", "\"可能\"的触发概率是？建议：定义具体百分比"),
    ("有时", "\"有时\"的触发条件是？建议：定义明确条件"),

    # 范围描述
    ("附近", "\"附近\"的范围是？建议：定义半径或目标数量"),
    ("多个", "\"多个\"具体是几个？建议：2/3/5 个或定义范围"),
    ("若干", "\"若干\"的具体数量是？建议：定义固定值或公式"),
    ("一些", "\"一些\"的具体数量/程度是？建议：定义具体数值"),

    # 比较描述
    ("更高", "\"更高\"的具体数值是？建议：定义固定值或公式"),
    ("更低", "\"更低\"的具体数值是？建议：定义固定值或公式"),
    ("更强", "\"更强\"的具体效果是？建议：定义倍率或数值"),
    ("更弱", "\"更弱\"的具体效果是？建议：定义倍率或数值"),
]

# 边界情况检查点
EDGE_CASE_CHECKS = [
    # 数值边界
    ("hp", "HP 减为负数时如何处理？建议：设为 0 并触发死亡逻辑"),
    ("mp", "MP 不足时技能如何处理？建议：技能无法释放"),
    ("伤害", "伤害计算结果为负数时如何处理？建议：设为 0（最低伤害保护）"),
    ("防御", "防御力超过攻击力时如何处理？建议：最低伤害为 0 或 1"),
    ("层数", "是否有最大层数限制？建议：定义上限（如 10 层）"),
    ("上限", "该属性是否有上限？建议：定义上限值或说明无上限"),

    # 状态边界
    ("buff", "多个同类型 BUFF 如何叠加？建议：同类加法、异类乘法"),
    ("效果", "效果持续时间的结算时点是？建议：回合开始时结算"),
    ("冷却", "冷却时间从何时开始计算？建议：释放瞬间开始冷却"),
    ("触发", "触发条件的判定时点是？建议：事件发生时立即判定"),

    # 目标边界
    ("目标", "目标数量为 0 时如何处理？建议：技能无法释放或部分生效"),
    ("死亡", "目标在技能释放过程中死亡如何处理？建议：技能失效，消耗照扣"),
    ("选择", "多个目标满足条件时优先级如何？建议：定义优先级规则"),
]


def find_vague_terms(text: str) -> List[Tuple[str, str, str]]:
    """
    查找文本中的模糊词汇
    返回：[(模糊词，所在句子，建议)]
    """
    results = []
    sentences = re.split(r'[,.!?.!?]', text)

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        for vague_term, suggestion in VAGUE_TERMS:
            if vague_term in sentence:
                results.append((vague_term, sentence, suggestion))

    return results


def check_edge_cases(text: str) -> List[Tuple[str, str, str]]:
    """
    检查是否涉及边界情况但未明确说明
    返回：[(关键词，问题，建议)]
    """
    results = []
    text_lower = text.lower()

    for keyword, question in EDGE_CASE_CHECKS:
        if keyword.lower() in text_lower:
            # 检查是否有明确的数值或规则
            has_specific = bool(re.search(r'\d+', text))
            has_formula = bool(re.search(r'[=+×÷/\-]', text))

            if not has_specific and not has_formula:
                results.append((keyword, question, "需要策划明确"))

    return results


def generate_clarification_questions(text: str) -> List[Dict]:
    """
    生成需要澄清的问题列表
    """
    questions = []

    # 1. 查找模糊词汇
    vague_results = find_vague_terms(text)
    for term, sentence, suggestion in vague_results:
        questions.append({
            "category": "数值定义",
            "term": term,
            "sentence": sentence,
            "question": f"文档中提到\"{term}\"（{sentence}），具体数值是多少？",
            "suggestion": suggestion
        })

    # 2. 检查边界情况
    edge_results = check_edge_cases(text)
    for keyword, question, _ in edge_results:
        questions.append({
            "category": "边界情况",
            "keyword": keyword,
            "question": question,
            "suggestion": "需要策划明确具体处理规则"
        })

    return questions


def print_questions(questions: List[Dict]) -> None:
    """
    格式化输出问题列表
    """
    print("\n" + "=" * 60)
    print("需要澄清的问题列表")
    print("=" * 60)

    # 按类别分组
    categories = {}
    for q in questions:
        cat = q["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(q)

    for cat, cat_questions in categories.items():
        print(f"\n## {cat}类问题\n")
        for i, q in enumerate(cat_questions, 1):
            print(f"**{i}. {q['question']}**")
            if 'suggestion' in q and q['suggestion']:
                print(f"   - 建议：{q['suggestion']}")
            print()

    if not questions:
        print("\n未发现明显的模糊词汇或未明确的边界情况。")
        print("但这不代表文档完全清晰，建议人工复核以下方面：")
        print("- 所有数值是否都有具体定义？")
        print("- 所有触发条件是否都有明确时点？")
        print("- 所有边界情况是否都有处理规则？")

    print("\n" + "=" * 60)


def main():
    if len(sys.argv) < 2:
        print("使用方法：python generate_questions.py <input_file>")
        print("或：python generate_questions.py @<query_file>")
        sys.exit(1)

    input_arg = sys.argv[1]

    # 处理 @file 形式的输入
    if input_arg.startswith('@'):
        with open(input_arg[1:], 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        with open(input_arg, 'r', encoding='utf-8') as f:
            text = f.read()

    # 生成问题
    questions = generate_clarification_questions(text)

    # 输出结果
    print_questions(questions)

    # 输出 JSON 格式（供后续处理）
    print("\n\nJSON 格式输出:")
    import json
    print(json.dumps(questions, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
