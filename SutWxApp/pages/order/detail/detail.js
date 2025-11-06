// 订单详情页面JS
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 订单详情数据
    orderDetail: null,
    // 加载状态
    loading: false,
    // 错误信息
    error: false,
    errorMsg: '',
    // 地址信息
    address: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取订单ID
    this.orderId = options.id || '';
    // 加载订单详情
    this.loadOrderDetail();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    // 重新加载数据
    this.loadOrderDetail();
  },

  /**
   * 加载订单详情
   */
  loadOrderDetail: function() {
    // 检查登录状态
    if (!wx.getApp().isLoggedIn()) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '请先登录',
        orderDetail: null
      });
      return;
    }

    // 设置加载状态
    this.setData({
      loading: true,
      error: false
    });

    // 模拟API请求
    setTimeout(() => {
      try {
        // 模拟订单详情数据
        const orderDetail = this.generateMockOrderDetail();
        // 模拟地址数据
        const address = this.generateMockAddress();
        
        this.setData({
          orderDetail: orderDetail,
          address: address
        });

        // 结束下拉刷新
        wx.stopPullDownRefresh();
      } catch (err) {
        this.setData({
          error: true,
          errorMsg: '加载失败，请重试',
          orderDetail: null
        });
        console.error('加载订单详情失败:', err);
      } finally {
        this.setData({
          loading: false
        });
      }
    }, 1000);
  },

  /**
   * 跳转到商品详情
   */
  onProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${productId}`
    });
  },

  /**
   * 去支付
   */
  onPayOrder: function() {
    // 跳转到支付页面
    wx.navigateTo({
      url: `/pages/order/pay/pay?id=${this.orderId}`
    });
  },

  /**
   * 确认收货
   */
  onConfirmReceipt: function() {
    // 弹出确认框
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟API调用
          this.setData({
            loading: true
          });
          
          setTimeout(() => {
            try {
              // 更新订单状态
              const orderDetail = this.data.orderDetail;
              orderDetail.status = 'completed';
              orderDetail.statusText = '已完成';
              
              this.setData({
                orderDetail: orderDetail,
                loading: false
              });
              
              wx.showToast({
                title: '收货成功',
                icon: 'success'
              });
            } catch (err) {
              this.setData({
                loading: false
              });
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              });
              console.error('确认收货失败:', err);
            }
          }, 1000);
        }
      }
    });
  },

  /**
   * 取消订单
   */
  onCancelOrder: function() {
    // 弹出确认框
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟API调用
          this.setData({
            loading: true
          });
          
          setTimeout(() => {
            try {
              // 更新订单状态
              const orderDetail = this.data.orderDetail;
              orderDetail.status = 'cancelled';
              orderDetail.statusText = '已取消';
              
              this.setData({
                orderDetail: orderDetail,
                loading: false
              });
              
              wx.showToast({
                title: '取消成功',
                icon: 'success'
              });
            } catch (err) {
              this.setData({
                loading: false
              });
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              });
              console.error('取消订单失败:', err);
            }
          }, 1000);
        }
      }
    });
  },

  /**
   * 联系客服
   */
  onContactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      success: () => {
        console.log('拨打客服电话成功');
      },
      fail: (err) => {
        console.error('拨打客服电话失败:', err);
        wx.showToast({
          title: '拨打失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 去评价
   */
  onReviewOrder: function() {
    // 跳转到评价页面
    wx.navigateTo({
      url: `/pages/order/review/review?id=${this.orderId}`
    });
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    this.loadOrderDetail();
  },

  /**
   * 去登录
   */
  onLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 模拟生成订单详情数据
   */
  generateMockOrderDetail: function() {
    // 随机状态
    const statuses = ['pending_payment', 'pending_shipping', 'pending_receipt', 'completed'];
    const orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // 生成商品列表
    const productCount = Math.floor(Math.random() * 3) + 1;
    const products = [];
    let totalPrice = 0;
    
    for (let i = 0; i < productCount; i++) {
      const price = Math.floor(Math.random() * 900) + 100;
      const quantity = Math.floor(Math.random() * 5) + 1;
      totalPrice += price * quantity;
      
      products.push({
        id: `product_${i}`,
        title: `模拟商品${i + 1}`,
        image: '/images/default-post.svg',
        price: price,
        quantity: quantity
      });
    }
    
    // 计算总价（包含运费和优惠券）
    const freight = 10;
    // 随机决定是否使用优惠券（70%概率使用）
    const useCoupon = Math.random() < 0.7;
    let couponDiscount = 0;
    let couponInfo = null;
    
    if (useCoupon && totalPrice >= 50) {
      // 优惠券类型：50%概率为现金券，50%概率为折扣券
      const couponType = Math.random() < 0.5 ? 'cash' : 'percent';
      
      if (couponType === 'cash') {
        // 现金券：10-30元之间的优惠金额
        couponDiscount = Math.floor(Math.random() * 21) + 10;
        couponInfo = {
          id: 'coupon_cash_' + Math.floor(Math.random() * 1000),
          name: '满50减' + couponDiscount + '元',
          value: couponDiscount,
          type: 'cash'
        };
      } else {
        // 折扣券：8折或9折
        const discountRate = Math.random() < 0.5 ? 8 : 9;
        couponDiscount = Math.floor(totalPrice * (1 - discountRate / 10));
        couponInfo = {
          id: 'coupon_percent_' + Math.floor(Math.random() * 1000),
          name: discountRate + '折优惠券',
          value: discountRate * 10, // 存储为80表示8折
          type: 'percent'
        };
      }
    }
    
    const finalTotal = totalPrice + freight - couponDiscount;
    
    return {
      id: this.orderId || 'order_1',
      orderNo: `20240101${Math.floor(Math.random() * 10000)}`,
      status: orderStatus,
      statusText: this.getStatusText(orderStatus),
      createTime: new Date().toLocaleString(),
      paymentTime: orderStatus !== 'pending_payment' ? new Date(Date.now() - 3600000).toLocaleString() : '',
      shippingTime: ['pending_receipt', 'completed'].includes(orderStatus) ? new Date(Date.now() - 7200000).toLocaleString() : '',
      completeTime: orderStatus === 'completed' ? new Date(Date.now() - 86400000).toLocaleString() : '',
      products: products,
      productCount: productCount,
      totalPrice: totalPrice,
      freight: freight,
      couponDiscount: couponDiscount,
      couponInfo: couponInfo,
      finalTotal: finalTotal,
      paymentMethod: orderStatus !== 'pending_payment' ? '微信支付' : '',
      orderRemark: '请尽快发货',
      trackingNo: ['pending_receipt', 'completed'].includes(orderStatus) ? `SF1234567890${Math.floor(Math.random() * 100)}` : ''
    };
  },

  /**
   * 模拟生成地址数据
   */
  generateMockAddress: function() {
    return {
      receiver: '张三',
      phone: '138****8888',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区8栋'
    };
  },

  /**
   * 获取订单状态文本
   */
  getStatusText: function(status) {
    const statusMap = {
      'pending_payment': '待付款',
      'pending_shipping': '待发货',
      'pending_receipt': '待收货',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || '未知';
  }
});