/**
 * 文件名: points.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 用户积分页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentPoints: 1234,
    pointsHistory: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    timer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadPointsHistory();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 加载积分明细
   */
  loadPointsHistory() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    this.setData({ loading: true });

    const { page, pageSize } = this.data;

    // 模拟数据加载
    const timer = setTimeout(() => {
      const mockHistory = [];
      for (let i = 0; i < pageSize; i++) {
        const type = Math.random() > 0.5 ? 'add' : 'minus';
        const points = Math.floor(Math.random() * 100) + 1;
        mockHistory.push({
          id: `HISTORY_${(page - 1) * pageSize + i + 1}`,
          description: type === 'add' ? '完成任务获得积分' : '兑换商品消耗积分',
          time: new Date().toLocaleString(),
          type: type,
          points: points
        });
      }

      this.setData({
        pointsHistory: [...this.data.pointsHistory, ...mockHistory],
        page: page + 1,
        hasMore: mockHistory.length === pageSize,
        loading: false,
        timer: null
      });
    }, 1000);
    
    this.setData({ timer });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadPointsHistory();
  }
});