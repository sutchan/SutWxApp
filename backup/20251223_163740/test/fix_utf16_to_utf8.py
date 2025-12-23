#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
强制将UTF-16编码的文件转换为UTF-8 with BOM格式
"""

import os

def fix_utf16_file(file_path):
    """
    强制将文件从UTF-16转换为UTF-8 with BOM
    
    Args:
        file_path: 文件路径
    """
    try:
        # 读取文件内容，尝试UTF-16解码
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # 尝试UTF-16解码（带BOM和不带BOM）
        try:
            # 尝试UTF-16 LE with BOM
            decoded_content = content.decode('utf-16-le')
            print(f"使用 utf-16-le 编码成功解码文件 {file_path}")
        except UnicodeDecodeError:
            try:
                # 尝试UTF-16 BE with BOM
                decoded_content = content.decode('utf-16-be')
                print(f"使用 utf-16-be 编码成功解码文件 {file_path}")
            except UnicodeDecodeError:
                try:
                    # 尝试UTF-16 with BOM
                    decoded_content = content.decode('utf-16')
                    print(f"使用 utf-16 编码成功解码文件 {file_path}")
                except UnicodeDecodeError:
                    # 如果都失败，使用GBK解码
                    decoded_content = content.decode('gbk', errors='replace')
                    print(f"使用 gbk 编码解码文件 {file_path}（可能有部分乱码）")
        
        # 写入为UTF-8 with BOM，使用Unix换行符
        with open(file_path, 'w', encoding='utf-8-sig', newline='\n') as f:
            f.write(decoded_content)
        
        print(f"成功将文件 {file_path} 转换为UTF-8 with BOM编码")
        return True
        
    except Exception as e:
        print(f"处理文件 {file_path} 时出错: {e}")
        return False

if __name__ == "__main__":
    file_path = r'e:\Dropbox\GitHub\SutWxApp\docs\11-优化建议\02-系统优化建议.md'
    fix_utf16_file(file_path)
