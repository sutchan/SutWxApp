/**
 * 鏂囦欢鍚? request.js
 * 鐗堟湰鍙? 1.1.1
 * 鏇存柊鏃ユ湡: 2025-11-27
 * 娴ｆ粏鈧? Sut
 * 鎻忚堪: 缂冩垹绮剁拠閿嬬湴瀹搞儱鍙跨猾浼欑礉闂嗗棙鍨氱€瑰鍙忔宀冪槈閸滃瞼顬囩痪璺ㄧ处鐎? */

const signature = require('./signature.js');
const i18n = require('./i18n.js');
const store = require('./store.js');
const cacheService = require('./cacheService.js').instance;
const CACHE_POLICY = require('./cacheService.js').CACHE_POLICY;

// 闁板秶鐤嗘穱鈩冧紖
const API_CONFIG = {
  BASE_URL: 'https://api.example.com/v1', // 閻㈢喍楠囬悳顖氼暔API閸︽澘娼?  TEST_URL: 'https://test-api.example.com/v1', // 濞村鐦悳顖氼暔API閸︽澘娼?  USE_TEST: false, // 閺勵垰鎯佹担璺ㄦ暏濞村鐦悳顖氼暔
  TIMEOUT: 30000, // 鐠囬攱鐪扮搾鍛閺冨爼妫?  RETRY_COUNT: 3, // 闁插秷鐦▎鈩冩殶
  SECRET_KEY: '' // 缁涙儳鎮曠€靛棝鎸滈敍灞藉灥婵瀵查弮鏈佃礋缁岀尨绱濋柅姘崇箖鐎瑰鍙忛張鍝勫煑閼惧嘲褰?};

// 閸掓繂顫愰崠鏈匬I鐎靛棝鎸?(function initApiSecretKey() {
  try {
    // 娴犲骸鐣ㄩ崗銊ョ摠閸屻劏骞忛崣鏈匬I鐎靛棝鎸?    const secretKey = wx.getStorageSync('api_secret_key');
    if (secretKey) {
      API_CONFIG.SECRET_KEY = secretKey;
    } else {
      // 閻㈢喍楠囬悳顖氼暔娑撳绻€妞ゅ鍘ょ純鐡礟I鐎靛棝鎸?      if (!API_CONFIG.USE_TEST) {
        console.error('API鐎靛棝鎸滈張顏堝帳缂冾噯绱濈拠宄版躬鐎瑰鍙忕€涙ê鍋嶆稉顓☆啎缂冪敘pi_secret_key');
      }
    }
  } catch (error) {
    console.error('閼惧嘲褰嘇PI鐎靛棝鎸滄径杈Е:', error);
  }
})();

/**
 * 缂冩垹绮剁拠閿嬬湴瀹搞儱鍙跨猾? */
class Request {
  /**
   * 閸欐垼鎹PI鐠囬攱鐪?   * @param {Object} options - 鐠囬攱鐪伴柅澶愩€?   * @param {string} options.url - 鐠囬攱鐪癠RL
   * @param {string} options.method - 鐠囬攱鐪伴弬瑙勭《
   * @param {Object} options.data - 鐠囬攱鐪伴弫鐗堝祦
   * @param {Object} options.header - 鐠囬攱鐪版径?   * @param {boolean} options.needAuth - 閺勵垰鎯侀棁鈧憰浣筋吇鐠?   * @param {boolean} options.needSign - 閺勵垰鎯侀棁鈧憰浣侯劮閸?   * @param {Object} options.cache - 缂傛挸鐡ㄩ柊宥囩枂
   * @param {string} options.cache.policy - 缂傛挸鐡ㄧ粵鏍殣: 'NETWORK_FIRST', 'CACHE_FIRST', 'STALE_WHILE_REVALIDATE', 'ONLY_NETWORK', 'ONLY_CACHE'
   * @param {number} options.cache.maxAge - 缂傛挸鐡ㄩ張鈧径褏鏁撻崨钘夋噯閺堢噦绱欏В顐ゎ潡閿?   * @returns {Promise} 鐠囬攱鐪扮紒鎾寸亯
   */
  static async request(options) {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      needAuth = true,
      needSign = true,
      cache = {}
    } = options;
    
