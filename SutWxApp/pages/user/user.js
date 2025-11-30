/**
 * 文件名: user.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-24
 * 鐢ㄦ埛涓績椤甸潰
 */
const i18n = require('../../utils/i18n');
const { createPage } = require('../../utils/store');

createPage({
  // 鏄犲皠鐘舵€佸埌椤甸潰
  mapState: ['user.isLoggedIn', 'user.userInfo', 'ui.loading'],
  
  // 鏄犲皠mutations鍒伴〉闈㈡柟娉?  mapMutations: { 
    setLoading: 'SET_LOADING',
    setUserInfo: 'SET_USER_INFO',
    logoutUser: 'LOGOUT_USER'
  },
  data: {
    i18n: i18n,
    menuItems: [
      { id: 'orders', name: i18n.translate('鎴戠殑订单'), icon: '/assets/images/icon_orders.png' },
      { id: 'favorites', name: i18n.translate('鎴戠殑鏀惰棌'), icon: '/assets/images/icon_favorites.png' },
      { id: 'points', name: i18n.translate('绉垎涓績'), icon: '/assets/images/icon_points.png' },
      { id: 'coupon', name: i18n.translate('浼樻儬鍒?), icon: '/assets/images/icon_coupon.png' },
      { id: 'address', name: i18n.translate('收货地址'), icon: '/assets/images/icon_address.png' },
      { id: 'settings', name: i18n.translate('璁剧疆'), icon: '/assets/images/icon_settings.png' }
    ]
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @returns {void}
   */
  onLoad() {
    this.checkLoginStatus();
  },

  /**
   * 椤甸潰鏄剧ず鏃惰Е鍙?   * @returns {void}
   */
  onShow() {
    // 姣忔鏄剧ず椤甸潰鏃舵鏌ョ櫥褰曠姸鎬?    this.checkLoginStatus();
  },

  /**
   * 涓嬫媺鍒锋柊鍥炶皟
   * @returns {void}
   */
  onPullDownRefresh() {
    this.checkLoginStatus(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 妫€鏌ョ櫥褰曠姸鎬?   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  checkLoginStatus(done) {
    this.setLoading(true);
    
    // 妫€鏌ユ湰鍦板瓨鍌ㄧ殑登录鐘舵€?    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      // 鏇存柊鍒皊tore
      this.setUserInfo(userInfo);
    }
    
    this.setLoading(false);
    
    if (typeof done === 'function') done();
  },

  /**
   * 璺宠浆鍒扮櫥褰曢〉闈?   * @returns {void}
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 閫€鍑虹櫥褰?   * @returns {void}
   */
  logout() {
    wx.showModal({
      title: i18n.translate('鎻愮ず'),
      content: i18n.translate('纭畾瑕侀€€鍑虹櫥褰曞悧锛?),
      success: (res) => {
        if (res.confirm) {
          // 閫氳繃store閫€鍑虹櫥褰?          this.logoutUser();
          
          wx.showToast({
            title: i18n.translate('宸查€€鍑虹櫥褰?),
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 澶勭悊鑿滃崟椤圭偣鍑?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  handleMenuTap(e) {
    const { id } = e.currentTarget.dataset;
    
    // 妫€鏌ユ槸鍚﹂渶瑕佺櫥褰?    if (!this.data.isLoggedIn && id !== 'settings') {
      this.goToLogin();
      return;
    }
    
    // 鏍规嵁涓嶅悓鐨勮彍鍗曢」璺宠浆鍒颁笉鍚岄〉闈?    switch (id) {
      case 'orders':
        wx.navigateTo({
          url: '/pages/user/order/list/list'
        });
        break;
      case 'favorites':
        wx.navigateTo({
          url: '/pages/user/favorites'
        });
        break;
      case 'points':
        wx.navigateTo({
          url: '/pages/user/points/points'
        });
        break;
      case 'coupon':
        wx.navigateTo({
          url: '/pages/user/coupon/list/list'
        });
        break;
      case 'address':
        wx.navigateTo({
          url: '/pages/user/address/list/list'
        });
        break;
      case 'settings':
        wx.navigateTo({
          url: '/pages/user/settings/settings'
        });
        break;
      default:
        break;
    }
  },

  /**
   * 璺宠浆鍒颁釜浜鸿祫鏂欓〉闈?   * @returns {void}
   */
  goToProfile() {
    if (!this.data.isLoggedIn) {
      this.goToLogin();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/user/profile/profile'
    });
  }
});
