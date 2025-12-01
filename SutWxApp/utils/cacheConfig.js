/**
 * 鏂囦欢鍚? cacheConfig.js
 * 鐗堟湰鍙? 1.0.18
 * 鏇存柊鏃ユ湡: 2025-11-24
 * 娴ｆ粏鈧? Sut
 * 缂傛挸鐡ㄩ柊宥囩枂缁狅紕鎮婇敍灞惧絹娓氭稓绱︾€涙鐡ラ悾銉╁帳缂冾喖鎷扮粻锛勬倞閸旂喕鍏? */

/**
 * 姒涙顓荤紓鎾崇摠闁板秶鐤? */
const DEFAULT_CONFIG = {
  // 閺勵垰鎯侀崥顖滄暏缂傛挸鐡?  enabled: true,
  // 缂傛挸鐡ㄦ径褍鐨梽鎰煑閿涘牆鐡ч懞鍌︾礆
  maxSize: 1024 * 1024 * 100, // 100MB
  // 姒涙顓绘潻鍥ㄦ埂閺冨爼妫块敍鍫燁嚑缁夋帪绱?  defaultExpiry: 60 * 60 * 1000, // 1鐏忓繑妞?  // 閺勵垰鎯侀懛顏勫З濞撳懐鎮婃潻鍥ㄦ埂缂傛挸鐡?  autoClean: true,
  // 閼奉亜濮╁〒鍛倞闂傛挳娈ч敍鍫燁嚑缁夋帪绱?  cleanInterval: 24 * 60 * 60 * 1000, // 24鐏忓繑妞?  // 閺勵垰鎯佺紓鎾崇摠閸ュ墽澧?  cacheImages: true,
  // 閸ュ墽澧栫紓鎾崇摠閺堚偓婢堆勬殶闁?  maxImageCacheCount: 100,
  // 鐠囬攱鐪扮紓鎾崇摠闁板秶鐤?  requestCache: {
    // 姒涙顓荤紓鎾崇摠缁涙牜鏆?    defaultPolicy: 'cache_first',
    // 閻楃懓鐣綰RL閻ㄥ嫮绱︾€涙鐡ラ悾?    policies: {
      // 缁€杞扮伐闁板秶鐤嗛敍?/api/user/profile': 'network_first'
    },
    // 娑撳秶绱︾€涙娈慤RL濡€崇础
    noCachePatterns: [
      '/api/auth/',
      '/api/payment/',
      '/api/upload/'
    ]
  }
};

/**
 * 缂傛挸鐡ㄩ柊宥囩枂缁狅紕鎮婄猾? */
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
    // 鐏忔繆鐦禒搴＄摠閸屻劋鑵戦崝鐘烘祰闁板秶鐤?    try {
      const storedConfig = await wx.getStorage({ key: this.configKey });
      this.config = { ...DEFAULT_CONFIG, ...storedConfig.data };
    } catch (error) {
      // 婵″倹鐏夐崝鐘烘祰婢惰精瑙﹂敍灞煎▏閻劑绮拋銈夊帳缂?      this.config = { ...DEFAULT_CONFIG };
    }

    // 閸氼垰濮╅懛顏勫З濞撳懐鎮?    if (this.config.autoClean) {
      this.startAutoCleanup();
    }
  }

  /**
   * 閼惧嘲褰囬柊宥囩枂
   * @returns {Object} 缂傛挸鐡ㄩ柊宥囩枂鐎电钖?   */
  getConfig() {
    if (!this.config) {
      return { ...DEFAULT_CONFIG };
    }
    return { ...this.config };
  }

  /**
   * 閺囧瓨鏌婇柊宥囩枂
   * @param {Object} newConfig - 閺備即鍘ょ純?   * @returns {Promise<void>}
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
   * 閸氼垰濮╅懛顏勫З濞撳懐鎮?   */
  startAutoCleanup() {
    this.stopAutoCleanup(); // 閸忓牆浠犲顫閸撳秶娈戠€规碍妞傞崳?    
    this.cleanupTimer = setInterval(async () => {
      try {
        // 閸斻劍鈧礁顕遍崗銉や簰闁灝鍘ゅ顏嗗箚娓氭繆绂?        const cacheService = require('./cacheService').default;
        
        // 鏉╂瑩鍣烽崣顖欎簰濞ｈ濮為弴鏉戭樋閻ㄥ嫭绔婚悶鍡涒偓鏄忕帆
        console.log('Running scheduled cache cleanup');
        
        // 濞撳懐鎮婃稉瀛樻缂傛挸鐡?        await cacheService.clearByType('temp');
        
        // 閸欘垯浜掑ǎ璇插閸忔湹绮猾璇茬€烽惃鍕处鐎涙ɑ绔婚悶?      } catch (error) {
        console.error('Auto cleanup error:', error);
      }
    }, this.config.cleanInterval);
  }

  /**
   * 閸嬫粍顒涢懛顏勫З濞撳懐鎮?   */
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
   * 閼惧嘲褰囩紓鎾崇摠娴ｈ法鏁ら悩鑸碘偓?   * @returns {Promise<Object>} 缂傛挸鐡ㄩ悩鑸碘偓浣蜂繆閹?   */
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
