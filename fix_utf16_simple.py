#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单高效的UTF-16到UTF-8转换脚本
"""

import os
import glob

def fix_file(file_path):
    """修复单个文件"""
    print(f"处理: {file_path}")
    
    try:
        # 读取二进制内容
        with open(file_path, 'rb') as f:
            data = f.read()
        
        # 检查BOM
        if data.startswith(b'\xff\xfe'):
            # UTF-16 LE
            text = data.decode('utf-16-le')
            print(f"  检测到 UTF-16 LE")
        elif data.startswith(b'\xfe\xff'):
            # UTF-16 BE
            text = data.decode('utf-16-be')
            print(f"  检测到 UTF-16 BE")
        else:
            # 尝试UTF-8
            try:
                text = data.decode('utf-8')
                print(f"  检测到 UTF-8")
            except UnicodeDecodeError:
                # 尝试带BOM的UTF-8
                try:
                    text = data.decode('utf-8-sig')
                    print(f"  检测到 UTF-8 with BOM")
                except UnicodeDecodeError:
                    print(f"  无法解码，跳过")
                    return False
        
        # 写入为UTF-8 with BOM
        with open(file_path, 'w', encoding='utf-8-sig') as f:
            f.write(text)
        
        print(f"  已转换为 UTF-8 with BOM")
        return True
    except Exception as e:
        print(f"  错误: {e}")
        return False

def main():
    """主函数"""
    docs_path = "e:\\Dropbox\\GitHub\\SutWxApp\\docs"
    
    # 获取所有.md文件
    files = glob.glob(os.path.join(docs_path, '**', '*.md'), recursive=True)
    
    print(f"找到 {len(files)} 个文件")
    
    success = 0
    fail = 0
    
    for file in files:
        if fix_file(file):
            success += 1
        else:
            fail += 1
    
    print(f"\n结果: {success} 成功, {fail} 失败")

if __name__ == "__main__":
    main()