/**
 * 文件名: cacheService.js
 * 版本号: 1.0.19
 * 更新日期: 2025-11-29
 * 作者: Sut
 * 描述: 缓存服务，提供数据缓存、图片缓存、缓存策略管理等功能 */

// 微信API包装，便于测试时模拟
const wxApi = {
  // 性能监控服务，延迟导入避免循环依赖
  get performanceService() {
    if (!this._performanceService) {
      this._performanceService = require('./performanceService.js');
    }
    return this._performanceService;
  },
  getStorageInfo: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.getStorageInfo(options);
    }
    return Promise.resolve({ keys: [], currentSize: 0, limitSize: 0 });
  },
  getStorage: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.getStorage(options);
    }
    return Promise.reject({ errMsg: 'wx is not available' });
  },
  setStorage: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.setStorage(options);
    }
    return Promise.resolve();
  },
  removeStorage: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.removeStorage(options);
    }
    return Promise.resolve();
  },
  downloadFile: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.downloadFile(options);
    }
    return Promise.reject({ errMsg: 'wx is not available' });
  },
  getFileInfo: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.getFileInfo(options);
    }
    return Promise.reject({ errMsg: 'wx is not available' });
  }
};

/**
 * 缓存策略常量
 */
const CACHE_POLICY = {
  // 不使用缓存
  NO_CACHE: 'no_cache',
  // 优先使用缓存，缓存不存在时从网络获取
  CACHE_FIRST: 'cache_first',
  // 优先从网络获取，网络失败时使用缓存
  NETWORK_FIRST: 'network_first',
  // 同时使用缓存和网络，先返回缓存数据，再更新缓存
  CACHE_AND_NETWORK: 'cache_and_network'
};

/**
 * 缓存类型常量
 */
const CACHE_TYPE = {
  // 数据缓存
  DATA: 'data',
  // 图片缓存
  IMAGE: 'image',
  // 配置缓存
  CONFIG: 'config',
  // 临时缓存
  TEMP: 'temp'
};

/**
 * 缓存过期时间常量，单位毫秒
 */
const EXPIRY_TIME = {
  // 5分钟
  SHORT: 5 * 60 * 1000,
  // 1小时
  MEDIUM: 60 * 60 * 1000,
  // 24小时
  LONG: 24 * 60 * 60 * 1000,
  // 7天
  WEEK: 7 * 24 * 60 * 60 * 1000,
  // 永不过期
  NEVER: null
};

/**
 * 缓存服务类
 */
class CacheService {
  constructor() {
    this.cachePrefix = 'sut_cache_';
    this.maxCacheSize = 1024 * 1024 * 100; // 100MB
  }

  /**
   * 生成缓存键
   * @param {string} key - 原始键
   * @param {string} type - 缓存类型
   * @returns {string} 完整缓存键
   */
  _getCacheKey(key, type = CACHE_TYPE.DATA) {
    return `${this.cachePrefix}${type}_${key}`;
  }

