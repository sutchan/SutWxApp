/**
 * 文件名: login.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

const authService = require('../../../services/authService');

/**
 * 文件名: login.js
 * 鐢ㄦ埛登录椤甸潰
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    username: '',
    password: '',
    loading: false
  },

  /**
   * 澶勭悊鐢ㄦ埛鍚嶈緭鍏?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  handleUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  /**
   * 澶勭悊瀵嗙爜杈撳叆
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  handlePasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  /**
   * 澶勭悊登录閫昏緫
   */
  async handleLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({
        title: '璇疯緭鍏ョ敤鎴峰悕鍜屽瘑鐮?,
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const user = await authService.login(username, password);
      wx.showToast({
        title: `登录鎴愬姛锛屾杩?${user.username}`,
        icon: 'success'
      });
      // 登录鎴愬姛鍚庤烦杞埌棣栭〉鎴栧叾浠栭〉闈?      wx.navigateBack(); 
    } catch (error) {
      wx.showToast({
        title: error.message || '登录澶辫触',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
