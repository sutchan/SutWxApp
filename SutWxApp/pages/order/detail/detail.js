/**
 * 文件名: detail.js
 * 订单详情页面
 */
const i18n = require('../../../utils/i18n');

Page({
  data: {
    i18n: i18n,
    loading: false,
    orderId: null,
    order: null,
    logistics: null,
    showLogistics: false,
    orderTimer: null,
    logisticsTimer: null
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.id - 订单ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadOrderDetail(options.id);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理所有定时器，防止内存泄漏
    if (this.data.orderTimer) {
      clearTimeout(this.data.orderTimer);
    }
    if (this.data.logisticsTimer) {
      clearTimeout(this.data.logisticsTimer);
    }
  },

  /**
   * 页面显示时触发
   * @returns {void}
   */
  onShow() {
    // 可以在此处刷新部分数据
  },

  /**
   * 下拉刷新回调
   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadOrderDetail(this.data.orderId, () => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载订单详情
   * @param {string} id - 订单ID
   * @param {Function} done - 完成回调
   * @returns {void}
   */
  loadOrderDetail(id, done) {
    console.log('加载订单详情，ID:', id);
    this.setData({ loading: true });
    const orderTimer = setTimeout(() => {
      const mockOrder = {
        id: id,
        status: 'shipped',
        statusText: i18n.translate('已发货'),
        createTime: '2023-09-28 14:20:00',
        payTime: '2023-09-28 14:25:00',
        shipTime: '2023-09-29 10:15:00',
        totalAmount: '199.00',
        paymentMethod: i18n.translate('微信支付'),
        shippingAddress: {
          name: i18n.translate('张三'),
          phone: '13800138000',
          address: i18n.translate('北京市朝阳区某某街道某某小区1号楼1单元101室')
        },
        shippingInfo: {
          company: i18n.translate('顺丰快递'),
          trackingNumber: 'SF1234567890',
          shippingFee: '10.00'
        },
        items: [
          {
            id: 1,
            name: i18n.translate('优质商品A'),
            image: '/assets/images/product1.jpg',
            price: '99.00',
            quantity: 1,
            specs: {
              '颜色': i18n.translate('红色'),
              '尺寸': 'M'
            }
          },
          {
            id: 2,
            name: i18n.translate('优质商品B'),
            image: '/assets/images/product2.jpg',
            price: '100.00',
            quantity: 1,
            specs: {
              '颜色': i18n.translate('蓝色'),
              '尺寸': 'L'
            }
          }
        ]
      };

      this.setData({
        order: mockOrder,
        loading: false,
        orderTimer: null
      });
      
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ orderTimer });
  },

  /**
   * 加载物流信息
   * @param {string} id - 订单ID
   * @returns {void}
   */
  loadLogistics(id) {
    this.setData({ loading: true });
    const logisticsTimer = setTimeout(() => {
      const mockLogistics = [
        {
          time: '2023-09-29 10:15:00',
          status: i18n.translate('已发货'),
          description: i18n.translate('您的订单已发货，顺丰快递单号：SF1234567890')
        },
        {
          time: '2023-09-29 18:30:00',
          status: i18n.translate('运输中'),
          description: i18n.translate('您的快递已到达北京转运中心')
        },
        {
          time: '2023-09-30 09:20:00',
          status: i18n.translate('派送中'),
          description: i18n.translate('快递员正在派送，请保持电话畅通')
        }
      ];

      this.setData({
        logistics: mockLogistics,
        showLogistics: true,
        loading: false,
        logisticsTimer: null
      });
    }, 300);
    
    this.setData({ logisticsTimer });
  },

  /**
   * 隐藏物流信息
   * @returns {void}
   */
  hideLogistics() {
    this.setData({ showLogistics: false });
  },

  /**
   * 复制订单号
   * @returns {void}
   */
  copyOrderId() {
    wx.setClipboardData({
      data: this.data.orderId,
      success: () => {
        wx.showToast({
          title: i18n.translate('已复制到剪贴板'),
          icon: 'success'
        });
      }
    });
  },

  /**
   * 复制快递单号
   * @returns {void}
   */
  copyTrackingNumber() {
    const { trackingNumber } = this.data.order.shippingInfo;
    wx.setClipboardData({
      data: trackingNumber,
      success: () => {
        wx.showToast({
          title: i18n.translate('已复制到剪贴板'),
          icon: 'success'
        });
      }
    });
  },

  /**
   * 联系客服
   * @returns {void}
   */
  contactService() {
    wx.showToast({
      title: i18n.translate('跳转到客服页面'),
      icon: 'none'
    });
  },

  /**
   * 取消订单
   * @returns {void}
   */
  cancelOrder() {
    wx.showModal({
      title: i18n.translate('提示'),
      content: i18n.translate('确定要取消该订单吗？'),
      success: (res) => {
        if (res.confirm) {
          // 实际项目中应该调用API取消订单
          wx.showToast({
            title: i18n.translate('订单已取消'),
            icon: 'success'
          });
          this.loadOrderDetail(this.data.orderId);
        }
      }
    });
  },

  /**
   * 立即付款
   * @returns {void}
   */
  payOrder() {
    // 实际项目中应该跳转到支付页面
    wx.showToast({
      title: i18n.translate('跳转到支付页面'),
      icon: 'none'
    });
  },

  /**
   * 确认收货
   * @returns {void}
   */
  confirmReceipt() {
    wx.showModal({
      title: i18n.translate('提示'),
      content: i18n.translate('确认已收到商品吗？'),
      success: (res) => {
        if (res.confirm) {
          // 实际项目中应该调用API确认收货
          wx.showToast({
            title: i18n.translate('已确认收货'),
            icon: 'success'
          });
          this.loadOrderDetail(this.data.orderId);
        }
      }
    });
  },

  /**
   * 申请售后
   * @returns {void}
   */
  applyAfterSale() {
    // 实际项目中应该跳转到售后页面
    wx.showToast({
      title: i18n.translate('跳转到售后页面'),
      icon: 'none'
    });
  },

  /**
   * 评价订单
   * @returns {void}
   */
  reviewOrder() {
    // 实际项目中应该跳转到评价页面
    wx.navigateTo({
      url: `/pages/order/review/review?orderId=${this.data.orderId}`
    });
  },

  /**
   * 再次购买
   * @returns {void}
   */
  buyAgain() {
    const { items } = this.data.order;
    console.log('再次购买商品:', items);
    // 实际项目中应该将商品添加到购物车
    wx.showToast({
      title: i18n.translate('已添加到购物车'),
      icon: 'success'
    });
  }
});