  /**
   * 生成元数据键
   * @param {string} key - 原始键
   * @param {string} type - 缓存类型
   * @returns {string} 元数据键
   */
  _getMetaKey(key, type = CACHE_TYPE.DATA) {
    return `${this._getCacheKey(key, type)}_meta`;
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {*} data - 缓存数据
   * @param {Object} options - 缓存选项
   * @param {string} options.type - 缓存类型
   * @param {number|null} options.expiry - 过期时间，单位毫秒，null表示永不过期
   * @param {string} options.group - 缓存分组
   * @returns {Promise<void>}
   */
  async set(key, data, options = {}) {
    try {
      const {
        type = CACHE_TYPE.DATA,
        expiry = EXPIRY_TIME.MEDIUM,
        group = null
      } = options;

      const cacheKey = this._getCacheKey(key, type);
      const metaKey = this._getMetaKey(key, type);

      // 生成元数据
      const metadata = {
        type,
        group,
        createdAt: Date.now(),
        expiry: expiry !== null ? Date.now() + expiry : null
      };

      // 检查缓存大小
      await this._checkCacheSize();

      // 保存数据和元数据
      await Promise.all([
        wxApi.setStorage({ key: cacheKey, data }),
        wxApi.setStorage({ key: metaKey, data: metadata })
      ]);

      // 添加到缓存索引
      await this._addToCacheIndex(key, type, group);
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @param {Object} options - 缓存选项
   * @param {string} options.type - 缓存类型
   * @returns {Promise<*|null>} 缓存数据，过期或不存在时返回null
   */
  async get(key, options = {}) {
    try {
      const { type = CACHE_TYPE.DATA } = options;
      const cacheKey = this._getCacheKey(key, type);
      const metaKey = this._getMetaKey(key, type);

      // 获取元数据和数据
      const [metadata, data] = await Promise.all([
        wxApi.getStorage({ key: metaKey }),
        wxApi.getStorage({ key: cacheKey })
      ]);

      // 检查是否过期
      if (metadata.data && metadata.data.expiry) {
        if (Date.now() > metadata.data.expiry) {
          // 缓存过期，移除缓存
          await this.remove(key, { type });
          // 记录缓存未命中
          wxApi.performanceService.recordCacheHit(false);
          return null;
        }
      }

      // 记录缓存命中
      wxApi.performanceService.recordCacheHit(true);
      return data.data;
    } catch (error) {
      // 缓存不存在
      if (error.errMsg && error.errMsg.includes('getStorage:fail')) {
        // 记录缓存未命中
        wxApi.performanceService.recordCacheHit(false);
        return null;
      }
      console.error('Cache get error:', error);
      // 记录缓存未命中
      wxApi.performanceService.recordCacheHit(false);
      return null;
    }
  }

  /**
   * 移除缓存
   * @param {string} key - 缓存键
   * @param {Object} options - 缓存选项
   * @param {string} options.type - 缓存类型
   * @returns {Promise<boolean>} 移除结果
   */
  async remove(key, options = {}) {
    try {
      const { type = CACHE_TYPE.DATA } = options;
      const cacheKey = this._getCacheKey(key, type);
      const metaKey = this._getMetaKey(key, type);

      // 移除缓存数据和元数据
      await Promise.all([
        wxApi.removeStorage({ key: cacheKey }),
        wxApi.removeStorage({ key: metaKey })
      ]);

      // 从缓存索引中移除
      await this._removeFromCacheIndex(key, type);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  /**
   * 清空所有缓存
   * @returns {Promise<boolean>} 清空结果
   */
  async clear() {
    try {
      const keys = await wxApi.getStorageInfo();
      const cacheKeys = keys.keys.filter(key => key.startsWith(this.cachePrefix));
      
      if (cacheKeys.length > 0) {
        await wxApi.removeStorage({ key: cacheKeys });
      }
      
      // 清空缓存索引
      await wxApi.removeStorage({ key: `${this.cachePrefix}index` });
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * 按类型清空缓存
   * @param {string} type - 缓存类型
   * @returns {Promise<boolean>} 清空结果
   */
  async clearByType(type) {
    try {
      const index = await this._getCacheIndex();
      const keysToRemove = [];

      if (index[type]) {
        Object.keys(index[type]).forEach(key => {
          keysToRemove.push(this._getCacheKey(key, type));
          keysToRemove.push(this._getMetaKey(key, type));
        });

        if (keysToRemove.length > 0) {
          await Promise.all(keysToRemove.map(key => wxApi.removeStorage({ key })));
        }

        // 更新索引
        delete index[type];
        await wxApi.setStorage({ key: `${this.cachePrefix}index`, data: index });
      }

      return true;
    } catch (error) {
      console.error('Cache clear by type error:', error);
      return false;
    }
  }

  /**
   * 按分组清空缓存
   * @param {string} group - 缓存分组
   * @returns {Promise<boolean>} 清空结果
   */
  async clearByGroup(group) {
    try {
      const index = await this._getCacheIndex();
      const keysToRemove = [];

      // 遍历所有类型
      Object.keys(index).forEach(type => {
        if (index[type] && index[type][group]) {
          index[type][group].forEach(key => {
            keysToRemove.push(this._getCacheKey(key, type));
            keysToRemove.push(this._getMetaKey(key, type));
          });
          
          // 更新索引
          delete index[type][group];
        }
      });

      if (keysToRemove.length > 0) {
        await Promise.all(keysToRemove.map(key => wx.removeStorage({ key })));
      }

      // 保存更新后的索引
      await wx.setStorage({ key: `${this.cachePrefix}index`, data: index });
      return true;
    } catch (error) {
      console.error('Cache clear by group error:', error);
      return false;
    }
  }

  /**
   * 获取缓存大小
   * @returns {Promise<number>} 缓存大小，单位KB
   */
  async getCacheSize() {
    try {
      const info = await wxApi.getStorageInfo();
      return info.currentSize;
    } catch (error) {
      console.error('Get cache size error:', error);
      return 0;
    }
  }

  /**
   * 缓存请求
   * @param {string} url - 请求URL
   * @param {Function} requestFn - 请求函数
   * @param {Object} options - 缓存选项
   * @param {string} options.policy - 缓存策略
   * @param {number|null} options.expiry - 过期时间
   * @param {string} options.type - 缓存类型
   * @returns {Promise<*>} 请求结果
   */
  async cachedRequest(url, requestFn, options = {}) {
    const {
      policy = CACHE_POLICY.CACHE_FIRST,
      expiry = EXPIRY_TIME.MEDIUM,
      type = CACHE_TYPE.DATA
    } = options;

    // 生成缓存键
    const cacheKey = this._generateRequestCacheKey(url);

    switch (policy) {
      case CACHE_POLICY.NO_CACHE:
        return requestFn();

      case CACHE_POLICY.CACHE_FIRST:
        // 优先使用缓存
        const cachedData = await this.get(cacheKey, { type });
        if (cachedData !== null) {
          return cachedData;
        }
        // 缓存不存在时从网络获取并缓存
        try {
          const data = await requestFn();
          await this.set(cacheKey, data, { type, expiry });
          return data;
        } catch (error) {
          console.error('Network request failed:', error);
          throw error;
        }

      case CACHE_POLICY.NETWORK_FIRST:
        // 优先从网络获取
        try {
          const data = await requestFn();
          await this.set(cacheKey, data, { type, expiry });
          return data;
        } catch (error) {
          console.error('Network request failed, trying cache:', error);
          // 网络失败时尝试使用缓存
          const cachedData = await this.get(cacheKey, { type });
          if (cachedData !== null) {
            return cachedData;
          }
          // 缓存也不存在时抛出错误
          throw error;
        }

      case CACHE_POLICY.CACHE_AND_NETWORK:
        // 同时使用缓存和网络
        const cached = await this.get(cacheKey, { type });
        
        // 如果有缓存，先返回缓存数据，然后异步更新缓存
        if (cached !== null) {
          // 后台更新缓存
          requestFn().then(data => {
            this.set(cacheKey, data, { type, expiry });
          }).catch(error => {
            console.error('Background network update failed:', error);
          });
          return cached;
        }
        
        // 没有缓存时从网络获取并缓存
        try {
          const data = await requestFn();
          await this.set(cacheKey, data, { type, expiry });
          return data;
        } catch (error) {
          console.error('Network request failed:', error);
          throw error;
        }

      default:
        return requestFn();
    }
  }

  /**
   * 缓存图片
   * @param {string} url - 图片URL
   * @returns {Promise<string>} 缓存后的图片路径
   */
  async cacheImage(url) {
    try {
      const cacheKey = this._generateImageCacheKey(url);
      
      // 检查是否已缓存
      const cachedPath = await this.get(cacheKey, { type: CACHE_TYPE.IMAGE });
      if (cachedPath) {
        // 检查文件是否存在
        try {
          await wxApi.getFileInfo({ filePath: cachedPath });
          return cachedPath;
        } catch (e) {
          // 文件不存在，移除失效缓存
          await this.remove(cacheKey, { type: CACHE_TYPE.IMAGE });
        }
      }

      // 下载图片
      const downloadResult = await wxApi.downloadFile({
        url,
        success: res => {
          if (res.statusCode === 200) {
            return res.tempFilePath;
          }
          throw new Error(`Download failed with status ${res.statusCode}`);
        }
      });

      // 获取临时文件路径
      const tempFilePath = downloadResult.tempFilePath;
      
      // 缓存图片
      await this.set(cacheKey, tempFilePath, { 
        type: CACHE_TYPE.IMAGE,
        expiry: EXPIRY_TIME.WEEK 
      });

      return tempFilePath;
    } catch (error) {
      console.error('Cache image error:', error);
      // 缓存失败时返回原URL
      return url;
    }
  }

  /**
   * 缓存多张图片
   * @param {Array<string>} urls - 图片URL数组
   * @returns {Promise<Array<string>>} 缓存后的图片路径数组
   */
  async cacheImages(urls) {
    return Promise.all(urls.map(url => this.cacheImage(url)));
  }

  /**
   * 生成请求缓存键
   * @param {string} url - 请求URL
   * @returns {string} 缓存键
   */
  _generateRequestCacheKey(url) {
    return `req_${url}`;
  }

  /**
   * 生成图片缓存键
   * @param {string} url - 图片URL
   * @returns {string} 缓存键
   */
  _generateImageCacheKey(url) {
    return `img_${url}`;
  }

  /**
   * 获取缓存索引
   * @returns {Promise<Object>} 缓存索引
   */
  async _getCacheIndex() {
    try {
      const result = await wxApi.getStorage({ key: `${this.cachePrefix}index` });
      return result.data || {};
    } catch (error) {
      return {};
    }
  }

  /**
   * 添加到缓存索引
   * @param {string} key - 缓存键
   * @param {string} type - 缓存类型
   * @param {string} group - 缓存分组
   * @returns {Promise<void>}
   */
  async _addToCacheIndex(key, type, group) {
    try {
      const index = await this._getCacheIndex();
      
      if (!index[type]) {
        index[type] = {};
      }
      
      if (group) {
        if (!index[type][group]) {
          index[type][group] = [];
        }
        if (!index[type][group].includes(key)) {
          index[type][group].push(key);
        }
      }
      
      // 添加到所有列表
      if (!index[type].all) {
        index[type].all = [];
      }
      if (!index[type].all.includes(key)) {
        index[type].all.push(key);
      }
      
      await wx.setStorage({ key: `${this.cachePrefix}index`, data: index });
    } catch (error) {
      console.error('Add to cache index error:', error);
    }
  }

  /**
   * 从缓存索引中移除
   * @param {string} key - 缓存键
   * @param {string} type - 缓存类型
   * @returns {Promise<void>}
   */
  async _removeFromCacheIndex(key, type) {
    try {
      const index = await this._getCacheIndex();
      
      if (index[type]) {
        // 从所有分组中移除
        Object.keys(index[type]).forEach(group => {
          if (Array.isArray(index[type][group])) {
            const indexToRemove = index[type][group].indexOf(key);
            if (indexToRemove !== -1) {
              index[type][group].splice(indexToRemove, 1);
            }
          }
        });
        
        await wx.setStorage({ key: `${this.cachePrefix}index`, data: index });
      }
    } catch (error) {
      console.error('Remove from cache index error:', error);
    }
  }

  /**
   * 检查缓存大小
   * @returns {Promise<void>}
   */
  async _checkCacheSize() {
    try {
      const currentSize = await this.getCacheSize();
      
      // 当缓存大小超过90%时清理旧缓存
      if (currentSize > this.maxCacheSize * 0.9) { // 超过90%时清理
        await this._cleanupOldCache();
      }
    } catch (error) {
      console.error('Check cache size error:', error);
    }
  }

  /**
   * 清理旧缓存
   * @returns {Promise<void>}
   */
  async _cleanupOldCache() {
    try {
      const index = await this._getCacheIndex();
      const cacheItems = [];

      // 收集所有缓存项
      for (const type in index) {
        if (index[type].all) {
          for (const key of index[type].all) {
            const metaKey = this._getMetaKey(key, type);
            try {
              const meta = await wxApi.getStorage({ key: metaKey });
              if (meta.data) {
                cacheItems.push({
                  key,
                  type,
                  createdAt: meta.data.createdAt,
                  expiry: meta.data.expiry
                });
              }
            } catch (e) {
              // 元数据不存在，跳过
            }
          }
        }
      }

      // 按创建时间排序，先清理最早的缓存
      cacheItems.sort((a, b) => a.createdAt - b.createdAt);

      // 清理30%的旧缓存
      const itemsToRemove = Math.floor(cacheItems.length * 0.3);
      for (let i = 0; i < itemsToRemove && i < cacheItems.length; i++) {
        await this.remove(cacheItems[i].key, { type: cacheItems[i].type });
      }
    } catch (error) {
      console.error('Cleanup old cache error:', error);
    }
  }
}

// 创建缓存服务实例
const cacheService = new CacheService();

// 导出实例
const instance = cacheService;

// 导出模块
module.exports = {
  instance,
  CACHE_POLICY,
  CACHE_TYPE,
  EXPIRY_TIME
};

// 默认导出
module.exports.default = cacheService;
