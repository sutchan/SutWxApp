/**
 * 文件名: po2json.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * PO鏂囦欢杞崲涓篔SON宸ュ叿
 * 鐢ㄤ簬灏?po缈昏瘧鏂囦欢杞崲涓篔SON鏍煎紡锛岀‘淇濈炕璇戝悓姝? */

/**
 * 瑙ｆ瀽PO鏂囦欢鍐呭
 * @param {string} poContent - PO鏂囦欢鍐呭
 * @returns {Object} 缈昏瘧閿€煎瀵硅薄
 */
function parsePoFile(poContent) {
  const translations = {};
  const lines = poContent.split('\n');
  let currentMsgid = null;
  let currentMsgstr = '';
  let inMsgstr = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 璺宠繃娉ㄩ噴鍜岀┖琛?    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      continue;
    }

    // 鍖归厤msgid琛?    if (trimmedLine.startsWith('msgid ')) {
      // 濡傛灉宸茬粡鏈塵sgid锛屼繚瀛樹箣鍓嶇殑缈昏瘧
      if (currentMsgid !== null) {
        translations[currentMsgid] = currentMsgstr;
      }
      // 鎻愬彇鏂扮殑msgid
      currentMsgid = trimmedLine.substring(6).replace(/^"|"$/g, '');
      currentMsgstr = '';
      inMsgstr = false;
    }
    // 鍖归厤msgstr琛?    else if (trimmedLine.startsWith('msgstr ')) {
      currentMsgstr = trimmedLine.substring(7).replace(/^"|"$/g, '');
      inMsgstr = true;
    }
    // 澶勭悊澶氳瀛楃涓?    else if (inMsgstr && (trimmedLine.startsWith('"') && trimmedLine.endsWith('"'))) {
      currentMsgstr += trimmedLine.replace(/^"|"$/g, '');
    }
  }

  // 淇濆瓨鏈€鍚庝竴涓炕璇?  if (currentMsgid !== null && currentMsgid !== '') {
    translations[currentMsgid] = currentMsgstr;
  }

  return translations;
}

/**
 * 灏嗙炕璇戝璞¤浆鎹负JSON瀛楃涓? * @param {Object} translations - 缈昏瘧瀵硅薄
 * @returns {string} 鏍煎紡鍖栫殑JSON瀛楃涓? */
function toJsonString(translations) {
  // 鎸夌収閿悕鎺掑簭锛屼繚鎸佽緭鍑轰竴鑷存€?  const sortedTranslations = {};
  Object.keys(translations).sort().forEach(key => {
    sortedTranslations[key] = translations[key];
  });
  
  return JSON.stringify(sortedTranslations, null, 2);
}

/**
 * 鐢熸垚鏂囦欢澶撮儴娉ㄩ噴
 * @param {string} filename - 文件名: * @param {string} language - 璇█浠ｇ爜
 * @returns {string} 鏂囦欢澶撮儴娉ㄩ噴
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
 * 描述: ${filename} JSON 配置文件 - 鑷姩鐢熸垚锛岃鍕挎墜鍔ㄤ慨鏀? */`;
}

/**
 * 杞崲PO鏂囦欢涓篔SON
 * @param {string} poContent - PO鏂囦欢鍐呭
 * @param {string} filename - 杈撳嚭文件名: * @param {string} language - 璇█浠ｇ爜
 * @returns {string} 瀹屾暣鐨凧SON鏂囦欢鍐呭
 */
function convertPoToJson(poContent, filename, language) {
  const header = generateHeaderComment(filename, language);
  const translations = parsePoFile(poContent);
  const jsonContent = toJsonString(translations);
  
  return `${header}\n${jsonContent}`;
}

// 瀵煎嚭鍑芥暟锛屼緵鍏朵粬妯″潡浣跨敤
module.exports = {
  parsePoFile,
  toJsonString,
  generateHeaderComment,
  convertPoToJson
};
