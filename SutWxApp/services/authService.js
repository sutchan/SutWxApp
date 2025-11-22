/**
 * 文件名: authService.js
 * 认证服务
 * 处理用户登录、登出、会话管理等。
 */

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
      setTimeout(() => {
        if (username === 'test' && password === '123456') {
          const user = { id: 1, username: 'test', token: 'mock_token_123' };
          wx.setStorageSync(TOKEN_KEY, user.token);
          resolve(user);
        } else {
          reject(new Error('用户名或密码错误'));
        }
      }, 1000);
    });
  },

  /**
   * 用户登出
   * @returns {Promise<void>} Promise
   */
  async logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        wx.removeStorageSync(TOKEN_KEY);
        resolve();
      }, 500);
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
  }
};

module.exports = authService;