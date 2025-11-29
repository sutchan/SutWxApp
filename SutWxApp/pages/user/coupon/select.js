/**
 * 鏂囦欢鍚? select.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鐢ㄦ埛浼樻儬鍒搁€夋嫨椤甸潰
 */
Page({
  data: {
    couponList: [],
    loading: true,
    selectedCouponId: null,
    availableCoupons: [],
    unavailableCoupons: [],
    timer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.selectedId - 宸查€変腑鐨勪紭鎯犲埜ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.selectedId) {
      this.setData({ selectedCouponId: options.selectedId });
    }
    this.loadCoupons();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊瀹氭椂鍣紝闃叉鍐呭瓨娉勬紡
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 鍔犺浇浼樻儬鍒稿垪琛?   * @returns {void}
   */
  loadCoupons() {
    this.setData({ loading: true });
    // 妯℃嫙鏁版嵁璇锋眰
    const timer = setTimeout(() => {
      const mockCoupons = [
        { id: '1', name: '婊?00鍑?0鍏?, value: 10, condition: '婊?00鍏冨彲鐢?, endDate: '2023-12-31', available: true },
        { id: '2', name: '鏂颁汉涓撲韩鍒?, value: 5, condition: '鏃犻棬妲?, endDate: '2023-11-30', available: true },
        { id: '3', name: '宸茶繃鏈熶紭鎯犲埜', value: 15, condition: '婊?50鍏冨彲鐢?, endDate: '2023-09-30', available: false },
        { id: '4', name: '涓嶆弧瓒虫潯浠朵紭鎯犲埜', value: 20, condition: '婊?00鍏冨彲鐢?, endDate: '2023-12-31', available: false }
      ];

      const available = mockCoupons.filter(coupon => coupon.available);
      const unavailable = mockCoupons.filter(coupon => !coupon.available);

      this.setData({
        couponList: mockCoupons,
        availableCoupons: available,
        unavailableCoupons: unavailable,
        loading: false,
        timer: null
      });
    }, 500);
    
    this.setData({ timer });
  },

  /**
   * 閫夋嫨浼樻儬鍒?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  selectCoupon(e) {
    const { id } = e.currentTarget.dataset;
    const selectedCoupon = this.data.availableCoupons.find(coupon => coupon.id === id);
    if (selectedCoupon) {
      // 杩斿洖涓婁竴椤靛苟浼犻€掗€変腑鐨勪紭鎯犲埜淇℃伅
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage) {
        prevPage.setData({
          selectedCoupon: selectedCoupon
        });
      }
      wx.navigateBack();
    }
  },

  /**
   * 涓嶄娇鐢ㄤ紭鎯犲埜
   * @returns {void}
   */
  noCoupon() {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedCoupon: null
      });
    }
    wx.navigateBack();
  }
});