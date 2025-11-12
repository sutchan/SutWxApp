/**
 * cache-service.js - 缓存管理服务模块
 * 该模块提供了微信小程序中的缓存操作封装，包括设置缓存、获取缓存、清理缓存等功能
 * 支持缓存过期时间设置、批量操作、条件缓存等高级功能
 */
const CACHE_PREFIX = 'sut_wxcache_';

/**
 * 缓存键名常量定义 - 统一管理所有缓存键名
 */
const CACHE_KEYS = {
  // 系统配置
  SYSTEM_CONFIG: 'system_config',
  THEME_CONFIG: 'theme_config',
  BASIC_CONFIG: 'basic_config',
  
  // 用户相关
  USER_INFO: 'user_info',
  USER_PROFILE: 'user_profile',
  AUTH_TOKEN: 'auth_token',
  TOKEN: 'user_token', // 用户令牌
  
  // 文章相关
  HOT_ARTICLES: 'hot_articles',
  ARTICLE_LIST: 'article_list_',
  ARTICLE_DETAIL_PREFIX: 'article_detail_',
  
  // 购物车相关
  CART_DATA: 'cart_data',
  COUPON_LIST_PREFIX: 'coupon_list_',
  COUPON_DETAIL_PREFIX: 'coupon_detail_',
  
  // 分类相关
  CATEGORY_LIST: 'category_list',
  
  // 搜索相关
  SEARCH_HISTORY: 'search_history',
  SEARCH_SUGGESTIONS: 'search_suggestions',
  
  // 通知相关
  NOTIFICATION_LIST: 'notification_list',
  UNREAD_COUNT: 'unread_count',
  
  // 收藏和历史记录
  FAVORITES: 'favorites',
  RECENTLY_VIEWED: 'recently_viewed'
};

/**
 * 缓存持续时间常量 - 定义不同类型缓存的过期时间
 */
const CACHE_DURATION = {
  // 高频数据缓存
  HIGH_FREQUENCY: 60 * 1000, // 1分钟
  
  // 短期缓存
  SHORT: 5 * 60 * 1000, // 5分钟
  
  // 中等缓存
  MEDIUM: 15 * 60 * 1000, // 15分钟
  
  // 长期缓存
  LONG: 60 * 60 * 1000, // 1小时
  
  // 极长期缓存
  VERY_LONG: 24 * 60 * 60 * 1000 // 24小时
};

/**
 * 缓存管理器 - 提供按类型清理缓存的高级功能
 */
class CacheManager {
  // 清理用户相关缓存
  static clearUserCache() {
    const userKeys = [CACHE_KEYS.USER_INFO, CACHE_KEYS.USER_PROFILE, CACHE_KEYS.AUTH_TOKEN, CACHE_KEYS.TOKEN];
    userKeys.forEach(key => {
      try {
        wx.removeStorageSync(`${CACHE_PREFIX}${key}`);
      } catch (error) {
        console.error(`清理用户相关缓存失败: ${key}`, error);
      }
    });
  }
  
  // 清理内容相关缓存
  static clearContentCache() {
    const contentKeys = [CACHE_KEYS.SEARCH_HISTORY, CACHE_KEYS.SEARCH_SUGGESTIONS];
    contentKeys.forEach(key => {
      try {
        wx.removeStorageSync(`${CACHE_PREFIX}${key}`);
      } catch (error) {
        console.error(`清理内容相关缓存失败: ${key}`, error);
      }
    });
    
    // 清理文章缓存
    CacheManager.clearArticleCache();
  }
  
  // 清理购物车缓存
  static clearCartCache() {
    try {
      wx.removeStorageSync(`${CACHE_PREFIX}${CACHE_KEYS.CART_DATA}`);
    } catch (error) {
      console.error('清理购物车缓存失败', error);
    }
  }
  
  // 清理优惠券缓存
  static clearCouponCache(statuses = ['available', 'used', 'expired']) {
    statuses.forEach(status => {
      try {
        wx.removeStorageSync(`${CACHE_PREFIX}${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`);
      } catch (error) {
        console.error(`清理优惠券缓存失败(${status}):`, error);
      }
    });
  }
  
