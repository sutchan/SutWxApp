#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import codecs

def fix_file_encoding(file_path):
    """
    修复文件编码，将其转换为UTF-8
    :param file_path: 文件路径
    :return: 是否成功
    """
    try:
        # 尝试使用多种编码读取文件
        encodings = ['gb2312', 'gbk', 'utf-8', 'utf-16', 'utf-32', 'latin-1']
        content = None
        success_encoding = None
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                # 验证是否包含中文字符
                if any('\u4e00' <= c <= '\u9fa5' for c in content):
                    success_encoding = encoding
                    break
            except UnicodeDecodeError:
                continue
            except Exception as e:
                print(f"  读取文件时出错 ({encoding}): {e}")
                continue
        
        if success_encoding is None:
            # 尝试二进制读取，然后使用latin-1编码读取（latin-1能处理所有字节）
            try:
                with open(file_path, 'rb') as f:
                    raw_data = f.read()
                # 使用latin-1编码读取，然后尝试转换为UTF-8
                content = raw_data.decode('latin-1')
                success_encoding = 'latin-1'
                print(f"  使用latin-1编码读取文件")
            except Exception as e:
                print(f"  无法读取文件内容: {e}")
                return False
        
        if content is None:
            print(f"  无法读取文件内容")
            return False
        
        # 写入为UTF-8编码
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  成功转换文件: {file_path}")
        print(f"  源编码: {success_encoding} -> 目标编码: utf-8")
        return True
    except Exception as e:
        print(f"  处理文件时出错: {e}")
        return False

def main():
    """
    主函数，处理所有指定文件
    """
    # 要处理的文件列表
    files = [
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\04-用户指南\\01-快速入门.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\04-用户指南\\02-用户指南.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\04-用户指南\\03-功能介绍.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\04-用户指南\\04-常见问题.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\04-用户指南\\05-小程序使用指南.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\04-用户指南\\06-隐私政策.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\04-用户指南\\README.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\05-功能模块\\01-积分系统功能说明.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\05-功能模块\\02-功能模块说明文档.md",
        "e:\\Dropbox\\GitHub\\SutWxApp\\docs\\05-功能模块\\README.md"
    ]
    
    print("开始修复文件编码...")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for file_path in files:
        if os.path.exists(file_path):
            print(f"处理文件: {file_path}")
            if fix_file_encoding(file_path):
                success_count += 1
            else:
                fail_count += 1
        else:
            print(f"文件不存在: {file_path}")
            fail_count += 1
        print()
    
    print("=" * 60)
    print(f"修复完成!")
    print(f"成功: {success_count} 个文件")
    print(f"失败: {fail_count} 个文件")

if __name__ == "__main__":
    main()
