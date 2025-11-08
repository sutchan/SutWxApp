// api.js - 缁熶竴API璇锋眰妯″潡
// 鍩轰簬鎶€鏈璁℃枃妗ｅ疄鐜扮殑澧炲己鐗圓PI璇锋眰妯″潡

const { showToast } = require('./global');
const { CACHE_KEYS, CACHE_DURATION, setCache, getCache, removeCache, clearCacheByPrefix } = require('./cache');

// API鍩虹鍦板潃锛屽彲鏍规嵁鐜閰嶇疆
const baseURL = 'https://鎮ㄧ殑缃戠珯鍩熷悕/wp-json/sut-wechat-mini/v1';

// 榛樿璇锋眰澶?const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// API缂撳瓨鍓嶇紑
const API_CACHE_PREFIX = 'api_cache_';

// 璇锋眰鍙栨秷鎺у埗鍣ㄥ瓨鍌?const abortControllers = new Map();

// 榛樿token
let defaultToken = '';

/**
 * 鐢熸垚缂撳瓨閿? * @param {string} url - 璇锋眰URL
 * @param {Object} params - 璇锋眰鍙傛暟
 * @returns {string} 缂撳瓨閿? */
const generateCacheKey = (url, params) => {
  if (!params || Object.keys(params).length === 0) {
    return `${API_CACHE_PREFIX}${url}`;
  }
  return `${API_CACHE_PREFIX}${url}_${JSON.stringify(params)}`;
};

/**
 * 缁熶竴API璇锋眰鏂规硶
 * @param {string} url - API鎺ュ彛璺緞
 * @param {Object} options - 璇锋眰閰嶇疆椤? * @param {string} options.method - 璇锋眰鏂规硶锛岄粯璁?GET'
 * @param {Object} options.data - 璇锋眰鏁版嵁
 * @param {Object} options.headers - 璇锋眰澶? * @param {number} options.timeout - 璇锋眰瓒呮椂鏃堕棿锛岄粯璁?0000ms
 * @param {number} options.retryCount - 閲嶈瘯娆℃暟锛屽唴閮ㄤ娇鐢? * @param {boolean} options.useCache - 鏄惁浣跨敤缂撳瓨锛屼粎GET璇锋眰鏈夋晥
 * @param {number} options.cacheDuration - 缂撳瓨鎸佺画鏃堕棿锛堟绉掞級
 * @param {string} options.abortKey - 璇锋眰鍙栨秷鏍囪瘑
 * @returns {Promise} - 杩斿洖Promise瀵硅薄
 */
