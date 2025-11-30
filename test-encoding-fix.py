#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件名: test-encoding-fix.py
版本号: 1.0.0
更新日期: 2025-11-30
描述: 测试编码修复逻辑
功能: 验证UTF-8被错误解码为GBK的修复逻辑
"""

# 测试乱码修复逻辑
# 正确文本：文件名:
# 乱码文本：鏂囦欢鍚?

# 1. 正确文本
correct_text = '文件名:'
print(f"正确文本: {correct_text}")

# 2. 用UTF-8编码正确文本，得到UTF-8字节序列
utf8_bytes = correct_text.encode('utf-8')
print(f"UTF-8字节序列: {utf8_bytes}")

# 3. 错误地用GBK解码UTF-8字节序列，得到乱码文本
garbled_text = utf8_bytes.decode('gbk')
print(f"用GBK解码UTF-8字节序列得到的乱码文本: {garbled_text}")

# 4. 现在修复乱码文本：将乱码文本用GBK编码，得到原始的UTF-8字节序列
recovered_utf8_bytes = garbled_text.encode('gbk')
print(f"将乱码文本用GBK编码得到的字节序列: {recovered_utf8_bytes}")

# 5. 用UTF-8解码恢复的字节序列，得到正确文本
fixed_text = recovered_utf8_bytes.decode('utf-8')
print(f"用UTF-8解码恢复的字节序列得到的正确文本: {fixed_text}")

# 6. 验证修复是否成功
print(f"修复成功: {fixed_text == correct_text}")

# 7. 测试另一个乱码文本
# 乱码文本：鐗堟湰鍙?
# 正确文本：版本号:
print("\n--- 测试另一个乱码文本 ---")
garbled_text2 = '鐗堟湰鍙?'
print(f"乱码文本: {garbled_text2}")
recovered_utf8_bytes2 = garbled_text2.encode('gbk')
fixed_text2 = recovered_utf8_bytes2.decode('utf-8')
print(f"修复后的文本: {fixed_text2}")
