/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 鐢ㄦ埛鍦板潃鍒楄〃椤甸潰
 */
Page({
  data: {
    addressList: [],
    loading: true,
    timer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @returns {void}
   */
  onLoad() {
    this.loadAddressList();
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
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   * @returns {void}
   */
  onShow() {
    // 椤甸潰鏄剧ず鏃跺埛鏂板湴鍧€鍒楄〃锛岀‘淇濇暟鎹渶鏂?    this.loadAddressList();
  },

  /**
   * 鍔犺浇鍦板潃鍒楄〃
   * @returns {void}
   */
  loadAddressList() {
    this.setData({ loading: true });
    // 妯℃嫙鏁版嵁璇锋眰
    const timer = setTimeout(() => {
      const mockList = [
        {
          id: '1',
          name: '寮犱笁',
          phone: '13800138000',
          province: '骞夸笢鐪?,
          city: '骞垮窞甯?,
          district: '澶╂渤鍖?,
          detail: 'XXX琛楅亾XXX鍙?,
          isDefault: true
        },
        {
          id: '2',
          name: '鏉庡洓',
          phone: '13912345678',
          province: '骞夸笢鐪?,
          city: '娣卞湷甯?,
          district: '鍗楀北鍖?,
          detail: 'YYY璺痀YY鍙?,
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
   * 缂栬緫鍦板潃
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  editAddress(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/address/edit?id=${id}`
    });
  },

  /**
   * 娣诲姞鏂板湴鍧€
   * @returns {void}
   */
  addAddress() {
    wx.navigateTo({
      url: '/pages/user/address/edit'
    });
  }
});
