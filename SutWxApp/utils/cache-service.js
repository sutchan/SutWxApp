// cache-service.js - 楂樼骇缂撳瓨绠＄悊鏈嶅姟
// 鏁村悎浜嗗熀纭€缂撳瓨鍔熻兘鍜岄珮绾х紦瀛樼瓥鐣ワ紝绗﹀悎鎶€鏈璁℃枃妗ｄ腑鐨勭紦瀛樼鐞嗘ā鍧楄姹?
// 缂撳瓨閿墠缂€
const CACHE_PREFIX = 'sut_wxcache_';

/**
 * 缂撳瓨閿父閲忥紝缁熶竴绠＄悊缂撳瓨閿? */
const CACHE_KEYS = {
  // 绯荤粺閰嶇疆
  SYSTEM_CONFIG: 'system_config',
  THEME_CONFIG: 'theme_config',
  BASIC_CONFIG: 'basic_config',
  
  // 鐢ㄦ埛鐩稿叧
  USER_INFO: 'user_info',
  USER_PROFILE: 'user_profile',
  AUTH_TOKEN: 'auth_token',
  TOKEN: 'user_token', // 鍏煎鏃ч敭鍚?  
  // 鍐呭鐩稿叧
  HOT_ARTICLES: 'hot_articles',
  ARTICLE_LIST: 'article_list_',
  ARTICLE_DETAIL_PREFIX: 'article_detail_',
  
  // 鐢靛晢鐩稿叧
  CART_DATA: 'cart_data',
  COUPON_LIST_PREFIX: 'coupon_list_',
  COUPON_DETAIL_PREFIX: 'coupon_detail_',
  
  // 鍒嗙被鐩稿叧
  CATEGORY_LIST: 'category_list',
  
  // 鎼滅储鐩稿叧
  SEARCH_HISTORY: 'search_history',
  SEARCH_SUGGESTIONS: 'search_suggestions',
  
  // 閫氱煡鐩稿叧
  NOTIFICATION_LIST: 'notification_list',
  UNREAD_COUNT: 'unread_count',
  
  // 鍏朵粬
  FAVORITES: 'favorites',
  RECENTLY_VIEWED: 'recently_viewed'
};

/**
 * 缂撳瓨鏃堕暱甯搁噺锛堟绉掞級
 */
const CACHE_DURATION = {
  // 楂橀鏇存柊鏁版嵁
  HIGH_FREQUENCY: 60 * 1000, // 1鍒嗛挓
  
  // 鐭椂闂寸紦瀛?  SHORT: 5 * 60 * 1000, // 5鍒嗛挓
  
  // 涓瓑鏃堕棿缂撳瓨
  MEDIUM: 15 * 60 * 1000, // 15鍒嗛挓
  
  // 闀挎椂闂寸紦瀛?  LONG: 60 * 60 * 1000, // 1灏忔椂
  
  // 鏋侀暱鏃堕棿缂撳瓨
  VERY_LONG: 24 * 60 * 60 * 1000 // 24灏忔椂
};

/**
 * 缂撳瓨绠＄悊绫?- 鎻愪緵渚挎嵎鐨勭紦瀛樻搷浣滄柟娉? */
class CacheManager {
  // 娓呴櫎鐢ㄦ埛鐩稿叧缂撳瓨
  static clearUserCache() {
    const userKeys = [CACHE_KEYS.USER_INFO, CACHE_KEYS.USER_PROFILE, CACHE_KEYS.AUTH_TOKEN, CACHE_KEYS.TOKEN];
    userKeys.forEach(key => {
      try {
        wx.removeStorageSync(`${CACHE_PREFIX}${key}`);
      } catch (error) {
        console.error(`娓呴櫎鐢ㄦ埛缂撳瓨椤瑰け璐? ${key}`, error);
      }
    });
  }
  
  // 娓呴櫎鍐呭鐩稿叧缂撳瓨
  static clearContentCache() {
    const contentKeys = [CACHE_KEYS.SEARCH_HISTORY, CACHE_KEYS.SEARCH_SUGGESTIONS];
    contentKeys.forEach(key => {
      try {
        wx.removeStorageSync(`${CACHE_PREFIX}${key}`);
      } catch (error) {
        console.error(`娓呴櫎鍐呭缂撳瓨椤瑰け璐? ${key}`, error);
      }
    });
    
    // 娓呴櫎鏂囩珷鐩稿叧缂撳瓨
    CacheManager.clearArticleCache();
  }
  