  // 清理所有缓存
  static clearAllCache() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            wx.removeStorageSync(key);
          } catch (e) {
            console.error(`清理缓存项失败: ${key}`, e);
          }
        }
      });
    } catch (error) {
      console.error('清理所有缓存失败', error);
    }
  }
  
  // 获取用户信息缓存
  static getUserInfo() {
    return getCache(CACHE_KEYS.USER_INFO);
  }
  
  // 设置用户信息缓存
  static setUserInfo(userInfo) {
    setCache(CACHE_KEYS.USER_INFO, userInfo, CACHE_DURATION.MEDIUM);
  }
  
  // 获取热门文章缓存
  static getHotArticles() {
    return getCache(CACHE_KEYS.HOT_ARTICLES);
  }
  
  // 设置热门文章缓存
  static setHotArticles(articles) {
    setCache(CACHE_KEYS.HOT_ARTICLES, articles, CACHE_DURATION.SHORT);
  }
  
  // 获取文章列表缓存
  static getArticleList(category, page) {
    const key = `${CACHE_KEYS.ARTICLE_LIST}${category}_${page}`;
    return getCache(key);
  }
  
  // 设置文章列表缓存
  static setArticleList(category, page, articles) {
    const key = `${CACHE_KEYS.ARTICLE_LIST}${category}_${page}`;
    setCache(key, articles, CACHE_DURATION.SHORT);
  }
  
  // 获取文章详情缓存
  static getArticleDetail(id) {
    const key = `${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`;
    return getCache(key);
  }
  
  // 设置文章详情缓存
  static setArticleDetail(id, article) {
    const key = `${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`;
    setCache(key, article, CACHE_DURATION.MEDIUM);
  }
  
  // 获取购物车数据缓存
  static getCartData() {
    return getCache(CACHE_KEYS.CART_DATA);
  }
  
  // 设置购物车数据缓存
  static setCartData(cartData) {
    setCache(CACHE_KEYS.CART_DATA, cartData, CACHE_DURATION.HIGH_FREQUENCY);
  }
  
  // 获取优惠券列表缓存
  static getCouponList(status) {
    const key = `${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`;
    return getCache(key);
  }
  
  // 设置优惠券列表缓存
  static setCouponList(status, coupons) {
    const key = `${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`;
    setCache(key, coupons, CACHE_DURATION.SHORT);
  }
  
  // 获取优惠券详情缓存
  static getCouponDetail(id) {
    const key = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${id}`;
    return getCache(key);
  }
  
  // 设置优惠券详情缓存
  static setCouponDetail(id, coupon) {
    const key = `${CACHE_KEYS.COUPON_DETAIL_PREFIX}${id}`;
    setCache(key, coupon, CACHE_DURATION.MEDIUM);
  }
  
  // 获取分类列表缓存
  static getCategoryList() {
    return getCache(CACHE_KEYS.CATEGORY_LIST);
  }
  
  // 设置分类列表缓存
  static setCategoryList(categories) {
    setCache(CACHE_KEYS.CATEGORY_LIST, categories, CACHE_DURATION.LONG);
  }
  
  // 清理文章缓存
  static clearArticleCache(id) {
    try {
      if (id) {
        // 清理指定文章的缓存
        const articleKey = `${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`;
        wx.removeStorageSync(`${CACHE_PREFIX}${articleKey}`);
      } else {
        // 清理所有文章缓存
        const keys = wx.getStorageInfoSync().keys;
        keys.forEach(key => {
          if (key.startsWith(`${CACHE_PREFIX}${CACHE_KEYS.ARTICLE_LIST}`) || 
              key.startsWith(`${CACHE_PREFIX}${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}`)) {
            wx.removeStorageSync(key);
          }
        });
        // 清理热门文章缓存
        wx.removeStorageSync(`${CACHE_PREFIX}${CACHE_KEYS.HOT_ARTICLES}`);
      }
    } catch (error) {
      console.error('清理文章缓存失败:', error);
    }
  }
}

/**
 * 设置缓存 - 内部函数
 * @param {string} key - 缓存键名
 * @param {*} value - 缓存值
 * @param {number} expiry - 过期时间（毫秒）
 */
function setCache(key, value, expiry) {
  try {
    const now = Date.now();
    const item = {
      value: value,
      expiry: expiry ? now + expiry : null
    };
    wx.setStorageSync(`${CACHE_PREFIX}${key}`, item);
    return true;
  } catch (error) {
    console.error(`设置缓存失败: ${key}`, error);
    return false;
  }
}

/**
 * 获取缓存 - 内部函数
 * @param {string} key - 缓存键名
 * @returns {*} 缓存值，如果不存在或已过期则返回null
 */
function getCache(key) {
  try {
    const item = wx.getStorageSync(`${CACHE_PREFIX}${key}`);
    
    // 如果缓存不存在
    if (!item || item.value === undefined) {
      return null;
    }
    
    // 检查是否过期
    if (item.expiry && Date.now() > item.expiry) {
      // 过期后删除缓存
      wx.removeStorageSync(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return item.value;
  } catch (error) {
    console.error(`获取缓存失败: ${key}`, error);
    return null;
  }
}

/**
 * 删除缓存 - 内部函数
 * @param {string} key - 缓存键名
 * @returns {boolean} 是否删除成功
 */
function removeCache(key) {
  try {
    wx.removeStorageSync(`${CACHE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`删除缓存失败: ${key}`, error);
    return false;
  }
}

