#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高级修复文档编码和换行符的Python脚本
"""

import os
import glob
import codecs

def detect_encoding(file_path):
    """检测文件的最佳编码"""
    # 尝试的编码列表，按优先级排序
    encodings_to_try = [
        'utf-8-sig',  # UTF-8 with BOM
        'utf-8',      # UTF-8 without BOM
        'gbk',        # 中文Windows默认编码
        'gb2312',     # 简体中文
        'big5',       # 繁体中文
        'utf-16',     # Unicode
        'utf-16-le',  # Unicode Little Endian
        'utf-16-be',  # Unicode Big Endian
        'latin-1',    # 西欧编码
    ]
    
    best_encoding = None
    best_score = 0
    best_content = None
    
    with open(file_path, 'rb') as f:
        content_bytes = f.read()
    
    for encoding in encodings_to_try:
        try:
            # 尝试解码
            content = content_bytes.decode(encoding)
            
            # 计算得分：
            # 1. 中文汉字数量
            chinese_chars = sum(1 for c in content if '\u4e00' <= c <= '\u9fff')
            # 2. 有效字符比例（排除控制字符和乱码）
            valid_chars = sum(1 for c in content if c.isprintable() or c in '\n\t\r')
            valid_ratio = valid_chars / len(content) if len(content) > 0 else 0
            # 3. 换行符一致性
            has_crlf = '\r\n' in content
            has_lf = '\n' in content
            has_cr = '\r' in content
            newline_consistency = 1.0 if (has_crlf and not has_lf and not has_cr) or (has_lf and not has_crlf and not has_cr) else 0.5
            
            # 综合得分
            score = (chinese_chars * 0.6) + (valid_ratio * 0.3) + (newline_consistency * 0.1)
            
            if score > best_score:
                best_score = score
                best_encoding = encoding
                best_content = content
        except UnicodeDecodeError:
            continue
    
    return best_encoding, best_content

def fix_file_encoding(file_path):
    """修复单个文件的编码和换行符"""
    print(f"处理文件: {file_path}")
    
    try:
        # 检测最佳编码
        encoding, content = detect_encoding(file_path)
        
        if not encoding or not content:
            print(f"  无法检测编码，跳过")
            return False
        
        print(f"  检测到最佳编码: {encoding}")
        
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