// 用户详情页面 - 用于查看其他用户的信息
import { showToast } from '../../utils/global';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userId: '', // 用户ID
    userInfo: null, // 用户信息
    loading: true, // 加载状态
    error: '', // 错误信息
    isFollowing: false, // 是否已关注
    followingCount: 0, // 关注数
    followersCount: 0, // 粉丝数
    articlesCount: 0, // 文章数
    isCurrentUser: false // 是否为当前用户
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const app = getApp();
    
    // 获取传入的用户ID
    const userId = options.id || '';
    
    if (!userId) {
      this.setData({
        error: '用户ID不存在',
        loading: false
      });
      return;
    }
    
    this.setData({
      userId: userId,
      // 检查是否为当前登录用户
      isCurrentUser: app.globalData.userInfo && app.globalData.userInfo.id === userId
    });
    
    // 加载用户信息
    this.loadUserInfo();
    
    // 记录页面访问事件
    if (app.services && app.services.analytics) {
      app.services.analytics.trackPageView('user_profile_detail', { userId: userId });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时刷新数据
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: async function() {
    const app = getApp();
    
    // 显示加载状态
    this.setData({
      loading: true,
      error: ''
    });

    try {
      // 使用用户服务获取用户信息
      const result = await app.services.api.request({
        url: `/users/${this.data.userId}`,
        method: 'GET'
      });
      
      const userInfo = result.data || {};
      
      this.setData({
        userInfo: userInfo,
        followingCount: userInfo.following_count || 0,
        followersCount: userInfo.followers_count || 0,
        articlesCount: userInfo.articles_count || 0
      });
      
      // 如果不是当前用户，检查关注状态
      if (!this.data.isCurrentUser) {
        await this.checkFollowingStatus();
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      this.setData({
        error: error.message || '加载用户信息失败',
        loading: false
      });
      showToast('获取用户信息失败', 'none');
    } finally {
      this.setData({
        loading: false
      });
    }
  },

  /**
   * 检查关注状态
   */
  checkFollowingStatus: async function() {
    const app = getApp();
    
    try {
      // 检查登录状态
      if (!app.isLoggedIn()) {
        this.setData({ isFollowing: false });
        return;
      }
      
      // 使用关注服务检查关注状态
      if (app.services && app.services.following) {
        const result = await app.services.following.checkFollowingStatus({
          user_id: this.data.userId
        });
        
        this.setData({
          isFollowing: result.data?.is_following || false
        });
      }
    } catch (error) {
      console.error('检查关注状态失败:', error);
      this.setData({ isFollowing: false });
    }
  },

  /**
   * 关注/取消关注用户
   */
  toggleFollow: async function() {
    const app = getApp();
    
    // 检查登录状态
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    try {
      if (this.data.isFollowing) {
        // 取消关注
        await app.services.following.unfollowUser({
          id: this.data.userId
        });
        
        showToast('取消关注成功', 'success');
        this.setData({
          isFollowing: false,
          followersCount: Math.max(0, this.data.followersCount - 1)
        });
      } else {
        // 关注用户
        await app.services.following.followUser({
          user_id: this.data.userId
        });
        
        showToast('关注成功', 'success');
        this.setData({
          isFollowing: true,
          followersCount: this.data.followersCount + 1
        });
      }
      
      // 记录事件
      if (app.services && app.services.analytics) {
        app.services.analytics.trackEvent(
          this.data.isFollowing ? 'user_follow' : 'user_unfollow',
          { target_user_id: this.data.userId }
        );
      }
    } catch (error) {
      console.error('操作失败:', error);
      showToast(error.message || '操作失败', 'none');
    }
  },

  /**
   * 跳转到用户文章列表
   */
  navigateToUserArticles: function() {
    wx.navigateTo({
      url: `/pages/user/profile/articles?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 跳转到用户关注列表
   */
  navigateToUserFollowing: function() {
    wx.navigateTo({
      url: `/pages/user/profile/following?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 跳转到用户粉丝列表
   */
  navigateToUserFollowers: function() {
    wx.navigateTo({
      url: `/pages/user/profile/followers?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 重试加载
   */
  retryLoad: function() {
    this.loadUserInfo();
  },

  /**
   * 跳转到我的个人中心
   */
  navigateToMyProfile: function() {
    wx.navigateTo({
      url: '/pages/user/profile/profile'
    });
  }
});
