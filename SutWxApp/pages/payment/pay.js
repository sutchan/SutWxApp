/**
 * 文件名: pay.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 鏀粯椤甸潰
 */

const paymentService = require('../../services/paymentService');
const userService = require('../../services/userService');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad(options) {
    const { orderId } = options;
    if (orderId) {
      this.setData({ orderId });
      this.loadOrderDetail(orderId);
      this.loadPaymentMethods();
      this.startCountdown();
    } else {
      wx.showToast({
        title: '订单淇℃伅閿欒',
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
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  /**
   * 鍔犺浇订单璇︽儏
   */
  async loadOrderDetail(orderId) {
    try {
      this.setData({ loading: true });
      
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勮鍗曡鎯匒PI
      // const orderData = await orderService.getOrderDetail(orderId);
      
      // 妯℃嫙鏁版嵁
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
        
        this.setData({
          orderData,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('鍔犺浇订单璇︽儏澶辫触:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '鍔犺浇订单淇℃伅澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 鍔犺浇支付方式
   */
  async loadPaymentMethods() {
    try {
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勬敮浠樻柟寮廇PI
      // const paymentMethods = await paymentService.getPaymentMethods();
      
      // 妯℃嫙鏁版嵁
      setTimeout(() => {
        const paymentMethods = [
          {
            id: 'wechat',
            name: '寰俊鏀粯',
            icon: '/images/payment/wechat.png',
            description: '鎺ㄨ崘浣跨敤寰俊鏀粯锛屽畨鍏ㄤ究鎹?,
            enabled: true
          },
          {
            id: 'alipay',
            name: '鏀粯瀹?,
            icon: '/images/payment/alipay.png',
            description: '浣跨敤鏀粯瀹濅綑棰濇垨鑺卞憲鏀粯',
            enabled: true
          },
          {
            id: 'balance',
            name: '浣欓鏀粯',
            icon: '/images/payment/balance.png',
            description: '浣跨敤璐︽埛浣欓鏀粯',
            enabled: true,
            balance: 150.50
          }
        ];
        
        // 榛樿閫夋嫨寰俊鏀粯
        const selectedPaymentMethod = paymentMethods.find(method => method.enabled);
        
        this.setData({
          paymentMethods,
          selectedPaymentMethod
        });
      }, 500);
      
    } catch (error) {
      console.error('鍔犺浇支付方式澶辫触:', error);
      wx.showToast({
        title: '鍔犺浇支付方式澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 寮€濮嬪€掕鏃?   */
  startCountdown() {
    // 璁剧疆订单鏀粯鍊掕鏃朵负15鍒嗛挓
    let countdown = 15 * 60; // 15鍒嗛挓锛屽崟浣嶏細绉?    
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
          title: '鏀粯瓒呮椂',
          content: '订单鏀粯宸茶秴鏃讹紝订单宸茶嚜鍔ㄥ彇娑?,
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
   * 鏍煎紡鍖栧€掕鏃?   */
  formatCountdown(countdown) {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * 閫夋嫨支付方式
   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    this.setData({
      selectedPaymentMethod: method
    });
  },

  /**
   * 鎻愪氦鏀粯
   */
  async submitPayment() {
    if (!this.data.selectedPaymentMethod) {
      wx.showToast({
        title: '璇烽€夋嫨支付方式',
        icon: 'none'
      });
      return;
    }

    // 妫€鏌ヤ綑棰濇槸鍚﹁冻澶?    if (this.data.selectedPaymentMethod.id === 'balance' && 
        this.data.selectedPaymentMethod.balance < this.data.orderData.actualAmount) {
      wx.showToast({
        title: '浣欓涓嶈冻锛岃閫夋嫨鍏朵粬支付方式',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ submitting: true });
      
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勬敮浠楢PI
      // const result = await paymentService.createPayment({
      //   orderId: this.data.orderId,
      //   paymentMethod: this.data.selectedPaymentMethod.id
      // });
      
      // 妯℃嫙鏀粯杩囩▼
      setTimeout(() => {
        this.setData({ submitting: false });
        
        // 鏍规嵁涓嶅悓支付方式澶勭悊
        if (this.data.selectedPaymentMethod.id === 'wechat') {
          this.processWechatPay();
        } else if (this.data.selectedPaymentMethod.id === 'alipay') {
          this.processAlipay();
        } else if (this.data.selectedPaymentMethod.id === 'balance') {
          this.processBalancePay();
        }
      }, 1000);
      
    } catch (error) {
      console.error('鏀粯澶辫触:', error);
      this.setData({ submitting: false });
      wx.showToast({
        title: '鏀粯澶辫触锛岃閲嶈瘯',
        icon: 'none'
      });
    }
  },

  /**
   * 澶勭悊寰俊鏀粯
   */
  processWechatPay() {
    // 杩欓噷搴旇璋冪敤寰俊鏀粯API
    wx.showLoading({ title: '璋冭捣鏀粯...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 妯℃嫙鏀粯鎴愬姛
      this.onPaymentSuccess();
    }, 1500);
  },

  /**
   * 澶勭悊鏀粯瀹濇敮浠?   */
  processAlipay() {
    // 杩欓噷搴旇璋冪敤鏀粯瀹濇敮浠楢PI
    wx.showLoading({ title: '璋冭捣鏀粯...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 妯℃嫙鏀粯鎴愬姛
      this.onPaymentSuccess();
    }, 1500);
  },

  /**
   * 澶勭悊浣欓鏀粯
   */
  async processBalancePay() {
    try {
      wx.showLoading({ title: '鏀粯涓?..' });
      
      // 杩欓噷搴旇璋冪敤浣欓鏀粯API
      // const result = await paymentService.balancePayment({
      //   orderId: this.data.orderId,
      //   amount: this.data.orderData.actualAmount
      // });
      
      setTimeout(() => {
        wx.hideLoading();
        
        // 妯℃嫙鏀粯鎴愬姛
        this.onPaymentSuccess();
      }, 1000);
      
    } catch (error) {
      console.error('浣欓鏀粯澶辫触:', error);
      wx.hideLoading();
      wx.showToast({
        title: '鏀粯澶辫触锛岃閲嶈瘯',
        icon: 'none'
      });
    }
  },

  /**
   * 鏀粯鎴愬姛澶勭悊
   */
  onPaymentSuccess() {
    wx.showToast({
      title: '鏀粯鎴愬姛',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 鍙栨秷鏀粯
   */
  cancelPayment() {
    wx.showModal({
      title: '鍙栨秷鏀粯',
      content: '纭畾瑕佸彇娑堟敮浠樺悧锛?,
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 鏌ョ湅订单璇︽儏
   */
  viewOrderDetail() {
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 鑱旂郴瀹㈡湇
   */
  contactService() {
    wx.navigateTo({
      url: '/pages/service/chat/chat'
    });
  }
});
