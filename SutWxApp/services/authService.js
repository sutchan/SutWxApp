/**
 * 鏂囦欢鍚? authService.js
 * 鐗堟湰鍙? 1.0.4
 * 鏇存柊鏃ユ湡: 2025-12-04
 * 浣滆€? Sut
 * 鎻忚堪: 璁よ瘉鏈嶅姟锛屽鐞嗙敤鎴风櫥褰曘€佺櫥鍑恒€佷細璇濈鐞嗙瓑
 */

const request = require('../utils/request');
const store = require('../utils/store.js');
const TOKEN_KEY = 'authToken';

// 寰俊API鍖呰锛屼究浜庢祴璇曟椂妯℃嫙
const wxApi = {
  setStorageSync: (key, value) => {
    if (typeof wx !== 'undefined') {
      return wx.setStorageSync(key, value);
    }
    return null;
  },
  getStorageSync: (key) => {
    if (typeof wx !== 'undefined') {
      return wx.getStorageSync(key);
    }
    return null;
  },
  removeStorageSync: (key) => {
    if (typeof wx !== 'undefined') {
      return wx.removeStorageSync(key);
    }
    return null;
  },
  showToast: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.showToast(options);
    }
    return null;
  },
  login: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.login(options);
    }
    return Promise.resolve({ code: 'mock_code' });
  },
  getUserProfile: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.getUserProfile(options);
    }
    return Promise.resolve({
      userInfo: {
        nickName: 'Mock User',
        avatarUrl: 'https://example.com/avatar.jpg',
        gender: 1
      }
    });
  },
  showModal: (options) => {
    if (typeof wx !== 'undefined') {
      return wx.showModal(options);
    }
    return null;
  }
};

