const i18n = require('../../utils/i18n');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    i18n: i18n,
    loading: false,
    items: []
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @returns {void}
   */
  onLoad() {
    this.loadData();
  },

  /**
   * 椤甸潰鏄剧ず鏃惰Е鍙?   * @returns {void}
   */
  onShow() {
    // 鍙湪姝ゅ埛鏂伴儴鍒嗘暟鎹?  },

  /**
   * 涓嬫媺鍒锋柊鍥炶皟
   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 瑙﹀簳鍔犺浇鏇村
   * @returns {void}
   */
  onReachBottom() {
    // 棰勭暀锛氬垎椤靛姞杞?  },

  /**
   * 鍔犺浇棣栭〉鏁版嵁
   * @param {Function} done - 瀹屾垚鍥炶皟
   * @returns {void}
   */
  loadData(done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mock = [{ id: 1, title: '娆㈣繋浣跨敤 SutWxApp' }];
      this.setData({ items: mock, loading: false });
      clearTimeout(timer);
      if (typeof done === 'function') done();
    }, 300);
  }
});
