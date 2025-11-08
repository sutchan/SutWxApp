// utils.js - 閫氱敤宸ュ叿鍑芥暟妯″潡

/**
 * 鑺傛祦鍑芥暟
 * 闄愬埗鍑芥暟鍦ㄤ竴瀹氭椂闂村唴鍙兘鎵ц涓€娆★紝閬垮厤棰戠箒璋冪敤褰卞搷鎬ц兘
 * @param {Function} func - 闇€瑕佽妭娴佺殑鍑芥暟
 * @param {number} wait - 绛夊緟鏃堕棿锛堟绉掞級
 * @returns {Function} - 鑺傛祦鍚庣殑鍑芥暟
 */
export const throttle = (func, wait) => {
  let lastCall = 0;
  let timeoutId = null;
  
  return function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    // 濡傛灉璺濈涓婃璋冪敤鐨勬椂闂村凡缁忚秴杩囩瓑寰呮椂闂达紝鐩存帴鎵ц
    if (timeSinceLastCall >= wait) {
      // 娓呴櫎涔嬪墠鍙兘瀛樺湪鐨勫畾鏃跺櫒
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      lastCall = now;
      return func.apply(this, args);
    }
    
    // 濡傛灉宸茬粡鏈夊畾鏃跺櫒锛岀洿鎺ヨ繑鍥?    if (timeoutId) {
      return Promise.resolve();
    }
    
    // 璁剧疆瀹氭椂鍣紝鍦ㄥ墿浣欐椂闂村悗鎵ц
    const remainingWait = wait - timeSinceLastCall;
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        lastCall = Date.now();
        const result = func.apply(this, args);
        resolve(result);
      }, remainingWait);
    });
  };
};

/**
 * 闃叉姈鍑芥暟
 * 鍦ㄤ簨浠惰Е鍙憂绉掑悗鎵嶆墽琛岋紝濡傛灉n绉掑唴鍙堣瑙﹀彂鍒欓噸鏂拌鏃? * @param {Function} func - 闇€瑕侀槻鎶栫殑鍑芥暟
 * @param {number} wait - 绛夊緟鏃堕棿锛堟绉掞級
 * @returns {Function} - 闃叉姈鍚庣殑鍑芥暟
 */
export const debounce = (func, wait) => {
  let timeoutId = null;
  
  return function(...args) {
    // 娓呴櫎涔嬪墠鐨勫畾鏃跺櫒
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        const result = func.apply(this, args);
        resolve(result);
      }, wait);
    });
  };
};

/**
 * 鏍煎紡鍖栨椂闂存埑
 * @param {number} timestamp - 鏃堕棿鎴? * @param {string} format - 鏍煎紡绫诲瀷锛?date', 'time', 'datetime'
 * @returns {string} - 鏍煎紡鍖栧悗鐨勬椂闂村瓧绗︿覆
 */
export const formatTime = (timestamp, format = 'datetime') => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'datetime':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

/**
 * 鏍煎紡鍖栨暟瀛楋紙娣诲姞鍗冨垎浣嶏級
 * @param {number} num - 闇€瑕佹牸寮忓寲鐨勬暟瀛? * @returns {string} - 鏍煎紡鍖栧悗鐨勬暟瀛楀瓧绗︿覆
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 鎴柇鏂囨湰
 * @param {string} text - 鍘熷鏂囨湰
 * @param {number} maxLength - 鏈€澶ч暱搴? * @param {string} suffix - 鐪佺暐鍚庣紑锛岄粯璁?...'
 * @returns {string} - 鎴柇鍚庣殑鏂囨湰
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 娣辨嫹璐濆璞? * @param {Object} obj - 闇€瑕佹嫹璐濈殑瀵硅薄
 * @returns {Object} - 鎷疯礉鍚庣殑鏂板璞? */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const clonedObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
};

/**
 * 鐢熸垚鍞竴ID
 * @returns {string} - 鍞竴ID
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * 妫€鏌ユ槸鍚︿负绌哄璞? * @param {Object} obj - 瑕佹鏌ョ殑瀵硅薄
 * @returns {boolean} - 鏄惁涓虹┖瀵硅薄
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj || {}).length === 0;
};

/**
 * 鏁扮粍鍘婚噸
 * @param {Array} array - 瑕佸幓閲嶇殑鏁扮粍
 * @param {string} key - 鏍规嵁鏌愪釜瀛楁鍘婚噸锛堝彲閫夛級
 * @returns {Array} - 鍘婚噸鍚庣殑鏁扮粍
 */
export const uniqueArray = (array, key) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      if (!item || typeof item !== 'object') return false;
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }
  
  return [...new Set(array)];
};

/**
 * 璁＄畻涓や釜鏃ユ湡涔嬮棿鐨勫ぉ鏁板樊
 * @param {Date|number} date1 - 绗竴涓棩鏈? * @param {Date|number} date2 - 绗簩涓棩鏈? * @returns {number} - 澶╂暟宸? */
export const getDaysDiff = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 鑾峰彇鐩稿鏃堕棿鎻忚堪
 * @param {number|Date} time - 鏃堕棿鎴虫垨鏃ユ湡瀵硅薄
 * @returns {string} - 鐩稿鏃堕棿鎻忚堪
 */
export const getRelativeTime = (time) => {
  const now = Date.now();
  const diff = now - new Date(time).getTime();
  
  if (diff < 0) return '鏈潵';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '鍒氬垰';
  if (minutes < 60) return `${minutes}鍒嗛挓鍓峘;
  if (hours < 24) return `${hours}灏忔椂鍓峘;
  if (days < 30) return `${days}澶╁墠`;
  if (days < 365) return `${Math.floor(days / 30)}涓湀鍓峘;
  return `${Math.floor(days / 365)}骞村墠`;
};

// 瀵煎嚭鎵€鏈夊伐鍏峰嚱鏁?export default {
  throttle,
  debounce,
  formatTime,
  formatNumber,
  truncateText,
  deepClone,
  generateUniqueId,
  isEmptyObject,
  uniqueArray,
  getDaysDiff,
  getRelativeTime
};\n