/**
 * 缓存服务对象 - 提供高级缓存操作API
 */
const CacheService = {
  // 缓存使用统计数据
  _usageStats: {},
  
  // 初始化缓存服务
  init() {
    try {
      this.cleanExpiredCache();
      this.checkCacheHealth();
    } catch (error) {
      console.error('初始化缓存服务失败', error);
    }
  },
  
  // 检查缓存健康状态
  checkCacheHealth() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      
      // 检查存储空间是否充足（低于80%视为健康）
      if (storageInfo.currentSize / storageInfo.limitSize > 0.8) {
        console.warn('缓存空间即将耗尽，建议清理部分缓存');
        this.cleanExpiredCache();
      }
    } catch (error) {
      console.error('检查缓存健康状态失败', error);
    }
  },
  
  // 清理过期缓存
  cleanExpiredCache() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      let cleanedCount = 0;
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const item = wx.getStorageSync(key);
          if (item && item.expiry && Date.now() > item.expiry) {
            wx.removeStorageSync(key);
            cleanedCount++;
          }
        }
      });
      
      console.log(`已清理 ${cleanedCount} 个过期缓存项`);
    } catch (error) {
      console.error('清理过期缓存失败:', error);
    }
  },
  
  // 设置缓存
  async set(key, value, expiry = CACHE_DURATION.MEDIUM, options = {}) {
    try {
      // 支持字符串常量设置过期时间
      if (typeof expiry === 'string') {
        if (CACHE_DURATION[expiry]) {
          expiry = CACHE_DURATION[expiry];
        }
      }

      // 序列化选项
      let cacheValue = value;
      if (options.serialize && typeof value === 'object') {
        cacheValue = JSON.stringify(value);
      }

      // 设置缓存
      const success = setCache(key, cacheValue, expiry);
      
      // 记录缓存使用情况
      if (success && options.trackUsage) {
        this._trackCacheUsage('set', key, expiry);
      }
      
      return success;
    } catch (error) {
      console.error('设置缓存失败:', error);
      return false;
    }
  },
  
  // 获取缓存
  async get(key, fallback = null, options = {}) {
    try {
      const value = getCache(key);
      
      if (value !== null) {
        let result = value;
        // 反序列化选项
        if (options.deserialize && typeof value === 'string') {
          try {
            result = JSON.parse(value);
          } catch (e) {
            console.error('反序列化缓存失败', e);
            result = value;
          }
        }
        
        // 记录缓存使用情况
        if (options.trackUsage) {
          this._trackCacheUsage('get', key, true);
        }
        
        return result;
      }
      
      // 记录缓存未命中
      if (options.trackUsage) {
        this._trackCacheUsage('get', key, false);
      }
      
      return fallback;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return fallback;
    }
  },
  
  // 批量设置缓存
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
  
  // 批量获取缓存
  async batchGet(keys) {
    const result = {};

    for (const key of keys) {
      result[key] = await this.get(key);
    }

    return result;
  },
  
  // 删除缓存
  async remove(key) {
    try {
      removeCache(key);
      return true;
    } catch (error) {
      console.error(`删除缓存失败: ${key}`, error);
      return false;
    }
  },
  
  // 批量删除缓存
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
        console.error(`删除缓存失败: ${key}`, error);
        result.failed.push(key);
      }
    }

    return result;
  },
  
  // 条件设置缓存
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
      console.error('条件设置缓存失败', error);
      return null;
    }
  },
  
  // 获取或设置缓存
  async getOrSet(key, valueFn, expiry = CACHE_DURATION.MEDIUM) {
    const cachedValue = await this.get(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const value = typeof valueFn === 'function' ? await valueFn() : valueFn;
    await this.set(key, value, expiry);
    return value;
  },
  
  // 刷新缓存
  async refresh(key, valueFn, expiry = CACHE_DURATION.MEDIUM) {
    try {
      const value = typeof valueFn === 'function' ? await valueFn() : valueFn;
      await this.set(key, value, expiry);
      return value;
    } catch (error) {
      console.error('刷新缓存失败', error);
      // 刷新失败时返回旧值
      return await this.get(key);
    }
  },
  
  // 按类型清理缓存
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
          console.warn(`未知的缓存类型: ${type}`);
          return false;
      }
      return true;
    } catch (error) {
      console.error(`清理缓存类型 ${type} 失败`, error);
      return false;
    }
  },
  
  // 获取缓存统计信息
  getCacheStats() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      const keys = storageInfo.keys;
      let ourCacheCount = 0;
      let totalSize = 0;

      // 计算我们的缓存项数量和大小
      keys.forEach(key => {
        if (key.startsWith('sut_wxcache_')) {
          ourCacheCount++;
          try {
            const data = wx.getStorageSync(key);
            totalSize += JSON.stringify(data).length;
          } catch (e) {
            console.error(`获取缓存项失败: ${key}`, e);
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
      console.error('获取缓存统计信息失败:', error);
      return null;
    }
  },
  
  // 预热缓存
  async preheat(items) {
    const results = [];

    for (const item of items) {
      const { key, valueFn, expiry = CACHE_DURATION.MEDIUM } = item;
      try {
        const value = await valueFn();
        await this.set(key, value, expiry);
        results.push({ key, success: true });
      } catch (error) {
        console.error(`预热缓存失败: ${key}`, error);
        results.push({ key, success: false, error: error.message });
      }
    }

    return results;
  },
  
  // 获取缓存，失败时使用后备策略
  async getWithFallback(key, valueFn, expiry = CACHE_DURATION.MEDIUM) {
    try {
      // 先尝试从缓存获取
      const cachedValue = await this.get(key);
      if (cachedValue !== null) {
        return cachedValue;
      }
      
      // 缓存未命中，获取新值
      const value = typeof valueFn === 'function' ? await valueFn() : valueFn;
      await this.set(key, value, expiry);
      return value;
    } catch (error) {
      console.warn(`获取缓存失败，尝试获取原始缓存值: ${key}`, error);
      
      // 尝试直接读取原始缓存（不检查过期）
      try {
        const rawKey = `sut_wxcache_${key}`;
        const rawData = wx.getStorageSync(rawKey);
        if (rawData && rawData.value !== undefined) {
          console.log(`使用原始缓存值: ${key}`);
          return rawData.value;
        }
      } catch (e) {
        console.error('获取原始缓存失败:', e);
      }
      
      // 如果所有尝试都失败，抛出原始错误
      throw error;
    }
  },
  
  // 记录缓存使用情况
  _trackCacheUsage(action, key, success) {
    if (!this._usageStats[key]) {
      this._usageStats[key] = {
        hits: 0,
        misses: 0,
        sets: 0,
        lastAccessed: null
      };
    }
    
    if (action === 'get') {
      if (success) {
        this._usageStats[key].hits++;
      } else {
        this._usageStats[key].misses++;
      }
    } else if (action === 'set') {
      this._usageStats[key].sets++;
    }
    
    this._usageStats[key].lastAccessed = Date.now();
  }
};

/**
 * 清理所有缓存 - 工具函数
 * @returns {boolean} 是否清理成功
 */
function clearCache() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (error) {
    console.error('清理所有缓存失败', error);
    return false;
  }
}

