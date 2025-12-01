/**
 * 鏂囦欢鍚? detail.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 璁㈠崟鐠囷附鍎忔い鐢告桨
 */
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    orderId: null,
    orderDetail: null,
    loading: true
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad(options) {
    const { id } = options;
    this.setData({ orderId: id });
    this.loadOrderDetail(id);
  },

  /**
   * 閸旂姾娴囪鍗曠拠锔藉剰
   * @param {string} orderId - 璁㈠崟ID
   */
  loadOrderDetail(orderId) {
    this.setData({ loading: true });

    // 濡剝瀚欓弫鐗堝祦閸旂姾娴?    setTimeout(() => {
      const mockOrderDetail = {
        id: orderId,
        orderNo: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: '瀵板懍绮▎?,
        totalPrice: (Math.random() * 200 + 50).toFixed(2),
        actualPrice: (Math.random() * 180 + 40).toFixed(2),
        freight: (Math.random() * 10).toFixed(2),
        createTime: new Date().toLocaleString(),
        payTime: null,
        deliveryTime: null,
        receiveTime: null,
        address: {
          name: '瀵姳绗?,
          phone: '13800138000',
          detail: '楠炲じ绗㈤惇浣圭箒閸﹀啿绔堕崡妤€鍖楅崠铏诡潠閹垛偓閸ヮ厾顫栭崗瀵割潠鐎涳箑娲?,
        },
        items: [
          {
            name: '閸熷棗鎼',
            price: (Math.random() * 50 + 5).toFixed(2),
            quantity: Math.floor(Math.random() * 2) + 1,
            image: '/assets/images/product_placeholder.png'
          },
          {
            name: '閸熷棗鎼',
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
   * 閺€顖欑帛璁㈠崟
   */
  payOrder() {
    wx.showToast({
      title: '濡剝瀚欓弨顖欑帛閹存劕濮?,
      icon: 'success'
    });
    // 鐎圭偤妾弨顖欑帛闁槒绶?  },

  /**
   * 閸欐牗绉疯鍗?   */
  cancelOrder() {
    wx.showModal({
      title: '閸欐牗绉疯鍗?,
      content: '绾喖鐣剧憰浣稿絿濞戝牐顕氳鍗曢崥妤嬬吹',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '璁㈠崟瀹告彃褰囧☉?,
            icon: 'success'
          });
          // 鐎圭偤妾崣鏍ㄧХ闁槒绶?        }
      }
    });
  },

  /**
   * 绾喛顓婚弨鎯版彛
   */
  confirmReceipt() {
    wx.showModal({
      title: '绾喛顓婚弨鎯版彛',
      content: '绾喖鐣惧鍙夋暪閸掓媽鎻ｉ悧鈺佹偋閿?,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '閺€鎯版彛閹存劕濮?,
            icon: 'success'
          });
          // 鐎圭偤妾涵顔款吇閺€鎯版彛闁槒绶?        }
      }
    });
  }
});
