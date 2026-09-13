/**
 * 文件名: product.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-12
 * 描述: 商品数据模型与 WooCommerce 商品映射层
 *       将 WordPress/WooCommerce REST 返回的商品对象映射为小程序统一的商品 DTO。
 */

const { toNumber, stripHtml } = require("../utils/text");

/**
 * 由 WooCommerce 商品构建规格选项（specs）
 * - 简单商品：单一默认规格
 * - 多规格（variable）：以 variation=true 的属性选项生成规格，价格取商品当前价
 * @param {Object} p WooCommerce 商品
 * @returns {Array<Object>}
 */
function buildSpecs(p) {
  const variationAttrs = Array.isArray(p.attributes)
    ? p.attributes.filter((a) => a && a.variation)
    : [];
  const price = toNumber(p.price || p.regular_price, 0);
  const stock = p.manage_stock
    ? toNumber(p.stock_quantity, 0)
    : p.stock_status === "outofstock"
      ? 0
      : 99;

  if (variationAttrs.length === 0) {
    return [{ id: 0, name: "默认规格", price, stock }];
  }

  const specs = [];
  let idx = 0;
  for (const attr of variationAttrs) {
    const options = Array.isArray(attr.options) ? attr.options : [];
    for (const opt of options) {
      specs.push({
        id: idx++,
        name: `${attr.name || "规格"}: ${opt}`,
        price,
        stock,
      });
    }
  }
  return specs.length ? specs : [{ id: 0, name: "默认规格", price, stock }];
}

/**
 * 判断对象是否为 WooCommerce 原始商品结构
 * @param {Object} p 商品对象
 * @returns {boolean}
 */
function isWooCommerceShape(p) {
  return (
    p &&
    (("regular_price" in p) ||
      ("type" in p) ||
      ("variations" in p) ||
      ("stock_status" in p) ||
      ("short_description" in p))
  );
}

/**
 * 规整已是 DTO 的商品（补全默认值，保证 specs 存在）
 * @param {Object} p 商品 DTO
 * @returns {Object}
 */
function normalizeDto(p) {
  const price = toNumber(p.price, 0);
  const specs =
    Array.isArray(p.specs) && p.specs.length
      ? p.specs
      : [{ id: 0, name: "默认规格", price, stock: toNumber(p.stock, 99) }];
  return Object.assign(
    {
      id: p.id,
      name: p.name || "",
      price,
      originPrice: p.originPrice != null ? toNumber(p.originPrice, null) : null,
      image: p.image || (Array.isArray(p.images) && p.images[0]) || "",
      images: Array.isArray(p.images) && p.images.length ? p.images : [p.image || ""],
      categoryId: p.categoryId || 0,
      categoryName: p.categoryName || "",
      sales: toNumber(p.sales, 0),
      stock: toNumber(p.stock, 99),
      stockStatus:
        p.stockStatus || (toNumber(p.stock, 99) > 0 ? "instock" : "outofstock"),
      sku: p.sku || "",
      desc: p.desc || stripHtml(p.description || ""),
      description: p.description || "",
      isFavorite: !!p.isFavorite,
      rating: toNumber(p.rating, 0),
      reviewCount: toNumber(p.reviewCount, 0),
      type: p.type || "simple",
      permalink: p.permalink || "",
      onSale: !!p.onSale,
      featured: !!p.featured,
    },
    { specs },
  );
}

/**
 * 将 WooCommerce 商品对象映射为小程序商品 DTO
 * @param {Object} p WooCommerce 商品或已规整的 DTO
 * @returns {Object|null}
 */
function mapWooCommerceProduct(p) {
  if (!p || !p.id) return null;
  if (!isWooCommerceShape(p)) return normalizeDto(p);

  const images = Array.isArray(p.images)
    ? p.images.map((i) => (typeof i === "string" ? i : i && i.src)).filter(Boolean)
    : [];
  const cats = Array.isArray(p.categories) ? p.categories : [];
  const price = toNumber(p.price || p.regular_price, 0);
  const regular = toNumber(p.regular_price, price);
  const sale = toNumber(p.sale_price, 0);
  const onSale = !!p.on_sale || (sale > 0 && sale !== regular);
  const specs = buildSpecs(p);

  return {
    id: p.id,
    name: p.name || "",
    price,
    originPrice: onSale && regular > price ? regular : regular && regular !== price ? regular : null,
    image: images[0] || "",
    images: images.length ? images : [""],
    categoryId: cats[0] ? cats[0].id : 0,
    categoryName: cats[0] ? cats[0].name : "",
    sales: toNumber(p.total_sales, 0),
    stock: p.manage_stock
      ? toNumber(p.stock_quantity, 0)
      : p.stock_status === "outofstock"
        ? 0
        : 99,
    stockStatus: p.stock_status || (p.purchasable ? "instock" : "outofstock"),
    sku: p.sku || "",
    desc: stripHtml(p.short_description || p.description || ""),
    description: p.description || "",
    isFavorite: false,
    rating: toNumber(p.average_rating, 0),
    reviewCount: toNumber(p.rating_count, 0),
    specs,
    type: p.type || "simple",
    permalink: p.permalink || "",
    onSale,
    featured: !!p.featured,
  };
}

/**
 * 批量映射 WooCommerce 商品列表
 * @param {Array<Object>} list 商品数组
 * @returns {Array<Object>}
 */
function mapWooCommerceProducts(list) {
  if (!Array.isArray(list)) return [];
  return list.map(mapWooCommerceProduct).filter(Boolean);
}

module.exports = {
  mapWooCommerceProduct,
  mapWooCommerceProducts,
  toNumber,
  stripHtml,
};
