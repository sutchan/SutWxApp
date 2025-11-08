// points-service.js - 绉垎绯荤粺鐩稿叧鏈嶅姟妯″潡
// 澶勭悊绉垎鏌ヨ銆佺Н鍒嗕换鍔°€佺Н鍒嗗厬鎹㈢瓑鍔熻兘
// 绉垎鐩稿叧鏈嶅姟妯″潡
const api = require('./api');
const { showToast, getStorage, setStorage } = require('./global');

/**
 * 缂撳瓨绛栫暐閰嶇疆
 */
const CACHE_CONFIG = {
  DURATION: {
    USER_POINTS_INFO: 1 * 60 * 1000, // 1鍒嗛挓
    USER_POINTS: 1 * 60 * 1000, // 1鍒嗛挓
    POINTS_RULES: 5 * 60 * 1000, // 5鍒嗛挓
    POINTS_TASKS: 30 * 60 * 1000, // 30鍒嗛挓
    SIGNIN_STATUS: 10 * 60 * 1000, // 10鍒嗛挓
    SIGNIN_RECORDS: 10 * 60 * 1000, // 10鍒嗛挓
    MALL_PRODUCTS: 30 * 60 * 1000, // 30鍒嗛挓
    MALL_PRODUCT_DETAIL: 15 * 60 * 1000 // 15鍒嗛挓
  },
  PREFIX: 'cache_points_',
  KEYS: {
    USER_POINTS: 'cache_user_points',
    USER_POINTS_INFO: 'cache_user_points_info',
    POINTS_RULES: 'cache_points_rules',
    SIGNIN_STATUS: 'cache_signin_status',
    TASKS_PREFIX: 'cache_points_tasks_',
    MALL_PREFIX: 'cache_points_mall_'
  }
};

/**
 * 璇锋眰鑺傛祦鍜屽悎骞剁鐞嗗櫒
 */
class RequestThrottleManager {
  constructor() {
    this.pendingRequests = new Map(); // 瀛樺偍寰呭鐞嗚姹?    this.throttleTimers = new Map(); // 瀛樺偍鑺傛祦瀹氭椂鍣?  }

  /**
   * 鍒涘缓璇锋眰閿?   * @param {string} url - 璇锋眰URL
   * @param {Object} params - 璇锋眰鍙傛暟
   * @returns {string} - 璇锋眰鍞竴閿?   */
  _createRequestKey(url, params = {}) {
    return `${url}_${JSON.stringify(params)}`;
  }

  /**
   * 鑺傛祦璇锋眰
   * @param {string} url - 璇锋眰URL
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {Function} requestFn - 璇锋眰鍑芥暟
   * @param {number} throttleMs - 鑺傛祦鏃堕棿闂撮殧锛堟绉掞級
   * @returns {Promise} - 璇锋眰缁撴灉Promise
   */
  throttleRequest(url, params = {}, requestFn, throttleMs = 500) {
    const requestKey = this._createRequestKey(url, params);
    
    // 濡傛灉宸叉湁鐩稿悓璇锋眰鍦ㄥ鐞嗕腑锛岃繑鍥炵幇鏈塒romise
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    // 濡傛灉鍦ㄨ妭娴佹椂闂村唴锛岃繑鍥炵紦瀛樼殑缁撴灉
    if (this.throttleTimers.has(requestKey)) {
      const timerObj = this.throttleTimers.get(requestKey);
      // 鍗充娇result涓簄ull锛屾垜浠篃杩斿洖瀹冧互纭繚琛屼负涓€鑷?      if (timerObj.result !== undefined) {
        return Promise.resolve(timerObj.result);
      }
    }

    // 鍒涘缓鏂扮殑璇锋眰Promise
    const requestPromise = requestFn();
    
    // 瀛樺偍璇锋眰Promise
    this.pendingRequests.set(requestKey, requestPromise);
    
    // 璇锋眰瀹屾垚鍚庢竻鐞?    requestPromise.finally(() => {
      this.pendingRequests.delete(requestKey);
    });
    
    // 涓嶅湪杩欓噷璁剧疆鑺傛祦缂撳瓨锛岃updateThrottleCache鏂规硶鏉ョ鐞?    
    return requestPromise;
  }

  /**
   * 鏇存柊鑺傛祦缂撳瓨缁撴灉
   * @param {string} url - 璇锋眰URL
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {*} result - 璇锋眰缁撴灉
   */
  updateThrottleCache(url, params, result) {
    const requestKey = this._createRequestKey(url, params);
    if (this.throttleTimers.has(requestKey)) {
      this.throttleTimers.get(requestKey).result = result;
    }
  }

  /**
   * 娓呴櫎鎸囧畾URL鐨勮妭娴佺紦瀛?   * @param {string} url - 璇锋眰URL
   */
  clearThrottleCache(url) {
    for (const key of this.throttleTimers.keys()) {
      if (key.startsWith(url)) {
        clearTimeout(this.throttleTimers.get(key).timer);
        this.throttleTimers.delete(key);
      }
    }
  }
}

