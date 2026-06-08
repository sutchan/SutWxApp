
/**
 * 文件名: confirm.js
 * 版本号: 2.0.0
 * 更新日期: 2026-05-06
 * 描述: 订单确认页面，用户确认订单信息并提交
 */

const orderService = require('../../services/orderService');
const addressService = require('../../services/authService');

Page({
  data: {
    items: [],
    address: null,
    totalPrice: 0,
    shippingFee: 0,
    couponDiscount: 0,
    finalPrice: 0,
    remark: '',
    submitting: false
  },

  onLoad(options) {
    if (options.items) {
      try {
        const items = JSON.parse(decodeURIComponent(options.items));
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
      const addressList = await addressService.getAddressList();
      if (addressList &amp;&amp; addressList.length &gt; 0) {
        const defaultAddress = addressList.find(addr =&gt; addr.isDefault) || addressList[0];
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
    const totalPrice = this.data.items.reduce((total, item) =&gt; {
      return total + (item.price * item.quantity);
    }, 0);

    const shippingFee = totalPrice &gt;= 99 ? 0 : 10;
    const couponDiscount = 0;
    const finalPrice = totalPrice + shippingFee - couponDiscount;

    this.setData({
      totalPrice,
      shippingFee,
      couponDiscount,
      finalPrice
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

      setTimeout(() =&gt; {
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

