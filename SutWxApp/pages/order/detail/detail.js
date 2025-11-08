// 璁㈠崟璇︽儏椤甸潰JS
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    // 璁㈠崟璇︽儏鏁版嵁
    orderDetail: null,
    // 鍔犺浇鐘舵€?    loading: false,
    // 閿欒淇℃伅
    error: false,
    errorMsg: '',
    // 鍦板潃淇℃伅
    address: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 鑾峰彇璁㈠崟ID
    this.orderId = options.id || '';
    // 鍔犺浇璁㈠崟璇︽儏
    this.loadOrderDetail();
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    // 閲嶆柊鍔犺浇鏁版嵁
    this.loadOrderDetail();
  },

  /**
   * 鍔犺浇璁㈠崟璇︽儏
   */
  loadOrderDetail: function() {
    // 妫€鏌ョ櫥褰曠姸鎬?    if (!wx.getApp().isLoggedIn()) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '璇峰厛鐧诲綍',
        orderDetail: null
      });
      return;
    }

    // 璁剧疆鍔犺浇鐘舵€?    this.setData({
      loading: true,
      error: false
    });

    // 妯℃嫙API璇锋眰
    setTimeout(() => {
      try {
        // 妯℃嫙璁㈠崟璇︽儏鏁版嵁
        const orderDetail = this.generateMockOrderDetail();
        // 妯℃嫙鍦板潃鏁版嵁
        const address = this.generateMockAddress();
        
        this.setData({
          orderDetail: orderDetail,
          address: address
        });

        // 缁撴潫涓嬫媺鍒锋柊
        wx.stopPullDownRefresh();
      } catch (err) {
        this.setData({
          error: true,
          errorMsg: '鍔犺浇澶辫触锛岃閲嶈瘯',
          orderDetail: null
        });
        console.error('鍔犺浇璁㈠崟璇︽儏澶辫触:', err);
      } finally {
        this.setData({
          loading: false
        });
      }
    }, 1000);
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯?   */
  onProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${productId}`
    });
  },

  /**
   * 鍘绘敮浠?   */
  onPayOrder: function() {
    // 璺宠浆鍒版敮浠橀〉闈?    wx.navigateTo({
      url: `/pages/order/pay/pay?id=${this.orderId}`
    });
  },

  /**
   * 纭鏀惰揣
   */
  onConfirmReceipt: function() {
    // 寮瑰嚭纭妗?    wx.showModal({
      title: '纭鏀惰揣',
      content: '纭宸叉敹鍒板晢鍝佸悧锛?,
      success: (res) => {
        if (res.confirm) {
          // 妯℃嫙API璋冪敤
          this.setData({
            loading: true
          });
          
          setTimeout(() => {
            try {
              // 鏇存柊璁㈠崟鐘舵€?              const orderDetail = this.data.orderDetail;
              orderDetail.status = 'completed';
              orderDetail.statusText = '宸插畬鎴?;
              
              this.setData({
                orderDetail: orderDetail,
                loading: false
              });
              
              wx.showToast({
                title: '鏀惰揣鎴愬姛',
                icon: 'success'
              });
            } catch (err) {
              this.setData({
                loading: false
              });
              wx.showToast({
                title: '鎿嶄綔澶辫触锛岃閲嶈瘯',
                icon: 'none'
              });
              console.error('纭鏀惰揣澶辫触:', err);
            }
          }, 1000);
        }
      }
    });
  },

  /**
   * 鍙栨秷璁㈠崟
   */
  onCancelOrder: function() {
    // 寮瑰嚭纭妗?    wx.showModal({
      title: '鍙栨秷璁㈠崟',
      content: '纭畾瑕佸彇娑堣璁㈠崟鍚楋紵',
      success: (res) => {
        if (res.confirm) {
          // 妯℃嫙API璋冪敤
          this.setData({
            loading: true
          });
          
          setTimeout(() => {
            try {
              // 鏇存柊璁㈠崟鐘舵€?              const orderDetail = this.data.orderDetail;
              orderDetail.status = 'cancelled';
              orderDetail.statusText = '宸插彇娑?;
              
              this.setData({
                orderDetail: orderDetail,
                loading: false
              });
              
              wx.showToast({
                title: '鍙栨秷鎴愬姛',
                icon: 'success'
              });
            } catch (err) {
              this.setData({
                loading: false
              });
              wx.showToast({
                title: '鎿嶄綔澶辫触锛岃閲嶈瘯',
                icon: 'none'
              });
              console.error('鍙栨秷璁㈠崟澶辫触:', err);
            }
          }, 1000);
        }
      }
    });
  },

  /**
   * 鑱旂郴瀹㈡湇
   */
  onContactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      success: () => {
        console.log('鎷ㄦ墦瀹㈡湇鐢佃瘽鎴愬姛');
      },
      fail: (err) => {
        console.error('鎷ㄦ墦瀹㈡湇鐢佃瘽澶辫触:', err);
        wx.showToast({
          title: '鎷ㄦ墦澶辫触锛岃閲嶈瘯',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 鍘昏瘎浠?   */
  onReviewOrder: function() {
    // 璺宠浆鍒拌瘎浠烽〉闈?    wx.navigateTo({
      url: `/pages/order/review/review?id=${this.orderId}`
    });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    this.loadOrderDetail();
  },

  /**
   * 鍘荤櫥褰?   */
  onLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 妯℃嫙鐢熸垚璁㈠崟璇︽儏鏁版嵁
   */
  generateMockOrderDetail: function() {
    // 闅忔満鐘舵€?    const statuses = ['pending_payment', 'pending_shipping', 'pending_receipt', 'completed'];
    const orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // 鐢熸垚鍟嗗搧鍒楄〃
    const productCount = Math.floor(Math.random() * 3) + 1;
    const products = [];
    let totalPrice = 0;
    
    for (let i = 0; i < productCount; i++) {
      const price = Math.floor(Math.random() * 900) + 100;
      const quantity = Math.floor(Math.random() * 5) + 1;
      totalPrice += price * quantity;
      
      products.push({
        id: `product_${i}`,
        title: `妯℃嫙鍟嗗搧${i + 1}`,
        image: '/images/default-post.svg',
        price: price,
        quantity: quantity
      });
    }
    
    // 璁＄畻鎬讳环锛堝寘鍚繍璐瑰拰浼樻儬鍒革級
    const freight = 10;
    // 闅忔満鍐冲畾鏄惁浣跨敤浼樻儬鍒革紙70%姒傜巼浣跨敤锛?    const useCoupon = Math.random() < 0.7;
    let couponDiscount = 0;
    let couponInfo = null;
    
    if (useCoupon && totalPrice >= 50) {
      // 浼樻儬鍒哥被鍨嬶細50%姒傜巼涓虹幇閲戝埜锛?0%姒傜巼涓烘姌鎵ｅ埜
      const couponType = Math.random() < 0.5 ? 'cash' : 'percent';
      
      if (couponType === 'cash') {
        // 鐜伴噾鍒革細10-30鍏冧箣闂寸殑浼樻儬閲戦
        couponDiscount = Math.floor(Math.random() * 21) + 10;
        couponInfo = {
          id: 'coupon_cash_' + Math.floor(Math.random() * 1000),
          name: '婊?0鍑? + couponDiscount + '鍏?,
          value: couponDiscount,
          type: 'cash'
        };
      } else {
        // 鎶樻墸鍒革細8鎶樻垨9鎶?        const discountRate = Math.random() < 0.5 ? 8 : 9;
        couponDiscount = Math.floor(totalPrice * (1 - discountRate / 10));
        couponInfo = {
          id: 'coupon_percent_' + Math.floor(Math.random() * 1000),
          name: discountRate + '鎶樹紭鎯犲埜',
          value: discountRate * 10, // 瀛樺偍涓?0琛ㄧず8鎶?          type: 'percent'
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
      paymentMethod: orderStatus !== 'pending_payment' ? '寰俊鏀粯' : '',
      orderRemark: '璇峰敖蹇彂璐?,
      trackingNo: ['pending_receipt', 'completed'].includes(orderStatus) ? `SF1234567890${Math.floor(Math.random() * 100)}` : ''
    };
  },

  /**
   * 妯℃嫙鐢熸垚鍦板潃鏁版嵁
   */
  generateMockAddress: function() {
    return {
      receiver: '寮犱笁',
      phone: '138****8888',
      province: '骞夸笢鐪?,
      city: '娣卞湷甯?,
      district: '鍗楀北鍖?,
      detail: '绉戞妧鍥崡鍖?鏍?
    };
  },

  /**
   * 鑾峰彇璁㈠崟鐘舵€佹枃鏈?   */
  getStatusText: function(status) {
    const statusMap = {
      'pending_payment': '寰呬粯娆?,
      'pending_shipping': '寰呭彂璐?,
      'pending_receipt': '寰呮敹璐?,
      'completed': '宸插畬鎴?,
      'cancelled': '宸插彇娑?
    };
    return statusMap[status] || '鏈煡';
  }
});\n