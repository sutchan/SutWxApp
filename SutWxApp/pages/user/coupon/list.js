/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 用户优惠券列表页面
 */
Page({
  data: {
    couponList: [],
    loading: true,
    activeTab: 0, // 0: 可用, 1: 已使用, 2: 已过期
    tabs: ['可用', '已使用', '已过期'],
    timer: null
  },

  /**
   * 生命周期函数--监听页面加载
   * @returns {void}
   */
  onLoad() {
    this.loadCouponList(this.data.activeTab);
  },

  /**
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理定时器，防止内存泄漏
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 切换优惠券类型
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  onTabChange(e) {
    const index = e.detail.index;
    this.setData({ activeTab: index });
    this.loadCouponList(index);
  },

  /**
   * 加载优惠券列表
   * @param {number} type - 优惠券类型 (0: 可用, 1: 已使用, 2: 已过期)
   * @returns {void}
   */
  loadCouponList(type) {
    this.setData({ loading: true });
    // 模拟数据请求
    const timer = setTimeout(() => {
      let mockList = [];
      if (type === 0) {
        mockList = [
          { id: 1, name: '满100减10元', value: 10, condition: '满100元可用', endDate: '2023-12-31' },
          { id: 2, name: '新人专享券', value: 5, condition: '无门槛', endDate: '2023-11-30' }
        ];
      } else if (type === 1) {
        mockList = [
          { id: 3, name: '已使用优惠券', value: 20, condition: '满200元可用', endDate: '2023-10-31' }
        ];
      } else if (type === 2) {
        mockList = [
          { id: 4, name: '已过期优惠券', value: 15, condition: '满150元可用', endDate: '2023-09-30' }
        ];
      }
      this.setData({
        couponList: mockList,
        loading: false,
        timer: null
      });
    }, 500);
    
    this.setData({ timer });
  }
});