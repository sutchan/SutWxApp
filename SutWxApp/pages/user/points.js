// 用户积分页面逻辑
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    totalPoints: 0, // 总积分
    pointsHistory: [], // 积分历史记录
    loading: true, // 是否正在加载
    error: false, // 是否加载失败
    hasMore: true, // 是否有更多数据
    page: 1, // 当前页码
    pageSize: 10, // 每页数据量
    refreshing: false // 是否正在刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 记录页面访问事件
    app.analyticsService.track('page_view', {
      page: 'points'
    });
    
    // 加载积分数据
    this.loadPointsData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 每次显示页面时可以刷新数据，特别是从其他页面返回时
    if (!this.data.loading && !this.data.refreshing) {
      this.loadPointsData(true);
    }
  },

  /**
   * 加载积分数据
   * @param {boolean} refresh 是否刷新数据（重置页码）
   */
  async loadPointsData(refresh = false) {
    try {
      if (refresh) {
        // 重置状态
        this.setData({
          page: 1,
          pointsHistory: [],
          hasMore: true
        });
      }

      if (!this.data.hasMore && !refresh) {
        return;
      }

      // 显示加载状态
      this.setData({
        loading: true,
        error: false
      });

      // 检查登录状态
      if (!app.isLoggedIn()) {
        this.setData({
          loading: false,
          error: true
        });
        showToast('请先登录', 'none');
        return;
      }

      // 使用pointsService获取积分数据
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize
      };
      const result = await app.services.points.getUserPointsHistory(params);
      
      const newData = result.history || [];
      const updatedHistory = refresh ? newData : [...this.data.pointsHistory, ...newData];
      
      this.setData({
        totalPoints: result.total_points || 0,
        pointsHistory: updatedHistory,
        hasMore: newData.length === this.data.pageSize,
        page: this.data.page + 1,
        loading: false,
        error: false,
        refreshing: false
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: true,
        refreshing: false
      });
      this.handleRequestError(err);
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 处理请求错误
   * @param {Object} err 错误对象
   */
  handleRequestError(err) {
    let errorMsg = '获取积分数据失败';
    
    if (err.message) {
      errorMsg = err.message;
    } else if (err.data && err.data.message) {
      errorMsg = err.data.message;
    }
    
    showToast(errorMsg, 'none');
    
    this.setData({
      loading: false,
      error: true,
      refreshing: false
    });
  },

  /**
   * 跳转到积分规则页面
   */
  navigateToPointsRules: function() {
    // 记录导航事件
    app.analyticsService.track('navigate_to_points_rules');
    
    wx.navigateTo({
      url: '/pages/user/points-rules'
    });
  },

  /**
   * 加载更多数据
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore && !this.data.error) {
      this.loadPointsData(false);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 记录下拉刷新事件
    app.analyticsService.track('pull_down_refresh', {
      page: 'points'
    });
    
    this.setData({
      refreshing: true
    });
    this.loadPointsData(true);
  },

  /**
   * 上拉触底
   */
  onReachBottom: function() {
    // 记录上拉加载事件
    app.analyticsService.track('pull_up_load', {
      page: 'points'
    });
    
    this.loadMore();
  },

  /**
   * 重试加载
   */
  retryLoad: function() {
    // 记录重试加载事件
    app.analyticsService.track('retry_loading', {
      page: 'points'
    });
    
    this.loadPointsData(true);
  }
});