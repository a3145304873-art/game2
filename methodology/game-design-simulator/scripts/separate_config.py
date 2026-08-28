#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
自动分离配置参数和代码逻辑
使用方法：python separate_config.py <input_py_file> <output_py_file>
"""

import sys
import re
from typing import List, Tuple, Dict


# 应该提取到配置区的模式
CONFIG_PATTERNS = [
    # 数值常量
    (r'^(\w+)\s*=\s*(\d+(?:\.\d+)?)\s*$', 'numeric'),
    (r'^(\w+)\s*=\s*["\']([^"\']*)["\']\s*$', 'string'),
    (r'^(\w+)\s*=\s*(True|False)\s*$', 'boolean'),
]

# 不应该移动的类定义和方法
LOGIC_PATTERNS = [
    r'^class\s+\w+',
    r'^\s*def\s+\w+',
    r'^\s*if\s+',
    r'^\s*for\s+',
    r'^\s*while\s+',
    r'^\s*try\s*:',
    r'^\s*with\s+',
]

# 配置区注释模板
CONFIG_HEADER = """# ============================================================
# 配置区 (可修改)
# 说明：所有可调整的数值参数都应放在这里
# 修改后直接运行代码即可看到效果
# ============================================================

"""

# 逻辑区注释模板
LOGIC_HEADER = """
# ============================================================
# 逻辑区 (不建议修改)
# 说明：以下是核心逻辑代码，如无必要请勿修改
# ============================================================

"""


def extract_configurable_variables(code: str) -> List[Tuple[str, str, str]]:
    """
    提取可配置的变量
    返回：[(变量名，值，原行)]
    """
    variables = []
    lines = code.split('\n')

    for i, line in enumerate(lines):
        line = line.strip()

        # 跳过注释和空行
        if line.startswith('#') or not line:
            continue

        # 跳过类定义、函数定义等
        if any(re.match(pattern, line) for pattern in LOGIC_PATTERNS):
            continue

        # 尝试匹配配置模式
        for pattern, var_type in CONFIG_PATTERNS:
            match = re.match(pattern, line)
            if match:
                var_name = match.group(1)
                var_value = match.group(2) if len(match.groups()) == 1 else match.group(2)

                # 检查变量名是否像配置参数
                if var_name.isupper() or 'config' in var_name.lower() or 'param' in var_name.lower():
                    variables.append((var_name, var_value, line))
                break

    return variables


def separate_config(code: str) -> Tuple[str, str]:
    """
    分离配置区和逻辑区
    返回：(配置区代码，逻辑区代码)
    """
    lines = code.split('\n')

    config_lines = []
    logic_lines = []
    in_config_section = True

    for line in lines:
        stripped = line.strip()

        # 检查是否应该开始逻辑区
        if in_config_section:
            if any(re.match(pattern, stripped) for pattern in LOGIC_PATTERNS):
                in_config_section = False

        if in_config_section:
            # 如果是配置行
            is_config = False
            for pattern, _ in CONFIG_PATTERNS:
                if re.match(pattern, stripped):
                    is_config = True
                    break

            if is_config or stripped.startswith('#') or not stripped:
                config_lines.append(line)
            else:
                in_config_section = False
                logic_lines.append(line)
        else:
            logic_lines.append(line)

    return '\n'.join(config_lines), '\n'.join(logic_lines)


def reformat_code(code: str) -> str:
    """
    重新格式化代码，分离配置区和逻辑区
    """
    # 提取配置变量
    config_vars = extract_configurable_variables(code)

    # 分离原有代码
    existing_config, logic = separate_config(code)

    # 构建新的配置区
    config_section = CONFIG_HEADER

    if config_vars:
        # 按类型分组
        groups = {
            'numeric': [],
            'string': [],
            'boolean': []
        }

        for var_name, var_value, _ in config_vars:
            for pattern, var_type in CONFIG_PATTERNS:
                if re.match(pattern, f"{var_name} = {var_value}"):
                    groups[var_type].append((var_name, var_value))
                    break

        # 添加分组注释
        if groups['numeric']:
            config_section += "\n# --- 数值参数 ---\n"
            for var_name, var_value in groups['numeric']:
                config_section += f"{var_name} = {var_value}\n"

        if groups['string']:
            config_section += "\n# --- 字符串参数 ---\n"
            for var_name, var_value in groups['string']:
                config_section += f'{var_name} = "{var_value}"\n'

        if groups['boolean']:
            config_section += "\n# --- 布尔参数 ---\n"
            for var_name, var_value in groups['boolean']:
                config_section += f"{var_name} = {var_value}\n"
    else:
        config_section += existing_config

    # 构建完整代码
    new_code = config_section + LOGIC_HEADER + logic

    return new_code


def main():
    if len(sys.argv) < 3:
        print("使用方法：python separate_config.py <input_py_file> <output_py_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    # 读取输入文件
    with open(input_file, 'r', encoding='utf-8') as f:
        code = f.read()

    # 重新格式化
    new_code = reformat_code(code)

    # 写入输出文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_code)

    print(f"配置分离完成!")
    print(f"输出文件：{output_file}")

    # 统计信息
    config_lines = new_code.split(LOGIC_HEADER)[0].count('\n')
    logic_lines = new_code.split(LOGIC_HEADER)[1].count('\n') if LOGIC_HEADER in new_code else 0

    print(f"\n统计信息:")
    print(f"配置区行数：{config_lines}")
    print(f"逻辑区行数：{logic_lines}")


if __name__ == "__main__":
    main()