  // 娓呴櫎璐墿杞︾浉鍏崇紦瀛?  static clearCartCache() {
    try {
      wx.removeStorageSync(`${CACHE_PREFIX}${CACHE_KEYS.CART_DATA}`);
    } catch (error) {
      console.error('娓呴櫎璐墿杞︾紦瀛樺け璐?', error);
    }
  }
  
  // 娓呴櫎浼樻儬鍒哥浉鍏崇紦瀛?  static clearCouponCache(statuses = ['available', 'used', 'expired']) {
    statuses.forEach(status => {
      try {
        wx.removeStorageSync(`${CACHE_PREFIX}${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`);
      } catch (error) {
        console.error(`娓呴櫎浼樻儬鍒哥紦瀛樺け璐?(${status}):`, error);
      }
    });
  }
  
  // 娓呴櫎鎵€鏈夌紦瀛?  static clearAllCache() {
    try {
      wx.clearStorageSync();
    } catch (error) {
      console.error('娓呴櫎鎵€鏈夌紦瀛樺け璐?', error);
    }
  }
  
  // 鑾峰彇鐢ㄦ埛淇℃伅
  static getUserInfo() {
    return getCache(CACHE_KEYS.USER_INFO);
  }
  
  // 璁剧疆鐢ㄦ埛淇℃伅
  static setUserInfo(userInfo) {
    setCache(CACHE_KEYS.USER_INFO, userInfo, CACHE_DURATION.MEDIUM);
  }
  
  // 鑾峰彇鐑棬鏂囩珷
  static getHotArticles() {
    return getCache(CACHE_KEYS.HOT_ARTICLES);
  }
  
  // 璁剧疆鐑棬鏂囩珷
  static setHotArticles(articles) {
    setCache(CACHE_KEYS.HOT_ARTICLES, articles, CACHE_DURATION.SHORT);
  }
  
  // 鑾峰彇鏂囩珷鍒楄〃
  static getArticleList(page, category = '') {
    const key = `${CACHE_KEYS.ARTICLE_LIST}${category}_${page}`;
    return getCache(key);
  }
  
  // 璁剧疆鏂囩珷鍒楄〃
  static setArticleList(page, articles, category = '') {
    const key = `${CACHE_KEYS.ARTICLE_LIST}${category}_${page}`;
    setCache(key, articles, CACHE_DURATION.SHORT);
  }
  
  // 鑾峰彇鏂囩珷璇︽儏
  static getArticleDetail(id) {
    const key = `${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`;
    return getCache(key);
  }
  
  // 璁剧疆鏂囩珷璇︽儏
  static setArticleDetail(id, article) {
    const key = `${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`;
    setCache(key, article, CACHE_DURATION.MEDIUM);
  }
  
  // 鑾峰彇璐墿杞︽暟鎹?  static getCartData() {
    return getCache(CACHE_KEYS.CART_DATA);
  }
  
  // 璁剧疆璐墿杞︽暟鎹?  static setCartData(cartData) {
    setCache(CACHE_KEYS.CART_DATA, cartData, CACHE_DURATION.HIGH_FREQUENCY);
  }
  
  // 鑾峰彇浼樻儬鍒稿垪琛?  static getCouponList(status = 'available') {
    const key = `${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`;
    return getCache(key);
  }
  
  // 璁剧疆浼樻儬鍒稿垪琛?  static setCouponList(coupons, status = 'available') {
    const key = `${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`;
    setCache(key, coupons, CACHE_DURATION.SHORT);
  }
  
  // 鑾峰彇浼樻儬鍒歌鎯?  static getCouponDetail(id) {
    const key = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${id}`;
    return getCache(key);
  }
  
  // 璁剧疆浼樻儬鍒歌鎯?  static setCouponDetail(id, coupon) {
    const key = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${id}`;
    setCache(key, coupon, CACHE_DURATION.MEDIUM);
  }
  
  // 鑾峰彇鍒嗙被鍒楄〃
  static getCategoryList() {
    return getCache(CACHE_KEYS.CATEGORY_LIST);
  }
  
  // 璁剧疆鍒嗙被鍒楄〃
  static setCategoryList(categories) {
    setCache(CACHE_KEYS.CATEGORY_LIST, categories, CACHE_DURATION.LONG);
  }
  
  // 娓呴櫎鏂囩珷鐩稿叧缂撳瓨
  static clearArticleCache(id) {
    try {
      if (id) {
        const key = `${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`;
        wx.removeStorageSync(`${CACHE_PREFIX}${key}`);
      } else {
        // 娓呴櫎鎵€鏈夋枃绔犲垪琛ㄥ拰鐑棬鏂囩珷
        wx.getStorageInfoSync().keys.forEach(key => {
          if (key.startsWith(`${CACHE_PREFIX}${CACHE_KEYS.ARTICLE_LIST}`) || 
              key.startsWith(`${CACHE_PREFIX}${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}`)) {
            wx.removeStorageSync(key);
          }
        });
        wx.removeStorageSync(`${CACHE_PREFIX}${CACHE_KEYS.HOT_ARTICLES}`);
      }
    } catch (error) {
      console.error('娓呴櫎鏂囩珷缂撳瓨澶辫触:', error);
    }
  }
}

