/**
 * 文件名 select.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 閻劍鍩涙导妯诲劕閸掓悂鈧瀚ㄦい鐢告桨
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.selectedId - 瀹告煡鈧鑵戦惃鍕喘閹姴鍩淚D
   * @returns {void}
   */
  onLoad(options) {
    if (options.selectedId) {
      this.setData({ selectedCouponId: options.selectedId });
    }
    this.loadCoupons();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婄€规碍妞傞崳顭掔礉闂冨弶顒涢崘鍛摠濞夊嫭绱?    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 閸旂姾娴囨导妯诲劕閸掔鍨悰?   * @returns {void}
   */
  loadCoupons() {
    this.setData({ loading: true });
    // 濡剝瀚欓弫鐗堝祦鐠囬攱鐪?    const timer = setTimeout(() => {
      const mockCoupons = [
        { id: '1', name: '濠?00閸?0閸?, value: 10, condition: '濠?00閸忓啫褰查悽?, endDate: '2023-12-31', available: true },
        { id: '2', name: '閺傞姹夋稉鎾查煩閸?, value: 5, condition: '閺冪娀妫Σ?, endDate: '2023-11-30', available: true },
        { id: '3', name: '瀹歌尪绻冮張鐔剁喘閹姴鍩?, value: 15, condition: '濠?50閸忓啫褰查悽?, endDate: '2023-09-30', available: false },
        { id: '4', name: '娑撳秵寮х搾铏蒋娴犳湹绱幆状态插煖', value: 20, condition: '濠?00閸忓啫褰查悽?, endDate: '2023-12-31', available: false }
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
   * 闁瀚ㄦ导妯诲劕閸?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  selectCoupon(e) {
    const { id } = e.currentTarget.dataset;
    const selectedCoupon = this.data.availableCoupons.find(coupon => coupon.id === id);
    if (selectedCoupon) {
      // 鏉╂柨娲栨稉濠佺妞ら潧鑻熸导状态烩偓鎺椻偓澶夎厬閻ㄥ嫪绱幆状态插煖娣団剝浼?      const pages = getCurrentPages();
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
   * 娑撳秳濞囬悽銊ょ喘閹姴鍩?   * @returns {void}
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
