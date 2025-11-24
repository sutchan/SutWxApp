/**
 * 文件名: po2json.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * PO文件转换为JSON工具
 * 用于将.po翻译文件转换为JSON格式，确保翻译同步
 */

/**
 * 解析PO文件内容
 * @param {string} poContent - PO文件内容
 * @returns {Object} 翻译键值对对象
 */
function parsePoFile(poContent) {
  const translations = {};
  const lines = poContent.split('\n');
  let currentMsgid = null;
  let currentMsgstr = '';
  let inMsgstr = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过注释和空行
    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      continue;
    }

    // 匹配msgid行
    if (trimmedLine.startsWith('msgid ')) {
      // 如果已经有msgid，保存之前的翻译
      if (currentMsgid !== null) {
        translations[currentMsgid] = currentMsgstr;
      }
      // 提取新的msgid
      currentMsgid = trimmedLine.substring(6).replace(/^"|"$/g, '');
      currentMsgstr = '';
      inMsgstr = false;
    }
    // 匹配msgstr行
    else if (trimmedLine.startsWith('msgstr ')) {
      currentMsgstr = trimmedLine.substring(7).replace(/^"|"$/g, '');
      inMsgstr = true;
    }
    // 处理多行字符串
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
  // 按照键名排序，保持输出一致性
  const sortedTranslations = {};
  Object.keys(translations).sort().forEach(key => {
    sortedTranslations[key] = translations[key];
  });
  
  return JSON.stringify(sortedTranslations, null, 2);
}

/**
 * 生成文件头部注释
 * @param {string} filename - 文件名
 * @param {string} language - 语言代码
 * @returns {string} 文件头部注释
 */
function generateHeaderComment(filename, language) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  return `/**
 * 文件名: ${filename}
 * 版本号: 1.0.1
 * 更新日期: ${dateStr}
 * 描述: ${filename} JSON 配置文件 - 自动生成，请勿手动修改
 */`;
}

/**
 * 转换PO文件为JSON
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

// 导出函数，供其他模块使用
module.exports = {
  parsePoFile,
  toJsonString,
  generateHeaderComment,
  convertPoToJson
};
