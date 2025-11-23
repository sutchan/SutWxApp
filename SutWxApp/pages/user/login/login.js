/**
 * 文件名: login.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

const authService = require('../../../services/authService');

/**
 * 文件名: login.js
 * 用户登录页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: '',
    loading: false
  },

  /**
   * 处理用户名输入
   * @param {Object} e - 事件对象
   */
  handleUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  /**
   * 处理密码输入
   * @param {Object} e - 事件对象
   */
  handlePasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  /**
   * 处理登录逻辑
   */
  async handleLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const user = await authService.login(username, password);
      wx.showToast({
        title: `登录成功，欢迎 ${user.username}`,
        icon: 'success'
      });
      // 登录成功后跳转到首页或其他页面
      wx.navigateBack(); 
    } catch (error) {
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});