/**
 * 鏂囦欢鍚? detail.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 鎻忚堪: 閸掑棝鏀㈢拠锔藉剰妞ょ敻娼? */

const distributeService = require('../../services/distributeService');
const store = require('../../utils/store');

Page({
  data: {
    distributeId: '',
    distributeDetail: null,
    loading: true,
    error: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        distributeId: options.id
      });
      this.getDistributeDetail();
    } else {
      this.setData({
        loading: false,
        error: true
      });
      wx.showToast({
        title: '閸掑棝鏀D娑撳秷鍏樻稉铏光敄',
        icon: 'none'
      });
    }
  },

  /**
   * 閼惧嘲褰囬崚鍡涙敘鐠囷附鍎?   */
  getDistributeDetail() {
    this.setData({ loading: true });

    distributeService.getDistributeDetail(this.data.distributeId)
      .then(res => {
        this.setData({
          distributeDetail: res,
          loading: false,
          error: false
        });
      })
      .catch(err => {
        console.error('閼惧嘲褰囬崚鍡涙敘鐠囷附鍎忔径杈Е:', err);
        this.setData({
          loading: false,
          error: true
        });
        wx.showToast({
          title: '閼惧嘲褰囬崚鍡涙敘鐠囷附鍎忔径杈Е',
          icon: 'none'
        });
      });
  },

  /**
   * 鏉╂柨娲栭崚妤勩€冩い?   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 鐎光剝鐗抽柅姘崇箖閸掑棝鏀?   */
  approveDistribute() {
    wx.showModal({
      title: '鐎光剝鐗抽崚鍡涙敘',
      content: '绾喖鐣剧憰浣割吀閺嶆悂鈧俺绻冪拠銉ュ瀻闁库偓閸氭绱?,
      success: (res) => {
        if (res.confirm) {
          this.handleApprove();
        }
      }
    });
  },

  /**
   * 婢跺嫮鎮婄€光剝鐗抽柅姘崇箖
   */
  handleApprove() {
    wx.showLoading({
      title: '鐎光剝鐗虫稉?..'
    });

    distributeService.approveDistribute(this.data.distributeId)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '鐎光剝鐗抽柅姘崇箖閹存劕濮?
        });
        // 閸掗攱鏌婄拠锔藉剰
        this.getDistributeDetail();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('鐎光剝鐗抽柅姘崇箖婢惰精瑙?', err);
        wx.showToast({
          title: '鐎光剝鐗抽柅姘崇箖婢惰精瑙?,
          icon: 'none'
        });
      });
  },

  /**
   * 妞瑰啿娲栭崚鍡涙敘
   */
  rejectDistribute() {
    wx.showModal({
      title: '妞瑰啿娲栭崚鍡涙敘',
      content: '绾喖鐣剧憰渚€鈹忛崶鐐额嚉閸掑棝鏀㈤崥妤嬬吹',
      success: (res) => {
        if (res.confirm) {
          this.showRejectReasonInput();
        }
      }
    });
  },

  /**
   * 閺勫墽銇氭す鍐叉礀閸樼喎娲滄潏鎾冲弳濡?   */
  showRejectReasonInput() {
    wx.showModal({
      title: '鐠囩柉绶崗銉┾攺閸ョ偛甯崶?,
      editable: true,
      placeholderText: '鐠囩柉绶崗銉┾攺閸ョ偛甯崶?,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.handleReject(res.content.trim());
        }
      }
    });
  },

  /**
   * 婢跺嫮鎮婃す鍐叉礀
   * @param {string} reason - 妞瑰啿娲栭崢鐔锋礈
   */
  handleReject(reason) {
    wx.showLoading({
      title: '妞瑰啿娲栨稉?..'
    });

    distributeService.rejectDistribute(this.data.distributeId, reason)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '妞瑰啿娲栭幋鎰'
        });
        // 閸掗攱鏌婄拠锔藉剰
        this.getDistributeDetail();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('妞瑰啿娲栨径杈Е:', err);
        wx.showToast({
          title: '妞瑰啿娲栨径杈Е',
          icon: 'none'
        });
      });
  },

  /**
   * 閸掔娀娅庨崚鍡涙敘
   */
  deleteDistribute() {
    wx.showModal({
      title: '閸掔娀娅庨崚鍡涙敘',
      content: '绾喖鐣剧憰浣稿灩闂勩倛顕氶崚鍡涙敘閸氭绱?,
      success: (res) => {
        if (res.confirm) {
          this.showDeleteReasonInput();
        }
      }
    });
  },

  /**
   * 閺勫墽銇氶崚鐘绘珟閸樼喎娲滄潏鎾冲弳濡?   */
  showDeleteReasonInput() {
    wx.showModal({
      title: '鐠囩柉绶崗銉ュ灩闂勩倕甯崶?,
      editable: true,
      placeholderText: '鐠囩柉绶崗銉ュ灩闂勩倕甯崶?,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.handleDelete(res.content.trim());
        }
      }
    });
  },

  /**
   * 婢跺嫮鎮婇崚鐘绘珟
   * @param {string} reason - 閸掔娀娅庨崢鐔锋礈
   */
  handleDelete(reason) {
    wx.showLoading({
      title: '閸掔娀娅庢稉?..'
    });

    distributeService.deleteDistribute(this.data.distributeId, reason)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '閸掔娀娅庨幋鎰'
        });
        // 鏉╂柨娲栭崚妤勩€冩い?        wx.navigateBack();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('閸掔娀娅庢径杈Е:', err);
        wx.showToast({
          title: '閸掔娀娅庢径杈Е',
          icon: 'none'
        });
      });
  }
});
