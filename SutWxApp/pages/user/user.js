/**
 * 文件名 user.js
 * 版本号 1.0.1
 * 更新日期: 2025-11-24
 * 閻劍鍩涙稉顓炵妇妞ょ敻娼? */
const i18n = require('../../utils/i18n');
const { createPage } = require('../../utils/store');

createPage({
  // 閺勭姴鐨犻悩鑸碘偓浣稿煂妞ょ敻娼?  mapState: ['user.isLoggedIn', 'user.userInfo', 'ui.loading'],
  
  // 閺勭姴鐨爉utations閸掍即銆夐棃銏℃煙濞?  mapMutations: { 
    setLoading: 'SET_LOADING',
    setUserInfo: 'SET_USER_INFO',
    logoutUser: 'LOGOUT_USER'
  },
  data: {
    i18n: i18n,
    menuItems: [
      { id: 'orders', name: i18n.translate('閹存垹娈戣鍗?), icon: '/assets/images/icon_orders.png' },
      { id: 'favorites', name: i18n.translate('閹存垹娈戦弨鎯版'), icon: '/assets/images/icon_favorites.png' },
      { id: 'points', name: i18n.translate('缁夘垰鍨庢稉顓炵妇'), icon: '/assets/images/icon_points.png' },
      { id: 'coupon', name: i18n.translate('娴兼ɑ鍎崚?), icon: '/assets/images/icon_coupon.png' },
      { id: 'address', name: i18n.translate('鏀惰揣鍦板潃'), icon: '/assets/images/icon_address.png' },
      { id: 'settings', name: i18n.translate('鐠佸墽鐤?), icon: '/assets/images/icon_settings.png' }
    ]
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @returns {void}
   */
  onLoad() {
    this.checkLoginStatus();
  },

  /**
   * 妞ょ敻娼伴弰鍓с仛閺冩儼袝閸?   * @returns {void}
   */
  onShow() {
    // 濮ｅ繑顐奸弰鍓с仛妞ょ敻娼伴弮鑸殿梾閺屻儳娅ヨぐ鏇犲Ц閹?    this.checkLoginStatus();
  },

  /**
   * 娑撳濯洪崚閿嬫煀閸ョ偠鐨?   * @returns {void}
   */
  onPullDownRefresh() {
    this.checkLoginStatus(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?   * @param {Function} done - 鐎瑰本鍨氶崶鐐剁殶
   * @returns {void}
   */
  checkLoginStatus(done) {
    this.setLoading(true);
    
    // 濡偓閺屻儲婀伴崷鏉跨摠閸屻劎娈戠櫥褰曢悩鑸碘偓?    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      // 閺囧瓨鏌婇崚鐨妕ore
      this.setUserInfo(userInfo);
    }
    
    this.setLoading(false);
    
    if (typeof done === 'function') done();
  },

  /**
   * 鐠哄疇娴嗛崚鎵瑜版洟銆夐棃?   * @returns {void}
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 闁偓閸戣櫣娅ヨぐ?   * @returns {void}
   */
  logout() {
    wx.showModal({
      title: i18n.translate('閹绘劗銇?),
      content: i18n.translate('绾喖鐣剧憰渚€鈧偓閸戣櫣娅ヨぐ鏇炴偋閿?),
      success: (res) => {
        if (res.confirm) {
          // 闁俺绻僺tore闁偓閸戣櫣娅ヨぐ?          this.logoutUser();
          
          wx.showToast({
            title: i18n.translate('瀹告煡鈧偓閸戣櫣娅ヨぐ?),
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 婢跺嫮鎮婇懣婊冨礋妞ゅ湱鍋ｉ崙?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  handleMenuTap(e) {
    const { id } = e.currentTarget.dataset;
    
    // 濡偓閺屻儲妲搁崥锕傛付鐟曚胶娅ヨぐ?    if (!this.data.isLoggedIn && id !== 'settings') {
      this.goToLogin();
      return;
    }
    
    // 閺嶈宓佹稉宥呮倱閻ㄥ嫯褰嶉崡鏇€嶇捄瀹犳祮閸掗绗夐崥宀勩€夐棃?    switch (id) {
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
   * 鐠哄疇娴嗛崚棰侀嚋娴滈缚绁弬娆撱€夐棃?   * @returns {void}
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
