// checkout.js - 缁撶畻椤甸潰

// 瀵煎叆鏈嶅姟鍜屽伐鍏?import orderService from '../../utils/order-service';
import userService from '../../utils/user-service';
import cartService from '../../utils/cart-service';
import { showToast, showLoading, hideLoading, showConfirm } from '../../utils/global';
import { validator } from '../../utils/validator';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    // 璁㈠崟鏁版嵁
    orderData: null,
    // 鏀惰揣鍦板潃
    address: null,
    // 鍦板潃鍒楄〃
    addresses: [],
    // 鏀粯鏂瑰紡鍒楄〃
    paymentMethods: [
      { id: 'wechat', name: '寰俊鏀粯', icon: '/assets/images/wechat-pay.png', selected: true },
      { id: 'alipay', name: '鏀粯瀹?, icon: '/assets/images/alipay.png', selected: false }
    ],
    // 浼樻儬鍒镐俊鎭?    coupon: null,
    availableCoupons: [],
    couponVisible: false,
    // 璁㈠崟澶囨敞
    remark: '',
    // 鍟嗗搧鍒楄〃
    goodsList: [],
    // 璐圭敤鏄庣粏
    subtotal: 0,
    shippingFee: 0,
    discount: 0,
    totalPrice: 0,
    // 鍔犺浇鐘舵€?    loading: false,
    submitting: false,
    // 鍦板潃閫夋嫨鍣ㄦ樉绀虹姸鎬?    addressSelectorVisible: false,
    // 浼樻儬鍒搁€夋嫨鍣ㄦ樉绀虹姸鎬?    couponSelectorVisible: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    try {
      // 瑙ｆ瀽璁㈠崟鏁版嵁
      if (options.orderData) {
        const orderData = JSON.parse(decodeURIComponent(options.orderData));
        this.setData({
          orderData,
          goodsList: orderData.items || []
        });
        
        // 璁＄畻鍒濆璐圭敤
        this.calculatePrices();
      }
    } catch (error) {
      console.error('瑙ｆ瀽璁㈠崟鏁版嵁澶辫触:', error);
      showToast('璁㈠崟鏁版嵁閿欒锛岃杩斿洖璐墿杞﹂噸璇?, { icon: 'none' });
      // 寤惰繜杩斿洖璐墿杞﹂〉闈?      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 鍔犺浇鐢ㄦ埛鍦板潃鍜屼紭鎯犲埜淇℃伅
    this.loadUserInfo();
  },

  /**
   * 鍔犺浇鐢ㄦ埛淇℃伅锛堝湴鍧€銆佷紭鎯犲埜绛夛級
   */
  loadUserInfo: async function () {
    try {
      this.setData({ loading: true });
      
      // 骞惰鍔犺浇鍦板潃鍜屽彲鐢ㄤ紭鎯犲埜
      const [addressesResult, couponsResult] = await Promise.all([
        userService.getUserAddresses(),
        userService.getAvailableCoupons({
          total_amount: this.data.subtotal || 0,
          goods_ids: this.data.goodsList.map(item => item.product_id)
        })
      ]);
      
      // 璁剧疆鍦板潃淇℃伅
      const addresses = addressesResult || [];
      let defaultAddress = addresses.find(addr => addr.is_default);
      
      // 濡傛灉娌℃湁榛樿鍦板潃锛屼娇鐢ㄧ涓€涓湴鍧€
      if (!defaultAddress && addresses.length > 0) {
        defaultAddress = addresses[0];
      }
      
      this.setData({
        addresses,
        address: this.data.address || defaultAddress,
        availableCoupons: couponsResult || []
      });
      
    } catch (error) {
      console.error('鍔犺浇鐢ㄦ埛淇℃伅澶辫触:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 璁＄畻浠锋牸鏄庣粏
   */
  calculatePrices: function () {
    const goodsList = this.data.goodsList;
    let subtotal = 0;
    
    // 璁＄畻鍟嗗搧鎬讳环
    goodsList.forEach(item => {
      subtotal += (item.price || 0) * (item.quantity || 0);
    });
    
    // 璁＄畻杩愯垂锛堣繖閲岀畝鍖栧鐞嗭紝瀹為檯搴旀牴鎹湴鍧€鍜屽晢鍝佽绠楋級
    const shippingFee = subtotal >= 99 ? 0 : 10; // 婊?9鍏嶈繍璐?    
    // 璁＄畻浼樻儬閲戦
    const discount = this.data.coupon ? (this.data.coupon.discount_amount || 0) : 0;
    
    // 璁＄畻瀹炰粯閲戦
    let totalPrice = subtotal + shippingFee - discount;
    if (totalPrice < 0) totalPrice = 0;
    
    this.setData({
      subtotal: subtotal.toFixed(2),
      shippingFee: shippingFee.toFixed(2),
      discount: discount.toFixed(2),
      totalPrice: totalPrice.toFixed(2)
    });
  },

  /**
   * 鎵撳紑鍦板潃閫夋嫨鍣?   */
  openAddressSelector: function () {
    if (this.data.addresses.length === 0) {
      // 濡傛灉娌℃湁鍦板潃锛岃烦杞埌娣诲姞鍦板潃椤甸潰
      wx.navigateTo({
        url: '/pages/user/address/add'
      });
    } else {
      // 鏄剧ず鍦板潃閫夋嫨鍣?      this.setData({ addressSelectorVisible: true });
    }
  },

  /**
   * 閫夋嫨鍦板潃
   */
  selectAddress: function (e) {
    const addressId = e.currentTarget.dataset.id;
    const selectedAddress = this.data.addresses.find(addr => addr.id === addressId);
    
    if (selectedAddress) {
      this.setData({
        address: selectedAddress,
        addressSelectorVisible: false
      });
      
      // 鏇存柊杩愯垂锛堢ず渚嬩腑绠€鍖栧鐞嗭級
      this.calculatePrices();
    }
  },

  /**
   * 鍏抽棴鍦板潃閫夋嫨鍣?   */
  closeAddressSelector: function () {
    this.setData({ addressSelectorVisible: false });
  },

  /**
   * 娣诲姞鏂板湴鍧€
   */
  addNewAddress: function () {
    wx.navigateTo({
      url: '/pages/user/address/add'
    });
  },

  /**
   * 鎵撳紑浼樻儬鍒搁€夋嫨鍣?   */
  openCouponSelector: function () {
    if (this.data.availableCoupons.length === 0) {
      showToast('鏆傛棤鍙敤浼樻儬鍒?, { icon: 'none' });
    } else {
      this.setData({ couponSelectorVisible: true });
    }
  },

  /**
   * 閫夋嫨浼樻儬鍒?   */
  selectCoupon: function (e) {
    const couponId = e.currentTarget.dataset.id;
    const selectedCoupon = this.data.availableCoupons.find(coupon => coupon.id === couponId);
    
    if (selectedCoupon) {
      this.setData({
        coupon: selectedCoupon,
        couponSelectorVisible: false
      });
      
      // 閲嶆柊璁＄畻浠锋牸
      this.calculatePrices();
    }
  },

  /**
   * 鍏抽棴浼樻儬鍒搁€夋嫨鍣?   */
  closeCouponSelector: function () {
    this.setData({ couponSelectorVisible: false });
  },

  /**
   * 閫夋嫨鏀粯鏂瑰紡
   */
  selectPaymentMethod: function (e) {
    const paymentId = e.currentTarget.dataset.id;
    const paymentMethods = this.data.paymentMethods.map(method => ({
      ...method,
      selected: method.id === paymentId
    }));
    
    this.setData({ paymentMethods });
  },

  /**
   * 杈撳叆璁㈠崟澶囨敞
   */
  inputRemark: function (e) {
    this.setData({
      remark: e.detail.value
    });
  },

  /**
   * 鎻愪氦璁㈠崟
   */
  submitOrder: async function () {
    try {
      // 闃叉閲嶅鎻愪氦
      if (this.data.submitting) {
        return;
      }
      
      this.setData({ submitting: true });
      
      // 楠岃瘉鏀惰揣鍦板潃
      if (!this.data.address) {
        showToast('璇烽€夋嫨鏀惰揣鍦板潃', { icon: 'none' });
        return;
      }
      
      // 楠岃瘉鍟嗗搧鍒楄〃
      if (!this.data.goodsList || this.data.goodsList.length === 0) {
        showToast('鍟嗗搧淇℃伅閿欒', { icon: 'none' });
        return;
      }
      
      showLoading('姝ｅ湪鍒涘缓璁㈠崟...');
      
      // 鑾峰彇閫変腑鐨勬敮浠樻柟寮?      const selectedPayment = this.data.paymentMethods.find(method => method.selected);
      
      // 鏋勫缓璁㈠崟鏁版嵁
      const orderInfo = {
        items: this.data.goodsList.map(item => ({
          cart_item_id: item.cart_item_id,
          product_id: item.product_id,
          quantity: item.quantity,
          sku_id: item.sku_id
        })),
        address: this.data.address,
        payment_method: selectedPayment ? selectedPayment.id : 'wechat',
        remark: this.data.remark,
        coupon_id: this.data.coupon ? this.data.coupon.id : null
      };
      
      // 鍒涘缓璁㈠崟
      const order = await orderService.createOrder(orderInfo);
      
      // 闅愯棌鍔犺浇
      hideLoading();
      
      if (order && order.id) {
        // 璁㈠崟鍒涘缓鎴愬姛锛岃烦杞埌鏀粯椤甸潰
        wx.redirectTo({
          url: `/pages/payment/pay?orderId=${order.id}&amount=${this.data.totalPrice}`
        });
      } else {
        throw new Error('璁㈠崟鍒涘缓澶辫触');
      }
      
    } catch (error) {
      hideLoading();
      console.error('鎻愪氦璁㈠崟澶辫触:', error);
      showToast(error.message || '璁㈠崟鍒涘缓澶辫触锛岃閲嶈瘯', { icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  /**
   * 杩斿洖璐墿杞?   */
  backToCart: function () {
    wx.navigateBack();
  }
});