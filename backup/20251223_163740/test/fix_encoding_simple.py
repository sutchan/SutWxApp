#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复单个文件的编码问题，转换为UTF-8 with BOM格式（不依赖chardet）
"""

import os

def fix_file_encoding_simple(file_path):
    """
    修复单个文件的编码，转换为UTF-8 with BOM
    不依赖chardet，直接尝试多种编码方式
    
    Args:
        file_path: 文件路径
    """
    try:
        # 读取文件内容
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # 尝试多种编码方式解码
        encodings_to_try = ['utf-16', 'utf-8', 'gbk', 'gb2312', 'ansi']
        decoded_content = None
        
        for encoding in encodings_to_try:
            try:
                decoded_content = content.decode(encoding)
                print(f"使用 {encoding} 编码成功解码文件 {file_path}")
                break
            except UnicodeDecodeError:
                continue
        
        # 如果所有编码都失败，使用replace模式
        if decoded_content is None:
            decoded_content = content.decode('utf-8', errors='replace')
            print(f"所有编码尝试失败，使用replace模式解码文件 {file_path}")
        
        # 写入为UTF-8 with BOM
        with open(file_path, 'w', encoding='utf-8-sig', newline='\n') as f:
            f.write(decoded_content)
        
        print(f"成功将文件 {file_path} 转换为UTF-8 with BOM编码")
        return True
        
    except Exception as e:
        print(f"处理文件 {file_path} 时出错: {e}")
        return False

if __name__ == "__main__":
    file_path = r'e:\Dropbox\GitHub\SutWxApp\docs\11-优化建议\02-系统优化建议.md'
    fix_file_encoding_simple(file_path)
