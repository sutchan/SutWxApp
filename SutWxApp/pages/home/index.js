/**
 * 文件名: index.js
 * 版本号: 3.0.13
 * 更新日期: 2026-08-13
 * 描述: 首页逻辑控制层（编排层，业务细节见 parts.js / utils.js）
 */

const request = require("../../utils/request");
const { buildBannerList } = require("./utils");
const { pickCategory } = require("./parts");

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
  },

  onLoad: function () {
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
    this.setData({ selectedCategory: id });
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
    wx.showToast({ title: "搜索功能开发中", icon: "none" });
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
