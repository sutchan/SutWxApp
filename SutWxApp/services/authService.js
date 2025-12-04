/**
 * 文件名: authService.js
 * 版本号: 1.0.4
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 认证服务，处理用户登录、登出、会话管理等
 */

const request = require('../utils/request');
const store = require('../utils/store.js');
const TOKEN_KEY = 'authToken';

// 微信API包装，便于测试时模拟
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
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 包含用户信息的Promise
   */
  async login(username, password) {
    try {
      const response = await request.post('/auth/login', { username, password }, {
        needAuth: false
      });
      
      if (response && response.token) {
        // 保存token到本地存储
        wxApi.setStorageSync(TOKEN_KEY, response.token);
        // 保存到store中
        store.commit('SET_TOKEN', response.token);
        store.commit('SET_USER_INFO', response.user);
      }
      
      return response;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  /**
   * 微信授权登录
   * @returns {Promise<Object>} 包含用户信息的Promise
   */
  async wechatLogin() {
    try {
      // 1. 获取登录凭证
      const loginResult = await wxApi.login();
      if (!loginResult.code) {
        throw new Error('获取微信登录凭证失败');
      }

      // 2. 调用后端微信登录接口
      const response = await request.post('/auth/wechat-login', {
        code: loginResult.code
      }, {
        needAuth: false
      });

      if (response && response.token) {
        // 3. 保存token
        wxApi.setStorageSync(TOKEN_KEY, response.token);
        store.commit('SET_TOKEN', response.token);
        
        // 4. 如果需要获取用户信息
        if (!response.user) {
          try {
            // 5. 获取用户信息
            const userProfileResult = await wxApi.getUserProfile({
              desc: '用于完善用户资料'
            });
            
            // 6. 更新用户信息到后端
            const updateResponse = await request.post('/user/profile', {
              nickName: userProfileResult.userInfo.nickName,
              avatarUrl: userProfileResult.userInfo.avatarUrl,
              gender: userProfileResult.userInfo.gender
            });
            
            // 7. 保存完整用户信息
            store.commit('SET_USER_INFO', updateResponse.user);
            return updateResponse;
          } catch (profileError) {
            console.warn('获取用户信息失败:', profileError);
            // 即使获取用户信息失败，登录也已成功
            return response;
          }
        }
        
        store.commit('SET_USER_INFO', response.user);
        return response;
      }
    } catch (error) {
      console.error('微信登录失败:', error);
      throw error;
    }
  },

  /**
   * 用户登出
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await request.post('/auth/logout');
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      // 清除本地token和store中的用户信息
      wxApi.removeStorageSync(TOKEN_KEY);
      store.commit('SET_TOKEN', null);
      store.commit('SET_USER_INFO', null);
    }
  },

  /**
   * 获取当前认证token
   * @returns {string | null} token
   */
  getToken() {
    return wxApi.getStorageSync(TOKEN_KEY) || null;
  },

  /**
   * 检查用户是否已登录
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * 检查会话状态
   * @returns {Promise<boolean>} 会话是否有效
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
      // 会话无效，清除token
      this.logout();
      return false;
    }
  },

  /**
   * 获取用户收藏列表
   * @returns {Promise<Array>} 用户收藏列表
   */
  async getUserFavorites() {
    try {
      return await request.get('/user/favorites');
    } catch (error) {
      console.error('获取用户收藏列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户地址列表
   * @returns {Promise<Array>} 用户地址列表
   */
  async getUserAddresses() {
    try {
      return await request.get('/user/addresses');
    } catch (error) {
      console.error('获取用户地址列表失败:', error);
      throw error;
    }
  },

  /**
   * 添加用户地址
   * @param {Object} address - 地址信息
   * @returns {Promise<Object>} 添加结果
   */
  async addUserAddress(address) {
    try {
      const response = await request.post('/user/addresses', address);
      
      wxApi.showToast({
        title: '添加成功',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wxApi.showToast({
        title: '添加失败',
        icon: 'none'
      });
      console.error('添加用户地址失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户地址
   * @param {number} addressId - 地址ID
   * @param {Object} address - 地址信息
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserAddress(addressId, address) {
    try {
      const response = await request.put(`/user/addresses/${addressId}`, address);
      
      wxApi.showToast({
        title: '更新成功',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wxApi.showToast({
        title: '更新失败',
        icon: 'none'
      });
      console.error('更新用户地址失败:', error);
      throw error;
    }
  },

  /**
   * 删除用户地址
   * @param {number} addressId - 地址ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUserAddress(addressId) {
    try {
      const response = await request.delete(`/user/addresses/${addressId}`);
      
      wxApi.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wxApi.showToast({
        title: '删除失败',
        icon: 'none'
      });
      console.error('删除用户地址失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户信息
   * @returns {Promise<Object>} 用户信息
   */
  async getUserInfo() {
    try {
      const response = await request.get('/user/info');
      store.commit('SET_USER_INFO', response);
      return response;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 更新用户信息
   * @param {Object} userInfo - 用户信息
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserInfo(userInfo) {
    try {
      const response = await request.put('/user/info', userInfo);
      store.commit('SET_USER_INFO', response);
      
      wxApi.showToast({
        title: '更新成功',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wxApi.showToast({
        title: '更新失败',
        icon: 'none'
      });
      console.error('更新用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 发送验证码
   * @param {string} phone - 手机号码
   * @param {string} type - 验证码类型：login/reset
   * @returns {Promise<Object>} 发送结果
   */
  async sendVerificationCode(phone, type = 'login') {
    try {
      return await request.post('/auth/send-code', { phone, type });
    } catch (error) {
      console.error('发送验证码失败:', error);
      throw error;
    }
  },

  /**
   * 手机号验证码登录
   * @param {string} phone - 手机号码
   * @param {string} code - 验证码
   * @returns {Promise<Object>} 登录结果
   */
  async loginWithPhone(phone, code) {
    try {
      const response = await request.post('/auth/login/phone', { phone, code }, {
        needAuth: false
      });
      
      if (response && response.token) {
        // 保存token到本地存储
        wxApi.setStorageSync(TOKEN_KEY, response.token);
        // 保存到store中
        store.commit('SET_TOKEN', response.token);
        store.commit('SET_USER_INFO', response.user);
      }
      
      return response;
    } catch (error) {
      console.error('手机号登录失败:', error);
      throw error;
    }
  },

  /**
   * 验证重置密码验证码
   * @param {string} phone - 手机号码
   * @param {string} code - 验证码
   * @returns {Promise<Object>} 验证结果
   */
  async verifyResetCode(phone, code) {
    try {
      return await request.post('/auth/verify-reset-code', { phone, code }, {
        needAuth: false
      });
    } catch (error) {
      console.error('验证重置密码验证码失败:', error);
      throw error;
    }
  },

  /**
   * 重置密码
   * @param {string} phone - 手机号码
   * @param {string} code - 验证码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} 重置结果
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
      console.error('重置密码失败:', error);
      throw error;
    }
  },

  /**
   * 修改密码
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await request.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }
};

module.exports = authService;