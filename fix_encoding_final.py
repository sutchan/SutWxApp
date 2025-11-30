#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复docs目录下所有Markdown文件的编码问题
将所有文件转换为UTF-8无BOM格式，换行符统一为Unix LF
"""

import os
import codecs

def fix_file_encoding(file_path):
    """
    修复单个文件的编码问题
    
    Args:
        file_path: 文件路径
    """
    try:
        # 尝试使用不同编码读取文件
        encodings = ['gbk', 'utf-8', 'latin-1']
        content = None
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                break
            except UnicodeDecodeError:
                continue
        
        if content is None:
            # 如果所有编码都失败，尝试二进制读取
            with open(file_path, 'rb') as f:
                content_bytes = f.read()
            # 尝试使用chardet检测编码
            try:
                import chardet
                result = chardet.detect(content_bytes)
                encoding = result['encoding']
                content = content_bytes.decode(encoding)
            except:
                # 如果chardet不可用或失败，使用gbk作为最后尝试
                content = content_bytes.decode('gbk', errors='replace')
        
        # 统一换行符为Unix LF
        content = content.replace('\r\n', '\n')
        content = content.replace('\r', '\n')
        
        # 以UTF-8无BOM格式写入文件
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(content)
        
        print(f"修复成功: {file_path}")
    except Exception as e:
        print(f"修复失败: {file_path}, 错误: {e}")

def main():
    """
    主函数
    """
    docs_dir = 'e:\\Dropbox\\GitHub\\SutWxApp\\docs'
    
    # 获取所有Markdown文件
    md_files = []
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.md'):
                md_files.append(os.path.join(root, file))
    
    print(f"找到 {len(md_files)} 个Markdown文件")
    
    # 修复每个文件
    for file_path in md_files:
        fix_file_encoding(file_path)
    
    print("所有文件修复完成")

if __name__ == '__main__':
    main()