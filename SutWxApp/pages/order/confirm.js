锘?/ 鐠併垹宕熺涵顔款吇妞ょ敻娼伴柅鏄忕帆
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    selectedAddress: null, // 闁鑵戦惃鍕勾閸р偓
    cartItems: [], // 鐠愵厾澧挎潪锕€鏅㈤崫渚婄礄娴犲氦鍠橀悧鈺勬簠妞ょ敻娼版导鐘插弳閿?    products: [], // 閻╁瓨甯寸拹顓濇嫳閻ㄥ嫬鏅㈤崫渚婄礄娴犲骸鏅㈤崫浣筋嚊閹懘銆夋导鐘插弳閿?    coupon: null, // 闁鑵戦惃鍕喘閹姴鍩?    totalPrice: 0, // 閸熷棗鎼ч幀璁崇幆
    totalCount: 0, // 閸熷棗鎼ч幀缁樻殶闁?    shippingFee: 0, // 鏉╂劘鍨?    discount: 0, // 娴兼ɑ鍎柌鎴︻杺
    finalPrice: 0, // 閺堚偓缂佸牅鐜弽?    remark: '', // 鐠併垹宕熸径鍥ㄦ暈
    loading: false, // 閸旂姾娴囬悩鑸碘偓?    submitting: false // 閹绘劒姘﹂悩鑸碘偓?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'order_confirm'
    });
    
    // 濡偓閺屻儲妲搁崥锔炬瑜?    if (!app.isLoggedIn()) {
      showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
      // 瀵ゆ儼绻滅捄瀹犳祮閻ц缍嶆い?      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user/login/login'
        });
      }, 1500);
      return;
    }
    
    // 閼惧嘲褰囨い鐢告桨閸欏倹鏆?    const cartItemsStr = options.cartItems;
    const productStr = options.product;
    
    if (cartItemsStr) {
      // 娴犲氦鍠橀悧鈺勬簠妞ょ敻娼扮捄瀹犳祮鏉╁洦娼?      try {
        // 妫ｆ牕鍘涚亸婵婄槸娴犲骸鍙忕仦鈧弫鐗堝祦閼惧嘲褰?        if (app.globalData.tempOrderItems) {
          this.setData({
            cartItems: app.globalData.tempOrderItems
          });
          // 濞撳懐鈹栨稉瀛樻閺佺増宓?          app.globalData.tempOrderItems = null;
        } else if (cartItemsStr) {
          const cartItems = JSON.parse(decodeURIComponent(cartItemsStr));
          this.setData({
            cartItems: cartItems
          });
        }
      } catch (e) {
        console.error('鐟欙絾鐎界拹顓犲⒖鏉烇附鏆熼幑顔笺亼鐠?, e);
      }
    } else if (productStr) {
      // 娴犲骸鏅㈤崫浣筋嚊閹懘銆夐惄瀛樺复鐠愵厺鎷辩捄瀹犳祮鏉╁洦娼?      try {
        const product = JSON.parse(decodeURIComponent(productStr));
        this.setData({
          products: [product]
        });
      } catch (e) {
        console.error('鐟欙絾鐎介崯鍡楁惂閺佺増宓佹径杈Е', e);
      }
    }
    
    // 鐠侊紕鐣绘禒閿嬬壐
    this.calculatePrice();
    
    // 閸旂姾娴囨妯款吇閸︽澘娼?    this.loadDefaultAddress();
  },

  /**
   * 閸旂姾娴囨妯款吇閸︽澘娼?   */
  async loadDefaultAddress() {
    try {
      // 娴ｈ法鏁ddressService閼惧嘲褰囨妯款吇閸︽澘娼?      const res = await app.services.address.getDefaultAddress();
      if (res) {
        this.setData({
          selectedAddress: res
        });
      }
    } catch (err) {
      console.error('閼惧嘲褰囨妯款吇閸︽澘娼冩径杈Е', err);
    }
  },

  /**
   * 闁瀚ㄩ崷鏉挎絻
   */
  onSelectAddress: function() {
    wx.navigateTo({
      url: '/pages/user/address/list?selectMode=true'
    });
  },

  /**
   * 闁瀚ㄦ导妯诲劕閸?   */
  onSelectCoupon: function() {
    // 鐠佹澘缍嶆导妯诲劕閸掓悂鈧瀚ㄦ禍瀣╂
    if (app.analyticsService) {
      app.analyticsService.track('coupon_selection_attempted');
    }
    
    // 濡偓閺屻儲妲搁崥锔炬瑜?    if (!app.isLoggedIn()) {
      showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
      return;
    }
    
    // 閺嬪嫬缂撴导妯诲劕閸掓悂鈧瀚ㄩ幍鈧棁鈧惃鍕棘閺?    const params = {
      total_amount: this.data.totalPrice,
      product_ids: [],
      current_coupon_id: this.data.coupon ? this.data.coupon.id : ''
    };
    
    // 閺€鍫曟肠閹碘偓閺堝鏅㈤崫涓
    this.data.cartItems.forEach(item => {
      params.product_ids.push(item.productId);
    });
    
    this.data.products.forEach(item => {
      params.product_ids.push(item.id);
    });
    
    // 鐠哄疇娴嗛崚棰佺喘閹姴鍩滈柅澶嬪妞ょ敻娼伴獮璺虹紦缁斿绨ㄦ禒鍫曗偓姘朵壕
    wx.navigateTo({
      url: `/pages/user/coupon/select?params=${encodeURIComponent(JSON.stringify(params))}`,
      events: {
        // 閻╂垵鎯夋导妯诲劕閸掓悂鈧瀚ㄧ紒鎾寸亯
        selectCoupon: (data) => {
          if (data && data.coupon) {
            // 鐠佸墽鐤嗛柅澶夎厬閻ㄥ嫪绱幆鐘插煖
            this.setData({
              coupon: data.coupon
            });
            // 闁插秵鏌婄拋锛勭暬娴犻攱鐗?            this.calculatePrice();
            // 鐠佹澘缍嶆导妯诲劕閸掓悂鈧瀚ㄩ幋鎰娴滃娆?            if (app.analyticsService) {
              app.analyticsService.track('coupon_selected', {
                coupon_id: data.coupon.id,
                coupon_name: data.coupon.name
              });
            }
          } else if (data && data.clearCoupon) {
            // 濞撳懐鈹栨导妯诲劕閸?            this.setData({
              coupon: null
            });
            // 闁插秵鏌婄拋锛勭暬娴犻攱鐗?            this.calculatePrice();
            // 鐠佹澘缍嶉崣鏍ㄧХ娴兼ɑ鍎崚闀愮皑娴?            if (app.analyticsService) {
              app.analyticsService.track('coupon_cleared');
            }
          }
        }
      }
    });
  },

  /**
   * 鏉堟挸鍙嗙拋銏犲礋婢跺洦鏁?   */
  onRemarkInput: function(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  /**
   * 鐠侊紕鐣绘禒閿嬬壐
   */
  calculatePrice: function() {
    let totalPrice = 0;
    let totalCount = 0;
    
    // 鐠侊紕鐣荤拹顓犲⒖鏉烇箑鏅㈤崫浣光偓璁崇幆閸滃本鏆熼柌?    this.data.cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
      totalCount += item.quantity;
    });
    
    // 鐠侊紕鐣婚惄瀛樺复鐠愵厺鎷遍崯鍡楁惂閹鐜崪灞炬殶闁?    this.data.products.forEach(item => {
      totalPrice += item.price * item.quantity;
      totalCount += item.quantity;
    });
    
    // 鐠佸墽鐤嗘潻鎰瀭閿涘牐绻栭柌宀€鐣濋崠鏍﹁礋鐠併垹宕熷?8閸忓啫鍘ゆ潻鎰瀭閿?    let shippingFee = totalPrice >= 88 ? 0 : 10;
    
    // 鐠侊紕鐣绘导妯诲劕闁叉垿顤?    let discount = 0;
    if (this.data.coupon && app.services.coupon) {
      discount = app.services.coupon.calculateDiscount(this.data.coupon, totalPrice);
    }
    
    // 鐠侊紕鐣婚張鈧紒鍫滅幆閺?    let finalPrice = Math.max(0, totalPrice + shippingFee - discount);
    
    this.setData({
      totalPrice: totalPrice,
      totalCount: totalCount,
      shippingFee: shippingFee,
      discount: discount,
      finalPrice: finalPrice
    });
  },

  /**
   * 閹绘劒姘︾拋銏犲礋
   */
  async onSubmitOrder() {
    // 濡偓閺屻儲妲搁崥锔炬瑜?    if (!app.isLoggedIn()) {
      showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user/login/login'
        });
      }, 1500);
      return;
    }
    
    // 濡偓閺屻儲妲搁崥锕傗偓澶嬪娴滃棗婀撮崸鈧?    if (!this.data.selectedAddress) {
      showToast('鐠囩兘鈧瀚ㄩ弨鎯版彛閸︽澘娼?, 'none');
      return;
    }
    
    // 濡偓閺屻儲妲搁崥锔芥箒閸熷棗鎼?    if (this.data.cartItems.length === 0 && this.data.products.length === 0) {
      showToast('鐠囩兘鈧瀚ㄧ憰浣藉枠娑旀壆娈戦崯鍡楁惂', 'none');
      return;
    }
    
    // 閺嬪嫬缂撶拋銏犲礋閺佺増宓?    const orderData = {
      addressId: this.data.selectedAddress.id,
      remark: this.data.remark,
      items: []
    };
    
    // 濞ｈ濮炵拹顓犲⒖鏉烇箑鏅㈤崫?    this.data.cartItems.forEach(item => {
      orderData.items.push({
        productId: item.productId,
        skuId: item.skuId,
        quantity: item.quantity,
        price: item.price
      });
    });
    
    // 濞ｈ濮為惄瀛樺复鐠愵厺鎷遍惃鍕櫌閸?    this.data.products.forEach(item => {
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
      // 娴ｈ法鏁rderService閸掓稑缂撶拋銏犲礋
      const res = await app.services.order.createOrder(orderData);
      const orderId = res.orderId;
      
      // 鐠佹澘缍嶇拋銏犲礋閸掓稑缂撴禍瀣╂
      app.analyticsService.track('order_created', {
        order_id: orderId,
        total_amount: this.data.finalPrice,
        item_count: orderData.items.length
      });
      
      // 閺勫墽銇氶幋鎰閹绘劗銇?      showToast('鐠併垹宕熼崚娑樼紦閹存劕濮?, 'success');
      
      // 瀵ゆ儼绻滅捄瀹犳祮閸掔増鏁禒姗€銆夐棃?      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/order/pay?orderId=${orderId}`
        });
      }, 1500);
    } catch (err) {
      showToast(err.message || '鐠併垹宕熼崚娑樼紦婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, 'none');
    } finally {
      this.setData({
        submitting: false
      });
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 濡偓閺屻儲妲搁崥锔跨矤閸︽澘娼冮柅澶嬪妞ょ敻娼版潻鏂挎礀
    const pages = getCurrentPages();
    if (pages.length > 1) {
      // 閼惧嘲褰囨稉濠佺娑擃亪銆夐棃銏㈡畱閺佺増宓?      const prevPage = pages[pages.length - 2];
      
      // 濡偓閺屻儲妲搁崥锕傗偓澶嬪娴滃棗婀撮崸鈧?      if (prevPage && prevPage.data.selectedAddressId) {
        // 婵″倹鐏夐張澶愨偓澶夎厬閻ㄥ嫬婀撮崸鈧琁D閿涘苯鍨懢宄板絿閸︽澘娼冪拠锔藉剰
        this.loadAddressDetail(prevPage.data.selectedAddressId);
        // 濞撳懘娅庢稉濠佺妞ょ數娈戦柅澶嬪閻樿埖鈧?        delete prevPage.data.selectedAddressId;
      }
    }
    
    // 娴ｈ法鏁ゆ禍瀣╂闁岸浜鹃幒銉︽暪娴兼ɑ鍎崚鎼佲偓澶嬪缂佹挻鐏?    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('selectCoupon', (data) => {
        if (data && data.coupon) {
          // 鐠佸墽鐤嗛柅澶夎厬閻ㄥ嫪绱幆鐘插煖
          this.setData({
            coupon: data.coupon
          });
          // 闁插秵鏌婄拋锛勭暬娴犻攱鐗?          this.calculatePrice();
          // 鐠佹澘缍嶆导妯诲劕閸掓悂鈧瀚ㄩ幋鎰娴滃娆?          if (app.analyticsService) {
            app.analyticsService.track('coupon_selected', {
              coupon_id: data.coupon.id,
              coupon_name: data.coupon.name
            });
          }
        } else if (data && data.clearCoupon) {
          // 濞撳懐鈹栨导妯诲劕閸?          this.setData({
            coupon: null
          });
          // 闁插秵鏌婄拋锛勭暬娴犻攱鐗?          this.calculatePrice();
          // 鐠佹澘缍嶉崣鏍ㄧХ娴兼ɑ鍎崚闀愮皑娴?          if (app.analyticsService) {
            app.analyticsService.track('coupon_cleared');
          }
        }
      });
    }
  },
  
  /**
   * 閸旂姾娴囬崷鏉挎絻鐠囷附鍎?   */
  async loadAddressDetail(addressId) {
    try {
      const address = await app.services.address.getAddressDetail(addressId);
      this.setData({
        selectedAddress: address
      });
    } catch (err) {
      console.error('閸旂姾娴囬崷鏉挎絻鐠囷附鍎忔径杈Е', err);
    }
  }
});\n