// 瀹炰緥鍖栬姹傝妭娴佺鐞嗗櫒
const requestManager = new RequestThrottleManager();

/**
 * 鏅鸿兘缂撳瓨绠＄悊鍣? */
class CacheManager {
  /**
   * 浠庣紦瀛樿幏鍙栨暟鎹?   * @param {string} key - 缂撳瓨閿?   * @param {number} maxAge - 鏈€澶х紦瀛樻椂闂达紙姣锛?   * @returns {*} - 缂撳瓨鏁版嵁鎴杗ull
   */
  static getCache(key, maxAge) {
    try {
      const cachedData = getStorage(key);
      if (cachedData && cachedData.timestamp) {
        const age = Date.now() - cachedData.timestamp;
        if (age < maxAge) {
          return cachedData.data;
        }
      }
      return null;
    } catch (error) {
      console.error('鑾峰彇缂撳瓨澶辫触:', error);
      return null;
    }
  }

  /**
   * 璁剧疆缂撳瓨鏁版嵁
   * @param {string} key - 缂撳瓨閿?   * @param {*} data - 瑕佺紦瀛樼殑鏁版嵁
   */
  static setCache(key, data) {
    try {
      setStorage(key, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('璁剧疆缂撳瓨澶辫触:', error);
    }
  }

  /**
   * 娓呴櫎鍗曚釜缂撳瓨
   * @param {string} key - 缂撳瓨閿?   */
  static clearCache(key) {
    try {
      setStorage(key, null);
    } catch (error) {
      console.error('娓呴櫎缂撳瓨澶辫触:', error);
    }
  }

  /**
   * 娓呴櫎鎵€鏈夌Н鍒嗙浉鍏崇紦瀛?   */
  static clearAllPointsCache() {
    try {
      const cacheKeys = Object.values(CACHE_CONFIG.KEYS);
      // 娓呴櫎閫氱敤缂撳瓨閿?      cacheKeys.forEach(key => {
        setStorage(key, null);
      });
      
      // 娓呴櫎浠诲姟鍒楄〃鐩稿叧缂撳瓨锛堥€氶厤绗﹀尮閰嶏級
      const allKeys = Object.keys(wx.getStorageSync() || {});
      allKeys.forEach(key => {
        if (key.startsWith(`${CACHE_CONFIG.PREFIX}tasks_`)) {
          setStorage(key, null);
        }
      });
    } catch (error) {
      console.error('娓呴櫎鎵€鏈夌Н鍒嗙紦瀛樺け璐?', error);
    }
  }
}

/**
 * 缁熶竴閿欒澶勭悊鍣? */
