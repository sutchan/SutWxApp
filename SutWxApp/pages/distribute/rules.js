/**
 * 文件名 rules.js
 * 版本号 1.0.0
 * 更新日期: 2025-12-04
 * 描述: 分销规则管理页面
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
   * 获取分销规则
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
        console.error('获取分销规则失败:', err);
        this.setData({
          loading: false,
          error: true
        });
        wx.showToast({
          title: '获取分销规则失败',
          icon: 'none'
        });
      });
  },

  /**
   * 更新分销规则
   */
  updateDistributeRules() {
    this.setData({ saving: true });

    distributeService.updateDistributeRules(this.data.distributeRules)
      .then(() => {
        this.setData({ saving: false });
        wx.showToast({
          title: '保存成功'
        });
      })
      .catch(err => {
        console.error('更新分销规则失败:', err);
        this.setData({ saving: false });
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      });
  },

  /**
   * 输入框变化事件
   * @param {Object} e - 事件对象
   */
  onInputChange(e) {
    const { field, value } = e.currentTarget.dataset;
    const { distributeRules } = this.data;
    
    // 根据字段类型进行值转换
    let parsedValue = value;
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
   * 开关变化事件
   * @param {Object} e - 事件对象
   */
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`distributeRules.${field}`]: e.detail.value
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 保存规则
   */
  saveRules() {
    wx.showModal({
      title: '保存规则',
      content: '确定要保存修改后的分销规则吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateDistributeRules();
        }
      }
    });
  }
});