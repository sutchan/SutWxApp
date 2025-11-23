/**
 * 文件名: methods.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 支付方式选择页面
 */

const paymentService = require('../../../services/paymentService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    orderAmount: 0,
    paymentMethods: [],
    selectedMethod: '',
    loading: true,
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { orderId, amount } = options;
    
    if (orderId && amount) {
      this.setData({ 
        orderId,
        orderAmount: parseFloat(amount)
      });
      
      this.loadPaymentMethods();
    } else {
      wx.showToast({
        title: '参数错误',
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
    // 页面卸载时的清理工作
  },

  /**
   * 加载支付方式列表
   */
  async loadPaymentMethods() {
    try {
      this.setData({ loading: true });
      
      // 这里应该调用实际的支付方式API
      // const methods = await paymentService.getPaymentMethods();
      
      // 模拟数据
      setTimeout(() => {
        const paymentMethods = [
          {
            id: 'wechat',
            name: '微信支付',
            icon: '/images/payment/wechat.png',
            desc: '推荐使用微信支付，安全快捷',
            enabled: true,
            recommended: true
          },
          {
            id: 'alipay',
            name: '支付宝',
            icon: '/images/payment/alipay.png',
            desc: '使用支付宝安全支付',
            enabled: true,
            recommended: false
          },
          {
            id: 'balance',
            name: '余额支付',
            icon: '/images/payment/balance.png',
            desc: `当前余额：¥88.50`,
            enabled: true,
            recommended: false
          },
          {
            id: 'points',
            name: '积分抵扣',
            icon: '/images/payment/points.png',
            desc: `可用积分：1250，可抵扣¥12.50`,
            enabled: true,
            recommended: false
          }
        ];
        
        // 默认选择推荐方式
        const selectedMethod = paymentMethods.find(method => method.recommended)?.id || '';
        
        this.setData({
          paymentMethods,
          selectedMethod,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('加载支付方式失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载支付方式失败',
        icon: 'none'
      });
    }
  },

  /**
   * 选择支付方式
   */
  selectPaymentMethod(e) {
    const { method } = e.currentTarget.dataset;
    
    if (method) {
      this.setData({ selectedMethod: method });
    }
  },

  /**
   * 确认支付
   */
  async confirmPayment() {
    if (!this.data.selectedMethod) {
      wx.showToast({
        title: '请选择支付方式',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.submitting) {
      return;
    }
    
    try {
      this.setData({ submitting: true });
      
      // 调用支付接口
      const paymentData = {
        orderId: this.data.orderId,
        paymentMethod: this.data.selectedMethod,
        amount: this.data.orderAmount,
        returnUrl: `/pages/payment/result/result?orderId=${this.data.orderId}`
      };
      
      // 这里应该调用实际的支付API
      // const result = await paymentService.createPayment(paymentData);
      
      // 模拟支付过程
      setTimeout(() => {
        // 根据支付方式调用不同的支付API
        if (this.data.selectedMethod === 'wechat') {
          // 微信支付
          this.processWechatPayment();
        } else if (this.data.selectedMethod === 'alipay') {
          // 支付宝支付
          this.processAlipayPayment();
        } else if (this.data.selectedMethod === 'balance') {
          // 余额支付
          this.processBalancePayment();
        } else if (this.data.selectedMethod === 'points') {
          // 积分支付
          this.processPointsPayment();
        }
      }, 1000);
      
    } catch (error) {
      console.error('发起支付失败:', error);
      this.setData({ submitting: false });
      wx.showToast({
        title: '发起支付失败',
        icon: 'none'
      });
    }
  },

  /**
   * 处理微信支付
   */
  processWechatPayment() {
    // 调用微信支付API
    wx.requestPayment({
      timeStamp: String(Date.now()),
      nonceStr: 'random_string',
      package: 'prepay_id=wx123456789',
      signType: 'MD5',
      paySign: 'sign_string',
      success: (res) => {
        // 支付成功，跳转到结果页
        wx.redirectTo({
          url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
        });
      },
      fail: (err) => {
        console.error('微信支付失败:', err);
        this.setData({ submitting: false });
        
        // 根据错误类型显示不同提示
        if (err.errMsg === 'requestPayment:fail cancel') {
          wx.showToast({
            title: '支付已取消',
            icon: 'none'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=cancelled`
            });
          }, 1500);
        } else {
          wx.showToast({
            title: '支付失败，请重试',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 处理支付宝支付
   */
  processAlipayPayment() {
    // 模拟支付宝支付
    setTimeout(() => {
      // 模拟支付成功
      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 2000);
  },

  /**
   * 处理余额支付
   */
  processBalancePayment() {
    // 模拟余额支付
    setTimeout(() => {
      // 模拟支付成功
      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 处理积分支付
   */
  processPointsPayment() {
    // 模拟积分支付
    setTimeout(() => {
      // 模拟支付成功
      this.setData({ submitting: false });
      wx.redirectTo({
        url: `/pages/payment/result/result?orderId=${this.data.orderId}&status=success`
      });
    }, 1500);
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  }
});