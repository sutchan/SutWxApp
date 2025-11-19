#!/usr/bin/env node
/**
 * 修复空文件或文件开头只有空白字符的问题
 */

const fs = require('fs');
const path = require('path');

// 需要处理的JavaScript文件扩展名
const JS_EXTENSIONS = ['.js', '.json'];

/**
 * 修复单个JavaScript文件
 * @param {string} filePath - 文件路径
 */
function fixJavaScriptFile(filePath) {
  try {
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 移除开头的空白字符
    content = content.trimStart();
    
    // 检查文件是否为空
    if (content === '') {
      // 根据文件类型添加默认内容
      if (filePath.endsWith('.json')) {
        content = '{}';
      } else {
        content = '// 空文件';
      }
      console.log(`✓ 修复空文件: ${filePath}`);
    }
    
    // 确保文件以换行符结尾
    if (!content.endsWith('\n')) {
      content += '\n';
    }
    
    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
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
        if (JS_EXTENSIONS.includes(ext)) {
          fixJavaScriptFile(fullPath);
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
  console.log('=== 修复空文件或文件开头空白字符 ===');
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
