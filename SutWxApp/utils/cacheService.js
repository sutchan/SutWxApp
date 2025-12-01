/**
 * 鏂囦欢鍚? cacheService.js
 * 鐗堟湰鍙? 1.0.19
 * 更新日期: 2025-11-29
 * 娴ｆ粏鈧? Sut
 * 描述: 缂傛挸鐡ㄩ張宥呭閿涘本褰佹笟娑氱埠娑撯偓閻ㄥ嫭婀伴崷鎵处鐎涙顓搁悶鍡楀閼虫枻绱濋弨顖涘瘮閺佺増宓佺紓鎾崇摠閵嗕礁娴橀悧鍥╃处鐎涙ê鎷扮紓鎾崇摠缁涙牜鏆? */

/**
 * 缂傛挸鐡ㄧ粵鏍殣鐢悂鍣? */
const CACHE_POLICY = {
  // 娑撳秳濞囬悽銊х处鐎?  NO_CACHE: 'no_cache',
  // 娴兼ê鍘涙担璺ㄦ暏缂傛挸鐡ㄩ敍灞筋洤閺嬫粎绱︾€涙ü绗夌€涙ê婀崚娆掝嚞濮瑰倻缍夌紒?  CACHE_FIRST: 'cache_first',
  // 娴兼ê鍘涙担璺ㄦ暏缂冩垹绮堕敍灞筋洤閺嬫粎缍夌紒婊冦亼鐠愩儱鍨担璺ㄦ暏缂傛挸鐡?  NETWORK_FIRST: 'network_first',
  // 閸氬本妞傛担璺ㄦ暏缂傛挸鐡ㄩ崪宀€缍夌紒婊愮礉娴兼ê鍘涢弰鍓с仛缂傛挸鐡ㄩ敍宀€缍夌紒婊嗙箲閸ョ偛鎮楅弴瀛樻煀
  CACHE_AND_NETWORK: 'cache_and_network'
};

/**
 * 缂傛挸鐡ㄧ猾璇茬€风敮鎼佸櫤
 */
const CACHE_TYPE = {
  // 閺佺増宓佺紓鎾崇摠
  DATA: 'data',
  // 閸ュ墽澧栫紓鎾崇摠
  IMAGE: 'image',
  // 閻劍鍩涢柊宥囩枂缂傛挸鐡?  CONFIG: 'config',
  // 娑撳瓨妞傜紓鎾崇摠
  TEMP: 'temp'
};

/**
 * 缂傛挸鐡ㄦ潻鍥ㄦ埂閺冨爼妫块敍鍫燁嚑缁夋帪绱? */
const EXPIRY_TIME = {
  // 5閸掑棝鎸?  SHORT: 5 * 60 * 1000,
  // 1鐏忓繑妞?  MEDIUM: 60 * 60 * 1000,
  // 24鐏忓繑妞?  LONG: 24 * 60 * 60 * 1000,
  // 7婢?  WEEK: 7 * 24 * 60 * 60 * 1000,
  // 濮橀晲绗夋潻鍥ㄦ埂
  NEVER: null
};

/**
 * 缂傛挸鐡ㄩ張宥呭缁? */
class CacheService {
  constructor() {
    this.cachePrefix = 'sut_cache_';
    this.maxCacheSize = 1024 * 1024 * 100; // 100MB
  }

  /**
   * 閻㈢喐鍨氱紓鎾崇摠闁?   * @param {string} key - 閸樼喎顫愮紓鎾崇摠闁?   * @param {string} type - 缂傛挸鐡ㄧ猾璇茬€?   * @returns {string} 閻㈢喐鍨氶惃鍕处鐎涙﹢鏁?   */
  _getCacheKey(key, type = CACHE_TYPE.DATA) {
    return `${this.cachePrefix}${type}_${key}`;
  }

  /**
   * 閻㈢喐鍨氱紓鎾崇摠閸忓啯鏆熼幑顕€鏁?   * @param {string} key - 閸樼喎顫愮紓鎾崇摠闁?   * @param {string} type - 缂傛挸鐡ㄧ猾璇茬€?   * @returns {string} 閻㈢喐鍨氶惃鍕处鐎涙ê鍘撻弫鐗堝祦闁?   */
  _getMetaKey(key, type = CACHE_TYPE.DATA) {
    return `${this._getCacheKey(key, type)}_meta`;
  }

