/**
 * 文件名: confirm.js
 * 版本号: 1.0.1
 * 更新日期: 2025-11-27
 * 订单确认页面
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
        name: i18n.translate('微信支付'),
        icon: '/images/wechat-pay.png'
      },
      {
        id: 'alipay',
        name: i18n.translate('支付宝'),
        icon: '/images/alipay.png'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.productId - 商品ID
   * @param {string} options.quantity - 商品数量
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
   * 生命周期函数--监听页面卸载
   * @returns {void}
   */
  onUnload() {
    // 清理所有定时器，防止内存泄漏
    if (this.data.productTimer) {
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
   * 加载用户积分信息
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
        
        // 计算可抵扣积分上限
        this.calculateDeductiblePoints();
      })
      .catch(error => {
        console.error('获取用户积分失败:', error);
        this.setData({ loading: false });
        
        // 出错时使用默认值
        this.setData({
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
   * 页面显示时触发
   * @returns {void}
   */
  onShow() {
    // 从地址选择页面返回时刷新地址信息
    this.loadDefaultAddress();
  },

  /**
   * 加载商品详情
   * @param {string} id - 商品ID
   * @returns {void}
   */
  loadProductDetail(id) {
    this.setData({ loading: true });
    const productTimer = setTimeout(() => {
      const mockProduct = {
        id: id,
        name: i18n.translate('优质商品'),
        image: '/images/placeholder.svg',
        price: '99.00',
        specs: {
          '颜色': i18n.translate('红色'),
          '尺寸': 'M'
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
      
      // 计算可抵扣积分上限
      if (this.data.userPoints) {
        this.calculateDeductiblePoints();
      }
    }, 300);
    
    this.setData({ productTimer });
  },

  /**
   * 计算可抵扣积分上限
   * @returns {void}
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
          deductionPoints: Math.min(this.data.deductionPoints, maxDeductiblePoints) // 确保当前抵扣积分不超过新的上限
        });
        this.calculateDeduction();
      })
      .catch(error => {
        console.error('计算可抵扣积分失败:', error);
        // 出错时默认使用用户可用积分的50%作为上限
        const maxPoints = this.data.userPoints ? Math.floor(this.data.userPoints.available * 0.5) : 0;
        this.setData({
          maxDeductiblePoints: maxPoints,
          deductionPoints: Math.min(this.data.deductionPoints, maxPoints)
        });
        this.calculateDeduction();
      });
  },

  /**
   * 计算积分抵扣金额
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
    
    // 使用默认计算方式（100积分抵扣1元），实际抵扣金额将在提交订单时由后端计算
    const deductionAmount = (deductionPoints / 100).toFixed(2);
    const total = parseFloat(totalAmount) + parseFloat(shippingFee);
    const finalAmount = Math.max(0, total - parseFloat(deductionAmount)).toFixed(2);
    
    this.setData({
      deductionAmount,
      finalAmount
    });
  },

  /**
   * 积分滑块变化事件
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  onPointsChange(e) {
    const points = parseInt(e.detail.value);
    this.setData({ deductionPoints: points });
    this.calculateDeduction();
  },

  /**
   * 积分输入框变化事件
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  onPointsInput(e) {
    let points = parseInt(e.detail.value) || 0;
    const { maxDeductiblePoints } = this.data;
    
    // 确保积分不超过最大可抵扣积分
    points = Math.min(Math.max(0, points), maxDeductiblePoints);
    
    this.setData({ deductionPoints: points });
    this.calculateDeduction();
  },

  /**
   * 加载默认地址
   * @returns {void}
   */
  loadDefaultAddress() {
    const addressTimer = setTimeout(() => {
      const mockAddress = {
        id: 1,
        name: i18n.translate('张三'),
        phone: '13800138000',
        province: i18n.translate('北京市'),
        city: i18n.translate('北京市'),
        district: i18n.translate('朝阳区'),
        detail: i18n.translate('某某街道某某小区1号楼1单元101室'),
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
   * 跳转到地址选择页面
   * @returns {void}
   */
  goToAddressSelection() {
    wx.navigateTo({
      url: '/pages/user/address/list/list?select=true'
    });
  },

  /**
   * 选择支付方式
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    this.setData({ paymentMethod: method });
  },

  /**
   * 更新备注信息
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  updateRemark(e) {
    this.setData({ remark: e.detail.value });
  },

  /**
   * 提交订单
   * @returns {void}
   */
  submitOrder() {
    const { product, quantity, address, paymentMethod, remark, deductionPoints } = this.data;
    
    // 检查是否选择了地址
    if (!address) {
      wx.showToast({
        title: i18n.translate('请选择收货地址'),
        icon: 'none'
      });
      return;
    }
    
    // 检查商品信息是否完整
    if (!product) {
      wx.showToast({
        title: i18n.translate('商品信息不完整'),
        icon: 'none'
      });
      return;
    }
    
    // 构建订单数据
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
    
    // 实际项目中应该调用API提交订单
    const submitTimer = setTimeout(() => {
      this.setData({ loading: false });
      
      // 模拟订单提交成功
      const orderId = 'ORD' + new Date().getTime();
      
      // 如果使用了积分抵扣，调用积分抵扣API
      if (deductionPoints > 0) {
        this.usePointsForDeduction(orderId, deductionPoints);
      }
      
      wx.showToast({
        title: i18n.translate('订单提交成功'),
        icon: 'success',
        duration: 1500,
        success: () => {
          // 跳转到支付页面或订单详情页
          setTimeout(() => {
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
   * 使用积分抵扣
   * @param {string} orderId - 订单ID
   * @param {number} points - 抵扣积分数量
   * @returns {void}
   */
  usePointsForDeduction(orderId, points) {
    // 调用积分服务的抵扣接口
    PointsService.usePointsForDeduction({
      orderId: orderId,
      points: points
    }).then(result => {
      // 积分抵扣成功，无需额外处理
    }).catch(error => {
      // 积分抵扣失败，可以考虑回滚订单或其他处理
    });
  }
});