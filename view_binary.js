#!/usr/bin/env node
/**
 * 以二进制模式查看文件内容
 */

const fs = require('fs');

// 从命令行参数获取文件路径
const filePath = process.argv[2];

if (!filePath) {
  console.error('请提供要查看的文件路径');
  process.exit(1);
}

try {
  // 以二进制模式读取文件前100个字节
  const buffer = fs.readFileSync(filePath);
  const bytes = buffer.slice(0, 100);
  
  console.log('=== 文件前100个字节的十六进制内容 ===');
  console.log(bytes.toString('hex'));
  
  console.log('\n=== 文件前100个字节的十进制内容 ===');
  console.log(Array.from(bytes).join(' '));
  
  console.log('\n=== 尝试以UTF-8解析 ===');
  try {
    console.log(buffer.toString('utf8').substring(0, 200));
  } catch (error) {
    console.error('UTF-8解析失败:', error.message);
  }
  
  console.log('\n=== 尝试以ASCII解析 ===');
  try {
    console.log(buffer.toString('ascii').substring(0, 200));
  } catch (error) {
    console.error('ASCII解析失败:', error.message);
  }
} catch (error) {
  console.error('读取文件失败:', error.message);
}
