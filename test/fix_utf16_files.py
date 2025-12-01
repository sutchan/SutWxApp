#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复UTF-16编码文件的脚本
"""

import os
import glob

def fix_utf16_file(file_path):
    """修复单个UTF-16编码文件"""
    print(f"处理文件: {file_path}")
    
    try:
        # 尝试用UTF-16 LE解码（最常见的UTF-16格式）
        with open(file_path, 'rb') as f:
            content_bytes = f.read()
        
        # 尝试多种UTF-16变体
        utf16_variants = ['utf-16-le', 'utf-16-be', 'utf-16']
        content = None
        
        for encoding in utf16_variants:
            try:
                content = content_bytes.decode(encoding)
                print(f"  使用 {encoding} 成功解码")
                break
            except UnicodeDecodeError:
                continue
        
        if not content:
            # 尝试其他常见编码
            other_encodings = ['gbk', 'utf-8', 'utf-8-sig']
            for encoding in other_encodings:
                try:
                    content = content_bytes.decode(encoding)
                    print(f"  使用 {encoding} 成功解码")
                    break
                except UnicodeDecodeError:
                    continue
        
        if not content:
            print(f"  无法解码，跳过")
            return False
        
        # 转换换行符为LF
        content = content.replace('\r\n', '\n').replace('\r', '\n')
        
        # 写入文件，使用UTF-8 with BOM编码
        with open(file_path, 'w', encoding='utf-8-sig') as f:
            f.write(content)
        
        print(f"  已修复为: UTF-8 with BOM, LF换行符")
        return True
    except Exception as e:
        print(f"  处理失败: {e}")
        return False

def main():
    """主函数"""
    docs_path = "e:\\Dropbox\\GitHub\\SutWxApp\\docs"
    
    # 获取所有.md文件
    md_files = glob.glob(os.path.join(docs_path, '**', '*.md'), recursive=True)
    
    print(f"找到 {len(md_files)} 个.md文件")
    
    success_count = 0
    fail_count = 0
    
    for file_path in md_files:
        if fix_utf16_file(file_path):
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n处理完成！")
    print(f"成功: {success_count} 个文件")
    print(f"失败: {fail_count} 个文件")

if __name__ == "__main__":
    main()