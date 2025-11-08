// config-service.js - 閰嶇疆绠＄悊鏈嶅姟妯″潡
// 瀵煎叆渚濊禆
const api = require('./api');
// 浣跨敤鍔ㄦ€佸鍏ヤ互鏀寔ES妯″潡
const cache = require('./cache');
const getCache = cache.getCache;
const setCache = cache.setCache;
const removeCache = cache.removeCache;
const CACHE_KEYS = cache.CACHE_KEYS;
const CACHE_DURATION = cache.CACHE_DURATION;

/**
 * 閰嶇疆绠＄悊鏈嶅姟
 * 鎻愪緵绯荤粺閰嶇疆鐨勮幏鍙栥€佹洿鏂板拰缂撳瓨绠＄悊鍔熻兘
 */
const configService = {
  /**
   * 鑾峰彇绯荤粺閰嶇疆
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊锛堝拷鐣ョ紦瀛橈級
   * @returns {Promise<Object>} - 绯荤粺閰嶇疆瀵硅薄
   */
  async getSystemConfig(forceRefresh = false) {
    try {
      // 灏濊瘯浠庣紦瀛樿幏鍙栭厤缃?      if (!forceRefresh) {
        const cachedConfig = getCache(CACHE_KEYS.SYSTEM_CONFIG);
        if (cachedConfig) {
          console.log('浣跨敤缂撳瓨鐨勭郴缁熼厤缃?);
          return cachedConfig;
        }
      }
      
      // 浠庢湇鍔″櫒鑾峰彇閰嶇疆
      const response = await api.get('/system/config', {
        useCache: true,
        cacheDuration: CACHE_DURATION.VERY_LONG // 绯荤粺閰嶇疆缂撳瓨24灏忔椂
      });
      
      // 缂撳瓨閰嶇疆
      setCache(CACHE_KEYS.SYSTEM_CONFIG, response, CACHE_DURATION.VERY_LONG);
      
      return response;
    } catch (error) {
      console.error('鑾峰彇绯荤粺閰嶇疆澶辫触:', error);
      
      // 濡傛灉璇锋眰澶辫触浣嗘湁缂撳瓨锛岃繑鍥炵紦瀛?      const cachedConfig = getCache(CACHE_KEYS.SYSTEM_CONFIG);
      if (cachedConfig) {
        console.warn('浣跨敤缂撳瓨鐨勭郴缁熼厤缃紝鍥犱负鑾峰彇澶辫触');
        return cachedConfig;
      }
      
      throw error;
    }
  },

  /**
   * 鑾峰彇鍩虹閰嶇疆
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊
   * @returns {Promise<Object>} - 鍩虹閰嶇疆瀵硅薄
   */
  async getBasicConfig(forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      return systemConfig.basic || {};
    } catch (error) {
      console.error('鑾峰彇鍩虹閰嶇疆澶辫触:', error);
      return {};
    }
  },

  /**
   * 鑾峰彇涓婚閰嶇疆
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊
   * @returns {Promise<Object>} - 涓婚閰嶇疆瀵硅薄
   */
  async getThemeConfig(forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      return systemConfig.theme || {};
    } catch (error) {
      console.error('鑾峰彇涓婚閰嶇疆澶辫触:', error);
      return {};
    }
  },

  /**
   * 鑾峰彇鍔熻兘寮€鍏抽厤缃?   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊
   * @returns {Promise<Object>} - 鍔熻兘寮€鍏抽厤缃璞?   */
  async getFeatureFlags(forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      return systemConfig.features || {};
    } catch (error) {
      console.error('鑾峰彇鍔熻兘寮€鍏抽厤缃け璐?', error);
      return {};
    }
  },

  /**
   * 妫€鏌ユ煇涓姛鑳芥槸鍚﹀紑鍚?   * @param {string} featureName - 鍔熻兘鍚嶇О
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊
   * @returns {Promise<boolean>} - 鍔熻兘鏄惁寮€鍚?   */
  async isFeatureEnabled(featureName, forceRefresh = false) {
    try {
      const features = await this.getFeatureFlags(forceRefresh);
      return features[featureName] === true;
    } catch (error) {
      console.error(`妫€鏌ュ姛鑳?${featureName} 鐘舵€佸け璐?`, error);
      return false;
    }
  },

  /**
   * 鑾峰彇缂撳瓨绛栫暐閰嶇疆
   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊
   * @returns {Promise<Object>} - 缂撳瓨绛栫暐閰嶇疆瀵硅薄
   */
  async getCacheStrategy(forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      return systemConfig.cacheStrategy || {};
    } catch (error) {
      console.error('鑾峰彇缂撳瓨绛栫暐閰嶇疆澶辫触:', error);
      return {};
    }
  },

  /**
   * 鑾峰彇鐗瑰畾閰嶇疆椤?   * @param {string} configPath - 閰嶇疆璺緞锛屾敮鎸佺偣鍒嗛殧锛屽 'theme.colors.primary'
   * @param {*} defaultValue - 榛樿鍊?   * @param {boolean} forceRefresh - 鏄惁寮哄埗鍒锋柊
   * @returns {Promise<*>} - 閰嶇疆鍊?   */
  async getConfigItem(configPath, defaultValue = null, forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      
      // 瑙ｆ瀽閰嶇疆璺緞
      const pathParts = configPath.split('.');
      let value = systemConfig;
      
      for (const part of pathParts) {
        if (value === null || typeof value !== 'object') {
          return defaultValue;
        }
        value = value[part];
      }
      
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      console.error(`鑾峰彇閰嶇疆椤?${configPath} 澶辫触:`, error);
      return defaultValue;
    }
  },

  /**
   * 娓呴櫎閰嶇疆缂撳瓨
   */
  clearConfigCache() {
    try {
      removeCache(CACHE_KEYS.SYSTEM_CONFIG);
      console.log('閰嶇疆缂撳瓨宸叉竻闄?);
    } catch (error) {
      console.error('娓呴櫎閰嶇疆缂撳瓨澶辫触:', error);
    }
  },

  /**
   * 鍒锋柊鎵€鏈夐厤缃?   * @returns {Promise<Object>} - 鍒锋柊鍚庣殑绯荤粺閰嶇疆
   */
  async refreshAllConfigs() {
    this.clearConfigCache();
    return await this.getSystemConfig(true);
  },

  /**
   * 妫€鏌ラ厤缃洿鏂?   * @returns {Promise<boolean>} - 鏄惁鏈夋洿鏂?   */
  async checkForConfigUpdates() {
    try {
      // 鑾峰彇缂撳瓨鐨勯厤缃増鏈?      const cachedConfig = getCache(CACHE_KEYS.SYSTEM_CONFIG);
      const cachedVersion = cachedConfig?.version || 0;
      
      // 鑾峰彇鏈€鏂扮増鏈俊鎭?      const versionInfo = await api.get('/system/config/version');
      
      // 姣旇緝鐗堟湰
      return versionInfo.version > cachedVersion;
    } catch (error) {
      console.error('妫€鏌ラ厤缃洿鏂板け璐?', error);
      return false;
    }
  },

  /**
   * 鑾峰彇閰嶇疆鐗堟湰淇℃伅
   * @returns {Promise<Object>} - 鐗堟湰淇℃伅
   */
  async getConfigVersion() {
    try {
      const config = await this.getSystemConfig();
      return {
        version: config.version || 'unknown',
        updatedAt: config.updatedAt || null
      };
    } catch (error) {
      console.error('鑾峰彇閰嶇疆鐗堟湰澶辫触:', error);
      return {
        version: 'unknown',
        updatedAt: null
      };
    }
  }
};

module.exports = configService;