const authService = {
  /**
   * 鐢ㄦ埛鐧诲綍
   * @param {string} username - 鐢ㄦ埛鍚?   * @param {string} password - 瀵嗙爜
   * @returns {Promise<Object>} 鍖呭惈鐢ㄦ埛淇℃伅鐨凱romise
   */
  async login(username, password) {
    try {
      const response = await request.post('/auth/login', { username, password }, {
        needAuth: false
      });
      
      if (response && response.token) {
        // 淇濆瓨token鍒版湰鍦板瓨鍌?        wxApi.setStorageSync(TOKEN_KEY, response.token);
        // 淇濆瓨鍒皊tore涓?        store.commit('SET_TOKEN', response.token);
        store.commit('SET_USER_INFO', response.user);
      }
      
      return response;
    } catch (error) {
      console.error('鐧诲綍澶辫触:', error);
      throw error;
    }
  },

  /**
   * 寰俊鎺堟潈鐧诲綍
   * @param {Object} options - 鐧诲綍閫夐」
   * @param {boolean} options.needUserInfo - 鏄惁闇€瑕佽幏鍙栫敤鎴蜂俊鎭?   * @returns {Promise<Object>} 鍖呭惈鐢ㄦ埛淇℃伅鐨凱romise
   */
  async wechatLogin(options = { needUserInfo: true }) {
    try {
      // 1. 鏄剧ず鐧诲綍涓彁绀?      wxApi.showToast({
        title: '鐧诲綍涓?..',
        icon: 'loading',
        duration: 10000
      });

      // 2. 鑾峰彇鐧诲綍鍑瘉
      const loginResult = await wxApi.login();
      if (!loginResult.code) {
        throw new Error('鑾峰彇寰俊鐧诲綍鍑瘉澶辫触');
      }

      // 3. 璋冪敤鍚庣寰俊鐧诲綍鎺ュ彛
      const response = await request.post('/auth/wechat-login', {
        code: loginResult.code
      }, {
        needAuth: false
      });

      if (response && response.token) {
        // 4. 淇濆瓨token
        wxApi.setStorageSync(TOKEN_KEY, response.token);
        store.commit('SET_TOKEN', response.token);
        
        // 5. 淇濆瓨鐢ㄦ埛淇℃伅锛堝鏋滃凡杩斿洖锛?        if (response.user) {
          store.commit('SET_USER_INFO', response.user);
        }
        
        // 6. 鏇存柊鐧诲綍鐘舵€?        store.commit('SET_LOGIN_STATUS', true);
        
        // 7. 闅愯棌鐧诲綍鎻愮ず
        wxApi.showToast({
          title: '鐧诲綍鎴愬姛',
          icon: 'success'
        });
        
        return response;
      } else {
        throw new Error('鐧诲綍澶辫触锛岀己灏憈oken');
      }
    } catch (error) {
      console.error('寰俊鐧诲綍澶辫触:', error);
      
      // 闅愯棌鐧诲綍鎻愮ず骞舵樉绀洪敊璇俊鎭?      wxApi.showToast({
        title: error.message || '鐧诲綍澶辫触',
        icon: 'none'
      });
      
      // 鏇存柊鐧诲綍鐘舵€?      store.commit('SET_LOGIN_STATUS', false);
      
      throw error;
    }
  },

  /**
   * 鐢ㄦ埛鐧诲嚭
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await request.post('/auth/logout');
    } catch (error) {
      console.error('鐧诲嚭澶辫触:', error);
    } finally {
      // 娓呴櫎鏈湴token鍜宻tore涓殑鐢ㄦ埛淇℃伅
      wxApi.removeStorageSync(TOKEN_KEY);
      store.commit('SET_TOKEN', null);
      store.commit('SET_USER_INFO', null);
      // 鏇存柊鐧诲綍鐘舵€?      store.commit('SET_LOGIN_STATUS', false);
      
      wxApi.showToast({
        title: '宸查€€鍑虹櫥褰?,
        icon: 'success'
      });
    }
  },

  /**
   * 鑾峰彇褰撳墠璁よ瘉token
   * @returns {string | null} token
   */
  getToken() {
    return wxApi.getStorageSync(TOKEN_KEY) || null;
  },

  /**
   * 妫€鏌ョ敤鎴锋槸鍚﹀凡鐧诲綍
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * 妫€鏌ヤ細璇濈姸鎬?   * @returns {Promise<boolean>} 浼氳瘽鏄惁鏈夋晥
   */
  async checkSession() {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      await request.get('/auth/check-session');
      return true;
    } catch (error) {
      // 浼氳瘽鏃犳晥锛屾竻闄oken
      this.logout();
      return false;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛鏀惰棌鍒楄〃
   * @returns {Promise<Array>} 鐢ㄦ埛鏀惰棌鍒楄〃
   */
  async getUserFavorites() {
    try {
      return await request.get('/user/favorites');
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛鏀惰棌鍒楄〃澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛鍦板潃鍒楄〃
   * @returns {Promise<Array>} 鐢ㄦ埛鍦板潃鍒楄〃
   */
  async getUserAddresses() {
    try {
      return await request.get('/user/addresses');
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛鍦板潃鍒楄〃澶辫触:', error);
      throw error;
    }
  },

  /**
   * 娣诲姞鐢ㄦ埛鍦板潃
   * @param {Object} address - 鍦板潃淇℃伅
   * @returns {Promise<Object>} 娣诲姞缁撴灉
   */
  async addUserAddress(address) {
    try {
      const response = await request.post('/user/addresses', address);
      
      wxApi.showToast({
        title: '娣诲姞鎴愬姛',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wxApi.showToast({
        title: '娣诲姞澶辫触',
        icon: 'none'
      });
      console.error('娣诲姞鐢ㄦ埛鍦板潃澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鏇存柊鐢ㄦ埛鍦板潃
   * @param {number} addressId - 鍦板潃ID
   * @param {Object} address - 鍦板潃淇℃伅
   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  async updateUserAddress(addressId, address) {
    try {
      const response = await request.put(`/user/addresses/${addressId}`, address);
      
      wxApi.showToast({
        title: '鏇存柊鎴愬姛',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wxApi.showToast({
        title: '鏇存柊澶辫触',
        icon: 'none'
      });
      console.error('鏇存柊鐢ㄦ埛鍦板潃澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鍒犻櫎鐢ㄦ埛鍦板潃
   * @param {number} addressId - 鍦板潃ID
   * @returns {Promise<Object>} 鍒犻櫎缁撴灉
   */
  async deleteUserAddress(addressId) {
    try {
      const response = await request.delete(`/user/addresses/${addressId}`);
      
      wxApi.showToast({
        title: '鍒犻櫎鎴愬姛',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wxApi.showToast({
        title: '鍒犻櫎澶辫触',
        icon: 'none'
      });
      console.error('鍒犻櫎鐢ㄦ埛鍦板潃澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鑾峰彇鐢ㄦ埛淇℃伅
   * @returns {Promise<Object>} 鐢ㄦ埛淇℃伅
   */
  async getUserInfo() {
    try {
      const response = await request.get('/user/info');
      store.commit('SET_USER_INFO', response);
      return response;
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛淇℃伅澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鏇存柊鐢ㄦ埛淇℃伅
   * @param {Object} userInfo - 鐢ㄦ埛淇℃伅
   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  async updateUserInfo(userInfo) {
    try {
      const response = await request.put('/user/info', userInfo);
      store.commit('SET_USER_INFO', response);
      
      wxApi.showToast({
        title: '鏇存柊鎴愬姛',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wxApi.showToast({
        title: '鏇存柊澶辫触',
        icon: 'none'
      });
      console.error('鏇存柊鐢ㄦ埛淇℃伅澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鍙戦€侀獙璇佺爜
   * @param {string} phone - 鎵嬫満鍙风爜
   * @param {string} type - 楠岃瘉鐮佺被鍨嬶細login/reset
   * @returns {Promise<Object>} 鍙戦€佺粨鏋?   */
  async sendVerificationCode(phone, type = 'login') {
    try {
      return await request.post('/auth/send-code', { phone, type });
    } catch (error) {
      console.error('鍙戦€侀獙璇佺爜澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鎵嬫満鍙烽獙璇佺爜鐧诲綍
   * @param {string} phone - 鎵嬫満鍙风爜
   * @param {string} code - 楠岃瘉鐮?   * @returns {Promise<Object>} 鐧诲綍缁撴灉
   */
  async loginWithPhone(phone, code) {
    try {
      const response = await request.post('/auth/login/phone', { phone, code }, {
        needAuth: false
      });
      
      if (response && response.token) {
        // 淇濆瓨token鍒版湰鍦板瓨鍌?        wxApi.setStorageSync(TOKEN_KEY, response.token);
        // 淇濆瓨鍒皊tore涓?        store.commit('SET_TOKEN', response.token);
        store.commit('SET_USER_INFO', response.user);
      }
      
      return response;
    } catch (error) {
      console.error('鎵嬫満鍙风櫥褰曞け璐?', error);
      throw error;
    }
  },

  /**
   * 楠岃瘉閲嶇疆瀵嗙爜楠岃瘉鐮?   * @param {string} phone - 鎵嬫満鍙风爜
   * @param {string} code - 楠岃瘉鐮?   * @returns {Promise<Object>} 楠岃瘉缁撴灉
   */
  async verifyResetCode(phone, code) {
    try {
      return await request.post('/auth/verify-reset-code', { phone, code }, {
        needAuth: false
      });
    } catch (error) {
      console.error('楠岃瘉閲嶇疆瀵嗙爜楠岃瘉鐮佸け璐?', error);
      throw error;
    }
  },

  /**
   * 閲嶇疆瀵嗙爜
   * @param {string} phone - 鎵嬫満鍙风爜
   * @param {string} code - 楠岃瘉鐮?   * @param {string} newPassword - 鏂板瘑鐮?   * @returns {Promise<Object>} 閲嶇疆缁撴灉
   */
  async resetPassword(phone, code, newPassword) {
    try {
      const response = await request.post('/auth/reset-password', {
        phone,
        code,
        newPassword
      }, {
        needAuth: false
      });
      return response;
    } catch (error) {
      console.error('閲嶇疆瀵嗙爜澶辫触:', error);
      throw error;
    }
  },

  /**
   * 淇敼瀵嗙爜
   * @param {string} oldPassword - 鏃у瘑鐮?   * @param {string} newPassword - 鏂板瘑鐮?   * @returns {Promise<Object>} 淇敼缁撴灉
   */
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await request.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('淇敼瀵嗙爜澶辫触:', error);
      throw error;
    }
  }
};

module.exports = authService;