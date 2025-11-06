// 支付页面逻辑
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    orderId: '', // 订单ID
    orderInfo: null, // 订单信息
    paymentMethods: [ // 支付方式列表
      { id: 'wechat', name: '微信支付', icon: '/images/payment/wechat.png', selected: true },
      { id: 'alipay', name: '支付宝', icon: '/images/payment/alipay.png', selected: false }
    ],
    loading: true, // 加载状态
    paying: false // 支付中状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 记录页面访问事件
    app.analyticsService.track('page_view', {
      page: 'order_pay'
    });
    
    // 获取订单ID
    const orderId = options.orderId;
    if (!orderId) {
      showToast('订单信息错误', 'none');
      // 延迟返回订单列表页
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/order/list/list'
        });
      }, 1500);
      return;
    }
    
    this.setData({
      orderId: orderId
    });
    
    // 加载订单详情
    this.loadOrderInfo();
  },

  /**
   * 加载订单详情
   */
  async loadOrderInfo() {
    try {
      // 使用orderService获取订单详情
      const res = await app.services.order.getOrderDetail(this.data.orderId);
      this.setData({
        orderInfo: res,
        loading: false
      });
    } catch (err) {
      this.setData({
        loading: false
      });
      showToast(err.message || '加载订单信息失败', 'none');
    }
  },

  /**
   * 选择支付方式
   */
  onSelectPaymentMethod(e) {
    const methodId = e.currentTarget.dataset.id;
    const paymentMethods = this.data.paymentMethods.map(method => ({
      ...method,
      selected: method.id === methodId
    }));
    
    // 记录支付方式选择事件
    app.analyticsService.track('payment_method_selected', {
      payment_method: methodId
    });
    
    this.setData({
      paymentMethods: paymentMethods
    });
  },

  /**
   * 发起支付
   */
  async onPay() {
    if (this.data.paying) {
      return;
    }
    
    this.setData({
      paying: true
    });
    
    try {
      // 获取选中的支付方式
      const selectedMethod = this.data.paymentMethods.find(method => method.selected);
      
      // 记录支付尝试事件
      app.analyticsService.track('payment_attempt', {
        order_id: this.data.orderId,
        payment_method: selectedMethod.id,
        amount: this.data.orderInfo?.amount
      });
      
      // 使用paymentService发起支付
      try {
        // 调用一站式支付流程
        const paymentResult = await app.services.payment.payOrder(
          this.data.orderId, 
          selectedMethod.id
        );
        
        this.setData({
          paying: false
        });
        
        // 记录支付成功事件
        app.analyticsService.track('payment_success', {
          order_id: this.data.orderId,
          payment_method: selectedMethod.id,
          amount: this.data.orderInfo?.amount
        });
        
        wx.showModal({
          title: '支付成功',
          content: '您的订单已支付成功，是否查看订单详情？',
          success: (resModal) => {
            if (resModal.confirm) {
              wx.navigateTo({
                url: `/pages/order/detail/detail?id=${this.data.orderId}`
              });
            } else {
              wx.navigateTo({
                url: '/pages/order/list/list'
              });
            }
          }
        });
      } catch (error) {
        this.setData({
          paying: false
        });
        
        // 处理用户取消支付的情况
        if (error.message && error.message.includes('取消支付')) {
          showToast('您已取消支付', 'none');
          return;
        }
        
        throw error; // 重新抛出其他错误，由外层catch处理
      }
    } catch (err) {
      this.setData({
        paying: false
      });
      
      // 记录支付失败事件
      app.analyticsService.track('payment_failed', {
        order_id: this.data.orderId,
        error: err.message
      });
      
      showToast(err.message || '支付失败，请重试', 'none');
    }
  },

  /**
   * 查看订单详情
   */
  onViewOrderDetail: function() {
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 返回订单列表
   */
  onBackToOrderList: function() {
    wx.navigateTo({
      url: '/pages/order/list/list'
    });
  }
});