/**
 * 文件名: result.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 鏀粯缁撴灉椤甸潰
 */

const paymentService = require('../../../services/paymentService');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    orderId: '',
    paymentStatus: '', // success, failed, cancelled
    orderData: null,
    paymentInfo: null,
    loading: true,
    countdown: 5,
    countdownTimer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad(options) {
    const { orderId, status } = options;
    
    if (orderId && status) {
      this.setData({ 
        orderId,
        paymentStatus: status
      });
      
      this.loadPaymentResult(orderId, status);
      this.startCountdown();
    } else {
      wx.showToast({
        title: '鍙傛暟閿欒',
        icon: 'none'
      });
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  /**
   * 鍔犺浇鏀粯缁撴灉
   */
  async loadPaymentResult(orderId, status) {
    try {
      this.setData({ loading: true });
      
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勬敮浠樼粨鏋淎PI
      // const result = await paymentService.getPaymentResult(orderId);
      
      // 妯℃嫙鏁版嵁
      setTimeout(() => {
        const orderData = {
          id: orderId,
          orderNo: `ORD${Date.now()}`,
          status: status === 'success' ? 'paid' : 'pending_payment',
          totalAmount: 299.00,
          discountAmount: 20.00,
          actualAmount: 279.00,
          items: [
            {
              id: '1',
              name: '楂樺搧璐ㄦ棤绾胯摑鐗欒€虫満',
              image: '/images/product/headphone.jpg',
              price: 299.00,
              quantity: 1,
              specs: '榛戣壊'
            }
          ],
          address: {
            id: '1',
            name: '寮犱笁',
            phone: '13800138000',
            address: '鍖椾含甯傛湞闃冲尯鏌愭煇琛楅亾鏌愭煇灏忓尯1鍙锋ゼ1鍗曞厓101瀹?
          },
          createTime: new Date().toISOString()
        };
        
        const paymentInfo = {
          paymentMethod: 'wechat',
          paymentTime: new Date().toISOString(),
          transactionId: `TXN${Date.now()}`
        };
        
        this.setData({
          orderData,
          paymentInfo,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('鍔犺浇鏀粯缁撴灉澶辫触:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '鍔犺浇鏀粯缁撴灉澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 寮€濮嬪€掕鏃?   */
  startCountdown() {
    let countdown = 5; // 5绉掑悗鑷姩璺宠浆
    
    this.setData({ countdown });
    
    const countdownTimer = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        this.setData({ 
          countdown: 0,
          countdownTimer: null 
        });
        
        // 鏍规嵁鏀粯鐘舵€佽烦杞埌涓嶅悓椤甸潰
        if (this.data.paymentStatus === 'success') {
          this.goToOrderDetail();
        } else {
          this.goToOrderList();
        }
        return;
      }
      
      this.setData({ countdown });
    }, 1000);
    
    this.setData({ countdownTimer });
  },

  /**
   * 鏌ョ湅订单璇︽儏
   */
  goToOrderDetail() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.redirectTo({
      url: `/pages/order/detail/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 杩斿洖订单鍒楄〃
   */
  goToOrderList() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.switchTab({
      url: '/pages/user/order/list/list'
    });
  },

  /**
   * 杩斿洖棣栭〉
   */
  goToHome() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 缁х画璐墿
   */
  continueShopping() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.switchTab({
      url: '/pages/category/category'
    });
  },

  /**
   * 閲嶆柊鏀粯
   */
  retryPayment() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.redirectTo({
      url: `/pages/payment/pay/pay?orderId=${this.data.orderId}`
    });
  },

  /**
   * 鑱旂郴瀹㈡湇
   */
  contactService() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.navigateTo({
      url: '/pages/service/chat/chat'
    });
  },

  /**
   * 鍒嗕韩鏀粯缁撴灉
   */
  onShareAppMessage() {
    return {
      title: this.data.paymentStatus === 'success' ? 
        '鎴戝垰瀹屾垚浜嗕竴绗旇鍗曪紝鍟嗗搧璐ㄩ噺寰堟锛? : 
        '鏀粯閬囧埌闂锛岄渶瑕佸府鍔?,
      path: `/pages/payment/result/result?orderId=${this.data.orderId}&status=${this.data.paymentStatus}`,
      imageUrl: '/images/share/payment-result.jpg'
    };
  },

  /**
   * 鍒嗕韩鍒版湅鍙嬪湀
   */
  onShareTimeline() {
    return {
      title: this.data.paymentStatus === 'success' ? 
        '鎴戝垰瀹屾垚浜嗕竴绗旇鍗曪紝鍟嗗搧璐ㄩ噺寰堟锛? : 
        '鏀粯閬囧埌闂锛岄渶瑕佸府鍔?,
      query: `orderId=${this.data.orderId}&status=${this.data.paymentStatus}`,
      imageUrl: '/images/share/payment-result.jpg'
    };
  }
});
