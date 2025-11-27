/**
 * 文件名: records.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 积分记录页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'all', // 当前激活的标签：all(全部)、earn(获取)、use(使用)
    tabs: [
      { key: 'all', value: '全部' },
      { key: 'earn', value: '获取' },
      { key: 'use', value: '使用' }
    ],
    pointsRecords: [], // 积分记录列表
    loading: false, // 加载状态
    page: 1, // 当前页码
    pageSize: 20, // 每页数量
    hasMore: true, // 是否还有更多数据
    totalPoints: 0 // 用户总积分
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadUserPoints();
    this.loadPointsRecords();
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
      page: 1,
      pointsRecords: [],
      hasMore: true
    }, () => {
      this.loadPointsRecords();
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPointsRecords();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我的积分记录',
      path: '/pages/user/points/records/records'
    };
  },

  /**
   * 切换标签
   */
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    this.setData({
      activeTab: tab,
      page: 1,
      pointsRecords: [],
      hasMore: true
    }, () => {
      this.loadPointsRecords();
    });
  },

  /**
   * 加载用户总积分
   */
  loadUserPoints: function() {
    // 这里应该调用服务获取用户积分
    // 模拟数据
    setTimeout(() => {
      this.setData({
        totalPoints: 1280
      });
    }, 500);
  },

  /**
   * 加载积分记录
   */
  loadPointsRecords: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 这里应该调用服务获取积分记录
    // 模拟数据
    setTimeout(() => {
      const mockRecords = this.generateMockRecords(this.data.page, this.data.pageSize);
      
      this.setData({
        pointsRecords: [...this.data.pointsRecords, ...mockRecords],
        loading: false,
        page: this.data.page + 1,
        hasMore: mockRecords.length >= this.data.pageSize
      });
    }, 1000);
  },

  /**
   * 生成模拟积分记录数据
   */
  generateMockRecords: function(page, pageSize) {
    const allRecords = [
      { id: 1, type: 'earn', amount: 10, title: '每日签到', desc: '连续签到3天', time: '2023-06-15 08:30:00' },
      { id: 2, type: 'earn', amount: 50, title: '完成任务', desc: '完善个人资料', time: '2023-06-14 15:20:00' },
      { id: 3, type: 'use', amount: -100, title: '积分兑换', desc: '兑换10元优惠券', time: '2023-06-13 10:15:00' },
      { id: 4, type: 'earn', amount: 20, title: '评价商品', desc: '评价已购买商品', time: '2023-06-12 14:45:00' },
      { id: 5, type: 'use', amount: -200, title: '积分兑换', desc: '兑换20元优惠券', time: '2023-06-10 09:30:00' },
      { id: 6, type: 'earn', amount: 30, title: '分享商品', desc: '分享商品给好友', time: '2023-06-08 16:20:00' },
      { id: 7, type: 'earn', amount: 100, title: '新用户奖励', desc: '注册送积分', time: '2023-06-01 12:00:00' },
      { id: 8, type: 'use', amount: -50, title: '积分兑换', desc: '兑换5元优惠券', time: '2023-05-28 11:10:00' }
    ];
    
    // 根据当前标签过滤数据
    let filteredRecords = allRecords;
    if (this.data.activeTab === 'earn') {
      filteredRecords = allRecords.filter(record => record.type === 'earn');
    } else if (this.data.activeTab === 'use') {
      filteredRecords = allRecords.filter(record => record.type === 'use');
    }
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredRecords.slice(start, end);
  }
});