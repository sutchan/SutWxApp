#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复项目审查报告的编码问题
自动检测文件编码并转换为UTF-8无BOM格式
"""

import os
import codecs
import chardet

def fix_file_encoding(file_path):
    """
    修复单个文件的编码问题
    :param file_path: 文件路径
    """
    try:
        # 读取文件二进制内容
        with open(file_path, 'rb') as f:
            raw_data = f.read()
        
        # 检测文件编码
        result = chardet.detect(raw_data)
        encoding = result['encoding']
        confidence = result['confidence']
        
        print(f"  检测到编码: {encoding} (置信度: {confidence:.2f})")
        
        # 使用检测到的编码读取文件
        content = raw_data.decode(encoding)
        
        # 将内容写入为UTF-8无BOM格式
        with codecs.open(file_path, 'w', 'utf-8') as f:
            f.write(content)
        
        print(f"✓ 修复成功: {file_path}")
        return True
    except Exception as e:
        print(f"✗ 修复失败: {file_path} - {e}")
        return False

def main():
    """
    主函数
    """
    # 需要修复的文件列表
    files_to_fix = [
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\项目审查报告_20251130_1500.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\00-项目概览\\01-项目简介.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\00-项目概览\\02-目录结构.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\00-项目概览\\03-技术栈.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\00-项目概览\\README.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\01-文档指南\\01-文档模板.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\01-文档指南\\02-如何贡献文档.md"
    ]
    
    print("开始修复文件编码问题...")
    print("=" * 50)
    
    # 修复所有文件
    for file_path in files_to_fix:
        print(f"处理文件: {file_path}")
        fix_file_encoding(file_path)
        print("-" * 50)
    
    print("修复完成！")

if __name__ == "__main__":
    main()
