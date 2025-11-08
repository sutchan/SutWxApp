// 璁㈠崟纭椤甸潰閫昏緫
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    selectedAddress: null, // 閫変腑鐨勫湴鍧€
    cartItems: [], // 璐墿杞﹀晢鍝侊紙浠庤喘鐗╄溅椤甸潰浼犲叆锛?    products: [], // 鐩存帴璐拱鐨勫晢鍝侊紙浠庡晢鍝佽鎯呴〉浼犲叆锛?    coupon: null, // 閫変腑鐨勪紭鎯犲埜
    totalPrice: 0, // 鍟嗗搧鎬讳环
    totalCount: 0, // 鍟嗗搧鎬绘暟閲?    shippingFee: 0, // 杩愯垂
    discount: 0, // 浼樻儬閲戦
    finalPrice: 0, // 鏈€缁堜环鏍?    remark: '', // 璁㈠崟澶囨敞
    loading: false, // 鍔犺浇鐘舵€?    submitting: false // 鎻愪氦鐘舵€?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'order_confirm'
    });
    
    // 妫€鏌ユ槸鍚︾櫥褰?    if (!app.isLoggedIn()) {
      showToast('璇峰厛鐧诲綍', 'none');
      // 寤惰繜璺宠浆鐧诲綍椤?      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user/login/login'
        });
      }, 1500);
      return;
    }
    
    // 鑾峰彇椤甸潰鍙傛暟
    const cartItemsStr = options.cartItems;
    const productStr = options.product;
    
    if (cartItemsStr) {
      // 浠庤喘鐗╄溅椤甸潰璺宠浆杩囨潵
      try {
        // 棣栧厛灏濊瘯浠庡叏灞€鏁版嵁鑾峰彇
        if (app.globalData.tempOrderItems) {
          this.setData({
            cartItems: app.globalData.tempOrderItems
          });
          // 娓呯┖涓存椂鏁版嵁
          app.globalData.tempOrderItems = null;
        } else if (cartItemsStr) {
          const cartItems = JSON.parse(decodeURIComponent(cartItemsStr));
          this.setData({
            cartItems: cartItems
          });
        }
      } catch (e) {
        console.error('瑙ｆ瀽璐墿杞︽暟鎹け璐?, e);
      }
    } else if (productStr) {
      // 浠庡晢鍝佽鎯呴〉鐩存帴璐拱璺宠浆杩囨潵
      try {
        const product = JSON.parse(decodeURIComponent(productStr));
        this.setData({
          products: [product]
        });
      } catch (e) {
        console.error('瑙ｆ瀽鍟嗗搧鏁版嵁澶辫触', e);
      }
    }
    
    // 璁＄畻浠锋牸
    this.calculatePrice();
    
    // 鍔犺浇榛樿鍦板潃
    this.loadDefaultAddress();
  },

  /**
   * 鍔犺浇榛樿鍦板潃
   */
  async loadDefaultAddress() {
    try {
      // 浣跨敤addressService鑾峰彇榛樿鍦板潃
      const res = await app.services.address.getDefaultAddress();
      if (res) {
        this.setData({
          selectedAddress: res
        });
      }
    } catch (err) {
      console.error('鑾峰彇榛樿鍦板潃澶辫触', err);
    }
  },

  /**
   * 閫夋嫨鍦板潃
   */
  onSelectAddress: function() {
    wx.navigateTo({
      url: '/pages/user/address/list?selectMode=true'
    });
  },

  /**
   * 閫夋嫨浼樻儬鍒?   */
  onSelectCoupon: function() {
    // 璁板綍浼樻儬鍒搁€夋嫨浜嬩欢
    if (app.analyticsService) {
      app.analyticsService.track('coupon_selection_attempted');
    }
    
    // 妫€鏌ユ槸鍚︾櫥褰?    if (!app.isLoggedIn()) {
      showToast('璇峰厛鐧诲綍', 'none');
      return;
    }
    
    // 鏋勫缓浼樻儬鍒搁€夋嫨鎵€闇€鐨勫弬鏁?    const params = {
      total_amount: this.data.totalPrice,
      product_ids: [],
      current_coupon_id: this.data.coupon ? this.data.coupon.id : ''
    };
    
    // 鏀堕泦鎵€鏈夊晢鍝両D
    this.data.cartItems.forEach(item => {
      params.product_ids.push(item.productId);
    });
    
    this.data.products.forEach(item => {
      params.product_ids.push(item.id);
    });
    
    // 璺宠浆鍒颁紭鎯犲埜閫夋嫨椤甸潰骞跺缓绔嬩簨浠堕€氶亾
    wx.navigateTo({
      url: `/pages/user/coupon/select?params=${encodeURIComponent(JSON.stringify(params))}`,
      events: {
        // 鐩戝惉浼樻儬鍒搁€夋嫨缁撴灉
        selectCoupon: (data) => {
          if (data && data.coupon) {
            // 璁剧疆閫変腑鐨勪紭鎯犲埜
            this.setData({
              coupon: data.coupon
            });
            // 閲嶆柊璁＄畻浠锋牸
            this.calculatePrice();
            // 璁板綍浼樻儬鍒搁€夋嫨鎴愬姛浜嬩欢
            if (app.analyticsService) {
              app.analyticsService.track('coupon_selected', {
                coupon_id: data.coupon.id,
                coupon_name: data.coupon.name
              });
            }
          } else if (data && data.clearCoupon) {
            // 娓呯┖浼樻儬鍒?            this.setData({
              coupon: null
            });
            // 閲嶆柊璁＄畻浠锋牸
            this.calculatePrice();
            // 璁板綍鍙栨秷浼樻儬鍒镐簨浠?            if (app.analyticsService) {
              app.analyticsService.track('coupon_cleared');
            }
          }
        }
      }
    });
  },

  /**
   * 杈撳叆璁㈠崟澶囨敞
   */
  onRemarkInput: function(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  /**
   * 璁＄畻浠锋牸
   */
  calculatePrice: function() {
    let totalPrice = 0;
    let totalCount = 0;
    
    // 璁＄畻璐墿杞﹀晢鍝佹€讳环鍜屾暟閲?    this.data.cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
      totalCount += item.quantity;
    });
    
    // 璁＄畻鐩存帴璐拱鍟嗗搧鎬讳环鍜屾暟閲?    this.data.products.forEach(item => {
      totalPrice += item.price * item.quantity;
      totalCount += item.quantity;
    });
    
    // 璁剧疆杩愯垂锛堣繖閲岀畝鍖栦负璁㈠崟婊?8鍏冨厤杩愯垂锛?    let shippingFee = totalPrice >= 88 ? 0 : 10;
    
    // 璁＄畻浼樻儬閲戦
    let discount = 0;
    if (this.data.coupon && app.services.coupon) {
      discount = app.services.coupon.calculateDiscount(this.data.coupon, totalPrice);
    }
    
    // 璁＄畻鏈€缁堜环鏍?    let finalPrice = Math.max(0, totalPrice + shippingFee - discount);
    
    this.setData({
      totalPrice: totalPrice,
      totalCount: totalCount,
      shippingFee: shippingFee,
      discount: discount,
      finalPrice: finalPrice
    });
  },

  /**
   * 鎻愪氦璁㈠崟
   */
  async onSubmitOrder() {
    // 妫€鏌ユ槸鍚︾櫥褰?    if (!app.isLoggedIn()) {
      showToast('璇峰厛鐧诲綍', 'none');
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user/login/login'
        });
      }, 1500);
      return;
    }
    
    // 妫€鏌ユ槸鍚﹂€夋嫨浜嗗湴鍧€
    if (!this.data.selectedAddress) {
      showToast('璇烽€夋嫨鏀惰揣鍦板潃', 'none');
      return;
    }
    
    // 妫€鏌ユ槸鍚︽湁鍟嗗搧
    if (this.data.cartItems.length === 0 && this.data.products.length === 0) {
      showToast('璇烽€夋嫨瑕佽喘涔扮殑鍟嗗搧', 'none');
      return;
    }
    
    // 鏋勫缓璁㈠崟鏁版嵁
    const orderData = {
      addressId: this.data.selectedAddress.id,
      remark: this.data.remark,
      items: []
    };
    
    // 娣诲姞璐墿杞﹀晢鍝?    this.data.cartItems.forEach(item => {
      orderData.items.push({
        productId: item.productId,
        skuId: item.skuId,
        quantity: item.quantity,
        price: item.price
      });
    });
    
    // 娣诲姞鐩存帴璐拱鐨勫晢鍝?    this.data.products.forEach(item => {
      orderData.items.push({
        productId: item.id,
        skuId: item.selectedSkuId,
        quantity: item.quantity,
        price: item.price
      });
    });
    
    this.setData({
      submitting: true
    });
    
    try {
      // 浣跨敤orderService鍒涘缓璁㈠崟
      const res = await app.services.order.createOrder(orderData);
      const orderId = res.orderId;
      
      // 璁板綍璁㈠崟鍒涘缓浜嬩欢
      app.analyticsService.track('order_created', {
        order_id: orderId,
        total_amount: this.data.finalPrice,
        item_count: orderData.items.length
      });
      
      // 鏄剧ず鎴愬姛鎻愮ず
      showToast('璁㈠崟鍒涘缓鎴愬姛', 'success');
      
      // 寤惰繜璺宠浆鍒版敮浠橀〉闈?      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/order/pay?orderId=${orderId}`
        });
      }, 1500);
    } catch (err) {
      showToast(err.message || '璁㈠崟鍒涘缓澶辫触锛岃閲嶈瘯', 'none');
    } finally {
      this.setData({
        submitting: false
      });
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 妫€鏌ユ槸鍚︿粠鍦板潃閫夋嫨椤甸潰杩斿洖
    const pages = getCurrentPages();
    if (pages.length > 1) {
      // 鑾峰彇涓婁竴涓〉闈㈢殑鏁版嵁
      const prevPage = pages[pages.length - 2];
      
      // 妫€鏌ユ槸鍚﹂€夋嫨浜嗗湴鍧€
      if (prevPage && prevPage.data.selectedAddressId) {
        // 濡傛灉鏈夐€変腑鐨勫湴鍧€ID锛屽垯鑾峰彇鍦板潃璇︽儏
        this.loadAddressDetail(prevPage.data.selectedAddressId);
        // 娓呴櫎涓婁竴椤电殑閫夋嫨鐘舵€?        delete prevPage.data.selectedAddressId;
      }
    }
    
    // 浣跨敤浜嬩欢閫氶亾鎺ユ敹浼樻儬鍒搁€夋嫨缁撴灉
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('selectCoupon', (data) => {
        if (data && data.coupon) {
          // 璁剧疆閫変腑鐨勪紭鎯犲埜
          this.setData({
            coupon: data.coupon
          });
          // 閲嶆柊璁＄畻浠锋牸
          this.calculatePrice();
          // 璁板綍浼樻儬鍒搁€夋嫨鎴愬姛浜嬩欢
          if (app.analyticsService) {
            app.analyticsService.track('coupon_selected', {
              coupon_id: data.coupon.id,
              coupon_name: data.coupon.name
            });
          }
        } else if (data && data.clearCoupon) {
          // 娓呯┖浼樻儬鍒?          this.setData({
            coupon: null
          });
          // 閲嶆柊璁＄畻浠锋牸
          this.calculatePrice();
          // 璁板綍鍙栨秷浼樻儬鍒镐簨浠?          if (app.analyticsService) {
            app.analyticsService.track('coupon_cleared');
          }
        }
      });
    }
  },
  
  /**
   * 鍔犺浇鍦板潃璇︽儏
   */
  async loadAddressDetail(addressId) {
    try {
      const address = await app.services.address.getAddressDetail(addressId);
      this.setData({
        selectedAddress: address
      });
    } catch (err) {
      console.error('鍔犺浇鍦板潃璇︽儏澶辫触', err);
    }
  }
});\n