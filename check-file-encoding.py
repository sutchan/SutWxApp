#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件名: check-file-encoding.py
版本号: 1.0.0
更新日期: 2025-11-30
描述: 检查文件编码和内容，显示文件的前100个字符
功能: 1. 读取文件内容
      2. 显示文件的前100个字符
      3. 尝试用不同编码解码文件内容
      4. 显示解码结果
"""

import os

def check_file(file_path):
    """
    检查文件编码和内容，显示文件的前100个字符
    :param file_path: 文件路径
    :return: None
    """
    try:
        print(f"\n=== 检查文件: {file_path} ===")
        
        # 读取文件二进制内容
        with open(file_path, 'rb') as f:
            raw_content = f.read()
        
        print(f"文件大小: {len(raw_content)} 字节")
        print(f"文件前100个字节: {raw_content[:100]}")
        
        # 尝试用不同编码解码文件内容
        encodings = ['utf-8', 'gbk', 'gb2312', 'big5', 'utf-16']
        for enc in encodings:
            try:
                content = raw_content.decode(enc)
                print(f"\n用{enc}解码的前100个字符:")
                print(f"{content[:100]}")
            except UnicodeDecodeError as e:
                print(f"\n用{enc}解码失败: {e}")
    except Exception as e:
        print(f"检查文件失败: {e}")

# 检查单个文件
if __name__ == "__main__":
    test_file = "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\00-项目概览\\02-目录结构.md"
    check_file(test_file)
