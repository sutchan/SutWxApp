/**
 * 鏂囦欢鍚? cacheService.js
 * 鐗堟湰鍙? 1.0.19
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 缂撳瓨鏈嶅姟锛屾彁渚涚粺涓€鐨勬湰鍦扮紦瀛樼鐞嗗姛鑳斤紝鏀寔鏁版嵁缂撳瓨銆佸浘鐗囩紦瀛樺拰缂撳瓨绛栫暐
 */

/**
 * 缂撳瓨绛栫暐甯搁噺
 */
const CACHE_POLICY = {
  // 涓嶄娇鐢ㄧ紦瀛?  NO_CACHE: 'no_cache',
  // 浼樺厛浣跨敤缂撳瓨锛屽鏋滅紦瀛樹笉瀛樺湪鍒欒姹傜綉缁?  CACHE_FIRST: 'cache_first',
  // 浼樺厛浣跨敤缃戠粶锛屽鏋滅綉缁滃け璐ュ垯浣跨敤缂撳瓨
  NETWORK_FIRST: 'network_first',
  // 鍚屾椂浣跨敤缂撳瓨鍜岀綉缁滐紝浼樺厛鏄剧ず缂撳瓨锛岀綉缁滆繑鍥炲悗鏇存柊
  CACHE_AND_NETWORK: 'cache_and_network'
};

/**
 * 缂撳瓨绫诲瀷甯搁噺
 */
const CACHE_TYPE = {
  // 鏁版嵁缂撳瓨
  DATA: 'data',
  // 鍥剧墖缂撳瓨
  IMAGE: 'image',
  // 鐢ㄦ埛閰嶇疆缂撳瓨
  CONFIG: 'config',
  // 涓存椂缂撳瓨
  TEMP: 'temp'
};

/**
 * 缂撳瓨杩囨湡鏃堕棿锛堟绉掞級
 */
const EXPIRY_TIME = {
  // 5鍒嗛挓
  SHORT: 5 * 60 * 1000,
  // 1灏忔椂
  MEDIUM: 60 * 60 * 1000,
  // 24灏忔椂
  LONG: 24 * 60 * 60 * 1000,
  // 7澶?  WEEK: 7 * 24 * 60 * 60 * 1000,
  // 姘镐笉杩囨湡
  NEVER: null
};

/**
 * 缂撳瓨鏈嶅姟绫? */
class CacheService {
  constructor() {
    this.cachePrefix = 'sut_cache_';
    this.maxCacheSize = 1024 * 1024 * 100; // 100MB
  }

  /**
   * 鐢熸垚缂撳瓨閿?   * @param {string} key - 鍘熷缂撳瓨閿?   * @param {string} type - 缂撳瓨绫诲瀷
   * @returns {string} 鐢熸垚鐨勭紦瀛橀敭
   */
  _getCacheKey(key, type = CACHE_TYPE.DATA) {
    return `${this.cachePrefix}${type}_${key}`;
  }

  /**
   * 鐢熸垚缂撳瓨鍏冩暟鎹敭
   * @param {string} key - 鍘熷缂撳瓨閿?   * @param {string} type - 缂撳瓨绫诲瀷
   * @returns {string} 鐢熸垚鐨勭紦瀛樺厓鏁版嵁閿?   */
  _getMetaKey(key, type = CACHE_TYPE.DATA) {
    return `${this._getCacheKey(key, type)}_meta`;
  }

  /**
   * 璁剧疆缂撳瓨
   * @param {string} key - 缂撳瓨閿?   * @param {*} data - 缂撳瓨鏁版嵁
   * @param {Object} options - 缂撳瓨閫夐」
   * @param {string} options.type - 缂撳瓨绫诲瀷
   * @param {number|null} options.expiry - 杩囨湡鏃堕棿锛堟绉掞級锛宯ull琛ㄧず姘镐笉杩囨湡
   * @param {string} options.group - 缂撳瓨鍒嗙粍
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

      // 鐢熸垚缂撳瓨鍏冩暟鎹?      const metadata = {
        type,
        group,
        createdAt: Date.now(),
        expiry: expiry !== null ? Date.now() + expiry : null
      };

      // 妫€鏌ョ紦瀛樺ぇ灏忛檺鍒?      await this._checkCacheSize();

      // 瀛樺偍鏁版嵁鍜屽厓鏁版嵁
      await Promise.all([
        wx.setStorage({ key: cacheKey, data }),
        wx.setStorage({ key: metaKey, data: metadata })
      ]);

      // 娣诲姞鍒扮紦瀛樼储寮?      await this._addToCacheIndex(key, type, group);
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  /**
   * 鑾峰彇缂撳瓨
   * @param {string} key - 缂撳瓨閿?   * @param {Object} options - 缂撳瓨閫夐」
   * @param {string} options.type - 缂撳瓨绫诲瀷
   * @returns {Promise<*|null>} 缂撳瓨鏁版嵁锛屽鏋滀笉瀛樺湪鎴栧凡杩囨湡鍒欒繑鍥瀗ull
   */
  async get(key, options = {}) {
    try {
      const { type = CACHE_TYPE.DATA } = options;
      const cacheKey = this._getCacheKey(key, type);
      const metaKey = this._getMetaKey(key, type);

      // 鑾峰彇鍏冩暟鎹?      const [metadata, data] = await Promise.all([
        wx.getStorage({ key: metaKey }),
        wx.getStorage({ key: cacheKey })
      ]);

