#!/usr/bin/env node
/**
 * 检测和修复文件中的问题字符
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

// 问题字符映射
const problemChars = {
  '?': '', // 未知字符
  '**': '/**', // JSDoc注释开始
  '': '', // 欧元符号
  '': '', // 竖线变体
  '': '#', // 全角#
  '': '' // 女性符号
};

/**
 * 修复文件内容
 * @param {string} content - 文件内容
 * @returns {string} 修复后的文件内容
 */
function fixContent(content) {
  let fixedContent = content;
  
  // 移除文件开头的非ASCII字符
  fixedContent = fixedContent.replace(/^[^\x00-\x7F]+/, '');
  
  // 修复问题字符
  for (const [char, replacement] of Object.entries(problemChars)) {
    fixedContent = fixedContent.replace(new RegExp(char, 'g'), replacement);
  }
  
  // 移除行首和行尾的空白字符
  fixedContent = fixedContent.split('\n')
    .map(line => line.trimEnd())
    .join('\n');
  
  // 确保文件以换行符结尾
  if (fixedContent && !fixedContent.endsWith('\n')) {
    fixedContent += '\n';
  }
  
  return fixedContent;
}

/**
 * 处理单个文件
 * @param {string} filePath - 文件路径
 */
function processFile(filePath) {
  try {
    // 检查文件扩展名
    const ext = path.extname(filePath);
    if (!extensions.includes(ext)) {
      return;
    }
    
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 修复内容
    const fixedContent = fixContent(content);
    
    // 如果内容有变化，保存文件
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`已修复: ${filePath}`);
    }
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
      processFile(filePath);
    }
  }
}

// 开始处理
console.log(`开始处理目录: ${targetDir}`);
processDirectory(targetDir);
console.log('处理完成');
