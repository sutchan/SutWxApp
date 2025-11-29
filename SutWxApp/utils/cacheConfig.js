/**
 * 鏂囦欢鍚? cacheConfig.js
 * 鐗堟湰鍙? 1.0.18
 * 鏇存柊鏃ユ湡: 2025-11-24
 * 浣滆€? Sut
 * 缂撳瓨閰嶇疆绠＄悊锛屾彁渚涚紦瀛樼瓥鐣ラ厤缃拰绠＄悊鍔熻兘
 */

/**
 * 榛樿缂撳瓨閰嶇疆
 */
const DEFAULT_CONFIG = {
  // 鏄惁鍚敤缂撳瓨
  enabled: true,
  // 缂撳瓨澶у皬闄愬埗锛堝瓧鑺傦級
  maxSize: 1024 * 1024 * 100, // 100MB
  // 榛樿杩囨湡鏃堕棿锛堟绉掞級
  defaultExpiry: 60 * 60 * 1000, // 1灏忔椂
  // 鏄惁鑷姩娓呯悊杩囨湡缂撳瓨
  autoClean: true,
  // 鑷姩娓呯悊闂撮殧锛堟绉掞級
  cleanInterval: 24 * 60 * 60 * 1000, // 24灏忔椂
  // 鏄惁缂撳瓨鍥剧墖
  cacheImages: true,
  // 鍥剧墖缂撳瓨鏈€澶ф暟閲?  maxImageCacheCount: 100,
  // 璇锋眰缂撳瓨閰嶇疆
  requestCache: {
    // 榛樿缂撳瓨绛栫暐
    defaultPolicy: 'cache_first',
    // 鐗瑰畾URL鐨勭紦瀛樼瓥鐣?    policies: {
      // 绀轰緥閰嶇疆锛?/api/user/profile': 'network_first'
    },
    // 涓嶇紦瀛樼殑URL妯″紡
    noCachePatterns: [
      '/api/auth/',
      '/api/payment/',
      '/api/upload/'
    ]
  }
};

/**
 * 缂撳瓨閰嶇疆绠＄悊绫? */
class CacheConfigManager {
  constructor() {
    this.configKey = 'sut_cache_config';
    this.config = null;
    this.cleanupTimer = null;
  }

  /**
   * 鍒濆鍖栭厤缃?   * @returns {Promise<void>}
   */
  async init() {
    // 灏濊瘯浠庡瓨鍌ㄤ腑鍔犺浇閰嶇疆
    try {
      const storedConfig = await wx.getStorage({ key: this.configKey });
      this.config = { ...DEFAULT_CONFIG, ...storedConfig.data };
    } catch (error) {
      // 濡傛灉鍔犺浇澶辫触锛屼娇鐢ㄩ粯璁ら厤缃?      this.config = { ...DEFAULT_CONFIG };
    }

    // 鍚姩鑷姩娓呯悊
    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 鑾峰彇閰嶇疆
   * @returns {Object} 缂撳瓨閰嶇疆瀵硅薄
   */
  getConfig() {
    if (!this.config) {
      return { ...DEFAULT_CONFIG };
    }
    return { ...this.config };
  }

  /**
   * 鏇存柊閰嶇疆
   * @param {Object} newConfig - 鏂伴厤缃?   * @returns {Promise<void>}
   */
  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    await wx.setStorage({ key: this.configKey, data: this.config });

    // 閲嶆柊閰嶇疆鑷姩娓呯悊
    this.stopAutoCleanup();
    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 鑾峰彇鐗瑰畾URL鐨勭紦瀛樼瓥鐣?   * @param {string} url - 璇锋眰URL
   * @returns {string} 缂撳瓨绛栫暐
   */
  getRequestPolicy(url) {
    const config = this.getConfig();
    
    // 妫€鏌ユ槸鍚﹀尮閰嶄笉缂撳瓨妯″紡
    for (const pattern of config.requestCache.noCachePatterns) {
      if (url.includes(pattern)) {
        return 'no_cache';
      }
    }

    // 妫€鏌ョ壒瀹歎RL鐨勭紦瀛樼瓥鐣?    for (const [pattern, policy] of Object.entries(config.requestCache.policies)) {
      if (url.includes(pattern)) {
        return policy;
      }
    }

    // 杩斿洖榛樿绛栫暐
    return config.requestCache.defaultPolicy;
  }

  /**
   * 娣诲姞鐗瑰畾URL鐨勭紦瀛樼瓥鐣?   * @param {string} pattern - URL妯″紡
   * @param {string} policy - 缂撳瓨绛栫暐
   * @returns {Promise<void>}
   */
  async addRequestPolicy(pattern, policy) {
    this.config.requestCache.policies[pattern] = policy;
    await wx.setStorage({ key: this.configKey, data: this.config });
  }

  /**
   * 绉婚櫎鐗瑰畾URL鐨勭紦瀛樼瓥鐣?   * @param {string} pattern - URL妯″紡
   * @returns {Promise<void>}
   */
  async removeRequestPolicy(pattern) {
    delete this.config.requestCache.policies[pattern];
    await wx.setStorage({ key: this.configKey, data: this.config });
  }

  /**
   * 娣诲姞涓嶇紦瀛樼殑URL妯″紡
   * @param {string} pattern - URL妯″紡
   * @returns {Promise<void>}
   */
  async addNoCachePattern(pattern) {
    if (!this.config.requestCache.noCachePatterns.includes(pattern)) {
      this.config.requestCache.noCachePatterns.push(pattern);
      await wx.setStorage({ key: this.configKey, data: this.config });
    }
  }

  /**
   * 绉婚櫎涓嶇紦瀛樼殑URL妯″紡
   * @param {string} pattern - URL妯″紡
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
   * 鍚姩鑷姩娓呯悊
   */
  startAutoCleanup() {
    this.stopAutoCleanup(); // 鍏堝仠姝箣鍓嶇殑瀹氭椂鍣?    
    this.cleanupTimer = setInterval(async () => {
      try {
        // 鍔ㄦ€佸鍏ヤ互閬垮厤寰幆渚濊禆
        const cacheService = require('./cacheService').default;
        
        // 杩欓噷鍙互娣诲姞鏇村鐨勬竻鐞嗛€昏緫
        console.log('Running scheduled cache cleanup');
        
        // 娓呯悊涓存椂缂撳瓨
        await cacheService.clearByType('temp');
        
        // 鍙互娣诲姞鍏朵粬绫诲瀷鐨勭紦瀛樻竻鐞?      } catch (error) {
        console.error('Auto cleanup error:', error);
      }
    }, this.config.cleanInterval);
  }

  /**
   * 鍋滄鑷姩娓呯悊
   */
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 閲嶇疆涓洪粯璁ら厤缃?   * @returns {Promise<void>}
   */
  async reset() {
    this.config = { ...DEFAULT_CONFIG };
    await wx.setStorage({ key: this.configKey, data: this.config });
    
    // 閲嶆柊閰嶇疆鑷姩娓呯悊
    this.stopAutoCleanup();
    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 鑾峰彇缂撳瓨浣跨敤鐘舵€?   * @returns {Promise<Object>} 缂撳瓨鐘舵€佷俊鎭?   */
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

// 瀵煎嚭缂撳瓨閰嶇疆绠＄悊鍣ㄥ疄渚?const cacheConfigManager = new CacheConfigManager();

// 鍒濆鍖栭厤缃?cacheConfigManager.init().catch(error => {
  console.error('Failed to initialize cache config:', error);
});

export default cacheConfigManager;

export { DEFAULT_CONFIG };
