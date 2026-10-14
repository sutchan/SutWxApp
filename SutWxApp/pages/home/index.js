/**
 * 文件名: index.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: 首页逻辑控制层（编排层）。业务细节见 parts.js / parts-data.js /
 *       suggestions.js / utils.js
 */

const request = require("../../utils/request");
const { buildBannerList } = require("./utils");
const {
  pickCategory,
  loadSearchHistory,
  saveSearchHistory,
  appendSearchKeyword,
} = require("./parts");
const {
  loadBanners,
  loadCategories,
  loadProducts,
} = require("./parts-data");
const {
  SEARCH_DELAY_MS,
  filterSuggestions,
  matchSuggestionId,
} = require("./suggestions");

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
    loadBanners(this);
  },

  loadCategories: function () {
    loadCategories(this);
  },

  loadProducts: function (reset) {
    return loadProducts(this, reset);
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
    this.setData({ suggestions: filterSuggestions(val) });
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
    const matchedId = matchSuggestionId(text);

    // 显示微小加载动效，不要立刻关闭历史浮层
    this.setData({
      searchHistory: history,
      isSearching: true,
      searchKeyword: text,
    });

    setTimeout(() => {
      this.setData({
        showSearchHistory: false,
        isSearching: false,
        suggestions: [],
      });
      wx.showToast({ title: `已搜索：${text}`, icon: "none" });

      if (matchedId) {
        wx.navigateTo({ url: `/pages/product/index?id=${matchedId}` });
      } else {
        wx.showToast({ title: "未匹配到相关商品", icon: "none" });
      }
    }, SEARCH_DELAY_MS);
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
