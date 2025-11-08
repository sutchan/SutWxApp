// 寰俊灏忕▼搴忓叆鍙ｆ枃浠?// 瀵煎叆鏈嶅姟妯″潡
import api from './utils/api';
import authService from './utils/auth-service';
import articleService from './utils/article-service';
import categoryService from './utils/category-service';
import searchService from './utils/search-service';
import commentService from './utils/comment-service';
import notificationService from './utils/notification-service';
import notificationMockService from './utils/notification-mock';
import analyticsService from './utils/analytics-service';
import followingService from './utils/following-service';
import userService from './utils/user-service';
import productService from './utils/product-service';
import cartService from './utils/cart-service';
import orderService from './utils/order-service';
import addressService from './utils/address-service';
import paymentService from './utils/payment-service';
import pointsService from './utils/points-service';
import configService from './utils/config-service';
import { setStorage, getStorage } from './utils/global';

App({
  // 鍏ㄥ眬鏈嶅姟瀹炰緥
  services: {
    api,
    auth: authService,
    article: articleService,
    category: categoryService,
    search: searchService,
    comment: commentService,
    notification: notificationService,
    notificationMock: notificationMockService,
    analytics: analyticsService,
    following: followingService,
    user: userService,
    product: productService,
    cart: cartService,
    order: orderService,
    address: addressService,
    payment: paymentService,
    points: pointsService,
    config: configService
  },
  
  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: '',
    appName: 'SUT寰俊灏忕▼搴?,
    appVersion: '1.0.9',
    isLoading: false,
    networkStatus: 'unknown'
  },

  onLaunch: function() {
    // 浠庢湰鍦板瓨鍌ㄨ幏鍙栭厤缃拰鐢ㄦ埛淇℃伅
    try {
      const token = getStorage('token');
      const apiBaseUrl = getStorage('apiBaseUrl');
      const userInfo = getStorage('userInfo');
      
      if (token) {
        this.globalData.token = token;
        // 璁剧疆API妯″潡鐨則oken
        api.setToken(token);
      }
      
      if (apiBaseUrl) {
        this.globalData.apiBaseUrl = apiBaseUrl;
      } else {
        // 榛樿API鍦板潃
        this.globalData.apiBaseUrl = 'https://your-wordpress-site.com/wp-json/sut-wechat-mini/v1';
      }
      
      if (userInfo) {
        this.globalData.userInfo = userInfo;
      }
      
      // 璁剧疆API鍩虹URL
      api.setBaseUrl(this.globalData.apiBaseUrl);
    } catch (e) {
      console.error('璇诲彇鏈湴瀛樺偍澶辫触:', e);
    }

    // 妫€鏌ョ綉缁滅姸鎬?    this.checkNetworkStatus();
    
    // 鐩戝惉缃戠粶鐘舵€佸彉鍖?    wx.onNetworkStatusChange((res) => {
      this.globalData.networkStatus = res.isConnected ? res.networkType : 'none';
      console.log('缃戠粶鐘舵€佸彉鍖?', this.globalData.networkStatus);
    });

    // 妫€鏌ュ皬绋嬪簭鏇存柊
    this.checkUpdate();
    
    // 璁板綍灏忕▼搴忓惎鍔ㄤ簨浠?    analyticsService.trackEvent('app_launch', {
      version: this.globalData.appVersion,
      timestamp: Date.now()
    });
    
    // 鍒濆鍖栫郴缁熼厤缃?    this.initSystemConfig();

    // 鍒濆鍖栦簯寮€鍙戠幆澧冿紙濡傛灉闇€瑕侊級
    // wx.cloud.init({
    //   env: 'your-env-id',
    //   traceUser: true
    // });
  },

  onShow: function() {
    // 灏忕▼搴忓惎鍔ㄦ垨浠庡悗鍙拌繘鍏ュ墠鍙版椂瑙﹀彂
    console.log('灏忕▼搴忓惎鍔ㄦ垨浠庡悗鍙拌繘鍏ュ墠鍙?);
    // 璁板綍椤甸潰鏄剧ず浜嬩欢
    analyticsService.trackEvent('app_show');
  },

  onHide: function() {
    // 灏忕▼搴忎粠鍓嶅彴杩涘叆鍚庡彴鏃惰Е鍙?    console.log('灏忕▼搴忎粠鍓嶅彴杩涘叆鍚庡彴');
    // 璁板綍椤甸潰闅愯棌浜嬩欢
    analyticsService.trackEvent('app_hide');
  },

  onError: function(error) {
    // 灏忕▼搴忓彂鐢熻剼鏈敊璇垨API璋冪敤澶辫触鏃惰Е鍙?    console.error('灏忕▼搴忛敊璇?', error);
    // 璁板綍閿欒淇℃伅
    analyticsService.trackError('灏忕▼搴忛敊璇?, {
      stack: error.stack || '',
      message: error.message || error
    });
  },
  
  /**
   * 妫€鏌ョ綉缁滅姸鎬?   */
  checkNetworkStatus: function() {
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkStatus = res.networkType;
      },
      fail: () => {
        this.globalData.networkStatus = 'unknown';
      }
    });
  },

  /**
   * 鍏ㄥ眬璇锋眰鏂规硶
   * 浣跨敤鏂扮殑api妯″潡澶勭悊鎵€鏈夌綉缁滆姹?   */
  /**
   * 缁熶竴璇锋眰鏂规硶锛堝吋瀹规棫鎺ュ彛锛?   * @param {Object} options - 璇锋眰閫夐」
   * @returns {Promise<any>} 璇锋眰缁撴灉
   */
  request: async function(options) {
    try {
      // 妫€鏌ョ綉缁滅姸鎬?      if (this.globalData.networkStatus === 'none') {
        throw new Error('缃戠粶鏈繛鎺?);
      }
      
      // 鑾峰彇API鏈嶅姟
      const apiService = this.getService('api');
      if (!apiService) {
        throw new Error('API鏈嶅姟鏈垵濮嬪寲');
      }
      
      // 鍚堝苟璇锋眰閫夐」
      const defaultOptions = {
        method: 'GET',
        data: {},
        header: {
          'content-type': 'application/json',
          'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : ''
        }
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      // 鏄剧ず鍔犺浇鐘舵€?      if (mergedOptions.showLoading !== false) {
        wx.showLoading({
          title: mergedOptions.loadingText || '鍔犺浇涓?,
        });
      }
      
      // 璋冪敤API妯″潡杩涜璇锋眰
      const result = await apiService.request(mergedOptions);
      
      // 澶勭悊杩斿洖缁撴灉
      if (result && result.code === 200) {
        return result.data;
      } else if (result && result.code === 401) {
        // 鏈巿鏉冿紝娓呴櫎鐧诲綍鐘舵€佸苟璺宠浆鐧诲綍
        this.clearUserData();
        throw new Error('鐧诲綍宸茶繃鏈燂紝璇烽噸鏂扮櫥褰?);
      } else {
        throw new Error(result?.message || '璇锋眰澶辫触');
      }
    } catch (e) {
      console.error('璇锋眰澶辫触:', e);
      
      // 鏄剧ず閿欒鎻愮ず
      if (options?.showError !== false) {
        wx.showToast({
          title: e.message || '璇锋眰澶辫触',
          icon: 'none'
        });
      }
      
      throw e;
    } finally {
      // 闅愯棌鍔犺浇鐘舵€?      if (options?.showLoading !== false) {
        wx.hideLoading();
      }
    }
  }

  // checkUpdate鏂规硶瀹氫箟绉昏嚦涓嬫柟锛岄伩鍏嶉噸澶嶅畾涔?
  /**
   * 寰俊鐧诲綍鏂规硶
   * @param {Object} userInfo - 鐢ㄦ埛淇℃伅瀵硅薄
   * @returns {Promise} - 杩斿洖Promise瀵硅薄
   */
  login: async function(userInfo = null) {
    try {
      this.globalData.isLoading = true;
      
      // 鑾峰彇璁よ瘉鏈嶅姟
      const authService = this.getService('auth');
      if (!authService) {
        throw new Error('璁よ瘉鏈嶅姟鏈垵濮嬪寲');
      }
      
      // 璋冪敤鐧诲綍鎺ュ彛
      const result = await authService.login(userInfo);
      
      if (result && result.success) {
        // 淇濆瓨鐢ㄦ埛淇℃伅鍜宼oken
        this.globalData.userInfo = result.userInfo || userInfo;
        this.globalData.token = result.token;
        
        // 璁剧疆API妯″潡鐨則oken
        const apiService = this.getService('api');
        if (apiService && apiService.setToken) {
          apiService.setToken(result.token);
        }
        
        // 瀛樺偍鍒版湰鍦?        setStorage('token', result.token);
        setStorage('userInfo', result.userInfo || userInfo);
        
        // 璁板綍鐧诲綍鎴愬姛浜嬩欢
        const analyticsService = this.getService('analytics');
        if (analyticsService) {
          analyticsService.trackEvent('login_success', {
            userId: result.userInfo?.id || 'unknown',
            timestamp: Date.now()
          });
        }
        
        return result;
      } else {
        // 璁板綍鐧诲綍澶辫触浜嬩欢
        const analyticsService = this.getService('analytics');
        if (analyticsService) {
          analyticsService.trackEvent('login_failure', {
            error: result?.message || 'Unknown error',
            timestamp: Date.now()
          });
        }
        
        throw new Error(result?.message || '鐧诲綍澶辫触');
      }
    } catch (e) {
      console.error('鐧诲綍澶辫触:', e);
      throw e;
    } finally {
      this.globalData.isLoading = false;
    }
  },
  
  /**
   * 妫€鏌ョ敤鎴锋槸鍚﹀凡鐧诲綍
   */
  isLoggedIn: function() {
    // 浣跨敤userService涓殑isLoggedIn鏂规硶
    return this.services.user.isLoggedIn();
  },
  
  /**
   * 鍒濆鍖栫郴缁熼厤缃?   */
  async initSystemConfig() {
    try {
      // 鑾峰彇閰嶇疆鏈嶅姟
      const configService = this.getService('config');
      if (configService && configService.load) {
        // 鍔犺浇绯荤粺閰嶇疆
        const config = await configService.load('base');
        console.log('绯荤粺閰嶇疆:', config);
        
        // 鏇存柊鍏ㄥ眬鏁版嵁
        if (config && config.apiBaseUrl) {
          this.globalData.apiBaseUrl = config.apiBaseUrl;
          // 鏇存柊API鏈嶅姟鐨勫熀纭€URL
          const apiService = this.getService('api');
          if (apiService && apiService.setBaseUrl) {
            apiService.setBaseUrl(config.apiBaseUrl);
          }
        }
      }
    } catch (e) {
      console.error('鍒濆鍖栫郴缁熼厤缃け璐?', e);
    }
  },
  
  /**
   * 娓呴櫎鐢ㄦ埛鏁版嵁
   */
  clearUserData: function() {
    try {
      // 浣跨敤userService涓殑clearLoginStatus鏂规硶
      this.services.user.clearLoginStatus();
      
      // 娓呴櫎鍏ㄥ眬鏁版嵁
      this.globalData.userInfo = null;
      this.globalData.token = '';
      
      console.log('鐢ㄦ埛鏁版嵁宸叉竻闄?);
    } catch (error) {
      console.error('娓呴櫎鐢ㄦ埛鏁版嵁澶辫触:', error);
    }
  },
  
  /**
   * 妫€鏌ュ簲鐢ㄦ洿鏂?   */
  checkUpdate: function() {
    // 妫€鏌ユ槸鍚︽敮鎸佹洿鏂?    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      // 妫€鏌ユ洿鏂?      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          wx.showModal({
            title: '鏂扮増鏈彲鐢?,
            content: '鍙戠幇鏂扮増鏈紝鏄惁鏇存柊锛?,
            success: function(resModal) {
              if (resModal.confirm) {
                // 鐢ㄦ埛鍚屾剰鏇存柊鍚庯紝褰撴柊鐗堟湰涓嬭浇瀹屾垚鏃惰繘琛屾彁绀?                updateManager.onUpdateReady(function() {
                  wx.showModal({
                    title: '鏇存柊鎻愮ず',
                    content: '鏂扮増鏈凡涓嬭浇瀹屾垚锛屾槸鍚﹂噸鍚簲鐢紵',
                    success: function(resConfirm) {
                      if (resConfirm.confirm) {
                        // 寮哄埗閲嶅惎骞跺簲鐢ㄦ柊鐗堟湰
                        updateManager.applyUpdate();
                      }
                    }
                  });
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: '宸叉槸鏈€鏂扮増鏈?,
            icon: 'success',
            duration: 2000
          });
        }
      });
      
      // 鏂扮増鏈笅杞藉け璐?      updateManager.onUpdateFailed(function() {
        wx.showToast({
          title: '鏇存柊澶辫触锛岃绋嶅悗閲嶈瘯',
          icon: 'none',
          duration: 2000
        });
      });
    } else {
      wx.showToast({
        title: '褰撳墠寰俊鐗堟湰涓嶆敮鎸佹洿鏂?,
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  /**
   * 浠庢湰鍦板瓨鍌ㄦ仮澶嶇敤鎴锋暟鎹?   */
  restoreUserData: function() {
    try {
      const token = getStorage('token');
      const userInfo = getStorage('userInfo');
      
      if (token) {
        this.globalData.token = token;
        const apiService = this.getService('api');
        if (apiService && apiService.setToken) {
          apiService.setToken(token);
        }
      }
      
      if (userInfo) {
        this.globalData.userInfo = userInfo;
        const authService = this.getService('auth');
        if (authService && authService.setUserInfo) {
          authService.setUserInfo(userInfo);
        }
      }
      
      console.log('鐢ㄦ埛鏁版嵁宸叉仮澶?);
      return true;
    } catch (e) {
      console.error('鎭㈠鐢ㄦ埛鏁版嵁澶辫触:', e);
      return false;
    }
  },

  /**
   * 鐧诲嚭鏂规硶
   */
  logout: async function() {
    try {
      // 鑾峰彇璁よ瘉鏈嶅姟
      const authService = this.getService('auth');
      if (authService && authService.logout) {
        // 璋冪敤鐧诲嚭鎺ュ彛
        await authService.logout();
      }
      
      // 娓呴櫎鏈湴瀛樺偍
      this.clearUserData();
      
      // 璁板綍鐧诲嚭浜嬩欢
      const analyticsService = this.getService('analytics');
      if (analyticsService) {
        analyticsService.trackEvent('logout', {
          timestamp: Date.now()
        });
      }
      
      // 璺宠浆鍒扮櫥褰曢〉闈?      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      
      console.log('鐧诲嚭鎴愬姛');
      return true;
    } catch (e) {
      console.error('鐧诲嚭澶辫触:', e);
      // 鍗充娇鎺ュ彛澶辫触锛屼篃娓呴櫎鏈湴鏁版嵁
      this.clearUserData();
      
      // 璺宠浆鍒扮櫥褰曢〉闈?      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      
      return false;
    }
  },

  /**
   * 鑾峰彇璁惧淇℃伅
   * @returns {Object} 璁惧淇℃伅瀵硅薄
   */
  getDeviceInfo: function() {
    try {
      return wx.getSystemInfoSync() || {};
    } catch (e) {
      console.error('鑾峰彇璁惧淇℃伅澶辫触:', e);
      return {};
    }
  }
});\n