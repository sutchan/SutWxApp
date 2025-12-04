/**
 * 文件名: cacheConfig.js
 * 版本号: 1.0.19
 * 更新日期: 2025-12-01
 * 作者: Sut
 * 描述: 缓存配置管理，定义不同API的缓存策略
 */

/**
 * 默认缓存配置
 */
const DEFAULT_CONFIG = {
  // 是否启用缓存
  enabled: true,
  // 最大缓存大小
  maxSize: 1024 * 1024 * 100, // 100MB
  // 默认缓存过期时间
  defaultExpiry: 60 * 60 * 1000, // 1小时
  // 是否自动清理过期缓存
  autoClean: true,
  // 自动清理间隔时间
  cleanInterval: 24 * 60 * 60 * 1000, // 24小时
  // 是否缓存图片
  cacheImages: true,
  // 最大图片缓存数量
  maxImageCacheCount: 100,
  // 请求缓存配置
  requestCache: {
    // 默认缓存策略
    defaultPolicy: 'cache_first',
    // 特定URL的缓存策略
    policies: {
      // 用户信息相关API，优先从网络获取
      '/api/user/profile': 'network_first',
      '/api/user/addresses': 'network_first',
      '/api/user/favorites': 'network_first',
      // 产品列表，优先使用缓存
      '/api/products': 'cache_first',
      '/api/products/categories': 'cache_first',
      '/api/products/recommend': 'cache_first',
      '/api/products/hot': 'cache_first',
      // 产品详情，优先使用缓存
      '/api/products/': 'cache_first',
      // 分类相关API，优先使用缓存
      '/api/categories': 'cache_first',
      // 社交相关API，优先从网络获取
      '/api/social/': 'network_first',
      // 通知相关API，优先从网络获取
      '/api/notifications': 'network_first',
      // 积分相关API，优先从网络获取
      '/api/points': 'network_first',
      // 购物车相关API，优先从网络获取
      '/api/cart': 'network_first',
      // 订单相关API，优先从网络获取
      '/api/orders': 'network_first'
    },
    // 不缓存的URL模式
    noCachePatterns: [
      '/api/auth/',
      '/api/payment/',
      '/api/upload/',
      '/api/login/',
      '/api/logout/',
      '/api/refresh-token/'
    ]
  }
};

/**
 * 缓存配置管理类
 */
class CacheConfigManager {
  constructor() {
    this.configKey = 'sut_cache_config';
    this.config = null;
    this.cleanupTimer = null;
  }

  /**
   * 閸掓繂顫愰崠鏍帳缂?   * @returns {Promise<void>}
   */
  async init() {
    // 鐏忔繆鐦禒搴＄摠閸屻劋鑵戦崝状态烘祰闁板秶鐤?    try {
      const storedConfig = await wx.getStorage({ key: this.configKey });
      this.config = { ...DEFAULT_CONFIG, ...storedConfig.data };
    } catch (error) {
      // 婵″倹鐏夐崝状态烘祰婢惰精瑙﹂敍灞煎▏閻劑绮拋銈夊帳缂?      this.config = { ...DEFAULT_CONFIG };
    }

    // 閸氼垰濮╅懛顏勫З濞撳懐鎮?    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 获取配置
   * @returns {Object} 缓存配置对象
   */
  getConfig() {
    if (!this.config) {
      return { ...DEFAULT_CONFIG };
    }
    return { ...this.config };
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   * @returns {Promise<void>}
   */
  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    await wx.setStorage({ key: this.configKey, data: this.config });

    // 闁插秵鏌婇柊宥囩枂閼奉亜濮╁〒鍛倞
    this.stopAutoCleanup();
    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 閼惧嘲褰囬悧鐟扮暰URL閻ㄥ嫮绱︾€涙鐡ラ悾?   * @param {string} url - 鐠囬攱鐪癠RL
   * @returns {string} 缂傛挸鐡ㄧ粵鏍殣
   */
  getRequestPolicy(url) {
    const config = this.getConfig();
    
    // 濡偓閺屻儲妲搁崥锕€灏柊宥勭瑝缂傛挸鐡ㄥΟ鈥崇础
    for (const pattern of config.requestCache.noCachePatterns) {
      if (url.includes(pattern)) {
        return 'no_cache';
      }
    }

    // 濡偓閺屻儳澹掔€规瓗RL閻ㄥ嫮绱︾€涙鐡ラ悾?    for (const [pattern, policy] of Object.entries(config.requestCache.policies)) {
      if (url.includes(pattern)) {
        return policy;
      }
    }

    // 鏉╂柨娲栨妯款吇缁涙牜鏆?    return config.requestCache.defaultPolicy;
  }

