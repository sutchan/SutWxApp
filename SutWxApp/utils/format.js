/**
 * 文件名: format.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-01
 * 描述: 格式化工具函数，提供价格、日期等格式化功能
 */

/**
 * 格式化价格，保留两位小数
 * @param {number} price - 价格
 * @returns {string} 格式化后的价格字符串
 */
function formatPrice(price) {
  if (price === undefined || price === null || isNaN(price)) {
    return '0.00';
  }
  return Number(price).toFixed(2);
}

/**
 * 格式化带人民币符号的价格
 * @param {number} price - 价格
 * @returns {string} 带¥符号的价格字符串
 */
function formatPriceWithSymbol(price) {
  return '¥' + formatPrice(price);
}

/**
 * 为商品列表中的每个商品添加格式化后的价格字段
 * @param {Array} list - 商品列表
 * @returns {Array} 处理后的商品列表
 */
function formatProductListPrices(list) {
  if (!Array.isArray(list)) return [];
  return list.map(item => ({
    ...item,
    priceText: formatPrice(item.price),
    originPriceText: item.originPrice ? formatPrice(item.originPrice) : ''
  }));
}

/**
 * 为订单列表添加格式化后的价格字段
 * @param {Array} orderList - 订单列表
 * @returns {Array} 处理后的订单列表
 */
function formatOrderListPrices(orderList) {
  if (!Array.isArray(orderList)) return [];
  return orderList.map(order => ({
    ...order,
    totalPriceText: formatPrice(order.totalPrice),
    products: formatProductListPrices(order.products || [])
  }));
}

/**
 * 为订单详情添加格式化后的价格字段
 * @param {Object} orderDetail - 订单详情
 * @returns {Object} 处理后的订单详情
 */
function formatOrderDetailPrices(orderDetail) {
  if (!orderDetail) return orderDetail;
  return {
    ...orderDetail,
    productPriceText: formatPrice(orderDetail.productPrice),
    shippingFeeText: formatPrice(orderDetail.shippingFee),
    couponDiscountText: formatPrice(orderDetail.couponDiscount),
    totalPriceText: formatPrice(orderDetail.totalPrice),
    products: formatProductListPrices(orderDetail.products || [])
  };
}

/**
 * 为购物车列表添加格式化后的价格字段
 * @param {Array} cartList - 购物车列表
 * @returns {Array} 处理后的购物车列表
 */
function formatCartListPrices(cartList) {
  if (!Array.isArray(cartList)) return [];
  return cartList.map(item => ({
    ...item,
    priceText: formatPrice(item.price)
  }));
}

module.exports = {
  formatPrice,
  formatPriceWithSymbol,
  formatProductListPrices,
  formatOrderListPrices,
  formatOrderDetailPrices,
  formatCartListPrices
};
