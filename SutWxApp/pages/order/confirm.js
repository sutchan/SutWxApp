// 订单确认页面逻辑
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    selectedAddress: null, // 选中的地址
    cartItems: [], // 购物车商品（从购物车页面传入）
    products: [], // 直接购买的商品（从商品详情页传入）
    coupon: null, // 选中的优惠券
    totalPrice: 0, // 商品总价
    totalCount: 0, // 商品总数量
    shippingFee: 0, // 运费
    discount: 0, // 优惠金额
    finalPrice: 0, // 最终价格
    remark: '', // 订单备注
    loading: false, // 加载状态
    submitting: false // 提交状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 记录页面访问事件
    app.analyticsService.track('page_view', {
      page: 'order_confirm'
    });
    
    // 检查是否登录
    if (!app.isLoggedIn()) {
      showToast('请先登录', 'none');
      // 延迟跳转登录页
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user/login/login'
        });
      }, 1500);
      return;
    }
    
    // 获取页面参数
    const cartItemsStr = options.cartItems;
    const productStr = options.product;
    
    if (cartItemsStr) {
      // 从购物车页面跳转过来
      try {
        // 首先尝试从全局数据获取
        if (app.globalData.tempOrderItems) {
          this.setData({
            cartItems: app.globalData.tempOrderItems
          });
          // 清空临时数据
          app.globalData.tempOrderItems = null;
        } else if (cartItemsStr) {
          const cartItems = JSON.parse(decodeURIComponent(cartItemsStr));
          this.setData({
            cartItems: cartItems
          });
        }
      } catch (e) {
        console.error('解析购物车数据失败', e);
      }
    } else if (productStr) {
      // 从商品详情页直接购买跳转过来
      try {
        const product = JSON.parse(decodeURIComponent(productStr));
        this.setData({
          products: [product]
        });
      } catch (e) {
        console.error('解析商品数据失败', e);
      }
    }
    
    // 计算价格
    this.calculatePrice();
    
    // 加载默认地址
    this.loadDefaultAddress();
  },

  /**
   * 加载默认地址
   */
  async loadDefaultAddress() {
    try {
      // 使用addressService获取默认地址
      const res = await app.services.address.getDefaultAddress();
      if (res) {
        this.setData({
          selectedAddress: res
        });
      }
    } catch (err) {
      console.error('获取默认地址失败', err);
    }
  },

  /**
   * 选择地址
   */
  onSelectAddress: function() {
    wx.navigateTo({
      url: '/pages/user/address/list?selectMode=true'
    });
  },

  /**
   * 选择优惠券
   */
  onSelectCoupon: function() {
    // 记录优惠券选择事件
    if (app.analyticsService) {
      app.analyticsService.track('coupon_selection_attempted');
    }
    
    // 检查是否登录
    if (!app.isLoggedIn()) {
      showToast('请先登录', 'none');
      return;
    }
    
    // 构建优惠券选择所需的参数
    const params = {
      total_amount: this.data.totalPrice,
      product_ids: [],
      current_coupon_id: this.data.coupon ? this.data.coupon.id : ''
    };
    
    // 收集所有商品ID
    this.data.cartItems.forEach(item => {
      params.product_ids.push(item.productId);
    });
    
    this.data.products.forEach(item => {
      params.product_ids.push(item.id);
    });
    
    // 跳转到优惠券选择页面并建立事件通道
    wx.navigateTo({
      url: `/pages/user/coupon/select?params=${encodeURIComponent(JSON.stringify(params))}`,
      events: {
        // 监听优惠券选择结果
        selectCoupon: (data) => {
          if (data && data.coupon) {
            // 设置选中的优惠券
            this.setData({
              coupon: data.coupon
            });
            // 重新计算价格
            this.calculatePrice();
            // 记录优惠券选择成功事件
            if (app.analyticsService) {
              app.analyticsService.track('coupon_selected', {
                coupon_id: data.coupon.id,
                coupon_name: data.coupon.name
              });
            }
          } else if (data && data.clearCoupon) {
            // 清空优惠券
            this.setData({
              coupon: null
            });
            // 重新计算价格
            this.calculatePrice();
            // 记录取消优惠券事件
            if (app.analyticsService) {
              app.analyticsService.track('coupon_cleared');
            }
          }
        }
      }
    });
  },

  /**
   * 输入订单备注
   */
  onRemarkInput: function(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  /**
   * 计算价格
   */
  calculatePrice: function() {
    let totalPrice = 0;
    let totalCount = 0;
    
    // 计算购物车商品总价和数量
    this.data.cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
      totalCount += item.quantity;
    });
    
    // 计算直接购买商品总价和数量
    this.data.products.forEach(item => {
      totalPrice += item.price * item.quantity;
      totalCount += item.quantity;
    });
    
    // 设置运费（这里简化为订单满88元免运费）
    let shippingFee = totalPrice >= 88 ? 0 : 10;
    
    // 计算优惠金额
    let discount = 0;
    if (this.data.coupon && app.services.coupon) {
      discount = app.services.coupon.calculateDiscount(this.data.coupon, totalPrice);
    }
    
    // 计算最终价格
    let finalPrice = Math.max(0, totalPrice + shippingFee - discount);
    
    this.setData({
      totalPrice: totalPrice,
      totalCount: totalCount,
      shippingFee: shippingFee,
      discount: discount,
      finalPrice: finalPrice
    });
  },

  /**
   * 提交订单
   */
  async onSubmitOrder() {
    // 检查是否登录
    if (!app.isLoggedIn()) {
      showToast('请先登录', 'none');
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/user/login/login'
        });
      }, 1500);
      return;
    }
    
    // 检查是否选择了地址
    if (!this.data.selectedAddress) {
      showToast('请选择收货地址', 'none');
      return;
    }
    
    // 检查是否有商品
    if (this.data.cartItems.length === 0 && this.data.products.length === 0) {
      showToast('请选择要购买的商品', 'none');
      return;
    }
    
    // 构建订单数据
    const orderData = {
      addressId: this.data.selectedAddress.id,
      remark: this.data.remark,
      items: []
    };
    
    // 添加购物车商品
    this.data.cartItems.forEach(item => {
      orderData.items.push({
        productId: item.productId,
        skuId: item.skuId,
        quantity: item.quantity,
        price: item.price
      });
    });
    
    // 添加直接购买的商品
    this.data.products.forEach(item => {
      orderData.items.push({
        productId: item.id,
        skuId: item.selectedSkuId,
        quantity: item.quantity,
        price: item.price
      });
    });
    
    this.setData({
      submitting: true
    });
    
    try {
      // 使用orderService创建订单
      const res = await app.services.order.createOrder(orderData);
      const orderId = res.orderId;
      
      // 记录订单创建事件
      app.analyticsService.track('order_created', {
        order_id: orderId,
        total_amount: this.data.finalPrice,
        item_count: orderData.items.length
      });
      
      // 显示成功提示
      showToast('订单创建成功', 'success');
      
      // 延迟跳转到支付页面
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/order/pay?orderId=${orderId}`
        });
      }, 1500);
    } catch (err) {
      showToast(err.message || '订单创建失败，请重试', 'none');
    } finally {
      this.setData({
        submitting: false
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 检查是否从地址选择页面返回
    const pages = getCurrentPages();
    if (pages.length > 1) {
      // 获取上一个页面的数据
      const prevPage = pages[pages.length - 2];
      
      // 检查是否选择了地址
      if (prevPage && prevPage.data.selectedAddressId) {
        // 如果有选中的地址ID，则获取地址详情
        this.loadAddressDetail(prevPage.data.selectedAddressId);
        // 清除上一页的选择状态
        delete prevPage.data.selectedAddressId;
      }
    }
    
    // 使用事件通道接收优惠券选择结果
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('selectCoupon', (data) => {
        if (data && data.coupon) {
          // 设置选中的优惠券
          this.setData({
            coupon: data.coupon
          });
          // 重新计算价格
          this.calculatePrice();
          // 记录优惠券选择成功事件
          if (app.analyticsService) {
            app.analyticsService.track('coupon_selected', {
              coupon_id: data.coupon.id,
              coupon_name: data.coupon.name
            });
          }
        } else if (data && data.clearCoupon) {
          // 清空优惠券
          this.setData({
            coupon: null
          });
          // 重新计算价格
          this.calculatePrice();
          // 记录取消优惠券事件
          if (app.analyticsService) {
            app.analyticsService.track('coupon_cleared');
          }
        }
      });
    }
  },
  
  /**
   * 加载地址详情
   */
  async loadAddressDetail(addressId) {
    try {
      const address = await app.services.address.getAddressDetail(addressId);
      this.setData({
        selectedAddress: address
      });
    } catch (err) {
      console.error('加载地址详情失败', err);
    }
  }
});