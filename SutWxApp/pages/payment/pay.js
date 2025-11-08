// pay.js - 鏀粯椤甸潰

// 瀵煎叆鏈嶅姟鍜屽伐鍏?import orderService from '../../utils/order-service';
import { showToast, showLoading, hideLoading } from '../../utils/global';
import api from '../../utils/api';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    // 璁㈠崟ID
    orderId: '',
    // 鏀粯閲戦
    amount: '0.00',
    // 璁㈠崟璇︽儏
    orderDetail: null,
    // 鏀粯鐘舵€侊細pending锛堢瓑寰呮敮浠橈級銆乻uccess锛堟敮浠樻垚鍔燂級銆乫ailed锛堟敮浠樺け璐ワ級銆乺efunding锛堥€€娆句腑锛?    payStatus: 'pending',
    // 鏀粯鏂瑰紡锛歸echat锛堝井淇℃敮浠橈級銆乤lipay锛堟敮浠樺疂锛?    payMethod: 'wechat',
    // 鍔犺浇鐘舵€?    loading: false,
    // 鏀粯鍊掕鏃讹紙绉掞級
    countdown: 900,
    // 鍊掕鏃舵樉绀烘枃鏈?    countdownText: '15:00',
    // 鏀粯缁撴灉淇℃伅
    payResult: {
      success: false,
      message: '',
      orderNo: ''
    },
    // 寰俊鏀粯閰嶇疆
    wxPayConfig: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    // 鑾峰彇璁㈠崟ID鍜岄噾棰?    if (options.orderId) {
      this.setData({
        orderId: options.orderId,
        amount: options.amount || '0.00'
      });
      
      // 鍔犺浇璁㈠崟璇︽儏
      this.loadOrderDetail();
      
      // 寮€濮嬪€掕鏃?      this.startCountdown();
      
      // 灏濊瘯浠庣紦瀛樿幏鍙栨敮浠樼姸鎬?      this.checkPayStatusFromCache();
    } else {
      showToast('璁㈠崟淇℃伅閿欒', { icon: 'none' });
      // 寤惰繜杩斿洖涓婁竴椤?      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 椤甸潰鏄剧ず鏃舵鏌ユ敮浠樼姸鎬?    if (this.data.orderId && this.data.payStatus === 'pending') {
      this.checkPaymentStatus();
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰闅愯棌
   */
  onHide: function () {
    // 娓呴櫎鍊掕鏃?    this.clearCountdown();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload: function () {
    // 娓呴櫎鍊掕鏃?    this.clearCountdown();
  },

  /**
   * 鍔犺浇璁㈠崟璇︽儏
   */
  loadOrderDetail: async function () {
    try {
      this.setData({ loading: true });
      
      // 鑾峰彇璁㈠崟璇︽儏
      const orderDetail = await orderService.getOrderDetail(this.data.orderId);
      
      if (orderDetail) {
        this.setData({ orderDetail });
        
        // 鏇存柊鏀粯鏂瑰紡
        if (orderDetail.payment_method) {
          this.setData({
            payMethod: orderDetail.payment_method
          });
        }
      } else {
        throw new Error('璁㈠崟涓嶅瓨鍦?);
      }
      
    } catch (error) {
      console.error('鍔犺浇璁㈠崟璇︽儏澶辫触:', error);
      showToast(error.message || '鍔犺浇璁㈠崟澶辫触', { icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 寮€濮嬪€掕鏃?   */
  startCountdown: function () {
    this.countdownTimer = setInterval(() => {
      let countdown = this.data.countdown;
      if (countdown > 0) {
        countdown--;
        
        // 璁＄畻鍒嗙
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        const countdownText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.setData({
          countdown,
          countdownText
        });
      } else {
        // 鍊掕鏃剁粨鏉燂紝璁㈠崟杩囨湡
        this.clearCountdown();
        showToast('璁㈠崟宸茶秴鏃讹紝璇烽噸鏂颁笅鍗?, { icon: 'none' });
        
        // 寤惰繜杩斿洖璁㈠崟鍒楄〃
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/order/list'
          });
        }, 2000);
      }
    }, 1000);
  },

  /**
   * 娓呴櫎鍊掕鏃?   */
  clearCountdown: function () {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  },

  /**
   * 浠庣紦瀛樻鏌ユ敮浠樼姸鎬?   */
  checkPayStatusFromCache: function () {
    try {
      const payStatus = wx.getStorageSync(`pay_status_${this.data.orderId}`);
      if (payStatus && payStatus.success) {
        this.setData({
          payStatus: 'success',
          payResult: payStatus
        });
        // 娓呴櫎缂撳瓨涓殑鏀粯鐘舵€?        wx.removeStorageSync(`pay_status_${this.data.orderId}`);
      }
    } catch (error) {
      console.error('浠庣紦瀛樻鏌ユ敮浠樼姸鎬佸け璐?', error);
    }
  },

  /**
   * 妫€鏌ユ敮浠樼姸鎬?   */
  checkPaymentStatus: async function () {
    try {
      const result = await orderService.checkPaymentStatus(this.data.orderId);
      
      if (result && result.status) {
        if (result.status === 'PAID' || result.status === 'SUCCESS') {
          this.handlePaymentSuccess(result);
        } else if (result.status === 'FAILED') {
          this.handlePaymentFailed('鏀粯澶辫触');
        }
      }
    } catch (error) {
      console.error('妫€鏌ユ敮浠樼姸鎬佸け璐?', error);
    }
  },

  /**
   * 閫夋嫨鏀粯鏂瑰紡
   */
  selectPayMethod: function (e) {
    const payMethod = e.currentTarget.dataset.method;
    
    if (this.data.payMethod !== payMethod) {
      this.setData({
        payMethod
      });
    }
  },

  /**
   * 鍙戣捣鏀粯
   */
  initiatePayment: async function () {
    try {
      showLoading('姝ｅ湪鍙戣捣鏀粯...');
      
      // 鑾峰彇鏀粯淇℃伅
      const payInfo = await orderService.getPaymentInfo({
        order_id: this.data.orderId,
        payment_method: this.data.payMethod
      });
      
      if (!payInfo || !payInfo.config) {
        throw new Error('鑾峰彇鏀粯淇℃伅澶辫触');
      }
      
      if (this.data.payMethod === 'wechat') {
        // 寰俊鏀粯
        await this.initiateWechatPayment(payInfo.config);
      } else if (this.data.payMethod === 'alipay') {
        // 鏀粯瀹濇敮浠橈紙灏忕▼搴忎腑鍙兘闇€瑕佺壒娈婂鐞嗭級
        await this.initiateAlipayPayment(payInfo.config);
      }
      
    } catch (error) {
      hideLoading();
      console.error('鍙戣捣鏀粯澶辫触:', error);
      showToast(error.message || '鏀粯澶辫触锛岃閲嶈瘯', { icon: 'none' });
    }
  },

  /**
   * 鍙戣捣寰俊鏀粯
   */
  initiateWechatPayment: function (payConfig) {
    return new Promise((resolve, reject) => {
      try {
        // 璋冪敤寰俊鏀粯鎺ュ彛
        wx.requestPayment({
          timeStamp: payConfig.timeStamp || '',
          nonceStr: payConfig.nonceStr || '',
          package: payConfig.package || '',
          signType: payConfig.signType || 'MD5',
          paySign: payConfig.paySign || '',
          success: (res) => {
            // 鏀粯鎴愬姛
            hideLoading();
            this.handlePaymentSuccess({
              order_id: this.data.orderId,
              order_no: this.data.orderDetail ? this.data.orderDetail.order_no : '',
              payment_method: this.data.payMethod
            });
            resolve(res);
          },
          fail: (err) => {
            // 鏀粯澶辫触
            hideLoading();
            if (err.errMsg !== 'requestPayment:fail cancel') {
              // 鐢ㄦ埛鍙栨秷鏀粯涓嶇畻澶辫触
              this.handlePaymentFailed('鏀粯澶辫触锛岃閲嶈瘯');
            }
            reject(err);
          },
          complete: () => {
            // 娓呴櫎鍔犺浇鐘舵€?            hideLoading();
          }
        });
      } catch (error) {
        hideLoading();
        reject(error);
      }
    });
  },

  /**
   * 鍙戣捣鏀粯瀹濇敮浠?   */
  initiateAlipayPayment: function (payConfig) {
    return new Promise((resolve, reject) => {
      try {
        // 鍦ㄥ皬绋嬪簭涓紝鏀粯瀹濇敮浠樺彲鑳介渶瑕佽烦杞埌H5椤甸潰鎴栦娇鐢ㄧ壒娈夾PI
        // 杩欓噷鎻愪緵涓€涓畝鍖栫殑瀹炵幇
        console.log('鍙戣捣鏀粯瀹濇敮浠?', payConfig);
        
        // 绀轰緥锛氳烦杞埌鏀粯瀹滺5鏀粯椤甸潰
        if (payConfig.payUrl) {
          wx.navigateToMiniProgram({
            appId: 'alipay', // 鏀粯瀹濆皬绋嬪簭appId锛屽疄闄呴渶瑕佺‘璁?            path: payConfig.payUrl,
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        } else {
          reject(new Error('鏀粯瀹濇敮浠楿RL涓嶅瓨鍦?));
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * 澶勭悊鏀粯鎴愬姛
   */
  handlePaymentSuccess: function (result) {
    try {
      // 鏇存柊鏀粯鐘舵€?      this.setData({
        payStatus: 'success',
        payResult: {
          success: true,
          message: '鏀粯鎴愬姛',
          orderNo: result.order_no || this.data.orderDetail.order_no
        }
      });
      
      // 娓呴櫎鍊掕鏃?      this.clearCountdown();
      
      // 鏄剧ず鎴愬姛鎻愮ず
      showToast('鏀粯鎴愬姛', { icon: 'success' });
      
      // 寤惰繜璺宠浆鍒拌鍗曡鎯?      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order/detail?id=${this.data.orderId}`
        });
      }, 2000);
    } catch (error) {
      console.error('澶勭悊鏀粯鎴愬姛缁撴灉澶辫触:', error);
    }
  },

  /**
   * 澶勭悊鏀粯澶辫触
   */
  handlePaymentFailed: function (message) {
    try {
      // 鏇存柊鏀粯鐘舵€?      this.setData({
        payStatus: 'failed',
        payResult: {
          success: false,
          message: message || '鏀粯澶辫触',
          orderNo: this.data.orderDetail ? this.data.orderDetail.order_no : ''
        }
      });
    } catch (error) {
      console.error('澶勭悊鏀粯澶辫触缁撴灉澶辫触:', error);
    }
  },

  /**
   * 閲嶆柊鏀粯
   */
  retryPayment: function () {
    this.setData({
      payStatus: 'pending',
      payResult: {
        success: false,
        message: '',
        orderNo: ''
      }
    });
    
    // 閲嶆柊寮€濮嬪€掕鏃?    this.setData({
      countdown: 900,
      countdownText: '15:00'
    });
    this.startCountdown();
  },

  /**
   * 鏌ョ湅璁㈠崟璇︽儏
   */
  viewOrderDetail: function () {
    wx.redirectTo({
      url: `/pages/order/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 杩斿洖棣栭〉
   */
  backToHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 鍙栨秷鏀粯
   */
  cancelPayment: function () {
    wx.showModal({
      title: '纭鍙栨秷',
      content: '纭畾瑕佸彇娑堟敮浠樺悧锛?,
      success: async (res) => {
        if (res.confirm) {
          try {
            // 鍙互璋冪敤鍙栨秷璁㈠崟鎺ュ彛
            await orderService.cancelOrder(this.data.orderId);
            
            // 娓呴櫎鍊掕鏃?            this.clearCountdown();
            
            // 璺宠浆鍒拌鍗曞垪琛?            wx.redirectTo({
              url: '/pages/order/list'
            });
          } catch (error) {
            console.error('鍙栨秷璁㈠崟澶辫触:', error);
            showToast('鍙栨秷璁㈠崟澶辫触锛岃閲嶈瘯', { icon: 'none' });
          }
        }
      }
    });
  }
});