/**
 * 杈呭姪鍑芥暟 - 璁剧疆缂撳瓨
 */
function setCache(key, value, expiry) {
  const now = Date.now();
  const expiryTime = typeof expiry === 'number' ? now + expiry * 1000 : null; // expiry杞崲涓烘绉?  
  const data = {
    value,
    expiry: expiryTime,
    timestamp: now
  };
  
  wx.setStorageSync(`sut_wxcache_${key}`, data);
}

/**
 * 杈呭姪鍑芥暟 - 鑾峰彇缂撳瓨
 */
function getCache(key) {
  try {
    const data = wx.getStorageSync(`sut_wxcache_${key}`);
    
    // 妫€鏌ョ紦瀛樻槸鍚﹀瓨鍦?    if (!data || typeof data !== 'object') {
      return null;
    }
    
    // 妫€鏌ユ槸鍚﹁繃鏈?    if (data.expiry && Date.now() > data.expiry) {
      // 缂撳瓨宸茶繃鏈燂紝鍒犻櫎瀹?      wx.removeStorageSync(`sut_wxcache_${key}`);
      return null;
    }
    
    return data.value;
  } catch (error) {
    console.error(`鑾峰彇缂撳瓨澶辫触: ${key}`, error);
    return null;
  }
}

/**
 * 杈呭姪鍑芥暟 - 鍒犻櫎缂撳瓨
 */
function removeCache(key) {
  try {
    wx.removeStorageSync(`sut_wxcache_${key}`);
    return true;
  } catch (error) {
    console.error(`鍒犻櫎缂撳瓨澶辫触: ${key}`, error);
    return false;
  }
}

/**
 * 楂樼骇缂撳瓨绠＄悊鏈嶅姟
 * 鎻愪緵缁熶竴鐨勭紦瀛樻帴鍙ｃ€佺紦瀛樼瓥鐣ュ拰缂撳瓨鐩戞帶鍔熻兘
 */
