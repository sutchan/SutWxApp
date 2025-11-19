#!/usr/bin/env node
// 专门修复文件开头异常字符的脚本

const fs = require('fs');
const path = require('path');

// 需要处理的文件扩展名
const extensions = ['.js', '.json', '.wxss', '.wxml', '.php'];

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

// 修复单个文件的开头字符
function fixFileHeader(filePath) {
    // 检查文件扩展名
    const ext = path.extname(filePath).toLowerCase();
    if (!extensions.includes(ext)) {
        return false;
    }

    try {
        // 以二进制方式读取文件
        const buffer = fs.readFileSync(filePath);
        let content = buffer.toString('utf8');

        // 移除文件开头的所有非ASCII字符，直到找到正常的代码开头
        let fixedContent;
        if (ext === '.js' || ext === '.json' || ext === '.wxss') {
            // 寻找正常的JavaScript/JSON/WXSS开头
            const match = content.match(/^[^\x00-\x7F]*(\/\/|\/\*|{|\w|\s|#)/);
            if (match) {
                fixedContent = content.slice(match[1].length - 1);
            } else {
                // 如果没有找到匹配的开头，尝试移除所有异常字符
                fixedContent = content.replace(/^[^\x00-\x7F]+/, '');
            }
        } else if (ext === '.wxml') {
            // 寻找WXML开头
            const match = content.match(/^[^\x00-\x7F]*(<)/);
            if (match) {
                fixedContent = content.slice(match[1].length - 1);
            } else {
                fixedContent = content.replace(/^[^\x00-\x7F]+/, '');
            }
        } else if (ext === '.php') {
            // 寻找PHP开头
            const match = content.match(/^[^\x00-\x7F]*(<\?php|<?)/);
            if (match) {
                fixedContent = content.slice(match[1].length - 1);
            } else {
                fixedContent = content.replace(/^[^\x00-\x7F]+/, '');
            }
        }

        // 如果内容有变化，保存文件
        if (fixedContent !== content) {
            fs.writeFileSync(filePath, fixedContent, { encoding: 'utf8', flag: 'w' });
            console.log(`已修复文件开头: ${filePath}`);
            return true;
        }
        
        return false;
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
        if (fixFileHeader(filePath)) {
            fixed++;
        }
    });
    
    console.log(`\n处理完成: 共检查 ${total} 个文件，修复 ${fixed} 个文件`);
}

if (require.main === module) {
    main();
}
