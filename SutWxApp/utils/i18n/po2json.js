/**
 * 鏂囦欢鍚? po2json.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-24
 * PO閺傚洣娆㈡潪顒佸床娑撶瘮SON瀹搞儱鍙? * 閻劋绨亸?po缂堟槒鐦ч弬鍥︽鏉烆剚宕叉稉绡擲ON閺嶇厧绱￠敍宀€鈥樻穱婵堢倳鐠囨垵鎮撳? */

/**
 * 鐟欙絾鐎絇O閺傚洣娆㈤崘鍛啇
 * @param {string} poContent - PO閺傚洣娆㈤崘鍛啇
 * @returns {Object} 缂堟槒鐦ч柨顔尖偓鐓庮嚠鐎电钖? */
function parsePoFile(poContent) {
  const translations = {};
  const lines = poContent.split('\n');
  let currentMsgid = null;
  let currentMsgstr = '';
  let inMsgstr = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 鐠哄疇绻冨▔銊╁櫞閸滃瞼鈹栫悰?    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      continue;
    }

    // 閸栧綊鍘sgid鐞?    if (trimmedLine.startsWith('msgid ')) {
      // 婵″倹鐏夊鑼病閺堝〉sgid閿涘奔绻氱€涙ü绠ｉ崜宥囨畱缂堟槒鐦?      if (currentMsgid !== null) {
        translations[currentMsgid] = currentMsgstr;
      }
      // 閹绘劕褰囬弬鎵畱msgid
      currentMsgid = trimmedLine.substring(6).replace(/^"|"$/g, '');
      currentMsgstr = '';
      inMsgstr = false;
    }
    // 閸栧綊鍘sgstr鐞?    else if (trimmedLine.startsWith('msgstr ')) {
      currentMsgstr = trimmedLine.substring(7).replace(/^"|"$/g, '');
      inMsgstr = true;
    }
    // 婢跺嫮鎮婃径姘愁攽鐎涙顑佹稉?    else if (inMsgstr && (trimmedLine.startsWith('"') && trimmedLine.endsWith('"'))) {
      currentMsgstr += trimmedLine.replace(/^"|"$/g, '');
    }
  }

  // 娣囨繂鐡ㄩ張鈧崥搴濈娑擃亞鐐曠拠?  if (currentMsgid !== null && currentMsgid !== '') {
    translations[currentMsgid] = currentMsgstr;
  }

  return translations;
}

/**
 * 鐏忓棛鐐曠拠鎴濐嚠鐠灺ゆ祮閹诡澀璐烰SON鐎涙顑佹稉? * @param {Object} translations - 缂堟槒鐦х€电钖? * @returns {string} 閺嶇厧绱￠崠鏍畱JSON鐎涙顑佹稉? */
function toJsonString(translations) {
  // 閹稿鍙庨柨顔兼倳閹烘帒绨敍灞肩箽閹镐浇绶崙杞扮閼峰瓨鈧?  const sortedTranslations = {};
  Object.keys(translations).sort().forEach(key => {
    sortedTranslations[key] = translations[key];
  });
  
  return JSON.stringify(sortedTranslations, null, 2);
}

/**
 * 閻㈢喐鍨氶弬鍥︽婢舵挳鍎村▔銊╁櫞
 * @param {string} filename - 鏂囦欢鍚? * @param {string} language - 鐠囶叀鈻堟禒锝囩垳
 * @returns {string} 閺傚洣娆㈡径鎾劥濞夈劑鍣? */
function generateHeaderComment(filename, language) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  return `/**
 * 鏂囦欢鍚? ${filename}
 * 鐗堟湰鍙? 1.0.1
 * 鏇存柊鏃ユ湡: ${dateStr}
 * 鎻忚堪: ${filename} JSON 閰嶇疆鏂囦欢 - 閼奉亜濮╅悽鐔稿灇閿涘矁顕崟鎸庡閸斻劋鎱ㄩ弨? */`;
}

/**
 * 鏉烆剚宕睵O閺傚洣娆㈡稉绡擲ON
 * @param {string} poContent - PO閺傚洣娆㈤崘鍛啇
 * @param {string} filename - 鏉堟挸鍤枃浠跺悕: * @param {string} language - 鐠囶叀鈻堟禒锝囩垳
 * @returns {string} 鐎瑰本鏆ｉ惃鍑ON閺傚洣娆㈤崘鍛啇
 */
function convertPoToJson(poContent, filename, language) {
  const header = generateHeaderComment(filename, language);
  const translations = parsePoFile(poContent);
  const jsonContent = toJsonString(translations);
  
  return `${header}\n${jsonContent}`;
}

// 鐎电厧鍤崙鑺ユ殶閿涘奔绶甸崗鏈电铂濡€虫健娴ｈ法鏁?module.exports = {
  parsePoFile,
  toJsonString,
  generateHeaderComment,
  convertPoToJson
};
