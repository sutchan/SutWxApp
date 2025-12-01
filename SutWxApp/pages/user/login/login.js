/**
 * 文件名 login.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

const authService = require('../../../services/authService');

/**
 * 文件名 login.js
 * 閻劍鍩涚櫥褰曟い鐢告桨
 */
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    username: '',
    password: '',
    loading: false
  },

  /**
   * 婢跺嫮鎮婇悽銊﹀煕閸氬秷绶崗?   * @param {Object} e - 娴滃娆㈢€电钖?   */
  handleUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  /**
   * 婢跺嫮鎮婄€靛棛鐖滄潏鎾冲弳
   * @param {Object} e - 娴滃娆㈢€电钖?   */
  handlePasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  /**
   * 婢跺嫮鎮婄櫥褰曢柅鏄忕帆
   */
  async handleLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({
        title: '鐠囩柉绶崗銉ф暏閹村嘲鎮曢崪灞界槕閻?,
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const user = await authService.login(username, password);
      wx.showToast({
        title: `鐧诲綍閹存劕濮涢敍灞绢偨鏉?${user.username}`,
        icon: 'success'
      });
      // 鐧诲綍閹存劕濮涢崥搴ょ儲鏉烆剙鍩屾＃鏍€夐幋鏍у従娴犳牠銆夐棃?      wx.navigateBack(); 
    } catch (error) {
      wx.showToast({
        title: error.message || '鐧诲綍婢惰精瑙?,
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
