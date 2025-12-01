/**
 * 文件名 detail.js
 * 版本号 1.0.1
 * 更新日期: 2025-11-27
 * 璁㈠崟鐠囷附鍎忔い鐢告桨
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.id - 璁㈠崟ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadOrderDetail(options.id);
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婇幍鈧張澶婄暰閺冭泛娅掗敍宀勬Щ濮濄垹鍞寸€涙ɑ纭犲?    if (this.data.orderTimer) {
      clearTimeout(this.data.orderTimer);
    }
    if (this.data.logisticsTimer) {
      clearTimeout(this.data.logisticsTimer);
    }
  },

  /**
   * 妞ょ敻娼伴弰鍓с仛閺冩儼袝閸?   * @returns {void}
   */
  onShow() {
    // 閸欘垯浜掗崷銊︻劃婢跺嫬鍩涢弬浼村劥閸掑棙鏆熼幑?  },

  /**
   * 娑撳濯洪崚閿嬫煀閸ョ偠鐨?   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadOrderDetail(this.data.orderId, () => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 閸旂姾娴囪鍗曠拠锔藉剰
   * @param {string} id - 璁㈠崟ID
   * @param {Function} done - 鐎瑰本鍨氶崶鐐剁殶
   * @returns {void}
   */
  loadOrderDetail(id, done) {
    this.setData({ loading: true });
    const orderTimer = setTimeout(() => {
      const mockOrder = {
        id: id,
        status: 'shipped',
        statusText: i18n.translate('瀹告彃褰傜拹?),
        createTime: '2023-09-28 14:20:00',
        payTime: '2023-09-28 14:25:00',
        shipTime: '2023-09-29 10:15:00',
        totalAmount: '199.00',
        paymentMethod: i18n.translate('瀵邦喕淇婇弨顖欑帛'),
        shippingAddress: {
          name: i18n.translate('瀵姳绗?),
          phone: '13800138000',
          address: i18n.translate('閸栨ぞ鍚敮鍌涙篂闂冨啿灏弻鎰厙鐞涙浜鹃弻鎰厙鐏忓繐灏?閸欓攱銈?閸楁洖鍘?01鐎?)
        },
        shippingInfo: {
          company: i18n.translate('妞よ桨璧磋箛顐︹偓?),
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
            name: i18n.translate('娴兼宸濋崯鍡楁惂A'),
            image: '/images/placeholder.svg',
            price: '99.00',
            quantity: 1,
            specs: {
              '妫版粏澹?: i18n.translate('缁俱垼澹?),
              '鐏忓搫顕?: 'M'
            }
          },
          {
            id: 2,
            name: i18n.translate('娴兼宸濋崯鍡楁惂B'),
            image: '/images/placeholder.svg',
            price: '100.00',
            quantity: 1,
            specs: {
              '妫版粏澹?: i18n.translate('閽冩繆澹?),
              '鐏忓搫顕?: 'L'
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
   * 閸旂姾娴囬悧鈺傜ウ娣団剝浼?   * @param {string} id - 璁㈠崟ID
   * @returns {void}
   */
  loadLogistics(id) {
    this.setData({ loading: true });
    const logisticsTimer = setTimeout(() => {
      const mockLogistics = [
        {
          time: '2023-09-29 10:15:00',
          status: i18n.translate('瀹告彃褰傜拹?),
          description: i18n.translate('閹劎娈戣鍗曞鎻掑絺鐠愌嶇礉妞よ桨璧磋箛顐︹偓鎺戝礋閸欏嚖绱癝F1234567890')
        },
        {
          time: '2023-09-29 18:30:00',
          status: i18n.translate('鏉╂劘绶稉?),
          description: i18n.translate('閹劎娈戣箛顐︹偓鎺戝嚒閸掓媽鎻崠妞惧惈鏉烆剝绻嶆稉顓炵妇')
        },
        {
          time: '2023-09-30 09:20:00',
          status: i18n.translate('濞查箖鈧椒鑵?),
          description: i18n.translate('韫囶偊鈧帒鎲冲锝呮躬濞查箖鈧緤绱濈拠铚傜箽閹镐胶鏁哥拠婵堟櫊闁?)
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
   * 闂呮劘妫岄悧鈺傜ウ娣団剝浼?   * @returns {void}
   */
  hideLogistics() {
    this.setData({ showLogistics: false });
  },

  /**
   * 婢跺秴鍩楄鍗曢崣?   * @returns {void}
   */
  copyOrderId() {
    wx.setClipboardData({
      data: this.data.orderId,
      success: () => {
        wx.showToast({
          title: i18n.translate('瀹告彃顦查崚璺哄煂閸擃亣鍒涢弶?),
          icon: 'success'
        });
      }
    });
  },

  /**
   * 婢跺秴鍩楄箛顐︹偓鎺戝礋閸?   * @returns {void}
   */
  copyTrackingNumber() {
    const { trackingNumber } = this.data.order.shippingInfo;
    wx.setClipboardData({
      data: trackingNumber,
      success: () => {
        wx.showToast({
          title: i18n.translate('瀹告彃顦查崚璺哄煂閸擃亣鍒涢弶?),
          icon: 'success'
        });
      }
    });
  },

  /**
   * 閼辨梻閮寸€广垺婀?   * @returns {void}
   */
  contactService() {
    wx.showToast({
      title: i18n.translate('鐠哄疇娴嗛崚鏉款吂閺堝秹銆夐棃?),
      icon: 'none'
    });
  },

  /**
   * 閸欐牗绉疯鍗?   * @returns {void}
   */
  cancelOrder() {
    wx.showModal({
      title: i18n.translate('閹绘劗銇?),
      content: i18n.translate('绾喖鐣剧憰浣稿絿濞戝牐顕氳鍗曢崥妤嬬吹'),
      success: (res) => {
        if (res.confirm) {
          // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I閸欐牗绉疯鍗?          wx.showToast({
            title: i18n.translate('璁㈠崟瀹告彃褰囧☉?),
            icon: 'success'
          });
          this.loadOrderDetail(this.data.orderId);
        }
      }
    });
  },

  /**
   * 缁斿宓嗘禒妯活儥
   * @returns {void}
   */
  payOrder() {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ儲鏉烆剙鍩岄弨顖欑帛妞ょ敻娼?    wx.showToast({
      title: i18n.translate('鐠哄疇娴嗛崚鐗堟暜娴犳﹢銆夐棃?),
      icon: 'none'
    });
  },

  /**
   * 绾喛顓婚弨鎯版彛
   * @returns {void}
   */
  confirmReceipt() {
    wx.showModal({
      title: i18n.translate('閹绘劗銇?),
      content: i18n.translate('绾喛顓诲鍙夋暪閸掓澘鏅㈤崫浣告偋閿?),
      success: (res) => {
        if (res.confirm) {
          // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I绾喛顓婚弨鎯版彛
          wx.showToast({
            title: i18n.translate('瀹歌尙鈥樼拋銈嗘暪鐠?),
            icon: 'success'
          });
          this.loadOrderDetail(this.data.orderId);
        }
      }
    });
  },

  /**
   * 閻㈠疇顕崬顔兼倵
   * @returns {void}
   */
  applyAfterSale() {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ儲鏉烆剙鍩岄崬顔兼倵妞ょ敻娼?    wx.showToast({
      title: i18n.translate('鐠哄疇娴嗛崚鏉挎暛閸氬酣銆夐棃?),
      icon: 'none'
    });
  },

  /**
   * 鐠囧嫪鐜鍗?   * @returns {void}
   */
  reviewOrder() {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ儲鏉烆剙鍩岀拠鍕幆妞ょ敻娼?    wx.navigateTo({
      url: `/pages/order/review/review?orderId=${this.data.orderId}`
    });
  },

  /**
   * 閸愬秵顐艰喘涔?   * @returns {void}
   */
  buyAgain() {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ョ殺閸熷棗鎼уǎ璇插閸掓媽鍠橀悧鈺勬簠
    wx.showToast({
      title: i18n.translate('瀹稿弶鍧婇崝鐘插煂鐠愵厾澧挎潪?),
      icon: 'success'
    });
  },

  /**
   * 閻㈠疇顕柅鈧▎?   * @returns {void}
   */
  applyRefund() {
    const { order } = this.data;
    
    wx.showModal({
      title: i18n.translate('閻㈠疇顕柅鈧▎?),
      content: i18n.translate('绾喖鐣剧憰浣烘暤鐠囩兘鈧偓濞嗘儳鎮ч敍?),
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          // 濡剝瀚欓柅鈧▎鎯ь槱閻?          setTimeout(() => {
            // 婵″倹鐏夎鍗曟担璺ㄦ暏娴滃棛袧閸掑棙濮烽幍锝忕礉鐠嬪啰鏁ょ粔顖氬瀻闁偓濞嗘儳娲栭柅鈧幒銉ュ經
            if (order.pointsDeduction && order.pointsDeduction.points > 0) {
              this.refundPoints(order.id, order.pointsDeduction.points);
            }
            
            this.setData({ loading: false });
            
            wx.showToast({
              title: i18n.translate('闁偓濞嗗墽鏁电拠宄板嚒閹绘劒姘?),
              icon: 'success'
            });
            
            // 閸掗攱鏌婅鍗曠拠锔藉剰
            this.loadOrderDetail(order.id);
          }, 1000);
        }
      }
    });
  },

  /**
   * 缁夘垰鍨庨柅鈧▎鎯ф礀闁偓
   * @param {string} orderId - 璁㈠崟ID
   * @param {number} points - 閸ョ偤鈧偓缁夘垰鍨庨弫浼村櫤
   * @returns {void}
   */
  refundPoints(orderId, points) {
    // 鐠嬪啰鏁ょ粔顖氬瀻閺堝秴濮熼惃鍕偓鈧▎鎯ф礀闁偓閹恒儱褰?    PointsService.refundPoints({
      orderId: orderId,
      points: points
    }).then(result => {
      // 缁夘垰鍨庨柅鈧▎鎯ф礀闁偓閹存劕濮涢敍灞炬￥闂団偓妫版繂顦绘径鍕倞
    }).catch(error => {
      // 缁夘垰鍨庨柅鈧▎鎯ф礀闁偓婢惰精瑙﹂敍灞藉讲娴犮儴鈧啳妾荤拋鏉跨秿閺冦儱绻旈幋鏍у従娴犳牕顦╅悶?    });
  }
});
