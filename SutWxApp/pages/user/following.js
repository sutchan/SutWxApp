// 用户关注页面
import { showToast } from '../../utils/global';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    followingList: [], // 关注列表
    loading: false, // 加载状态
    refreshing: false, // 下拉刷新状态
    error: '', // 错误信息
    hasMore: true, // 是否有更多数据
    page: 1, // 当前页码
    pageSize: 10 // 每页数据量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const app = getApp();
    
    // 检查登录状态
    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 加载关注数据
    this.loadFollowingData();
    
    // 记录页面访问事件
    if (app.services && app.services.analytics) {
      app.services.analytics.trackPageView('user_following');
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const app = getApp();
    
    // 检查登录状态
    if (!app.isLoggedIn()) {
      return;
    }
    
    // 页面显示时刷新数据
    this.setData({
      page: 1,
      followingList: [],
      hasMore: true
    });
    this.loadFollowingData();
  },

  /**
   * 加载关注数据
   * @param {boolean} refresh - 是否为刷新操作
   */
  loadFollowingData: async function(refresh = false) {
    const app = getApp();
    
    // 如果正在加载，直接返回
    if (this.data.loading) return;

    // 显示加载状态
    this.setData({
      loading: true,
      error: ''
    });

    try {
      // 检查关注服务是否存在
      if (!app.services || !app.services.following) {
        throw new Error('关注服务暂不可用');
      }
      
      // 构建请求参数
      const page = refresh ? 1 : this.data.page;
      
      // 使用关注服务获取关注列表
      const result = await app.services.following.getUserFollowing({
        page: page,
        per_page: this.data.pageSize
      });
      
      const newList = result.list || [];
      const newFollowingList = refresh ? newList : [...this.data.followingList, ...newList];
      
      // 判断是否还有更多数据
      const hasMore = newList.length === this.data.pageSize;
      const nextPage = refresh ? 2 : this.data.page + 1;

      this.setData({
        followingList: newFollowingList,
        hasMore: hasMore,
        page: nextPage,
        error: ''
      });
    } catch (error) {
      console.error('获取关注列表失败:', error);
      this.setData({
        error: error.message || '加载失败，请重试'
      });
      showToast('获取关注失败', 'none');
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 处理请求成功
   * @param {Object} result - 响应数据
   * @param {boolean} refresh - 是否为刷新操作
   */
  handleRequestSuccess: function(result, refresh) {
    const newList = result.list || [];
    const newFollowingList = refresh ? newList : [...this.data.followingList, ...newList];
    
    // 判断是否还有更多数据
    const hasMore = newList.length === this.data.pageSize;
    const nextPage = refresh ? 2 : this.data.page + 1;

    this.setData({
      followingList: newFollowingList,
      hasMore: hasMore,
      page: nextPage,
      error: ''
    });
  },

  /**
   * 处理请求错误
   * @param {Object} error - 错误信息
   */
  handleRequestError: function(error) {
    console.error('获取关注列表失败:', error);
    this.setData({
      error: error.message || '网络异常，请检查网络连接后重试'
    });
    showToast('获取关注失败', 'none');
  },

  /**
   * 重试加载
   */
  retryLoad: function() {
    this.setData({
      page: 1,
      followingList: [],
      hasMore: true
    });
    this.loadFollowingData();
  },

  /**
   * 加载更多
   */
  loadMore: function() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadFollowingData(false);
  },

  /**
   * 取消关注
   * @param {Object} e - 事件对象
   */
  unfollow: function(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const userId = e.currentTarget.dataset.userId;

    wx.showModal({
      title: '确认操作',
      content: '确定要取消关注吗？',
      success: (res) => {
        if (res.confirm) {
          this.executeUnfollow(id, index, userId);
        }
      }
    });
  },

  /**
   * 执行取消关注操作
   * @param {number} id - 关注ID
   * @param {number} index - 列表索引
   * @param {number} userId - 用户ID
   */
  executeUnfollow: async function(id, index, userId) {
    const app = getApp();
    
    try {
      // 检查关注服务是否存在
      if (!app.services || !app.services.following) {
        throw new Error('关注服务暂不可用');
      }
      
      // 使用关注服务取消关注
      await app.services.following.unfollowUser({
        id: id
      });
      
      // 从列表中移除该关注项
      const newFollowingList = [...this.data.followingList];
      newFollowingList.splice(index, 1);
      
      this.setData({
        followingList: newFollowingList
      });
      
      showToast('取消关注成功', 'success');
      
      // 记录取消关注事件
      if (app.services && app.services.analytics) {
        app.services.analytics.trackEvent('user_unfollow', {
          following_id: id,
          user_id: userId
        });
      }
    } catch (error) {
      console.error('取消关注失败:', error);
      showToast(error.message || '取消关注失败', 'none');
    }
  },

  /**
   * 跳转到用户详情页
   * @param {Object} e - 事件对象
   */
  navigateToUserProfile: function(e) {
    const userId = e.currentTarget.dataset.userId;
    const app = getApp();
    
    // 记录跳转事件
    if (app.services && app.services.analytics) {
      app.services.analytics.trackEvent('user_following_profile_click', {
        user_id: userId
      });
    }
    
    wx.navigateTo({
      url: `/pages/user/user-detail?id=${userId}`
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    this.loadFollowingData(true);
  },

  /**
   * 上拉触底加载更多
   */
  onReachBottom: function() {
    this.loadMore();
  }
});