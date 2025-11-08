// 鍏ㄥ眬宸ュ叿绫?// 鎻愪緵灏忕▼搴忎腑甯哥敤鐨勫伐鍏锋柟娉?
/**
 * 鏄剧ず鎻愮ず淇℃伅
 * @param {string} title - 鎻愮ず鍐呭
 * @param {object} options - 閫夐」
 * @param {string} options.icon - 鍥炬爣绫诲瀷锛屽彲閫?none'|'success'|'loading'|'error'
 * @param {number} options.duration - 鎻愮ず鏃堕棿锛岄粯璁?000ms
 * @param {boolean} options.mask - 鏄惁鏄剧ず閫忔槑钂欏眰锛岄粯璁alse
 */
export function showToast(title, options = {}) {
  const {
    icon = 'none',
    duration = 2000,
    mask = false
  } = options;
  
  wx.showToast({
    title,
    icon,
    duration,
    mask
  });
}

/**
 * 鏄剧ず鍔犺浇鎻愮ず
 * @param {string} title - 鎻愮ず鍐呭锛岄粯璁?鍔犺浇涓?
 * @param {boolean} mask - 鏄惁鏄剧ず閫忔槑钂欏眰锛岄粯璁rue
 */
export function showLoading(title = '鍔犺浇涓?, mask = true) {
  wx.showLoading({
    title,
    mask
  });
}

/**
 * 闅愯棌鍔犺浇鎻愮ず
 */
export function hideLoading() {
  wx.hideLoading();
}

/**
 * 鏄剧ず纭瀵硅瘽妗? * @param {string} title - 鏍囬
 * @param {string} content - 鍐呭
 * @param {object} options - 閫夐」
 * @param {Function} options.success - 纭鍥炶皟
 * @param {Function} options.fail - 澶辫触鍥炶皟
 * @param {Function} options.complete - 瀹屾垚鍥炶皟
 * @returns {Promise} 杩斿洖Promise瀵硅薄
 */
export function showConfirm(title, content, options = {}) {
  const { success, fail, complete } = options;
  
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        if (success) success(res);
        if (res.confirm) {
          resolve(res);
        } else {
          reject(new Error('鐢ㄦ埛鍙栨秷鎿嶄綔'));
        }
      },
      fail: (error) => {
        if (fail) fail(error);
        reject(error);
      },
      complete: (res) => {
        if (complete) complete(res);
      }
    });
  });
}

/**
 * 鏈湴瀛樺偍 - 瀛樻暟鎹? * @param {string} key - 瀛樺偍閿悕
 * @param {*} value - 瀛樺偍鍊? * @returns {boolean} 鏄惁瀛樺偍鎴愬姛
 */
export function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error('瀛樺偍鏁版嵁澶辫触:', e);
    return false;
  }
}

/**
 * 鏈湴瀛樺偍 - 鍙栨暟鎹? * @param {string} key - 瀛樺偍閿悕
 * @returns {*} 瀛樺偍鐨勫€? */
export function getStorage(key) {
  try {
    return wx.getStorageSync(key);
  } catch (e) {
    console.error('鑾峰彇鏁版嵁澶辫触:', e);
    return null;
  }
}

/**
 * 鏈湴瀛樺偍 - 鍒犻櫎鏁版嵁
 * @param {string} key - 瀛樺偍閿悕
 * @returns {boolean} 鏄惁鍒犻櫎鎴愬姛
 */
export function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('鍒犻櫎鏁版嵁澶辫触:', e);
    return false;
  }
}

/**
 * 鏈湴瀛樺偍 - 娓呯┖鎵€鏈夋暟鎹? * @returns {boolean} 鏄惁娓呯┖鎴愬姛
 */
export function clearStorage() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('娓呯┖鏁版嵁澶辫触:', e);
    return false;
  }
}

/**
 * 鏍煎紡鍖栨椂闂? * @param {string|number|Date} date - 鏃堕棿瀵硅薄鎴栨椂闂存埑
 * @param {string} format - 鏍煎紡鍖栨ā鏉匡紝榛樿'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 鏍煎紡鍖栧悗鐨勬椂闂村瓧绗︿覆
 */
export function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 鏍煎紡鍖栨暟瀛? * @param {number} num - 鏁板瓧
 * @param {number} decimals - 灏忔暟浣嶆暟锛岄粯璁?
 * @returns {string} 鏍煎紡鍖栧悗鐨勬暟瀛? */
export function formatNumber(num, decimals = 2) {
  if (typeof num !== 'number') {
    return '0';
  }
  
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 妫€鏌ユ槸鍚︿负绌哄璞? * @param {object} obj - 瑕佹鏌ョ殑瀵硅薄
 * @returns {boolean} 鏄惁涓虹┖瀵硅薄
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * 娣辨嫹璐濆璞? * @param {*} obj - 瑕佹嫹璐濈殑瀵硅薄
 * @returns {*} 鎷疯礉鍚庣殑瀵硅薄
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 闃叉姈鍑芥暟
 * @param {Function} func - 瑕佹墽琛岀殑鍑芥暟
 * @param {number} wait - 绛夊緟鏃堕棿锛岄粯璁?00ms
 * @returns {Function} 闃叉姈鍚庣殑鍑芥暟
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 鑺傛祦鍑芥暟
 * @param {Function} func - 瑕佹墽琛岀殑鍑芥暟
 * @param {number} limit - 闄愬埗鏃堕棿锛岄粯璁?00ms
 * @returns {Function} 鑺傛祦鍚庣殑鍑芥暟
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 鑾峰彇椤甸潰璺敱鍙傛暟
 * @returns {object} 璺敱鍙傛暟瀵硅薄
 */
export function getPageParams() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  return currentPage ? currentPage.options : {};
}

// 瀵煎嚭鎵€鏈夊嚱鏁?export default {
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  formatTime,
  formatNumber,
  isEmptyObject,
  deepClone,
  debounce,
  throttle,
  getPageParams
};