#!/usr/bin/env node
/**
 * 修复只有单个"?"字符的文件
 */

const fs = require('fs');
const path = require('path');

// 要处理的目录
const targetDir = process.argv[2];

if (!targetDir) {
  console.error('请提供要处理的目录路径');
  process.exit(1);
}

/**
 * 获取文件的默认内容
 * @param {string} ext - 文件扩展名
 * @returns {string} 默认内容
 */
function getDefaultContent(ext) {
  switch (ext) {
    case '.js':
      return '/**\n * 默认模块文件\n */\n\nmodule.exports = {};\n';
    case '.json':
      return '{}\n';
    case '.wxss':
      return '/* 默认样式文件 */\n';
    case '.wxml':
      return '<!-- 默认页面模板 -->\n';
    default:
      return '';
  }
}

/**
 * 修复单个文件
 * @param {string} filePath - 文件路径
 */
function fixFile(filePath) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否只有单个"?"字符
    if (content.trim() === '?') {
      // 获取文件扩展名
      const ext = path.extname(filePath);
      
      // 获取默认内容
      const defaultContent = getDefaultContent(ext);
      
      // 写入默认内容
      fs.writeFileSync(filePath, defaultContent, 'utf8');
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
      fixFile(filePath);
    }
  }
}

// 开始处理
console.log(`开始处理目录: ${targetDir}`);
processDirectory(targetDir);
console.log('处理完成');
