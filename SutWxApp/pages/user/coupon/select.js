/**
 * 文件名: select.js
 * 用户优惠券选择页面
 */
Page({
  data: {
    couponList: [],
    loading: true,
    selectedCouponId: null,
    availableCoupons: [],
    unavailableCoupons: [],
    timer: null
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.selectedId - 已选中的优惠券ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.selectedId) {
      this.setData({ selectedCouponId: options.selectedId });
    }
    this.loadCoupons();
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
   * 加载优惠券列表
   * @returns {void}
   */
  loadCoupons() {
    this.setData({ loading: true });
    // 模拟数据请求
    const timer = setTimeout(() => {
      const mockCoupons = [
        { id: '1', name: '满100减10元', value: 10, condition: '满100元可用', endDate: '2023-12-31', available: true },
        { id: '2', name: '新人专享券', value: 5, condition: '无门槛', endDate: '2023-11-30', available: true },
        { id: '3', name: '已过期优惠券', value: 15, condition: '满150元可用', endDate: '2023-09-30', available: false },
        { id: '4', name: '不满足条件优惠券', value: 20, condition: '满200元可用', endDate: '2023-12-31', available: false }
      ];

      const available = mockCoupons.filter(coupon => coupon.available);
      const unavailable = mockCoupons.filter(coupon => !coupon.available);

      this.setData({
        couponList: mockCoupons,
        availableCoupons: available,
        unavailableCoupons: unavailable,
        loading: false,
        timer: null
      });
    }, 500);
    
    this.setData({ timer });
  },

  /**
   * 选择优惠券
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  selectCoupon(e) {
    const { id } = e.currentTarget.dataset;
    const selectedCoupon = this.data.availableCoupons.find(coupon => coupon.id === id);
    if (selectedCoupon) {
      // 返回上一页并传递选中的优惠券信息
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage) {
        prevPage.setData({
          selectedCoupon: selectedCoupon
        });
      }
      wx.navigateBack();
    }
  },

  /**
   * 不使用优惠券
   * @returns {void}
   */
  noCoupon() {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedCoupon: null
      });
    }
    wx.navigateBack();
  }
});