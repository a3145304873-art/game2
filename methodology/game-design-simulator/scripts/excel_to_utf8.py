#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Excel 转 UTF-8 文本/JSON 工具
使用方法：python excel_to_utf8.py <input_excel> <output_text>

功能：
1. 将 Excel 文件 (.xlsx/.xls) 转换为 UTF-8 编码的文本文件
2. 同时生成 JSON 格式文件，方便后续处理
3. 输出内容预览，确认转换正确
"""

import sys
import json
from pathlib import Path


def convert_excel_to_text(excel_path: str, output_path: str):
    """将 Excel 文件转换为 UTF-8 编码的文本文件"""

    # 尝试导入必要的库
    try:
        import pandas as pd
    except ImportError:
        print("错误：需要安装 pandas 和 openpyxl")
        print("运行：pip install pandas openpyxl xlrd")
        sys.exit(1)

    # 检查文件是否存在
    excel_path = Path(excel_path)
    if not excel_path.exists():
        print(f"错误：文件不存在 - {excel_path}")
        sys.exit(1)

    # 根据扩展名选择读取方式
    print(f"正在读取文件：{excel_path}")

    try:
        if excel_path.suffix in ['.xlsx', '.xlsm']:
            df_dict = pd.read_excel(excel_path, sheet_name=None)
        elif excel_path.suffix == '.xls':
            df_dict = pd.read_excel(excel_path, sheet_name=None, engine='xlrd')
        else:
            print(f"错误：不支持的 Excel 格式 - {excel_path.suffix}")
            print("支持的格式：.xlsx, .xlsm, .xls")
            sys.exit(1)
    except Exception as e:
        print(f"读取 Excel 失败：{e}")
        print("尝试使用备用方式读取...")

        # 备用方式：尝试直接读取为 CSV
        try:
            with open(excel_path, 'r', encoding='utf-8') as f:
                content = f.read()
            # 保存为文本
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ 已作为文本文件保存：{output_path}")
            return str(output_path), None
        except Exception as e2:
            print(f"备用方式也失败：{e2}")
            sys.exit(1)

    # 转换为文本内容
    text_content = []
    json_content = {}
    total_rows = 0
    total_cols = 0

    for sheet_name, df in df_dict.items():
        rows, cols = df.shape
        total_rows += rows
        total_cols += cols

        text_content.append(f"{'='*60}\n")
        text_content.append(f"工作表：{sheet_name} ({rows}行 × {cols}列)\n")
        text_content.append(f"{'='*60}\n\n")

        # 转换为表格文本（使用 | 分隔）
        text_content.append(df.to_csv(sep='|', index=False))
        text_content.append("\n\n")

        # 转换为 JSON
        json_content[sheet_name] = {
            'columns': df.columns.tolist(),
            'data': df.to_dict(orient='records')
        }

    # 输出文件
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # 保存为 UTF-8 文本
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(text_content)

    # 同时保存 JSON 版本
    json_path = output_path.with_suffix('.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(json_content, f, ensure_ascii=False, indent=2)

    # 输出统计信息
    print(f"\n{'='*60}")
    print("✓ 转换完成!")
    print(f"{'='*60}")
    print(f"  原始文件：{excel_path}")
    print(f"  文本文件：{output_path}")
    print(f"  JSON 文件：{json_path}")
    print(f"  工作表数量：{len(df_dict)}")
    print(f"  总行数：{total_rows}")
    print(f"  总列数：{total_cols}")

    # 输出预览（前 1500 字）
    print(f"\n{'='*60}")
    print("内容预览（前 1500 字）：")
    print(f"{'='*60}")
    preview = ''.join(text_content)[:1500]
    print(preview)
    if len(''.join(text_content)) > 1500:
        print("\n... (内容过长，仅显示部分，完整内容请查看输出文件)")

    return str(output_path), str(json_path)


def main():
    if len(sys.argv) < 3:
        print("="*60)
        print("Excel 转 UTF-8 工具")
        print("="*60)
        print("\n使用方法：python excel_to_utf8.py <input_excel> <output_text>")
        print("\n示例:")
        print('  python excel_to_utf8.py "设计文档.xlsx" "output/设计文档_utf8.txt"')
        print('  python excel_to_utf8.py "C:/path/to/file.xlsx" "C:/path/to/output.txt"')
        print("\n输出:")
        print("  - 文本文件：UTF-8 编码的表格文本")
        print("  - JSON 文件：结构化的 JSON 数据")
        sys.exit(0)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    try:
        text_path, json_path = convert_excel_to_text(input_file, output_file)
        print(f"\n{'='*60}")
        print("下一步操作:")
        print(f"{'='*60}")
        print(f"1. 查看文本文件：{text_path}")
        if json_path:
            print(f"2. 查看 JSON 文件：{json_path}")
        print(f"3. 使用转换后的文件继续进行需求分析")
    except Exception as e:
        print(f"转换失败：{e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
