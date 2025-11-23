/**
 * 支付页面
 * 处理订单支付流程
 */

const paymentService = require('../../services/paymentService');
const userService = require('../../services/userService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    orderData: null,
    paymentMethods: [],
    selectedPaymentMethod: null,
    loading: true,
    submitting: false,
    countdown: 0,
    countdownTimer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { orderId } = options;
    if (orderId) {
      this.setData({ orderId });
      this.loadOrderDetail(orderId);
      this.loadPaymentMethods();
      this.startCountdown();
    } else {
      wx.showToast({
        title: '订单信息错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail(orderId) {
    try {
      this.setData({ loading: true });
      
      // 这里应该调用实际的订单详情API
      // const orderData = await orderService.getOrderDetail(orderId);
      
      // 模拟数据
      setTimeout(() => {
        const orderData = {
          id: orderId,
          orderNo: `ORD${Date.now()}`,
          status: 'pending_payment',
          totalAmount: 299.00,
          discountAmount: 20.00,
          actualAmount: 279.00,
          items: [
            {
              id: '1',
              name: '高品质无线蓝牙耳机',
              image: '/images/product/headphone.jpg',
              price: 299.00,
              quantity: 1,
              specs: '黑色'
            }
          ],
          address: {
            id: '1',
            name: '张三',
            phone: '13800138000',
            address: '北京市朝阳区某某街道某某小区1号楼1单元101室'
          },
          createTime: new Date().toISOString()
        };
        
        this.setData({
          orderData,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('加载订单详情失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载订单信息失败',
        icon: 'none'
      });
    }
  },

  /**
   * 加载支付方式
   */
  async loadPaymentMethods() {
    try {
      // 这里应该调用实际的支付方式API
      // const paymentMethods = await paymentService.getPaymentMethods();
      
      // 模拟数据
      setTimeout(() => {
        const paymentMethods = [
          {
            id: 'wechat',
            name: '微信支付',
            icon: '/images/payment/wechat.png',
            description: '推荐使用微信支付，安全便捷',
            enabled: true
          },
          {
            id: 'alipay',
            name: '支付宝',
            icon: '/images/payment/alipay.png',
            description: '使用支付宝余额或花呗支付',
            enabled: true
          },
          {
            id: 'balance',
            name: '余额支付',
            icon: '/images/payment/balance.png',
            description: '使用账户余额支付',
            enabled: true,
            balance: 150.50
          }
        ];
        
        // 默认选择微信支付
        const selectedPaymentMethod = paymentMethods.find(method => method.enabled);
        
        this.setData({
          paymentMethods,
          selectedPaymentMethod
        });
      }, 500);
      
    } catch (error) {
      console.error('加载支付方式失败:', error);
      wx.showToast({
        title: '加载支付方式失败',
        icon: 'none'
      });
    }
  },

  /**
   * 开始倒计时
   */
  startCountdown() {
    // 设置订单支付倒计时为15分钟
    let countdown = 15 * 60; // 15分钟，单位：秒
    
    this.setData({ countdown });
    
    const countdownTimer = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        this.setData({ 
          countdown: 0,
          countdownTimer: null 
        });
        
        wx.showModal({
          title: '支付超时',
          content: '订单支付已超时，订单已自动取消',
          showCancel: false,
          success: () => {
            wx.redirectTo({
              url: `/pages/order/detail/detail?id=${this.data.orderId}`
            });
          }
        });
        return;
      }
      
      this.setData({ countdown });
    }, 1000);
    
    this.setData({ countdownTimer });
  },

  /**
   * 格式化倒计时
   */
  formatCountdown(countdown) {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * 选择支付方式
   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    this.setData({
      selectedPaymentMethod: method
    });
  },

  /**
   * 提交支付
   */
  async submitPayment() {
    if (!this.data.selectedPaymentMethod) {
      wx.showToast({
        title: '请选择支付方式',
        icon: 'none'
      });
      return;
    }

    // 检查余额是否足够
    if (this.data.selectedPaymentMethod.id === 'balance' && 
        this.data.selectedPaymentMethod.balance < this.data.orderData.actualAmount) {
      wx.showToast({
        title: '余额不足，请选择其他支付方式',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ submitting: true });
      
      // 这里应该调用实际的支付API
      // const result = await paymentService.createPayment({
      //   orderId: this.data.orderId,
      //   paymentMethod: this.data.selectedPaymentMethod.id
      // });
      
      // 模拟支付过程
      setTimeout(() => {
        this.setData({ submitting: false });
        
        // 根据不同支付方式处理
        if (this.data.selectedPaymentMethod.id === 'wechat') {
          this.processWechatPay();
        } else if (this.data.selectedPaymentMethod.id === 'alipay') {
          this.processAlipay();
        } else if (this.data.selectedPaymentMethod.id === 'balance') {
          this.processBalancePay();
        }
      }, 1000);
      
    } catch (error) {
      console.error('支付失败:', error);
      this.setData({ submitting: false });
      wx.showToast({
        title: '支付失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 处理微信支付
   */
  processWechatPay() {
    // 这里应该调用微信支付API
    wx.showLoading({ title: '调起支付...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟支付成功
      this.onPaymentSuccess();
    }, 1500);
  },

  /**
   * 处理支付宝支付
   */
  processAlipay() {
    // 这里应该调用支付宝支付API
    wx.showLoading({ title: '调起支付...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟支付成功
      this.onPaymentSuccess();
    }, 1500);
  },

  /**
   * 处理余额支付
   */
  async processBalancePay() {
    try {
      wx.showLoading({ title: '支付中...' });
      
      // 这里应该调用余额支付API
      // const result = await paymentService.balancePayment({
      //   orderId: this.data.orderId,
      //   amount: this.data.orderData.actualAmount
      // });
      
      setTimeout(() => {
        wx.hideLoading();
        
        // 模拟支付成功
        this.onPaymentSuccess();
      }, 1000);
      
    } catch (error) {
      console.error('余额支付失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '支付失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 支付成功处理
   */
  onPaymentSuccess() {
    wx.showToast({
      title: '支付成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 取消支付
   */
  cancelPayment() {
    wx.showModal({
      title: '取消支付',
      content: '确定要取消支付吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 查看订单详情
   */
  viewOrderDetail() {
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 联系客服
   */
  contactService() {
    wx.navigateTo({
      url: '/pages/service/chat/chat'
    });
  }
});