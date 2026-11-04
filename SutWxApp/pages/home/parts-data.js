/**
 * 文件名: parts-data.js
 * 版本号: 3.5.10
 * 更新日期: 2026-10-14
 * 描述: 首页数据加载子逻辑（轮播图 / 分类 / 商品分页列表），以页面实例为参数
 *       复用 page.fetch / page.setData，保持 index.js 编排层精简。
 */

const request = require("../../utils/request");
const { buildBannerList } = require("./utils");

/**
 * 加载轮播图
 * @param {Object} page 页面实例
 */
function loadBanners(page) {
  page
    .fetch("/api/banner/list", {})
    .then((data) => {
      page.setData({ bannerList: buildBannerList(data) });
    })
    .catch((err) => {
      if (request.isCancel(err)) return;
      // 后端暂无 /api/banner/list 时静默降级为空轮播，避免无意义报错刷屏。
      page.setData({ bannerList: [] });
    });
}

/**
 * 加载商品分类
 * @param {Object} page 页面实例
 */
function loadCategories(page) {
  page
    .fetch("/api/category/list", {})
    .then((data) => {
      // 后端分类端点返回 {list, total, page, pageSize}，不是裸数组。
      const list = Array.isArray(data)
        ? data
        : (data && Array.isArray(data.list) ? data.list : []);
      page.setData({ categories: list });
    })
    .catch((err) => {
      if (request.isCancel(err)) return;
      console.error("获取分类失败:", err);
    });
}

/**
 * 加载商品列表（分页 / 重置）
 * @param {Object} page 页面实例
 * @param {boolean} reset 是否重置到第一页
 * @returns {Promise<void>}
 */
function loadProducts(page, reset) {
  if (page.data.isLoading) return Promise.resolve();
  page.setData({ isLoading: true });

  const pageNum = reset ? 1 : page.data.pageNum + 1;
  const categoryId = page.data.selectedCategory || 0;

  return page
    .fetch("/api/product/list", {
      // 后端分页参数是 page / pageSize，不是 pageNum。
      page: pageNum,
      pageSize: page.data.pageSize,
      categoryId,
    })
    .then((data) => {
      const list = Array.isArray(data)
        ? data
        : ((data && Array.isArray(data.list)) ? data.list : []);
      const total = data ? Number(data.total) || 0 : 0;
      // 后端不返回 hasMore，按 total 与已加载数量推算。
      const pageSize = page.data.pageSize;
      const hasMore = total > 0 ? pageNum * pageSize < total : list.length >= pageSize;
      page.setData({
        products: reset ? list : [...page.data.products, ...list],
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
      page.setData({ isLoading: false });
    });
}

module.exports = {
  loadBanners,
  loadCategories,
  loadProducts,
};