      // 妫€鏌ユ槸鍚﹁繃鏈?      if (metadata.data && metadata.data.expiry) {
        if (Date.now() > metadata.data.expiry) {
          // 缂撳瓨宸茶繃鏈燂紝鍒犻櫎
          await this.remove(key, { type });
          return null;
        }
      }

      return data.data;
    } catch (error) {
      // 缂撳瓨涓嶅瓨鍦?      if (error.errMsg && error.errMsg.includes('getStorage:fail')) {
        return null;
      }
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * 绉婚櫎缂撳瓨
   * @param {string} key - 缂撳瓨閿?   * @param {Object} options - 缂撳瓨閫夐」
   * @param {string} options.type - 缂撳瓨绫诲瀷
   * @returns {Promise<boolean>} 鏄惁绉婚櫎鎴愬姛
   */
  async remove(key, options = {}) {
    try {
      const { type = CACHE_TYPE.DATA } = options;
      const cacheKey = this._getCacheKey(key, type);
      const metaKey = this._getMetaKey(key, type);

      // 鍒犻櫎缂撳瓨鏁版嵁鍜屽厓鏁版嵁
      await Promise.all([
        wx.removeStorage({ key: cacheKey }),
        wx.removeStorage({ key: metaKey })
      ]);

      // 浠庣紦瀛樼储寮曚腑绉婚櫎
      await this._removeFromCacheIndex(key, type);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  /**
   * 娓呴櫎鎵€鏈夌紦瀛?   * @returns {Promise<boolean>} 鏄惁娓呴櫎鎴愬姛
   */
  async clear() {
    try {
      const keys = await wx.getStorageInfo();
      const cacheKeys = keys.keys.filter(key => key.startsWith(this.cachePrefix));
      
      if (cacheKeys.length > 0) {
        await wx.removeStorage({ key: cacheKeys });
      }
      
      // 娓呴櫎缂撳瓨绱㈠紩
      await wx.removeStorage({ key: `${this.cachePrefix}index` });
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * 娓呴櫎鎸囧畾绫诲瀷鐨勭紦瀛?   * @param {string} type - 缂撳瓨绫诲瀷
   * @returns {Promise<boolean>} 鏄惁娓呴櫎鎴愬姛
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
          await Promise.all(keysToRemove.map(key => wx.removeStorage({ key })));
        }

        // 鏇存柊绱㈠紩
        delete index[type];
        await wx.setStorage({ key: `${this.cachePrefix}index`, data: index });
      }

      return true;
    } catch (error) {
      console.error('Cache clear by type error:', error);
      return false;
    }
  }

  /**
   * 娓呴櫎鎸囧畾鍒嗙粍鐨勭紦瀛?   * @param {string} group - 缂撳瓨鍒嗙粍
   * @returns {Promise<boolean>} 鏄惁娓呴櫎鎴愬姛
   */
  async clearByGroup(group) {
    try {
      const index = await this._getCacheIndex();
      const keysToRemove = [];

      // 閬嶅巻鎵€鏈夌被鍨?      Object.keys(index).forEach(type => {
        if (index[type] && index[type][group]) {
          index[type][group].forEach(key => {
            keysToRemove.push(this._getCacheKey(key, type));
            keysToRemove.push(this._getMetaKey(key, type));
          });
          
          // 鏇存柊绱㈠紩
          delete index[type][group];
        }
      });

      if (keysToRemove.length > 0) {
        await Promise.all(keysToRemove.map(key => wx.removeStorage({ key })));
      }

      // 淇濆瓨鏇存柊鍚庣殑绱㈠紩
      await wx.setStorage({ key: `${this.cachePrefix}index`, data: index });
      return true;
    } catch (error) {
      console.error('Cache clear by group error:', error);
      return false;
    }
  }

  /**
   * 鑾峰彇缂撳瓨澶у皬
   * @returns {Promise<number>} 缂撳瓨澶у皬锛堝瓧鑺傦級
   */
  async getCacheSize() {
    try {
      const info = await wx.getStorageInfo();
      return info.currentSize;
    } catch (error) {
      console.error('Get cache size error:', error);
      return 0;
    }
  }

  /**
   * 缂撳瓨缃戠粶璇锋眰鏁版嵁
   * @param {string} url - 璇锋眰URL
   * @param {Function} requestFn - 璇锋眰鍑芥暟
   * @param {Object} options - 缂撳瓨閫夐」
   * @param {string} options.policy - 缂撳瓨绛栫暐
   * @param {number|null} options.expiry - 杩囨湡鏃堕棿
   * @param {string} options.type - 缂撳瓨绫诲瀷
   * @returns {Promise<*>} 璇锋眰缁撴灉
   */
  async cachedRequest(url, requestFn, options = {}) {
    const {
      policy = CACHE_POLICY.CACHE_FIRST,
      expiry = EXPIRY_TIME.MEDIUM,
      type = CACHE_TYPE.DATA
    } = options;

    // 鐢熸垚缂撳瓨閿?    const cacheKey = this._generateRequestCacheKey(url);

    switch (policy) {
      case CACHE_POLICY.NO_CACHE:
        return requestFn();

      case CACHE_POLICY.CACHE_FIRST:
        // 浼樺厛浣跨敤缂撳瓨
        const cachedData = await this.get(cacheKey, { type });
        if (cachedData !== null) {
          return cachedData;
        }
        // 缂撳瓨涓嶅瓨鍦紝璇锋眰缃戠粶骞剁紦瀛?        try {
          const data = await requestFn();
          await this.set(cacheKey, data, { type, expiry });
          return data;
        } catch (error) {
          console.error('Network request failed:', error);
          throw error;
        }

      case CACHE_POLICY.NETWORK_FIRST:
        // 浼樺厛浣跨敤缃戠粶
        try {
          const data = await requestFn();
          await this.set(cacheKey, data, { type, expiry });
          return data;
        } catch (error) {
          console.error('Network request failed, trying cache:', error);
          // 缃戠粶澶辫触锛屽皾璇曚娇鐢ㄧ紦瀛?          const cachedData = await this.get(cacheKey, { type });
          if (cachedData !== null) {
            return cachedData;
          }
          // 缂撳瓨涔熶笉瀛樺湪锛屾姏鍑洪敊璇?          throw error;
        }

      case CACHE_POLICY.CACHE_AND_NETWORK:
        // 鍚屾椂浣跨敤缂撳瓨鍜岀綉缁?        const cached = await this.get(cacheKey, { type });
        
        // 绔嬪嵆杩斿洖缂撳瓨锛堝鏋滃瓨鍦級
        if (cached !== null) {
          // 寮傛鏇存柊缂撳瓨
          requestFn().then(data => {
            this.set(cacheKey, data, { type, expiry });
          }).catch(error => {
            console.error('Background network update failed:', error);
          });
          return cached;
        }
        
        // 缂撳瓨涓嶅瓨鍦紝绛夊緟缃戠粶璇锋眰
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
   * 缂撳瓨鍥剧墖
   * @param {string} url - 鍥剧墖URL
   * @returns {Promise<string>} 鏈湴缂撳瓨璺緞
   */
  async cacheImage(url) {
    try {
      const cacheKey = this._generateImageCacheKey(url);
      
      // 妫€鏌ユ槸鍚﹀凡缂撳瓨
      const cachedPath = await this.get(cacheKey, { type: CACHE_TYPE.IMAGE });
      if (cachedPath) {
        // 妫€鏌ョ紦瀛樻枃浠舵槸鍚﹀瓨鍦?        try {
          await wx.getFileInfo({ filePath: cachedPath });
          return cachedPath;
        } catch (e) {
          // 鏂囦欢涓嶅瓨鍦紝鍒犻櫎缂撳瓨璁板綍
          await this.remove(cacheKey, { type: CACHE_TYPE.IMAGE });
        }
      }

      // 涓嬭浇骞剁紦瀛樺浘鐗?      const downloadResult = await wx.downloadFile({
        url,
        success: res => {
          if (res.statusCode === 200) {
            return res.tempFilePath;
          }
          throw new Error(`Download failed with status ${res.statusCode}`);
        }
      });

      // 淇濆瓨鍒颁复鏃舵枃浠?      const tempFilePath = downloadResult.tempFilePath;
      
      // 淇濆瓨缂撳瓨璁板綍
      await this.set(cacheKey, tempFilePath, { 
        type: CACHE_TYPE.IMAGE,
        expiry: EXPIRY_TIME.WEEK 
      });

      return tempFilePath;
    } catch (error) {
      console.error('Cache image error:', error);
      // 澶辫触鏃惰繑鍥炲師濮婾RL
      return url;
    }
  }

  /**
   * 鎵归噺缂撳瓨鍥剧墖
   * @param {Array<string>} urls - 鍥剧墖URL鏁扮粍
   * @returns {Promise<Array<string>>} 鏈湴缂撳瓨璺緞鏁扮粍
   */
  async cacheImages(urls) {
    return Promise.all(urls.map(url => this.cacheImage(url)));
  }

  /**
   * 鐢熸垚璇锋眰缂撳瓨閿?   * @param {string} url - 璇锋眰URL
   * @returns {string} 缂撳瓨閿?   */
  _generateRequestCacheKey(url) {
    return `req_${url}`;
  }

  /**
   * 鐢熸垚鍥剧墖缂撳瓨閿?   * @param {string} url - 鍥剧墖URL
   * @returns {string} 缂撳瓨閿?   */
  _generateImageCacheKey(url) {
    return `img_${url}`;
  }

  /**
   * 鑾峰彇缂撳瓨绱㈠紩
   * @returns {Promise<Object>} 缂撳瓨绱㈠紩
   */
  async _getCacheIndex() {
    try {
      const result = await wx.getStorage({ key: `${this.cachePrefix}index` });
      return result.data || {};
    } catch (error) {
      return {};
    }
  }

  /**
   * 娣诲姞鍒扮紦瀛樼储寮?   * @param {string} key - 缂撳瓨閿?   * @param {string} type - 缂撳瓨绫诲瀷
   * @param {string} group - 缂撳瓨鍒嗙粍
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
      
      // 璁板綍鎵€鏈夐敭
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
   * 浠庣紦瀛樼储寮曚腑绉婚櫎
   * @param {string} key - 缂撳瓨閿?   * @param {string} type - 缂撳瓨绫诲瀷
   * @returns {Promise<void>}
   */
  async _removeFromCacheIndex(key, type) {
    try {
      const index = await this._getCacheIndex();
      
      if (index[type]) {
        // 浠庢墍鏈夊垎缁勪腑绉婚櫎
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
   * 妫€鏌ョ紦瀛樺ぇ灏忛檺鍒?   * @returns {Promise<void>}
   */
  async _checkCacheSize() {
    try {
      const currentSize = await this.getCacheSize();
      
      // 濡傛灉缂撳瓨澶у皬瓒呰繃闄愬埗锛屾竻鐞嗘渶鏃╃殑缂撳瓨
      if (currentSize > this.maxCacheSize * 0.9) { // 杈惧埌90%鏃跺紑濮嬫竻鐞?        await this._cleanupOldCache();
      }
    } catch (error) {
      console.error('Check cache size error:', error);
    }
  }

  /**
   * 娓呯悊鏃х紦瀛?   * @returns {Promise<void>}
   */
  async _cleanupOldCache() {
    try {
      const index = await this._getCacheIndex();
      const cacheItems = [];

      // 鏀堕泦鎵€鏈夌紦瀛橀」鍙婂叾鍏冩暟鎹?      for (const type in index) {
        if (index[type].all) {
          for (const key of index[type].all) {
            const metaKey = this._getMetaKey(key, type);
            try {
              const meta = await wx.getStorage({ key: metaKey });
              if (meta.data) {
                cacheItems.push({
                  key,
                  type,
                  createdAt: meta.data.createdAt,
                  expiry: meta.data.expiry
                });
              }
            } catch (e) {
              // 蹇界暐涓嶅瓨鍦ㄧ殑缂撳瓨
            }
          }
        }
      }

      // 鎸夊垱寤烘椂闂存帓搴忥紝鍏堟竻鐞嗘渶鏃╃殑缂撳瓨
      cacheItems.sort((a, b) => a.createdAt - b.createdAt);

      // 娓呯悊绾?0%鐨勭紦瀛?      const itemsToRemove = Math.floor(cacheItems.length * 0.3);
      for (let i = 0; i < itemsToRemove && i < cacheItems.length; i++) {
        await this.remove(cacheItems[i].key, { type: cacheItems[i].type });
      }
    } catch (error) {
      console.error('Cleanup old cache error:', error);
    }
  }
}

// 瀵煎嚭缂撳瓨鏈嶅姟瀹炰緥
const cacheService = new CacheService();

// 瀵煎嚭甯搁噺
const instance = cacheService;

// 瀵煎嚭瀹炰緥鍜屽父閲?module.exports = {
  instance,
  CACHE_POLICY,
  CACHE_TYPE,
  EXPIRY_TIME
};

// 鍚屾椂鏀寔鐩存帴寮曠敤瀹炰緥
module.exports.default = cacheService;
