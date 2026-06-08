
/**
 * 文件名: index.js
 * 版本号: 2.0.0
 * 更新日期: 2026-05-06
 * 描述: 订单列表页面，展示用户订单列表，支持订单状态筛选和订单操作
 */

const orderService = require('../../services/orderService');

Page({
  data: {
    tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
    activeTab: 0,
    orderList: [],
    loading: false,
    empty: false
  },

  onLoad(options) {
    const activeTab = options.tab ? parseInt(options.tab) : 0;
    this.setData({ activeTab });
    this.loadOrderList();
  },

  onShow() {
    this.loadOrderList();
  },

  onPullDownRefresh() {
    this.loadOrderList();
    setTimeout(() =&gt; {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 切换标签
   */
  onTabChange(e) {
    const activeTab = e.detail.index;
    this.setData({ activeTab });
    this.loadOrderList();
  },

  /**
   * 加载订单列表
   */
  async loadOrderList() {
    try {
      this.setData({ loading: true });
      const statusMap = [0, 1, 2, 3, 4];
      const status = this.data.activeTab === 0 ? null : statusMap[this.data.activeTab];
      
      const orderList = await orderService.getOrderList(status);

      this.setData({
        orderList,
        empty: orderList.length === 0,
        loading: false
      });
    } catch (error) {
      console.error('加载订单列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 查看订单详情
   */
  onViewDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/order/detail?id=' + id
    });
  },

  /**
   * 取消订单
   */
  onCancelOrder(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: async (res) =&gt; {
        if (res.confirm) {
          try {
            await orderService.cancelOrder(id);
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });
            this.loadOrderList();
          } catch (error) {
            console.error('取消订单失败:', error);
            wx.showToast({
              title: '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 支付订单
   */
  onPayOrder(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: '支付功能开发中',
      icon: 'none'
    });
  },

  /**
   * 确认收货
   */
  onConfirmReceive(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定已收到商品吗？',
      success: async (res) =&gt; {
        if (res.confirm) {
          try {
            await orderService.confirmReceive(id);
            wx.showToast({
              title: '确认成功',
              icon: 'success'
            });
            this.loadOrderList();
          } catch (error) {
            console.error('确认收货失败:', error);
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 评价订单
   */
  onCommentOrder(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    });
  }
});

