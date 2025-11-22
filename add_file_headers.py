import os
import datetime
import sys

def add_header_to_file(filepath, version, author="Sut"):
    filename = os.path.basename(filepath)
    today = datetime.date.today().strftime("%Y-%m-%d")

    file_extension = os.path.splitext(filepath)[1]

    header_content = ""
    if file_extension in ['.js', '.wxss']:
        header_content = f"""/*
 * 文件名: {filename}
 * 版本号: {version}
 * 作者: {author}
 * 更新日期: {today}
 */
"""
    elif file_extension == '.wxml':
        header_content = f"""<!--
 * 文件名: {filename}
 * 版本号: {version}
 * 作者: {author}
 * 更新日期: {today}
-->
"""
    elif file_extension == '.json':
        # JSON 不支持注释，跳过
        print(f"跳过文件 {filepath}，因为 JSON 文件不支持注释。", file=sys.stderr)
        return
    else:
        print(f"跳过文件 {filepath}，因为不支持的文件类型。", file=sys.stderr)
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否已经存在文件头注释，避免重复添加
        if header_content.strip() in content:
            print(f"文件 {filepath} 已包含文件头注释，跳过。", file=sys.stderr)
            return

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(header_content + content)
        print(f"成功为文件 {filepath} 添加文件头注释。")
    except Exception as e:
        print(f"处理文件 {filepath} 时发生错误: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python add_file_headers.py <文件路径1> <文件路径2> ...", file=sys.stderr)
        sys.exit(1)

    version = "1.0.17"  # 从 package.json 获取的版本号
    for filepath in sys.argv[1:]:
        add_header_to_file(filepath, version)