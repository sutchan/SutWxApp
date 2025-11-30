/**
 * 文件名: detail.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 璁㈠崟璇︽儏椤甸潰
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    orderId: null,
    orderDetail: null,
    loading: true
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad(options) {
    const { id } = options;
    this.setData({ orderId: id });
    this.loadOrderDetail(id);
  },

  /**
   * 鍔犺浇璁㈠崟璇︽儏
   * @param {string} orderId - 璁㈠崟ID
   */
  loadOrderDetail(orderId) {
    this.setData({ loading: true });

    // 妯℃嫙鏁版嵁鍔犺浇
    setTimeout(() => {
      const mockOrderDetail = {
        id: orderId,
        orderNo: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: '寰呬粯娆?,
        totalPrice: (Math.random() * 200 + 50).toFixed(2),
        actualPrice: (Math.random() * 180 + 40).toFixed(2),
        freight: (Math.random() * 10).toFixed(2),
        createTime: new Date().toLocaleString(),
        payTime: null,
        deliveryTime: null,
        receiveTime: null,
        address: {
          name: '寮犱笁',
          phone: '13800138000',
          detail: '骞夸笢鐪佹繁鍦冲競鍗楀北鍖虹鎶€鍥鍏寸瀛﹀洯',
        },
        items: [
          {
            name: '鍟嗗搧A',
            price: (Math.random() * 50 + 5).toFixed(2),
            quantity: Math.floor(Math.random() * 2) + 1,
            image: '/assets/images/product_placeholder.png'
          },
          {
            name: '鍟嗗搧B',
            price: (Math.random() * 30 + 5).toFixed(2),
            quantity: Math.floor(Math.random() * 3) + 1,
            image: '/assets/images/product_placeholder.png'
          }
        ]
      };

      this.setData({
        orderDetail: mockOrderDetail,
        loading: false
      });
    }, 1000);
  },

  /**
   * 鏀粯璁㈠崟
   */
  payOrder() {
    wx.showToast({
      title: '妯℃嫙鏀粯鎴愬姛',
      icon: 'success'
    });
    // 瀹為檯鏀粯閫昏緫
  },

  /**
   * 鍙栨秷璁㈠崟
   */
  cancelOrder() {
    wx.showModal({
      title: '鍙栨秷璁㈠崟',
      content: '纭畾瑕佸彇娑堣璁㈠崟鍚楋紵',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '璁㈠崟宸插彇娑?,
            icon: 'success'
          });
          // 瀹為檯鍙栨秷閫昏緫
        }
      }
    });
  },

  /**
   * 纭鏀惰揣
   */
  confirmReceipt() {
    wx.showModal({
      title: '纭鏀惰揣',
      content: '纭畾宸叉敹鍒拌揣鐗╁悧锛?,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '鏀惰揣鎴愬姛',
            icon: 'success'
          });
          // 瀹為檯纭鏀惰揣閫昏緫
        }
      }
    });
  }
});