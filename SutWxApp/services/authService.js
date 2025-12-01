﻿/**
 * 文件名 authService.js
 * 版本号 1.0.2
 * 更新日期: 2025-11-29
 * 作者 Sut
 * 描述: 璁よ瘉鏈嶅姟锛屽鐞嗙敤鎴风櫥褰曘€佹敞鍐屻€佺櫥鍑恒€佷細璇濈鐞嗙瓑
 */

const request = require('../utils/request');
const store = require('../utils/store.js');
const TOKEN_KEY = 'authToken';

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
        // 娣囨繂鐡╰oken閸掔増婀伴崷鏉跨摠閸?        wx.setStorageSync(TOKEN_KEY, response.token);
        // 閺囧瓨鏌妔tore娑擃厾娈戦悽銊﹀煕娣団剝浼?        store.commit('SET_TOKEN', response.token);
        store.commit('SET_USER_INFO', response.user);
      }
      
      return response;
    } catch (error) {
      console.error('鐧诲綍澶辫触:', error);
      throw error;
    }
  },

  /**
   * 鐢ㄦ埛鐧诲嚭
   * @returns {Promise<void>} Promise
   */
  async logout() {
    try {
      await request.post('/auth/logout');
      
      // 濞撳懘娅庨張顒€婀寸€涙ê鍋嶉崪瀹籺ore娑擃厾娈戦悽銊﹀煕娣団剝浼?      wx.removeStorageSync(TOKEN_KEY);
      store.commit('SET_TOKEN', null);
      store.commit('SET_USER_INFO', null);
    } catch (error) {
      console.error('鐧诲嚭澶辫触:', error);
      // 閸楀厖濞嘇PI鐠嬪啰鏁ゆ径杈Е閿涘奔绡冪憰浣圭闂勩倖婀伴崷鎵Ц閹?      wx.removeStorageSync(TOKEN_KEY);
      store.commit('SET_TOKEN', null);
      store.commit('SET_USER_INFO', null);
    }
  },

  /**
   * 鑾峰彇褰撳墠璁よ瘉token
   * @returns {string | null} token
   */
  getToken() {
    return wx.getStorageSync(TOKEN_KEY) || null;
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
      // 娴兼俺鐦介弮鐘虫櫏閿涘本绔婚梽顦歰ken
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
      
      wx.showToast({
        title: '娣诲姞鎴愬姛',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wx.showToast({
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
      
      wx.showToast({
        title: '鏇存柊鎴愬姛',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wx.showToast({
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
      
      wx.showToast({
        title: '鍒犻櫎鎴愬姛',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wx.showToast({
        title: '鍒犻櫎澶辫触',
        icon: 'none'
      });
      console.error('鍒犻櫎鐢ㄦ埛鍦板潃澶辫触:', error);
      throw error;
    }
  }
};

module.exports = authService;