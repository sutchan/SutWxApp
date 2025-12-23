#!/usr/bin/env python3
# 文件名: check_encoding.py
# 版本号: 1.0.0
# 更新日期: 2025-12-01
# 作者: Sut
# 描述: 检查并转换文件编码为UTF-8 with BOM，换行符为Unix LF

import os
import re

# 设置要检查的目录
target_dir = "e:\\Dropbox\\GitHub\\SutWxApp"

# 设置要排除的目录
exclude_dirs = [".git", "node_modules", "dist", "build", ".trae"]

# 设置要检查的文件扩展名
include_extensions = [".js", ".json", ".wxss", ".wxml", ".md", ".po", ".pot"]

# 统计信息
total_files = 0
fixed_files = 0

# 遍历目录并处理文件
def process_directory(dir_path):
    global total_files, fixed_files
    
    # 排除指定目录
    if os.path.basename(dir_path) in exclude_dirs:
        return
    
    print(f"Processing directory: {dir_path}")
    
    # 获取目录中的文件
    for root, dirs, files in os.walk(dir_path):
        # 过滤掉要排除的子目录
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            # 检查文件扩展名
            if os.path.splitext(file)[1] not in include_extensions:
                continue
            
            file_path = os.path.join(root, file)
            total_files += 1
            
            try:
                # 读取文件内容，自动检测编码
                with open(file_path, 'r', encoding='utf-8-sig') as f:
                    content = f.read()
                
                # 检查是否需要转换
                has_crlf = '\r\n' in content
                
                if has_crlf:
                    # 转换换行符为LF
                    content = content.replace('\r\n', '\n')
                    
                    # 写入文件，添加BOM
                    with open(file_path, 'w', encoding='utf-8-sig') as f:
                        f.write(content)
                    
                    fixed_files += 1
                    print(f"Fixed: {file_path}")
            except UnicodeDecodeError:
                print(f"Error decoding {file_path}: UnicodeDecodeError")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

# 开始处理
print("Starting encoding check and conversion...")
print(f"Target directory: {target_dir}")
print(f"Excluded directories: {', '.join(exclude_dirs)}")
print(f"Included extensions: {', '.join(include_extensions)}")
print()

process_directory(target_dir)

# 输出统计信息
print()
print("=== Encoding Check Results ===")
print(f"Total files checked: {total_files}")
print(f"Files fixed: {fixed_files}")
print("==============================")
