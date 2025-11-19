#!/usr/bin/env node
// 修复文件编码和异常字符的脚本

const fs = require('fs');
const path = require('path');

// 需要处理的文件扩展名
const extensions = ['.js', '.json', '.wxss', '.wxml', '.php', '.md', '.pot', '.po'];

// 遍历目录下所有文件
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDir(fullPath, callback);
        } else {
            callback(fullPath);
        }
    });
}

// 修复单个文件
function fixFile(filePath) {
    // 检查文件扩展名
    const ext = path.extname(filePath).toLowerCase();
    if (!extensions.includes(ext)) {
        return false;
    }

    try {
        // 以二进制方式读取文件
        const buffer = fs.readFileSync(filePath);
        
        // 检查并移除UTF-8 BOM (EF BB BF)
        let content;
        if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            content = buffer.slice(3).toString('utf8');
        } else {
            // 尝试多种编码读取
            try {
                content = buffer.toString('utf8');
            } catch (e) {
                try {
                    content = buffer.toString('gbk');
                } catch (e) {
                    try {
                        content = buffer.toString('latin1');
                    } catch (e) {
                        console.error(`无法读取文件: ${filePath}`);
                        return false;
                    }
                }
            }
        }

        // 移除所有非ASCII字符和控制字符，只保留可打印字符和基本控制字符
        let cleanedContent = content
            // 移除零宽度空格和其他不可见字符
            .replace(/[\u200B-\u200F\uFEFF]/g, '')
            // 移除异常的中文字符和奇怪符号
            .replace(/[\uE000-\uF8FF]/g, '')
            // 确保换行符统一为LF
            .replace(/\r\n/g, '\n')
            // 移除文件末尾的多余空行
            .trim() + '\n';

        // 保存为UTF-8无BOM格式
        fs.writeFileSync(filePath, cleanedContent, { encoding: 'utf8', flag: 'w' });
        console.log(`已修复: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`修复失败: ${filePath}, 错误: ${error.message}`);
        return false;
    }
}

// 主函数
function main() {
    const targetDir = process.argv[2] || '.';
    console.log(`开始处理目录: ${targetDir}`);
    
    let total = 0;
    let fixed = 0;
    
    walkDir(targetDir, filePath => {
        total++;
        if (fixFile(filePath)) {
            fixed++;
        }
    });
    
    console.log(`\n处理完成: 共检查 ${total} 个文件，修复 ${fixed} 个文件`);
}

if (require.main === module) {
    main();
}
