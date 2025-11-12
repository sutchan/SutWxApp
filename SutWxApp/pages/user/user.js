// 个人中心页面控制器
import { showToast } from '../../utils/global';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '/images/default-avatar.png',
      nickName: '未登录用户',
      isLoggedIn: false
    },
    menuList: [
      {
        id: 'notifications',
        icon: '/images/notification.svg',
        title: '通知消息',
        badge: null
      },
      {
        id: 'comments',
        icon: '/images/comment.png',
        title: '评论回复',
        badge: null
      },
      {
        id: 'favorites',
        icon: '/images/favorite.png',
        title: '我的收藏',
        badge: null
      },
      {
        id: 'coupon',
        icon: '/images/coupon.svg',
        title: '优惠券',
        badge: null
      },
      {
        id: 'following',
        icon: '/images/following.png',
        title: '我的关注',
        badge: null
      },
      {
        id: 'followers',
        icon: '/images/followers.svg',
        title: '我的粉丝',
        badge: null
      },
      {
        id: 'points',
        icon: '/images/points.png',
        title: '积分中心',
        badge: null
      },
      {
        id: 'settings',
        icon: '/images/settings.png',
        title: '设置',
        badge: null
      }
    ],
    isLoading: false,
    error: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
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
   * 加载用户数据
   */
  loadUserData: async function() {
    this.setData({ isLoading: true, error: null });

    const app = getApp();
    try {
      // 调用userService获取用户信息
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

      // 获取未读通知数量
      try {
        const unreadCount = await app.services.notification.getUnreadNotificationCount();
        this.setData({
          'menuList[0].badge': unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : null
        });
      } catch (notificationError) {
        console.error('获取未读通知数量失败', notificationError);
      }

      // 更新全局用户信息
      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        nickName: userData.nickname || app.globalData.userInfo.nickName,
        avatarUrl: userData.avatar_url || app.globalData.userInfo.avatarUrl
      };
    } catch (error) {
      console.error('加载用户数据失败:', error);
      this.setData({ error: error.message || '加载用户数据失败' });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 微信登录
   */
  onWechatLogin: async function() {
    const app = getApp();
    this.setData({ isLoading: true, error: null });

    try {
      // 调用authService进行登录
      const userInfo = await app.services.auth.loginWithWechat();

      this.setData({
        'userInfo': {
          ...userInfo,
          isLoggedIn: true
        }
      });

      showToast('登录成功', 'success');
      this.loadUserData();

      // 记录登录事件
      app.services.analytics.trackEvent('user_login', {
        login_method: 'wechat'
      });
    } catch (error) {
      console.error('登录失败:', error);
      this.setData({ error: error.message || '登录失败' });
      showToast(error.message || '登录失败', 'none');
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 菜单点击事件
   */
  onMenuClick: function(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();

    if (!this.data.userInfo.isLoggedIn) {
      this.onWechatLogin();
      return;
    }

    // 记录菜单点击事件
    app.services.analytics.trackEvent('user_menu_click', {
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
   * 绑定WordPress账户
   */
  bindWordPressAccount: function() {
    wx.navigateTo({ url: '/pages/user/bind-account' });
  },

  /**
   * 退出登录
   */
  logout: function() {
    const app = getApp();

    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            // 调用app的logout方法
            app.logout();

            this.setData({
              userInfo: {
                avatarUrl: '/images/default-avatar.png',
                nickName: '未登录用户',
                isLoggedIn: false
              }
            });

            showToast('已退出登录', 'success');
          } catch (error) {
            console.error('退出登录失败:', error);
            showToast('退出登录失败', 'none');
          }
        }
      }
    });
  }
});