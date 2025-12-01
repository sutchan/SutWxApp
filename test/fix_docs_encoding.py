#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复文档编码问题
将所有Markdown文件转换为UTF-8 with BOM编码，Unix LF换行符
"""

import os
import chardet
import codecs

def fix_file_encoding(file_path):
    """
    修复单个文件的编码
    :param file_path: 文件路径
    """
    try:
        # 读取文件内容并检测编码
        with open(file_path, 'rb') as f:
            content_bytes = f.read()
        
        # 检测编码
        result = chardet.detect(content_bytes)
        encoding = result['encoding']
        confidence = result['confidence']
        
        print(f"处理文件: {file_path}")
        print(f"  检测到编码: {encoding} (置信度: {confidence:.2f})")
        
        # 读取文件内容
        if encoding is None:
            # 如果无法检测编码，尝试UTF-8
            encoding = 'utf-8'
        
        # 使用检测到的编码读取内容
        try:
            content = content_bytes.decode(encoding)
        except UnicodeDecodeError:
            # 如果解码失败，尝试UTF-16
            content = content_bytes.decode('utf-16')
        
        # 修复换行符为Unix LF
        content = content.replace('\r\n', '\n').replace('\r', '\n')
        
        # 写入UTF-8 with BOM编码
        with open(file_path, 'w', encoding='utf-8-sig', newline='\n') as f:
            f.write(content)
        
        print(f"  已转换为: UTF-8 with BOM, Unix LF")
        return True
        
    except Exception as e:
        print(f"  处理失败: {e}")
        return False

def main():
    """
    主函数
    """
    docs_dir = "e:\\Dropbox\\GitHub\\SutWxApp\\docs"
    
    print(f"开始处理文档目录: {docs_dir}")
    print("=" * 60)
    
    # 遍历所有Markdown文件
    success_count = 0
    fail_count = 0
    
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                if fix_file_encoding(file_path):
                    success_count += 1
                else:
                    fail_count += 1
    
    print("=" * 60)
    print(f"处理完成: 成功 {success_count} 个, 失败 {fail_count} 个")

if __name__ == "__main__":
    main()