#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查并修复文件编码问题
将所有文件转换为UTF-8无BOM格式
"""

import os
import sys
import codecs

def check_file_encoding(file_path):
    """检查文件编码"""
    encodings = ['utf-8-sig', 'utf-8', 'gbk', 'gb2312', 'latin-1']
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                content = f.read()
                return enc, content
        except UnicodeDecodeError:
            continue
    return None, None

def fix_file_encoding(file_path):
    """修复文件编码为UTF-8无BOM"""
    enc, content = check_file_encoding(file_path)
    if not enc or not content:
        print(f"无法读取文件: {file_path}")
        return False
    
    # 如果已经是UTF-8且无BOM，不需要转换
    if enc == 'utf-8' and not content.startswith('\ufeff'):
        print(f"文件已是UTF-8无BOM: {file_path}")
        return True
    
    # 移除BOM并保存为UTF-8无BOM
    try:
        if content.startswith('\ufeff'):
            content = content[1:]
        
        with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        print(f"已修复编码: {file_path} (原编码: {enc})")
        return True
    except Exception as e:
        print(f"修复失败: {file_path}, 错误: {e}")
        return False

def process_directory(directory, extensions):
    """处理目录下所有指定扩展名的文件"""
    total_files = 0
    fixed_files = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                total_files += 1
                file_path = os.path.join(root, file)
                if fix_file_encoding(file_path):
                    fixed_files += 1
    
    print(f"\n处理完成: 共检查 {total_files} 个文件，修复 {fixed_files} 个文件")

if __name__ == "__main__":
    # 处理JS文件
    print("=== 处理JS文件 ===")
    process_directory('e:\\Dropbox\\GitHub\\SutWxApp', ['.js', '.json', '.wxss', '.wxml'])
    
    # 处理PHP文件
    print("\n=== 处理PHP文件 ===")
    process_directory('e:\\Dropbox\\GitHub\\SutWxApp', ['.php'])
    
    # 处理文档文件
    print("\n=== 处理文档文件 ===")
    process_directory('e:\\Dropbox\\GitHub\\SutWxApp', ['.md', '.pot', '.po'])
