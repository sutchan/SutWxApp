#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件名: check_encoding.py
版本号: 1.0.0
更新日期: 2025-11-27
功能: 检查文件的二进制内容，帮助确定文件编码
"""

import os

def check_file_encoding(file_path):
    """
    检查文件的二进制内容
    :param file_path: 文件路径
    :return: None
    """
    print(f"检查文件: {file_path}")
    
    # 以二进制模式读取文件
    with open(file_path, 'rb') as f:
        content = f.read()
    
    # 打印前100个字节的十六进制表示
    print("前100个字节的十六进制表示:")
    for i in range(0, min(100, len(content)), 16):
        chunk = content[i:i+16]
        hex_str = ' '.join(f'{b:02x}' for b in chunk)
        # 尝试将字节转换为可打印字符
        ascii_str = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk)
        print(f'{i:04x}: {hex_str:<48}  {ascii_str}')
    
    # 检查常见的BOM头
    if content.startswith(b'\xef\xbb\xbf'):
        print("\n检测到UTF-8 BOM头")
    elif content.startswith(b'\xff\xfe'):
        print("\n检测到UTF-16 LE BOM头")
    elif content.startswith(b'\xfe\xff'):
        print("\n检测到UTF-16 BE BOM头")
    elif content.startswith(b'\xff\xfe\x00\x00'):
        print("\n检测到UTF-32 LE BOM头")
    elif content.startswith(b'\x00\x00\xfe\xff'):
        print("\n检测到UTF-32 BE BOM头")
    else:
        print("\n未检测到BOM头")
    
    print("\n" + "="*60 + "\n")

def main():
    """
    主函数
    """
    target_dir = os.path.join(os.getcwd(), 'docs', '00-项目概览')
    
    if not os.path.exists(target_dir):
        print(f"目录不存在: {target_dir}")
        return
    
    for filename in os.listdir(target_dir):
        if filename.endswith('.md'):
            file_path = os.path.join(target_dir, filename)
            check_file_encoding(file_path)

if __name__ == "__main__":
    main()