const CacheService = {
  /**
   * 鍒濆鍖栫紦瀛樻湇鍔?   */
  init() {
    console.log('缂撳瓨鏈嶅姟鍒濆鍖?);
    // 妫€鏌ョ紦瀛樺仴搴风姸鎬?    this.checkCacheHealth();
    return this;
  },

  /**
   * 妫€鏌ョ紦瀛樺仴搴风姸鎬?   */
  checkCacheHealth() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      console.log(`缂撳瓨浣跨敤鎯呭喌: ${storageInfo.currentSize}/${storageInfo.limitSize} KB`);
      
      // 濡傛灉缂撳瓨浣跨敤瓒呰繃80%锛屾竻鐞嗚繃鏈熺紦瀛?      if (storageInfo.currentSize / storageInfo.limitSize > 0.8) {
        console.warn('缂撳瓨绌洪棿鎺ヨ繎涓婇檺锛屾竻鐞嗚繃鏈熺紦瀛?);
        this.cleanExpiredCache();
      }
    } catch (error) {
      console.error('妫€鏌ョ紦瀛樺仴搴风姸鎬佸け璐?', error);
    }
  },

  /**
   * 娓呯悊鎵€鏈夎繃鏈熺紦瀛?   */
  cleanExpiredCache() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      let cleanedCount = 0;
      
      keys.forEach(key => {
        try {
          const data = wx.getStorageSync(key);
          // 妫€鏌ユ槸鍚︽槸鎴戜滑鐨勭紦瀛樻牸寮忓苟涓斿凡杩囨湡
          if (data && data.expiry && typeof data.expiry === 'number' && Date.now() > data.expiry) {
            wx.removeStorageSync(key);
            cleanedCount++;
          }
        } catch (e) {
          console.error(`娓呯悊缂撳瓨椤瑰け璐? ${key}`, e);
        }
      });
      
      console.log(`娓呯悊浜?${cleanedCount} 涓繃鏈熺紦瀛橀」`);
    } catch (error) {
      console.error('娓呯悊杩囨湡缂撳瓨澶辫触:', error);
    }
  },

  /**
   * 璁剧疆缂撳瓨锛堝甫绛栫暐鏀寔锛?   * @param {string} key - 缂撳瓨閿?   * @param {*} value - 缂撳瓨鍊?   * @param {number|string} expiry - 杩囨湡鏃堕棿锛堢锛夋垨缂撳瓨绛栫暐鍚嶇О
   * @param {Object} options - 棰濆閫夐」
   * @returns {boolean} - 鏄惁璁剧疆鎴愬姛
   */
  async set(key, value, expiry = CACHE_DURATION.MEDIUM, options = {}) {
    try {
      // 濡傛灉expiry鏄瓧绗︿覆锛屽皾璇曚粠CACHE_DURATION涓幏鍙栧搴旂殑鍊?      if (typeof expiry === 'string' && CACHE_DURATION[expiry]) {
        expiry = CACHE_DURATION[expiry];
      }

      // 搴忓垪鍖栧鏉傚璞?      let cacheValue = value;
      if (options.serialize && typeof value === 'object') {
        cacheValue = JSON.stringify(value);
      }

      // 璁剧疆缂撳瓨
      setCache(key, cacheValue, expiry);
      
      // 濡傛灉鍚敤浜嗙紦瀛樼粺璁?      if (options.track) {
        this._trackCacheUsage('set', key, expiry);
      }
      
      return true;
    } catch (error) {
      console.error('楂樼骇璁剧疆缂撳瓨澶辫触:', error);
      return false;
    }
  },

  /**
   * 鑾峰彇缂撳瓨锛堝甫鍥為€€绛栫暐锛?   * @param {string} key - 缂撳瓨閿?   * @param {*} fallback - 缂撳瓨涓嶅瓨鍦ㄦ椂鐨勫洖閫€鍊?   * @param {Object} options - 棰濆閫夐」
   * @returns {*} - 缂撳瓨鍊兼垨鍥為€€鍊?   */
  async get(key, fallback = null, options = {}) {
    try {
      const value = getCache(key);
      
      // 濡傛灉缂撳瓨瀛樺湪
      if (value !== null) {
        // 濡傛灉鍚敤浜嗗弽搴忓垪鍖?        let result = value;
        if (options.deserialize && typeof value === 'string') {
          try {
            result = JSON.parse(value);
          } catch (e) {
            console.error('鍙嶅簭鍒楀寲缂撳瓨鍊煎け璐?', e);
            result = value;
          }
        }
        
        // 濡傛灉鍚敤浜嗙紦瀛樼粺璁?        if (options.track) {
          this._trackCacheUsage('get', key, true);
        }
        
        return result;
      }
      
      // 濡傛灉鍚敤浜嗙紦瀛樼粺璁?      if (options.track) {
        this._trackCacheUsage('get', key, false);
      }
      
      return fallback;
    } catch (error) {
      console.error('楂樼骇鑾峰彇缂撳瓨澶辫触:', error);
      return fallback;
    }
  },

  /**
   * 鎵归噺璁剧疆缂撳瓨
   * @param {Array<{key: string, value: *, expiry: number}>} items - 缂撳瓨椤规暟缁?   * @returns {Object} - 鍖呭惈鎴愬姛鍜屽け璐ラ」鐨勭粨鏋?   */
  async batchSet(items) {
    const result = {
      success: [],
      failed: []
    };

    for (const item of items) {
      const { key, value, expiry = CACHE_DURATION.MEDIUM } = item;
      const success = await this.set(key, value, expiry);
      
      if (success) {
        result.success.push(key);
      } else {
        result.failed.push(key);
      }
    }

    return result;
  },

  /**
   * 鎵归噺鑾峰彇缂撳瓨
   * @param {Array<string>} keys - 缂撳瓨閿暟缁?   * @returns {Object} - 閿€煎鏄犲皠鐨勭紦瀛樼粨鏋?   */
  async batchGet(keys) {
    const result = {};

    for (const key of keys) {
      result[key] = await this.get(key);
    }

    return result;
  },

  /**
   * 鍒犻櫎缂撳瓨椤?   * @param {string} key - 缂撳瓨閿?   * @returns {boolean} - 鏄惁鍒犻櫎鎴愬姛
   */
  async remove(key) {
    try {
      removeCache(key);
      return true;
    } catch (error) {
      console.error(`鍒犻櫎缂撳瓨椤瑰け璐? ${key}`, error);
      return false;
    }
  },

  /**
   * 鎵归噺鍒犻櫎缂撳瓨
   * @param {Array<string>} keys - 缂撳瓨閿暟缁?   * @returns {Object} - 鍖呭惈鎴愬姛鍜屽け璐ラ」鐨勭粨鏋?   */
  async batchRemove(keys) {
    const result = { 
      success: [],
      failed: []
    };

    for (const key of keys) {
      try {
        removeCache(key);
        result.success.push(key);
      } catch (error) {
        console.error(`鍒犻櫎缂撳瓨椤瑰け璐? ${key}`, error);
        result.failed.push(key);
      }
    }

    return result;
  },

  /**
   * 鏉′欢鎬ц缃紦瀛?   * @param {string} key - 缂撳瓨閿?   * @param {Function} conditionFn - 杩斿洖甯冨皵鍊肩殑鏉′欢鍑芥暟
   * @param {Function} valueFn - 杩斿洖缂撳瓨鍊肩殑鍑芥暟
   * @param {number} expiry - 杩囨湡鏃堕棿
   * @returns {*} - 璁剧疆鐨勭紦瀛樺€兼垨null
   */
  async setIf(key, conditionFn, valueFn, expiry = CACHE_DURATION.MEDIUM) {
    try {
      const shouldSet = typeof conditionFn === 'function' ? await conditionFn() : conditionFn;
      
      if (shouldSet) {
        const value = typeof valueFn === 'function' ? await valueFn() : valueFn;
        await this.set(key, value, expiry);
        return value;
      }
      
      return null;
    } catch (error) {
      console.error('鏉′欢璁剧疆缂撳瓨澶辫触:', error);
      return null;
    }
  },

  /**
   * 鑾峰彇鎴栬缃紦瀛橈紙濡傛灉涓嶅瓨鍦級
   * @param {string} key - 缂撳瓨閿?   * @param {Function} valueFn - 杩斿洖缂撳瓨鍊肩殑鍑芥暟
   * @param {number} expiry - 杩囨湡鏃堕棿
   * @returns {*} - 缂撳瓨鍊?   */
  async getOrSet(key, valueFn, expiry = CACHE_DURATION.MEDIUM) {
    const cachedValue = await this.get(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const value = typeof valueFn === 'function' ? await valueFn() : valueFn;
    await this.set(key, value, expiry);
    return value;
  },

  /**
   * 鍒锋柊缂撳瓨锛堥噸鏂拌幏鍙栧苟鏇存柊锛?   * @param {string} key - 缂撳瓨閿?   * @param {Function} valueFn - 杩斿洖鏂扮紦瀛樺€肩殑鍑芥暟
   * @param {number} expiry - 杩囨湡鏃堕棿
   * @returns {*} - 鏂扮殑缂撳瓨鍊兼垨null
   */
  async refresh(key, valueFn, expiry = CACHE_DURATION.MEDIUM) {
    try {
      const value = typeof valueFn === 'function' ? await valueFn() : valueFn;
      await this.set(key, value, expiry);
      return value;
    } catch (error) {
      console.error('鍒锋柊缂撳瓨澶辫触:', error);
      return null;
    }
  },

  /**
   * 娓呴櫎鎸囧畾绫诲瀷鐨勭紦瀛?   * @param {string} type - 缂撳瓨绫诲瀷
   * @returns {boolean} - 鏄惁鎴愬姛
   */
  clearByType(type) {
    try {
      switch (type) {
        case 'user':
          CacheManager.clearUserCache();
          break;
        case 'content':
          CacheManager.clearContentCache();
          break;
        case 'cart':
          CacheManager.clearCartCache();
          break;
        case 'coupon':
          CacheManager.clearCouponCache();
          break;
        case 'all':
          CacheManager.clearAllCache();
          break;
        default:
          console.warn(`鏈煡鐨勭紦瀛樼被鍨? ${type}`);
          return false;
      }
      return true;
    } catch (error) {
      console.error(`娓呴櫎缂撳瓨绫诲瀷 ${type} 澶辫触:`, error);
      return false;
    }
  },

  /**
   * 鑾峰彇缂撳瓨缁熻淇℃伅
   * @returns {Object} - 缂撳瓨缁熻淇℃伅
   */
  getCacheStats() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      const keys = storageInfo.keys;
      let ourCacheCount = 0;
      let totalSize = 0;

      // 杩欓噷鍙槸浼扮畻锛屽疄闄呭ぇ灏忛渶瑕佸簭鍒楀寲璁＄畻
      keys.forEach(key => {
        if (key.startsWith('sut_wxcache_')) {
          ourCacheCount++;
          try {
            const data = wx.getStorageSync(key);
            totalSize += JSON.stringify(data).length;
          } catch (e) {
            console.error(`鑾峰彇缂撳瓨澶у皬澶辫触: ${key}`, e);
          }
        }
      });

      return {
        totalKeys: keys.length,
        ourCacheKeys: ourCacheCount,
        totalSize: storageInfo.currentSize,
        estimatedOurCacheSize: totalSize / 1024, // KB
        limitSize: storageInfo.limitSize,
        usagePercentage: (storageInfo.currentSize / storageInfo.limitSize * 100).toFixed(2)
      };
    } catch (error) {
      console.error('鑾峰彇缂撳瓨缁熻澶辫触:', error);
      return null;
    }
  },

  /**
   * 缂撳瓨棰勭儹
   * @param {Array<{key: string, valueFn: Function, expiry: number}>} items - 瑕侀鐑殑缂撳瓨椤?   * @returns {Promise<Array>} - 棰勭儹缁撴灉
   */
  async preheat(items) {
    const results = [];
    
    for (const item of items) {
      const { key, valueFn, expiry = CACHE_DURATION.MEDIUM } = item;
      try {
        const value = await valueFn();
        await this.set(key, value, expiry);
        results.push({ key, success: true });
      } catch (error) {
        console.error(`棰勭儹缂撳瓨椤瑰け璐? ${key}`, error);
        results.push({ key, success: false, error: error.message });
      }
    }
    
    return results;
  },

  /**
   * 缂撳瓨闄嶇骇绛栫暐 - 褰撹幏鍙栧け璐ユ椂浣跨敤杩囨湡缂撳瓨
   * @param {string} key - 缂撳瓨閿?   * @param {Function} valueFn - 鑾峰彇鏂板€肩殑鍑芥暟
   * @param {number} expiry - 杩囨湡鏃堕棿
   * @returns {*} - 缂撳瓨鍊兼垨闄嶇骇鍊?   */
  async getWithFallback(key, valueFn, expiry = CACHE_DURATION.MEDIUM) {
    try {
      // 灏濊瘯鑾峰彇鏈€鏂板€?      const value = typeof valueFn === 'function' ? await valueFn() : valueFn;
      await this.set(key, value, expiry);
      return value;
    } catch (error) {
      console.warn(`鑾峰彇鏂板€煎け璐ワ紝灏濊瘯浣跨敤杩囨湡缂撳瓨: ${key}`, error);
      
      // 灏濊瘯鑾峰彇鍘熷缂撳瓨锛堜笉妫€鏌ヨ繃鏈燂級
      try {
        const rawKey = `sut_wxcache_${key}`;
        const rawData = wx.getStorageSync(rawKey);
        if (rawData && rawData.value !== undefined) {
          console.log(`浣跨敤闄嶇骇缂撳瓨: ${key}`);
          return rawData.value;
        }
      } catch (e) {
        console.error('鑾峰彇闄嶇骇缂撳瓨澶辫触:', e);
      }
      
      throw error;
    }
  },

  /**
   * 鍐呴儴鏂规硶锛氳窡韪紦瀛樹娇鐢ㄦ儏鍐?   * @private
   */
  _trackCacheUsage(action, key, success) {
    // 杩欓噷鍙互娣诲姞鏇村鏉傜殑缂撳瓨浣跨敤缁熻
    // 鐩墠鍙槸绠€鍗曡褰曟棩蹇?    console.debug(`缂撳瓨鎿嶄綔: ${action} ${key} ${success ? '鎴愬姛' : '澶辫触'}`);
  }
};