const request = async (url, options = {}) => {
  // 鑾峰彇token锛堜紭鍏堜娇鐢ㄩ粯璁oken锛屽叾娆℃槸鏈湴瀛樺偍锛?  const token = defaultToken || wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token') || '';
  
  // 璁剧疆璇锋眰澶?  const headers = {
    ...defaultHeaders,
    ...options.headers
  };
  
  // 濡傛灉鏈塼oken锛屾坊鍔犲埌璇锋眰澶?  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 鏋勫缓瀹屾暣URL
  const fullUrl = `${baseURL}${url}`;
  
  // 澶勭悊GET璇锋眰鐨勭紦瀛?  const method = options.method || 'GET';
  if (method === 'GET' && options.useCache) {
    const cacheKey = generateCacheKey(url, options.data);
    try {
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        console.log('浣跨敤缂撳瓨鏁版嵁:', cacheKey);
        return cachedData;
      }
    } catch (error) {
      console.warn('鑾峰彇缂撳瓨澶辫触:', error);
    }
  }
  
  // 澶勭悊璇锋眰鍙栨秷
  let abortController;
  if (options.abortKey) {
    // 鍙栨秷鍚屼竴key鐨勪箣鍓嶇殑璇锋眰
    if (abortControllers.has(options.abortKey)) {
      abortControllers.get(options.abortKey).abort();
      abortControllers.delete(options.abortKey);
    }
    
    // 鍒涘缓鏂扮殑鍙栨秷鎺у埗鍣?    abortController = new AbortController();
    abortControllers.set(options.abortKey, abortController);
  }
  
  try {
    const response = await wx.request({
      url: fullUrl,
      method: method,
      data: options.data,
      header: headers,
      timeout: options.timeout || 30000,
      enableHttp2: true,
      enableQuic: true,
      enableCache: false, // 璁╂垜浠嚜宸辩鐞嗙紦瀛?      ...(abortController ? { signal: abortController.signal } : {})
    });
    
    // 娓呯悊鍙栨秷鎺у埗鍣?    if (options.abortKey) {
      abortControllers.delete(options.abortKey);
    }
    
    // 澶勭悊鍝嶅簲
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // 妫€鏌ュ搷搴旀暟鎹牸寮?      if (response.data && typeof response.data === 'object') {
        // 缁熶竴閿欒澶勭悊
        if (response.data.code !== 200 && response.data.code) {
          // 401琛ㄧず鏈巿鏉冿紝娓呴櫎token骞惰烦杞埌鐧诲綍
          if (response.data.code === 401) {
            wx.removeStorageSync('userToken');
            wx.removeStorageSync('jwt_token');
            wx.removeStorageSync('userInfo');
            defaultToken = '';
            wx.redirectTo({ url: '/pages/user/login/login' });
          }
          // 鎶涘嚭涓氬姟閿欒
          throw new Error(response.data.message || '璇锋眰澶辫触');
        }
        
        const result = response.data.data || response.data; // 杩斿洖data閮ㄥ垎鎴栨暣涓搷搴?        
        // 缂撳瓨GET璇锋眰缁撴灉
        if (method === 'GET' && options.useCache) {
          const cacheKey = generateCacheKey(url, options.data);
          const duration = options.cacheDuration || CACHE_DURATION.MEDIUM;
          try {
            setCache(cacheKey, result, duration);
          } catch (error) {
            console.warn('璁剧疆缂撳瓨澶辫触:', error);
          }
        }
        
        return result;
      }
      return response.data;
    } else {
      throw new Error(`璇锋眰澶辫触: ${response.statusCode}`);
    }
  } catch (error) {
    // 娓呯悊鍙栨秷鎺у埗鍣?    if (options.abortKey) {
      abortControllers.delete(options.abortKey);
    }
    
    // 澶勭悊鍙栨秷閿欒
    if (error.name === 'AbortError') {
      throw new Error('璇锋眰宸插彇娑?);
    }
    
    // 閲嶈瘯閫昏緫
    if (options.retryCount === undefined) {
      options.retryCount = 0;
    }
    
    // 鏈€澶氶噸璇?娆★紝浠呭鐗瑰畾閿欒鐮侀噸璇?    if (options.retryCount < 2 && [408, 500, 502, 503, 504].includes(error.statusCode)) {
      options.retryCount++;
      // 鎸囨暟閫€閬块噸璇?      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, options.retryCount)));
      return request(url, options);
    }
    
    // 鏄剧ず閿欒鎻愮ず锛屼絾閬垮厤閲嶅鏄剧ず
    if (!error.silent) {
      showToast(error.message || '缃戠粶璇锋眰澶辫触', { icon: 'none' });
    }
    throw error;
  }
};

/**
 * 璁剧疆榛樿token
 * @param {string} token - JWT token
 */
const setToken = (token) => {
  defaultToken = token;
};

/**
 * 鍙栨秷鎸囧畾key鐨勮姹? * @param {string} abortKey - 璇锋眰鍙栨秷鏍囪瘑
 */
const cancelRequest = (abortKey) => {
  if (abortControllers.has(abortKey)) {
    abortControllers.get(abortKey).abort();
    abortControllers.delete(abortKey);
    return true;
  }
  return false;
};

/**
 * 鍙栨秷鎵€鏈夎姹? */
const cancelAllRequests = () => {
  abortControllers.forEach(controller => controller.abort());
  abortControllers.clear();
};

/**
 * 娓呴櫎鎸囧畾URL鐨勭紦瀛? * @param {string} url - API鎺ュ彛璺緞
 * @param {Object} params - 璇锋眰鍙傛暟
 * @returns {boolean} 鎿嶄綔鏄惁鎴愬姛
 */
const clearCache = (url, params) => {
  const cacheKey = generateCacheKey(url, params);
  try {
    removeCache(cacheKey);
    return true;
  } catch (error) {
    console.warn('娓呴櫎缂撳瓨澶辫触:', error);
    return false;
  }
};

/**
 * 娓呴櫎鎵€鏈堿PI缂撳瓨
 * @returns {boolean} 鎿嶄綔鏄惁鎴愬姛
 */
const clearAllCache = () => {
  try {
    clearCacheByPrefix(API_CACHE_PREFIX);
    return true;
  } catch (error) {
    console.warn('娓呴櫎鎵€鏈夌紦瀛樺け璐?', error);
    return false;
  }
};

