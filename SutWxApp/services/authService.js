﻿﻿﻿/**
 * 文件名: authService.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 作者: Sut
 * 描述: 认证服务，处理用户登录、登出、会话管理等
 */

const request = require('../utils/request');
const store = require('../utils/store.js');
const TOKEN_KEY = 'authToken';

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
        wx.setStorageSync(TOKEN_KEY, response.token);
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
   * 用户登出
   * @returns {Promise<void>} Promise
   */
  async logout() {
    try {
      await request.post('/auth/logout');
      
      // 清除本地token和store中的用户信息
      wx.removeStorageSync(TOKEN_KEY);
      store.commit('SET_TOKEN', null);
      store.commit('SET_USER_INFO', null);
    } catch (error) {
      console.error('登出失败:', error);
      // 即使API调用失败，也要清除本地token
      wx.removeStorageSync(TOKEN_KEY);
      store.commit('SET_TOKEN', null);
      store.commit('SET_USER_INFO', null);
    }
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
      console.error('删除用户地址失败:', error);
      throw error;
    }
  }
};

module.exports = authService;