#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复文档编码和换行符的Python脚本
"""

import os
import glob
import chardet

def fix_file_encoding(file_path):
    """修复单个文件的编码和换行符"""
    print(f"处理文件: {file_path}")
    
    try:
        # 读取文件字节
        with open(file_path, 'rb') as f:
            content_bytes = f.read()
        
        # 检测文件编码
        detected = chardet.detect(content_bytes)
        encoding = detected['encoding'] or 'utf-8'
        confidence = detected['confidence']
        
        print(f"  检测到编码: {encoding} (可信度: {confidence:.2f})")
        
        # 读取文件内容
        content = content_bytes.decode(encoding, errors='replace')
        
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
        if fix_file_encoding(file_path):
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n处理完成！")
    print(f"成功: {success_count} 个文件")
    print(f"失败: {fail_count} 个文件")

if __name__ == "__main__":
    main()