/**
 * 积分排行榜页面
 * 显示用户积分排行榜信息，包括总榜、日榜、周榜、月榜等
 */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 当前用户积分信息
    userInfo: {
      avatar: '/images/default-avatar.png',
      nickname: '用户昵称',
      points: 0,
      rank: 0
    },
    
    // 榜单类型
    activeTab: 'total',
    tabs: [
      { key: 'total', label: '总榜' },
      { key: 'daily', label: '日榜' },
      { key: 'weekly', label: '周榜' },
      { key: 'monthly', label: '月榜' }
    ],
    
    // 排行榜列表
    rankingList: [],
    
    // 分页参数
    page: 1,
    pageSize: 20,
    hasMore: true,
    
    // 加载状态
    isLoading: false,
    isEmpty: false,
    
    // 刷新状态
    isRefreshing: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadUserInfo();
    this.loadRankingList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      isRefreshing: true,
      page: 1,
      hasMore: true,
      rankingList: []
    });
    
    Promise.all([
      this.loadUserInfo(),
      this.loadRankingList()
    ]).finally(() => {
      this.setData({
        isRefreshing: false
      });
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadRankingList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '积分排行榜',
      path: '/pages/user/pointsRanking/pointsRanking'
    };
  },

  /**
   * 加载当前用户信息
   */
  loadUserInfo: function() {
    pointsService.getUserPoints()
      .then(res => {
        if (res.success) {
          this.setData({
            'userInfo.points': res.data.points,
            'userInfo.rank': res.data.rank,
            'userInfo.avatar': res.data.avatar || '/images/default-avatar.png',
            'userInfo.nickname': res.data.nickname || '用户昵称'
          });
        }
      })
      .catch(err => {
        console.error('获取用户积分信息失败', err);
      });
  },

  /**
   * 加载排行榜列表
   */
  loadRankingList: function() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({
      isLoading: true
    });
    
    const { activeTab, page, pageSize } = this.data;
    
    pointsService.getRankingList({
      type: activeTab,
      page,
      pageSize
    })
      .then(res => {
        if (res.success) {
          const newList = res.data.list || [];
          const hasMore = newList.length >= pageSize;
          
          this.setData({
            rankingList: page === 1 ? newList : [...this.data.rankingList, ...newList],
            page: page + 1,
            hasMore,
            isEmpty: page === 1 && newList.length === 0
          });
        } else {
          wx.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('加载排行榜失败', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({
          isLoading: false
        });
      });
  },

  /**
   * 切换榜单类型
   */
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true,
      rankingList: [],
      isEmpty: false
    });
    
    this.loadRankingList();
  },

  /**
   * 查看用户详情
   */
  onViewUser: function(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/userDetail/userDetail?id=${userId}`
    });
  },

  /**
   * 跳转到积分任务页面
   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks/pointsTasks'
    });
  },

  /**
   * 跳转到积分明细页面
   */
  onGoToDetail: function() {
    wx.navigateTo({
      url: '/pages/user/pointsDetail/pointsDetail'
    });
  }
});