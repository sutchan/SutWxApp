/**
 * 文件名: index.js
 * 版本号: 3.5.10
 * 更新日期: 2026-10-14
 * 描述: 首页逻辑控制层（编排层）。业务细节见 parts.js / parts-data.js /
 *       suggestions.js / utils.js
 */

const request = require("../../utils/request");
const { unwrap } = require("../../utils/api");
const { pickCategory, loadSearchHistory } = require("./parts");
const {
  loadBanners,
  loadCategories,
  loadProducts,
} = require("./parts-data");
const { searchHandlers } = require("./search-handlers");

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

  onUnload: function () {
    // 搜索跳转用了延时器，页面卸载后必须清理，避免对已销毁页面 setData。
    this.clearSearchTimer();
  },

  // 搜索交互（历史浮层/联想/执行跳转）见 search-handlers.js
  ...searchHandlers,

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

  // 统一请求封装（首页数据公开，needAuth: false）。
  // 后端统一返回 {code,data} 包络，此处解包后交给 parts-data，避免读 data.list 恒为空。
  fetch: function (url, data) {
    return request({ url, method: "GET", data, needAuth: false }).then(unwrap);
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
