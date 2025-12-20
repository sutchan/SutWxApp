/**
 * 文件名 pay.js
 * 版本号 1.0.0
 * 更新日期: 2025-12-04
 * 描述: 閺€顖欑帛妞ょ敻娼? */

const paymentService = require('../../services/paymentService');
const userService = require('../../services/userService');

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    orderId: '',
    orderData: null,
    paymentMethods: [],
    selectedPaymentMethod: null,
    loading: true,
    submitting: false,
    countdown: 0,
    countdownTimer: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad(options) {
    const { orderId } = options;
    if (orderId) {
      this.setData({ orderId });
      this.loadOrderDetail(orderId);
      this.loadPaymentMethods();
      this.startCountdown();
    } else {
      wx.showToast({
        title: '璁㈠崟娣団剝浼呴柨娆掝嚖',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
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
   * 閸旂姾娴囪鍗曠拠锔藉剰
   */
  async loadOrderDetail(orderId) {
    try {
      this.setData({ loading: true });
      
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕吂閸楁洝顕涢幆鍖扨I
      // const orderData = await orderService.getOrderDetail(orderId);
      
      // 濡剝瀚欓弫鐗堝祦
      setTimeout(() => {
        const orderData = {
          id: orderId,
          orderNo: `ORD${Date.now()}`,
          status: 'pending_payment',
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
        
        this.setData({
          orderData,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('閸旂姾娴囪鍗曠拠锔藉剰婢惰精瑙?', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '閸旂姾娴囪鍗曟穱鈩冧紖婢惰精瑙?,
        icon: 'none'
      });
    }
  },

  /**
   * 閸旂姾娴囨敮浠樻柟寮?   */
  async loadPaymentMethods() {
    try {
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕暜娴犳ɑ鏌熷寤嘝I
      // const paymentMethods = await paymentService.getPaymentMethods();
      
      // 濡剝瀚欓弫鐗堝祦
      setTimeout(() => {
        const paymentMethods = [
          {
            id: 'wechat',
            name: '瀵邦喕淇婇弨顖欑帛',
            icon: '/images/payment/wechat.png',
            description: '閹恒劏宕樻担璺ㄦ暏瀵邦喕淇婇弨顖欑帛閿涘苯鐣ㄩ崗銊ょ┒閹?,
            enabled: true
          },
          {
            id: 'alipay',
            name: '閺€顖欑帛鐎?,
            icon: '/images/payment/alipay.png',
            description: '娴ｈ法鏁ら弨顖欑帛鐎规繀缍戞０婵囧灗閼哄崬鎲查弨顖欑帛',
            enabled: true
          },
          {
            id: 'balance',
            name: '娴ｆ瑩顤傞弨顖欑帛',
            icon: '/images/payment/balance.png',
            description: '娴ｈ法鏁ょ拹锔藉煕娴ｆ瑩顤傞弨顖欑帛',
            enabled: true,
            balance: 150.50
          }
        ];
        
        // 姒涙顓婚柅澶嬪瀵邦喕淇婇弨顖欑帛
        const selectedPaymentMethod = paymentMethods.find(method => method.enabled);
        
        this.setData({
          paymentMethods,
          selectedPaymentMethod
        });
      }, 500);
      
    } catch (error) {
      console.error('閸旂姾娴囨敮浠樻柟寮忔径杈Е:', error);
      wx.showToast({
        title: '閸旂姾娴囨敮浠樻柟寮忔径杈Е',
        icon: 'none'
      });
    }
  },

  /**
   * 瀵偓婵鈧帟顓搁弮?   */
  startCountdown() {
    // 鐠佸墽鐤嗚鍗曢弨顖欑帛閸婃帟顓搁弮鏈佃礋15閸掑棝鎸?    let countdown = 15 * 60; // 15閸掑棝鎸撻敍灞藉礋娴ｅ稄绱扮粔?    
    this.setData({ countdown });
    
    const countdownTimer = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        this.setData({ 
          countdown: 0,
          countdownTimer: null 
        });
        
        wx.showModal({
          title: '閺€顖欑帛鐡掑懏妞?,
          content: '璁㈠崟閺€顖欑帛瀹歌尪绉撮弮璁圭礉璁㈠崟瀹歌尪鍤滈崝銊ュ絿濞?,
          showCancel: false,
          success: () => {
            wx.redirectTo({
              url: `/pages/order/detail/detail?id=${this.data.orderId}`
            });
          }
        });
        return;
      }
      
      this.setData({ countdown });
    }, 1000);
    
    this.setData({ countdownTimer });
  },

  /**
   * 閺嶇厧绱￠崠鏍р偓鎺曨吀閺?   */
  formatCountdown(countdown) {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * 闁瀚ㄦ敮浠樻柟寮?   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    this.setData({
      selectedPaymentMethod: method
    });
  },

  /**
   * 閹绘劒姘﹂弨顖欑帛
   */
  async submitPayment() {
    if (!this.data.selectedPaymentMethod) {
      wx.showToast({
        title: '鐠囩兘鈧瀚ㄦ敮浠樻柟寮?,
        icon: 'none'
      });
      return;
    }

    // 濡偓閺屻儰缍戞０婵囨Ц閸氾箒鍐绘径?    if (this.data.selectedPaymentMethod.id === 'balance' && 
        this.data.selectedPaymentMethod.balance < this.data.orderData.actualAmount) {
      wx.showToast({
        title: '娴ｆ瑩顤傛稉宥堝喕閿涘矁顕柅澶嬪閸忔湹绮敮浠樻柟寮?,
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ submitting: true });
      
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕暜娴犳アPI
      // const result = await paymentService.createPayment({
      //   orderId: this.data.orderId,
      //   paymentMethod: this.data.selectedPaymentMethod.id
      // });
      
      // 濡剝瀚欓弨顖欑帛鏉╁洨鈻?      setTimeout(() => {
        this.setData({ submitting: false });
        
        // 閺嶈宓佹稉宥呮倱鏀粯鏂瑰紡婢跺嫮鎮?        if (this.data.selectedPaymentMethod.id === 'wechat') {
          this.processWechatPay();
        } else if (this.data.selectedPaymentMethod.id === 'alipay') {
          this.processAlipay();
        } else if (this.data.selectedPaymentMethod.id === 'balance') {
          this.processBalancePay();
        }
      }, 1000);
      
    } catch (error) {
      console.error('閺€顖欑帛婢惰精瑙?', error);
      this.setData({ submitting: false });
      wx.showToast({
        title: '閺€顖欑帛婢惰精瑙﹂敍宀冾嚞闁插秷鐦?,
        icon: 'none'
      });
    }
  },

  /**
   * 婢跺嫮鎮婂顔讳繆閺€顖欑帛
   */
  processWechatPay() {
    // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ゅ顔讳繆閺€顖欑帛API
    wx.showLoading({ title: '鐠嬪啳鎹ｉ弨顖欑帛...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 濡剝瀚欓弨顖欑帛閹存劕濮?      this.onPaymentSuccess();
    }, 1500);
  },

  /**
   * 婢跺嫮鎮婇弨顖欑帛鐎规繃鏁禒?   */
  processAlipay() {
    // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ら弨顖欑帛鐎规繃鏁禒妤I
    wx.showLoading({ title: '鐠嬪啳鎹ｉ弨顖欑帛...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 濡剝瀚欓弨顖欑帛閹存劕濮?      this.onPaymentSuccess();
    }, 1500);
  },

  /**
   * 婢跺嫮鎮婃担娆擃杺閺€顖欑帛
   */
  async processBalancePay() {
    try {
      wx.showLoading({ title: '閺€顖欑帛娑?..' });
      
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ゆ担娆擃杺閺€顖欑帛API
      // const result = await paymentService.balancePayment({
      //   orderId: this.data.orderId,
      //   amount: this.data.orderData.actualAmount
      // });
      
      setTimeout(() => {
        wx.hideLoading();
        
        // 濡剝瀚欓弨顖欑帛閹存劕濮?        this.onPaymentSuccess();
      }, 1000);
      
    } catch (error) {
      console.error('娴ｆ瑩顤傞弨顖欑帛婢惰精瑙?', error);
      wx.hideLoading();
      wx.showToast({
        title: '閺€顖欑帛婢惰精瑙﹂敍宀冾嚞闁插秷鐦?,
        icon: 'none'
      });
    }
  },

  /**
   * 閺€顖欑帛閹存劕濮涙径鍕倞
   */
  onPaymentSuccess() {
    wx.showToast({
      title: '閺€顖欑帛閹存劕濮?,
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 閸欐牗绉烽弨顖欑帛
   */
  cancelPayment() {
    wx.showModal({
      title: '閸欐牗绉烽弨顖欑帛',
      content: '绾喖鐣剧憰浣稿絿濞戝牊鏁禒妯烘偋閿?,
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 閺屻儳婀呰鍗曠拠锔藉剰
   */
  viewOrderDetail() {
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 閼辨梻閮寸€广垺婀?   */
  contactService() {
    wx.navigateTo({
      url: '/pages/service/chat/chat'
    });
  }
});