// 瀵煎嚭甯哥敤璇锋眰鏂规硶
const apiModule = {
  /**
   * GET璇锋眰
   * @param {string} url - 璇锋眰璺緞
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {Object} options - 棰濆閰嶇疆椤?   * @param {boolean} options.useCache - 鏄惁浣跨敤缂撳瓨
   * @param {number} options.cacheDuration - 缂撳瓨鎸佺画鏃堕棿
   * @param {string} options.abortKey - 璇锋眰鍙栨秷鏍囪瘑
   * @returns {Promise} - 杩斿洖Promise瀵硅薄
   */
  get: (url, params, options = {}) => request(url, { 
    method: 'GET', 
    data: params, 
    ...options 
  }),
  
  /**
   * POST璇锋眰
   * @param {string} url - 璇锋眰璺緞
   * @param {Object} data - 璇锋眰鏁版嵁
   * @param {Object} options - 棰濆閰嶇疆椤?   * @param {string} options.abortKey - 璇锋眰鍙栨秷鏍囪瘑
   * @returns {Promise} - 杩斿洖Promise瀵硅薄
   */
  post: (url, data, options = {}) => request(url, { 
    method: 'POST', 
    data, 
    ...options 
  }),
  
  /**
   * PUT璇锋眰
   * @param {string} url - 璇锋眰璺緞
   * @param {Object} data - 璇锋眰鏁版嵁
   * @param {Object} options - 棰濆閰嶇疆椤?   * @param {string} options.abortKey - 璇锋眰鍙栨秷鏍囪瘑
   * @returns {Promise} - 杩斿洖Promise瀵硅薄
   */
  put: (url, data, options = {}) => request(url, { 
    method: 'PUT', 
    data, 
    ...options 
  }),
  
  /**
   * DELETE璇锋眰
   * @param {string} url - 璇锋眰璺緞
   * @param {Object} data - 璇锋眰鏁版嵁
   * @param {Object} options - 棰濆閰嶇疆椤?   * @param {string} options.abortKey - 璇锋眰鍙栨秷鏍囪瘑
   * @returns {Promise} - 杩斿洖Promise瀵硅薄
   */
  delete: (url, data, options = {}) => request(url, { 
    method: 'DELETE', 
    data, 
    ...options 
  }),
  
  /**
   * 涓婁紶鏂囦欢
   * @param {string} url - 璇锋眰璺緞
   * @param {Object} data - 琛ㄥ崟鏁版嵁
   * @param {Object} file - 鏂囦欢瀵硅薄 {name, path}
   * @param {Object} options - 棰濆閰嶇疆椤?   * @param {string} options.abortKey - 璇锋眰鍙栨秷鏍囪瘑
   * @returns {Promise} - 杩斿洖Promise瀵硅薄
   */
  upload: (url, data, file, options = {}) => {
    return new Promise((resolve, reject) => {
      const token = defaultToken || wx.getStorageSync('userToken') || wx.getStorageSync('jwt_token') || '';
      
      // 澶勭悊璇锋眰鍙栨秷
      let abortController;
      if (options.abortKey) {
        // 鍙栨秷鍚屼竴key鐨勪箣鍓嶇殑璇锋眰
        if (abortControllers.has(options.abortKey)) {
          abortControllers.get(options.abortKey).abort();
          abortControllers.delete(options.abortKey);
        }
        
        // 鍒涘缓鏂扮殑鍙栨秷鎺у埗鍣?        abortController = new AbortController();
        abortControllers.set(options.abortKey, abortController);
      }
      
      wx.uploadFile({
        url: `${baseURL}${url}`,
        filePath: file.path,
        name: file.name || 'file',
        formData: data,
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          // 娓呯悊鍙栨秷鎺у埗鍣?          if (options.abortKey) {
            abortControllers.delete(options.abortKey);
          }
          
          try {
            const response = JSON.parse(res.data);
            if (response.code === 200) {
              resolve(response.data || response);
            } else {
              showToast(response.message || '涓婁紶澶辫触', { icon: 'none' });
              reject(new Error(response.message || '涓婁紶澶辫触'));
            }
          } catch (error) {
            showToast('涓婁紶澶辫触锛岃閲嶈瘯', { icon: 'none' });
            reject(error);
          }
        },
        fail: (error) => {
          // 娓呯悊鍙栨秷鎺у埗鍣?          if (options.abortKey) {
            abortControllers.delete(options.abortKey);
          }
          
          // 澶勭悊鍙栨秷閿欒
          if (error.name === 'AbortError') {
            reject(new Error('涓婁紶宸插彇娑?));
            return;
          }
          
          showToast('缃戠粶閿欒锛岃绋嶅悗閲嶈瘯', { icon: 'none' });
          reject(error);
        }
      });
    });
  },
  
  // 宸ュ叿鏂规硶
  setToken,
  cancelRequest,
  cancelAllRequests,
  clearCache,
  clearAllCache
};

// 璁剧疆module.exports涓洪粯璁ゅ鍑?module.exports = apiModule;

// 瀵煎嚭api瀹炰緥鍜屽伐鍏锋柟娉?module.exports.api = apiModule;
module.exports.setToken = setToken;
module.exports.cancelRequest = cancelRequest;
module.exports.cancelAllRequests = cancelAllRequests;
module.exports.clearCache = clearCache;
module.exports.clearAllCache = clearAllCache;\n