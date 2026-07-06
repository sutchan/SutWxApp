/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: 首页逻辑控制层
 */

const app = getApp();
const authService = require("../../services/authService");
const pointsService = require("../../services/pointsService");
const productService = require("../../services/productService");
const categoryService = require("../../services/categoryService");
const { formatProductListPrices } = require("../../utils/format");

// 已注册页面白名单，用于拦截非法跳转
const REGISTERED_PAGES = [
  "/pages/home/index",
  "/pages/category/index",
  "/pages/product/index",
  "/pages/cart/index",
  "/pages/order/index",
  "/pages/order/detail",
  "/pages/order/confirm",
  "/pages/user/index",
  "/pages/address/index",
  "/pages/settings/index",
  "/pages/help/index",
];

Page({
  data: {
    userInfo: null,
    points: 0,
    bannerList: [
      {
        id: 1,
        imageUrl: "/images/placeholder.svg",
        link: "/pages/product/index?id=1",
      },
      {
        id: 2,
        imageUrl: "/images/placeholder.svg",
        link: "/pages/product/index?id=2",
      },
      {
        id: 3,
        imageUrl: "/images/placeholder.svg",
        link: "/pages/article/detail?id=1",
      },
    ],
    categoryList: [],
    productList: [],
    searchKeyword: "",
    currentCategory: 0,
    isLoading: false,
    isRefreshing: false,
    pageNum: 1,
    pageSize: 10,
    hasMore: true,
  },

  onLoad: function (options) {
    this.initPageData();
  },

  onShow: function () {
    this.updateUserInfo();
  },

  onPullDownRefresh: function () {
    this.handleRefresh();
  },

  onReachBottom: function () {
    this.handleLoadMore();
  },

  initPageData: function () {
    this.loadBanners();
    this.loadCategories();
    this.loadProductList();
    this.updateUserInfo();
  },

  updateUserInfo: function () {
    const userInfo = wx.getStorageSync("userInfo");
    const points = wx.getStorageSync("points") || 0;
    if (userInfo) {
      this.setData({ userInfo, points });
    }
  },

  // 加载轮播图：无后端，使用本地默认 bannerList
  loadBanners: function () {
    // 保留 data 中默认 bannerList 即可
  },

  // 加载分类列表
  loadCategories: async function () {
    try {
      const list = await categoryService.getCategoryList();
      this.setData({ categoryList: list || [] });
    } catch (e) {
      console.error("获取分类失败", e);
    }
  },

  // 加载商品列表（使用 productService + 价格预格式化）
  loadProductList: async function () {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });
    try {
      const list = await productService.getProductList({
        categoryId: this.data.currentCategory || undefined,
        keyword: this.data.searchKeyword,
      });
      const formatted = formatProductListPrices(list || []);
      // 模拟分页：首页只展示前 pageSize * pageNum 条
      const end = this.data.pageNum * this.data.pageSize;
      const visible = formatted.slice(0, end);
      this.setData({
        productList: visible,
        hasMore: formatted.length > end,
        isLoading: false,
      });
    } catch (e) {
      console.error("获取产品列表失败", e);
      this.setData({ isLoading: false, productList: [] });
    } finally {
      wx.stopPullDownRefresh();
      this.setData({ isRefreshing: false });
    }
  },

  handleRefresh: function () {
    this.setData({
      isRefreshing: true,
      pageNum: 1,
      hasMore: true,
    });
    this.loadProductList();
  },

  handleLoadMore: function () {
    if (!this.data.hasMore || this.data.isLoading) return;
    this.setData({
      pageNum: this.data.pageNum + 1,
    });
    this.loadProductList();
  },

  handleCategoryTap: function (e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.currentCategory) return;

    this.setData({
      currentCategory: id,
      pageNum: 1,
      hasMore: true,
      productList: [],
    });
    this.loadProductList();
  },

  handleSearchInput: function (e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  handleSearch: function () {
    this.setData({
      pageNum: 1,
      hasMore: true,
      productList: [],
    });
    this.loadProductList();
  },

  handleClearSearch: function () {
    this.setData({
      searchKeyword: "",
      pageNum: 1,
      hasMore: true,
      productList: [],
    });
    this.loadProductList();
  },

  handleProductTap: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/index?id=${id}`,
    });
  },

  // 点击轮播图，仅允许跳转已注册页面
  handleBannerTap: function (e) {
    const { link } = e.currentTarget.dataset;
    if (!link) return;
    const isRegistered = REGISTERED_PAGES.some((p) => link.indexOf(p) === 0);
    if (isRegistered) {
      wx.navigateTo({ url: link });
    } else {
      wx.showToast({ title: "功能开发中", icon: "none" });
    }
  },

  handleSearchBarTap: function () {
    wx.showToast({ title: "搜索功能开发中", icon: "none" });
  },

  handlePointsTap: function () {
    wx.showToast({ title: "积分功能开发中", icon: "none" });
  },

  // 切换商品收藏状态
  handleFavorite: function (e) {
    const { id } = e.currentTarget.dataset;
    const list = this.data.productList.map((item) => {
      if (item.id == id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    this.setData({ productList: list });
    const target = list.find((item) => item.id == id);
    wx.showToast({
      title: target && target.isFavorite ? "已收藏" : "已取消收藏",
      icon: "none",
    });
  },

  // 触发分享菜单
  handleShare: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });
    wx.showToast({ title: "请点击右上角分享", icon: "none" });
  },
});
