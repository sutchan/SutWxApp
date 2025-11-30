#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将GBK编码的Markdown文件转换为UTF-8无BOM格式
"""

import os

def convert_gbk_to_utf8(file_path):
    """
    将单个GBK编码文件转换为UTF-8无BOM格式
    
    Args:
        file_path: 文件路径
    """
    try:
        # 以二进制模式读取文件
        with open(file_path, 'rb') as f:
            content_bytes = f.read()
        
        # 尝试使用GBK解码
        try:
            content = content_bytes.decode('gbk')
        except UnicodeDecodeError:
            # 如果GBK解码失败，尝试使用UTF-8
            try:
                content = content_bytes.decode('utf-8')
            except UnicodeDecodeError:
                # 如果都失败，使用latin-1作为最后尝试
                content = content_bytes.decode('latin-1')
        
        # 统一换行符为Unix LF
        content = content.replace('\r\n', '\n')
        content = content.replace('\r', '\n')
        
        # 以UTF-8无BOM格式写入文件
        with open(file_path, 'wb') as f:
            f.write(content.encode('utf-8'))
        
        print(f"转换成功: {file_path}")
    except Exception as e:
        print(f"转换失败: {file_path}, 错误: {e}")

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
    
    # 转换每个文件
    for file_path in md_files:
        convert_gbk_to_utf8(file_path)
    
    print("所有文件转换完成")

if __name__ == '__main__':
    main()