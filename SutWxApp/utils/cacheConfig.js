/**
 * 文件名: cacheConfig.js
 * 版本号: 1.0.18
 * 更新日期: 2025-11-23
 * 描述: 缓存配置管理，提供缓存策略配置和管理功能
 */

/**
 * 默认缓存配置
 */
const DEFAULT_CONFIG = {
  // 是否启用缓存
  enabled: true,
  // 缓存大小限制（字节）
  maxSize: 1024 * 1024 * 100, // 100MB
  // 默认过期时间（毫秒）
  defaultExpiry: 60 * 60 * 1000, // 1小时
  // 是否自动清理过期缓存
  autoClean: true,
  // 自动清理间隔（毫秒）
  cleanInterval: 24 * 60 * 60 * 1000, // 24小时
  // 是否缓存图片
  cacheImages: true,
  // 图片缓存最大数量
  maxImageCacheCount: 100,
  // 请求缓存配置
  requestCache: {
    // 默认缓存策略
    defaultPolicy: 'cache_first',
    // 特定URL的缓存策略
    policies: {
      // 示例配置：'/api/user/profile': 'network_first'
    },
    // 不缓存的URL模式
    noCachePatterns: [
      '/api/auth/',
      '/api/payment/',
      '/api/upload/'
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
   * 初始化配置
   * @returns {Promise<void>}
   */
  async init() {
    // 尝试从存储中加载配置
    try {
      const storedConfig = await wx.getStorage({ key: this.configKey });
      this.config = { ...DEFAULT_CONFIG, ...storedConfig.data };
    } catch (error) {
      // 如果加载失败，使用默认配置
      this.config = { ...DEFAULT_CONFIG };
    }

    // 启动自动清理
    if (this.config.autoClean) {
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

    // 重新配置自动清理
    this.stopAutoCleanup();
    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 获取特定URL的缓存策略
   * @param {string} url - 请求URL
   * @returns {string} 缓存策略
   */
  getRequestPolicy(url) {
    const config = this.getConfig();
    
    // 检查是否匹配不缓存模式
    for (const pattern of config.requestCache.noCachePatterns) {
      if (url.includes(pattern)) {
        return 'no_cache';
      }
    }

    // 检查特定URL的缓存策略
    for (const [pattern, policy] of Object.entries(config.requestCache.policies)) {
      if (url.includes(pattern)) {
        return policy;
      }
    }

    // 返回默认策略
    return config.requestCache.defaultPolicy;
  }

  /**
   * 添加特定URL的缓存策略
   * @param {string} pattern - URL模式
   * @param {string} policy - 缓存策略
   * @returns {Promise<void>}
   */
  async addRequestPolicy(pattern, policy) {
    this.config.requestCache.policies[pattern] = policy;
    await wx.setStorage({ key: this.configKey, data: this.config });
  }

  /**
   * 移除特定URL的缓存策略
   * @param {string} pattern - URL模式
   * @returns {Promise<void>}
   */
  async removeRequestPolicy(pattern) {
    delete this.config.requestCache.policies[pattern];
    await wx.setStorage({ key: this.configKey, data: this.config });
  }

  /**
   * 添加不缓存的URL模式
   * @param {string} pattern - URL模式
   * @returns {Promise<void>}
   */
  async addNoCachePattern(pattern) {
    if (!this.config.requestCache.noCachePatterns.includes(pattern)) {
      this.config.requestCache.noCachePatterns.push(pattern);
      await wx.setStorage({ key: this.configKey, data: this.config });
    }
  }

  /**
   * 移除不缓存的URL模式
   * @param {string} pattern - URL模式
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
        // 动态导入以避免循环依赖
        const cacheService = require('./cacheService').default;
        
        // 这里可以添加更多的清理逻辑
        console.log('Running scheduled cache cleanup');
        
        // 清理临时缓存
        await cacheService.clearByType('temp');
        
        // 可以添加其他类型的缓存清理
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
   * 重置为默认配置
   * @returns {Promise<void>}
   */
  async reset() {
    this.config = { ...DEFAULT_CONFIG };
    await wx.setStorage({ key: this.configKey, data: this.config });
    
    // 重新配置自动清理
    this.stopAutoCleanup();
    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 获取缓存使用状态
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

// 导出缓存配置管理器实例
const cacheConfigManager = new CacheConfigManager();

// 初始化配置
cacheConfigManager.init().catch(error => {
  console.error('Failed to initialize cache config:', error);
});

export default cacheConfigManager;

export { DEFAULT_CONFIG };
