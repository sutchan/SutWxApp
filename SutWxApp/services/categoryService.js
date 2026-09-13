/**
 * 文件名: categoryService.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-13
 * 描述: 分类服务层，提供分类相关功能（支持 WooCommerce 数据源）
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");
const { getDataSource } = require("./dataSource");
const { mapWooCommerceCategory, mapWooCommerceCategories } = require("../models/category");
const { mockCategories } = require("./categoryService.mock");

async function getCategoryList() {
  if (getDataSource() === "woocommerce") {
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
  if (getDataSource() === "woocommerce") {
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
