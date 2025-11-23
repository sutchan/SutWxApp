/**
 * 文件名: user.js
 * 用户中心页面
 */
const i18n = require('../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    userInfo: null,
    isLoggedIn: false,
    menuItems: [
      { id: 'orders', name: i18n.translate('我的订单'), icon: '/assets/images/icon_orders.png' },
      { id: 'favorites', name: i18n.translate('我的收藏'), icon: '/assets/images/icon_favorites.png' },
      { id: 'points', name: i18n.translate('积分中心'), icon: '/assets/images/icon_points.png' },
      { id: 'coupon', name: i18n.translate('优惠券'), icon: '/assets/images/icon_coupon.png' },
      { id: 'address', name: i18n.translate('收货地址'), icon: '/assets/images/icon_address.png' },
      { id: 'settings', name: i18n.translate('设置'), icon: '/assets/images/icon_settings.png' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   * @returns {void}
   */
  onLoad() {
    this.checkLoginStatus();
  },

  /**
   * 页面显示时触发
   * @returns {void}
   */
  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 下拉刷新回调
   * @returns {void}
   */
  onPullDownRefresh() {
    this.checkLoginStatus(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 检查登录状态
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  checkLoginStatus(done) {
    this.setData({ loading: true });
    
    // 检查本地存储的登录状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo,
        loading: false
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: null,
        loading: false
      });
    }
    
    if (typeof done === 'function') done();
  },

  /**
   * 跳转到登录页面
   * @returns {void}
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 退出登录
   * @returns {void}
   */
  logout() {
    wx.showModal({
      title: i18n.translate('提示'),
      content: i18n.translate('确定要退出登录吗？'),
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的登录信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          
          this.setData({
            isLoggedIn: false,
            userInfo: null
          });
          
          wx.showToast({
            title: i18n.translate('已退出登录'),
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 处理菜单项点击
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  handleMenuTap(e) {
    const { id } = e.currentTarget.dataset;
    
    // 检查是否需要登录
    if (!this.data.isLoggedIn && id !== 'settings') {
      this.goToLogin();
      return;
    }
    
    // 根据不同的菜单项跳转到不同页面
    switch (id) {
      case 'orders':
        wx.navigateTo({
          url: '/pages/user/order/list/list'
        });
        break;
      case 'favorites':
        wx.navigateTo({
          url: '/pages/user/favorite/favorite'
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
   * 跳转到个人资料页面
   * @returns {void}
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