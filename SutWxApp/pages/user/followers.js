// pages/user/followers.js
// 粉丝列表页面
import { showToast } from '../../utils/global';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    followersList: [], // 粉丝列表
    loading: false, // 加载状态
    error: null, // 错误信息
    currentPage: 1, // 当前页码
    pageSize: 10, // 每页数量
    hasMore: true // 是否有更多数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadFollowersList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时刷新数据
    if (this.data.followersList.length > 0) {
      this.refreshList();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.refreshList();
  },

  /**
   * 加载粉丝列表
   */
  loadFollowersList: function(refresh = false) {
    const app = getApp();
    
    // 检查是否已登录
    if (!app.isLoggedIn()) {
      wx.stopPullDownRefresh();
      this.setData({
        loading: false,
        error: '请先登录',
        hasMore: false
      });
      showToast('请先登录', 'none');
      return;
    }

    // 设置页码
    if (refresh) {
      this.setData({ currentPage: 1, hasMore: true, error: null });
    } else if (!this.data.hasMore) {
      wx.stopPullDownRefresh();
      return;
    }

    // 显示加载状态
    this.setData({ loading: true });

    // 调用关注服务获取粉丝列表
    app.services.following.getMyFollowers({
      page: this.data.currentPage,
      per_page: this.data.pageSize
    })
    .then(res => {
      wx.stopPullDownRefresh();
      
      if (res.code === 200) {
        const newFollowers = res.data.list || [];
        const followersList = refresh ? newFollowers : [...this.data.followersList, ...newFollowers];
        
        this.setData({
          followersList: followersList,
          hasMore: newFollowers.length === this.data.pageSize,
          loading: false,
          error: null
        });
        
        // 增加页码
        if (!refresh && newFollowers.length > 0) {
          this.setData({ currentPage: this.data.currentPage + 1 });
        }
      } else {
        this.setData({
          loading: false,
          error: res.message || '获取粉丝列表失败'
        });
      }
    })
    .catch(error => {
      wx.stopPullDownRefresh();
      console.error('获取粉丝列表失败:', error);
      this.setData({
        loading: false,
        error: '网络错误，请重试'
      });
    });
  },

  /**
   * 刷新列表
   */
  refreshList: function() {
    this.loadFollowersList(true);
  },

  /**
   * 重试加载
   */
  retryLoad: function() {
    this.refreshList();
  },

  /**
   * 加载更多
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadFollowersList(false);
    }
  },

  /**
   * 跳转到用户详情页
   */
  navigateToUserProfile: function(e) {
    const userId = e.currentTarget.dataset.user_id;
    if (userId) {
      wx.navigateTo({
        url: `/pages/user/user-detail?id=${userId}`
      });
    }
  },

  /**
   * 关注用户
   */
  followUser: function(e) {
    const { id, index } = e.currentTarget.dataset;
    const app = getApp();
    
    // 显示加载状态
    wx.showLoading({ title: '操作中' });
    
    // 调用关注服务进行关注操作
    app.services.following.followUser(id)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 200) {
          // 更新粉丝列表中的关注状态
          const followersList = [...this.data.followersList];
          if (followersList[index]) {
            followersList[index].is_following = true;
          }
          this.setData({ followersList });
          
          showToast('关注成功');
        } else {
          showToast(res.message || '关注失败', 'none');
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.error('关注用户失败:', error);
        showToast('网络错误，请重试', 'none');
      });
  }
});