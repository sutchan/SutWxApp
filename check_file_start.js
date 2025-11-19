#!/usr/bin/env node
/**
 * 查看文件开头内容的工具
 */

const fs = require('fs');
const path = require('path');

// 要检查的文件路径
const filePath = 'e:\\Dropbox\\GitHub\\SutWxApp\\SutWxApp\\utils\\user-service.js';

// 以二进制模式读取文件前100个字节
const buffer = fs.readFileSync(filePath);

console.log('=== 文件开头的十六进制内容 ===');
for (let i = 0; i < Math.min(100, buffer.length); i++) {
  const hex = buffer[i].toString(16).padStart(2, '0');
  const char = buffer[i] >= 32 && buffer[i] <= 126 ? String.fromCharCode(buffer[i]) : '.';
  process.stdout.write(`${hex}(${char}) `);
  
  // 每16个字节换行
  if ((i + 1) % 16 === 0) {
    console.log();
  }
}
console.log();

// 尝试以不同编码读取
console.log('\n=== 以UTF-8编码读取 ===');
try {
  const content = buffer.toString('utf8');
  console.log(content.substring(0, 200));
} catch (error) {
  console.error('UTF-8解码失败:', error.message);
}

console.log('\n=== 以GBK编码读取 ===');
try {
  const content = buffer.toString('gbk');
  console.log(content.substring(0, 200));
} catch (error) {
  console.error('GBK解码失败:', error.message);
}
