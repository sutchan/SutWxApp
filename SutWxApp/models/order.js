/**
 * 文件名: order.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 订单数据模型与 WooCommerce 订单 DTO 映射层（FE-004）
 *       后端 sutwx-app-api 的 map-order.php 已输出与小程序一致的订单结构，
 *       此处负责数值规整、默认值补全与批量映射，保证页面消费字段稳定。
 */

const { toNumber } = require("../utils/text");

/**
 * 订单状态码约定（与后端 sutwx_order_status_code 一致）
 * 0 已取消 / 1 待付款 / 2 待发货 / 3 待收货 / 4 已完成 / 5 已退款
 */
const ORDER_STATUS_TEXT = {
  0: "已取消",
  1: "待付款",
  2: "待发货",
  3: "待收货",
  4: "已完成",
  5: "已退款",
};

/**
 * 状态码 → 中文文案（未知状态回落「未知状态」）
 * @param {number} status 状态码
 * @returns {string}
 */
function getStatusText(status) {
  return ORDER_STATUS_TEXT[status] || "未知状态";
}

/**
 * 规整单个订单商品行
 * @param {Object} item 后端订单商品 DTO
 * @returns {Object}
 */
function mapOrderProduct(item) {
  const p = item || {};
  return {
    id: p.id,
    name: p.name || "",
    image: p.image || "",
    price: toNumber(p.price, 0),
    quantity: toNumber(p.quantity, 0),
    spec: p.spec || "",
  };
}

/**
 * 规整收货地址快照
 * @param {Object} address 后端地址 DTO
 * @returns {Object}
 */
function mapOrderAddress(address) {
  const a = address || {};
  return {
    name: a.name || "",
    phone: a.phone || "",
    detail: a.detail || "",
  };
}

/**
 * 单个订单 DTO 规整（无效输入返回 null）
 * @param {Object} order 后端订单 DTO
 * @returns {Object|null}
 */
function mapWooCommerceOrder(order) {
  if (!order || typeof order !== "object") return null;

  const status = toNumber(order.status, 0);
  const products = Array.isArray(order.products)
    ? order.products.map(mapOrderProduct)
    : [];

  return {
    id: order.id,
    orderNo: order.orderNo || "",
    status,
    statusText: order.statusText || getStatusText(status),
    totalPrice: toNumber(order.totalPrice, 0),
    productPrice: toNumber(order.productPrice, 0),
    shippingFee: toNumber(order.shippingFee, 0),
    totalQuantity: toNumber(order.totalQuantity, 0),
    createTime: order.createTime || "",
    products,
    address: mapOrderAddress(order.address),
    remark: order.remark || "",
    payTime: order.payTime || "",
    completeTime: order.completeTime || "",
  };
}

/**
 * 批量映射（过滤无效项）
 * @param {Array} orders 后端订单 DTO 列表
 * @returns {Array<Object>}
 */
function mapWooCommerceOrders(orders) {
  if (!Array.isArray(orders)) return [];
  return orders.map(mapWooCommerceOrder).filter(Boolean);
}

module.exports = {
  ORDER_STATUS_TEXT,
  getStatusText,
  mapWooCommerceOrder,
  mapWooCommerceOrders,
};
