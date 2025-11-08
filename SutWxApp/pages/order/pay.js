// 鏀粯椤甸潰閫昏緫
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    orderId: '', // 璁㈠崟ID
    orderInfo: null, // 璁㈠崟淇℃伅
    paymentMethods: [ // 鏀粯鏂瑰紡鍒楄〃
      { id: 'wechat', name: '寰俊鏀粯', icon: '/images/payment/wechat.png', selected: true },
      { id: 'alipay', name: '鏀粯瀹?, icon: '/images/payment/alipay.png', selected: false }
    ],
    loading: true, // 鍔犺浇鐘舵€?    paying: false // 鏀粯涓姸鎬?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'order_pay'
    });
    
    // 鑾峰彇璁㈠崟ID
    const orderId = options.orderId;
    if (!orderId) {
      showToast('璁㈠崟淇℃伅閿欒', 'none');
      // 寤惰繜杩斿洖璁㈠崟鍒楄〃椤?      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/order/list/list'
        });
      }, 1500);
      return;
    }
    
    this.setData({
      orderId: orderId
    });
    
    // 鍔犺浇璁㈠崟璇︽儏
    this.loadOrderInfo();
  },

  /**
   * 鍔犺浇璁㈠崟璇︽儏
   */
  async loadOrderInfo() {
    try {
      // 浣跨敤orderService鑾峰彇璁㈠崟璇︽儏
      const res = await app.services.order.getOrderDetail(this.data.orderId);
      this.setData({
        orderInfo: res,
        loading: false
      });
    } catch (err) {
      this.setData({
        loading: false
      });
      showToast(err.message || '鍔犺浇璁㈠崟淇℃伅澶辫触', 'none');
    }
  },

  /**
   * 閫夋嫨鏀粯鏂瑰紡
   */
  onSelectPaymentMethod(e) {
    const methodId = e.currentTarget.dataset.id;
    const paymentMethods = this.data.paymentMethods.map(method => ({
      ...method,
      selected: method.id === methodId
    }));
    
    // 璁板綍鏀粯鏂瑰紡閫夋嫨浜嬩欢
    app.analyticsService.track('payment_method_selected', {
      payment_method: methodId
    });
    
    this.setData({
      paymentMethods: paymentMethods
    });
  },

  /**
   * 鍙戣捣鏀粯
   */
  async onPay() {
    if (this.data.paying) {
      return;
    }
    
    this.setData({
      paying: true
    });
    
    try {
      // 鑾峰彇閫変腑鐨勬敮浠樻柟寮?      const selectedMethod = this.data.paymentMethods.find(method => method.selected);
      
      // 璁板綍鏀粯灏濊瘯浜嬩欢
      app.analyticsService.track('payment_attempt', {
        order_id: this.data.orderId,
        payment_method: selectedMethod.id,
        amount: this.data.orderInfo?.amount
      });
      
      // 浣跨敤paymentService鍙戣捣鏀粯
      try {
        // 璋冪敤涓€绔欏紡鏀粯娴佺▼
        const paymentResult = await app.services.payment.payOrder(
          this.data.orderId, 
          selectedMethod.id
        );
        
        this.setData({
          paying: false
        });
        
        // 璁板綍鏀粯鎴愬姛浜嬩欢
        app.analyticsService.track('payment_success', {
          order_id: this.data.orderId,
          payment_method: selectedMethod.id,
          amount: this.data.orderInfo?.amount
        });
        
        wx.showModal({
          title: '鏀粯鎴愬姛',
          content: '鎮ㄧ殑璁㈠崟宸叉敮浠樻垚鍔燂紝鏄惁鏌ョ湅璁㈠崟璇︽儏锛?,
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
        
        // 澶勭悊鐢ㄦ埛鍙栨秷鏀粯鐨勬儏鍐?        if (error.message && error.message.includes('鍙栨秷鏀粯')) {
          showToast('鎮ㄥ凡鍙栨秷鏀粯', 'none');
          return;
        }
        
        throw error; // 閲嶆柊鎶涘嚭鍏朵粬閿欒锛岀敱澶栧眰catch澶勭悊
      }
    } catch (err) {
      this.setData({
        paying: false
      });
      
      // 璁板綍鏀粯澶辫触浜嬩欢
      app.analyticsService.track('payment_failed', {
        order_id: this.data.orderId,
        error: err.message
      });
      
      showToast(err.message || '鏀粯澶辫触锛岃閲嶈瘯', 'none');
    }
  },

  /**
   * 鏌ョ湅璁㈠崟璇︽儏
   */
  onViewOrderDetail: function() {
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 杩斿洖璁㈠崟鍒楄〃
   */
  onBackToOrderList: function() {
    wx.navigateTo({
      url: '/pages/order/list/list'
    });
  }
});\n