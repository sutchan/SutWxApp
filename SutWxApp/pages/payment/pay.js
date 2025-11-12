锘?/ pay.js - 閺€顖欑帛妞ょ敻娼?
// 鐎电厧鍙嗛張宥呭閸滃苯浼愰崗?import orderService from '../../utils/order-service';
import { showToast, showLoading, hideLoading } from '../../utils/global';
import api from '../../utils/api';

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    // 鐠併垹宕烮D
    orderId: '',
    // 閺€顖欑帛闁叉垿顤?    amount: '0.00',
    // 鐠併垹宕熺拠锔藉剰
    orderDetail: null,
    // 閺€顖欑帛閻樿埖鈧緤绱皃ending閿涘牏鐡戝鍛暜娴犳﹫绱氶妴涔籾ccess閿涘牊鏁禒妯诲灇閸旂噦绱氶妴涔玜iled閿涘牊鏁禒妯恒亼鐠愩儻绱氶妴涔篹funding閿涘牓鈧偓濞嗗彞鑵戦敍?    payStatus: 'pending',
    // 閺€顖欑帛閺傜懓绱￠敍姝竐chat閿涘牆浜曟穱鈩冩暜娴犳﹫绱氶妴涔ipay閿涘牊鏁禒妯虹杺閿?    payMethod: 'wechat',
    // 閸旂姾娴囬悩鑸碘偓?    loading: false,
    // 閺€顖欑帛閸婃帟顓搁弮璁圭礄缁夋帪绱?    countdown: 900,
    // 閸婃帟顓搁弮鑸垫▔缁€鐑樻瀮閺?    countdownText: '15:00',
    // 閺€顖欑帛缂佹挻鐏夋穱鈩冧紖
    payResult: {
      success: false,
      message: '',
      orderNo: ''
    },
    // 瀵邦喕淇婇弨顖欑帛闁板秶鐤?    wxPayConfig: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    // 閼惧嘲褰囩拋銏犲礋ID閸滃矂鍣炬０?    if (options.orderId) {
      this.setData({
        orderId: options.orderId,
        amount: options.amount || '0.00'
      });
      
      // 閸旂姾娴囩拋銏犲礋鐠囷附鍎?      this.loadOrderDetail();
      
      // 瀵偓婵鈧帟顓搁弮?      this.startCountdown();
      
      // 鐏忔繆鐦禒搴ｇ处鐎涙骞忛崣鏍ㄦ暜娴犳濮搁幀?      this.checkPayStatusFromCache();
    } else {
      showToast('鐠併垹宕熸穱鈩冧紖闁挎瑨顕?, { icon: 'none' });
      // 瀵ゆ儼绻滄潻鏂挎礀娑撳﹣绔存い?      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 妞ょ敻娼伴弰鍓с仛閺冭埖顥呴弻銉︽暜娴犳濮搁幀?    if (this.data.orderId && this.data.payStatus === 'pending') {
      this.checkPaymentStatus();
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨闂呮劘妫?   */
  onHide: function () {
    // 濞撳懘娅庨崐鎺曨吀閺?    this.clearCountdown();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   */
  onUnload: function () {
    // 濞撳懘娅庨崐鎺曨吀閺?    this.clearCountdown();
  },

  /**
   * 閸旂姾娴囩拋銏犲礋鐠囷附鍎?   */
  loadOrderDetail: async function () {
    try {
      this.setData({ loading: true });
      
      // 閼惧嘲褰囩拋銏犲礋鐠囷附鍎?      const orderDetail = await orderService.getOrderDetail(this.data.orderId);
      
      if (orderDetail) {
        this.setData({ orderDetail });
        
        // 閺囧瓨鏌婇弨顖欑帛閺傜懓绱?        if (orderDetail.payment_method) {
          this.setData({
            payMethod: orderDetail.payment_method
          });
        }
      } else {
        throw new Error('鐠併垹宕熸稉宥呯摠閸?);
      }
      
    } catch (error) {
      console.error('閸旂姾娴囩拋銏犲礋鐠囷附鍎忔径杈Е:', error);
      showToast(error.message || '閸旂姾娴囩拋銏犲礋婢惰精瑙?, { icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 瀵偓婵鈧帟顓搁弮?   */
  startCountdown: function () {
    this.countdownTimer = setInterval(() => {
      let countdown = this.data.countdown;
      if (countdown > 0) {
        countdown--;
        
        // 鐠侊紕鐣婚崚鍡欘潡
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        const countdownText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.setData({
          countdown,
          countdownText
        });
      } else {
        // 閸婃帟顓搁弮鍓佺波閺夌噦绱濈拋銏犲礋鏉╁洦婀?        this.clearCountdown();
        showToast('鐠併垹宕熷鑼剁Т閺冭绱濈拠鐑藉櫢閺傞绗呴崡?, { icon: 'none' });
        
        // 瀵ゆ儼绻滄潻鏂挎礀鐠併垹宕熼崚妤勩€?        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/order/list'
          });
        }, 2000);
      }
    }, 1000);
  },

  /**
   * 濞撳懘娅庨崐鎺曨吀閺?   */
  clearCountdown: function () {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  },

  /**
   * 娴犲海绱︾€涙ɑ顥呴弻銉︽暜娴犳濮搁幀?   */
  checkPayStatusFromCache: function () {
    try {
      const payStatus = wx.getStorageSync(`pay_status_${this.data.orderId}`);
      if (payStatus && payStatus.success) {
        this.setData({
          payStatus: 'success',
          payResult: payStatus
        });
        // 濞撳懘娅庣紓鎾崇摠娑擃厾娈戦弨顖欑帛閻樿埖鈧?        wx.removeStorageSync(`pay_status_${this.data.orderId}`);
      }
    } catch (error) {
      console.error('娴犲海绱︾€涙ɑ顥呴弻銉︽暜娴犳濮搁幀浣搞亼鐠?', error);
    }
  },

  /**
   * 濡偓閺屻儲鏁禒妯煎Ц閹?   */
  checkPaymentStatus: async function () {
    try {
      const result = await orderService.checkPaymentStatus(this.data.orderId);
      
      if (result && result.status) {
        if (result.status === 'PAID' || result.status === 'SUCCESS') {
          this.handlePaymentSuccess(result);
        } else if (result.status === 'FAILED') {
          this.handlePaymentFailed('閺€顖欑帛婢惰精瑙?);
        }
      }
    } catch (error) {
      console.error('濡偓閺屻儲鏁禒妯煎Ц閹礁銇戠拹?', error);
    }
  },

  /**
   * 闁瀚ㄩ弨顖欑帛閺傜懓绱?   */
  selectPayMethod: function (e) {
    const payMethod = e.currentTarget.dataset.method;
    
    if (this.data.payMethod !== payMethod) {
      this.setData({
        payMethod
      });
    }
  },

  /**
   * 閸欐垼鎹ｉ弨顖欑帛
   */
  initiatePayment: async function () {
    try {
      showLoading('濮濓絽婀崣鎴ｆ崳閺€顖欑帛...');
      
      // 閼惧嘲褰囬弨顖欑帛娣団剝浼?      const payInfo = await orderService.getPaymentInfo({
        order_id: this.data.orderId,
        payment_method: this.data.payMethod
      });
      
      if (!payInfo || !payInfo.config) {
        throw new Error('閼惧嘲褰囬弨顖欑帛娣団剝浼呮径杈Е');
      }
      
      if (this.data.payMethod === 'wechat') {
        // 瀵邦喕淇婇弨顖欑帛
        await this.initiateWechatPayment(payInfo.config);
      } else if (this.data.payMethod === 'alipay') {
        // 閺€顖欑帛鐎规繃鏁禒姗堢礄鐏忓繒鈻兼惔蹇庤厬閸欘垵鍏橀棁鈧憰浣哄濞堝﹤顦╅悶鍡礆
        await this.initiateAlipayPayment(payInfo.config);
      }
      
    } catch (error) {
      hideLoading();
      console.error('閸欐垼鎹ｉ弨顖欑帛婢惰精瑙?', error);
      showToast(error.message || '閺€顖欑帛婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, { icon: 'none' });
    }
  },

  /**
   * 閸欐垼鎹ｅ顔讳繆閺€顖欑帛
   */
  initiateWechatPayment: function (payConfig) {
    return new Promise((resolve, reject) => {
      try {
        // 鐠嬪啰鏁ゅ顔讳繆閺€顖欑帛閹恒儱褰?        wx.requestPayment({
          timeStamp: payConfig.timeStamp || '',
          nonceStr: payConfig.nonceStr || '',
          package: payConfig.package || '',
          signType: payConfig.signType || 'MD5',
          paySign: payConfig.paySign || '',
          success: (res) => {
            // 閺€顖欑帛閹存劕濮?            hideLoading();
            this.handlePaymentSuccess({
              order_id: this.data.orderId,
              order_no: this.data.orderDetail ? this.data.orderDetail.order_no : '',
              payment_method: this.data.payMethod
            });
            resolve(res);
          },
          fail: (err) => {
            // 閺€顖欑帛婢惰精瑙?            hideLoading();
            if (err.errMsg !== 'requestPayment:fail cancel') {
              // 閻劍鍩涢崣鏍ㄧХ閺€顖欑帛娑撳秶鐣绘径杈Е
              this.handlePaymentFailed('閺€顖欑帛婢惰精瑙﹂敍宀冾嚞闁插秷鐦?);
            }
            reject(err);
          },
          complete: () => {
            // 濞撳懘娅庨崝鐘烘祰閻樿埖鈧?            hideLoading();
          }
        });
      } catch (error) {
        hideLoading();
        reject(error);
      }
    });
  },

  /**
   * 閸欐垼鎹ｉ弨顖欑帛鐎规繃鏁禒?   */
  initiateAlipayPayment: function (payConfig) {
    return new Promise((resolve, reject) => {
      try {
        // 閸︺劌鐨粙瀣碍娑擃叏绱濋弨顖欑帛鐎规繃鏁禒妯哄讲閼充粙娓剁憰浣界儲鏉烆剙鍩孒5妞ょ敻娼伴幋鏍﹀▏閻劎澹掑▓澶綪I
        // 鏉╂瑩鍣烽幓鎰返娑撯偓娑擃亞鐣濋崠鏍畱鐎圭偟骞?        console.log('閸欐垼鎹ｉ弨顖欑帛鐎规繃鏁禒?', payConfig);
        
        // 缁€杞扮伐閿涙俺鐑︽潪顒€鍩岄弨顖欑帛鐎规缓5閺€顖欑帛妞ょ敻娼?        if (payConfig.payUrl) {
          wx.navigateToMiniProgram({
            appId: 'alipay', // 閺€顖欑帛鐎规繂鐨粙瀣碍appId閿涘苯鐤勯梽鍛存付鐟曚胶鈥樼拋?            path: payConfig.payUrl,
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        } else {
          reject(new Error('閺€顖欑帛鐎规繃鏁禒妤縍L娑撳秴鐡ㄩ崷?));
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * 婢跺嫮鎮婇弨顖欑帛閹存劕濮?   */
  handlePaymentSuccess: function (result) {
    try {
      // 閺囧瓨鏌婇弨顖欑帛閻樿埖鈧?      this.setData({
        payStatus: 'success',
        payResult: {
          success: true,
          message: '閺€顖欑帛閹存劕濮?,
          orderNo: result.order_no || this.data.orderDetail.order_no
        }
      });
      
      // 濞撳懘娅庨崐鎺曨吀閺?      this.clearCountdown();
      
      // 閺勫墽銇氶幋鎰閹绘劗銇?      showToast('閺€顖欑帛閹存劕濮?, { icon: 'success' });
      
      // 瀵ゆ儼绻滅捄瀹犳祮閸掓媽顓归崡鏇☆嚊閹?      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order/detail?id=${this.data.orderId}`
        });
      }, 2000);
    } catch (error) {
      console.error('婢跺嫮鎮婇弨顖欑帛閹存劕濮涚紒鎾寸亯婢惰精瑙?', error);
    }
  },

  /**
   * 婢跺嫮鎮婇弨顖欑帛婢惰精瑙?   */
  handlePaymentFailed: function (message) {
    try {
      // 閺囧瓨鏌婇弨顖欑帛閻樿埖鈧?      this.setData({
        payStatus: 'failed',
        payResult: {
          success: false,
          message: message || '閺€顖欑帛婢惰精瑙?,
          orderNo: this.data.orderDetail ? this.data.orderDetail.order_no : ''
        }
      });
    } catch (error) {
      console.error('婢跺嫮鎮婇弨顖欑帛婢惰精瑙︾紒鎾寸亯婢惰精瑙?', error);
    }
  },

  /**
   * 闁插秵鏌婇弨顖欑帛
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
    
    // 闁插秵鏌婂鈧慨瀣偓鎺曨吀閺?    this.setData({
      countdown: 900,
      countdownText: '15:00'
    });
    this.startCountdown();
  },

  /**
   * 閺屻儳婀呯拋銏犲礋鐠囷附鍎?   */
  viewOrderDetail: function () {
    wx.redirectTo({
      url: `/pages/order/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 鏉╂柨娲栨＃鏍€?   */
  backToHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 閸欐牗绉烽弨顖欑帛
   */
  cancelPayment: function () {
    wx.showModal({
      title: '绾喛顓婚崣鏍ㄧХ',
      content: '绾喖鐣剧憰浣稿絿濞戝牊鏁禒妯烘偋閿?,
      success: async (res) => {
        if (res.confirm) {
          try {
            // 閸欘垯浜掔拫鍐暏閸欐牗绉风拋銏犲礋閹恒儱褰?            await orderService.cancelOrder(this.data.orderId);
            
            // 濞撳懘娅庨崐鎺曨吀閺?            this.clearCountdown();
            
            // 鐠哄疇娴嗛崚鎷岊吂閸楁洖鍨悰?            wx.redirectTo({
              url: '/pages/order/list'
            });
          } catch (error) {
            console.error('閸欐牗绉风拋銏犲礋婢惰精瑙?', error);
            showToast('閸欐牗绉风拋銏犲礋婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, { icon: 'none' });
          }
        }
      }
    });
  }
});\n