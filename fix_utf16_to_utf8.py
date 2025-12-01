#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将UTF-16编码的文档转换为UTF-8 with BOM编码
"""

import os
import glob

def fix_utf16_file(file_path, reference_content=None):
    """修复单个UTF-16编码文件"""
    print(f"处理文件: {file_path}")
    
    try:
        # 尝试读取文件内容
        with open(file_path, 'rb') as f:
            content_bytes = f.read()
        
        # 检测UTF-16 BOM
        is_utf16_le = content_bytes.startswith(b'\xff\xfe')
        is_utf16_be = content_bytes.startswith(b'\xfe\xff')
        
        if is_utf16_le or is_utf16_be:
            # 确定UTF-16编码类型
            encoding = 'utf-16-le' if is_utf16_le else 'utf-16-be'
            
            # 解码文件内容
            content = content_bytes.decode(encoding)
            
            # 写入文件，使用UTF-8 with BOM编码
            with open(file_path, 'w', encoding='utf-8-sig') as f:
                f.write(content)
            
            print(f"  已从 {encoding} 转换为 UTF-8 with BOM")
            return True
        else:
            # 检查是否为UTF-8 with BOM
            is_utf8_bom = content_bytes.startswith(b'\xef\xbb\xbf')
            if is_utf8_bom:
                print(f"  已为 UTF-8 with BOM，跳过")
                return True
            else:
                # 尝试UTF-8解码
                try:
                    content = content_bytes.decode('utf-8')
                    # 写入文件，使用UTF-8 with BOM编码
                    with open(file_path, 'w', encoding='utf-8-sig') as f:
                        f.write(content)
                    print(f"  已从 UTF-8 转换为 UTF-8 with BOM")
                    return True
                except UnicodeDecodeError:
                    # 如果无法解码，且提供了参考内容，则使用参考内容
                    if reference_content:
                        with open(file_path, 'w', encoding='utf-8-sig') as f:
                            f.write(reference_content)
                        print(f"  使用参考内容重写文件")
                        return True
                    else:
                        print(f"  无法解码，跳过")
                        return False
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