#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复文件编码和换行符的Python脚本
目标：将文件转换为UTF-8 with BOM编码，换行符统一为Unix LF
"""

import os

# 尝试导入chardet库，如果没有安装则使用默认编码
try:
    import chardet
except ImportError:
    chardet = None
    print("警告：chardet库未安装，将使用默认编码UTF-8")

def fix_file_encoding(file_path):
    """
    修复单个文件的编码和换行符
    
    Args:
        file_path (str): 文件路径
    """
    print(f"正在处理文件: {file_path}")
    
    try:
        # 读取文件内容
        with open(file_path, 'rb') as f:
            raw_content = f.read()
        
        # 检测文件编码
        if chardet:
            detected = chardet.detect(raw_content)
            encoding = detected['encoding']
            confidence = detected['confidence']
            print(f"  检测到编码: {encoding} (可信度: {confidence:.2f})")
        else:
            encoding = 'utf-8'
            print(f"  使用默认编码: {encoding}")
        
        # 解码文件内容
        content = raw_content.decode(encoding)
        
        # 转换换行符为Unix LF
        content = content.replace('\r\n', '\n').replace('\r', '\n')
        
        # 写入文件，使用UTF-8 with BOM编码
        with open(file_path, 'w', encoding='utf-8-sig', newline='\n') as f:
            f.write(content)
        
        print(f"  ✅ 处理成功")
    except Exception as e:
        print(f"  ❌ 处理失败: {e}")
        # 尝试使用UTF-8编码重新处理
        try:
            print(f"  尝试使用UTF-8编码重新处理...")
            content = raw_content.decode('utf-8', errors='ignore')
            content = content.replace('\r\n', '\n').replace('\r', '\n')
            with open(file_path, 'w', encoding='utf-8-sig', newline='\n') as f:
                f.write(content)
            print(f"  ✅ 使用UTF-8编码重新处理成功")
        except Exception as e2:
            print(f"  ❌ 使用UTF-8编码重新处理也失败: {e2}")

# 定义要处理的文件列表
files_to_process = [
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\02-管理员指南\\01-环境搭建.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\02-管理员指南\\02-系统配置.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\02-管理员指南\\03-权限管理.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\02-管理员指南\\README.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\01-开发环境配置.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\02-架构设计文档.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\03-API接口文档.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\04-API开发指南.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\05-服务层API文档.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\06-技术设计文档.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\07-开发手册.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\08-代码规范.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\09-版本发布说明.md",
    "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\03-开发者指南\\README.md"
]

# 执行修复
for file_path in files_to_process:
    fix_file_encoding(file_path)

print("\n所有文件处理完成！")