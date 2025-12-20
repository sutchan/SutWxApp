/**
 * 文件名 methods.js
 * 版本号 1.0.0
 * 更新日期: 2025-12-04
 * 描述: 鏀粯鏂瑰紡闁瀚ㄦい鐢告桨
 */

const paymentService = require('../../../services/paymentService');

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    orderId: '',
    orderAmount: 0,
    paymentMethods: [],
    selectedMethod: '',
    loading: true,
    submitting: false
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad(options) {
    const { orderId, amount } = options;
    
    if (orderId && amount) {
      this.setData({ 
        orderId,
        orderAmount: parseFloat(amount)
      });
      
      this.loadPaymentMethods();
    } else {
      wx.showToast({
        title: '閸欏倹鏆熼柨娆掝嚖',
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
    // 妞ょ敻娼伴崡姝屾祰閺冨墎娈戝〒鍛倞瀹搞儰缍?  },

  /**
   * 閸旂姾娴囨敮浠樻柟寮忛崚妤勩€?   */
  async loadPaymentMethods() {
    try {
      this.setData({ loading: true });
      
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕暜娴犳ɑ鏌熷寤嘝I
      // const methods = await paymentService.getPaymentMethods();
      
      // 濡剝瀚欓弫鐗堝祦
      setTimeout(() => {
        const paymentMethods = [
          {
            id: 'wechat',
            name: '瀵邦喕淇婇弨顖欑帛',
            icon: '/images/payment/wechat.png',
            desc: '閹恒劏宕樻担璺ㄦ暏瀵邦喕淇婇弨顖欑帛閿涘苯鐣ㄩ崗銊ユ彥閹?,
            enabled: true,
            recommended: true
          },
          {
            id: 'alipay',
            name: '閺€顖欑帛鐎?,
            icon: '/images/payment/alipay.png',
            desc: '娴ｈ法鏁ら弨顖欑帛鐎规繂鐣ㄩ崗銊︽暜娴?,
            enabled: true,
            recommended: false
          },
          {
            id: 'balance',
            name: '娴ｆ瑩顤傞弨顖欑帛',
            icon: '/images/payment/balance.png',
            desc: `瑜版挸澧犳担娆擃杺閿涙?8.50`,
            enabled: true,
            recommended: false
          },
          {
            id: 'points',
            name: '缁夘垰鍨庨幎鍨⒏',
            icon: '/images/payment/points.png',
            desc: `閸欘垳鏁ょ粔顖氬瀻閿?250閿涘苯褰查幎鍨⒏¥12.50`,
            enabled: true,
            recommended: false
          }
        ];
        
        // 姒涙顓婚柅澶嬪閹恒劏宕橀弬鐟扮础
        const selectedMethod = paymentMethods.find(method => method.recommended)?.id || '';
        
        this.setData({
          paymentMethods,
          selectedMethod,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('閸旂姾娴囨敮浠樻柟寮忔径杈Е:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '閸旂姾娴囨敮浠樻柟寮忔径杈Е',
        icon: 'none'
      });
    }
  },

  /**
   * 闁瀚ㄦ敮浠樻柟寮?   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    
    if (method) {
      this.setData({ selectedMethod: method });
    }
  },

  /**
   * 绾喛顓婚弨顖欑帛
   */
  async confirmPayment() {
    if (!this.data.selectedMethod) {
      wx.showToast({
        title: '鐠囩兘鈧瀚ㄦ敮浠樻柟寮?,
        icon: 'none'
      });
      return;
    }
    
    if (this.data.submitting) {
      return;
    }
    
    try {
      this.setData({ submitting: true });
      
      // 鐠嬪啰鏁ら弨顖欑帛閹恒儱褰?      const paymentData = {
        orderId: this.data.orderId,
        paymentMethod: this.data.selectedMethod,
        amount: this.data.orderAmount,
        returnUrl: `/pages/payment/result/result?orderId=${this.data.orderId}`
      };
      
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕暜娴犳アPI
      // const result = await paymentService.createPayment(paymentData);
      
      // 濡剝瀚欓弨顖欑帛鏉╁洨鈻?      setTimeout(() => {
        // 閺嶈宓佹敮浠樻柟寮忕拫鍐暏娑撳秴鎮撻惃鍕暜娴犳アPI
        if (this.data.selectedMethod === 'wechat') {
          // 瀵邦喕淇婇弨顖欑帛
          this.processWechatPayment();
        } else if (this.data.selectedMethod === 'alipay') {
          // 閺€顖欑帛鐎规繃鏁禒?          this.processAlipayPayment();
        } else if (this.data.selectedMethod === 'balance') {
          // 娴ｆ瑩顤傞弨顖欑帛
          this.processBalancePayment();
        } else if (this.data.selectedMethod === 'points') {
          // 缁夘垰鍨庨弨顖欑帛
          this.processPointsPayment();
        }
      }, 1000);
      
    } catch (error) {
      console.error('閸欐垼鎹ｉ弨顖欑帛婢惰精瑙?', error);
      this.setData({ submitting: false });
      wx.showToast({
        title: '閸欐垼鎹ｉ弨顖欑帛婢惰精瑙?,
        icon: 'none'
      });
    }
  },

  /**
   * 婢跺嫮鎮婂顔讳繆閺€顖欑帛
   */
  processWechatPayment() {
    // 鐠嬪啰鏁ゅ顔讳繆閺€顖欑帛API
    wx.requestPayment({
      timeStamp: String(Date.now()),
      nonceStr: 'random_string',
      package: 'prepay_id=wx123456789',
      signType: 'MD5',
      paySign: 'sign_string',
      success: (res) => {
        // 閺€顖欑帛閹存劕濮涢敍宀冪儲鏉烆剙鍩岀紒鎾寸亯妞?        wx.redirectTo({
          url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
        });
      },
      fail: (err) => {
        console.error('瀵邦喕淇婇弨顖欑帛婢惰精瑙?', err);
        this.setData({ submitting: false });
        
        // 閺嶈宓侀柨娆掝嚖缁鐎烽弰鍓с仛娑撳秴鎮撻幓鎰仛
        if (err.errMsg === 'requestPayment:fail cancel') {
          wx.showToast({
            title: '閺€顖欑帛瀹告彃褰囧☉?,
            icon: 'none'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=cancelled`
            });
          }, 1500);
        } else {
          wx.showToast({
            title: '閺€顖欑帛婢惰精瑙﹂敍宀冾嚞闁插秷鐦?,
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 婢跺嫮鎮婇弨顖欑帛鐎规繃鏁禒?   */
  processAlipayPayment() {
    // 濡剝瀚欓弨顖欑帛鐎规繃鏁禒?    setTimeout(() => {
      // 濡剝瀚欓弨顖欑帛閹存劕濮?      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 2000);
  },

  /**
   * 婢跺嫮鎮婃担娆擃杺閺€顖欑帛
   */
  processBalancePayment() {
    // 濡剝瀚欐担娆擃杺閺€顖欑帛
    setTimeout(() => {
      // 濡剝瀚欓弨顖欑帛閹存劕濮?      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 婢跺嫮鎮婄粔顖氬瀻閺€顖欑帛
   */
  processPointsPayment() {
    // 濡剝瀚欑粔顖氬瀻閺€顖欑帛
    setTimeout(() => {
      // 濡剝瀚欓弨顖欑帛閹存劕濮?      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 鏉╂柨娲栨稉濠佺妞?   */
  goBack() {
    wx.navigateBack();
  }
});
