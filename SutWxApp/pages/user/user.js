// 鐢ㄦ埛涓績椤甸潰閫昏緫
import { showToast } from '../../utils/global';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    userInfo: {
      avatarUrl: '/images/default-avatar.png',
      nickName: '鏈櫥褰?,
      isLoggedIn: false
    },
    menuList: [
      {
        id: 'notifications',
        icon: '/images/notification.svg',
        title: '閫氱煡涓績',
        badge: null
      },
      {
        id: 'comments',
        icon: '/images/comment.png',
        title: '鎴戠殑璇勮',
        badge: null
      },
      {
        id: 'favorites',
        icon: '/images/favorite.png',
        title: '鎴戠殑鏀惰棌',
        badge: null
      },
      {
        id: 'coupon',
        icon: '/images/coupon.svg',
        title: '鎴戠殑浼樻儬鍒?,
        badge: null
      },
      {
        id: 'following',
        icon: '/images/following.png',
        title: '鎴戠殑鍏虫敞',
        badge: null
      },
      {
        id: 'followers',
        icon: '/images/followers.svg',
        title: '鎴戠殑绮変笣',
        badge: null
      },
      {
        id: 'points',
        icon: '/images/points.png',
        title: '鎴戠殑绉垎',
        badge: null
      },
      {
        id: 'settings',
        icon: '/images/settings.png',
        title: '璁剧疆',
        badge: null
      }
    ],
    isLoading: false,
    error: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    this.checkLoginStatus();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    this.checkLoginStatus();
  },

  /**
   * 妫€鏌ョ櫥褰曠姸鎬?   */
  checkLoginStatus: function() {
    const app = getApp();
    
    if (app.isLoggedIn()) {
      const userInfo = app.globalData.userInfo;
      this.setData({
        'userInfo': {
          ...userInfo,
          isLoggedIn: true
        }
      });
      this.loadUserData();
    }
  },

  /**
   * 鍔犺浇鐢ㄦ埛鏁版嵁
   */
  loadUserData: async function() {
    this.setData({ isLoading: true, error: null });
    
    const app = getApp();
    try {
      // 浣跨敤userService鑾峰彇鐢ㄦ埛璧勬枡
      const userData = await app.services.user.getUserProfile();
      
      this.setData({
        'userInfo.nickName': userData.nickname || this.data.userInfo.nickName,
        'userInfo.avatarUrl': userData.avatar_url || this.data.userInfo.avatarUrl,
        'menuList[1].badge': userData.comment_count || null,
        'menuList[2].badge': userData.favorite_count || null,
        'menuList[3].badge': userData.following_count || null,
        'menuList[4].badge': userData.followers_count || null,
        'menuList[5].badge': userData.points || null
      });
      
      // 鑾峰彇鏈閫氱煡鏁伴噺
      try {
        const unreadCount = await app.services.notification.getUnreadNotificationCount();
        this.setData({
          'menuList[0].badge': unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null
        });
      } catch (notificationError) {
        console.error('鑾峰彇鏈閫氱煡鏁伴噺澶辫触:', notificationError);
      }","},{
      
      // 鏇存柊鍏ㄥ眬鐢ㄦ埛淇℃伅
      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        nickName: userData.nickname || app.globalData.userInfo.nickName,
        avatarUrl: userData.avatar_url || app.globalData.userInfo.avatarUrl
      };
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛鏁版嵁澶辫触:', error);
      this.setData({ error: error.message || '鑾峰彇鐢ㄦ埛鏁版嵁澶辫触' });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 寰俊鐧诲綍
   */
  onWechatLogin: async function() {
    const app = getApp();
    this.setData({ isLoading: true, error: null });
    
    try {
      // 浣跨敤authService杩涜鐧诲綍
      const userInfo = await app.services.auth.loginWithWechat();
      
      this.setData({
        'userInfo': {
          ...userInfo,
          isLoggedIn: true
        }
      });
      
      showToast('鐧诲綍鎴愬姛', 'success');
      this.loadUserData();
      
      // 璁板綍鐧诲綍浜嬩欢
      app.services.analytics.trackEvent('user_login', {
        login_method: 'wechat'
      });
    } catch (error) {
      console.error('鐧诲綍澶辫触:', error);
      this.setData({ error: error.message || '鐧诲綍澶辫触' });
      showToast(error.message || '鐧诲綍澶辫触', 'none');
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 鑿滃崟鐐瑰嚮澶勭悊
   */
  onMenuClick: function(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    
    if (!this.data.userInfo.isLoggedIn) {
      this.onWechatLogin();
      return;
    }
    
    // 璁板綍鑿滃崟椤圭偣鍑讳簨浠?    app.services.analytics.trackEvent('user_menu_click', {
      menu_id: id
    });
    
    switch(id) {
      case 'notifications':
        wx.navigateTo({ url: '/pages/notification/list' });
        break;
      case 'comments':
        wx.navigateTo({ url: '/pages/user/comments' });
        break;
      case 'favorites':
        wx.navigateTo({ url: '/pages/user/favorite' });
        break;
      case 'coupon':
        wx.navigateTo({ url: '/pages/user/coupon/list' });
        break;
      case 'following':
        wx.navigateTo({ url: '/pages/user/following' });
        break;
      case 'followers':
        wx.navigateTo({ url: '/pages/user/followers' });
        break;
      case 'points':
        wx.navigateTo({ url: '/pages/user/points' });
        break;
      case 'settings':
        wx.navigateTo({ url: '/pages/user/settings' });
        break;
    }
  },

  /**
   * 缁戝畾WordPress璐﹀彿
   */
  bindWordPressAccount: function() {
    wx.navigateTo({ url: '/pages/user/bind-account' });
  },

  /**
   * 閫€鍑虹櫥褰?   */
  logout: function() {
    const app = getApp();
    
    wx.showModal({
      title: '纭閫€鍑?,
      content: '纭畾瑕侀€€鍑虹櫥褰曞悧锛?,
      success: (res) => {
        if (res.confirm) {
          try {
            // 浣跨敤app鎻愪緵鐨刲ogout鏂规硶
            app.logout();
            
            this.setData({
              userInfo: {
                avatarUrl: '/images/default-avatar.png',
                nickName: '鏈櫥褰?,
                isLoggedIn: false
              }
            });
            
            showToast('宸查€€鍑虹櫥褰?, 'success');
            
            // 璁板綍閫€鍑虹櫥褰曚簨浠?            app.services.analytics.trackEvent('user_logout');
          } catch (error) {
            console.error('閫€鍑虹櫥褰曞け璐?', error);
            showToast('閫€鍑哄け璐ワ紝璇烽噸璇?, 'none');
          }
        }
      }
    });
  }
});\n