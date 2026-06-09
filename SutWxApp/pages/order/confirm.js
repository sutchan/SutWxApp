/**
 * 文件名: confirm.js
 * 版本号: 2.1.0
 * 更新日期: 2026-06-09
 * 描述: 订单确认页面，用户确认订单信息并提交
 */

const orderService = require('../../services/orderService');

Page({
  data: {
    items: [],
    address: null,
    totalPrice: 0,
    shippingFee: 0,
    couponDiscount: 0,
    finalPrice: 0,
    totalPriceText: '¥0.00',
    shippingFeeText: '免运费',
    couponDiscountText: '¥0.00',
    finalPriceText: '¥0.00',
    remark: '',
    submitting: false
  },

  onLoad(options) {
    if (options.items) {
      try {
        const rawItems = JSON.parse(decodeURIComponent(options.items));
        const items = rawItems.map((item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return {
            id: item.id,
            name: item.name || '商品',
            image: item.image || item.imageUrl || '/images/placeholder.svg',
            spec: item.spec || '',
            price: price,
            priceText: '¥' + price.toFixed(2),
            quantity: quantity,
            quantityText: 'x' + quantity
          };
        });
        this.setData({ items });
        this.calculatePrice();
      } catch (error) {
        console.error('解析商品信息失败:', error);
        wx.showToast({
          title: '参数错误',
          icon: 'none'
        });
      }
    }
    this.loadAddress();
  },

  /**
   * 加载收货地址
   */
  async loadAddress() {
    try {
      const addressList = wx.getStorageSync('addressList') || [];
      if (addressList && addressList.length > 0) {
        const defaultAddress = addressList.find(addr => addr.isDefault) || addressList[0];
        this.setData({ address: defaultAddress });
      }
    } catch (error) {
      console.error('加载地址失败:', error);
    }
  },

  /**
   * 计算价格
   */
  calculatePrice() {
    const items = this.data.items || [];
    const totalPrice = items.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);

    const shippingFee = totalPrice >= 99 ? 0 : 10;
    const couponDiscount = 0;
    const finalPrice = totalPrice + shippingFee - couponDiscount;

    const totalPriceText = '¥' + totalPrice.toFixed(2);
    const shippingFeeText = shippingFee === 0 ? '免运费' : '¥' + shippingFee.toFixed(2);
    const couponDiscountText = '¥' + couponDiscount.toFixed(2);
    const finalPriceText = '¥' + finalPrice.toFixed(2);

    this.setData({
      totalPrice,
      shippingFee,
      couponDiscount,
      finalPrice,
      totalPriceText,
      shippingFeeText,
      couponDiscountText,
      finalPriceText
    });
  },

  /**
   * 选择收货地址
   */
  onSelectAddress() {
    wx.navigateTo({
      url: '/pages/address/index?select=true'
    });
  },

  /**
   * 输入备注
   */
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  /**
   * 提交订单
   */
  async onSubmitOrder() {
    if (!this.data.address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ submitting: true });

      const orderData = {
        items: this.data.items,
        addressId: this.data.address.id,
        remark: this.data.remark
      };

      const result = await orderService.createOrder(orderData);

      wx.showToast({
        title: '下单成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/order/detail?id=' + result.id
        });
      }, 1500);
    } catch (error) {
      console.error('提交订单失败:', error);
      wx.showToast({
        title: '下单失败',
        icon: 'none'
      });
      this.setData({ submitting: false });
    }
  }
});
