/**
 * 鏂囦欢鍚? request.js
 * 鐗堟湰鍙? 1.1.1
 * 鏇存柊鏃ユ湡: 2025-11-27
 * 浣滆€? Sut
 * 鎻忚堪: 缃戠粶璇锋眰宸ュ叿绫伙紝闆嗘垚瀹夊叏楠岃瘉鍜岀绾跨紦瀛? */

const signature = require('./signature.js');
const i18n = require('./i18n.js');
const store = require('./store.js');
const cacheService = require('./cacheService.js').instance;
const CACHE_POLICY = require('./cacheService.js').CACHE_POLICY;

// 閰嶇疆淇℃伅
const API_CONFIG = {
  BASE_URL: 'https://api.example.com/v1', // 鐢熶骇鐜API鍦板潃
  TEST_URL: 'https://test-api.example.com/v1', // 娴嬭瘯鐜API鍦板潃
  USE_TEST: false, // 鏄惁浣跨敤娴嬭瘯鐜
  TIMEOUT: 30000, // 璇锋眰瓒呮椂鏃堕棿
  RETRY_COUNT: 3, // 閲嶈瘯娆℃暟
  SECRET_KEY: '' // 绛惧悕瀵嗛挜锛屽垵濮嬪寲鏃朵负绌猴紝閫氳繃瀹夊叏鏈哄埗鑾峰彇
};

// 鍒濆鍖朅PI瀵嗛挜
(function initApiSecretKey() {
  try {
    // 浠庡畨鍏ㄥ瓨鍌ㄨ幏鍙朅PI瀵嗛挜
    const secretKey = wx.getStorageSync('api_secret_key');
    if (secretKey) {
      API_CONFIG.SECRET_KEY = secretKey;
    } else {
      // 鐢熶骇鐜涓嬪繀椤婚厤缃瓵PI瀵嗛挜
      if (!API_CONFIG.USE_TEST) {
        console.error('API瀵嗛挜鏈厤缃紝璇峰湪瀹夊叏瀛樺偍涓缃產pi_secret_key');
      }
    }
  } catch (error) {
    console.error('鑾峰彇API瀵嗛挜澶辫触:', error);
  }
})();

/**
 * 缃戠粶璇锋眰宸ュ叿绫? */
class Request {
  /**
   * 鍙戣捣API璇锋眰
   * @param {Object} options - 璇锋眰閫夐」
   * @param {string} options.url - 璇锋眰URL
   * @param {string} options.method - 璇锋眰鏂规硶
   * @param {Object} options.data - 璇锋眰鏁版嵁
   * @param {Object} options.header - 璇锋眰澶?   * @param {boolean} options.needAuth - 鏄惁闇€瑕佽璇?   * @param {boolean} options.needSign - 鏄惁闇€瑕佺鍚?   * @param {Object} options.cache - 缂撳瓨閰嶇疆
   * @param {string} options.cache.policy - 缂撳瓨绛栫暐: 'NETWORK_FIRST', 'CACHE_FIRST', 'STALE_WHILE_REVALIDATE', 'ONLY_NETWORK', 'ONLY_CACHE'
   * @param {number} options.cache.maxAge - 缂撳瓨鏈€澶х敓鍛藉懆鏈燂紙姣锛?   * @returns {Promise} 璇锋眰缁撴灉
   */
  static async request(options) {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      needAuth = true,
      needSign = true,
      cache = {}
    } = options;
    
    // 鏋勫缓璇锋眰閰嶇疆
    let requestOptions = {
      url: this._buildUrl(url),
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout: API_CONFIG.TIMEOUT
    };
    
