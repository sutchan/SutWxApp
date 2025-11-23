/**
 * 文件名: confirm.js
 * 订单确认页面
 */
const i18n = require('../../../utils/i18n');

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
    productTimer: null,
    addressTimer: null,
    submitTimer: null
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
        image: '/assets/images/product1.jpg',
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
    }, 300);
    
    this.setData({ productTimer });
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
    const { product, quantity, address, paymentMethod, remark } = this.data;
    
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
      finalAmount: this.data.finalAmount
    };
    
    console.log('提交订单数据:', orderData);
    this.setData({ loading: true });
    
    // 实际项目中应该调用API提交订单
    const submitTimer = setTimeout(() => {
      this.setData({ loading: false });
      
      // 模拟订单提交成功
      const orderId = 'ORD' + new Date().getTime();
      
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
  }
});