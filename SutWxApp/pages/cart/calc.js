/**
 * 文件名: calc.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 购物车金额/数量计算（从 pages/cart/index.js 抽离的纯函数）
 */

const { formatPrice, formatCartListPrices } = require("../../utils/format");

/**
 * 计算选中商品的总价
 * @param {Array} cartList 购物车列表
 * @returns {number}
 */
function calculateTotalPrice(cartList) {
  return cartList
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * 计算选中商品的总数量
 * @param {Array} cartList 购物车列表
 * @returns {number}
 */
function calculateTotalCount(cartList) {
  return cartList
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.quantity, 0);
}

/**
 * 检查是否全选
 * @param {Array} cartList 购物车列表
 * @returns {boolean}
 */
function checkSelectAll(cartList) {
  if (cartList.length === 0) return false;
  return cartList.every((item) => item.selected);
}

/**
 * 组装购物车页面状态（列表 + 合计 + 全选 + 空态）
 * @param {Array} cartList 购物车列表
 * @returns {Object} 可直接用于 setData 的对象
 */
function buildCartState(cartList) {
  const totalPrice = calculateTotalPrice(cartList);
  const totalCount = calculateTotalCount(cartList);
  return {
    cartList: formatCartListPrices(cartList),
    totalPrice,
    totalPriceText: formatPrice(totalPrice),
    totalCount,
    selectAll: checkSelectAll(cartList),
    empty: cartList.length === 0,
  };
}

module.exports = {
  calculateTotalPrice,
  calculateTotalCount,
  checkSelectAll,
  buildCartState,
};
