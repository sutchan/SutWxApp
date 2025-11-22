import os
import sys
import chardet
import codecs
import argparse
from concurrent.futures import ThreadPoolExecutor, TimeoutError

# 定义目标编码和换行符
TARGET_ENCODING = 'utf-8'
TARGET_LINE_ENDING = '\n'
DEFAULT_IGNORED_DIRS = {"node_modules", ".git", "dist", "build"}

def detect_encoding(filepath):
    """
    检测文件的编码。
    尝试多种编码，并使用 chardet 辅助判断。
    """
    with open(filepath, 'rb') as f:
        raw_data = f.read()

    # 尝试使用 chardet 检测
    detection = chardet.detect(raw_data)
    if detection['encoding'] and detection['confidence'] > 0.8:
        return detection['encoding']

    # 尝试常见编码
    try:
        raw_data.decode('utf-8')
        return 'utf-8'
    except UnicodeDecodeError:
        pass
    try:
        raw_data.decode('utf-8-sig')
        return 'utf-8-sig'
    except UnicodeDecodeError:
        pass
    try:
        raw_data.decode('gb18030')
        return 'gb18030'
    except UnicodeDecodeError:
        pass
    try:
        raw_data.decode('gbk')
        return 'gbk'
    except UnicodeDecodeError:
        pass
    try:
        raw_data.decode('gb2312')
        return 'gb2312'
    except UnicodeDecodeError:
        pass
    try:
        raw_data.decode('latin-1')
        return 'latin-1'
    except UnicodeDecodeError:
        pass

    return None

def fix_file_encoding_and_line_endings(filepath, verify_only=False, force_encoding=None):
    """
    修复文件的编码和换行符。
    如果 verify_only 为 True，则只检测不修改。
    """
    try:
        if force_encoding:
            original_encoding = force_encoding
        else:
            original_encoding = detect_encoding(filepath)
        if not original_encoding:
            return filepath, False, f"无法检测编码"

        with open(filepath, 'rb') as f:
            raw_content = f.read()

        decoded_content = raw_content.decode(original_encoding)

        # 统一换行符
        normalized_content = decoded_content.replace('\r\n', TARGET_LINE_ENDING).replace('\r', TARGET_LINE_ENDING)

        # 检查是否需要修改
        needs_encoding_fix = original_encoding.lower() != TARGET_ENCODING.lower() and original_encoding.lower() != 'utf-8-sig'
        needs_line_ending_fix = normalized_content != decoded_content

        if verify_only:
            if needs_encoding_fix or needs_line_ending_fix:
                return filepath, False, f"需要修复: 原始编码={original_encoding}, 目标编码={TARGET_ENCODING}, 换行符不一致"
            else:
                return filepath, True, f"已符合规范: 编码={original_encoding}, 换行符一致"
        else:
            if needs_encoding_fix or needs_line_ending_fix:
                # 写入新文件，确保 UTF-8 无 BOM
                with codecs.open(filepath, 'w', encoding=TARGET_ENCODING) as f:
                    f.write(normalized_content)
                return filepath, True, f"修复成功: 原始编码={original_encoding}, 目标编码={TARGET_ENCODING}, 换行符已统一"
            else:
                return filepath, True, f"无需修复: 编码={original_encoding}, 换行符一致"

    except Exception as e:
        return filepath, False, f"处理失败: {e}"

def _process_file_target(filepath, verify_only, force_encoding):
    """
    用于多进程处理的包装函数。
    """
    return fix_file_encoding_and_line_endings(filepath, verify_only, force_encoding)

def main():
    parser = argparse.ArgumentParser(description="修复文件编码和换行符。")
    parser.add_argument("path", help="要处理的文件或目录路径。")
    parser.add_argument("--verify-only", action="store_true",
                        help="只验证文件，不进行修改。")
    parser.add_argument("--timeout", type=int, default=30,
                        help="每个文件处理的超时时间（秒）。")
    parser.add_argument("--batch-size", type=int, default=5,
                        help="每次处理的文件批次大小。")
    parser.add_argument("--force-encoding", help="强制指定文件编码，跳过自动检测。")
    parser.add_argument("--ignore-dirs", help="忽略处理的目录，逗号分隔，如: node_modules,.git,dist,build")
    args = parser.parse_args()

    target_path = args.path
    verify_only = args.verify_only
    timeout = args.timeout
    batch_size = args.batch_size
    force_encoding = args.force_encoding
    ignore_dirs_arg = args.ignore_dirs
    ignored_dirs = set()
    if ignore_dirs_arg:
        ignored_dirs = {d.strip() for d in ignore_dirs_arg.split(',') if d.strip()}
    else:
        ignored_dirs = set(DEFAULT_IGNORED_DIRS)

    files_to_process = []
    if os.path.isfile(target_path):
        files_to_process.append(target_path)
    elif os.path.isdir(target_path):
        for root, dirs, files in os.walk(target_path):
            # 过滤忽略目录
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            # 对于包含忽略目录片段的路径也跳过
            skip_root = False
            for ig in ignored_dirs:
                if ig and (os.sep + ig + os.sep) in (root + os.sep):
                    skip_root = True
                    break
            if skip_root:
                continue
            for file in files:
                files_to_process.append(os.path.join(root, file))
    else:
        print(f"错误: 无效的路径 '{target_path}'")
        sys.exit(1)

    total_files = len(files_to_process)
    processed_count = 0
    success_count = 0
    failure_count = 0
    results = []

    print(f"开始处理 {total_files} 个文件...")
    if ignored_dirs:
        print(f"已忽略目录: {', '.join(sorted(ignored_dirs))}")

    with ThreadPoolExecutor() as executor:
        for i in range(0, total_files, batch_size):
            batch_files = files_to_process[i:i + batch_size]
            futures = {executor.submit(_process_file_target, f, verify_only, force_encoding): f for f in batch_files}

            for future in futures:
                filepath = futures[future]
                processed_count += 1
                try:
                    result_filepath, success, message = future.result(timeout=timeout)
                    results.append((result_filepath, success, message))
                    if success:
                        success_count += 1
                    else:
                        failure_count += 1
                except TimeoutError:
                    results.append((filepath, False, f"处理超时 ({timeout}秒)"))
                    failure_count += 1
                except Exception as e:
                    results.append((filepath, False, f"未知错误: {e}"))
                    failure_count += 1
                print(f"[{processed_count}/{total_files}] {filepath}: {message}")

    print("\n--- 处理结果 ---")
    for filepath, success, message in results:
        status = "成功" if success else "失败"
        print(f"[{status}] {filepath}: {message}")

    print(f"\n总文件数: {total_files}")
    print(f"成功处理: {success_count}")
    print(f"失败处理: {failure_count}")

    if verify_only:
        print("\n(验证模式: 未进行任何修改)")

if __name__ == "__main__":
    main()
