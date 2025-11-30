/**
 * 文件名: detail.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-27
 * 订单璇︽儏椤甸潰
 */
const i18n = require('../../../utils/i18n');
const PointsService = require('../../../services/pointsService');

Page({
  data: {
    i18n: i18n,
    loading: false,
    orderId: null,
    order: null,
    logistics: null,
    showLogistics: false,
    orderTimer: null,
    logisticsTimer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.id - 订单ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadOrderDetail(options.id);
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊鎵€鏈夊畾鏃跺櫒锛岄槻姝㈠唴瀛樻硠婕?    if (this.data.orderTimer) {
      clearTimeout(this.data.orderTimer);
    }
    if (this.data.logisticsTimer) {
      clearTimeout(this.data.logisticsTimer);
    }
  },

  /**
   * 椤甸潰鏄剧ず鏃惰Е鍙?   * @returns {void}
   */
  onShow() {
    // 鍙互鍦ㄦ澶勫埛鏂伴儴鍒嗘暟鎹?  },

  /**
   * 涓嬫媺鍒锋柊鍥炶皟
   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadOrderDetail(this.data.orderId, () => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 鍔犺浇订单璇︽儏
   * @param {string} id - 订单ID
   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  loadOrderDetail(id, done) {
    this.setData({ loading: true });
    const orderTimer = setTimeout(() => {
      const mockOrder = {
        id: id,
        status: 'shipped',
        statusText: i18n.translate('宸插彂璐?),
        createTime: '2023-09-28 14:20:00',
        payTime: '2023-09-28 14:25:00',
        shipTime: '2023-09-29 10:15:00',
        totalAmount: '199.00',
        paymentMethod: i18n.translate('寰俊鏀粯'),
        shippingAddress: {
          name: i18n.translate('寮犱笁'),
          phone: '13800138000',
          address: i18n.translate('鍖椾含甯傛湞闃冲尯鏌愭煇琛楅亾鏌愭煇灏忓尯1鍙锋ゼ1鍗曞厓101瀹?)
        },
        shippingInfo: {
          company: i18n.translate('椤轰赴蹇€?),
          trackingNumber: 'SF1234567890',
          shippingFee: '10.00'
        },
        pointsDeduction: {
          points: 500,
          amount: '5.00'
        },
        finalAmount: '194.00',
        items: [
          {
            id: 1,
            name: i18n.translate('浼樿川鍟嗗搧A'),
            image: '/images/placeholder.svg',
            price: '99.00',
            quantity: 1,
            specs: {
              '棰滆壊': i18n.translate('绾㈣壊'),
              '灏哄': 'M'
            }
          },
          {
            id: 2,
            name: i18n.translate('浼樿川鍟嗗搧B'),
            image: '/images/placeholder.svg',
            price: '100.00',
            quantity: 1,
            specs: {
              '棰滆壊': i18n.translate('钃濊壊'),
              '灏哄': 'L'
            }
          }
        ]
      };

      this.setData({
        order: mockOrder,
        loading: false,
        orderTimer: null
      });
      
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ orderTimer });
  },

  /**
   * 鍔犺浇鐗╂祦淇℃伅
   * @param {string} id - 订单ID
   * @returns {void}
   */
  loadLogistics(id) {
    this.setData({ loading: true });
    const logisticsTimer = setTimeout(() => {
      const mockLogistics = [
        {
          time: '2023-09-29 10:15:00',
          status: i18n.translate('宸插彂璐?),
          description: i18n.translate('鎮ㄧ殑订单宸插彂璐э紝椤轰赴蹇€掑崟鍙凤細SF1234567890')
        },
        {
          time: '2023-09-29 18:30:00',
          status: i18n.translate('杩愯緭涓?),
          description: i18n.translate('鎮ㄧ殑蹇€掑凡鍒拌揪鍖椾含杞繍涓績')
        },
        {
          time: '2023-09-30 09:20:00',
          status: i18n.translate('娲鹃€佷腑'),
          description: i18n.translate('蹇€掑憳姝ｅ湪娲鹃€侊紝璇蜂繚鎸佺數璇濈晠閫?)
        }
      ];

      this.setData({
        logistics: mockLogistics,
        showLogistics: true,
        loading: false,
        logisticsTimer: null
      });
    }, 300);
    
    this.setData({ logisticsTimer });
  },

  /**
   * 闅愯棌鐗╂祦淇℃伅
   * @returns {void}
   */
  hideLogistics() {
    this.setData({ showLogistics: false });
  },

  /**
   * 澶嶅埗订单鍙?   * @returns {void}
   */
  copyOrderId() {
    wx.setClipboardData({
      data: this.data.orderId,
      success: () => {
        wx.showToast({
          title: i18n.translate('宸插鍒跺埌鍓创鏉?),
          icon: 'success'
        });
      }
    });
  },

  /**
   * 澶嶅埗蹇€掑崟鍙?   * @returns {void}
   */
  copyTrackingNumber() {
    const { trackingNumber } = this.data.order.shippingInfo;
    wx.setClipboardData({
      data: trackingNumber,
      success: () => {
        wx.showToast({
          title: i18n.translate('宸插鍒跺埌鍓创鏉?),
          icon: 'success'
        });
      }
    });
  },

  /**
   * 鑱旂郴瀹㈡湇
   * @returns {void}
   */
  contactService() {
    wx.showToast({
      title: i18n.translate('璺宠浆鍒板鏈嶉〉闈?),
      icon: 'none'
    });
  },

  /**
   * 鍙栨秷订单
   * @returns {void}
   */
  cancelOrder() {
    wx.showModal({
      title: i18n.translate('鎻愮ず'),
      content: i18n.translate('纭畾瑕佸彇娑堣订单鍚楋紵'),
      success: (res) => {
        if (res.confirm) {
          // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI鍙栨秷订单
          wx.showToast({
            title: i18n.translate('订单宸插彇娑?),
            icon: 'success'
          });
          this.loadOrderDetail(this.data.orderId);
        }
      }
    });
  },

  /**
   * 绔嬪嵆浠樻
   * @returns {void}
   */
  payOrder() {
    // 瀹為檯椤圭洰涓簲璇ヨ烦杞埌鏀粯椤甸潰
    wx.showToast({
      title: i18n.translate('璺宠浆鍒版敮浠橀〉闈?),
      icon: 'none'
    });
  },

  /**
   * 纭鏀惰揣
   * @returns {void}
   */
  confirmReceipt() {
    wx.showModal({
      title: i18n.translate('鎻愮ず'),
      content: i18n.translate('纭宸叉敹鍒板晢鍝佸悧锛?),
      success: (res) => {
        if (res.confirm) {
          // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI纭鏀惰揣
          wx.showToast({
            title: i18n.translate('宸茬‘璁ゆ敹璐?),
            icon: 'success'
          });
          this.loadOrderDetail(this.data.orderId);
        }
      }
    });
  },

  /**
   * 鐢宠鍞悗
   * @returns {void}
   */
  applyAfterSale() {
    // 瀹為檯椤圭洰涓簲璇ヨ烦杞埌鍞悗椤甸潰
    wx.showToast({
      title: i18n.translate('璺宠浆鍒板敭鍚庨〉闈?),
      icon: 'none'
    });
  },

  /**
   * 璇勪环订单
   * @returns {void}
   */
  reviewOrder() {
    // 瀹為檯椤圭洰涓簲璇ヨ烦杞埌璇勪环椤甸潰
    wx.navigateTo({
      url: `/pages/order/review/review?orderId=${this.data.orderId}`
    });
  },

  /**
   * 鍐嶆购买
   * @returns {void}
   */
  buyAgain() {
    // 瀹為檯椤圭洰涓簲璇ュ皢鍟嗗搧娣诲姞鍒拌喘鐗╄溅
    wx.showToast({
      title: i18n.translate('宸叉坊鍔犲埌璐墿杞?),
      icon: 'success'
    });
  },

  /**
   * 鐢宠閫€娆?   * @returns {void}
   */
  applyRefund() {
    const { order } = this.data;
    
    wx.showModal({
      title: i18n.translate('鐢宠閫€娆?),
      content: i18n.translate('纭畾瑕佺敵璇烽€€娆惧悧锛?),
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          // 妯℃嫙閫€娆惧鐞?          setTimeout(() => {
            // 濡傛灉订单浣跨敤浜嗙Н鍒嗘姷鎵ｏ紝璋冪敤绉垎閫€娆惧洖閫€鎺ュ彛
            if (order.pointsDeduction && order.pointsDeduction.points > 0) {
              this.refundPoints(order.id, order.pointsDeduction.points);
            }
            
            this.setData({ loading: false });
            
            wx.showToast({
              title: i18n.translate('閫€娆剧敵璇峰凡鎻愪氦'),
              icon: 'success'
            });
            
            // 鍒锋柊订单璇︽儏
            this.loadOrderDetail(order.id);
          }, 1000);
        }
      }
    });
  },

  /**
   * 绉垎閫€娆惧洖閫€
   * @param {string} orderId - 订单ID
   * @param {number} points - 鍥為€€绉垎鏁伴噺
   * @returns {void}
   */
  refundPoints(orderId, points) {
    // 璋冪敤绉垎鏈嶅姟鐨勯€€娆惧洖閫€鎺ュ彛
    PointsService.refundPoints({
      orderId: orderId,
      points: points
    }).then(result => {
      // 绉垎閫€娆惧洖閫€鎴愬姛锛屾棤闇€棰濆澶勭悊
    }).catch(error => {
      // 绉垎閫€娆惧洖閫€澶辫触锛屽彲浠ヨ€冭檻璁板綍鏃ュ織鎴栧叾浠栧鐞?    });
  }
});
