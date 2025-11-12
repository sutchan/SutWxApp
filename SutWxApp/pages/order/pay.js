锘?/ 閺€顖欑帛妞ょ敻娼伴柅鏄忕帆
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    orderId: '', // 鐠併垹宕烮D
    orderInfo: null, // 鐠併垹宕熸穱鈩冧紖
    paymentMethods: [ // 閺€顖欑帛閺傜懓绱￠崚妤勩€?      { id: 'wechat', name: '瀵邦喕淇婇弨顖欑帛', icon: '/images/payment/wechat.png', selected: true },
      { id: 'alipay', name: '閺€顖欑帛鐎?, icon: '/images/payment/alipay.png', selected: false }
    ],
    loading: true, // 閸旂姾娴囬悩鑸碘偓?    paying: false // 閺€顖欑帛娑擃厾濮搁幀?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'order_pay'
    });
    
    // 閼惧嘲褰囩拋銏犲礋ID
    const orderId = options.orderId;
    if (!orderId) {
      showToast('鐠併垹宕熸穱鈩冧紖闁挎瑨顕?, 'none');
      // 瀵ゆ儼绻滄潻鏂挎礀鐠併垹宕熼崚妤勩€冩い?      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/order/list/list'
        });
      }, 1500);
      return;
    }
    
    this.setData({
      orderId: orderId
    });
    
    // 閸旂姾娴囩拋銏犲礋鐠囷附鍎?    this.loadOrderInfo();
  },

  /**
   * 閸旂姾娴囩拋銏犲礋鐠囷附鍎?   */
  async loadOrderInfo() {
    try {
      // 娴ｈ法鏁rderService閼惧嘲褰囩拋銏犲礋鐠囷附鍎?      const res = await app.services.order.getOrderDetail(this.data.orderId);
      this.setData({
        orderInfo: res,
        loading: false
      });
    } catch (err) {
      this.setData({
        loading: false
      });
      showToast(err.message || '閸旂姾娴囩拋銏犲礋娣団剝浼呮径杈Е', 'none');
    }
  },

  /**
   * 闁瀚ㄩ弨顖欑帛閺傜懓绱?   */
  onSelectPaymentMethod(e) {
    const methodId = e.currentTarget.dataset.id;
    const paymentMethods = this.data.paymentMethods.map(method => ({
      ...method,
      selected: method.id === methodId
    }));
    
    // 鐠佹澘缍嶉弨顖欑帛閺傜懓绱￠柅澶嬪娴滃娆?    app.analyticsService.track('payment_method_selected', {
      payment_method: methodId
    });
    
    this.setData({
      paymentMethods: paymentMethods
    });
  },

  /**
   * 閸欐垼鎹ｉ弨顖欑帛
   */
  async onPay() {
    if (this.data.paying) {
      return;
    }
    
    this.setData({
      paying: true
    });
    
    try {
      // 閼惧嘲褰囬柅澶夎厬閻ㄥ嫭鏁禒妯绘煙瀵?      const selectedMethod = this.data.paymentMethods.find(method => method.selected);
      
      // 鐠佹澘缍嶉弨顖欑帛鐏忔繆鐦禍瀣╂
      app.analyticsService.track('payment_attempt', {
        order_id: this.data.orderId,
        payment_method: selectedMethod.id,
        amount: this.data.orderInfo?.amount
      });
      
      // 娴ｈ法鏁aymentService閸欐垼鎹ｉ弨顖欑帛
      try {
        // 鐠嬪啰鏁ゆ稉鈧粩娆忕础閺€顖欑帛濞翠胶鈻?        const paymentResult = await app.services.payment.payOrder(
          this.data.orderId, 
          selectedMethod.id
        );
        
        this.setData({
          paying: false
        });
        
        // 鐠佹澘缍嶉弨顖欑帛閹存劕濮涙禍瀣╂
        app.analyticsService.track('payment_success', {
          order_id: this.data.orderId,
          payment_method: selectedMethod.id,
          amount: this.data.orderInfo?.amount
        });
        
        wx.showModal({
          title: '閺€顖欑帛閹存劕濮?,
          content: '閹劎娈戠拋銏犲礋瀹稿弶鏁禒妯诲灇閸旂噦绱濋弰顖氭儊閺屻儳婀呯拋銏犲礋鐠囷附鍎忛敍?,
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
        
        // 婢跺嫮鎮婇悽銊﹀煕閸欐牗绉烽弨顖欑帛閻ㄥ嫭鍎忛崘?        if (error.message && error.message.includes('閸欐牗绉烽弨顖欑帛')) {
          showToast('閹劌鍑￠崣鏍ㄧХ閺€顖欑帛', 'none');
          return;
        }
        
        throw error; // 闁插秵鏌婇幎娑樺毉閸忔湹绮柨娆掝嚖閿涘瞼鏁辨径鏍х湴catch婢跺嫮鎮?      }
    } catch (err) {
      this.setData({
        paying: false
      });
      
      // 鐠佹澘缍嶉弨顖欑帛婢惰精瑙︽禍瀣╂
      app.analyticsService.track('payment_failed', {
        order_id: this.data.orderId,
        error: err.message
      });
      
      showToast(err.message || '閺€顖欑帛婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, 'none');
    }
  },

  /**
   * 閺屻儳婀呯拋銏犲礋鐠囷附鍎?   */
  onViewOrderDetail: function() {
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 鏉╂柨娲栫拋銏犲礋閸掓銆?   */
  onBackToOrderList: function() {
    wx.navigateTo({
      url: '/pages/order/list/list'
    });
  }
});\n