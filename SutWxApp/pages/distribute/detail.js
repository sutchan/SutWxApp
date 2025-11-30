/**
 * 文件名: detail.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-29
 * 描述: 鍒嗛攢璇︽儏椤甸潰
 */

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
        title: '鍒嗛攢ID涓嶈兘涓虹┖',
        icon: 'none'
      });
    }
  },

  /**
   * 鑾峰彇鍒嗛攢璇︽儏
   */
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
        console.error('鑾峰彇鍒嗛攢璇︽儏澶辫触:', err);
        this.setData({
          loading: false,
          error: true
        });
        wx.showToast({
          title: '鑾峰彇鍒嗛攢璇︽儏澶辫触',
          icon: 'none'
        });
      });
  },

  /**
   * 杩斿洖鍒楄〃椤?   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 瀹℃牳閫氳繃鍒嗛攢
   */
  approveDistribute() {
    wx.showModal({
      title: '瀹℃牳鍒嗛攢',
      content: '纭畾瑕佸鏍搁€氳繃璇ュ垎閿€鍚楋紵',
      success: (res) => {
        if (res.confirm) {
          this.handleApprove();
        }
      }
    });
  },

  /**
   * 澶勭悊瀹℃牳閫氳繃
   */
  handleApprove() {
    wx.showLoading({
      title: '瀹℃牳涓?..'
    });

    distributeService.approveDistribute(this.data.distributeId)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '瀹℃牳閫氳繃鎴愬姛'
        });
        // 鍒锋柊璇︽儏
        this.getDistributeDetail();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('瀹℃牳閫氳繃澶辫触:', err);
        wx.showToast({
          title: '瀹℃牳閫氳繃澶辫触',
          icon: 'none'
        });
      });
  },

  /**
   * 椹冲洖鍒嗛攢
   */
  rejectDistribute() {
    wx.showModal({
      title: '椹冲洖鍒嗛攢',
      content: '纭畾瑕侀┏鍥炶鍒嗛攢鍚楋紵',
      success: (res) => {
        if (res.confirm) {
          this.showRejectReasonInput();
        }
      }
    });
  },

  /**
   * 鏄剧ず椹冲洖鍘熷洜杈撳叆妗?   */
  showRejectReasonInput() {
    wx.showModal({
      title: '璇疯緭鍏ラ┏鍥炲師鍥?,
      editable: true,
      placeholderText: '璇疯緭鍏ラ┏鍥炲師鍥?,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.handleReject(res.content.trim());
        }
      }
    });
  },

  /**
   * 澶勭悊椹冲洖
   * @param {string} reason - 椹冲洖鍘熷洜
   */
  handleReject(reason) {
    wx.showLoading({
      title: '椹冲洖涓?..'
    });

    distributeService.rejectDistribute(this.data.distributeId, reason)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '椹冲洖鎴愬姛'
        });
        // 鍒锋柊璇︽儏
        this.getDistributeDetail();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('椹冲洖澶辫触:', err);
        wx.showToast({
          title: '椹冲洖澶辫触',
          icon: 'none'
        });
      });
  },

  /**
   * 鍒犻櫎鍒嗛攢
   */
  deleteDistribute() {
    wx.showModal({
      title: '鍒犻櫎鍒嗛攢',
      content: '纭畾瑕佸垹闄よ鍒嗛攢鍚楋紵',
      success: (res) => {
        if (res.confirm) {
          this.showDeleteReasonInput();
        }
      }
    });
  },

  /**
   * 鏄剧ず鍒犻櫎鍘熷洜杈撳叆妗?   */
  showDeleteReasonInput() {
    wx.showModal({
      title: '璇疯緭鍏ュ垹闄ゅ師鍥?,
      editable: true,
      placeholderText: '璇疯緭鍏ュ垹闄ゅ師鍥?,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.handleDelete(res.content.trim());
        }
      }
    });
  },

  /**
   * 澶勭悊鍒犻櫎
   * @param {string} reason - 鍒犻櫎鍘熷洜
   */
  handleDelete(reason) {
    wx.showLoading({
      title: '鍒犻櫎涓?..'
    });

    distributeService.deleteDistribute(this.data.distributeId, reason)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '鍒犻櫎鎴愬姛'
        });
        // 杩斿洖鍒楄〃椤?        wx.navigateBack();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('鍒犻櫎澶辫触:', err);
        wx.showToast({
          title: '鍒犻櫎澶辫触',
          icon: 'none'
        });
      });
  }
});