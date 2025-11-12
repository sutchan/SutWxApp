锘?/ detail.js - 鐠併垹宕熺拠锔藉剰妞ょ敻娼扮紒鍕

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
    // 閻椻晜绁︽穱鈩冧紖
    logisticsInfo: null,
    logisticsVisible: false,
    // 閸︽澘娼冩穱鈩冧紖
    addressInfo: null,
    // 鐠併垹宕熼崯鍡楁惂閸掓銆?    orderItems: [],
    // 鐠併垹宕熼悩鑸碘偓?    statusText: '',
    statusColor: '',
    // 閸婃帟顓搁弮璁圭礄閻劋绨鍛暜娴犳顓归崡鏇礆
    countdown: 0,
    countdownTimer: null,
    // 閸欘垱澧界悰宀€娈戦幙宥勭稊
    availableActions: []
  },

  onLoad: function(options) {
    // 娴犲酣銆夐棃銏犲棘閺侀鑵戦懢宄板絿鐠併垹宕烮D
    if (options.id) {
      this.setData({
        orderId: options.id
      });
      // 閸旂姾娴囩拋銏犲礋鐠囷附鍎?      this.loadOrderDetail();
    } else {
      this.setData({
        loading: false,
        error: true,
        errorMessage: '鐠併垹宕烮D娑撳秴鐡ㄩ崷?
      });
    }
  },

  onShow: function() {
    // 妞ょ敻娼伴弰鍓с仛閺冨爼鍣搁弬鏉垮鏉炲€燁吂閸楁洝顕涢幆鍜冪礉绾喕绻氶弫鐗堝祦閺堚偓閺?    if (this.data.orderId) {
      this.loadOrderDetail();
    }
  },

  onUnload: function() {
    // 妞ょ敻娼伴崡姝屾祰閺冭埖绔婚梽銈呯暰閺冭泛娅?    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  /**
   * 閸旂姾娴囩拋銏犲礋鐠囷附鍎?   */
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
          
          // 閺嶇厧绱￠崠鏍吂閸楁洘鏆熼幑?          orderDetail.formatted_created_at = utils.formatTime(orderDetail.created_at);
          
          // 鐠佸墽鐤嗙拋銏犲礋閻樿埖鈧焦妯夌粈鐑樻瀮閺堫剙鎷版０婊嗗
          let statusConfig = this.getStatusConfig(orderDetail.status);
          
          // 鐠侊紕鐣婚崣顖滄暏閻ㄥ嫭鎼锋担婊勫瘻闁?          let availableActions = this.getAvailableActions(orderDetail.status);
          
          // 鐠佸墽鐤嗛崐鎺曨吀閺冭绱欐俊鍌涚亯閺勵垰绶熼弨顖欑帛鐠併垹宕熼敍?          if (orderDetail.status === 'pending_payment') {
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
            errorMessage: res ? res.message : '閼惧嘲褰囩拋銏犲礋鐠囷附鍎忔径杈Е'
          });
        }
      })
      .catch(err => {
        console.error('閼惧嘲褰囩拋銏犲礋鐠囷附鍎忔径杈Е:', err);
        that.setData({
          loading: false,
          error: true,
          errorMessage: '缂冩垹绮跺鍌氱埗閿涘矁顕粙宥呮倵闁插秷鐦?
        });
      });
  },

  /**
   * 閺嶈宓佺拋銏犲礋閻樿埖鈧浇骞忛崣鏍帳缂?   */
  getStatusConfig: function(status) {
    const configMap = {
      'pending_payment': { text: '瀵板懍绮▎?, color: '#ff6b6b' },
      'pending_shipment': { text: '瀵板懎褰傜拹?, color: '#4ecdc4' },
      'pending_receipt': { text: '瀵板懏鏁圭拹?, color: '#45b7d1' },
      'completed': { text: '瀹告彃鐣幋?, color: '#96ceb4' },
      'cancelled': { text: '瀹告彃褰囧☉?, color: '#999999' },
      'refunding': { text: '闁偓濞嗗彞鑵?, color: '#ffbe0b' },
      'refunded': { text: '瀹告煡鈧偓濞?, color: '#666666' }
    };
    return configMap[status] || { text: '閺堫亞鐓￠悩鑸碘偓?, color: '#999999' };
  },

  /**
   * 閺嶈宓佺拋銏犲礋閻樿埖鈧浇骞忛崣鏍у讲閻劎娈戦幙宥勭稊
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
   * 瀵偓婵鈧帟顓搁弮?   */
  startCountdown: function(deadline) {
    const that = this;
    const calculateTime = () => {
      const now = Date.now();
      const end = new Date(deadline).getTime();
      const diff = Math.floor((end - now) / 1000);
      
      if (diff <= 0) {
        // 閸婃帟顓搁弮鍓佺波閺夌噦绱濋柌宥嗘煀閸旂姾娴囩拋銏犲礋閻樿埖鈧?        clearInterval(that.data.countdownTimer);
        that.loadOrderDetail();
        return;
      }
      
      that.setData({
        countdown: diff
      });
    };
    
    // 缁斿宓嗛幍褑顢戞稉鈧▎?    calculateTime();
    
    // 鐠佸墽鐤嗙€规碍妞傞崳?    const timer = setInterval(calculateTime, 1000);
    
    this.setData({
      countdownTimer: timer
    });
  },

  /**
   * 閺嶇厧绱￠崠鏍р偓鎺曨吀閺?   */
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
   * 閸欐牗绉风拋銏犲礋
   */
  cancelOrder: function() {
    const that = this;
    wx.showModal({
      title: '閸欐牗绉风拋銏犲礋',
      content: '绾喖鐣剧憰浣稿絿濞戝牐顕氱拋銏犲礋閸氭绱?,
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '婢跺嫮鎮婃稉?..',
          });
          
          orderService.cancelOrder(that.data.orderId)
            .then(res => {
              wx.hideLoading();
              if (res && res.code === 0) {
                wx.showToast({
                  title: '鐠併垹宕熷鎻掑絿濞?,
                  icon: 'success'
                });
                // 闁插秵鏌婇崝鐘烘祰鐠併垹宕熺拠锔藉剰
                setTimeout(() => {
                  that.loadOrderDetail();
                }, 1500);
              } else {
                wx.showToast({
                  title: res ? res.message : '閸欐牗绉风拋銏犲礋婢惰精瑙?,
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '缂冩垹绮跺鍌氱埗閿涘矁顕粙宥呮倵闁插秷鐦?,
                icon: 'none'
              });
              console.error('閸欐牗绉风拋銏犲礋婢惰精瑙?', err);
            });
        }
      }
    });
  },

  /**
   * 閸樼粯鏁禒?   */
  goToPay: function() {
    wx.navigateTo({
      url: '/pages/payment/pay?orderId=' + this.data.orderId + '&amount=' + this.data.orderDetail.total_amount
    });
  },

  /**
   * 绾喛顓婚弨鎯版彛
   */
  confirmReceipt: function() {
    const that = this;
    wx.showModal({
      title: '绾喛顓婚弨鎯版彛',
      content: '鐠囬鈥樼拋銈嗗亶瀹稿弶鏁归崚鏉挎櫌閸?,
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '婢跺嫮鎮婃稉?..',
          });
          
          orderService.confirmReceipt(that.data.orderId)
            .then(res => {
              wx.hideLoading();
              if (res && res.code === 0) {
                wx.showToast({
                  title: '閺€鎯版彛閹存劕濮?,
                  icon: 'success'
                });
                // 闁插秵鏌婇崝鐘烘祰鐠併垹宕熺拠锔藉剰
                setTimeout(() => {
                  that.loadOrderDetail();
                }, 1500);
              } else {
                wx.showToast({
                  title: res ? res.message : '绾喛顓婚弨鎯版彛婢惰精瑙?,
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '缂冩垹绮跺鍌氱埗閿涘矁顕粙宥呮倵闁插秷鐦?,
                icon: 'none'
              });
              console.error('绾喛顓婚弨鎯版彛婢惰精瑙?', err);
            });
        }
      }
    });
  },

  /**
   * 閺屻儳婀呴悧鈺傜ウ
   */
  viewLogistics: function() {
    const that = this;
    wx.showLoading({
      title: '閸旂姾娴囨稉?..',
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
            title: res ? res.message : '閼惧嘲褰囬悧鈺傜ウ娣団剝浼呮径杈Е',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '缂冩垹绮跺鍌氱埗閿涘矁顕粙宥呮倵闁插秷鐦?,
          icon: 'none'
        });
        console.error('閼惧嘲褰囬悧鈺傜ウ娣団剝浼呮径杈Е:', err);
      });
  },

  /**
   * 閸忔娊妫撮悧鈺傜ウ娣団剝浼?   */
  closeLogistics: function() {
    this.setData({
      logisticsVisible: false
    });
  },

  /**
   * 閸愬秵顐肩拹顓濇嫳
   */
  buyAgain: function() {
    const that = this;
    wx.showLoading({
      title: '婢跺嫮鎮婃稉?..',
    });
    
    // 鐏忓棗鏅㈤崫浣瑰潑閸旂姴鍩岀拹顓犲⒖鏉?    const items = this.data.orderItems;
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
            title: '瀹稿弶鍧婇崝鐘插煂鐠愵厾澧挎潪?,
            icon: 'success'
          });
          // 鐠哄疇娴嗛崚鎷屽枠閻椻晞婧呮い鐢告桨
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/cart/cart'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res ? res.message : '閹垮秳缍旀径杈Е',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '缂冩垹绮跺鍌氱埗閿涘矁顕粙宥呮倵闁插秷鐦?,
          icon: 'none'
        });
        console.error('閸愬秵顐肩拹顓濇嫳婢惰精瑙?', err);
      });
  },

  /**
   * 鐠囧嫪鐜拋銏犲礋
   */
  reviewOrder: function() {
    wx.navigateTo({
      url: '/pages/order/review?orderId=' + this.data.orderId
    });
  },

  /**
   * 閻㈠疇顕崣鎴犮偍
   */
  applyInvoice: function() {
    wx.navigateTo({
      url: '/pages/order/invoice?orderId=' + this.data.orderId
    });
  },

  /**
   * 閸掔娀娅庣拋銏犲礋
   */
  deleteOrder: function() {
    const that = this;
    wx.showModal({
      title: '閸掔娀娅庣拋銏犲礋',
      content: '绾喖鐣剧憰浣稿灩闂勩倛顕氱拋銏犲礋閸氭绱甸崚鐘绘珟閸氬簼绗夐崣顖涗划婢?,
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '婢跺嫮鎮婃稉?..',
          });
          
          orderService.deleteOrder(that.data.orderId)
            .then(res => {
              wx.hideLoading();
              if (res && res.code === 0) {
                wx.showToast({
                  title: '閸掔娀娅庨幋鎰',
                  icon: 'success'
                });
                // 鏉╂柨娲栨稉濠佺妞?                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              } else {
                wx.showToast({
                  title: res ? res.message : '閸掔娀娅庣拋銏犲礋婢惰精瑙?,
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({
                title: '缂冩垹绮跺鍌氱埗閿涘矁顕粙宥呮倵闁插秷鐦?,
                icon: 'none'
              });
              console.error('閸掔娀娅庣拋銏犲礋婢惰精瑙?', err);
            });
        }
      }
    });
  },

  /**
   * 閼辨梻閮寸€广垺婀?   */
  contactService: function() {
    wx.showModal({
      title: '閼辨梻閮寸€广垺婀?,
      content: '鐎广垺婀囬悽浣冪樈閿?00-123-4567\n瀹搞儰缍旈弮鍫曟？閿?:00-18:00',
      showCancel: true,
      confirmText: '閹枫劍澧﹂悽浣冪樈',
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
   * 閸掗攱鏌婄拋銏犲礋鐠囷附鍎?   */
  refreshOrder: function() {
    this.loadOrderDetail();
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆?   */
  goToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product/detail?id=' + productId
    });
  }
});\n