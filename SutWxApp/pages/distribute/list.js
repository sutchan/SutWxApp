/**
 * 文件名 list.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-29
 * 描述: 分销列表页面
 */

const distributeService = require('../../services/distributeService');
const store = require('../../utils/store');

Page({
  data: {
    distributeList: [],
    status: 'all', // all/pending/approved/rejected/deleted
    type: 'all', // all/product/article
    page: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    hasMore: true
  },

  onLoad(options) {
    // 初始化页面数据
    this.setData({
      status: options.status || 'all',
      type: options.type || 'all'
    });
    this.getDistributeList();
  },

  onShow() {
    // 刷新数据
    this.setData({
      page: 1,
      distributeList: [],
      hasMore: true
    });
    this.getDistributeList();
  },

  onReachBottom() {
    // 触底加载更多
    if (!this.data.loading && this.data.hasMore) {
      this.setData({
        page: this.data.page + 1
      });
      this.getDistributeList();
    }
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.setData({
      page: 1,
      distributeList: [],
      hasMore: true
    });
    this.getDistributeList(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 获取分销列表
   * @param {Function} callback - 回调函数
   */
  getDistributeList(callback) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    distributeService.getDistributeList({
      status: this.data.status,
      type: this.data.type,
      page: this.data.page,
      pageSize: this.data.pageSize
    })
      .then(res => {
        const newList = this.data.page === 1 ? res.list : [...this.data.distributeList, ...res.list];
        this.setData({
          distributeList: newList,
          total: res.total,
          hasMore: newList.length < res.total,
          loading: false
        });
        if (callback) callback();
      })
      .catch(err => {
        console.error('获取分销列表失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取分销列表失败',
          icon: 'none'
        });
        if (callback) callback();
      });
  },

  /**
   * 状态变化事件
   * @param {Object} e - 事件对象
   */
  onStatusChange(e) {
    this.setData({
      status: e.detail.value,
      page: 1,
      distributeList: [],
      hasMore: true
    });
    this.getDistributeList();
  },

  /**
   * 类型变化事件
   * @param {Object} e - 事件对象
   */
  onTypeChange(e) {
    this.setData({
      type: e.detail.value,
      page: 1,
      distributeList: [],
      hasMore: true
    });
    this.getDistributeList();
  },

  /**
   * 跳转到详情页
   * @param {Object} e - 事件对象
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/distribute/detail?id=${id}`
    });
  },

  /**
   * 审核通过分销
   * @param {Object} e - 事件对象
   */
  approveDistribute(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '审核通过',
      content: '确定要审核通过该分销申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.handleApprove(id);
        }
      }
    });
  },

  /**
   * 处理审核通过
   * @param {string} id - 分销ID
   */
  handleApprove(id) {
    wx.showLoading({
      title: '审核中...'
    });

    distributeService.approveDistribute(id)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '审核通过成功'
        });
        // 刷新列表
        this.setData({
          page: 1,
          distributeList: [],
          hasMore: true
        });
        this.getDistributeList();
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
   * @param {Object} e - 事件对象
   */
  rejectDistribute(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '拒绝分销',
      content: '确定要拒绝该分销申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.showRejectReasonInput(id);
        }
      }
    });
  },

  /**
   * 显示拒绝原因输入框
   * @param {string} id - 分销ID
   */
  showRejectReasonInput(id) {
    wx.showModal({
      title: '输入拒绝原因',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.handleReject(id, res.content.trim());
        }
      }
    });
  },

  /**
   * 处理拒绝
   * @param {string} id - 分销ID
   * @param {string} reason - 拒绝原因
   */
  handleReject(id, reason) {
    wx.showLoading({
      title: '拒绝中...'
    });

    distributeService.rejectDistribute(id, reason)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '拒绝成功'
        });
        // 刷新列表
        this.setData({
          page: 1,
          distributeList: [],
          hasMore: true
        });
        this.getDistributeList();
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
   * @param {Object} e - 事件对象
   */
  deleteDistribute(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除分销',
      content: '确定要删除该分销吗？',
      success: (res) => {
        if (res.confirm) {
          this.showDeleteReasonInput(id);
        }
      }
    });
  },

  /**
   * 显示删除原因输入框
   * @param {string} id - 分销ID
   */
  showDeleteReasonInput(id) {
    wx.showModal({
      title: '输入删除原因',
      editable: true,
      placeholderText: '请输入删除原因',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.handleDelete(id, res.content.trim());
        }
      }
    });
  },

  /**
   * 处理删除
   * @param {string} id - 分销ID
   * @param {string} reason - 删除原因
   */
  handleDelete(id, reason) {
    wx.showLoading({
      title: '删除中...'
    });

    distributeService.deleteDistribute(id, reason)
      .then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '删除成功'
        });
        // 刷新列表
        this.setData({
          page: 1,
          distributeList: [],
          hasMore: true
        });
        this.getDistributeList();
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