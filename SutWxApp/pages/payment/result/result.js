/**
 * 支付结果页面
 * 显示支付成功或失败的结果
 */

const paymentService = require('../../../services/paymentService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    paymentStatus: '', // success, failed, cancelled
    orderData: null,
    paymentInfo: null,
    loading: true,
    countdown: 5,
    countdownTimer: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { orderId, status } = options;
    
    if (orderId && status) {
      this.setData({ 
        orderId,
        paymentStatus: status
      });
      
      this.loadPaymentResult(orderId, status);
      this.startCountdown();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
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
   * 加载支付结果
   */
  async loadPaymentResult(orderId, status) {
    try {
      this.setData({ loading: true });
      
      // 这里应该调用实际的支付结果API
      // const result = await paymentService.getPaymentResult(orderId);
      
      // 模拟数据
      setTimeout(() => {
        const orderData = {
          id: orderId,
          orderNo: `ORD${Date.now()}`,
          status: status === 'success' ? 'paid' : 'pending_payment',
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
        
        const paymentInfo = {
          paymentMethod: 'wechat',
          paymentTime: new Date().toISOString(),
          transactionId: `TXN${Date.now()}`
        };
        
        this.setData({
          orderData,
          paymentInfo,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('加载支付结果失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载支付结果失败',
        icon: 'none'
      });
    }
  },

  /**
   * 开始倒计时
   */
  startCountdown() {
    let countdown = 5; // 5秒后自动跳转
    
    this.setData({ countdown });
    
    const countdownTimer = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        this.setData({ 
          countdown: 0,
          countdownTimer: null 
        });
        
        // 根据支付状态跳转到不同页面
        if (this.data.paymentStatus === 'success') {
          this.goToOrderDetail();
        } else {
          this.goToOrderList();
        }
        return;
      }
      
      this.setData({ countdown });
    }, 1000);
    
    this.setData({ countdownTimer });
  },

  /**
   * 查看订单详情
   */
  goToOrderDetail() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.redirectTo({
      url: `/pages/order/detail/detail?id=${this.data.orderId}`
    });
  },

  /**
   * 返回订单列表
   */
  goToOrderList() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.switchTab({
      url: '/pages/user/order/list/list'
    });
  },

  /**
   * 返回首页
   */
  goToHome() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 继续购物
   */
  continueShopping() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.switchTab({
      url: '/pages/category/category'
    });
  },

  /**
   * 重新支付
   */
  retryPayment() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.redirectTo({
      url: `/pages/payment/pay/pay?orderId=${this.data.orderId}`
    });
  },

  /**
   * 联系客服
   */
  contactService() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.setData({ countdownTimer: null });
    }
    
    wx.navigateTo({
      url: '/pages/service/chat/chat'
    });
  },

  /**
   * 分享支付结果
   */
  onShareAppMessage() {
    return {
      title: this.data.paymentStatus === 'success' ? 
        '我刚完成了一笔订单，商品质量很棒！' : 
        '支付遇到问题，需要帮助',
      path: `/pages/payment/result/result?orderId=${this.data.orderId}&status=${this.data.paymentStatus}`,
      imageUrl: '/images/share/payment-result.jpg'
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: this.data.paymentStatus === 'success' ? 
        '我刚完成了一笔订单，商品质量很棒！' : 
        '支付遇到问题，需要帮助',
      query: `orderId=${this.data.orderId}&status=${this.data.paymentStatus}`,
      imageUrl: '/images/share/payment-result.jpg'
    };
  }
});