/**
 * 文件名 confirm.js
 * 版本号 1.0.1
 * 更新日期: 2025-11-27
 * 璁㈠崟绾喛顓绘い鐢告桨
 */
const i18n = require('../../../utils/i18n');
const PointsService = require('../../../services/pointsService');

Page({
  data: {
    i18n: i18n,
    loading: false,
    productId: null,
    quantity: 1,
    product: null,
    address: null,
    paymentMethod: 'wechat',
    remark: '',
    totalAmount: '0.00',
    shippingFee: '0.00',
    finalAmount: '0.00',
    productTimer: null,
    addressTimer: null,
    submitTimer: null,
    userPoints: null,
    maxDeductiblePoints: 0,
    deductionPoints: 0,
    deductionAmount: '0.00',
    pointsTimer: null,
    paymentMethods: [
      {
        id: 'wechat',
        name: i18n.translate('瀵邦喕淇婇弨顖欑帛'),
        icon: '/images/wechat-pay.png'
      },
      {
        id: 'alipay',
        name: i18n.translate('閺€顖欑帛鐎?),
        icon: '/images/alipay.png'
      }
    ]
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.productId - 閸熷棗鎼D
   * @param {string} options.quantity - 閸熷棗鎼ч弫浼村櫤
   * @returns {void}
   */
  onLoad(options) {
    if (options.productId) {
      this.setData({ 
        productId: options.productId,
        quantity: parseInt(options.quantity) || 1
      });
      this.loadProductDetail(options.productId);
    }
    
    this.loadDefaultAddress();
    this.loadUserPoints();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婇幍鈧張澶婄暰閺冭泛娅掗敍宀勬Щ濮濄垹鍞寸€涙ɑ纭犲?    if (this.data.productTimer) {
      clearTimeout(this.data.productTimer);
    }
    if (this.data.addressTimer) {
      clearTimeout(this.data.addressTimer);
    }
    if (this.data.submitTimer) {
      clearTimeout(this.data.submitTimer);
    }
    if (this.data.pointsTimer) {
      clearTimeout(this.data.pointsTimer);
    }
  },

  /**
   * 閸旂姾娴囬悽銊﹀煕缁夘垰鍨庢穱鈩冧紖
   * @returns {void}
   */
  loadUserPoints() {
    this.setData({ loading: true });
    PointsService.getUserPoints()
      .then(result => {
        this.setData({
          userPoints: result.data,
          loading: false
        });
        
        // 鐠侊紕鐣婚崣顖涘Х閹碉絿袧閸掑棔绗傞梽?        this.calculateDeductiblePoints();
      })
      .catch(error => {
        console.error('閼惧嘲褰囬悽銊﹀煕缁夘垰鍨庢径杈Е:', error);
        this.setData({ loading: false });
        
        // 閸戞椽鏁婇弮鏈靛▏閻劑绮拋銈呪偓?        this.setData({
          userPoints: {
            available: 0,
            total: 0,
            expiring: 0
          },
          maxDeductiblePoints: 0
        });
      });
  },

  /**
   * 妞ょ敻娼伴弰鍓с仛閺冩儼袝閸?   * @returns {void}
   */
  onShow() {
    // 娴犲骸婀撮崸鈧柅澶嬪妞ょ敻娼版潻鏂挎礀閺冭泛鍩涢弬鏉挎勾閸р偓娣団剝浼?    this.loadDefaultAddress();
  },

  /**
   * 閸旂姾娴囬崯鍡楁惂鐠囷附鍎?   * @param {string} id - 閸熷棗鎼D
   * @returns {void}
   */
  loadProductDetail(id) {
    this.setData({ loading: true });
    const productTimer = setTimeout(() => {
      const mockProduct = {
        id: id,
        name: i18n.translate('娴兼宸濋崯鍡楁惂'),
        image: '/images/placeholder.svg',
        price: '99.00',
        specs: {
          '妫版粏澹?: i18n.translate('缁俱垼澹?),
          '鐏忓搫顕?: 'M'
        }
      };

      const totalAmount = (parseFloat(mockProduct.price) * this.data.quantity).toFixed(2);
      const shippingFee = '10.00';
      const finalAmount = (parseFloat(totalAmount) + parseFloat(shippingFee)).toFixed(2);

      this.setData({
        product: mockProduct,
        totalAmount,
        shippingFee,
        finalAmount,
        loading: false,
        productTimer: null
      });
      
      // 鐠侊紕鐣婚崣顖涘Х閹碉絿袧閸掑棔绗傞梽?      if (this.data.userPoints) {
        this.calculateDeductiblePoints();
      }
    }, 300);
    
    this.setData({ productTimer });
  },

  /**
   * 鐠侊紕鐣婚崣顖涘Х閹碉絿袧閸掑棔绗傞梽?   * @returns {void}
   */
  calculateDeductiblePoints() {
    const { totalAmount } = this.data;
    
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      this.setData({
        maxDeductiblePoints: 0,
        deductionPoints: 0
      });
      this.calculateDeduction();
      return;
    }
    
    PointsService.calculateDeductiblePoints({
      orderAmount: parseFloat(totalAmount)
    })
      .then(result => {
        const { maxDeductiblePoints } = result.data;
        this.setData({
          maxDeductiblePoints,
          deductionPoints: Math.min(this.data.deductionPoints, maxDeductiblePoints) // 绾喕绻氳ぐ鎾冲閹跺灚澧哥粔顖氬瀻娑撳秷绉存潻鍥ㄦ煀閻ㄥ嫪绗傞梽?        });
        this.calculateDeduction();
      })
      .catch(error => {
        console.error('鐠侊紕鐣婚崣顖涘Х閹碉絿袧閸掑棗銇戠拹?', error);
        // 閸戞椽鏁婇弮鍫曠帛鐠併倓濞囬悽銊ф暏閹村嘲褰查悽銊濋崚鍡欐畱50%娴ｆ粈璐熸稉濠囨
        const maxPoints = this.data.userPoints ? Math.floor(this.data.userPoints.available * 0.5) : 0;
        this.setData({
          maxDeductiblePoints: maxPoints,
          deductionPoints: Math.min(this.data.deductionPoints, maxPoints)
        });
        this.calculateDeduction();
      });
  },

  /**
   * 鐠侊紕鐣荤粔顖氬瀻閹跺灚澧搁柌鎴︻杺
   * @returns {void}
   */
  calculateDeduction() {
    const { deductionPoints, totalAmount, shippingFee } = this.data;
    
    if (deductionPoints <= 0) {
      this.setData({
        deductionAmount: '0.00',
        finalAmount: (parseFloat(totalAmount) + parseFloat(shippingFee)).toFixed(2)
      });
      return;
    }
    
    // 娴ｈ法鏁ゆ妯款吇鐠侊紕鐣婚弬鐟扮础閿?00缁夘垰鍨庨幎鍨⒏1閸忓喛绱氶敍灞界杽闂勫懏濮烽幍锝夊櫨妫版繂鐨㈤崷銊﹀絹娴溿倛顓归崡鏇熸閻㈠崬鎮楃粩顖濐吀缁?    const deductionAmount = (deductionPoints / 100).toFixed(2);
    const total = parseFloat(totalAmount) + parseFloat(shippingFee);
    const finalAmount = Math.max(0, total - parseFloat(deductionAmount)).toFixed(2);
    
    this.setData({
      deductionAmount,
      finalAmount
    });
  },

  /**
   * 缁夘垰鍨庡鎴濇健閸欐ê瀵叉禍瀣╂
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  onPointsChange(e) {
    const points = parseInt(e.detail.value);
    this.setData({ deductionPoints: points });
    this.calculateDeduction();
  },

  /**
   * 缁夘垰鍨庢潏鎾冲弳濡楀棗褰夐崠鏍︾皑娴?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  onPointsInput(e) {
    let points = parseInt(e.detail.value) || 0;
    const { maxDeductiblePoints } = this.data;
    
    // 绾喕绻氱粔顖氬瀻娑撳秷绉存潻鍥ㄦ付婢堆冨讲閹跺灚澧哥粔顖氬瀻
    points = Math.min(Math.max(0, points), maxDeductiblePoints);
    
    this.setData({ deductionPoints: points });
    this.calculateDeduction();
  },

  /**
   * 閸旂姾娴囨妯款吇閸︽澘娼?   * @returns {void}
   */
  loadDefaultAddress() {
    const addressTimer = setTimeout(() => {
      const mockAddress = {
        id: 1,
        name: i18n.translate('瀵姳绗?),
        phone: '13800138000',
        province: i18n.translate('閸栨ぞ鍚敮?),
        city: i18n.translate('閸栨ぞ鍚敮?),
        district: i18n.translate('閺堟繈妲奸崠?),
        detail: i18n.translate('閺屾劖鐓囩悰妤呬壕閺屾劖鐓囩亸蹇撳隘1閸欓攱銈?閸楁洖鍘?01鐎?),
        isDefault: true
      };

      this.setData({ 
        address: mockAddress,
        addressTimer: null
      });
    }, 300);
    
    this.setData({ addressTimer });
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎勾閸р偓闁瀚ㄦい鐢告桨
   * @returns {void}
   */
  goToAddressSelection() {
    wx.navigateTo({
      url: '/pages/user/address/list/list?select=true'
    });
  },

  /**
   * 闁瀚ㄦ敮浠樻柟寮?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    this.setData({ paymentMethod: method });
  },

  /**
   * 閺囧瓨鏌婃径鍥ㄦ暈娣団剝浼?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  updateRemark(e) {
    this.setData({ remark: e.detail.value });
  },

  /**
   * 閹绘劒姘﹁鍗?   * @returns {void}
   */
  submitOrder() {
    const { product, quantity, address, paymentMethod, remark, deductionPoints } = this.data;
    
    // 濡偓閺屻儲妲搁崥锕傗偓澶嬪娴滃棗婀撮崸鈧?    if (!address) {
      wx.showToast({
        title: i18n.translate('鐠囩兘鈧瀚ㄦ敹璐у湴鍧€'),
        icon: 'none'
      });
      return;
    }
    
    // 濡偓閺屻儱鏅㈤崫浣蜂繆閹垱妲搁崥锕€鐣弫?    if (!product) {
      wx.showToast({
        title: i18n.translate('浜у搧淇℃伅娑撳秴鐣弫?),
        icon: 'none'
      });
      return;
    }
    
    // 閺嬪嫬缂撹鍗曢弫鐗堝祦
    const orderData = {
      items: [{
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: quantity,
        specs: product.specs
      }],
      address: address,
      paymentMethod: paymentMethod,
      remark: remark,
      totalAmount: this.data.totalAmount,
      shippingFee: this.data.shippingFee,
      finalAmount: this.data.finalAmount,
      pointsDeduction: {
        points: deductionPoints,
        amount: this.data.deductionAmount
      }
    };
    
    this.setData({ loading: true });
    
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I閹绘劒姘﹁鍗?    const submitTimer = setTimeout(() => {
      this.setData({ loading: false });
      
      // 濡剝瀚欒鍗曢幓鎰唉閹存劕濮?      const orderId = 'ORD' + new Date().getTime();
      
      // 婵″倹鐏夋担璺ㄦ暏娴滃棛袧閸掑棙濮烽幍锝忕礉鐠嬪啰鏁ょ粔顖氬瀻閹跺灚澧窤PI
      if (deductionPoints > 0) {
        this.usePointsForDeduction(orderId, deductionPoints);
      }
      
      wx.showToast({
        title: i18n.translate('璁㈠崟閹绘劒姘﹂幋鎰'),
        icon: 'success',
        duration: 1500,
        success: () => {
          // 鐠哄疇娴嗛崚鐗堟暜娴犳﹢銆夐棃銏″灗璁㈠崟鐠囷附鍎忔い?          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/order/detail/detail?id=${orderId}`
            });
          }, 1500);
        }
      });
      
      this.setData({ submitTimer: null });
    }, 1000);
    
    this.setData({ submitTimer });
  },

  /**
   * 娴ｈ法鏁ょ粔顖氬瀻閹跺灚澧?   * @param {string} orderId - 璁㈠崟ID
   * @param {number} points - 閹跺灚澧哥粔顖氬瀻閺佷即鍣?   * @returns {void}
   */
  usePointsForDeduction(orderId, points) {
    // 鐠嬪啰鏁ょ粔顖氬瀻閺堝秴濮熼惃鍕Х閹碉絾甯撮崣?    PointsService.usePointsForDeduction({
      orderId: orderId,
      points: points
    }).then(result => {
      // 缁夘垰鍨庨幎鍨⒏閹存劕濮涢敍灞炬￥闂団偓妫版繂顦绘径鍕倞
    }).catch(error => {
      // 缁夘垰鍨庨幎鍨⒏婢惰精瑙﹂敍灞藉讲娴犮儴鈧啳妾婚崶鐐寸泊璁㈠崟閹存牕鍙炬禒鏍ь槱閻?    });
  }
});
