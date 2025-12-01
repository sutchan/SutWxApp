#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复文件编码和行 endings的脚本
将文件转换为UTF-8 with BOM编码和Unix LF行 endings
"""

import os
import sys

def fix_file_encoding(file_path):
    """
    修复单个文件的编码和行 endings
    :param file_path: 文件路径
    """
    try:
        # 尝试以不同编码读取文件内容
        encodings = ['utf-8', 'gbk', 'gb2312', 'latin-1']
        content = None
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                break
            except UnicodeDecodeError:
                continue
        
        if content is None:
            print(f"无法读取文件: {file_path}")
            return False
        
        # 转换行 endings为Unix LF
        content = content.replace('\r\n', '\n').replace('\r', '\n')
        
        # 写入文件，使用UTF-8 with BOM编码
        with open(file_path, 'w', encoding='utf-8-sig', newline='\n') as f:
            f.write(content)
        
        print(f"已修复: {file_path}")
        return True
    except Exception as e:
        print(f"处理文件时出错 {file_path}: {e}")
        return False

def main():
    """
    主函数
    """
    if len(sys.argv) < 2:
        print("使用方法: python fix_encoding.py <file_path1> <file_path2> ...")
        sys.exit(1)
    
    for file_path in sys.argv[1:]:
        if os.path.exists(file_path):
            fix_file_encoding(file_path)
        else:
            print(f"文件不存在: {file_path}")

if __name__ == "__main__":
    main()