    // 娣诲姞璁よ瘉淇℃伅
    if (needAuth) {
      const token = this._getAuthToken();
      if (token) {
        requestOptions.header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // 娣诲姞璇锋眰绛惧悕
    if (needSign) {
      requestOptions = signature.addSignatureToHeaders(
        requestOptions,
        API_CONFIG.SECRET_KEY
      );
    }
    
    // 澶勭悊缂撳瓨
    const cacheEnabled = method === 'GET' && cacheService && cache.policy;
    const cacheKey = this._generateCacheKey(requestOptions);
    
    // 鏍规嵁缂撳瓨绛栫暐鍐冲畾鏄惁鍏堣繑鍥炵紦瀛樻暟鎹?    if (cacheEnabled) {
      switch (cache.policy) {
        case CACHE_POLICY.CACHE_FIRST:
          // 浼樺厛浣跨敤缂撳瓨
          const cachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (cachedData) {
            return cachedData;
          }
          // 缂撳瓨涓嶅瓨鍦紝鎵ц缃戠粶璇锋眰
          const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          await cacheService.set(cacheKey, result, cache.maxAge);
          return result;
          
        case CACHE_POLICY.ONLY_CACHE:
          // 鍙娇鐢ㄧ紦瀛?          const onlyCachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (onlyCachedData) {
            return onlyCachedData;
          }
          throw new Error(i18n.translate('offline_data_unavailable') || '绂荤嚎鏁版嵁涓嶅彲鐢?);
          
        case CACHE_POLICY.NETWORK_FIRST:
          try {
            // 浼樺厛浣跨敤缃戠粶
            const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
            await cacheService.set(cacheKey, result, cache.maxAge);
            return result;
          } catch (error) {
            // 缃戠粶璇锋眰澶辫触锛屽皾璇曚娇鐢ㄧ紦瀛?            const fallbackData = await cacheService.get(cacheKey);
            if (fallbackData) {
              return fallbackData;
            }
            throw error;
          }
          
        case CACHE_POLICY.STALE_WHILE_REVALIDATE:
          // 鍚屾椂杩斿洖缂撳瓨鍜屽彂璧风綉缁滆姹傛洿鏂扮紦瀛?          const staleData = await cacheService.get(cacheKey);
          
          // 鏃犺缂撳瓨鏄惁瀛樺湪锛岄兘鍙戣捣缃戠粶璇锋眰鏇存柊缂撳瓨
          this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT)
            .then(result => {
              cacheService.set(cacheKey, result, cache.maxAge);
            })
            .catch(error => {
              console.warn('鍒锋柊缂撳瓨澶辫触:', error);
            });
          
          // 濡傛灉鏈夌紦瀛橈紝鐩存帴杩斿洖缂撳瓨鏁版嵁
          if (staleData) {
            return staleData;
          }
          
          // 鍚﹀垯绛夊緟缃戠粶璇锋眰瀹屾垚
          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          
        case CACHE_POLICY.ONLY_NETWORK:
        default:
          // 鍙娇鐢ㄧ綉缁滐紝涓嶇紦瀛?          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
      }
    }
    
