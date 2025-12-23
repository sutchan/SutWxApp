#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
乱码检测脚本
用于检测工作区中所有包含乱码的文件
"""

import os
import re

# 不需要检查的目录和文件类型
EXCLUDE_DIRS = [
    'node_modules',
    'dist',
    'build',
    '.git',
    '.trae',
    'test',  # 排除测试脚本目录
    'assets',
    'images',
    'components',
    'pages',
    '.venv'  # 排除虚拟环境目录
]

EXCLUDE_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico',
    '.mp3', '.mp4', '.wav', '.avi',
    '.zip', '.rar', '.7z', '.tar', '.gz',
    '.exe', '.dll', '.so', '.dylib',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.ttf', '.woff', '.woff2',
    '.json',  # JSON文件单独处理
    '.ps1',  # PowerShell脚本文件
    '.py'  # Python脚本文件
]

# 乱码特征模式
GARBLED_PATTERNS = [
    r'\ufffd',  # Unicode替换字符
    r'\xe4\xb8\x80[\x80-\xbf]+',  # 可能的乱码序列
    r'[\xc0-\xdf][\x80-\xbf]{2,}',  # 错误的UTF-8序列
    r'[\xe0-\xef][\x80-\xbf]{3,}',  # 错误的UTF-8序列
    r'[\xf0-\xf7][\x80-\xbf]{4,}',  # 错误的UTF-8序列
    r'[\x80-\x9f]',  # ISO-8859-1控制字符
    r'\xa1\xa1|\xa2\xa2|\xa3\xa3',  # 可能的乱码
    r'[\x00-\x1f\x7f-\x9f]{3,}',  # 连续控制字符
]

def is_binary_file(file_path):
    """检测文件是否为二进制文件"""
    try:
        with open(file_path, 'rb') as f:
            content = f.read(1024)
        # 检查是否包含null字节或其他二进制特征
        if b'\x00' in content:
            return True
        # 检查是否包含大部分可打印ASCII字符
        printable = sum(1 for c in content if 32 <= c <= 126 or c in b'\n\r\t\b')
        return printable / len(content) < 0.7
    except Exception:
        return True

def detect_garbled(content, encoding):
    """检测内容是否包含乱码"""
    try:
        # 检查Unicode替换字符（这是最可靠的乱码标志）
        if '\ufffd' in content:
            return True
        
        # 检查是否有明显的乱码序列（连续的非中文字符和非英文字符）
        garbled_segments = re.findall(r'[^\u4e00-\u9fff\w\s\p{P}]{8,}', content)
        if garbled_segments:
            return True
        
        # 检查是否有连续的错误UTF-8序列
        if re.search(r'[\xc0-\xdf][\x80-\xbf]{2,}|[\xe0-\xef][\x80-\xbf]{3,}|[\xf0-\xf7][\x80-\xbf]{4,}', content):
            return True
        
        # 检查是否有大量的控制字符
        control_chars = len(re.findall(r'[\x00-\x1f\x7f-\x9f]', content))
        if control_chars > len(content) * 0.1:  # 控制字符占比超过10%
            return True
        
        return False
    except Exception:
        return True

def check_file_encoding(file_path):
    """检查文件编码和乱码情况"""
    try:
        # 排除结果文件
        if os.path.basename(file_path) == 'garbled_files.txt':
            return None, False
        
        # 检查文件扩展名
        ext = os.path.splitext(file_path)[1].lower()
        if ext in EXCLUDE_EXTENSIONS:
            return None, False
        
        # 检查是否为二进制文件
        if is_binary_file(file_path):
            return None, False
        
        # 读取文件内容
        with open(file_path, 'rb') as f:
            raw_data = f.read()
        
        # 移除UTF-8 BOM标记
        if raw_data.startswith(b'\xef\xbb\xbf'):
            raw_data = raw_data[3:]
        
        # 直接尝试常见编码
        encodings_to_try = ['utf-8', 'gbk', 'gb2312', 'big5', 'latin-1', 'utf-16']
        for enc in encodings_to_try:
            try:
                content = raw_data.decode(enc)
                has_garbled = detect_garbled(content, enc)
                return enc, has_garbled
            except UnicodeDecodeError:
                continue
        return None, False
    except Exception as e:
        return None, False

def scan_directory(directory):
    """扫描目录中的所有文件"""
    garbled_files = []
    
    for root, dirs, files in os.walk(directory):
        # 过滤掉不需要检查的目录
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            file_path = os.path.join(root, file)
            encoding, has_garbled = check_file_encoding(file_path)
            
            if has_garbled:
                garbled_files.append({
                    'path': file_path,
                    'encoding': encoding
                })
    
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
        for i, file_info in enumerate(garbled_files, 1):
            print(f"{i:3d}. {file_info['path']} (编码: {file_info['encoding']})")
        
        # 保存结果到文件
        result_file = os.path.join(work_dir, 'garbled_files.txt')
        with open(result_file, 'w', encoding='utf-8') as f:
            f.write("包含乱码的文件清单\n")
            f.write("=" * 50 + "\n")
            for file_info in garbled_files:
                f.write(f"{file_info['path']} (编码: {file_info['encoding']})\n")
        
        print(f"\n结果已保存到: {result_file}")
    else:
        print("未检测到包含乱码的文件")

if __name__ == "__main__":
    main()