  /**
   * 濞ｈ濮為悧鐟扮暰URL閻ㄥ嫮绱︾€涙鐡ラ悾?   * @param {string} pattern - URL濡€崇础
   * @param {string} policy - 缂傛挸鐡ㄧ粵鏍殣
   * @returns {Promise<void>}
   */
  async addRequestPolicy(pattern, policy) {
    this.config.requestCache.policies[pattern] = policy;
    await wx.setStorage({ key: this.configKey, data: this.config });
  }

  /**
   * 缁夊娅庨悧鐟扮暰URL閻ㄥ嫮绱︾€涙鐡ラ悾?   * @param {string} pattern - URL濡€崇础
   * @returns {Promise<void>}
   */
  async removeRequestPolicy(pattern) {
    delete this.config.requestCache.policies[pattern];
    await wx.setStorage({ key: this.configKey, data: this.config });
  }

  /**
   * 濞ｈ濮炴稉宥囩处鐎涙娈慤RL濡€崇础
   * @param {string} pattern - URL濡€崇础
   * @returns {Promise<void>}
   */
  async addNoCachePattern(pattern) {
    if (!this.config.requestCache.noCachePatterns.includes(pattern)) {
      this.config.requestCache.noCachePatterns.push(pattern);
      await wx.setStorage({ key: this.configKey, data: this.config });
    }
  }

  /**
   * 缁夊娅庢稉宥囩处鐎涙娈慤RL濡€崇础
   * @param {string} pattern - URL濡€崇础
   * @returns {Promise<void>}
   */
  async removeNoCachePattern(pattern) {
    const index = this.config.requestCache.noCachePatterns.indexOf(pattern);
    if (index !== -1) {
      this.config.requestCache.noCachePatterns.splice(index, 1);
      await wx.setStorage({ key: this.configKey, data: this.config });
    }
  }

  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    this.stopAutoCleanup(); // 先停止之前的定时器
    
    this.cleanupTimer = setInterval(async () => {
      try {
        // 动态导入缓存服务，避免循环依赖
        const cacheService = require('./cacheService').instance;
        
        // 输出清理日志
        console.log('Running scheduled cache cleanup');
        
        // 清理临时缓存
        await cacheService.clearByType('temp');
        
        // 清理过期缓存
        await cacheService._cleanExpiredCache();
      } catch (error) {
        console.error('Auto cleanup error:', error);
      }
    }, this.config.cleanInterval);
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 闁插秶鐤嗘稉娲帛鐠併倝鍘ょ純?   * @returns {Promise<void>}
   */
  async reset() {
    this.config = { ...DEFAULT_CONFIG };
    await wx.setStorage({ key: this.configKey, data: this.config });
    
    // 闁插秵鏌婇柊宥囩枂閼奉亜濮╁〒鍛倞
    this.stopAutoCleanup();
    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 获取缓存状态
   * @returns {Promise<Object>} 缓存状态信息
   */
  async getCacheStatus() {
    try {
      const info = await wx.getStorageInfo();
      const config = this.getConfig();
      
      return {
        currentSize: info.currentSize,
        maxSize: config.maxSize,
        usagePercentage: (info.currentSize / config.maxSize * 100).toFixed(2),
        itemCount: info.keys.filter(key => key.startsWith('sut_cache_')).length,
        enabled: config.enabled
      };
    } catch (error) {
      console.error('Get cache status error:', error);
      return null;
    }
  }
}

// 鐎电厧鍤紓鎾崇摠闁板秶鐤嗙粻锛勬倞閸ｃ劌鐤勬笟?const cacheConfigManager = new CacheConfigManager();

// 閸掓繂顫愰崠鏍帳缂?cacheConfigManager.init().catch(error => {
  console.error('Failed to initialize cache config:', error);
});

export default cacheConfigManager;

export { DEFAULT_CONFIG };
