#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件名: restore-and-fix.py
版本号: 1.0.0
更新日期: 2025-11-27
功能描述: 恢复文件备份并使用专业方法修复编码
"""

import shutil
from pathlib import Path
import chardet

def restore_and_fix():
    """
    恢复文件备份并修复编码
    """
    # 定义文件路径
    file2_path = Path(r"e:\Dropbox\GitHub\SutWxApp\docs\11-优化建议\02-系统优化建议.md")
    
    # 查找备份文件
    backup_files = list(Path(r"e:\Dropbox\GitHub\SutWxApp\docs\11-优化建议").glob("02-系统优化建议.md.bak*"))
    if not backup_files:
        print("❌ 未找到备份文件")
        return False
    
    # 使用最新的备份文件
    backup_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    latest_backup = backup_files[0]
    print(f"✅ 找到最新备份: {latest_backup}")
    
    # 恢复备份
    shutil.copy2(latest_backup, file2_path)
    print(f"✅ 已恢复文件: {file2_path}")
    
    # 使用chardet检测编码
    with open(file2_path, 'rb') as f:
        raw_data = f.read()
    
    # 移除UTF-8 BOM（如果存在）
    bom_removed = False
    if raw_data.startswith(b'\xef\xbb\xbf'):
        raw_data = raw_data[3:]
        bom_removed = True
    
    # 检测编码
    result = chardet.detect(raw_data)
    detected_encoding = result['encoding']
    confidence = result['confidence']
    print(f"🔍 检测到编码: {detected_encoding}, 置信度: {confidence:.2f}")
    
    # 尝试使用检测到的编码解码
    try:
        content = raw_data.decode(detected_encoding)
        print(f"✅ 使用 {detected_encoding} 解码成功")
        
        # 验证中文比例
        chinese_chars = sum(1 for c in content if '\u4e00' <= c <= '\u9fff')
        total_chars = len(content)
        chinese_ratio = chinese_chars / total_chars if total_chars > 0 else 0
        print(f"📊 中文比例: {chinese_ratio:.2f}")
        
        # 写入为UTF-8无BOM格式
        with open(file2_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        
        print(f"✅ 修复成功: {file2_path}")
        return True
        
    except UnicodeDecodeError:
        print(f"❌ 使用 {detected_encoding} 解码失败")
        
        # 尝试其他常见编码
        common_encodings = ['utf-8', 'gbk', 'gb2312', 'big5', 'utf-16-le', 'utf-16-be']
        for enc in common_encodings:
            try:
                content = raw_data.decode(enc)
                print(f"✅ 使用 {enc} 解码成功")
                
                # 验证中文比例
                chinese_chars = sum(1 for c in content if '\u4e00' <= c <= '\u9fff')
                total_chars = len(content)
                chinese_ratio = chinese_chars / total_chars if total_chars > 0 else 0
                print(f"📊 中文比例: {chinese_ratio:.2f}")
                
                if chinese_ratio > 0.5:
                    # 写入为UTF-8无BOM格式
                    with open(file2_path, 'w', encoding='utf-8', newline='\n') as f:
                        f.write(content)
                    
                    print(f"✅ 修复成功: {file2_path}")
                    return True
                    
            except UnicodeDecodeError:
                print(f"❌ 使用 {enc} 解码失败")
                continue
    
    print(f"❌ 所有编码尝试失败")
    return False

def main():
    """
    主函数
    """
    print("开始恢复并修复文件...")
    print("=" * 50)
    
    if restore_and_fix():
        print("✅ 修复完成")
    else:
        print("❌ 修复失败")
    
    print("=" * 50)

if __name__ == "__main__":
    main()