// 鍒濆鍖栫紦瀛樻湇鍔?CacheService.init();

// 瀵煎嚭缂撳瓨鏈嶅姟鍜屽父閲?/**
 * 鍩虹缂撳瓨鏂规硶 - 娓呴櫎鎵€鏈夌紦瀛? */
function clearCache() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (error) {
    console.error('娓呴櫎鎵€鏈夌紦瀛樺け璐?', error);
    return false;
  }
}

/**
 * 鍩虹缂撳瓨鏂规硶 - 鎸夊墠缂€娓呴櫎缂撳瓨
 */
function clearCacheByPrefix(prefix) {
  try {
    const keys = wx.getStorageInfoSync().keys;
    keys.forEach(key => {
      if (key.startsWith(`${CACHE_PREFIX}${prefix}`)) {
        wx.removeStorageSync(key);
      }
    });
    return true;
  } catch (error) {
    console.error(`娓呴櫎鍓嶇紑涓?{prefix}鐨勭紦瀛樺け璐?`, error);
    return false;
  }
}

// 瀵煎嚭鎵€鏈夋ā鍧楀拰鏂规硶
module.exports = CacheService;
module.exports.CacheManager = CacheManager;
module.exports.CACHE_KEYS = CACHE_KEYS;
module.exports.CACHE_DURATION = CACHE_DURATION;
module.exports.setCache = setCache;
module.exports.getCache = getCache;
module.exports.removeCache = removeCache;
module.exports.clearCache = clearCache;
module.exports.clearCacheByPrefix = clearCacheByPrefix;