  /**
   * 鐠佸墽鐤嗙紓鎾崇摠
   * @param {string} key - 缂傛挸鐡ㄩ柨?   * @param {*} data - 缂傛挸鐡ㄩ弫鐗堝祦
   * @param {Object} options - 缂傛挸鐡ㄩ柅澶愩€?   * @param {string} options.type - 缂傛挸鐡ㄧ猾璇茬€?   * @param {number|null} options.expiry - 鏉╁洦婀￠弮鍫曟？閿涘牊顕犵粔鎺炵礆閿涘ull鐞涖劎銇氬闀愮瑝鏉╁洦婀?   * @param {string} options.group - 缂傛挸鐡ㄩ崚鍡欑矋
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

      // 閻㈢喐鍨氱紓鎾崇摠閸忓啯鏆熼幑?      const metadata = {
        type,
        group,
        createdAt: Date.now(),
        expiry: expiry !== null ? Date.now() + expiry : null
      };

      // 濡偓閺屻儳绱︾€涙ê銇囩亸蹇涙閸?      await this._checkCacheSize();

      // 鐎涙ê鍋嶉弫鐗堝祦閸滃苯鍘撻弫鐗堝祦
      await Promise.all([
        wx.setStorage({ key: cacheKey, data }),
        wx.setStorage({ key: metaKey, data: metadata })
      ]);

      // 濞ｈ濮為崚鎵处鐎涙鍌ㄥ?      await this._addToCacheIndex(key, type, group);
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  /**
   * 閼惧嘲褰囩紓鎾崇摠
   * @param {string} key - 缂傛挸鐡ㄩ柨?   * @param {Object} options - 缂傛挸鐡ㄩ柅澶愩€?   * @param {string} options.type - 缂傛挸鐡ㄧ猾璇茬€?   * @returns {Promise<*|null>} 缂傛挸鐡ㄩ弫鐗堝祦閿涘苯顩ч弸婊€绗夌€涙ê婀幋鏍у嚒鏉╁洦婀￠崚娆掔箲閸ョ€梪ll
   */
  async get(key, options = {}) {
    try {
      const { type = CACHE_TYPE.DATA } = options;
      const cacheKey = this._getCacheKey(key, type);
      const metaKey = this._getMetaKey(key, type);

      // 閼惧嘲褰囬崗鍐╂殶閹?      const [metadata, data] = await Promise.all([
        wx.getStorage({ key: metaKey }),
        wx.getStorage({ key: cacheKey })
      ]);