/**
 * 按前缀清理缓存 - 工具函数
 * @param {string} prefix - 缓存键前缀
 * @returns {boolean} 是否清理成功
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
    console.error(`按前缀清理缓存失败: ${prefix}`, error);
    return false;
  }
}

// 导出模块
exports = module.exports = CacheService;
module.exports.CacheManager = CacheManager;
module.exports.CACHE_KEYS = CACHE_KEYS;
module.exports.CACHE_DURATION = CACHE_DURATION;
module.exports.setCache = setCache;
module.exports.getCache = getCache;
module.exports.removeCache = removeCache;
module.exports.clearCache = clearCache;
module.exports.clearCacheByPrefix = clearCacheByPrefix;

// 兼容性导出
exports.getCacheItem = CacheService.get.bind(CacheService);
exports.removeCacheItem = CacheService.remove.bind(CacheService);
exports.clearCacheByType = CacheService.clearByType.bind(CacheService);
exports.getCacheStatistics = CacheService.getCacheStats.bind(CacheService);

// 直接导出常用方法
exports.get = CacheService.get.bind(CacheService);
exports.set = CacheService.set.bind(CacheService);
exports.remove = CacheService.remove.bind(CacheService);
exports.batchSet = CacheService.batchSet.bind(CacheService);
exports.batchGet = CacheService.batchGet.bind(CacheService);
exports.batchRemove = CacheService.batchRemove.bind(CacheService);
exports.setIf = CacheService.setIf.bind(CacheService);
exports.getOrSet = CacheService.getOrSet.bind(CacheService);
exports.refresh = CacheService.refresh.bind(CacheService);
exports.clearByType = CacheService.clearByType.bind(CacheService);
exports.getCacheStats = CacheService.getCacheStats.bind(CacheService);
exports.preheat = CacheService.preheat.bind(CacheService);
exports.getWithFallback = CacheService.getWithFallback.bind(CacheService);
exports.cleanExpiredCache = CacheService.cleanExpiredCache.bind(CacheService);
exports.checkCacheHealth = CacheService.checkCacheHealth.bind(CacheService);
exports.init = CacheService.init.bind(CacheService);