/**
 * checkout.js - 结算页面逻辑处理
 * 负责用户订单结算流程的处理
 */
import orderService from '../../utils/order-service';
import addressService from '../../utils/address-service';
import cartService from '../../utils/cart-service';
import { formatPrice } from '../../utils/format';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    address: null, // 用户地址信息
    cartItems: [], // 购物车选中的商品
    totalPrice: 0, // 总价
    orderRemark: '', // 订单备注
    loading: false, // 加载状态
    submitting: false // 提交状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadCheckoutData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次显示页面时，重新加载地址和购物车数据
    this.loadCheckoutData();
  },

  /**
   * 加载结算数据
   */
  async loadCheckoutData() {
    try {
      this.setData({ loading: true });
      
      // 获取默认地址
      const address = await addressService.getDefaultAddress();
      
      // 获取购物车选中的商品
      const cartItems = await cartService.getCheckedItems();
      
      // 计算总价
      const totalPrice = cartItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);
      
      this.setData({
        address,
        cartItems,
        totalPrice,
        loading: false
      });
    } catch (error) {
      console.error('加载结算数据失败:', error);
      wx.showToast({ title: '加载数据失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  /**
   * 选择地址
   */
  selectAddress() {
    wx.navigateTo({
      url: '/pages/address/list?select=true'
    });
  },

  /**
   * 提交订单
   */
  async submitOrder() {
    // 验证地址
    if (!this.data.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }

    // 验证商品
    if (this.data.cartItems.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }

    try {
      this.setData({ submitting: true });

      // 构建订单数据
      const orderData = {
        addressId: this.data.address.id,
        items: this.data.cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: this.data.totalPrice,
        remark: this.data.orderRemark
      };

      // 提交订单
      const orderResult = await orderService.createOrder(orderData);

      if (orderResult.success) {
        // 清除购物车选中的商品
        await cartService.removeCheckedItems();
        
        // 跳转到支付页面
        wx.redirectTo({
          url: `/pages/payment/payment?orderId=${orderResult.orderId}&amount=${this.data.totalPrice}`
        });
      } else {
        wx.showToast({ title: orderResult.message || '订单提交失败', icon: 'none' });
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      wx.showToast({ title: '订单提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  /**
   * 输入订单备注
   */
  onRemarkInput(e) {
    this.setData({
      orderRemark: e.detail.value
    });
  },

  /**
   * 返回购物车
   */
  backToCart() {
    wx.navigateBack();
  },

  /**
   * 格式化价格显示
   */
  formatPrice(price) {
    return formatPrice(price);
  }
});