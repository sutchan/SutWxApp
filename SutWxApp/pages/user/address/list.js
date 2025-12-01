/**
 * 鏂囦欢鍚? list.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 閻劍鍩涢崷鏉挎絻閸掓銆冩い鐢告桨
 */
Page({
  data: {
    addressList: [],
    loading: true,
    timer: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @returns {void}
   */
  onLoad() {
    this.loadAddressList();
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   * @returns {void}
   */
  onShow() {
    // 妞ょ敻娼伴弰鍓с仛閺冭泛鍩涢弬鏉挎勾閸р偓閸掓銆冮敍宀€鈥樻穱婵囨殶閹诡喗娓堕弬?    this.loadAddressList();
  },

  /**
   * 閸旂姾娴囬崷鏉挎絻閸掓銆?   * @returns {void}
   */
  loadAddressList() {
    this.setData({ loading: true });
    // 濡剝瀚欓弫鐗堝祦鐠囬攱鐪?    const timer = setTimeout(() => {
      const mockList = [
        {
          id: '1',
          name: '瀵姳绗?,
          phone: '13800138000',
          province: '楠炲じ绗㈤惇?,
          city: '楠炲灝绐炵敮?,
          district: '婢垛晜娓ら崠?,
          detail: 'XXX鐞涙浜綳XX閸?,
          isDefault: true
        },
        {
          id: '2',
          name: '閺夊骸娲?,
          phone: '13912345678',
          province: '楠炲じ绗㈤惇?,
          city: '濞ｅ崬婀风敮?,
          district: '閸楁鍖楅崠?,
          detail: 'YYY鐠虹梹YY閸?,
          isDefault: false
        }
      ];
      this.setData({
        addressList: mockList,
        loading: false,
        timer: null
      });
    }, 500);
    
    this.setData({ timer });
  },

  /**
   * 缂傛牞绶崷鏉挎絻
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  editAddress(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/address/edit?id=${id}`
    });
  },

  /**
   * 濞ｈ濮為弬鏉挎勾閸р偓
   * @returns {void}
   */
  addAddress() {
    wx.navigateTo({
      url: '/pages/user/address/edit'
    });
  }
});
