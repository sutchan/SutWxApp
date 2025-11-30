#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件名: check-pages-encoding.py
版本号: 1.0.0
更新日期: 2025-11-30
功能描述: 检查 pages 目录下所有文件的编码情况
"""

import os
import chardet

def check_file_encoding(file_path):
    """
    检查单个文件的编码
    :param file_path: 文件路径
    :return: 编码信息
    """
    try:
        with open(file_path, 'rb') as f:
            raw_data = f.read()
        result = chardet.detect(raw_data)
        return result
    except Exception as e:
        return {'encoding': 'error', 'confidence': 0.0, 'error': str(e)}

def main():
    """
    主函数，遍历 pages 目录下所有文件并检查编码
    """
    pages_dir = "e:\\Dropbox\\GitHub\\SutWxApp\\SutWxApp\\pages"
    
    print("=== 开始检查 pages 目录下文件编码 ===")
    
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            file_path = os.path.join(root, file)
            result = check_file_encoding(file_path)
            
            if result['encoding'] == 'error':
                print(f"文件: {file_path} 检查失败: {result['error']}")
            else:
                print(f"文件: {file_path} 编码: {result['encoding']} 置信度: {result['confidence']:.2f}")
    
    print("=== 检查完成 ===")

if __name__ == "__main__":
    main()
