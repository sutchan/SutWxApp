#!/usr/bin/env node
/**
 * 读取文件内容的工具
 */

const fs = require('fs');

// 从命令行参数获取文件路径
const filePath = process.argv[2];

if (!filePath) {
  console.error('请提供要读取的文件路径');
  process.exit(1);
}

// 读取文件内容
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err);
    return;
  }
  
  console.log('=== 文件内容（前200个字符）===');
  console.log(data.substring(0, 200));
  
  console.log('\n=== 文件长度 ===');
  console.log(`字符数: ${data.length}`);
  console.log(`字节数: ${Buffer.byteLength(data)}`);
});
