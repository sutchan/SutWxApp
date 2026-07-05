
/**
 * 文件名: detail.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 订单详情页面，展示订单详细信息
 */

const orderService = require('../../services/orderService');
const { formatOrderDetailPrices } = require('../../utils/format');

Page({
  data: {
    orderId: null,
    orderDetail: null,
    loading: true
  },

  onLoad(options) {
    const orderId = options.id;
    this.setData({ orderId });
    this.loadOrderDetail();
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail() {
    try {
      this.setData({ loading: true });
      const orderDetail = await orderService.getOrderDetail(this.data.orderId);
      this.setData({
        orderDetail: orderDetail ? formatOrderDetailPrices(orderDetail) : null,
        loading: false
      });
    } catch (error) {
      console.error('加载订单详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ orderDetail: null, loading: false });
    }
  },

  /**
   * 取消订单
   */
  onCancelOrder() {
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await orderService.cancelOrder(this.data.orderId);
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });
            this.loadOrderDetail();
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
  onPayOrder() {
    wx.showToast({
      title: '支付功能开发中',
      icon: 'none'
    });
  },

  /**
   * 确认收货
   */
  onConfirmReceive() {
    wx.showModal({
      title: '提示',
      content: '确定已收到商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await orderService.confirmReceive(this.data.orderId);
            wx.showToast({
              title: '确认成功',
              icon: 'success'
            });
            this.loadOrderDetail();
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
   * 查看物流
   */
  onViewLogistics() {
    wx.showToast({
      title: '物流功能开发中',
      icon: 'none'
    });
  },

  /**
   * 联系客服
   */
  onContactService() {
    wx.showToast({
      title: '客服功能开发中',
      icon: 'none'
    });
  }
});

