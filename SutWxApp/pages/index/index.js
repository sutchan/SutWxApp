/**
 * 文件名: index.js
 * 首页
 */
const i18n = require('../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    items: []
  },

  /**
   * 生命周期函数--监听页面加载
   * @returns {void}
   */
  onLoad() {
    this.loadData();
  },

  /**
   * 页面显示时触发
   * @returns {void}
   */
  onShow() {
    // 可以在此处刷新部分数据
  },

  /**
   * 下拉刷新回调
   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 触底加载更多
   * @returns {void}
   */
  onReachBottom() {
    // 预留：分页加载
  },

  /**
   * 加载首页数据
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  loadData(done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mock = [{ id: 1, title: i18n.translate('欢迎使用 SutWxApp') }];
      this.setData({ items: mock, loading: false });
      clearTimeout(timer);
      if (typeof done === 'function') done();
    }, 300);
  }
});