// 瀵煎嚭渚挎嵎鏂规硶
module.exports.setCacheItem = CacheService.set.bind(CacheService);
module.exports.getCacheItem = CacheService.get.bind(CacheService);
module.exports.removeCacheItem = CacheService.remove.bind(CacheService);
module.exports.clearCacheByType = CacheService.clearByType.bind(CacheService);
module.exports.getCacheStatistics = CacheService.getCacheStats.bind(CacheService);

// 鍏煎鏃ф帴鍙?module.exports.set = CacheService.set.bind(CacheService);
module.exports.get = CacheService.get.bind(CacheService);
module.exports.remove = CacheService.remove.bind(CacheService);
module.exports.batchSet = CacheService.batchSet.bind(CacheService);
module.exports.batchGet = CacheService.batchGet.bind(CacheService);
module.exports.batchRemove = CacheService.batchRemove.bind(CacheService);
module.exports.setIf = CacheService.setIf.bind(CacheService);
module.exports.getOrSet = CacheService.getOrSet.bind(CacheService);
module.exports.refresh = CacheService.refresh.bind(CacheService);
module.exports.clearByType = CacheService.clearByType.bind(CacheService);
module.exports.getCacheStats = CacheService.getCacheStats.bind(CacheService);
module.exports.preheat = CacheService.preheat.bind(CacheService);
module.exports.getWithFallback = CacheService.getWithFallback.bind(CacheService);
module.exports.cleanExpiredCache = CacheService.cleanExpiredCache.bind(CacheService);
module.exports.checkCacheHealth = CacheService.checkCacheHealth.bind(CacheService);
module.exports.init = CacheService.init.bind(CacheService);