    // 鏈惎鐢ㄧ紦瀛橈紝鐩存帴鎵ц璇锋眰
    return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
  }
  
  /**
   * GET璇锋眰
   * @param {string} url - 璇锋眰URL
   * @param {Object} data - 璇锋眰鏁版嵁
   * @param {Object} options - 鍏朵粬閫夐」
   * @returns {Promise} 璇锋眰缁撴灉
   */
  static get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    });
  }
  
  /**
   * POST璇锋眰
   * @param {string} url - 璇锋眰URL
   * @param {Object} data - 璇锋眰鏁版嵁
   * @param {Object} options - 鍏朵粬閫夐」
   * @returns {Promise} 璇锋眰缁撴灉
   */
  static post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }
  
  /**
   * PUT璇锋眰
   * @param {string} url - 璇锋眰URL
   * @param {Object} data - 璇锋眰鏁版嵁
   * @param {Object} options - 鍏朵粬閫夐」
   * @returns {Promise} 璇锋眰缁撴灉
   */
  static put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  }
  
  /**
   * DELETE璇锋眰
   * @param {string} url - 璇锋眰URL
   * @param {Object} data - 璇锋眰鏁版嵁
   * @param {Object} options - 鍏朵粬閫夐」
   * @returns {Promise} 璇锋眰缁撴灉
   */
  static delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }
  
  /**
   * 鏋勫缓瀹屾暣URL
   * @private
   * @param {string} url - 鐩稿URL
   * @returns {string} 瀹屾暣URL
   */
  static _buildUrl(url) {
    // 濡傛灉鏄畬鏁碪RL锛岀洿鎺ヨ繑鍥?    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 鍚﹀垯鎷兼帴鍩虹URL
    const baseUrl = API_CONFIG.USE_TEST ? API_CONFIG.TEST_URL : API_CONFIG.BASE_URL;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  /**
   * 鐢熸垚缂撳瓨閿?   * @private
   * @param {Object} requestOptions - 璇锋眰閫夐」
   * @returns {string} 缂撳瓨閿?   */
  static _generateCacheKey(requestOptions) {
    const { url, data, method } = requestOptions;
    // 灏哢RL鍜屾暟鎹簭鍒楀寲锛岀敓鎴愬敮涓€鐨勭紦瀛橀敭
    const dataString = typeof data === 'string' ? data : JSON.stringify(data || {});
    // 浣跨敤鏇撮珮鏁堢殑鍝堝笇绠楁硶鐢熸垚缂撳瓨閿紝鍑忓皯鍐呭瓨鍗犵敤
    const hash = require('./crypto.js').md5(`${method}:${url}:${dataString}`);
    return hash;
  }
  
  /**
   * 鑾峰彇璁よ瘉浠ょ墝
   * @private
   * @returns {string|null} 浠ょ墝
   */
  static _getAuthToken() {
    try {
      // 浠巗tore涓幏鍙杢oken
      const token = store.getState('user.token');
      if (token) {
        return token;
      }
      
      // 闄嶇骇锛氫粠鏈湴瀛樺偍鑾峰彇
      return wx.getStorageSync('token') || null;
    } catch (error) {
      console.error('鑾峰彇璁よ瘉浠ょ墝澶辫触:', error);
      return null;
    }
  }
  
  /**
   * 鎵ц璇锋眰骞跺鐞嗛噸璇?   * @private
   * @param {Object} options - 璇锋眰閫夐」
   * @param {number} retryCount - 鍓╀綑閲嶈瘯娆℃暟
   * @returns {Promise} 璇锋眰缁撴灉
   */
  static _executeWithRetry(options, retryCount) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: (res) => {
          // 澶勭悊鍝嶅簲
          if (res.statusCode === 401) {
            // 鏈巿鏉冿紝娓呴櫎token骞舵彁绀虹櫥褰?            this._handleUnauthorized();
            reject(new Error(i18n.translate('login_required')));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            // 璇锋眰澶辫触
            const errorMsg = res.data?.message || 
                            i18n.translate('network_error') || 
                            '缃戠粶璇锋眰澶辫触';
            reject(new Error(errorMsg));
          }
        },
        fail: (err) => {
          // 澶勭悊缃戠粶閿欒
          if (retryCount > 0) {
            // 閲嶈瘯璇锋眰
            setTimeout(() => {
              this._executeWithRetry(options, retryCount - 1)
                .then(resolve)
                .catch(reject);
            }, 1000 * Math.pow(2, API_CONFIG.RETRY_COUNT - retryCount)); // 鎸囨暟閫€閬?          } else {
            // 閲嶈瘯娆℃暟鐢ㄥ畬锛屾姏鍑洪敊璇?            reject(new Error(i18n.translate('network_error') || '缃戠粶璇锋眰澶辫触'));
          }
        },
        complete: () => {
          // 璇锋眰瀹屾垚鍚庣殑澶勭悊
          if (store) {
            store.commit('SET_LOADING', false);
          }
        }
      });
    });
  }
  
  /**
   * 澶勭悊鏈巿鏉冩儏鍐?   * @private
   */
  static _handleUnauthorized() {
    // 娓呴櫎鐢ㄦ埛淇℃伅鍜宼oken
    store.commit('SET_USER_INFO', null);
    store.commit('SET_TOKEN', null);
    
    // 娓呴櫎鏈湴瀛樺偍
    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    } catch (error) {
      console.error('娓呴櫎璁よ瘉淇℃伅澶辫触:', error);
    }
    
    // 鎻愮ず鐢ㄦ埛闇€瑕佺櫥褰?    wx.showToast({
      title: i18n.translate('login_required'),
      icon: 'none'
    });
  }
  
  /**
   * 娓呴櫎鐗瑰畾URL鐨勭紦瀛?   * @param {string} url - 璇锋眰URL
   * @param {Object} data - 璇锋眰鏁版嵁锛堝彲閫夛級
   * @returns {Promise<boolean>} 鏄惁娓呴櫎鎴愬姛
   */
  static async clearCache(url, data = {}) {
    if (!cacheService) return false;
    
    const requestOptions = {
      url: this._buildUrl(url),
      method: 'GET',
      data
    };
    
    const cacheKey = this._generateCacheKey(requestOptions);
    return await cacheService.remove(cacheKey);
  }
  
  /**
   * 娓呴櫎鎵€鏈夎姹傜紦瀛?   * @returns {Promise<boolean>} 鏄惁娓呴櫎鎴愬姛
   */
  static async clearAllCache() {
    if (!cacheService) return false;
    return await cacheService.clear('request');
  }
  
  /**
   * 涓婁紶鏂囦欢
   * @param {string} url - 涓婁紶URL
   * @param {string} filePath - 鏂囦欢璺緞
   * @param {Object} options - 鍏朵粬閫夐」
   * @returns {Promise} 涓婁紶缁撴灉
   */
  static uploadFile(url, filePath, options = {}) {
    const {
      name = 'file',
      formData = {},
      header = {},
      needAuth = true
    } = options;
    
    // 娣诲姞璁よ瘉淇℃伅
    if (needAuth) {
      const token = this._getAuthToken();
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: this._buildUrl(url),
        filePath,
        name,
        formData,
        header,
        timeout: API_CONFIG.TIMEOUT,
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (res.statusCode === 200) {
              resolve(data);
            } else {
              reject(new Error(data.message || '涓婁紶澶辫触'));
            }
          } catch (error) {
            reject(new Error('瑙ｆ瀽鍝嶅簲澶辫触'));
          }
        },
        fail: (err) => {
          reject(new Error('涓婁紶鏂囦欢澶辫触'));
        }
      });
    });
  }
}

module.exports = Request;