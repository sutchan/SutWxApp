/**
 * 文件名: rules.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-29
 * 描述: 鍒嗛攢瑙勫垯璁剧疆椤甸潰
 */

const distributeService = require('../../services/distributeService');
const store = require('../../utils/store');

Page({
  data: {
    distributeRules: null,
    loading: true,
    saving: false,
    error: false
  },

  onLoad() {
    this.getDistributeRules();
  },

  /**
   * 鑾峰彇鍒嗛攢瑙勫垯
   */
  getDistributeRules() {
    this.setData({ loading: true });

    distributeService.getDistributeRules()
      .then(res => {
        this.setData({
          distributeRules: res,
          loading: false,
          error: false
        });
      })
      .catch(err => {
        console.error('鑾峰彇鍒嗛攢瑙勫垯澶辫触:', err);
        this.setData({
          loading: false,
          error: true
        });
        wx.showToast({
          title: '鑾峰彇鍒嗛攢瑙勫垯澶辫触',
          icon: 'none'
        });
      });
  },

  /**
   * 鏇存柊鍒嗛攢瑙勫垯
   */
  updateDistributeRules() {
    this.setData({ saving: true });

    distributeService.updateDistributeRules(this.data.distributeRules)
      .then(() => {
        this.setData({ saving: false });
        wx.showToast({
          title: '鏇存柊鎴愬姛'
        });
      })
      .catch(err => {
        console.error('鏇存柊鍒嗛攢瑙勫垯澶辫触:', err);
        this.setData({ saving: false });
        wx.showToast({
          title: '鏇存柊澶辫触',
          icon: 'none'
        });
      });
  },

  /**
   * 杈撳叆妗嗗唴瀹瑰彉鍖?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  onInputChange(e) {
    const { field, value } = e.currentTarget.dataset;
    const { distributeRules } = this.data;
    
    // 鏍规嵁瀛楁绫诲瀷杞崲鍊?    let parsedValue = value;
    if (field === 'commissionRate' || field === 'minOrderAmount' || field === 'maxCommissionAmount') {
      parsedValue = parseFloat(value) || 0;
    } else if (field === 'enableDistribute') {
      parsedValue = value === 'true' || value === true;
    }
    
    this.setData({
      [`distributeRules.${field}`]: parsedValue
    });
  },

  /**
   * 寮€鍏冲彉鍖?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`distributeRules.${field}`]: e.detail.value
    });
  },

  /**
   * 杩斿洖鍒楄〃椤?   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 淇濆瓨瑙勫垯
   */
  saveRules() {
    wx.showModal({
      title: '淇濆瓨瑙勫垯',
      content: '纭畾瑕佷繚瀛樺綋鍓嶈缃殑鍒嗛攢瑙勫垯鍚楋紵',
      success: (res) => {
        if (res.confirm) {
          this.updateDistributeRules();
        }
      }
    });
  }
});