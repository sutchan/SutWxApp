锘?/ 鐠併垹宕熼崚妤勩€冩い鐢告桨JS
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    // 鐠併垹宕熼崚妤勩€冮弫鐗堝祦
    orderList: [],
    // 鐠併垹宕熼悩鑸碘偓渚€鈧銆?    statusOptions: [
      { id: 'all', name: '閸忋劑鍎? },
      { id: 'pending_payment', name: '瀵板懍绮▎? },
      { id: 'pending_shipping', name: '瀵板懎褰傜拹? },
      { id: 'pending_receipt', name: '瀵板懏鏁圭拹? },
      { id: 'completed', name: '瀹告彃鐣幋? }
    ],
    // 瑜版挸澧犻柅澶夎厬閻ㄥ嫮濮搁幀?    currentStatus: 'all',
    // 閸旂姾娴囬悩鑸碘偓?    loading: false,
    // 闁挎瑨顕ゆ穱鈩冧紖
    error: false,
    errorMsg: '',
    // 閸掑棝銆夐崣鍌涙殶
    pageNum: 1,
    pageSize: 10,
    // 閺勵垰鎯佹潻妯绘箒閺囨潙顦块弫鐗堝祦
    hasMore: true,
    // 缁岃櫣濮搁幀?    empty: false
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佸墽鐤嗛崚婵嗩潗閻樿埖鈧?    if (options.status) {
      this.setData({
        currentStatus: options.status
      });
    }
    // 閸旂姾娴囩拋銏犲礋閺佺増宓?    this.loadOrderList();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 婵″倹鐏夋い鐢告桨瀹歌尙绮￠崝鐘烘祰鏉╁洦鏆熼幑顕嗙礉閸掓瑩鍣搁弬鏉垮鏉?    if (this.data.orderList.length > 0) {
      this.loadOrderList();
    }
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    // 闁插秶鐤嗛崚鍡涖€夐崣鍌涙殶
    this.setData({
      pageNum: 1,
      hasMore: true
    });
    // 闁插秵鏌婇崝鐘烘祰閺佺増宓?    this.loadOrderList();
  },

  /**
   * 娑撳﹥濯洪崝鐘烘祰閺囨潙顦?   */
  onReachBottom: function() {
    // 婵″倹鐏夋潻妯绘箒閺囨潙顦块弫鐗堝祦閿涘苯鍨崝鐘烘祰娑撳绔存い?    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreOrderList();
    }
  },

  /**
   * 閸旂姾娴囩拋銏犲礋閸掓銆?   */
  loadOrderList: function() {
    // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?    if (!wx.getApp().isLoggedIn()) {
      this.setData({
        loading: false,
        empty: true,
        orderList: [],
        error: false
      });
      return;
    }

    // 鐠佸墽鐤嗛崝鐘烘祰閻樿埖鈧?    this.setData({
      loading: true,
      error: false
    });

    // 濡剝瀚橝PI鐠囬攱鐪?    setTimeout(() => {
      try {
        // 濡剝瀚欑拋銏犲礋閺佺増宓?        const mockOrders = this.generateMockOrders(this.data.pageNum, this.data.pageSize);
        
        // 閺囧瓨鏌婇弫鐗堝祦
        if (this.data.pageNum === 1) {
          this.setData({
            orderList: mockOrders,
            empty: mockOrders.length === 0
          });
        } else {
          this.setData({
            orderList: [...this.data.orderList, ...mockOrders]
          });
        }

        // 閸掋倖鏌囬弰顖氭儊鏉╂ɑ婀侀弴鏉戭樋閺佺増宓?        if (mockOrders.length < this.data.pageSize) {
          this.setData({
            hasMore: false
          });
        }

        // 缂佹挻娼稉瀣閸掗攱鏌?        wx.stopPullDownRefresh();
      } catch (err) {
        this.setData({
          error: true,
          errorMsg: '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸',
          empty: false
        });
        console.error('閸旂姾娴囩拋銏犲礋閸掓銆冩径杈Е:', err);
      } finally {
        this.setData({
          loading: false
        });
      }
    }, 1000);
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋鐠併垹宕熼崚妤勩€?   */
  loadMoreOrderList: function() {
    // 婢х偛濮炴い鐢电垳
    this.setData({
      pageNum: this.data.pageNum + 1
    });
    // 閸旂姾娴囬弫鐗堝祦
    this.loadOrderList();
  },

  /**
   * 閸掑洦宕茬拋銏犲礋閻樿埖鈧?   */
  onStatusChange: function(e) {
    const status = e.currentTarget.dataset.status;
    // 閺囧瓨鏌婇柅澶夎厬閻樿埖鈧?    this.setData({
      currentStatus: status,
      pageNum: 1,
      hasMore: true
    });
    // 闁插秵鏌婇崝鐘烘祰閺佺増宓?    this.loadOrderList();
  },

  /**
   * 鐠哄疇娴嗛崚鎷岊吂閸楁洝顕涢幆?   */
  onOrderTap: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    });
  },

  /**
   * 閸樼粯鏁禒?   */
  onPayOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    // 鐠哄疇娴嗛崚鐗堟暜娴犳﹢銆夐棃?    wx.navigateTo({
      url: `/pages/order/pay/pay?id=${orderId}`
    });
  },

  /**
   * 绾喛顓婚弨鎯版彛
   */
  onConfirmReceipt: function(e) {
    const orderId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
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
              // 閺囧瓨鏌婄拋銏犲礋閻樿埖鈧?              const orderList = this.data.orderList;
              orderList[index].status = 'completed';
              
              this.setData({
                orderList: orderList,
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
  onCancelOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
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
              // 閺囧瓨鏌婄拋銏犲礋閻樿埖鈧?              const orderList = this.data.orderList;
              orderList[index].status = 'cancelled';
              
              this.setData({
                orderList: orderList,
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
   * 閸樻槒鐦庢禒?   */
  onReviewOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    // 鐠哄疇娴嗛崚鎷岀槑娴犵兘銆夐棃?    wx.navigateTo({
      url: `/pages/order/review/review?id=${orderId}`
    });
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    this.loadOrderList();
  },

  /**
   * 閸樿崵娅ヨぐ?   */
  onLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 濡剝瀚欓悽鐔稿灇鐠併垹宕熼弫鐗堝祦
   */
  generateMockOrders: function(pageNum, pageSize) {
    const orders = [];
    // 閺嶈宓佽ぐ鎾冲閻樿埖鈧浇绻冨銈嗘殶閹?    const status = this.data.currentStatus;
    
    // 閻㈢喐鍨氬Ο鈩冨珯閺佺増宓?    for (let i = 0; i < pageSize; i++) {
      const index = (pageNum - 1) * pageSize + i;
      
      // 閸欘亞鏁撻幋?0閺夆剝鏆熼幑顕嗙礉濡剝瀚欓崚鍡涖€夐弫鍫熺亯
      if (index >= 20) break;
      
      // 闂呭繑婧€閻樿埖鈧?      const statuses = ['pending_payment', 'pending_shipping', 'pending_receipt', 'completed'];
      let orderStatus;
      
      if (status === 'all') {
        orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
      } else {
        orderStatus = status;
      }
      
      // 閻㈢喐鍨氶崯鍡楁惂閸掓銆?      const productCount = Math.floor(Math.random() * 3) + 1;
      const products = [];
      let totalPrice = 0;
      
      for (let j = 0; j < productCount; j++) {
        const price = Math.floor(Math.random() * 900) + 100;
        const quantity = Math.floor(Math.random() * 5) + 1;
        totalPrice += price * quantity;
        
        products.push({
          id: `product_${index}_${j}`,
          title: `濡剝瀚欓崯鍡楁惂${index + 1}-${j + 1}`,
          image: '/images/default-post.svg',
          price: price,
          quantity: quantity
        });
      }
      
      orders.push({
        id: `order_${index}`,
        orderNo: `20240${index + 1}`,
        status: orderStatus,
        statusText: this.getStatusText(orderStatus),
        createTime: new Date().toLocaleString(),
        products: products,
        totalPrice: totalPrice,
        totalCount: productCount
      });
    }
    
    return orders;
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