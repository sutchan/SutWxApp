/**
 * 文件名: detail.js
 * 订单详情页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: null,
    orderDetail: null,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id } = options;
    this.setData({ orderId: id });
    this.loadOrderDetail(id);
  },

  /**
   * 加载订单详情
   * @param {string} orderId - 订单ID
   */
  loadOrderDetail(orderId) {
    this.setData({ loading: true });

    // 模拟数据加载
    setTimeout(() => {
      const mockOrderDetail = {
        id: orderId,
        orderNo: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: '待付款',
        totalPrice: (Math.random() * 200 + 50).toFixed(2),
        actualPrice: (Math.random() * 180 + 40).toFixed(2),
        freight: (Math.random() * 10).toFixed(2),
        createTime: new Date().toLocaleString(),
        payTime: null,
        deliveryTime: null,
        receiveTime: null,
        address: {
          name: '张三',
          phone: '13800138000',
          detail: '广东省深圳市南山区科技园科兴科学园',
        },
        items: [
          {
            name: '商品A',
            price: (Math.random() * 50 + 5).toFixed(2),
            quantity: Math.floor(Math.random() * 2) + 1,
            image: '/assets/images/product_placeholder.png'
          },
          {
            name: '商品B',
            price: (Math.random() * 30 + 5).toFixed(2),
            quantity: Math.floor(Math.random() * 3) + 1,
            image: '/assets/images/product_placeholder.png'
          }
        ]
      };

      this.setData({
        orderDetail: mockOrderDetail,
        loading: false
      });
    }, 1000);
  },

  /**
   * 支付订单
   */
  payOrder() {
    wx.showToast({
      title: '模拟支付成功',
      icon: 'success'
    });
    // 实际支付逻辑
  },

  /**
   * 取消订单
   */
  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '订单已取消',
            icon: 'success'
          });
          // 实际取消逻辑
        }
      }
    });
  },

  /**
   * 确认收货
   */
  confirmReceipt() {
    wx.showModal({
      title: '确认收货',
      content: '确定已收到货物吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '收货成功',
            icon: 'success'
          });
          // 实际确认收货逻辑
        }
      }
    });
  }
});