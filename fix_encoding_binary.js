#!/usr/bin/env node
/**
 * 以二进制模式检测和修复文件编码问题
 */

const fs = require('fs');
const path = require('path');

// 要处理的目录
const targetDir = process.argv[2];

if (!targetDir) {
  console.error('请提供要处理的目录路径');
  process.exit(1);
}

// 要处理的文件扩展名
const extensions = ['.js', '.json', '.wxss', '.wxml'];

/**
 * 修复文件编码
 * @param {string} filePath - 文件路径
 */
function fixFileEncoding(filePath) {
  try {
    // 检查文件扩展名
    const ext = path.extname(filePath);
    if (!extensions.includes(ext)) {
      return;
    }
    
    // 以二进制模式读取文件
    const buffer = fs.readFileSync(filePath);
    
    // 检测并移除BOM
    let content;
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      // UTF-8 BOM
      content = buffer.slice(3).toString('utf8');
      console.log(`移除UTF-8 BOM: ${filePath}`);
    } else if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
      // UTF-16 BE BOM
      content = buffer.slice(2).toString('utf16le').split('').reverse().join('');
      console.log(`移除UTF-16 BE BOM: ${filePath}`);
    } else if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
      // UTF-16 LE BOM
      content = buffer.slice(2).toString('utf16le');
      console.log(`移除UTF-16 LE BOM: ${filePath}`);
    } else {
      // 尝试直接解析为UTF-8
      content = buffer.toString('utf8');
    }
    
    // 修复问题字符
    // 移除文件开头的非ASCII字符
    content = content.replace(/^[^\x00-\x7F]+/, '');
    
    // 修复JSDoc注释开头
    content = content.replace(/^\*\*/, '/**');
    
    // 移除其他问题字符
    content = content.replace(/[\u2595\u20AC\u2640\uFF03\u00BF]/g, '');
    
    // 确保文件以换行符结尾
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }
    
    // 保存文件为UTF-8无BOM格式
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`已修复: ${filePath}`);
  } catch (error) {
    console.error(`处理文件失败 ${filePath}:`, error.message);
  }
}

/**
 * 递归处理目录
 * @param {string} dirPath - 目录路径
 */
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // 跳过某些目录
      if (file === 'node_modules' || file === 'coverage' || file === '.git') {
        continue;
      }
      processDirectory(filePath);
    } else {
      fixFileEncoding(filePath);
    }
  }
}

// 开始处理
console.log(`开始处理目录: ${targetDir}`);
processDirectory(targetDir);
console.log('处理完成');