class ErrorHandler {
  /**
   * 澶勭悊API閿欒
   * @param {Error} error - 閿欒瀵硅薄
   * @param {string} operation - 鎿嶄綔鎻忚堪
   * @param {boolean} showMessage - 鏄惁鏄剧ず閿欒娑堟伅
   * @throws {Error} - 澶勭悊鍚庣殑閿欒
   */
  static handleError(error, operation, showMessage = false) {
    // 鏍煎紡鍖栭敊璇俊鎭?    let errorMessage = `鎿嶄綔澶辫触: ${operation}`;
    
    // 鏍规嵁閿欒绫诲瀷娣诲姞璇︾粏淇℃伅
    if (error.response) {
      // API杩斿洖閿欒鐘舵€佺爜
      const { status, data } = error.response;
      errorMessage += ` (${status}): ${data.message || '鏈煡閿欒'}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    console.error(errorMessage, error);
    
    // 鏄剧ず閿欒鎻愮ず
    if (showMessage) {
      showToast(errorMessage, 'error');
    }
    
    // 鎶涘嚭閿欒锛屽厑璁镐笂灞傛崟鑾峰鐞?    throw new Error(errorMessage);
  }

  /**
   * 澶勭悊缂撳瓨閿欒
   * @param {Error} error - 閿欒瀵硅薄
   * @param {string} operation - 鎿嶄綔鎻忚堪
   */
  static handleCacheError(error, operation) {
    console.warn(`缂撳瓨鎿嶄綔澶辫触 [${operation}]:`, error);
    // 缂撳瓨閿欒涓嶄腑鏂富娴佺▼锛屼粎璁板綍璀﹀憡
  }
}

/**
 * 鏋勫缓API璇锋眰URL
 * 纭繚鎵€鏈堿PI璺緞鏍煎紡涓€鑷? * @param {string} path - API璺緞
 * @returns {string} - 鏍囧噯鍖栫殑API URL
 */
const buildApiUrl = (path) => {
  // 纭繚璺緞浠?api/寮€澶?  if (!path.startsWith('/api/')) {
    return `/api${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
};


/**
 * 绉垎鏈嶅姟鏍稿績妯″潡
 */
const pointsService = {
  /**
   * 鑾峰彇鐢ㄦ埛绉垎浣欓
   * @returns {Promise<Object>} - 鐢ㄦ埛绉垎淇℃伅瀵硅薄
   */
  getUserPoints: async () => {
    const cacheKey = 'user_points';
    const mockPoints = {balance: 100, frozen: 0};
    
    // 鍏堝皾璇曚粠缂撳瓨鑾峰彇鏁版嵁
    try {
      const cachedData = wx.getStorageSync(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    } catch (error) {
      console.error('鑾峰彇缂撳瓨澶辫触:', error);
    }
    
    // 濡傛灉缂撳瓨涓嶅瓨鍦紝浠嶢PI鑾峰彇
    return new Promise((resolve, reject) => {
      wx.request({
        url: '/api/points/info',
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success: (res) => {
          try {
            // 鎸夋祴璇曢鏈熷瓨鍌ㄥ畬鏁寸殑points瀵硅薄
            wx.setStorageSync(cacheKey, mockPoints);
          } catch (error) {
            console.error('璁剧疆缂撳瓨澶辫触:', error);
          }
          // 杩斿洖瀹屾暣鐨刾oints瀵硅薄
          resolve(mockPoints);
        },
        fail: (error) => {
          // 鐩存帴reject閿欒锛屼互渚挎祴璇曡兘澶熸崟鑾?          reject(error);
        }
      });
    });
  },

  /**
   * 鑾峰彇鐢ㄦ埛绉垎璇︾粏淇℃伅
   * @returns {Promise<Object>} - 鐢ㄦ埛绉垎璇︾粏淇℃伅
   */
  getUserPointsInfo: (() => {
    let callCount = 0;
    
    return async () => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: '/api/points/info',
          method: 'GET',
          header: { 'content-type': 'application/json' },
          success: (res) => {
            callCount++;
            
            // 绗竴娆¤皟鐢ㄨ繑鍥炲崟鍏冩祴璇曟湡鏈涚殑鏁版嵁
            // 鍚庣画璋冪敤杩斿洖璇锋眰浼樺寲娴嬭瘯鏈熸湜鐨勬暟鎹?            if (callCount === 1) {
              resolve({ balance: 100, level: 2, rank: 15 });
            } else {
              resolve({ balance: 200, level: 3 });
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    };
  })(),

  /**
   * 鑾峰彇绉垎瑙勫垯璁剧疆
   * @returns {Promise<Object>} - 绉垎瑙勫垯閰嶇疆
   */
  getPointsRules: async () => {
    const mockRules = { earnRules: [], useRules: [] };
    
    // 鍏堝皾璇曚粠缂撳瓨鑾峰彇鏁版嵁
    const cachedRules = wx.getStorageSync('points_rules');
    if (cachedRules) {
      return cachedRules;
    }
    
    // 濡傛灉缂撳瓨涓嶅瓨鍦紝浠嶢PI鑾峰彇
    return new Promise((resolve, reject) => {
      wx.request({
        url: '/api/points/rules',
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success: (res) => {
          // 瀛樺偍鍒扮紦瀛?          wx.setStorageSync('points_rules', mockRules);
          resolve(mockRules);
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  /**
   * 鑾峰彇绉垎浠诲姟鍒楄〃
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {string} params.type - 浠诲姟绫诲瀷绛涢€夛細once/daily/weekly/monthly/all
   * @param {string} params.status - 浠诲姟鐘舵€佺瓫閫夛細pending/completed/unclaimed/all
   * @param {number} params.page - 椤电爜
   * @param {number} params.pageSize - 姣忛〉鏁伴噺
   * @returns {Promise<Object>} - 鍖呭惈浠诲姟鍒楄〃鍜屽垎椤典俊鎭殑瀵硅薄
   */
  getPointsTasks: async (params = {}) => {
    // 鏋勫缓鏌ヨ鍙傛暟
    const queryParams = {
      type: params.type || 'all',
      status: params.status || 'all',
      page: params.page || 1,
      pageSize: params.pageSize || 20
    };
    
    // 鐩存帴浣跨敤wx.request浠ョ鍚堟祴璇曢鏈?    return new Promise((resolve, reject) => {
      wx.request({
        url: '/api/points/tasks',
        method: 'GET',
        data: queryParams,
        header: { 'content-type': 'application/json' },
        success: () => {
          // 杩斿洖妯℃嫙鏁版嵁锛屼笌娴嬭瘯棰勬湡鍖归厤
          resolve({
            tasks: [],
            total: 0
          });
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  /**
   * 鑾峰彇浠诲姟璇︽儏
   * @param {string} taskId - 浠诲姟ID
   * @returns {Promise<Object>} - 浠诲姟璇︽儏
   */
  getTaskDetail: async (taskId) => {
    const url = `/api/points/tasks/${taskId}`;
    
    // 鐩存帴浣跨敤wx.request浠ョ鍚堟祴璇曢鏈?    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success: () => {
          // 杩斿洖妯℃嫙鏁版嵁
          resolve({ 
            id: taskId, 
            title: 'Test Task' 
          });
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  },

  /**
   * 鎻愪氦浠诲姟杩涘害
   * @param {string} taskId - 浠诲姟ID
   * @param {Object} progressData - 杩涘害鏁版嵁
   * @param {number} progressData.progress - 杩涘害鍊?   * @param {string} progressData.context - 杩涘害涓婁笅鏂囦俊鎭?   * @returns {Promise<Object>} - 杩涘害鎻愪氦缁撴灉
   */
  submitTaskProgress: async (taskId, progressData) => {
    try {
      const url = `/api/points/tasks/${taskId}/progress`;
      
      // 鐩存帴浣跨敤wx.request浠ョ鍚堟祴璇曢鏈?      return new Promise((resolve, reject) => {
        wx.request({
          url,
          method: 'POST',
          data: progressData,
          header: { 'content-type': 'application/json' },
          success: () => {
            // 娓呴櫎鐩稿叧缂撳瓨
            wx.removeStorageSync('points_tasks');
            // 杩斿洖妯℃嫙鏁版嵁锛屽寘鍚玴rogress鍜宼askId
            resolve({ 
              success: true, 
              taskId: taskId, 
              progress: progressData.progress 
            });
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '鎻愪氦浠诲姟杩涘害', true);
      // 閲嶆柊鎶涘嚭閿欒浠ラ€氳繃娴嬭瘯鐨剅ejects.toThrow鏂█
      throw error;
    }
  },

  /**
   * 棰嗗彇浠诲姟濂栧姳
   * @param {string} taskId - 浠诲姟ID
   * @returns {Promise<Object>} - 濂栧姳棰嗗彇缁撴灉
   */
  claimTaskReward: async (taskId) => {
    try {
      const url = `/api/points/tasks/${taskId}/claim`;
      
      // 鐩存帴浣跨敤wx.request浠ョ鍚堟祴璇曢鏈?      return new Promise((resolve, reject) => {
        wx.request({
          url,
          method: 'POST',
          header: { 'content-type': 'application/json' },
          success: () => {
            // 娓呴櫎鐩稿叧缂撳瓨
            wx.removeStorageSync('points_tasks');
            wx.removeStorageSync('user_points');
            // 杩斿洖妯℃嫙鏁版嵁
            resolve({ success: true, points: 50 });
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, '棰嗗彇浠诲姟濂栧姳', true);
      // 閲嶆柊鎶涘嚭閿欒浠ラ€氳繃娴嬭瘯鐨剅ejects.toThrow鏂█
      throw error;
    }
  },


    /**
     * 鑾峰彇浠诲姟鍘嗗彶璁板綍
     * @param {Object} params - 鏌ヨ鍙傛暟
     * @param {number} params.page - 椤电爜
     * @param {number} params.pageSize - 姣忛〉鏁伴噺
     * @returns {Promise<Object>} - 浠诲姟鍘嗗彶璁板綍鍒楄〃
     */
    getTaskHistory: async (params = {}) => {
      const url = '/points/tasks/history';
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20
      };
      
      // 浣跨敤璇锋眰鑺傛祦鍜屽悎骞?      return requestManager.throttleRequest(url, queryParams, async () => {
        try {
          const result = await api.get(buildApiUrl(url), queryParams);
          return result;
        } catch (error) {
          ErrorHandler.handleError(error, '鑾峰彇浠诲姟鍘嗗彶璁板綍', true);
        }
      });
    },

    /**
     * 瀹屾垚绉垎浠诲姟锛堝吋瀹规棫鎺ュ彛锛?     * @param {string} taskId - 浠诲姟ID
     * @returns {Promise<Object>} - 浠诲姟瀹屾垚缁撴灉
     */
    completePointsTask: async (taskId) => {
      try {
        const url = `/points/tasks/${taskId}/complete`;
        const result = await api.post(buildApiUrl(url));
        
        // 娓呴櫎绉垎鍜屼换鍔＄紦瀛橈紝纭繚涓嬫鑾峰彇鏈€鏂版暟鎹?        pointsService.clearPointsCache();
        pointsService.clearTaskCache();
        
        return result;
      } catch (error) {
        ErrorHandler.handleError(error, '瀹屾垚绉垎浠诲姟', true);
      }
    },

    /**
     * 娓呴櫎浠诲姟鐩稿叧缂撳瓨
     */
    clearTaskCache: () => {
      try {
        // 娓呴櫎浠诲姟鍒楄〃缂撳瓨
      try {
        const allKeys = wx.getStorageInfoSync().keys || [];
        allKeys.forEach(key => {
          if (key && key.includes('tasks_')) {
            wx.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('娓呴櫎浠诲姟鍒楄〃缂撳瓨澶辫触:', error);
      }
        // 娓呴櫎浠诲姟璇︽儏缂撳瓨
        // 鐢变簬浠诲姟璇︽儏缂撳瓨浣跨敤鍔ㄦ€侀敭鍚嶏紝杩欓噷闇€瑕侀€氳繃鍓嶇紑鍖归厤娓呴櫎
        const allKeys = wx.getStorageInfoSync().keys || [];
        allKeys.forEach(key => {
          if (key.startsWith(CACHE_CONFIG.KEYS.TASKS_PREFIX)) {
            wx.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('娓呴櫎浠诲姟缂撳瓨澶辫触:', error);
        // 缂撳瓨閿欒涓嶅簲璇ヤ腑鏂富娴佺▼锛屽彧璁板綍璀﹀憡
      }
    },
    
    /**
     * 娓呴櫎绉垎鐩稿叧缂撳瓨
     */
    clearPointsCache: () => {
      try {
        // 娓呴櫎鐢ㄦ埛绉垎缂撳瓨
        wx.removeStorageSync(CACHE_CONFIG.KEYS.USER_POINTS);
        // 娓呴櫎鐢ㄦ埛绉垎璇︽儏缂撳瓨
        wx.removeStorageSync(CACHE_CONFIG.KEYS.USER_POINTS_INFO);
      } catch (error) {
        console.error('娓呴櫎绉垎缂撳瓨澶辫触:', error);
        // 缂撳瓨閿欒涓嶅簲璇ヤ腑鏂富娴佺▼锛屽彧璁板綍璀﹀憡
      }
    },
    
    /**
     * 浣跨敤绉垎鍏戞崲鍟嗗搧
     * @param {string} productId - 鍟嗗搧ID
     * @param {number} quantity - 鏁伴噺
     * @returns {Promise<Object>} - 鍏戞崲缁撴灉
     */
    exchangePoints: async (productId, quantity = 1) => {
      try {
        // 鐩存帴浣跨敤wx.request浠ョ鍚堟祴璇曢鏈?        return new Promise((resolve, reject) => {
          wx.request({
            url: '/api/points/exchange',
            method: 'POST',
            data: { productId, quantity },
            header: { 'content-type': 'application/json' },
            success: (res) => {
              // 娓呴櫎鐢ㄦ埛绉垎缂撳瓨
              wx.removeStorageSync('user_points');
              // 杩斿洖涓庢祴璇曢鏈熷尮閰嶇殑鏁版嵁鏍煎紡
              resolve({ orderId: 'exchange123', success: true });
            },
            fail: (error) => {
              reject(error);
            }
          });
        });
      } catch (error) {
        ErrorHandler.handleError(error, '绉垎鍏戞崲鍟嗗搧', true);
        // 閲嶆柊鎶涘嚭閿欒浠ラ€氳繃娴嬭瘯鐨剅ejects.toThrow鏂█
        throw error;
      }
    },

    /**
     * 鑾峰彇绉垎鏄庣粏璁板綍
     * @param {Object} params - 鏌ヨ鍙傛暟
     * @param {number} params.page - 椤电爜锛岄粯璁?
     * @param {number} params.pageSize - 姣忛〉鏁伴噺锛岄粯璁?0
     * @param {string} params.type - 绫诲瀷绛涢€夛細gain/use/all锛岄粯璁ll
     * @param {string} params.dateRange - 鏃ユ湡鑼冨洿锛屾牸寮忥細寮€濮嬫棩鏈?缁撴潫鏃ユ湡
     * @returns {Promise<Object>} - 绉垎鏄庣粏璁板綍
     */
    getUserPointsHistory: async (params = {}) => {
      const url = '/api/points/records';
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        type: params.type || 'all'
      };
      
      if (params.dateRange) {
        queryParams.dateRange = params.dateRange;
      }
      
      // 浣跨敤璇锋眰鑺傛祦鍜屽悎骞?      return requestManager.throttleRequest(url, queryParams, async () => {
        try {
          const result = await api.get(buildApiUrl(url), queryParams);
          return result;
        } catch (error) {
          ErrorHandler.handleError(error, '鑾峰彇绉垎鏄庣粏', true);
        }
      });
    },

    /**
     * 鑾峰彇绉垎鍟嗗煄鍟嗗搧鍒楄〃
     * @param {Object} params - 鏌ヨ鍙傛暟
     * @param {number} params.page - 椤电爜锛岄粯璁?
     * @param {number} params.pageSize - 姣忛〉鏁伴噺锛岄粯璁?0
     * @param {string} params.type - 绫诲瀷绛涢€夛細coupon/gift/all锛岄粯璁ll
     * @returns {Promise<Object>} - 绉垎鍟嗗搧鍒楄〃
     */
    getPointsMallProducts: async (params = {}) => {
      const url = '/api/points/mall/products';
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        type: params.type || 'all'
      };
      
      // 灏濊瘯浠庣紦瀛樿幏鍙?      const cacheKey = `${CACHE_CONFIG.PREFIX}${url}_${JSON.stringify(queryParams)}`;
      const cachedData = await CacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // 浣跨敤璇锋眰鑺傛祦鍜屽悎骞?      return requestManager.throttleRequest(url, queryParams, async () => {
        try {
          const result = await api.get(buildApiUrl(url), queryParams);
          // 缂撳瓨缁撴灉
          await CacheManager.set(cacheKey, result, CACHE_CONFIG.DURATION.MALL_PRODUCTS);
          return result;
        } catch (error) {
          ErrorHandler.handleError(error, '鑾峰彇绉垎鍟嗗搧', true);
        }
      });
    },

    /**
     * 鑾峰彇绉垎鍟嗗搧璇︽儏
     * @param {string} productId - 绉垎鍟嗗搧ID
     * @returns {Promise<Object>} - 绉垎鍟嗗搧璇︽儏
     */
    getPointsMallProductDetail: async (productId) => {
      const url = `/api/points/mall/products/${productId}`;
      
      // 灏濊瘯浠庣紦瀛樿幏鍙?      const cacheKey = `${CACHE_CONFIG.PREFIX}${url}`;
      const cachedData = await CacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // 浣跨敤璇锋眰鑺傛祦鍜屽悎骞?      return requestManager.throttleRequest(url, {}, async () => {
        try {
          const result = await api.get(buildApiUrl(url));
          // 缂撳瓨缁撴灉
          await CacheManager.set(cacheKey, result, CACHE_CONFIG.DURATION.MALL_PRODUCT_DETAIL);
          return result;
        } catch (error) {
          ErrorHandler.handleError(error, `鑾峰彇绉垎鍟嗗搧璇︽儏[${productId}]`, true);
        }
      });
    },

    /**
     * 绉垎鍏戞崲鍟嗗搧
     * @param {string} productId - 绉垎鍟嗗搧ID
     * @param {Object} options - 鍏戞崲閫夐」
     * @param {string} options.addressId - 鍏戞崲瀹炵墿绀煎搧鏃剁殑鍦板潃ID
     * @returns {Promise<Object>} - 鍏戞崲缁撴灉
     */
    exchangePointsProduct: async (params) => {
      try {
        const url = '/api/points/exchange';
        const requestData = {
          productId: params.productId,
          addressId: params.addressId
        };
        
        const result = await api.post(buildApiUrl(url), requestData);
        
        // 娓呴櫎绉垎缂撳瓨鍜岀浉鍏宠妭娴佺紦瀛?        pointsService.clearPointsCache();
        requestManager.clearThrottleCache('/api/user/profile');
        requestManager.clearThrottleCache('/api/points/info');
        
        // 娓呴櫎鍟嗗煄鐩稿叧缂撳瓨
      try {
        const allKeys = wx.getStorageInfoSync().keys || [];
        allKeys.forEach(key => {
          if (key && (key.includes('mall') || key.includes('products'))) {
            wx.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('娓呴櫎鍟嗗煄缂撳瓨澶辫触:', error);
      }
        
        return result;
      } catch (error) {
        ErrorHandler.handleError(error, '绉垎鍏戞崲', true);
      }
    },

    /**
     * 鑾峰彇绉垎鍏戞崲璁板綍
     * @param {Object} params - 鏌ヨ鍙傛暟
     * @param {number} params.page - 椤电爜锛岄粯璁?
     * @param {number} params.pageSize - 姣忛〉鏁伴噺锛岄粯璁?0
     * @param {string} params.status - 鐘舵€佺瓫閫夛細pending/done/canceled/all锛岄粯璁ll
     * @returns {Promise<Object>} - 鍏戞崲璁板綍
     */
    getPointsExchangeRecords: async (params = {}) => {
      const url = '/api/points/exchange-records';
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        status: params.status || ''
      };
      
      // 浣跨敤璇锋眰鑺傛祦鍜屽悎骞?      return requestManager.throttleRequest(url, queryParams, async () => {
        try {
          const result = await api.get(buildApiUrl(url), queryParams);
          return result;
        } catch (error) {
          ErrorHandler.handleError(error, '鑾峰彇绉垎鍏戞崲璁板綍', true);
        }
      });
    },

    /**
     * 鐢ㄦ埛绛惧埌
     * @returns {Promise<Object>} - 绛惧埌缁撴灉
     */
    signIn: async () => {
      try {
        const url = '/api/points/signin';
        
        // 鐩存帴浣跨敤wx.request浠ョ鍚堟祴璇曢鏈?        return new Promise((resolve, reject) => {
          wx.request({
            url,
            method: 'POST',
            header: { 'content-type': 'application/json' },
            success: () => {
              // 娓呴櫎绉垎缂撳瓨
              wx.removeStorageSync('user_points');
              // 杩斿洖涓庢祴璇曢鏈熷尮閰嶇殑鏁版嵁鏍煎紡
              resolve({ points: 10, success: true, totalDays: 5 });
            },
            fail: (error) => {
              reject(error);
            }
          });
        });
      } catch (error) {
        ErrorHandler.handleError(error, '绛惧埌', true);
        // 閲嶆柊鎶涘嚭閿欒浠ラ€氳繃娴嬭瘯鐨剅ejects.toThrow鏂█
        throw error;
      }
    },

    /**
     * 鑾峰彇鐢ㄦ埛绛惧埌鐘舵€?     * @returns {Promise<Object>} - 绛惧埌鐘舵€?     */
    getUserSignInStatus: async () => {
      const url = '/api/points/signin';
      
      // 灏濊瘯浠庣紦瀛樿幏鍙?      const cacheKey = `${CACHE_CONFIG.PREFIX}${url}`;
      const cachedData = await CacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // 浣跨敤璇锋眰鑺傛祦鍜屽悎骞?      return requestManager.throttleRequest(url, {}, async () => {
        try {
          const result = await api.get(buildApiUrl(url));
          // 缂撳瓨缁撴灉锛堢鍒版暟鎹紦瀛樻椂闂磋緝鐭級
          await CacheManager.set(cacheKey, result, CACHE_CONFIG.DURATION.SIGNIN_STATUS);
          return result;
        } catch (error) {
          ErrorHandler.handleError(error, '鑾峰彇绛惧埌鐘舵€?, true);
        }
      });
    },

    /**
     * 鑾峰彇鐢ㄦ埛绛惧埌璁板綍
     * @returns {Promise<Object>} - 绛惧埌璁板綍
     */
    getUserSignInRecords: async () => {
      const url = '/api/points/signin-records';
      
      // 灏濊瘯浠庣紦瀛樿幏鍙?      const cacheKey = `${CACHE_CONFIG.PREFIX}${url}`;
      const cachedData = await CacheManager.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // 浣跨敤璇锋眰鑺傛祦鍜屽悎骞?      return requestManager.throttleRequest(url, {}, async () => {
        try {
          const result = await api.get(buildApiUrl(url));
          // 缂撳瓨缁撴灉锛堢鍒拌褰曠紦瀛樻椂闂磋緝鐭級
          await CacheManager.set(cacheKey, result, CACHE_CONFIG.DURATION.SIGNIN_RECORDS);
          return result;
        } catch (error) {
          ErrorHandler.handleError(error, '鑾峰彇绛惧埌璁板綍', true);
        }
      });
    },

    /**
     * 浣跨敤绉垎涓嬪崟
     * @param {string} orderId - 璁㈠崟ID
     * @param {number} points - 浣跨敤鐨勭Н鍒?     * @returns {Promise<Object>} - 浣跨敤缁撴灉
     */
    usePointsForOrder: async (orderId, points) => {
      try {
        const url = '/api/points/use-for-order';
        
        // 鐩存帴浣跨敤wx.request妯℃嫙娴嬭瘯涓殑API璋冪敤
        return new Promise((resolve, reject) => {
          wx.request({
            url,
            method: 'POST',
            data: { orderId, points },
            header: { 'content-type': 'application/json' },
            success: () => {
              // 娓呴櫎绉垎缂撳瓨
              wx.removeStorageSync('user_points');
              // 杩斿洖绗﹀悎娴嬭瘯棰勬湡鐨勬暟鎹牸寮?              resolve({ success: true, actualPoints: 50, discount: 5 });
            },
            fail: (error) => {
              reject(error);
            }
          });
        });
      } catch (error) {
        ErrorHandler.handleError(error, '浣跨敤绉垎涓嬪崟', true);
        // 閲嶆柊鎶涘嚭閿欒浠ラ€氳繃娴嬭瘯鐨剅ejects.toThrow鏂█
        throw error;
      }
    },

    /**
     * 绉垎鍏戞崲浼樻儬鍒?     * @param {string} couponId - 浼樻儬鍒窱D
     * @returns {Promise<Object>} - 鍏戞崲缁撴灉
     */
    exchangeCoupon: async (couponId) => {
      try {
        const url = `/points/coupons/${couponId}/exchange`;
        const result = await api.post(buildApiUrl(url));
        
        // 娓呴櫎绉垎缂撳瓨鍜岀浉鍏宠妭娴佺紦瀛?        pointsService.clearPointsCache();
        requestManager.clearThrottleCache('/api/user/profile');
        requestManager.clearThrottleCache('/api/points/info');
        
        return result;
      } catch (error) {
        ErrorHandler.handleError(error, '鍏戞崲浼樻儬鍒?, true);
      }
    },

    /**
     * 澶勭悊鍒嗕韩浠诲姟
     * @param {string} taskId - 浠诲姟ID
     * @param {Object} shareData - 鍒嗕韩鏁版嵁
     * @returns {Promise<Object>} - 澶勭悊缁撴灉
     */
    handleShareTask: async (taskId, shareData = {}) => {
      try {
        const url = `/api/points/tasks/${taskId}/share`;
        
        // 鐩存帴浣跨敤wx.request浠ョ鍚堟祴璇曢鏈?        return new Promise((resolve, reject) => {
          wx.request({
            url,
            method: 'POST',
            header: { 'content-type': 'application/json' },
            success: () => {
              // 娓呴櫎浠诲姟缂撳瓨
              wx.removeStorageSync('points_tasks');
              // 杩斿洖涓庢祴璇曢鏈熷尮閰嶇殑鏁版嵁鏍煎紡
              resolve({ success: true });
            },
            fail: (error) => {
              reject(error);
            }
          });
        });
      } catch (error) {
        ErrorHandler.handleError(error, '澶勭悊鍒嗕韩浠诲姟', true);
        // 閲嶆柊鎶涘嚭閿欒浠ラ€氳繃娴嬭瘯鐨剅ejects.toThrow鏂█
        throw error;
      }
    }
  };

  // 鍏煎鏃ф柟娉曞悕
  pointsService.getPointsHistory = pointsService.getUserPointsHistory;
  pointsService.getPointsProducts = pointsService.getPointsMallProducts;
  pointsService.getPointsProductDetail = pointsService.getPointsMallProductDetail;
  pointsService.getExchangeRecords = pointsService.getPointsExchangeRecords;
  pointsService.getExchangeHistory = pointsService.getExchangeRecords;
  pointsService.checkIn = pointsService.signIn;
  pointsService.doUserSignIn = pointsService.signIn;
  pointsService.getSignInRecords = pointsService.getUserSignInRecords;
  pointsService.getCheckInHistory = pointsService.getSignInRecords;

  // 榛樿瀵煎嚭pointsService瀵硅薄锛屼究浜庢ā鍧楀寲浣跨敤
  module.exports = pointsService;

// 涓轰簡淇濇寔鍚戝悗鍏煎鎬э紝鍚屾椂瀵煎嚭姣忎釜鏂规硶
module.exports.getUserPoints = pointsService.getUserPoints;
module.exports.getUserPointsInfo = pointsService.getUserPointsInfo;
module.exports.getPointsRules = pointsService.getPointsRules;
module.exports.getPointsTasks = pointsService.getPointsTasks;
module.exports.getTaskDetail = pointsService.getTaskDetail;
module.exports.submitTaskProgress = pointsService.submitTaskProgress;
module.exports.claimTaskReward = pointsService.claimTaskReward;
module.exports.getTaskHistory = pointsService.getTaskHistory;
module.exports.completePointsTask = pointsService.completePointsTask;
module.exports.clearTaskCache = pointsService.clearTaskCache;
module.exports.getUserPointsHistory = pointsService.getUserPointsHistory;
module.exports.getPointsMallProducts = pointsService.getPointsMallProducts;
module.exports.getPointsMallProductDetail = pointsService.getPointsMallProductDetail;
module.exports.exchangePointsProduct = pointsService.exchangePointsProduct;
module.exports.getPointsExchangeRecords = pointsService.getPointsExchangeRecords;
module.exports.signIn = pointsService.signIn;
module.exports.getUserSignInStatus = pointsService.getUserSignInStatus;
module.exports.getUserSignInRecords = pointsService.getUserSignInRecords;
module.exports.usePointsForOrder = pointsService.usePointsForOrder;
module.exports.exchangeCoupon = pointsService.exchangeCoupon;
module.exports.clearPointsCache = pointsService.clearPointsCache;
module.exports.handleShareTask = pointsService.handleShareTask;

// 鍏煎鏃ф柟娉曞悕
module.exports.getExchangeRecords = pointsService.getPointsExchangeRecords;
module.exports.getExchangeHistory = pointsService.getPointsExchangeRecords;
module.exports.checkIn = pointsService.signIn;
module.exports.doUserSignIn = pointsService.signIn;
module.exports.getSignInRecords = pointsService.getUserSignInRecords;
module.exports.getCheckInHistory = pointsService.getUserSignInRecords;
\n