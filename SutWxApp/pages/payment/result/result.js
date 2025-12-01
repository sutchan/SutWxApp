/**
 * 鏂囦欢鍚? result.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鎻忚堪: 閺€顖欑帛缂佹挻鐏夋い鐢告桨
 */

const paymentService = require('../../../services/paymentService');

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
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
        title: '閸欏倹鏆熼柨娆掝嚖',
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   */
  onUnload() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  /**
   * 閸旂姾娴囬弨顖欑帛缂佹挻鐏?   */
  async loadPaymentResult(orderId, status) {
    try {
      this.setData({ loading: true });
      
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕暜娴犳绮ㄩ弸娣嶱I
      // const result = await paymentService.getPaymentResult(orderId);
      
      // 濡剝瀚欓弫鐗堝祦
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
              name: '妤傛ê鎼х拹銊︽￥缁捐儻鎽戦悧娆掆偓铏簚',
              image: '/images/product/headphone.jpg',
              price: 299.00,
              quantity: 1,
              specs: '姒涙垼澹?
            }
          ],
          address: {
            id: '1',
            name: '瀵姳绗?,
            phone: '13800138000',
            address: '閸栨ぞ鍚敮鍌涙篂闂冨啿灏弻鎰厙鐞涙浜鹃弻鎰厙鐏忓繐灏?閸欓攱銈?閸楁洖鍘?01鐎?
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
      console.error('閸旂姾娴囬弨顖欑帛缂佹挻鐏夋径杈Е:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '閸旂姾娴囬弨顖欑帛缂佹挻鐏夋径杈Е',
        icon: 'none'
      });
    }
  },

  /**
   * 瀵偓婵鈧帟顓搁弮?   */
  startCountdown() {
    let countdown = 5; // 5缁夋帒鎮楅懛顏勫З鐠哄疇娴?    
    this.setData({ countdown });
    
    const countdownTimer = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        this.setData({ 
          countdown: 0,
          countdownTimer: null 
        });
        
        // 閺嶈宓侀弨顖欑帛閻樿埖鈧浇鐑︽潪顒€鍩屾稉宥呮倱妞ょ敻娼?        if (this.data.paymentStatus === 'success') {
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
   * 閺屻儳婀呰鍗曠拠锔藉剰
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
   * 鏉╂柨娲栬鍗曢崚妤勩€?   */
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
   * 鏉╂柨娲栨＃鏍€?   */
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
   * 缂佈呯敾鐠愵厾澧?   */
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
   * 闁插秵鏌婇弨顖欑帛
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
   * 閼辨梻閮寸€广垺婀?   */
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
   * 閸掑棔闊╅弨顖欑帛缂佹挻鐏?   */
  onShareAppMessage() {
    return {
      title: this.data.paymentStatus === 'success' ? 
        '閹存垵鍨扮€瑰本鍨氭禍鍡曠缁楁棁顓归崡鏇礉閸熷棗鎼х拹銊╁櫤瀵板牊顥楅敍? : 
        '閺€顖欑帛闁洤鍩岄梻顕€顣介敍宀勬付鐟曚礁搴滈崝?,
      path: `/pages/payment/result/result?orderId=${this.data.orderId}&status=${this.data.paymentStatus}`,
      imageUrl: '/images/share/payment-result.jpg'
    };
  },

  /**
   * 閸掑棔闊╅崚鐗堟箙閸欏婀€
   */
  onShareTimeline() {
    return {
      title: this.data.paymentStatus === 'success' ? 
        '閹存垵鍨扮€瑰本鍨氭禍鍡曠缁楁棁顓归崡鏇礉閸熷棗鎼х拹銊╁櫤瀵板牊顥楅敍? : 
        '閺€顖欑帛闁洤鍩岄梻顕€顣介敍宀勬付鐟曚礁搴滈崝?,
      query: `orderId=${this.data.orderId}&status=${this.data.paymentStatus}`,
      imageUrl: '/images/share/payment-result.jpg'
    };
  }
});
