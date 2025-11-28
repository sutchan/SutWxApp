#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件名: check-file-content.py
版本号: 1.0.0
更新日期: 2025-11-27
功能: 检查文件内容，帮助诊断编码问题
"""

import os

def check_file_content(file_path):
    """
    检查文件内容
    :param file_path: 文件路径
    :return: None
    """
    print(f"=== 检查文件: {file_path} ===")
    
    # 尝试以二进制模式读取文件
    try:
        with open(file_path, 'rb') as f:
            binary_content = f.read()
        
        print("\n前200字节的十六进制表示:")
        for i in range(0, min(200, len(binary_content)), 16):
            chunk = binary_content[i:i+16]
            hex_str = ' '.join(f'{b:02x}' for b in chunk)
            ascii_str = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk)
            print(f'{i:04x}: {hex_str:<48}  {ascii_str}')
    except Exception as e:
        print(f"读取文件失败: {e}")
        return
    
    # 尝试以不同编码读取文件内容
    encodings_to_try = ['utf-8', 'gbk', 'gb2312', 'latin-1']
    
    for encoding in encodings_to_try:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                content = f.read()
            
            print(f"\n=== 使用 {encoding} 编码读取的内容预览 ===")
            print(content[:500])
            print("=== 预览结束 ===")
        except Exception as e:
            print(f"\n使用 {encoding} 编码读取失败: {e}")

def main():
    """
    主函数
    """
    # 检查docs/00-项目概览目录下的所有.md文件
    target_dir = os.path.join(os.getcwd(), 'docs', '00-项目概览')
    
    if not os.path.exists(target_dir):
        print(f"目录不存在: {target_dir}")
        return
    
    for filename in os.listdir(target_dir):
        if filename.endswith('.md'):
            file_path = os.path.join(target_dir, filename)
            check_file_content(file_path)
            print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()