      // 濡偓閺屻儲妲搁崥锕佺箖閺?      if (metadata.data && metadata.data.expiry) {
        if (Date.now() > metadata.data.expiry) {
          // 缂傛挸鐡ㄥ鑼剁箖閺堢噦绱濋崚鐘绘珟
          await this.remove(key, { type });
          return null;
        }
      }

      return data.data;
    } catch (error) {
      // 缂傛挸鐡ㄦ稉宥呯摠閸?      if (error.errMsg && error.errMsg.includes('getStorage:fail')) {
        return null;
      }
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * 缁夊娅庣紓鎾崇摠
   * @param {string} key - 缂傛挸鐡ㄩ柨?   * @param {Object} options - 缂傛挸鐡ㄩ柅澶愩€?   * @param {string} options.type - 缂傛挸鐡ㄧ猾璇茬€?   * @returns {Promise<boolean>} 閺勵垰鎯佺粔濠氭珟閹存劕濮?   */
  async remove(key, options = {}) {
    try {
      const { type = CACHE_TYPE.DATA } = options;
      const cacheKey = this._getCacheKey(key, type);
      const metaKey = this._getMetaKey(key, type);

      // 閸掔娀娅庣紓鎾崇摠閺佺増宓侀崪灞藉帗閺佺増宓?      await Promise.all([
        wx.removeStorage({ key: cacheKey }),
        wx.removeStorage({ key: metaKey })
      ]);

      // 娴犲海绱︾€涙鍌ㄥ鏇氳厬缁夊娅?      await this._removeFromCacheIndex(key, type);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  /**
   * 濞撳懘娅庨幍鈧張澶岀处鐎?   * @returns {Promise<boolean>} 閺勵垰鎯佸〒鍛存珟閹存劕濮?   */
  async clear() {
    try {
      const keys = await wx.getStorageInfo();
      const cacheKeys = keys.keys.filter(key => key.startsWith(this.cachePrefix));
      
      if (cacheKeys.length > 0) {
        await wx.removeStorage({ key: cacheKeys });
      }
      
      // 濞撳懘娅庣紓鎾崇摠缁便垹绱?      await wx.removeStorage({ key: `${this.cachePrefix}index` });
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * 濞撳懘娅庨幐鍥х暰缁鐎烽惃鍕处鐎?   * @param {string} type - 缂傛挸鐡ㄧ猾璇茬€?   * @returns {Promise<boolean>} 閺勵垰鎯佸〒鍛存珟閹存劕濮?   */
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

        // 閺囧瓨鏌婄槐銏犵穿
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
   * 濞撳懘娅庨幐鍥х暰閸掑棛绮嶉惃鍕处鐎?   * @param {string} group - 缂傛挸鐡ㄩ崚鍡欑矋
   * @returns {Promise<boolean>} 閺勵垰鎯佸〒鍛存珟閹存劕濮?   */
  async clearByGroup(group) {
    try {
      const index = await this._getCacheIndex();
      const keysToRemove = [];

      // 闁秴宸婚幍鈧張澶岃閸?      Object.keys(index).forEach(type => {
        if (index[type] && index[type][group]) {
          index[type][group].forEach(key => {
            keysToRemove.push(this._getCacheKey(key, type));
            keysToRemove.push(this._getMetaKey(key, type));
          });
          
          // 閺囧瓨鏌婄槐銏犵穿
          delete index[type][group];
        }
      });

      if (keysToRemove.length > 0) {
        await Promise.all(keysToRemove.map(key => wx.removeStorage({ key })));
      }

      // 娣囨繂鐡ㄩ弴瀛樻煀閸氬海娈戠槐銏犵穿
      await wx.setStorage({ key: `${this.cachePrefix}index`, data: index });
      return true;
    } catch (error) {
      console.error('Cache clear by group error:', error);
      return false;
    }
  }

  /**
   * 閼惧嘲褰囩紓鎾崇摠婢堆冪毈
   * @returns {Promise<number>} 缂傛挸鐡ㄦ径褍鐨敍鍫濈摟閼哄偊绱?   */
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
   * 缂傛挸鐡ㄧ純鎴犵捕鐠囬攱鐪伴弫鐗堝祦
   * @param {string} url - 鐠囬攱鐪癠RL
   * @param {Function} requestFn - 鐠囬攱鐪伴崙鑺ユ殶
   * @param {Object} options - 缂傛挸鐡ㄩ柅澶愩€?   * @param {string} options.policy - 缂傛挸鐡ㄧ粵鏍殣
   * @param {number|null} options.expiry - 鏉╁洦婀￠弮鍫曟？
   * @param {string} options.type - 缂傛挸鐡ㄧ猾璇茬€?   * @returns {Promise<*>} 鐠囬攱鐪扮紒鎾寸亯
   */
  async cachedRequest(url, requestFn, options = {}) {
    const {
      policy = CACHE_POLICY.CACHE_FIRST,
      expiry = EXPIRY_TIME.MEDIUM,
      type = CACHE_TYPE.DATA
    } = options;

    // 閻㈢喐鍨氱紓鎾崇摠闁?    const cacheKey = this._generateRequestCacheKey(url);

    switch (policy) {
      case CACHE_POLICY.NO_CACHE:
        return requestFn();

      case CACHE_POLICY.CACHE_FIRST:
        // 娴兼ê鍘涙担璺ㄦ暏缂傛挸鐡?        const cachedData = await this.get(cacheKey, { type });
        if (cachedData !== null) {
          return cachedData;
        }
        // 缂傛挸鐡ㄦ稉宥呯摠閸︻煉绱濈拠閿嬬湴缂冩垹绮堕獮鍓佺处鐎?        try {
          const data = await requestFn();
          await this.set(cacheKey, data, { type, expiry });
          return data;
        } catch (error) {
          console.error('Network request failed:', error);
          throw error;
        }

      case CACHE_POLICY.NETWORK_FIRST:
        // 娴兼ê鍘涙担璺ㄦ暏缂冩垹绮?        try {
          const data = await requestFn();
          await this.set(cacheKey, data, { type, expiry });
          return data;
        } catch (error) {
          console.error('Network request failed, trying cache:', error);
          // 缂冩垹绮舵径杈Е閿涘苯鐨剧拠鏇氬▏閻劎绱︾€?          const cachedData = await this.get(cacheKey, { type });
          if (cachedData !== null) {
            return cachedData;
          }
          // 缂傛挸鐡ㄦ稊鐔剁瑝鐎涙ê婀敍灞惧閸戞椽鏁婄拠?          throw error;
        }

      case CACHE_POLICY.CACHE_AND_NETWORK:
        // 閸氬本妞傛担璺ㄦ暏缂傛挸鐡ㄩ崪宀€缍夌紒?        const cached = await this.get(cacheKey, { type });
        
        // 缁斿宓嗘潻鏂挎礀缂傛挸鐡ㄩ敍鍫濐洤閺嬫粌鐡ㄩ崷顭掔礆
        if (cached !== null) {
          // 瀵倹顒為弴瀛樻煀缂傛挸鐡?          requestFn().then(data => {
            this.set(cacheKey, data, { type, expiry });
          }).catch(error => {
            console.error('Background network update failed:', error);
          });
          return cached;
        }
        
        // 缂傛挸鐡ㄦ稉宥呯摠閸︻煉绱濈粵澶婄窡缂冩垹绮剁拠閿嬬湴
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
   * 缂傛挸鐡ㄩ崶鍓у
   * @param {string} url - 閸ュ墽澧朥RL
   * @returns {Promise<string>} 閺堫剙婀寸紓鎾崇摠鐠侯垰绶?   */
  async cacheImage(url) {
    try {
      const cacheKey = this._generateImageCacheKey(url);
      
      // 濡偓閺屻儲妲搁崥锕€鍑＄紓鎾崇摠
      const cachedPath = await this.get(cacheKey, { type: CACHE_TYPE.IMAGE });
      if (cachedPath) {
        // 濡偓閺屻儳绱︾€涙ɑ鏋冩禒鑸垫Ц閸氾箑鐡ㄩ崷?        try {
          await wx.getFileInfo({ filePath: cachedPath });
          return cachedPath;
        } catch (e) {
          // 閺傚洣娆㈡稉宥呯摠閸︻煉绱濋崚鐘绘珟缂傛挸鐡ㄧ拋鏉跨秿
          await this.remove(cacheKey, { type: CACHE_TYPE.IMAGE });
        }
      }

      // 娑撳娴囬獮鍓佺处鐎涙ê娴橀悧?      const downloadResult = await wx.downloadFile({
        url,
        success: res => {
          if (res.statusCode === 200) {
            return res.tempFilePath;
          }
          throw new Error(`Download failed with status ${res.statusCode}`);
        }
      });

      // 娣囨繂鐡ㄩ崚棰佸閺冭埖鏋冩禒?      const tempFilePath = downloadResult.tempFilePath;
      
      // 娣囨繂鐡ㄧ紓鎾崇摠鐠佹澘缍?      await this.set(cacheKey, tempFilePath, { 
        type: CACHE_TYPE.IMAGE,
        expiry: EXPIRY_TIME.WEEK 
      });

      return tempFilePath;
    } catch (error) {
      console.error('Cache image error:', error);
      // 婢惰精瑙﹂弮鎯扮箲閸ョ偛甯慨濠綬L
      return url;
    }
  }

  /**
   * 閹靛綊鍣虹紓鎾崇摠閸ュ墽澧?   * @param {Array<string>} urls - 閸ュ墽澧朥RL閺佹壆绮?   * @returns {Promise<Array<string>>} 閺堫剙婀寸紓鎾崇摠鐠侯垰绶為弫鎵矋
   */
  async cacheImages(urls) {
    return Promise.all(urls.map(url => this.cacheImage(url)));
  }

  /**
   * 閻㈢喐鍨氱拠閿嬬湴缂傛挸鐡ㄩ柨?   * @param {string} url - 鐠囬攱鐪癠RL
   * @returns {string} 缂傛挸鐡ㄩ柨?   */
  _generateRequestCacheKey(url) {
    return `req_${url}`;
  }

  /**
   * 閻㈢喐鍨氶崶鍓у缂傛挸鐡ㄩ柨?   * @param {string} url - 閸ュ墽澧朥RL
   * @returns {string} 缂傛挸鐡ㄩ柨?   */
  _generateImageCacheKey(url) {
    return `img_${url}`;
  }

  /**
   * 閼惧嘲褰囩紓鎾崇摠缁便垹绱?   * @returns {Promise<Object>} 缂傛挸鐡ㄧ槐銏犵穿
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
   * 濞ｈ濮為崚鎵处鐎涙鍌ㄥ?   * @param {string} key - 缂傛挸鐡ㄩ柨?   * @param {string} type - 缂傛挸鐡ㄧ猾璇茬€?   * @param {string} group - 缂傛挸鐡ㄩ崚鍡欑矋
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
      
      // 鐠佹澘缍嶉幍鈧張澶愭暛
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
   * 娴犲海绱︾€涙鍌ㄥ鏇氳厬缁夊娅?   * @param {string} key - 缂傛挸鐡ㄩ柨?   * @param {string} type - 缂傛挸鐡ㄧ猾璇茬€?   * @returns {Promise<void>}
   */
  async _removeFromCacheIndex(key, type) {
    try {
      const index = await this._getCacheIndex();
      
      if (index[type]) {
        // 娴犲孩澧嶉張澶婂瀻缂佸嫪鑵戠粔濠氭珟
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
   * 濡偓閺屻儳绱︾€涙ê銇囩亸蹇涙閸?   * @returns {Promise<void>}
   */
  async _checkCacheSize() {
    try {
      const currentSize = await this.getCacheSize();
      
      // 婵″倹鐏夌紓鎾崇摠婢堆冪毈鐡掑懓绻冮梽鎰煑閿涘本绔婚悶鍡樻付閺冣晝娈戠紓鎾崇摠
      if (currentSize > this.maxCacheSize * 0.9) { // 鏉堟儳鍩?0%閺冭泛绱戞慨瀣閻?        await this._cleanupOldCache();
      }
    } catch (error) {
      console.error('Check cache size error:', error);
    }
  }

  /**
   * 濞撳懐鎮婇弮褏绱︾€?   * @returns {Promise<void>}
   */
  async _cleanupOldCache() {
    try {
      const index = await this._getCacheIndex();
      const cacheItems = [];

      // 閺€鍫曟肠閹碘偓閺堝绱︾€涙﹢銆嶉崣濠傚従閸忓啯鏆熼幑?      for (const type in index) {
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
              // 韫囩晫鏆愭稉宥呯摠閸︺劎娈戠紓鎾崇摠
            }
          }
        }
      }

      // 閹稿鍨卞鐑樻闂傚瓨甯撴惔蹇ョ礉閸忓牊绔婚悶鍡樻付閺冣晝娈戠紓鎾崇摠
      cacheItems.sort((a, b) => a.createdAt - b.createdAt);

      // 濞撳懐鎮婄痪?0%閻ㄥ嫮绱︾€?      const itemsToRemove = Math.floor(cacheItems.length * 0.3);
      for (let i = 0; i < itemsToRemove && i < cacheItems.length; i++) {
        await this.remove(cacheItems[i].key, { type: cacheItems[i].type });
      }
    } catch (error) {
      console.error('Cleanup old cache error:', error);
    }
  }
}

// 鐎电厧鍤紓鎾崇摠閺堝秴濮熺€圭偘绶?const cacheService = new CacheService();

// 鐎电厧鍤敮鎼佸櫤
const instance = cacheService;

// 鐎电厧鍤€圭偘绶ラ崪灞界埗闁?module.exports = {
  instance,
  CACHE_POLICY,
  CACHE_TYPE,
  EXPIRY_TIME
};

// 閸氬本妞傞弨顖涘瘮閻╁瓨甯村鏇犳暏鐎圭偘绶?module.exports.default = cacheService;
