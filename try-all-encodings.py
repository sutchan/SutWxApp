#!/usr/bin/env python3
"""
尝试所有可能的编码，直观显示结果
"""
from pathlib import Path

def try_all_encodings(file_path: Path) -> None:
    """尝试所有可能的编码"""
    try:
        # 备份文件路径
        backup_path = file_path.with_suffix(f'{file_path.suffix}.bak')
        
        # 读取备份文件内容
        with open(backup_path, 'rb') as f:
            binary_content = f.read()
        
        print(f"处理文件: {file_path}")
        
        # 尝试所有可能的编码
        encodings = [
            'utf-8', 'utf-16', 'utf-16-le', 'utf-16-be',
            'gbk', 'gb2312', 'big5', 'latin1',
            'iso-8859-1', 'iso-8859-2', 'windows-1251', 'windows-1252'
        ]
        
        for encoding in encodings:
            try:
                content = binary_content.decode(encoding)
                print(f"\n=== 编码: {encoding} ===")
                print(content[:500])  # 只显示前500个字符
                print("=" * 50)
            except UnicodeDecodeError:
                print(f"编码 {encoding} 解码失败")
                continue
    except Exception as e:
        print(f"处理文件 {file_path} 时出错: {e}")

def main():
    """主函数"""
    # 要检查的文件列表
    files = [
        Path("e:\\Dropbox\\GitHub\\SutWxApp\\docs\\00-项目概览\\01-项目简介.md"),
    ]
    
    for file in files:
        try_all_encodings(file)
        print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()