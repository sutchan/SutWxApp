/**
 * 配置服务
 * 负责获取和管理应用的全局配置信息
 */

const api = require('./api');
// 导入缓存工具
const cache = require('./cache');
const getCache = cache.getCache;
const setCache = cache.setCache;
const removeCache = cache.removeCache;
const CACHE_KEYS = cache.CACHE_KEYS;
const CACHE_DURATION = cache.CACHE_DURATION;

/**
 * 配置服务
 * 提供获取系统配置、主题配置、功能开关等功能
 */
const configService = {
  /**
   * 获取系统配置
   * @param {boolean} forceRefresh - 是否强制刷新缓存获取最新配置
   * @returns {Promise<Object>} - 系统配置对象
   */
  async getSystemConfig(forceRefresh = false) {
    try {
      // 尝试从缓存获取
      if (!forceRefresh) {
        const cachedConfig = getCache(CACHE_KEYS.SYSTEM_CONFIG);
        if (cachedConfig) {
          console.log('从缓存获取系统配置');
          return cachedConfig;
        }
      }
      
      // 从服务器获取最新配置
      const response = await api.get('/system/config', {
        useCache: true,
        cacheDuration: CACHE_DURATION.VERY_LONG // 系统配置缓存24小时
      });
      
      // 缓存配置
      setCache(CACHE_KEYS.SYSTEM_CONFIG, response, CACHE_DURATION.VERY_LONG);
      
      return response;
    } catch (error) {
      console.error('获取系统配置失败:', error);
      
      // 尝试返回缓存配置作为备用
      const cachedConfig = getCache(CACHE_KEYS.SYSTEM_CONFIG);
      if (cachedConfig) {
        console.warn('从缓存获取系统配置作为备用');
        return cachedConfig;
      }
      
      throw error;
    }
  },

  /**
   * 获取基础配置
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} - 基础配置对象
   */
  async getBasicConfig(forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      return systemConfig.basic || {};
    } catch (error) {
      console.error('获取基础配置失败:', error);
      return {};
    }
  },

  /**
   * 获取主题配置
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} - 主题配置对象
   */
  async getThemeConfig(forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      return systemConfig.theme || {};
    } catch (error) {
      console.error('获取主题配置失败:', error);
      return {};
    }
  },

  /**
   * 获取功能开关配置
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} - 功能开关配置对象
   */
  async getFeatureFlags(forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      return systemConfig.features || {};
    } catch (error) {
      console.error('获取功能开关配置失败:', error);
      return {};
    }
  },

  /**
   * 检查特定功能是否启用
   * @param {string} featureName - 功能名称
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<boolean>} - 功能是否启用
   */
  async isFeatureEnabled(featureName, forceRefresh = false) {
    try {
      const features = await this.getFeatureFlags(forceRefresh);
      return features[featureName] === true;
    } catch (error) {
      console.error(`检查功能 ${featureName} 是否启用失败:`, error);
      return false;
    }
  },

  /**
   * 获取缓存策略配置
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<Object>} - 缓存策略配置
   */
  async getCacheStrategy(forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      return systemConfig.cache || {};
    } catch (error) {
      console.error('获取缓存策略配置失败:', error);
      return {};
    }
  },

  /**
   * 获取特定配置项
   * @param {string} configPath - 配置路径，支持点表示法，如 'theme.colors.primary'
   * @param {*} defaultValue - 默认值，当配置不存在时返回
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   * @returns {Promise<*>} - 配置值
   */
  async getConfigItem(configPath, defaultValue = null, forceRefresh = false) {
    try {
      const systemConfig = await this.getSystemConfig(forceRefresh);
      
      // 支持点表示法访问嵌套配置
      const keys = configPath.split('.');
      let value = systemConfig;
      
      for (const key of keys) {
        if (value === null || typeof value !== 'object' || !(key in value)) {
          return defaultValue;
        }
        value = value[key];
      }
      
      return value;
    } catch (error) {
      console.error(`获取配置项 ${configPath} 失败:`, error);
      return defaultValue;
    }
  },

  /**
   * 清除配置缓存
   */
  clearConfigCache() {
    try {
      removeCache(CACHE_KEYS.SYSTEM_CONFIG);
      console.log('配置缓存已清除');
    } catch (error) {
      console.error('清除配置缓存失败:', error);
    }
  },

  /**
   * 刷新所有配置
   * @returns {Promise<Object>} - 最新的系统配置
   */
  async refreshAllConfigs() {
    this.clearConfigCache();
    return await this.getSystemConfig(true);
  },

  /**
   * 检查配置是否有更新
   * @returns {Promise<boolean>} - 是否有更新
   */
  async checkForConfigUpdates() {
    try {
      // 获取当前版本信息
      const currentConfig = getCache(CACHE_KEYS.SYSTEM_CONFIG);
      const currentVersion = currentConfig?.version || 'unknown';
      
      // 强制获取最新配置版本
      const latestConfig = await this.getSystemConfig(true);
      const latestVersion = latestConfig.version || 'unknown';
      
      // 比较版本
      return currentVersion !== 'unknown' && currentVersion !== latestVersion;
    } catch (error) {
      console.error('检查配置更新失败:', error);
      return false;
    }
  },

  /**
   * 获取配置版本信息
   * @returns {Promise<Object>} - 包含版本号和更新时间的对象
   */
  async getConfigVersion() {
    try {
      const config = await this.getSystemConfig();
      return {
        version: config.version || 'unknown',
        updatedAt: config.updatedAt || null
      };
    } catch (error) {
      console.error('获取配置版本失败:', error);
      return {
        version: 'unknown',
        updatedAt: null
      };
    }
  }
};

module.exports = configService;