    // 閺嬪嫬缂撶拠閿嬬湴闁板秶鐤?    let requestOptions = {
      url: this._buildUrl(url),
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout: API_CONFIG.TIMEOUT
    };
    
    // 濞ｈ濮炵拋銈堢槈娣団剝浼?    if (needAuth) {
      const token = this._getAuthToken();
      if (token) {
        requestOptions.header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // 濞ｈ濮炵拠閿嬬湴缁涙儳鎮?    if (needSign) {
      requestOptions = signature.addSignatureToHeaders(
        requestOptions,
        API_CONFIG.SECRET_KEY
      );
    }
    
    // 婢跺嫮鎮婄紓鎾崇摠
    const cacheEnabled = method === 'GET' && cacheService && cache.policy;
    const cacheKey = this._generateCacheKey(requestOptions);
    
    // 閺嶈宓佺紓鎾崇摠缁涙牜鏆愰崘鍐茬暰閺勵垰鎯侀崗鍫ｇ箲閸ョ偟绱︾€涙ɑ鏆熼幑?    if (cacheEnabled) {
      switch (cache.policy) {
        case CACHE_POLICY.CACHE_FIRST:
          // 娴兼ê鍘涙担璺ㄦ暏缂傛挸鐡?          const cachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (cachedData) {
            return cachedData;
          }
          // 缂傛挸鐡ㄦ稉宥呯摠閸︻煉绱濋幍褑顢戠純鎴犵捕鐠囬攱鐪?          const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          await cacheService.set(cacheKey, result, cache.maxAge);
          return result;
          
        case CACHE_POLICY.ONLY_CACHE:
          // 閸欘亙濞囬悽銊х处鐎?          const onlyCachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (onlyCachedData) {
            return onlyCachedData;
          }
          throw new Error(i18n.translate('offline_data_unavailable') || '缁傝崵鍤庨弫鐗堝祦娑撳秴褰查悽?);
          
        case CACHE_POLICY.NETWORK_FIRST:
          try {
            // 娴兼ê鍘涙担璺ㄦ暏缂冩垹绮?            const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
            await cacheService.set(cacheKey, result, cache.maxAge);
            return result;
          } catch (error) {
            // 缂冩垹绮剁拠閿嬬湴婢惰精瑙﹂敍灞界毦鐠囨洑濞囬悽銊х处鐎?            const fallbackData = await cacheService.get(cacheKey);
            if (fallbackData) {
              return fallbackData;
            }
            throw error;
          }
          
        case CACHE_POLICY.STALE_WHILE_REVALIDATE:
          // 閸氬本妞傛潻鏂挎礀缂傛挸鐡ㄩ崪灞藉絺鐠ч缍夌紒婊嗩嚞濮瑰倹娲块弬鎵处鐎?          const staleData = await cacheService.get(cacheKey);
          
          // 閺冪姾顔戠紓鎾崇摠閺勵垰鎯佺€涙ê婀敍宀勫厴閸欐垼鎹ｇ純鎴犵捕鐠囬攱鐪伴弴瀛樻煀缂傛挸鐡?          this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT)
            .then(result => {
              cacheService.set(cacheKey, result, cache.maxAge);
            })
            .catch(error => {
              console.warn('閸掗攱鏌婄紓鎾崇摠婢惰精瑙?', error);
            });
          
          // 婵″倹鐏夐張澶岀处鐎涙﹫绱濋惄瀛樺复鏉╂柨娲栫紓鎾崇摠閺佺増宓?          if (staleData) {
            return staleData;
          }
          
          // 閸氾箑鍨粵澶婄窡缂冩垹绮剁拠閿嬬湴鐎瑰本鍨?          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          
        case CACHE_POLICY.ONLY_NETWORK:
        default:
          // 閸欘亙濞囬悽銊х秹缂佹粣绱濇稉宥囩处鐎?          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
      }
    }
    
    // 閺堫亜鎯庨悽銊х处鐎涙﹫绱濋惄瀛樺复閹笛嗩攽鐠囬攱鐪?    return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
  }
  
  /**
   * GET鐠囬攱鐪?   * @param {string} url - 鐠囬攱鐪癠RL
   * @param {Object} data - 鐠囬攱鐪伴弫鐗堝祦
   * @param {Object} options - 閸忔湹绮柅澶愩€?   * @returns {Promise} 鐠囬攱鐪扮紒鎾寸亯
   */
  static get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    });
  }
  
  /**
   * POST鐠囬攱鐪?   * @param {string} url - 鐠囬攱鐪癠RL
   * @param {Object} data - 鐠囬攱鐪伴弫鐗堝祦
   * @param {Object} options - 閸忔湹绮柅澶愩€?   * @returns {Promise} 鐠囬攱鐪扮紒鎾寸亯
   */
  static post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }
  
  /**
   * PUT鐠囬攱鐪?   * @param {string} url - 鐠囬攱鐪癠RL
   * @param {Object} data - 鐠囬攱鐪伴弫鐗堝祦
   * @param {Object} options - 閸忔湹绮柅澶愩€?   * @returns {Promise} 鐠囬攱鐪扮紒鎾寸亯
   */
  static put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  }
  
  /**
   * DELETE鐠囬攱鐪?   * @param {string} url - 鐠囬攱鐪癠RL
   * @param {Object} data - 鐠囬攱鐪伴弫鐗堝祦
   * @param {Object} options - 閸忔湹绮柅澶愩€?   * @returns {Promise} 鐠囬攱鐪扮紒鎾寸亯
   */
  static delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }
  
  /**
   * 閺嬪嫬缂撶€瑰本鏆RL
   * @private
   * @param {string} url - 閻╃顕甎RL
   * @returns {string} 鐎瑰本鏆RL
   */
  static _buildUrl(url) {
    // 婵″倹鐏夐弰顖氱暚閺佺ⅹRL閿涘瞼娲块幒銉ㄧ箲閸?    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 閸氾箑鍨幏鍏煎复閸╄櫣顢匲RL
    const baseUrl = API_CONFIG.USE_TEST ? API_CONFIG.TEST_URL : API_CONFIG.BASE_URL;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  /**
   * 閻㈢喐鍨氱紓鎾崇摠闁?   * @private
   * @param {Object} requestOptions - 鐠囬攱鐪伴柅澶愩€?   * @returns {string} 缂傛挸鐡ㄩ柨?   */
  static _generateCacheKey(requestOptions) {
    const { url, data, method } = requestOptions;
    // 鐏忓摙RL閸滃本鏆熼幑顔肩碍閸掓瀵查敍宀€鏁撻幋鎰暜娑撯偓閻ㄥ嫮绱︾€涙﹢鏁?    const dataString = typeof data === 'string' ? data : JSON.stringify(data || {});
    // 娴ｈ法鏁ら弴鎾彯閺佸牏娈戦崫鍫濈瑖缁犳纭堕悽鐔稿灇缂傛挸鐡ㄩ柨顕嗙礉閸戝繐鐨崘鍛摠閸楃姷鏁?    const hash = require('./crypto.js').md5(`${method}:${url}:${dataString}`);
    return hash;
  }
  
  /**
   * 閼惧嘲褰囩拋銈堢槈娴犮倗澧?   * @private
   * @returns {string|null} 娴犮倗澧?   */
  static _getAuthToken() {
    try {
      // 娴犲窏tore娑擃叀骞忛崣鏉ken
      const token = store.getState('user.token');
      if (token) {
        return token;
      }
      
      // 闂勫秶楠囬敍姘矤閺堫剙婀寸€涙ê鍋嶉懢宄板絿
      return wx.getStorageSync('token') || null;
    } catch (error) {
      console.error('閼惧嘲褰囩拋銈堢槈娴犮倗澧濇径杈Е:', error);
      return null;
    }
  }
  
  /**
   * 閹笛嗩攽鐠囬攱鐪伴獮璺侯槱閻炲棝鍣哥拠?   * @private
   * @param {Object} options - 鐠囬攱鐪伴柅澶愩€?   * @param {number} retryCount - 閸撯晙缍戦柌宥堢槸濞嗏剝鏆?   * @returns {Promise} 鐠囬攱鐪扮紒鎾寸亯
   */
  static _executeWithRetry(options, retryCount) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: (res) => {
          // 婢跺嫮鎮婇崫宥呯安
          if (res.statusCode === 401) {
            // 閺堫亝宸块弶鍐跨礉濞撳懘娅巘oken楠炶埖褰佺粈铏规瑜?            this._handleUnauthorized();
            reject(new Error(i18n.translate('login_required')));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            // 鐠囬攱鐪版径杈Е
            const errorMsg = res.data?.message || 
                            i18n.translate('network_error') || 
                            '缂冩垹绮剁拠閿嬬湴婢惰精瑙?;
            reject(new Error(errorMsg));
          }
        },
        fail: (err) => {
          // 婢跺嫮鎮婄純鎴犵捕闁挎瑨顕?          if (retryCount > 0) {
            // 闁插秷鐦拠閿嬬湴
            setTimeout(() => {
              this._executeWithRetry(options, retryCount - 1)
                .then(resolve)
                .catch(reject);
            }, 1000 * Math.pow(2, API_CONFIG.RETRY_COUNT - retryCount)); // 閹稿洦鏆熼柅鈧柆?          } else {
            // 闁插秷鐦▎鈩冩殶閻劌鐣敍灞惧閸戞椽鏁婄拠?            reject(new Error(i18n.translate('network_error') || '缂冩垹绮剁拠閿嬬湴婢惰精瑙?));
          }
        },
        complete: () => {
          // 鐠囬攱鐪扮€瑰本鍨氶崥搴ｆ畱婢跺嫮鎮?          if (store) {
            store.commit('SET_LOADING', false);
          }
        }
      });
    });
  }
  
  /**
   * 婢跺嫮鎮婇張顏呭房閺夊啯鍎忛崘?   * @private
   */
  static _handleUnauthorized() {
    // 濞撳懘娅庨悽銊﹀煕娣団剝浼呴崪瀹紀ken
    store.commit('SET_USER_INFO', null);
    store.commit('SET_TOKEN', null);
    
    // 濞撳懘娅庨張顒€婀寸€涙ê鍋?    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    } catch (error) {
      console.error('濞撳懘娅庣拋銈堢槈娣団剝浼呮径杈Е:', error);
    }
    
    // 閹绘劗銇氶悽銊﹀煕闂団偓鐟曚胶娅ヨぐ?    wx.showToast({
      title: i18n.translate('login_required'),
      icon: 'none'
    });
  }
  
  /**
   * 濞撳懘娅庨悧鐟扮暰URL閻ㄥ嫮绱︾€?   * @param {string} url - 鐠囬攱鐪癠RL
   * @param {Object} data - 鐠囬攱鐪伴弫鐗堝祦閿涘牆褰查柅澶涚礆
   * @returns {Promise<boolean>} 閺勵垰鎯佸〒鍛存珟閹存劕濮?   */
  static async clearCache(url, data = {}) {
    if (!cacheService) return false;
    
    const requestOptions = {
      url: this._buildUrl(url),
      method: 'GET',
      data
    };
    
    const cacheKey = this._generateCacheKey(requestOptions);
    return await cacheService.remove(cacheKey);
  }
  
  /**
   * 濞撳懘娅庨幍鈧張澶庮嚞濮瑰倻绱︾€?   * @returns {Promise<boolean>} 閺勵垰鎯佸〒鍛存珟閹存劕濮?   */
  static async clearAllCache() {
    if (!cacheService) return false;
    return await cacheService.clear('request');
  }
  
  /**
   * 娑撳﹣绱堕弬鍥︽
   * @param {string} url - 娑撳﹣绱禪RL
   * @param {string} filePath - 閺傚洣娆㈢捄顖氱窞
   * @param {Object} options - 閸忔湹绮柅澶愩€?   * @returns {Promise} 娑撳﹣绱剁紒鎾寸亯
   */
  static uploadFile(url, filePath, options = {}) {
    const {
      name = 'file',
      formData = {},
      header = {},
      needAuth = true
    } = options;
    
    // 濞ｈ濮炵拋銈堢槈娣団剝浼?    if (needAuth) {
      const token = this._getAuthToken();
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: this._buildUrl(url),
        filePath,
        name,
        formData,
        header,
        timeout: API_CONFIG.TIMEOUT,
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (res.statusCode === 200) {
              resolve(data);
            } else {
              reject(new Error(data.message || '娑撳﹣绱舵径杈Е'));
            }
          } catch (error) {
            reject(new Error('鐟欙絾鐎介崫宥呯安婢惰精瑙?));
          }
        },
        fail: (err) => {
          reject(new Error('娑撳﹣绱堕弬鍥︽婢惰精瑙?));
        }
      });
    });
  }
}

module.exports = Request;