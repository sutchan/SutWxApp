/**
 * 文件名 detail.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-29
 * 描述: 分销详情页面
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
        title: '分销ID不能为空',
        icon: 'none'
      });
    }
  },

  /**
   * 获取分销详情
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
        console.error('获取分销详情失败:', err);
        this.setData({
          loading: false,
          error: true
        });
        wx.showToast({
          title: '获取分销详情失败',
          icon: 'none'
        });
      });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 审核通过分销
   */
  approveDistribute() {
    wx.showModal({
      title: '审核通过',
      content: '确定要审核通过该分销申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.handleApprove();
        }
      }
    });
  },

  /**
   * 处理审核通过
   */
  handleApprove() {
    wx.showLoading({
      title: '审核中...'
    });

    distributeService.approveDistribute(this.data.distributeId)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '审核通过成功'
        });
        // 刷新详情
        this.getDistributeDetail();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('审核通过失败:', err);
        wx.showToast({
          title: '审核通过失败',
          icon: 'none'
        });
      });
  },

  /**
   * 拒绝分销
   */
  rejectDistribute() {
    wx.showModal({
      title: '拒绝分销',
      content: '确定要拒绝该分销申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.showRejectReasonInput();
        }
      }
    });
  },

  /**
   * 显示拒绝原因输入框
   */
  showRejectReasonInput() {
    wx.showModal({
      title: '输入拒绝原因',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.handleReject(res.content.trim());
        }
      }
    });
  },

  /**
   * 处理拒绝
   * @param {string} reason - 拒绝原因
   */
  handleReject(reason) {
    wx.showLoading({
      title: '拒绝中...'
    });

    distributeService.rejectDistribute(this.data.distributeId, reason)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '拒绝成功'
        });
        // 刷新详情
        this.getDistributeDetail();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('拒绝失败:', err);
        wx.showToast({
          title: '拒绝失败',
          icon: 'none'
        });
      });
  },

  /**
   * 删除分销
   */
  deleteDistribute() {
    wx.showModal({
      title: '删除分销',
      content: '确定要删除该分销吗？',
      success: (res) => {
        if (res.confirm) {
          this.showDeleteReasonInput();
        }
      }
    });
  },

  /**
   * 显示删除原因输入框
   */
  showDeleteReasonInput() {
    wx.showModal({
      title: '输入删除原因',
      editable: true,
      placeholderText: '请输入删除原因',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.handleDelete(res.content.trim());
        }
      }
    });
  },

  /**
   * 处理删除
   * @param {string} reason - 删除原因
   */
  handleDelete(reason) {
    wx.showLoading({
      title: '删除中...'
    });

    distributeService.deleteDistribute(this.data.distributeId, reason)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '删除成功'
        });
        // 返回上一页
        wx.navigateBack();
      })
      .catch(err => {
        wx.hideLoading();
        console.error('删除失败:', err);
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        });
      });
  }
});
