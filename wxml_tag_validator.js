#!/usr/bin/env node
/**
 * WXML 标签闭合校验与自动修复工具
 * 用途：递归检查项目中的 .wxml 文件是否存在标签未闭合、闭合不匹配等问题；可在安全场景下自动补齐简单缺失的闭合标签
 * 使用：
 *   校验模式：node wxml_tag_validator.js --check [目录]
 *   修复模式：node wxml_tag_validator.js --fix [目录]
 * 说明：
 *   - 跳过常见目录：node_modules、coverage、.git
 *   - 仅处理 .wxml 文件
 *   - 自闭合标签（<tag />）不入栈
 */

const fs = require('fs');
const path = require('path');

/**
 * 递归遍历目录并返回所有 .wxml 文件
 * @param {string} dir 目标目录
 * @returns {string[]} 文件路径列表
 */
function listWxmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'coverage' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listWxmlFiles(full));
    } else if (entry.isFile() && full.toLowerCase().endsWith('.wxml')) {
      results.push(full);
    }
  }
  return results;
}

/**
 * 去除注释并标准化内容，以便解析标签
 * @param {string} content 原始文本
 * @returns {string} 清理后的文本
 */
function normalizeContent(content) {
  // 去除注释
  let text = content.replace(/<!--([\s\S]*?)-->/g, '');
  // 统一换行符为 LF（不写回，这里仅用于解析）
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return text;
}

/**
 * 解析 WXML 标签并返回问题列表
 * @param {string} content 文件文本内容
 * @returns {{issues: string[], missingClosings: string[]}} 校验结果
 */
function analyzeTags(content) {
  const text = normalizeContent(content);
  const tagPattern = /<\/?([a-zA-Z0-9-]+)([^>]*)>/g;
  const selfClosingPattern = /\/(\s*)>$/;
  const stack = [];
  const issues = [];
  let m;
  while ((m = tagPattern.exec(text)) !== null) {
    const full = m[0];
    const name = m[1];
    const isClosing = full.startsWith(`</`);
    const isSelfClosing = selfClosingPattern.test(full);
    if (isClosing) {
      if (stack.length === 0) {
        issues.push(`发现多余闭合标签 </${name}>`);
        continue;
      }
      const top = stack[stack.length - 1];
      if (top !== name) {
        issues.push(`闭合不匹配：期望 </${top}> 实际 </${name}>`);
        // 尝试容错：在栈内寻找匹配项并弹出其上方所有标签
        const idx = stack.lastIndexOf(name);
        if (idx !== -1) {
          const popped = stack.splice(idx);
          if (popped.length > 1) {
            issues.push(`已纠正嵌套顺序异常：${popped.join(' > ')}`);
          } else {
            stack.pop();
          }
        } else {
          // 无法纠正，继续
        }
      } else {
        stack.pop();
      }
    } else if (!isSelfClosing) {
      stack.push(name);
    }
  }

  const missingClosings = [...stack];
  if (missingClosings.length > 0) {
    issues.push(`存在未闭合标签：${missingClosings.join(', ')}`);
  }
  return { issues, missingClosings };
}

/**
 * 在文本末尾补齐缺失的闭合标签（仅简单安全场景）
 * @param {string} content 原始文本
 * @param {string[]} missingClosings 未闭合标签栈（从外到内）
 * @returns {string} 修复后的文本
 */
function appendMissingClosings(content, missingClosings) {
  if (!missingClosings || missingClosings.length === 0) return content;
  const fix = missingClosings
    .slice()
    .reverse()
    .map(name => `</${name}>`)
    .join('\n');
  const hasTrailingNewline = /\n$/.test(content);
  const separator = hasTrailingNewline ? '' : '\n';
  return content + separator + fix + '\n';
}

/**
 * 处理单个 WXML 文件（校验或修复）
 * @param {string} filePath 文件路径
 * @param {boolean} fixMode 是否修复模式
 * @returns {{fixed:boolean, issues:string[]}} 处理结果
 */
function processWxmlFile(filePath, fixMode) {
  const original = fs.readFileSync(filePath, 'utf8');
  const { issues, missingClosings } = analyzeTags(original);
  if (issues.length === 0) {
    return { fixed: false, issues: [] };
  }
  if (fixMode && missingClosings.length > 0) {
    const updated = appendMissingClosings(original, missingClosings);
    if (updated !== original) {
      fs.writeFileSync(filePath, updated, 'utf8');
      return { fixed: true, issues };
    }
  }
  return { fixed: false, issues };
}

/**
 * 主入口：根据参数执行校验或修复
 */
function main() {
  const args = process.argv.slice(2);
  const fixMode = args.includes('--fix');
  const checkMode = args.includes('--check') || !fixMode;
  const targetIdx = args.findIndex(a => !a.startsWith('--'));
  const target = targetIdx !== -1 ? args[targetIdx] : '.';

  const files = listWxmlFiles(target);
  let problemFiles = 0;
  let fixedFiles = 0;

  for (const fp of files) {
    const { fixed, issues } = processWxmlFile(fp, fixMode);
    if (issues.length > 0) {
      problemFiles++;
      console.log(`\n[${checkMode ? '检查' : '修复'}] ${fp}`);
      for (const msg of issues) console.log(`- ${msg}`);
      if (fixed) {
        fixedFiles++;
        console.log(`=> 已补齐末尾缺失闭合标签`);
      }
    }
  }

  console.log(`\n统计：发现问题文件 ${problemFiles} 个，修复 ${fixedFiles} 个`);
}

if (require.main === module) {
  main();
}
