/**
 * cache.js - 简单缓存工具
 * 提供基础的缓存设置、获取、删除等功能
 */

// 缓存键前缀
const CACHE_PREFIX = 'sut_wxcache_';

// 常用缓存键定义，便于统一管理
const CACHE_KEYS = {
  // 用户相关
  USER_INFO: 'user_info',
  TOKEN: 'user_token',
  
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
  
  // 系统配置
  SYSTEM_CONFIG: 'system_config'
};

// 缓存过期时间配置（秒）
const CACHE_DURATION = {
  SHORT: 300, // 5分钟
  MEDIUM: 1800, // 30分钟
  LONG: 3600, // 1小时
  HIGH_FREQUENCY: 60, // 1分钟，用于高频变动的临时数据
  VERY_LONG: 86400 // 24小时，用于长期存储的稳定数据
};

// 基础缓存操作对象
const cache = {
  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} expiry - 过期时间（秒），null表示永不过期
   */
  set(key, value, expiry = CACHE_DURATION.MEDIUM) {
    try {
      const data = {
        value,
        expiry: expiry ? Date.now() + expiry * 1000 : null
      };
      wx.setStorageSync(`${CACHE_PREFIX}${key}`, data);
    } catch (error) {
      console.error('设置缓存失败:', error);
    }
  },
  
  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {*} 缓存值，如果不存在或已过期则返回null
   */
  get(key) {
    try {
      const data = wx.getStorageSync(`${CACHE_PREFIX}${key}`);
      if (!data) return null;
      
      // 检查是否过期
      if (data.expiry && Date.now() > data.expiry) {
        this.remove(key);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  },
  
  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  remove(key) {
    try {
      wx.removeStorageSync(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('删除缓存失败:', error);
    }
  },
  
  /**
   * 清空所有缓存
   */
  clear() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          wx.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('清空缓存失败:', error);
    }
  },
  
  /**
   * 根据前缀清空缓存
   * @param {string} prefix - 缓存键前缀
   */
  clearByPrefix(prefix) {
    try {
      const fullPrefix = `${CACHE_PREFIX}${prefix}`;
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(fullPrefix)) {
          wx.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('按前缀清空缓存失败:', error);
    }
  }
};

// 缓存管理类
class CacheManager {
  // 用户相关缓存
  static getUserInfo() {
    return cache.get(CACHE_KEYS.USER_INFO);
  }
  
  static setUserInfo(userInfo) {
    return cache.set(CACHE_KEYS.USER_INFO, userInfo, CACHE_DURATION.LONG);
  }
  
  // 文章相关缓存
  static getHotArticles() {
    return cache.get(CACHE_KEYS.HOT_ARTICLES);
  }
  
  static setHotArticles(articles) {
    cache.set(CACHE_KEYS.HOT_ARTICLES, articles, CACHE_DURATION.SHORT);
  }
  
  static getArticleList(page, category = '') {
    const key = `${CACHE_KEYS.ARTICLE_LIST}${category || 'all'}_${page}`;
    return cache.get(key);
  }
  
  static setArticleList(page, articles, category = '') {
    const key = `${CACHE_KEYS.ARTICLE_LIST}${category || 'all'}_${page}`;
    cache.set(key, articles, CACHE_DURATION.MEDIUM);
  }
  
  static getArticleDetail(id) {
    return cache.get(`${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`);
  }
  
  static setArticleDetail(id, article) {
    cache.set(`${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`, article, CACHE_DURATION.LONG);
  }
  
  // 购物车相关缓存
  static getCartData() {
    return cache.get(CACHE_KEYS.CART_DATA) || [];
  }
  
  static setCartData(cartData) {
    cache.set(CACHE_KEYS.CART_DATA, cartData, CACHE_DURATION.VERY_LONG);
  }
  
  // 优惠券相关缓存
  static getCouponList(status = 'available') {
    return cache.get(`${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`);
  }
  
  static setCouponList(coupons, status = 'available') {
    const duration = status === 'available' ? CACHE_DURATION.SHORT : CACHE_DURATION.MEDIUM;
    cache.set(`${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`, coupons, duration);
  }
  
  static getCouponDetail(id) {
    return cache.get(`${CACHE_KEYS.COUPON_DETAIL_PREFIX}${id}`);
  }
  
  static setCouponDetail(id, coupon) {
    cache.set(`${CACHE_KEYS.COUPON_DETAIL_PREFIX}${id}`, coupon, CACHE_DURATION.LONG);
  }
  
  // 分类相关缓存
  static getCategoryList() {
    return cache.get(CACHE_KEYS.CATEGORY_LIST);
  }
  
  static setCategoryList(categories) {
    cache.set(CACHE_KEYS.CATEGORY_LIST, categories, CACHE_DURATION.MEDIUM);
  }
  
  // 清除特定缓存
  static clearArticleCache(id) {
    if (id) {
      cache.remove(`${CACHE_KEYS.ARTICLE_DETAIL_PREFIX}${id}`);
    } else {
      cache.clearByPrefix(CACHE_KEYS.ARTICLE_LIST);
      cache.clearByPrefix(CACHE_KEYS.ARTICLE_DETAIL_PREFIX);
    }
  }
  
  static clearCouponCache(statuses = ['available', 'used', 'expired']) {
    statuses.forEach(status => {
      cache.remove(`${CACHE_KEYS.COUPON_LIST_PREFIX}${status}`);
    });
  }
  
  static clearCartCache() {
    cache.remove(CACHE_KEYS.CART_DATA);
  }
  
  static clearContentCache() {
    cache.remove(CACHE_KEYS.HOT_ARTICLES);
    this.clearArticleCache();
    cache.remove(CACHE_KEYS.CATEGORY_LIST);
  }
  
  static clearUserCache() {
    cache.remove(CACHE_KEYS.USER_INFO);
    cache.remove(CACHE_KEYS.TOKEN);
  }
  
  static clearAllCache() {
    cache.clear();
  }
}

// 导出基础缓存方法
const setCache = cache.set;
const getCache = cache.get;
const removeCache = cache.remove;
const clearCache = cache.clear;
const clearCacheByPrefix = cache.clearByPrefix;

// 统一导出所有模块内容
module.exports = {
  CACHE_KEYS,
  CACHE_DURATION,
  CacheManager,
  setCache,
  getCache,
  removeCache,
  clearCache,
  clearCacheByPrefix
};
