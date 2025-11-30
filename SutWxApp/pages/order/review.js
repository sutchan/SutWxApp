/**
 * 文件名: review.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 璁㈠崟璇勪环椤甸潰
 * @author Sut
 */
const i18n = require('../../utils/i18n');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    i18n: i18n, // 灏唅18n瀹炰緥缁戝畾鍒伴〉闈㈡暟鎹紝浠ヤ究鍦╓XML涓娇鐢?    reviewContent: '', // 璇勪环鍐呭
    score: 5, // 璇勫垎
    anonymous: false, // 鏄惁鍖垮悕
    goodsName: '', // 鍟嗗搧鍚嶇О
    goodsPrice: '', // 鍟嗗搧浠锋牸
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} _options - 椤甸潰鍙傛暟
   */
   
  onLoad: function (_options) {
    console.log('椤甸潰鍔犺浇鍙傛暟:', _options);
    // 璁剧疆椤甸潰鏍囬
    wx.setNavigationBarTitle({
      title: i18n.translate('review.title')
    });

    // 妯℃嫙鑾峰彇鍟嗗搧淇℃伅
    this.setData({
      goodsName: i18n.translate('review.goodsName'),
      goodsPrice: '妤?99.00' // 绀轰緥浠锋牸
    });
  },













  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   * @param {Object} _res - 鍒嗕韩浜嬩欢鍙傛暟
   * @returns {Object} 鍒嗕韩鍐呭
   */
   
  onShareAppMessage: function (_res) {
    console.log('鍒嗕韩浜嬩欢鍙傛暟:', _res);
    return {
      title: i18n.translate('review.shareTitle'),
      path: '/pages/order/review'
    };
  },

  /**
   * 璇勪环鍐呭杈撳叆
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  bindReviewInput: function (e) {
    this.setData({
      reviewContent: e.detail.value
    });
  },

  /**
   * 璇勫垎鏀瑰彉
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  bindScoreChange: function (e) {
    this.setData({
      score: e.detail.value
    });
  },

  /**
   * 鍖垮悕寮€鍏虫敼鍙?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  bindAnonymousChange: function (e) {
    this.setData({
      anonymous: e.detail.value
    });
  },

  /**
   * 鎻愪氦璇勪环
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
    // 妯℃嫙鎻愪氦璇勪环
    wx.showToast({
      title: i18n.translate('review.submitSuccess'),
      icon: 'success'
    });
    // 鍙互鍦ㄨ繖閲屾坊鍔犲疄闄呯殑API璋冪敤
  }
});
