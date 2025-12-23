#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的乱码检测脚本
只检测真正的乱码（Unicode替换字符和明显的乱码序列）
"""

import os
import re

# 不需要检查的目录
EXCLUDE_DIRS = [
    'node_modules',
    'dist',
    'build',
    '.git',
    '.trae',
    'test',
    'assets',
    'images',
    'components',
    'pages',
    '.venv'
]

# 不需要检查的文件类型
EXCLUDE_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico',
    '.mp3', '.mp4', '.wav', '.avi',
    '.zip', '.rar', '.7z', '.tar', '.gz',
    '.exe', '.dll', '.so', '.dylib',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.ttf', '.woff', '.woff2',
    '.json', '.ps1', '.py'
]

def is_binary_file(file_path):
    """检测文件是否为二进制文件"""
    try:
        with open(file_path, 'rb') as f:
            content = f.read(1024)
        # 检查是否包含null字节
        return b'\x00' in content
    except Exception:
        return True

def has_garbled_content(content):
    """检测内容是否包含真正的乱码"""
    # 只检查Unicode替换字符（这是最可靠的乱码标志）
    if '\ufffd' in content:
        return True
    
    # 检查明显的乱码序列（连续的非中文字符和非英文字符）
    garbled_pattern = r'[^\u4e00-\u9fff\w\s\p{P}]{10,}'
    if re.search(garbled_pattern, content, re.UNICODE):
        return True
    
    return False

def check_file(file_path):
    """检查单个文件"""
    # 检查文件扩展名
    ext = os.path.splitext(file_path)[1].lower()
    if ext in EXCLUDE_EXTENSIONS:
        return False
    
    # 检查是否为二进制文件
    if is_binary_file(file_path):
        return False
    
    try:
        # 读取文件内容
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检测乱码
        return has_garbled_content(content)
    except UnicodeDecodeError:
        # 如果UTF-8解码失败，尝试其他编码
        try:
            with open(file_path, 'r', encoding='gbk') as f:
                content = f.read()
            return has_garbled_content(content)
        except Exception:
            return True
    except Exception:
        return True

def scan_directory(directory):
    """扫描目录中的所有文件"""
    garbled_files = []
    
    for root, dirs, files in os.walk(directory):
        # 过滤掉不需要检查的目录
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            file_path = os.path.join(root, file)
            if check_file(file_path):
                garbled_files.append(file_path)
    
    return garbled_files

def main():
    """主函数"""
    # 获取当前工作目录
    work_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    print(f"开始扫描工作目录: {work_dir}")
    print(f"排除目录: {', '.join(EXCLUDE_DIRS)}")
    print(f"排除文件类型: {', '.join(EXCLUDE_EXTENSIONS)}")
    print("=" * 60)
    
    # 扫描目录
    garbled_files = scan_directory(work_dir)
    
    # 输出结果
    print(f"扫描完成，共检测到 {len(garbled_files)} 个包含乱码的文件:")
    print("=" * 60)
    
    if garbled_files:
        for i, file_path in enumerate(garbled_files, 1):
            print(f"{i:3d}. {file_path}")
        
        # 保存结果到文件
        result_file = os.path.join(work_dir, 'simple_garbled_files.txt')
        with open(result_file, 'w', encoding='utf-8') as f:
            f.write("包含乱码的文件清单\n")
            f.write("=" * 50 + "\n")
            for file_path in garbled_files:
                f.write(f"{file_path}\n")
        
        print(f"\n结果已保存到: {result_file}")
    else:
        print("未检测到包含乱码的文件")

if __name__ == "__main__":
    main()
