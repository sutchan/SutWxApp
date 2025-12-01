/**
 * 鏂囦欢鍚? index.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 棣栭〉椤甸潰閫昏緫 */

const i18n = require('../../utils/i18n');
const { createPage } = require('../../utils/useStore.js');

// 鍒涘缓椤甸潰瀹炰緥
Page(createPage(
  // 渚濊禆鐨勭姸鎬?  ['user.isLoggedIn', 'ui.loading'],
  // 鐘舵€佸彉鏇存柟娉?  {
    setLoading: 'SET_LOADING'
  }
)({
  data: {
    i18n: i18n,
    banners: [],
    categories: [],
    products: [],
    timer: null
  },

  /**
   * 椤甸潰鍔犺浇鏃舵墽琛?   */
  onLoad() {
    this.loadData();
  },

  /**
   * 鍔犺浇椤甸潰鏁版嵁
   */
  loadData() {
    // 杩欓噷搴旇鏄姞杞芥暟鎹殑閫昏緫
    // 渚嬪锛歵his.getBanners(); this.getCategories(); this.getProducts();
  }
}));
