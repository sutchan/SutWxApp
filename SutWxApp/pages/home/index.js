/**
 * 文件名: index.js
 * 版本号: 3.0.13
 * 更新日期: 2026-08-13
 * 描述: 首页逻辑控制层（编排层，业务细节见 parts.js / utils.js）
 */

const request = require("../../utils/request");
const { buildBannerList } = require("./utils");
const { pickCategory, loadSearchHistory, saveSearchHistory, appendSearchKeyword } = require("./parts");

const themeBehavior = require("../../behaviors/theme");

Page({
  behaviors: [themeBehavior],
  data: {
    bannerList: [],
    categories: [],
    selectedCategory: 0,
    products: [],
    pageNum: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
    userInfo: null,
    isLoggedIn: false,
    showSearchHistory: false,
    searchHistory: [],
    searchKeyword: "",
    fadeIn: true,
    isSearching: false,
    suggestions: [],
  },

  onLoad: function () {
    this.setData({ searchHistory: loadSearchHistory() });
    this.loadBanners();
    this.loadCategories();
    this.loadProducts(true);
  },

  onShow: function () {
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");
    this.setData({ isLoggedIn: !!token, userInfo });
  },

  onPullDownRefresh: function () {
    this.loadBanners();
    this.loadCategories();
    this.loadProducts(true).then(() => wx.stopPullDownRefresh());
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadProducts(false);
    }
  },

  // 统一请求封装（首页数据公开，needAuth: false）
  fetch: function (url, data) {
    return request({ url, method: "GET", data, needAuth: false });
  },

  loadBanners: function () {
    this.fetch("/api/banner/list", {})
      .then((data) => {
        this.setData({ bannerList: buildBannerList(data) });
      })
      .catch((err) => {
        if (request.isCancel(err)) return;
        console.error("获取轮播图失败:", err);
      });
  },

  loadCategories: function () {
    this.fetch("/api/category/list", {})
      .then((data) => {
        this.setData({ categories: Array.isArray(data) ? data : [] });
      })
      .catch((err) => {
        if (request.isCancel(err)) return;
        console.error("获取分类失败:", err);
      });
  },

  loadProducts: function (reset) {
    if (this.data.isLoading) return Promise.resolve();
    this.setData({ isLoading: true });

    const pageNum = reset ? 1 : this.data.pageNum + 1;
    const categoryId = this.data.selectedCategory || 0;

    return this.fetch("/api/product/list", {
      pageNum,
      pageSize: this.data.pageSize,
      categoryId,
    })
      .then((data) => {
        const list = (data && data.list) || [];
        const hasMore = data ? data.hasMore : false;
        this.setData({
          products: reset ? list : [...this.data.products, ...list],
          pageNum,
          hasMore,
          fadeIn: true,
        });
      })
      .catch((err) => {
        if (request.isCancel(err)) return;
        console.error("获取商品列表失败:", err);
        wx.showToast({ title: "加载失败", icon: "error" });
      })
      .finally(() => {
        this.setData({ isLoading: false });
      });
  },

  handleCategoryTap: function (e) {
    const id = pickCategory(e.currentTarget.dataset.id);
    this.setData({ selectedCategory: id, fadeIn: false });
    this.loadProducts(true);
  },

  handleProductTap: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/product/index?id=${id}` });
  },

  handleBannerTap: function (e) {
    const { link } = e.currentTarget.dataset;
    if (link) {
      wx.navigateTo({ url: link });
    }
  },

  handleSearchTap: function () {
    this.setData({
      showSearchHistory: true,
      searchHistory: loadSearchHistory(),
    });
  },

  handleCloseSearch: function () {
    this.setData({ showSearchHistory: false });
  },

  handleClearHistory: function () {
    saveSearchHistory([]);
    this.setData({ searchHistory: [] });
    wx.showToast({ title: "已清空搜索历史", icon: "none" });
  },

  handleSearchInput: function (e) {
    const val = e.detail.value;
    this.setData({ searchKeyword: val });
    this.updateSuggestions(val);
  },

  updateSuggestions: function (val) {
    if (!val || !val.trim()) {
      this.setData({ suggestions: [] });
      return;
    }
    const ALL_SUGGESTION_NAMES = [
      "苏铁盆栽 铁树绿植",
      "琴叶榕 大叶观叶植物",
      "龟背竹 开背大苗",
      "多肉植物组合套装",
      "玉露 冰灯玉露盆栽",
      "蝴蝶兰 年宵花礼盒",
      "果汁阳台月季盆栽",
      "园艺工具三件套",
      "红陶花盆套装 素烧",
      "进口泥炭营养土 5L",
      "文竹 云竹盆栽",
      "自动浇水滴灌套装",
      "缓释肥 园艺通用肥"
    ];
    const kw = val.trim().toLowerCase();
    const filtered = ALL_SUGGESTION_NAMES.filter(name => name.toLowerCase().indexOf(kw) !== -1)
      .map((name, index) => ({ id: index, name }))
      .slice(0, 3); // 严格匹配前三个
    this.setData({ suggestions: filtered });
  },

  handleClearSearchInput: function () {
    this.setData({ searchKeyword: "", suggestions: [] });
  },

  handleSelectHistoryTag: function (e) {
    const { keyword } = e.currentTarget.dataset;
    this.executeSearch(keyword);
  },

  handleSearchConfirm: function (e) {
    const kw = (e.detail && e.detail.value) || this.data.searchKeyword;
    this.executeSearch(kw);
  },

  executeSearch: function (kw) {
    if (!kw || !kw.trim()) {
      wx.showToast({ title: "请输入搜索词", icon: "none" });
      return;
    }
    const text = kw.trim();
    const history = appendSearchKeyword(text, this.data.searchHistory);
    
    // 显示微小加载动效，不要立刻关闭历史浮层
    this.setData({ 
      searchHistory: history, 
      isSearching: true,
      searchKeyword: text
    });
    
    const SUGGESTIONS_TO_ID = {
      "苏铁": 1, "铁树": 1,
      "琴叶榕": 2,
      "龟背竹": 3,
      "多肉": 4, "组合": 4,
      "玉露": 5, "冰灯": 5,
      "蝴蝶兰": 6, "花礼": 6,
      "果汁阳台": 7, "月季": 7,
      "工具": 8, "不锈钢": 8,
      "花盆": 9, "红陶": 9,
      "泥炭": 10, "营养土": 10, "5L": 10,
      "文竹": 11, "云竹": 11,
      "自动浇水": 12, "滴灌": 12,
      "缓释肥": 13, "通用肥": 13
    };
    
    // 查找匹配商品ID
    let matchedId = null;
    for (const key in SUGGESTIONS_TO_ID) {
      if (text.indexOf(key) !== -1 || key.indexOf(text) !== -1) {
        matchedId = SUGGESTIONS_TO_ID[key];
        break;
      }
    }

    setTimeout(() => {
      this.setData({ 
        showSearchHistory: false, 
        isSearching: false,
        suggestions: []
      });
      wx.showToast({ title: `已搜索：${text}`, icon: "none" });
      
      if (matchedId) {
        wx.navigateTo({ url: `/pages/product/index?id=${matchedId}` });
      } else {
        wx.showToast({ title: "未匹配到相关商品", icon: "none" });
      }
    }, 720); // 720ms 加载展示
  },

  handleFavorite: function () {
    wx.showToast({ title: "收藏功能开发中", icon: "none" });
  },

  handleShare: function () {
    wx.showToast({ title: "分享功能开发中", icon: "none" });
  },

  goToCart: function () {
    wx.switchTab({ url: "/pages/cart/index" });
  },

  goToProfile: function () {
    wx.switchTab({ url: "/pages/user/index" });
  },
});
