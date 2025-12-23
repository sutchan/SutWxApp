#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复单个文件的编码问题，转换为UTF-8 with BOM格式
"""

import os
import chardet

def fix_file_encoding(file_path):
    """
    修复单个文件的编码，转换为UTF-8 with BOM
    
    Args:
        file_path: 文件路径
    """
    try:
        # 读取文件内容
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # 检测编码
        result = chardet.detect(content)
        encoding = result['encoding']
        confidence = result['confidence']
        
        print(f"检测到文件 {file_path} 的编码: {encoding} (置信度: {confidence:.2f})")
        
        # 如果已经是UTF-8，直接返回
        if encoding and encoding.lower() in ['utf-8', 'utf-8-sig']:
            print(f"文件 {file_path} 已经是UTF-8编码，无需转换")
            return True
        
        # 尝试解码并转换为UTF-8 with BOM
        decoded_content = content.decode(encoding or 'utf-8', errors='replace')
        
        # 写入为UTF-8 with BOM
        with open(file_path, 'w', encoding='utf-8-sig') as f:
            f.write(decoded_content)
        
        print(f"成功将文件 {file_path} 转换为UTF-8 with BOM编码")
        return True
        
    except Exception as e:
        print(f"处理文件 {file_path} 时出错: {e}")
        return False

if __name__ == "__main__":
    file_path = r'e:\Dropbox\GitHub\SutWxApp\docs\11-优化建议\02-系统优化建议.md'
    fix_file_encoding(file_path)
