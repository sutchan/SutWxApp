/**
 * 文件名: methods.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 支付方式閫夋嫨椤甸潰
 */

const paymentService = require('../../../services/paymentService');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    orderId: '',
    orderAmount: 0,
    paymentMethods: [],
    selectedMethod: '',
    loading: true,
    submitting: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
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
        title: '鍙傛暟閿欒',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload() {
    // 椤甸潰鍗歌浇鏃剁殑娓呯悊宸ヤ綔
  },

  /**
   * 鍔犺浇支付方式鍒楄〃
   */
  async loadPaymentMethods() {
    try {
      this.setData({ loading: true });
      
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勬敮浠樻柟寮廇PI
      // const methods = await paymentService.getPaymentMethods();
      
      // 妯℃嫙鏁版嵁
      setTimeout(() => {
        const paymentMethods = [
          {
            id: 'wechat',
            name: '寰俊鏀粯',
            icon: '/images/payment/wechat.png',
            desc: '鎺ㄨ崘浣跨敤寰俊鏀粯锛屽畨鍏ㄥ揩鎹?,
            enabled: true,
            recommended: true
          },
          {
            id: 'alipay',
            name: '鏀粯瀹?,
            icon: '/images/payment/alipay.png',
            desc: '浣跨敤鏀粯瀹濆畨鍏ㄦ敮浠?,
            enabled: true,
            recommended: false
          },
          {
            id: 'balance',
            name: '浣欓鏀粯',
            icon: '/images/payment/balance.png',
            desc: `褰撳墠浣欓锛毬?8.50`,
            enabled: true,
            recommended: false
          },
          {
            id: 'points',
            name: '绉垎鎶垫墸',
            icon: '/images/payment/points.png',
            desc: `鍙敤绉垎锛?250锛屽彲鎶垫墸¥12.50`,
            enabled: true,
            recommended: false
          }
        ];
        
        // 榛樿閫夋嫨鎺ㄨ崘鏂瑰紡
        const selectedMethod = paymentMethods.find(method => method.recommended)?.id || '';
        
        this.setData({
          paymentMethods,
          selectedMethod,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('鍔犺浇支付方式澶辫触:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '鍔犺浇支付方式澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 閫夋嫨支付方式
   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    
    if (method) {
      this.setData({ selectedMethod: method });
    }
  },

  /**
   * 纭鏀粯
   */
  async confirmPayment() {
    if (!this.data.selectedMethod) {
      wx.showToast({
        title: '璇烽€夋嫨支付方式',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.submitting) {
      return;
    }
    
    try {
      this.setData({ submitting: true });
      
      // 璋冪敤鏀粯鎺ュ彛
      const paymentData = {
        orderId: this.data.orderId,
        paymentMethod: this.data.selectedMethod,
        amount: this.data.orderAmount,
        returnUrl: `/pages/payment/result/result?orderId=${this.data.orderId}`
      };
      
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勬敮浠楢PI
      // const result = await paymentService.createPayment(paymentData);
      
      // 妯℃嫙鏀粯杩囩▼
      setTimeout(() => {
        // 鏍规嵁支付方式璋冪敤涓嶅悓鐨勬敮浠楢PI
        if (this.data.selectedMethod === 'wechat') {
          // 寰俊鏀粯
          this.processWechatPayment();
        } else if (this.data.selectedMethod === 'alipay') {
          // 鏀粯瀹濇敮浠?          this.processAlipayPayment();
        } else if (this.data.selectedMethod === 'balance') {
          // 浣欓鏀粯
          this.processBalancePayment();
        } else if (this.data.selectedMethod === 'points') {
          // 绉垎鏀粯
          this.processPointsPayment();
        }
      }, 1000);
      
    } catch (error) {
      console.error('鍙戣捣鏀粯澶辫触:', error);
      this.setData({ submitting: false });
      wx.showToast({
        title: '鍙戣捣鏀粯澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 澶勭悊寰俊鏀粯
   */
  processWechatPayment() {
    // 璋冪敤寰俊鏀粯API
    wx.requestPayment({
      timeStamp: String(Date.now()),
      nonceStr: 'random_string',
      package: 'prepay_id=wx123456789',
      signType: 'MD5',
      paySign: 'sign_string',
      success: (res) => {
        // 鏀粯鎴愬姛锛岃烦杞埌缁撴灉椤?        wx.redirectTo({
          url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
        });
      },
      fail: (err) => {
        console.error('寰俊鏀粯澶辫触:', err);
        this.setData({ submitting: false });
        
        // 鏍规嵁閿欒绫诲瀷鏄剧ず涓嶅悓鎻愮ず
        if (err.errMsg === 'requestPayment:fail cancel') {
          wx.showToast({
            title: '鏀粯宸插彇娑?,
            icon: 'none'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=cancelled`
            });
          }, 1500);
        } else {
          wx.showToast({
            title: '鏀粯澶辫触锛岃閲嶈瘯',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 澶勭悊鏀粯瀹濇敮浠?   */
  processAlipayPayment() {
    // 妯℃嫙鏀粯瀹濇敮浠?    setTimeout(() => {
      // 妯℃嫙鏀粯鎴愬姛
      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 2000);
  },

  /**
   * 澶勭悊浣欓鏀粯
   */
  processBalancePayment() {
    // 妯℃嫙浣欓鏀粯
    setTimeout(() => {
      // 妯℃嫙鏀粯鎴愬姛
      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 澶勭悊绉垎鏀粯
   */
  processPointsPayment() {
    // 妯℃嫙绉垎鏀粯
    setTimeout(() => {
      // 妯℃嫙鏀粯鎴愬姛
      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 杩斿洖涓婁竴椤?   */
  goBack() {
    wx.navigateBack();
  }
});
