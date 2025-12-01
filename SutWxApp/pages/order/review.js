/**
 * 文件名 review.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-30
 * 璁㈠崟鐠囧嫪鐜い鐢告桨
 * @author Sut
 */
const i18n = require('../../utils/i18n');
const socialService = require('../../services/socialService');

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    i18n: i18n, // 鐏忓攨18n鐎圭偘绶ョ紒鎴濈暰閸掍即銆夐棃銏℃殶閹诡噯绱濇禒銉ょ┒閸︹晸XML娑擃厺濞囬悽?    reviewContent: '', // 鐠囧嫪鐜崘鍛啇
    score: 5, // 鐠囧嫬鍨?    anonymous: false, // 閺勵垰鎯侀崠鍨倳
    goodsName: '', // 閸熷棗鎼ч崥宥囆?    goodsPrice: '', // 閸熷棗鎼ф禒閿嬬壐
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} _options - 妞ょ敻娼伴崣鍌涙殶
   */
   
  onLoad: function (_options) {
    console.log('妞ょ敻娼伴崝鐘烘祰閸欏倹鏆?', _options);
    // 鐠佸墽鐤嗘い鐢告桨閺嶅洭顣?    wx.setNavigationBarTitle({
      title: i18n.translate('review.title')
    });

    // 濡剝瀚欓懢宄板絿浜у搧淇℃伅
    this.setData({
      goodsName: i18n.translate('review.goodsName'),
      goodsPrice: '濡?99.00' // 缁€杞扮伐娴犻攱鐗?    });
  },













  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   * @param {Object} _res - 閸掑棔闊╂禍瀣╂閸欏倹鏆?   * @returns {Object} 閸掑棔闊╅崘鍛啇
   */
   
  onShareAppMessage: function (_res) {
    console.log('閸掑棔闊╂禍瀣╂閸欏倹鏆?', _res);
    return {
      title: i18n.translate('review.shareTitle'),
      path: '/pages/order/review'
    };
  },

  /**
   * 鐠囧嫪鐜崘鍛啇鏉堟挸鍙?   * @param {Object} e - 娴滃娆㈢€电钖?   */
  bindReviewInput: function (e) {
    this.setData({
      reviewContent: e.detail.value
    });
  },

  /**
   * 鐠囧嫬鍨庨弨鐟板綁
   * @param {Object} e - 娴滃娆㈢€电钖?   */
  bindScoreChange: function (e) {
    this.setData({
      score: e.detail.value
    });
  },

  /**
   * 閸栧灝鎮曞鈧崗铏暭閸?   * @param {Object} e - 娴滃娆㈢€电钖?   */
  bindAnonymousChange: function (e) {
    this.setData({
      anonymous: e.detail.value
    });
  },

  /**
   * 閹绘劒姘︾拠鍕幆
   */
  submitReview: function () {
    const { reviewContent, score, anonymous, goodsName, goodsPrice } = this.data;
    if (!reviewContent) {
      wx.showToast({
        title: i18n.translate('review.emptyContent'),
        icon: 'none'
      });
      return;
    }
    
    // 鐠佸墽鐤嗗鍦惃鍕壐鐠囧嫪鐜?    this.setData({ loading: true });
    
    // 鐠佸墽鐤嗘い鐢告桨閺嶅洭顣?    wx.showLoading({
      title: i18n.translate('review.submitting')
    });
    
    // 鐠佸墽鐤嗘い鐢告桨閺嶅洭顣?    socialService.addProductComment({
      productId: '1', // 缁€杞扮粙缁嶇粻鐠嬪啰鏁?      content: reviewContent,
      rating: score,
      anonymous: anonymous,
      images: [] // 缁€杞扮粙缁嶇粻鐠嬪啰鏁?    })
    .then(() => {
      this.setData({ loading: false });
      wx.hideLoading();
      
      wx.showToast({
        title: i18n.translate('review.submitSuccess'),
        icon: 'success'
      });
      
      // 鐠佸墽鐤嗗鍦惃鍕壐鐠囧嫪鐜崟鐙傚煂鐠愵厾澧?      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    })
    .catch((error) => {
      this.setData({ loading: false });
      wx.hideLoading();
      
      wx.showToast({
        title: error.message || i18n.translate('review.submitFailed'),
        icon: 'none'
      });
      
      console.error('鐠囧嫪鐜鍦惃鍕壐鐠愵厾澧撶粻鐠嬪啰鏁?:', error);
    });
  }
});
