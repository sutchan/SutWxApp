/**
 * 文件名: confirm.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-27
 * 订单纭椤甸潰
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
        name: i18n.translate('寰俊鏀粯'),
        icon: '/images/wechat-pay.png'
      },
      {
        id: 'alipay',
        name: i18n.translate('鏀粯瀹?),
        icon: '/images/alipay.png'
      }
    ]
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.productId - 鍟嗗搧ID
   * @param {string} options.quantity - 鍟嗗搧鏁伴噺
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊鎵€鏈夊畾鏃跺櫒锛岄槻姝㈠唴瀛樻硠婕?    if (this.data.productTimer) {
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
   * 鍔犺浇鐢ㄦ埛绉垎淇℃伅
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
        
        // 璁＄畻鍙姷鎵ｇН鍒嗕笂闄?        this.calculateDeductiblePoints();
      })
      .catch(error => {
        console.error('鑾峰彇鐢ㄦ埛绉垎澶辫触:', error);
        this.setData({ loading: false });
        
        // 鍑洪敊鏃朵娇鐢ㄩ粯璁ゅ€?        this.setData({
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
   * 椤甸潰鏄剧ず鏃惰Е鍙?   * @returns {void}
   */
  onShow() {
    // 浠庡湴鍧€閫夋嫨椤甸潰杩斿洖鏃跺埛鏂板湴鍧€淇℃伅
    this.loadDefaultAddress();
  },

  /**
   * 鍔犺浇鍟嗗搧璇︽儏
   * @param {string} id - 鍟嗗搧ID
   * @returns {void}
   */
  loadProductDetail(id) {
    this.setData({ loading: true });
    const productTimer = setTimeout(() => {
      const mockProduct = {
        id: id,
        name: i18n.translate('浼樿川鍟嗗搧'),
        image: '/images/placeholder.svg',
        price: '99.00',
        specs: {
          '棰滆壊': i18n.translate('绾㈣壊'),
          '灏哄': 'M'
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
      
      // 璁＄畻鍙姷鎵ｇН鍒嗕笂闄?      if (this.data.userPoints) {
        this.calculateDeductiblePoints();
      }
    }, 300);
    
    this.setData({ productTimer });
  },

  /**
   * 璁＄畻鍙姷鎵ｇН鍒嗕笂闄?   * @returns {void}
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
          deductionPoints: Math.min(this.data.deductionPoints, maxDeductiblePoints) // 纭繚褰撳墠鎶垫墸绉垎涓嶈秴杩囨柊鐨勪笂闄?        });
        this.calculateDeduction();
      })
      .catch(error => {
        console.error('璁＄畻鍙姷鎵ｇН鍒嗗け璐?', error);
        // 鍑洪敊鏃堕粯璁や娇鐢ㄧ敤鎴峰彲鐢ㄧН鍒嗙殑50%浣滀负涓婇檺
        const maxPoints = this.data.userPoints ? Math.floor(this.data.userPoints.available * 0.5) : 0;
        this.setData({
          maxDeductiblePoints: maxPoints,
          deductionPoints: Math.min(this.data.deductionPoints, maxPoints)
        });
        this.calculateDeduction();
      });
  },

  /**
   * 璁＄畻绉垎鎶垫墸閲戦
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
    
    // 浣跨敤榛樿璁＄畻鏂瑰紡锛?00绉垎鎶垫墸1鍏冿級锛屽疄闄呮姷鎵ｉ噾棰濆皢鍦ㄦ彁浜よ鍗曟椂鐢卞悗绔绠?    const deductionAmount = (deductionPoints / 100).toFixed(2);
    const total = parseFloat(totalAmount) + parseFloat(shippingFee);
    const finalAmount = Math.max(0, total - parseFloat(deductionAmount)).toFixed(2);
    
    this.setData({
      deductionAmount,
      finalAmount
    });
  },

  /**
   * 绉垎婊戝潡鍙樺寲浜嬩欢
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  onPointsChange(e) {
    const points = parseInt(e.detail.value);
    this.setData({ deductionPoints: points });
    this.calculateDeduction();
  },

  /**
   * 绉垎杈撳叆妗嗗彉鍖栦簨浠?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  onPointsInput(e) {
    let points = parseInt(e.detail.value) || 0;
    const { maxDeductiblePoints } = this.data;
    
    // 纭繚绉垎涓嶈秴杩囨渶澶у彲鎶垫墸绉垎
    points = Math.min(Math.max(0, points), maxDeductiblePoints);
    
    this.setData({ deductionPoints: points });
    this.calculateDeduction();
  },

  /**
   * 鍔犺浇榛樿鍦板潃
   * @returns {void}
   */
  loadDefaultAddress() {
    const addressTimer = setTimeout(() => {
      const mockAddress = {
        id: 1,
        name: i18n.translate('寮犱笁'),
        phone: '13800138000',
        province: i18n.translate('鍖椾含甯?),
        city: i18n.translate('鍖椾含甯?),
        district: i18n.translate('鏈濋槼鍖?),
        detail: i18n.translate('鏌愭煇琛楅亾鏌愭煇灏忓尯1鍙锋ゼ1鍗曞厓101瀹?),
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
   * 璺宠浆鍒板湴鍧€閫夋嫨椤甸潰
   * @returns {void}
   */
  goToAddressSelection() {
    wx.navigateTo({
      url: '/pages/user/address/list/list?select=true'
    });
  },

  /**
   * 閫夋嫨支付方式
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    this.setData({ paymentMethod: method });
  },

  /**
   * 鏇存柊澶囨敞淇℃伅
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  updateRemark(e) {
    this.setData({ remark: e.detail.value });
  },

  /**
   * 鎻愪氦订单
   * @returns {void}
   */
  submitOrder() {
    const { product, quantity, address, paymentMethod, remark, deductionPoints } = this.data;
    
    // 妫€鏌ユ槸鍚﹂€夋嫨浜嗗湴鍧€
    if (!address) {
      wx.showToast({
        title: i18n.translate('璇烽€夋嫨收货地址'),
        icon: 'none'
      });
      return;
    }
    
    // 妫€鏌ュ晢鍝佷俊鎭槸鍚﹀畬鏁?    if (!product) {
      wx.showToast({
        title: i18n.translate('产品信息涓嶅畬鏁?),
        icon: 'none'
      });
      return;
    }
    
    // 鏋勫缓订单鏁版嵁
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
    
    // 瀹為檯椤圭洰涓簲璇ヨ皟鐢ˋPI鎻愪氦订单
    const submitTimer = setTimeout(() => {
      this.setData({ loading: false });
      
      // 妯℃嫙订单鎻愪氦鎴愬姛
      const orderId = 'ORD' + new Date().getTime();
      
      // 濡傛灉浣跨敤浜嗙Н鍒嗘姷鎵ｏ紝璋冪敤绉垎鎶垫墸API
      if (deductionPoints > 0) {
        this.usePointsForDeduction(orderId, deductionPoints);
      }
      
      wx.showToast({
        title: i18n.translate('订单鎻愪氦鎴愬姛'),
        icon: 'success',
        duration: 1500,
        success: () => {
          // 璺宠浆鍒版敮浠橀〉闈㈡垨订单璇︽儏椤?          setTimeout(() => {
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
   * 浣跨敤绉垎鎶垫墸
   * @param {string} orderId - 订单ID
   * @param {number} points - 鎶垫墸绉垎鏁伴噺
   * @returns {void}
   */
  usePointsForDeduction(orderId, points) {
    // 璋冪敤绉垎鏈嶅姟鐨勬姷鎵ｆ帴鍙?    PointsService.usePointsForDeduction({
      orderId: orderId,
      points: points
    }).then(result => {
      // 绉垎鎶垫墸鎴愬姛锛屾棤闇€棰濆澶勭悊
    }).catch(error => {
      // 绉垎鎶垫墸澶辫触锛屽彲浠ヨ€冭檻鍥炴粴订单鎴栧叾浠栧鐞?    });
  }
});
