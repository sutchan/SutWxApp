/**
 * 文件名: category.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-13
 * 描述: 分类数据模型与 WooCommerce 分类映射层
 *       将 WordPress/WooCommerce REST 返回的商品分类对象映射为小程序统一的分类 DTO。
 */

const { toNumber, stripHtml } = require("../utils/text");

/**
 * 由 WooCommerce 分类对象中提取图标地址
 * - WC 分类 `image` 为对象 `{ id, src, ... }` 或字符串
 * @param {Object|string} image 原始 image 字段
 * @returns {string}
 */
function pickIcon(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.src || "";
}

/**
 * 将 WooCommerce 商品分类对象映射为小程序分类 DTO
 * @param {Object} c WooCommerce 分类
 * @returns {Object|null}
 */
function mapWooCommerceCategory(c) {
  if (!c || !c.id) return null;

  return {
    id: c.id,
    name: c.name || "",
    icon: pickIcon(c.image),
    count: toNumber(c.count, 0),
    description: stripHtml(c.description || ""),
    parentId: toNumber(c.parent, 0),
    slug: c.slug || "",
    permalink: c.permalink || "",
  };
}

/**
 * 批量映射 WooCommerce 分类列表（过滤无效项）
 * @param {Array<Object>} arr 原始分类数组
 * @returns {Array<Object>}
 */
function mapWooCommerceCategories(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(mapWooCommerceCategory)
    .filter((c) => c && c.id);
}

module.exports = {
  toNumber,
  stripHtml,
  mapWooCommerceCategory,
  mapWooCommerceCategories,
};
