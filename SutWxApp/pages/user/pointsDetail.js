/**
 * 文件名: pointsDetail.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 积分明细页面
 */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 当前积分
    currentPoints: 0,
    
    // 筛选类型
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'earn', label: '获得' },
      { key: 'spend', label: '消费' }
    ],
    
    // 时间筛选
    timeRange: 'all',
    timeOptions: [
      { key: 'all', label: '全部时间' },
      { key: 'today', label: '今天' },
      { key: 'week', label: '本周' },
      { key: 'month', label: '本月' }
    ],
    
    // 明细列表
    detailList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false,
    isEmpty: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadCurrentPoints();
    this.loadDetailList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 从其他页面返回时，刷新当前积分
    this.loadCurrentPoints();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refreshData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadMoreDetailList();
    }
  },

  /**
   * 加载当前积分
   */
  loadCurrentPoints: function() {
    pointsService.getUserPoints()
      .then(res => {
        this.setData({
          currentPoints: res.data.points || 0
        });
      })
      .catch(err => {
        console.error('获取当前积分失败', err);
      });
  },

  /**
   * 加载积分明细列表
   */
  loadDetailList: function() {
    if (this.data.isLoading) return;
    
    this.setData({
      isLoading: true
    });

    const params = {
      type: this.data.activeTab === 'all' ? undefined : this.data.activeTab,
      timeRange: this.data.timeRange === 'all' ? undefined : this.data.timeRange,
      page: this.data.page,
      pageSize: this.data.pageSize
    };

    pointsService.getPointsDetail(params)
      .then(res => {
        const newList = res.data.list || [];
        const isEmpty = this.data.page === 1 && newList.length === 0;
        const hasMore = newList.length >= this.data.pageSize;
        
        this.setData({
          detailList: this.data.page === 1 ? newList : [...this.data.detailList, ...newList],
          hasMore,
          isEmpty,
          isLoading: false
        });
        
        wx.stopPullDownRefresh();
      })
      .catch(err => {
        console.error('获取积分明细失败', err);
        this.setData({
          isLoading: false
        });
        wx.stopPullDownRefresh();
        
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      });
  },

  /**
   * 加载更多积分明细
   */
  loadMoreDetailList: function() {
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadDetailList();
    });
  },

  /**
   * 刷新数据
   */
  refreshData: function() {
    this.setData({
      page: 1,
      detailList: []
    }, () => {
      this.loadCurrentPoints();
      this.loadDetailList();
    });
  },

  /**
   * 切换类型标签
   */
  onTabChange: function(e) {
    const activeTab = e.currentTarget.dataset.tab;
    if (activeTab === this.data.activeTab) return;
    
    this.setData({
      activeTab,
      page: 1,
      detailList: []
    }, () => {
      this.loadDetailList();
    });
  },

  /**
   * 切换时间筛选
   */
  onTimeFilterChange: function(e) {
    const timeRange = e.currentTarget.dataset.time;
    if (timeRange === this.data.timeRange) return;
    
    this.setData({
      timeRange,
      page: 1,
      detailList: []
    }, () => {
      this.loadDetailList();
    });
  },

  /**
   * 查看明细详情
   */
  onViewDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/pointsDetailItem?id=${id}`
    });
  },

  /**
   * 跳转到积分任务页面
   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks'
    });
  },

  /**
   * 跳转到积分商城页面
   */
  onGoToMall: function() {
    wx.switchTab({
      url: '/pages/user/pointsMall'
    });
  }
});