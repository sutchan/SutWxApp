/**
 * 文件名: po2json.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 描述: PO文件转JSON工具，用于将PO翻译文件转换为JSON格式
 */

/**
 * 解析PO文件内容
 * @param {string} poContent - PO文件内容
 * @returns {Object} 解析后的翻译对象
 */
function parsePoFile(poContent) {
  const translations = {};
  const lines = poContent.split('\n');
  let currentMsgid = null;
  let currentMsgstr = '';
  let inMsgstr = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过注释行和空行
    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      continue;
    }

    // 处理msgid行
    if (trimmedLine.startsWith('msgid ')) {
      // 如果当前已有msgid，保存之前的翻译
      if (currentMsgid !== null) {
        translations[currentMsgid] = currentMsgstr;
      }
      // 提取新的msgid
      currentMsgid = trimmedLine.substring(6).replace(/^"|"$/g, '');
      currentMsgstr = '';
      inMsgstr = false;
    }
    // 处理msgstr行
    else if (trimmedLine.startsWith('msgstr ')) {
      currentMsgstr = trimmedLine.substring(7).replace(/^"|"$/g, '');
      inMsgstr = true;
    }
    // 处理多行msgstr
    else if (inMsgstr && (trimmedLine.startsWith('"') && trimmedLine.endsWith('"'))) {
      currentMsgstr += trimmedLine.replace(/^"|"$/g, '');
    }
  }

  // 保存最后一个翻译
  if (currentMsgid !== null && currentMsgid !== '') {
    translations[currentMsgid] = currentMsgstr;
  }

  return translations;
}

/**
 * 将翻译对象转换为JSON字符串
 * @param {Object} translations - 翻译对象
 * @returns {string} 格式化的JSON字符串
 */
function toJsonString(translations) {
  // 按key排序翻译对象
  const sortedTranslations = {};
  Object.keys(translations).sort().forEach(key => {
    sortedTranslations[key] = translations[key];
  });
  
  return JSON.stringify(sortedTranslations, null, 2);
}

/**
 * 生成JSON文件头部注释
 * @param {string} filename - 文件名
 * @param {string} language - 语言代码
 * @returns {string} 生成的头部注释
 */
function generateHeaderComment(filename, language) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  return `/**
 * 文件名 ${filename}
 * 版本号 1.0.1
 * 更新日期: ${dateStr}
 * 描述: ${filename} JSON 配置文件 - ${language}语言
 */`;
}

/**
 * 将PO文件转换为JSON文件
 * @param {string} poContent - PO文件内容
 * @param {string} filename - 输出文件名
 * @param {string} language - 语言代码
 * @returns {string} 完整的JSON文件内容
 */
function convertPoToJson(poContent, filename, language) {
  const header = generateHeaderComment(filename, language);
  const translations = parsePoFile(poContent);
  const jsonContent = toJsonString(translations);
  
  return `${header}\n${jsonContent}`;
}

// 导出模块
module.exports = {
  parsePoFile,
  toJsonString,
  generateHeaderComment,
  convertPoToJson
};
