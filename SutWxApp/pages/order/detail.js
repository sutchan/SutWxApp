// detail.js - 璁㈠崟璇︽儏椤甸潰缁勪欢

const orderService = require('../../utils/order-service');
const userService = require('../../utils/user-service');
const utils = require('../../utils/util');

Page({
  data: {
    orderId: '',
    orderDetail: null,
    loading: true,
    error: false,
    errorMessage: '',
    // 鐗╂祦淇℃伅
    logisticsInfo: null,
    logisticsVisible: false,
    // 鍦板潃淇℃伅
    addressInfo: null,
    // 璁㈠崟鍟嗗搧鍒楄〃
    orderItems: [],
    // 璁㈠崟鐘舵€?    statusText: '',
    statusColor: '',
    // 鍊掕鏃讹紙鐢ㄤ簬寰呮敮浠樿鍗曪級
    countdown: 0,
    countdownTimer: null,
    // 鍙墽琛岀殑鎿嶄綔
    availableActions: []
  },

  onLoad: function(options) {
    // 浠庨〉闈㈠弬鏁颁腑鑾峰彇璁㈠崟ID
    if (options.id) {
      this.setData({
        orderId: options.id
      });
      // 鍔犺浇璁㈠崟璇︽儏
      this.loadOrderDetail();
    } else {
      this.setData({
        loading: false,
        error: true,
        errorMessage: '璁㈠崟ID涓嶅瓨鍦?
      });
    }
  },

  onShow: function() {
    // 椤甸潰鏄剧ず鏃堕噸鏂板姞杞借鍗曡鎯咃紝纭繚鏁版嵁鏈€鏂?    if (this.data.orderId) {
      this.loadOrderDetail();
    }
  },

  onUnload: function() {
    // 椤甸潰鍗歌浇鏃舵竻闄ゅ畾鏃跺櫒
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  /**
   * 鍔犺浇璁㈠崟璇︽儏
   */
  loadOrderDetail: function() {
    const that = this;
    that.setData({
      loading: true,
      error: false
    });

    orderService.getOrderDetail(that.data.orderId)
      .then(res => {
        if (res && res.code === 0 && res.data) {
          const orderDetail = res.data;
          
          // 鏍煎紡鍖栬鍗曟暟鎹?          orderDetail.formatted_created_at = utils.formatTime(orderDetail.created_at);
          
          // 璁剧疆璁㈠崟鐘舵€佹樉绀烘枃鏈拰棰滆壊
          let statusConfig = this.getStatusConfig(orderDetail.status);
          
          // 璁＄畻鍙敤鐨勬搷浣滄寜閽?          let availableActions = this.getAvailableActions(orderDetail.status);
          
          // 璁剧疆鍊掕鏃讹紙濡傛灉鏄緟鏀粯璁㈠崟锛?          if (orderDetail.status === 'pending_payment') {
            this.startCountdown(orderDetail.payment_deadline);
          }

          that.setData({
            orderDetail: orderDetail,
            addressInfo: orderDetail.address,
            orderItems: orderDetail.items,
            statusText: statusConfig.text,
            statusColor: statusConfig.color,
            availableActions: availableActions,
            loading: false
          });
        } else {
          that.setData({
            loading: false,
            error: true,
            errorMessage: res ? res.message : '鑾峰彇璁㈠崟璇︽儏澶辫触'
          });
        }
      })
      .catch(err => {
        console.error('鑾峰彇璁㈠崟璇︽儏澶辫触:', err);
        that.setData({
          loading: false,
          error: true,
          errorMessage: '缃戠粶寮傚父锛岃绋嶅悗閲嶈瘯'
        });
      });
  },

  /**
   * 鏍规嵁璁㈠崟鐘舵€佽幏鍙栭厤缃?   */
  getStatusConfig: function(status) {
    const configMap = {
      'pending_payment': { text: '寰呬粯娆?, color: '#ff6b6b' },
      'pending_shipment': { text: '寰呭彂璐?, color: '#4ecdc4' },
      'pending_receipt': { text: '寰呮敹璐?, color: '#45b7d1' },
      'completed': { text: '宸插畬鎴?, color: '#96ceb4' },
      'cancelled': { text: '宸插彇娑?, color: '#999999' },
      'refunding': { text: '閫€娆句腑', color: '#ffbe0b' },
      'refunded': { text: '宸查€€娆?, color: '#666666' }
    };
    return configMap[status] || { text: '鏈煡鐘舵€?, color: '#999999' };
  },

  /**
   * 鏍规嵁璁㈠崟鐘舵€佽幏鍙栧彲鐢ㄧ殑鎿嶄綔
   */
  getAvailableActions: function(status) {
    const actionsMap = {
      'pending_payment': ['cancelOrder', 'goToPay'],
      'pending_shipment': ['contactService'],
      'pending_receipt': ['viewLogistics', 'confirmReceipt'],
      'completed': ['buyAgain', 'reviewOrder', 'applyInvoice', 'contactService'],
      'cancelled': ['deleteOrder', 'buyAgain', 'contactService'],
      'refunding': ['contactService'],
      'refunded': ['contactService']
    };
    return actionsMap[status] || ['contactService'];
  },

  /**
   * 寮€濮嬪€掕鏃?   */
  startCountdown: function(deadline) {
    const that = this;
    const calculateTime = () => {
      const now = Date.now();
      const end = new Date(deadline).getTime();
      const diff = Math.floor((end - now) / 1000);
      
      if (diff <= 0) {
        // 鍊掕鏃剁粨鏉燂紝閲嶆柊鍔犺浇璁㈠崟鐘舵€?        clearInterval(that.data.countdownTimer);
        that.loadOrderDetail();
        return;
      }
      
      that.setData({
        countdown: diff
      });
    };
    
    // 绔嬪嵆鎵ц涓€娆?    calculateTime();
    
    // 璁剧疆瀹氭椂鍣?    const timer = setInterval(calculateTime, 1000);
    
    this.setData({
      countdownTimer: timer
    });
  },

  /**
   * 鏍煎紡鍖栧€掕鏃?   */
  formatCountdown: function(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  },

  /**
   * 鍙栨秷璁㈠崟
   */
  cancelOrder: function() {
    const that = this;
    wx.showModal({
      title: '鍙栨秷璁㈠崟',
      content: '纭畾瑕佸彇娑堣璁㈠崟鍚楋紵',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '澶勭悊涓?..',
          });
          
          orderService.cancelOrder(that.data.orderId)
            .then(res => {
              wx.hideLoading();
              if (res && res.code === 0) {
                wx.showToast({
                  title: '璁㈠崟宸插彇娑?,
                  icon: 'success'
                });
                // 閲嶆柊鍔犺浇璁㈠崟璇︽儏
                setTimeout(() => {
                  that.loadOrderDetail();
                }, 1500);
              } else {
                wx.showToast({
                  title: res ? res.message : '鍙栨秷璁㈠崟澶辫触',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '缃戠粶寮傚父锛岃绋嶅悗閲嶈瘯',
                icon: 'none'
              });
              console.error('鍙栨秷璁㈠崟澶辫触:', err);
            });
        }
      }
    });
  },

  /**
   * 鍘绘敮浠?   */
  goToPay: function() {
    wx.navigateTo({
      url: '/pages/payment/pay?orderId=' + this.data.orderId + '&amount=' + this.data.orderDetail.total_amount
    });
  },

  /**
   * 纭鏀惰揣
   */
  confirmReceipt: function() {
    const that = this;
    wx.showModal({
      title: '纭鏀惰揣',
      content: '璇风‘璁ゆ偍宸叉敹鍒板晢鍝?,
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '澶勭悊涓?..',
          });
          
          orderService.confirmReceipt(that.data.orderId)
            .then(res => {
              wx.hideLoading();
              if (res && res.code === 0) {
                wx.showToast({
                  title: '鏀惰揣鎴愬姛',
                  icon: 'success'
                });
                // 閲嶆柊鍔犺浇璁㈠崟璇︽儏
                setTimeout(() => {
                  that.loadOrderDetail();
                }, 1500);
              } else {
                wx.showToast({
                  title: res ? res.message : '纭鏀惰揣澶辫触',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '缃戠粶寮傚父锛岃绋嶅悗閲嶈瘯',
                icon: 'none'
              });
              console.error('纭鏀惰揣澶辫触:', err);
            });
        }
      }
    });
  },

  /**
   * 鏌ョ湅鐗╂祦
   */
  viewLogistics: function() {
    const that = this;
    wx.showLoading({
      title: '鍔犺浇涓?..',
    });
    
    orderService.getLogisticsInfo(that.data.orderId)
      .then(res => {
        wx.hideLoading();
        if (res && res.code === 0 && res.data) {
          that.setData({
            logisticsInfo: res.data,
            logisticsVisible: true
          });
        } else {
          wx.showToast({
            title: res ? res.message : '鑾峰彇鐗╂祦淇℃伅澶辫触',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '缃戠粶寮傚父锛岃绋嶅悗閲嶈瘯',
          icon: 'none'
        });
        console.error('鑾峰彇鐗╂祦淇℃伅澶辫触:', err);
      });
  },

  /**
   * 鍏抽棴鐗╂祦淇℃伅
   */
  closeLogistics: function() {
    this.setData({
      logisticsVisible: false
    });
  },

  /**
   * 鍐嶆璐拱
   */
  buyAgain: function() {
    const that = this;
    wx.showLoading({
      title: '澶勭悊涓?..',
    });
    
    // 灏嗗晢鍝佹坊鍔犲埌璐墿杞?    const items = this.data.orderItems;
    const productIds = items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      specs: item.specs
    }));
    
    orderService.buyAgain(productIds)
      .then(res => {
        wx.hideLoading();
        if (res && res.code === 0) {
          wx.showToast({
            title: '宸叉坊鍔犲埌璐墿杞?,
            icon: 'success'
          });
          // 璺宠浆鍒拌喘鐗╄溅椤甸潰
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/cart/cart'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res ? res.message : '鎿嶄綔澶辫触',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '缃戠粶寮傚父锛岃绋嶅悗閲嶈瘯',
          icon: 'none'
        });
        console.error('鍐嶆璐拱澶辫触:', err);
      });
  },

  /**
   * 璇勪环璁㈠崟
   */
  reviewOrder: function() {
    wx.navigateTo({
      url: '/pages/order/review?orderId=' + this.data.orderId
    });
  },

  /**
   * 鐢宠鍙戠エ
   */
  applyInvoice: function() {
    wx.navigateTo({
      url: '/pages/order/invoice?orderId=' + this.data.orderId
    });
  },

  /**
   * 鍒犻櫎璁㈠崟
   */
  deleteOrder: function() {
    const that = this;
    wx.showModal({
      title: '鍒犻櫎璁㈠崟',
      content: '纭畾瑕佸垹闄よ璁㈠崟鍚楋紵鍒犻櫎鍚庝笉鍙仮澶?,
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '澶勭悊涓?..',
          });
          
          orderService.deleteOrder(that.data.orderId)
            .then(res => {
              wx.hideLoading();
              if (res && res.code === 0) {
                wx.showToast({
                  title: '鍒犻櫎鎴愬姛',
                  icon: 'success'
                });
                // 杩斿洖涓婁竴椤?                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              } else {
                wx.showToast({
                  title: res ? res.message : '鍒犻櫎璁㈠崟澶辫触',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '缃戠粶寮傚父锛岃绋嶅悗閲嶈瘯',
                icon: 'none'
              });
              console.error('鍒犻櫎璁㈠崟澶辫触:', err);
            });
        }
      }
    });
  },

  /**
   * 鑱旂郴瀹㈡湇
   */
  contactService: function() {
    wx.showModal({
      title: '鑱旂郴瀹㈡湇',
      content: '瀹㈡湇鐢佃瘽锛?00-123-4567\n宸ヤ綔鏃堕棿锛?:00-18:00',
      showCancel: true,
      confirmText: '鎷ㄦ墦鐢佃瘽',
      success: function(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '4001234567'
          });
        }
      }
    });
  },

  /**
   * 鍒锋柊璁㈠崟璇︽儏
   */
  refreshOrder: function() {
    this.loadOrderDetail();
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯?   */
  goToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product/detail?id=' + productId
    });
  }
});