/**
 * 文件名: review.js
 * 订单评价页面
 * @author Sut
 */
const i18n = require('../../utils/i18n');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    i18n: i18n, // 将i18n实例绑定到页面数据，以便在WXML中使用
    reviewContent: '', // 评价内容
    score: 5, // 评分
    anonymous: false, // 是否匿名
    goodsName: '', // 商品名称
    goodsPrice: '', // 商品价格
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} _options - 页面参数
   */
   
  onLoad: function (_options) {
    console.log('页面加载参数:', _options);
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: i18n.translate('review.title')
    });

    // 模拟获取商品信息
    this.setData({
      goodsName: i18n.translate('review.goodsName'),
      goodsPrice: '楼199.00' // 示例价格
    });
  },













  /**
   * 用户点击右上角分享
   * @param {Object} _res - 分享事件参数
   * @returns {Object} 分享内容
   */
   
  onShareAppMessage: function (_res) {
    console.log('分享事件参数:', _res);
    return {
      title: i18n.translate('review.shareTitle'),
      path: '/pages/order/review'
    };
  },

  /**
   * 评价内容输入
   * @param {Object} e - 事件对象
   */
  bindReviewInput: function (e) {
    this.setData({
      reviewContent: e.detail.value
    });
  },

  /**
   * 评分改变
   * @param {Object} e - 事件对象
   */
  bindScoreChange: function (e) {
    this.setData({
      score: e.detail.value
    });
  },

  /**
   * 匿名开关改变
   * @param {Object} e - 事件对象
   */
  bindAnonymousChange: function (e) {
    this.setData({
      anonymous: e.detail.value
    });
  },

  /**
   * 提交评价
   */
  submitReview: function () {
    const { reviewContent } = this.data;
    if (!reviewContent) {
      wx.showToast({
        title: i18n.translate('review.emptyContent'),
        icon: 'none'
      });
      return;
    }
    // 模拟提交评价
    wx.showToast({
      title: i18n.translate('review.submitSuccess'),
      icon: 'success'
    });
    // 可以在这里添加实际的API调用
  }
});
