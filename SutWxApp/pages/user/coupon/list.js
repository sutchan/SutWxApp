/**
 * 鏂囦欢鍚? list.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 閻劍鍩涙导妯诲劕閸掔鍨悰銊┿€夐棃? */
Page({
  data: {
    couponList: [],
    loading: true,
    activeTab: 0, // 0: 閸欘垳鏁? 1: 瀹歌弓濞囬悽? 2: 瀹歌尪绻冮張?    tabs: ['閸欘垳鏁?, '瀹歌弓濞囬悽?, '瀹歌尪绻冮張?],
    timer: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @returns {void}
   */
  onLoad() {
    this.loadCouponList(this.data.activeTab);
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
   * 閸掑洦宕叉导妯诲劕閸掑摜琚崹?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  onTabChange(e) {
    const index = e.detail.index;
    this.setData({ activeTab: index });
    this.loadCouponList(index);
  },

  /**
   * 閸旂姾娴囨导妯诲劕閸掔鍨悰?   * @param {number} type - 娴兼ɑ鍎崚鍝ヨ閸?(0: 閸欘垳鏁? 1: 瀹歌弓濞囬悽? 2: 瀹歌尪绻冮張?
   * @returns {void}
   */
  loadCouponList(type) {
    this.setData({ loading: true });
    // 濡剝瀚欓弫鐗堝祦鐠囬攱鐪?    const timer = setTimeout(() => {
      let mockList = [];
      if (type === 0) {
        mockList = [
          { id: 1, name: '濠?00閸?0閸?, value: 10, condition: '濠?00閸忓啫褰查悽?, endDate: '2023-12-31' },
          { id: 2, name: '閺傞姹夋稉鎾查煩閸?, value: 5, condition: '閺冪娀妫Σ?, endDate: '2023-11-30' }
        ];
      } else if (type === 1) {
        mockList = [
          { id: 3, name: '瀹歌弓濞囬悽銊ょ喘閹姴鍩?, value: 20, condition: '濠?00閸忓啫褰查悽?, endDate: '2023-10-31' }
        ];
      } else if (type === 2) {
        mockList = [
          { id: 4, name: '瀹歌尪绻冮張鐔剁喘閹姴鍩?, value: 15, condition: '濠?50閸忓啫褰查悽?, endDate: '2023-09-30' }
        ];
      }
      this.setData({
        couponList: mockList,
        loading: false,
        timer: null
      });
    }, 500);
    
    this.setData({ timer });
  }
});
