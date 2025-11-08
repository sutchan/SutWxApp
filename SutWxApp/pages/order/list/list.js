// 璁㈠崟鍒楄〃椤甸潰JS
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    // 璁㈠崟鍒楄〃鏁版嵁
    orderList: [],
    // 璁㈠崟鐘舵€侀€夐」
    statusOptions: [
      { id: 'all', name: '鍏ㄩ儴' },
      { id: 'pending_payment', name: '寰呬粯娆? },
      { id: 'pending_shipping', name: '寰呭彂璐? },
      { id: 'pending_receipt', name: '寰呮敹璐? },
      { id: 'completed', name: '宸插畬鎴? }
    ],
    // 褰撳墠閫変腑鐨勭姸鎬?    currentStatus: 'all',
    // 鍔犺浇鐘舵€?    loading: false,
    // 閿欒淇℃伅
    error: false,
    errorMsg: '',
    // 鍒嗛〉鍙傛暟
    pageNum: 1,
    pageSize: 10,
    // 鏄惁杩樻湁鏇村鏁版嵁
    hasMore: true,
    // 绌虹姸鎬?    empty: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁剧疆鍒濆鐘舵€?    if (options.status) {
      this.setData({
        currentStatus: options.status
      });
    }
    // 鍔犺浇璁㈠崟鏁版嵁
    this.loadOrderList();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 濡傛灉椤甸潰宸茬粡鍔犺浇杩囨暟鎹紝鍒欓噸鏂板姞杞?    if (this.data.orderList.length > 0) {
      this.loadOrderList();
    }
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    // 閲嶇疆鍒嗛〉鍙傛暟
    this.setData({
      pageNum: 1,
      hasMore: true
    });
    // 閲嶆柊鍔犺浇鏁版嵁
    this.loadOrderList();
  },

  /**
   * 涓婃媺鍔犺浇鏇村
   */
  onReachBottom: function() {
    // 濡傛灉杩樻湁鏇村鏁版嵁锛屽垯鍔犺浇涓嬩竴椤?    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreOrderList();
    }
  },

  /**
   * 鍔犺浇璁㈠崟鍒楄〃
   */
  loadOrderList: function() {
    // 妫€鏌ョ櫥褰曠姸鎬?    if (!wx.getApp().isLoggedIn()) {
      this.setData({
        loading: false,
        empty: true,
        orderList: [],
        error: false
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
        // 妯℃嫙璁㈠崟鏁版嵁
        const mockOrders = this.generateMockOrders(this.data.pageNum, this.data.pageSize);
        
        // 鏇存柊鏁版嵁
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

        // 鍒ゆ柇鏄惁杩樻湁鏇村鏁版嵁
        if (mockOrders.length < this.data.pageSize) {
          this.setData({
            hasMore: false
          });
        }

        // 缁撴潫涓嬫媺鍒锋柊
        wx.stopPullDownRefresh();
      } catch (err) {
        this.setData({
          error: true,
          errorMsg: '鍔犺浇澶辫触锛岃閲嶈瘯',
          empty: false
        });
        console.error('鍔犺浇璁㈠崟鍒楄〃澶辫触:', err);
      } finally {
        this.setData({
          loading: false
        });
      }
    }, 1000);
  },

  /**
   * 鍔犺浇鏇村璁㈠崟鍒楄〃
   */
  loadMoreOrderList: function() {
    // 澧炲姞椤电爜
    this.setData({
      pageNum: this.data.pageNum + 1
    });
    // 鍔犺浇鏁版嵁
    this.loadOrderList();
  },

  /**
   * 鍒囨崲璁㈠崟鐘舵€?   */
  onStatusChange: function(e) {
    const status = e.currentTarget.dataset.status;
    // 鏇存柊閫変腑鐘舵€?    this.setData({
      currentStatus: status,
      pageNum: 1,
      hasMore: true
    });
    // 閲嶆柊鍔犺浇鏁版嵁
    this.loadOrderList();
  },

  /**
   * 璺宠浆鍒拌鍗曡鎯?   */
  onOrderTap: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    });
  },

  /**
   * 鍘绘敮浠?   */
  onPayOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    // 璺宠浆鍒版敮浠橀〉闈?    wx.navigateTo({
      url: `/pages/order/pay/pay?id=${orderId}`
    });
  },

  /**
   * 纭鏀惰揣
   */
  onConfirmReceipt: function(e) {
    const orderId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
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
              // 鏇存柊璁㈠崟鐘舵€?              const orderList = this.data.orderList;
              orderList[index].status = 'completed';
              
              this.setData({
                orderList: orderList,
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
  onCancelOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    
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
              // 鏇存柊璁㈠崟鐘舵€?              const orderList = this.data.orderList;
              orderList[index].status = 'cancelled';
              
              this.setData({
                orderList: orderList,
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
   * 鍘昏瘎浠?   */
  onReviewOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    // 璺宠浆鍒拌瘎浠烽〉闈?    wx.navigateTo({
      url: `/pages/order/review/review?id=${orderId}`
    });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    this.loadOrderList();
  },

  /**
   * 鍘荤櫥褰?   */
  onLogin: function() {
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 妯℃嫙鐢熸垚璁㈠崟鏁版嵁
   */
  generateMockOrders: function(pageNum, pageSize) {
    const orders = [];
    // 鏍规嵁褰撳墠鐘舵€佽繃婊ゆ暟鎹?    const status = this.data.currentStatus;
    
    // 鐢熸垚妯℃嫙鏁版嵁
    for (let i = 0; i < pageSize; i++) {
      const index = (pageNum - 1) * pageSize + i;
      
      // 鍙敓鎴?0鏉℃暟鎹紝妯℃嫙鍒嗛〉鏁堟灉
      if (index >= 20) break;
      
      // 闅忔満鐘舵€?      const statuses = ['pending_payment', 'pending_shipping', 'pending_receipt', 'completed'];
      let orderStatus;
      
      if (status === 'all') {
        orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
      } else {
        orderStatus = status;
      }
      
      // 鐢熸垚鍟嗗搧鍒楄〃
      const productCount = Math.floor(Math.random() * 3) + 1;
      const products = [];
      let totalPrice = 0;
      
      for (let j = 0; j < productCount; j++) {
        const price = Math.floor(Math.random() * 900) + 100;
        const quantity = Math.floor(Math.random() * 5) + 1;
        totalPrice += price * quantity;
        
        products.push({
          id: `product_${index}_${j}`,
          title: `妯℃嫙鍟嗗搧${index + 1}-${j + 1}`,
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