/**
 * 文件名: authService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 认证服务，处理用户登录、登出、会话管理等
 */

const Request = require('../utils/request');
const TOKEN_KEY = 'authToken';

const authService = {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 包含用户信息的 Promise
   */
  async login(username, password) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (username === 'test' && password === '123456') {
          const user = { id: 1, username: 'test', token: 'mock_token_123' };
          wx.setStorageSync(TOKEN_KEY, user.token);
          resolve(user);
        } else {
          reject(new Error('用户名或密码错误'));
        }
      }, 1000);
      
      // 将定时器ID附加到Promise上，以便在需要时可以取消
      resolve.timer = timer;
      reject.timer = timer;
    });
  },

  /**
   * 用户登出
   * @returns {Promise<void>} Promise
   */
  async logout() {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        wx.removeStorageSync(TOKEN_KEY);
        resolve();
      }, 500);
      
      // 将定时器ID附加到Promise上，以便在需要时可以取消
      resolve.timer = timer;
    });
  },

  /**
   * 获取当前认证token
   * @returns {string | null} token
   */
  getToken() {
    return wx.getStorageSync(TOKEN_KEY) || null;
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
    return !!token;
  },

  /**
   * 获取用户收藏列表
   * @returns {Promise<Array>} 用户收藏列表
   */
  async getUserFavorites() {
    const token = this.getToken();
    if (!token) {
      throw new Error('用户未登录');
    }
    
    try {
      const response = await Request.get('/user/favorites', {}, {
        header: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 获取用户地址列表
   * @returns {Promise<Array>} 用户地址列表
   */
  async getUserAddresses() {
    const token = this.getToken();
    if (!token) {
      throw new Error('用户未登录');
    }
    
    try {
      const response = await Request.get('/user/addresses', {}, {
        header: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 添加用户地址
   * @param {Object} address - 地址信息
   * @returns {Promise<Object>} 添加结果
   */
  async addUserAddress(address) {
    const token = this.getToken();
    if (!token) {
      throw new Error('用户未登录');
    }
    
    try {
      const response = await Request.post('/user/addresses', address, {
        header: { Authorization: `Bearer ${token}` }
      });
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
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
    const token = this.getToken();
    if (!token) {
      throw new Error('用户未登录');
    }
    
    try {
      const response = await Request.put(`/user/addresses/${addressId}`, address, {
        header: { Authorization: `Bearer ${token}` }
      });
      
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
      throw error;
    }
  },

  /**
   * 删除用户地址
   * @param {number} addressId - 地址ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteUserAddress(addressId) {
    const token = this.getToken();
    if (!token) {
      throw new Error('用户未登录');
    }
    
    try {
      const response = await Request.delete(`/user/addresses/${addressId}`, {}, {
        header: { Authorization: `Bearer ${token}` }
      });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      return response;
    } catch (error) {
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
      throw error;
    }
  }
};

module.exports = authService;