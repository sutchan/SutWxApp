/**
 * 鏂囦欢鍚? index.js
 * 鐗堟湰鍙? 1.0.2
 * 更新日期: 2025-11-29
 * 作者 Sut
 * 描述: 首页页面逻辑 */

const i18n = require('../../utils/i18n');
const { createPage } = require('../../utils/useStore.js');

// 创建页面实例
Page(createPage(
  // 依赖的状态  ['user.isLoggedIn', 'ui.loading'],
  // 状态变更方法  {
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
   * 页面加载时执行   */
  onLoad() {
    this.loadData();
  },

  /**
   * 加载页面数据
   */
  loadData() {
    // 杩欓噷搴旇鏄姞杞芥暟鎹殑閫昏緫
    // 渚嬪锛歵his.getBanners(); this.getCategories(); this.getProducts();
  }
}));
