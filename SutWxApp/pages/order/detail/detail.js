锘?/ 鐠併垹宕熺拠锔藉剰妞ょ敻娼癑S
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    // 鐠併垹宕熺拠锔藉剰閺佺増宓?    orderDetail: null,
    // 閸旂姾娴囬悩鑸碘偓?    loading: false,
    // 闁挎瑨顕ゆ穱鈩冧紖
    error: false,
    errorMsg: '',
    // 閸︽澘娼冩穱鈩冧紖
    address: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 閼惧嘲褰囩拋銏犲礋ID
    this.orderId = options.id || '';
    // 閸旂姾娴囩拋銏犲礋鐠囷附鍎?    this.loadOrderDetail();
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    // 闁插秵鏌婇崝鐘烘祰閺佺増宓?    this.loadOrderDetail();
  },

  /**
   * 閸旂姾娴囩拋銏犲礋鐠囷附鍎?   */
  loadOrderDetail: function() {
    // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?    if (!wx.getApp().isLoggedIn()) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '鐠囧嘲鍘涢惂璇茬秿',
        orderDetail: null
      });
      return;
    }

    // 鐠佸墽鐤嗛崝鐘烘祰閻樿埖鈧?    this.setData({
      loading: true,
      error: false
    });

    // 濡剝瀚橝PI鐠囬攱鐪?    setTimeout(() => {
      try {
        // 濡剝瀚欑拋銏犲礋鐠囷附鍎忛弫鐗堝祦
        const orderDetail = this.generateMockOrderDetail();
        // 濡剝瀚欓崷鏉挎絻閺佺増宓?        const address = this.generateMockAddress();
        
        this.setData({
          orderDetail: orderDetail,
          address: address
        });

        // 缂佹挻娼稉瀣閸掗攱鏌?        wx.stopPullDownRefresh();
      } catch (err) {
        this.setData({
          error: true,
          errorMsg: '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸',
          orderDetail: null
        });
        console.error('閸旂姾娴囩拋銏犲礋鐠囷附鍎忔径杈Е:', err);
      } finally {
        this.setData({
          loading: false
        });
      }
    }, 1000);
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆?   */
  onProductTap: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${productId}`
    });
  },

  /**
   * 閸樼粯鏁禒?   */
  onPayOrder: function() {
    // 鐠哄疇娴嗛崚鐗堟暜娴犳﹢銆夐棃?    wx.navigateTo({
      url: `/pages/order/pay/pay?id=${this.orderId}`
    });
  },

  /**
   * 绾喛顓婚弨鎯版彛
   */
  onConfirmReceipt: function() {
    // 瀵懓鍤涵顔款吇濡?    wx.showModal({
      title: '绾喛顓婚弨鎯版彛',
      content: '绾喛顓诲鍙夋暪閸掓澘鏅㈤崫浣告偋閿?,
      success: (res) => {
        if (res.confirm) {
          // 濡剝瀚橝PI鐠嬪啰鏁?          this.setData({
            loading: true
          });
          
          setTimeout(() => {
            try {
              // 閺囧瓨鏌婄拋銏犲礋閻樿埖鈧?              const orderDetail = this.data.orderDetail;
              orderDetail.status = 'completed';
              orderDetail.statusText = '瀹告彃鐣幋?;
              
              this.setData({
                orderDetail: orderDetail,
                loading: false
              });
              
              wx.showToast({
                title: '閺€鎯版彛閹存劕濮?,
                icon: 'success'
              });
            } catch (err) {
              this.setData({
                loading: false
              });
              wx.showToast({
                title: '閹垮秳缍旀径杈Е閿涘矁顕柌宥堢槸',
                icon: 'none'
              });
              console.error('绾喛顓婚弨鎯版彛婢惰精瑙?', err);
            }
          }, 1000);
        }
      }
    });
  },

  /**
   * 閸欐牗绉风拋銏犲礋
   */
  onCancelOrder: function() {
    // 瀵懓鍤涵顔款吇濡?    wx.showModal({
      title: '閸欐牗绉风拋銏犲礋',
      content: '绾喖鐣剧憰浣稿絿濞戝牐顕氱拋銏犲礋閸氭绱?,
      success: (res) => {
        if (res.confirm) {
          // 濡剝瀚橝PI鐠嬪啰鏁?          this.setData({
            loading: true
          });
          
          setTimeout(() => {
            try {
              // 閺囧瓨鏌婄拋銏犲礋閻樿埖鈧?              const orderDetail = this.data.orderDetail;
              orderDetail.status = 'cancelled';
              orderDetail.statusText = '瀹告彃褰囧☉?;
              
              this.setData({
                orderDetail: orderDetail,
                loading: false
              });
              
              wx.showToast({
                title: '閸欐牗绉烽幋鎰',
                icon: 'success'
              });
            } catch (err) {
              this.setData({
                loading: false
              });
              wx.showToast({
                title: '閹垮秳缍旀径杈Е閿涘矁顕柌宥堢槸',
                icon: 'none'
              });
              console.error('閸欐牗绉风拋銏犲礋婢惰精瑙?', err);
            }
          }, 1000);
        }
      }
    });
  },

  /**
   * 閼辨梻閮寸€广垺婀?   */
  onContactService: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      success: () => {
        console.log('閹枫劍澧︾€广垺婀囬悽浣冪樈閹存劕濮?);
      },
      fail: (err) => {
        console.error('閹枫劍澧︾€广垺婀囬悽浣冪樈婢惰精瑙?', err);
        wx.showToast({
          title: '閹枫劍澧︽径杈Е閿涘矁顕柌宥堢槸',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 閸樻槒鐦庢禒?   */
  onReviewOrder: function() {
    // 鐠哄疇娴嗛崚鎷岀槑娴犵兘銆夐棃?    wx.navigateTo({
      url: `/pages/order/review/review?id=${this.orderId}`
    });
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    this.loadOrderDetail();
  },

  /**
   * 閸樿崵娅ヨぐ?   */
  onLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 濡剝瀚欓悽鐔稿灇鐠併垹宕熺拠锔藉剰閺佺増宓?   */
  generateMockOrderDetail: function() {
    // 闂呭繑婧€閻樿埖鈧?    const statuses = ['pending_payment', 'pending_shipping', 'pending_receipt', 'completed'];
    const orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // 閻㈢喐鍨氶崯鍡楁惂閸掓銆?    const productCount = Math.floor(Math.random() * 3) + 1;
    const products = [];
    let totalPrice = 0;
    
    for (let i = 0; i < productCount; i++) {
      const price = Math.floor(Math.random() * 900) + 100;
      const quantity = Math.floor(Math.random() * 5) + 1;
      totalPrice += price * quantity;
      
      products.push({
        id: `product_${i}`,
        title: `濡剝瀚欓崯鍡楁惂${i + 1}`,
        image: '/images/default-post.svg',
        price: price,
        quantity: quantity
      });
    }
    
    // 鐠侊紕鐣婚幀璁崇幆閿涘牆瀵橀崥顐ョ箥鐠愮懓鎷版导妯诲劕閸掗潻绱?    const freight = 10;
    // 闂呭繑婧€閸愬啿鐣鹃弰顖氭儊娴ｈ法鏁ゆ导妯诲劕閸掗潻绱?0%濮掑倻宸兼担璺ㄦ暏閿?    const useCoupon = Math.random() < 0.7;
    let couponDiscount = 0;
    let couponInfo = null;
    
    if (useCoupon && totalPrice >= 50) {
      // 娴兼ɑ鍎崚鍝ヨ閸ㄥ绱?0%濮掑倻宸兼稉铏瑰箛闁叉垵鍩滈敍?0%濮掑倻宸兼稉鐑樺閹碉絽鍩?      const couponType = Math.random() < 0.5 ? 'cash' : 'percent';
      
      if (couponType === 'cash') {
        // 閻滀即鍣鹃崚闈╃窗10-30閸忓啩绠ｉ梻瀵告畱娴兼ɑ鍎柌鎴︻杺
        couponDiscount = Math.floor(Math.random() * 21) + 10;
        couponInfo = {
          id: 'coupon_cash_' + Math.floor(Math.random() * 1000),
          name: '濠?0閸? + couponDiscount + '閸?,
          value: couponDiscount,
          type: 'cash'
        };
      } else {
        // 閹舵ɑ澧搁崚闈╃窗8閹舵ɑ鍨?閹?        const discountRate = Math.random() < 0.5 ? 8 : 9;
        couponDiscount = Math.floor(totalPrice * (1 - discountRate / 10));
        couponInfo = {
          id: 'coupon_percent_' + Math.floor(Math.random() * 1000),
          name: discountRate + '閹舵ü绱幆鐘插煖',
          value: discountRate * 10, // 鐎涙ê鍋嶆稉?0鐞涖劎銇?閹?          type: 'percent'
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
      paymentMethod: orderStatus !== 'pending_payment' ? '瀵邦喕淇婇弨顖欑帛' : '',
      orderRemark: '鐠囧嘲鏁栬箛顐㈠絺鐠?,
      trackingNo: ['pending_receipt', 'completed'].includes(orderStatus) ? `SF1234567890${Math.floor(Math.random() * 100)}` : ''
    };
  },

  /**
   * 濡剝瀚欓悽鐔稿灇閸︽澘娼冮弫鐗堝祦
   */
  generateMockAddress: function() {
    return {
      receiver: '瀵姳绗?,
      phone: '138****8888',
      province: '楠炲じ绗㈤惇?,
      city: '濞ｅ崬婀风敮?,
      district: '閸楁鍖楅崠?,
      detail: '缁夋垶濡ч崶顓炲础閸?閺?
    };
  },

  /**
   * 閼惧嘲褰囩拋銏犲礋閻樿埖鈧焦鏋冮張?   */
  getStatusText: function(status) {
    const statusMap = {
      'pending_payment': '瀵板懍绮▎?,
      'pending_shipping': '瀵板懎褰傜拹?,
      'pending_receipt': '瀵板懏鏁圭拹?,
      'completed': '瀹告彃鐣幋?,
      'cancelled': '瀹告彃褰囧☉?
    };
    return statusMap[status] || '閺堫亞鐓?;
  }
});\n