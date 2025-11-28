#!/usr/bin/env python3
"""
查看文件的二进制内容，以便分析编码问题
"""
from pathlib import Path

def check_binary_content(file_path: Path) -> None:
    """查看文件的二进制内容"""
    try:
        # 备份文件路径
        backup_path = file_path.with_suffix(f'{file_path.suffix}.bak')
        
        # 读取备份文件内容
        with open(backup_path, 'rb') as f:
            content = f.read()
        
        print(f"文件: {file_path}")
        print(f"文件大小: {len(content)} 字节")
        print(f"前100字节的十六进制表示:")
        
        # 显示前100字节的十六进制表示
        hex_str = ' '.join([f'{b:02x}' for b in content[:100]])
        print(hex_str)
        
        print(f"\n前100字节的ASCII表示:")
        # 显示前100字节的ASCII表示
        ascii_str = ''.join([chr(b) if 32 <= b <= 126 else '.' for b in content[:100]])
        print(ascii_str)
        
        print(f"\n尝试直接用UTF-8解码前100字节:")
        try:
            utf8_content = content[:100].decode('utf-8')
            print(utf8_content)
        except UnicodeDecodeError as e:
            print(f"UTF-8解码失败: {e}")
            
        print(f"\n尝试直接用GBK解码前100字节:")
        try:
            gbk_content = content[:100].decode('gbk')
            print(gbk_content)
        except UnicodeDecodeError as e:
            print(f"GBK解码失败: {e}")
            
    except Exception as e:
        print(f"处理文件 {file_path} 时出错: {e}")

def main():
    """主函数"""
    # 要检查的文件列表
    files = [
        Path("e:\\Dropbox\\GitHub\\SutWxApp\\docs\\00-项目概览\\01-项目简介.md"),
    ]
    
    for file in files:
        check_binary_content(file)
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()