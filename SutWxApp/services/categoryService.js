/**
 * 文件名: categoryService.js
 * 版本号: 3.0.11
 * 更新日期: 2026-09-13
 * 描述: 分类服务层，提供分类相关功能（支持 WooCommerce 数据源）
 */

const request = require("../utils/request");
const { mapWooCommerceCategory, mapWooCommerceCategories } = require("../models/category");
const { mockCategories } = require("./categoryService.mock");

// 分类数据源：'mock'（默认，演示/离线）| 'woocommerce'（WordPress + WooCommerce 插件）
function getCategorySource() {
  try {
    const app = typeof getApp === "function" ? getApp() : null;
    if (app && app.globalData && app.globalData.productSource) {
      return app.globalData.productSource;
    }
  } catch (e) {
    // 测试或非小程序环境：回退 mock
  }
  return "mock";
}

// 兼容后端包络 { code, data } 或直接返回数据
function unwrap(res) {
  if (res && typeof res === "object" && "code" in res && res.data !== undefined) {
    return res.data;
  }
  return res;
}

async function getCategoryList() {
  if (getCategorySource() === "woocommerce") {
    try {
      const raw = await request.get("/api/category/list", {}, { needAuth: false });
      const payload = unwrap(raw);
      const list = (payload && (payload.list || payload)) || [];
      return mapWooCommerceCategories(list);
    } catch (error) {
      console.error("WooCommerce 分类列表获取失败:", error);
      return [];
    }
  }

  try {
    return mockCategories;
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return [];
  }
}

async function getCategoryDetail(categoryId) {
  if (getCategorySource() === "woocommerce") {
    try {
      const raw = await request.get(
        "/api/category/detail",
        { id: categoryId },
        { needAuth: false },
      );
      return mapWooCommerceCategory(unwrap(raw));
    } catch (error) {
      console.error("WooCommerce 分类详情获取失败:", error);
      return null;
    }
  }

  try {
    const category = mockCategories.find((c) => c.id == categoryId);
    return category || null;
  } catch (error) {
    console.error("获取分类详情失败:", error);
    return null;
  }
}

module.exports = {
  getCategoryList,
  getCategoryDetail,
  mapWooCommerceCategory,
  mapWooCommerceCategories,
};
