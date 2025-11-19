#!/usr/bin/env node
/**
 * 强大的文件编码修复工具
 * 专门处理文件开头的异常字符，确保文件以UTF-8无BOM格式保存
 */

const fs = require('fs');
const path = require('path');

// 需要处理的文件扩展名
const FILE_EXTENSIONS = ['.js', '.json', '.wxss', '.wxml', '.php', '.md', '.pot', '.po'];

/**
 * 修复单个文件的编码问题
 * @param {string} filePath - 文件路径
 */
function fixFile(filePath) {
  try {
    // 以二进制模式读取文件
    const buffer = fs.readFileSync(filePath);
    
    // 检测并移除文件开头的异常字节
    let startIndex = 0;
    
    // 跳过常见的BOM标记
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      startIndex = 3;
    } 
    // 检测并跳过多余的非ASCII字符
    else {
      // 寻找第一个有效的ASCII字符（通常是'/'、'*'、'a-z'、'A-Z'等）
      while (startIndex < buffer.length) {
        const byte = buffer[startIndex];
        // 允许的开头字符范围：ASCII字母、数字、注释符号、空格、换行等
        if ((byte >= 0x20 && byte <= 0x7E) || byte === 0x0A || byte === 0x0D) {
          break;
        }
        startIndex++;
      }
    }
    
    // 提取有效内容
    const content = buffer.slice(startIndex).toString('utf8');
    
    // 移除所有控制字符（除了换行符和制表符）
    const cleanedContent = content.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // 统一换行符为LF
    const normalizedContent = cleanedContent.replace(/\r\n/g, '\n');
    
    // 以UTF-8无BOM格式写入文件
    fs.writeFileSync(filePath, normalizedContent, 'utf8');
    
    console.log(`✓ 修复文件: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ 修复文件失败: ${filePath}`);
    console.error(`  错误信息: ${error.message}`);
    return false;
  }
}

/**
 * 递归处理目录中的所有文件
 * @param {string} dirPath - 目录路径
 */
function processDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        // 递归处理子目录
        processDirectory(fullPath);
      } else if (file.isFile()) {
        // 检查文件扩展名
        const ext = path.extname(file.name).toLowerCase();
        if (FILE_EXTENSIONS.includes(ext)) {
          fixFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`✗ 处理目录失败: ${dirPath}`);
    console.error(`  错误信息: ${error.message}`);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('=== 文件编码修复工具 ===');
  console.log('正在处理文件...\n');
  
  // 获取目标目录
  const targetDir = process.argv[2] || process.cwd();
  
  if (!fs.existsSync(targetDir)) {
    console.error(`错误: 目录 ${targetDir} 不存在`);
    process.exit(1);
  }
  
  console.log(`处理目录: ${targetDir}`);
  console.log('=======================\n');
  
  // 开始处理
  processDirectory(targetDir);
  
  console.log('\n=== 处理完成 ===');
}

// 执行主函数
if (require.main === module) {
  main();
}
