/**
 * 文件名: parts.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: 商品详情页业务子逻辑（数量边界、规格校验、收藏请求）
 */

const { safeStock } = require("./utils");

/**
 * 根据操作类型调整购买数量，并约束在 [1, 库存] 区间
 * @param {number} current 当前数量
 * @param {"minus"|"plus"} type 操作类型
 * @param {number} [stock] 商品库存
 * @returns {number} 调整后数量
 */
function adjustQuantity(current, type, stock) {
  const max = safeStock(stock);
  let next = current;
  if (type === "minus") {
    next = Math.max(1, current - 1);
  } else if (type === "plus") {
    next = Math.min(max, current + 1);
  }
  return next;
}

/**
 * 解析并约束手动输入的数量
 * @param {string|number} value 输入值
 * @param {number} [stock] 商品库存
 * @returns {number} 约束后数量
 */
function parseQuantity(value, stock) {
  const max = safeStock(stock);
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return 1;
  return Math.max(1, Math.min(max, num));
}

/**
 * 由商品信息构建立即购买项
 * @param {Object} productInfo 商品信息
 * @param {number} selectedSpecIndex 选中规格索引
 * @param {number} selectedQuantity 数量
 * @returns {Object|null} 立即购买项，信息缺失返回 null
 */
function buildBuyNowItem(productInfo, selectedSpecIndex, selectedQuantity) {
  if (!productInfo || !Array.isArray(productInfo.specs)) return null;
  const spec = productInfo.specs[selectedSpecIndex];
  if (!spec) return null;
  return {
    productId: productInfo.id,
    productName: productInfo.name,
    productImage: productInfo.images && productInfo.images[0],
    specName: spec.name,
    specPrice: spec.price,
    quantity: selectedQuantity,
    selected: true,
  };
}

module.exports = {
  adjustQuantity,
  parseQuantity,
  buildBuyNowItem,
};
