#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复UTF-16编码的Markdown文件
将所有Markdown文件转换为UTF-8 with BOM编码，Unix LF换行符
"""

import os

def fix_file_encoding(file_path):
    """
    修复单个文件的编码
    :param file_path: 文件路径
    """
    try:
        print(f"处理文件: {file_path}")
        
        # 尝试用UTF-16编码读取文件
        try:
            with open(file_path, 'r', encoding='utf-16') as f:
                content = f.read()
            print(f"  成功用UTF-16解码")
        except UnicodeDecodeError:
            # 如果UTF-16解码失败，尝试UTF-8
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                print(f"  成功用UTF-8解码")
            except UnicodeDecodeError:
                # 如果UTF-8也失败，尝试GBK
                with open(file_path, 'r', encoding='gbk') as f:
                    content = f.read()
                print(f"  成功用GBK解码")
        
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