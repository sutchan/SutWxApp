/**
 * 鏂囦欢鍚? rules.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-29
 * 描述: 閸掑棝鏀㈢憴鍕灟鐠佸墽鐤嗘い鐢告桨
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
   * 閼惧嘲褰囬崚鍡涙敘鐟欏嫬鍨?   */
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
        console.error('閼惧嘲褰囬崚鍡涙敘鐟欏嫬鍨径杈Е:', err);
        this.setData({
          loading: false,
          error: true
        });
        wx.showToast({
          title: '閼惧嘲褰囬崚鍡涙敘鐟欏嫬鍨径杈Е',
          icon: 'none'
        });
      });
  },

  /**
   * 閺囧瓨鏌婇崚鍡涙敘鐟欏嫬鍨?   */
  updateDistributeRules() {
    this.setData({ saving: true });

    distributeService.updateDistributeRules(this.data.distributeRules)
      .then(() => {
        this.setData({ saving: false });
        wx.showToast({
          title: '閺囧瓨鏌婇幋鎰'
        });
      })
      .catch(err => {
        console.error('閺囧瓨鏌婇崚鍡涙敘鐟欏嫬鍨径杈Е:', err);
        this.setData({ saving: false });
        wx.showToast({
          title: '閺囧瓨鏌婃径杈Е',
          icon: 'none'
        });
      });
  },

  /**
   * 鏉堟挸鍙嗗鍡楀敶鐎圭懓褰夐崠?   * @param {Object} e - 娴滃娆㈢€电钖?   */
  onInputChange(e) {
    const { field, value } = e.currentTarget.dataset;
    const { distributeRules } = this.data;
    
    // 閺嶈宓佺€涙顔岀猾璇茬€锋潪顒佸床閸?    let parsedValue = value;
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
   * 瀵偓閸忓啿褰夐崠?   * @param {Object} e - 娴滃娆㈢€电钖?   */
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`distributeRules.${field}`]: e.detail.value
    });
  },

  /**
   * 鏉╂柨娲栭崚妤勩€冩い?   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 娣囨繂鐡ㄧ憴鍕灟
   */
  saveRules() {
    wx.showModal({
      title: '娣囨繂鐡ㄧ憴鍕灟',
      content: '绾喖鐣剧憰浣风箽鐎涙ê缍嬮崜宥堫啎缂冾喚娈戦崚鍡涙敘鐟欏嫬鍨崥妤嬬吹',
      success: (res) => {
        if (res.confirm) {
          this.updateDistributeRules();
        }
      }
    });
  }
});
