#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件名: check-binary-optimization.py
版本号: 1.0.0
更新日期: 2025-11-27
功能描述: 检查文件的二进制内容，分析编码问题
"""

from pathlib import Path

def check_binary_content(file_path: Path):
    """
    检查文件的二进制内容
    :param file_path: 文件路径
    """
    print(f"检查文件: {file_path}")
    print("=" * 60)
    
    with open(file_path, 'rb') as f:
        raw_data = f.read(200)  # 只读取前200字节进行分析
    
    # 打印十六进制和ASCII表示
    hex_str = ' '.join(f'{b:02x}' for b in raw_data)
    ascii_str = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in raw_data)
    
    print("十六进制表示:")
    print(hex_str)
    print("\nASCII表示:")
    print(ascii_str)
    print("\n二进制数据长度:", len(raw_data))
    
    # 检查BOM
    if raw_data.startswith(b'\xef\xbb\xbf'):
        print("\n✅ 包含UTF-8 BOM")
    elif raw_data.startswith(b'\xff\xfe'):
        print("\n✅ 包含UTF-16 LE BOM")
    elif raw_data.startswith(b'\xfe\xff'):
        print("\n✅ 包含UTF-16 BE BOM")
    else:
        print("\n❌ 不包含BOM")
    
    print("=" * 60)

def main():
    """
    主函数
    """
    files_to_check = [
        Path(r"e:\Dropbox\GitHub\SutWxApp\docs\11-优化建议\01-优化建议与未来展望.md"),
        Path(r"e:\Dropbox\GitHub\SutWxApp\docs\11-优化建议\02-系统优化建议.md"),
        Path(r"e:\Dropbox\GitHub\SutWxApp\docs\11-优化建议\03-性能优化详解.md")
    ]
    
    for file_path in files_to_check:
        if file_path.exists():
            check_binary_content(file_path)
        else:
            print(f"文件不存在: {file_path}")

if __name__ == "__main__":
    main()
