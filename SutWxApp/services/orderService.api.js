/**
 * 文件名: orderService.api.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 订单端点原始调用（FE-004，woocommerce 数据源），从 orderService.js 抽离
 *       以保持主模块精简。全部为鉴权端点（needAuth 默认 true）。
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");
const { mapWooCommerceOrder, mapWooCommerceOrders } = require("../models/order");

/**
 * 订单列表（分页 + 状态筛选）
 * @param {Object} params { status, page, pageSize }
 * @returns {Promise<{list: Array, total: number}>}
 */
async function fetchOrderList(params = {}) {
  const query = { page: 1, pageSize: 20 };
  if (params.status) query.status = params.status;
  if (params.page) query.page = params.page;
  if (params.pageSize) query.pageSize = params.pageSize;

  const payload = unwrap(await request.get("/api/order/list", query, { useCache: false }));
  const list = payload && Array.isArray(payload.list) ? payload.list : [];
  return {
    list: mapWooCommerceOrders(list),
    total: payload ? Number(payload.total) || list.length : list.length,
  };
}

/**
 * 订单详情
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<Object>}
 */
async function fetchOrderDetail(orderId) {
  const order = mapWooCommerceOrder(
    unwrap(await request.get("/api/order/detail", { id: orderId }, { useCache: false })),
  );
  if (!order) {
    throw new Error("订单不存在");
  }
  return order;
}

/**
 * 创建订单（购物车商品 + 地址快照）
 * @param {Object} orderData { items: [{productId, quantity}], address, remark }
 * @returns {Promise<Object>} 创建后的订单 DTO
 */
async function fetchCreateOrder(orderData) {
  const payload = {
    items: Array.isArray(orderData.items) ? orderData.items : [],
    address: orderData.address || {},
    remark: orderData.remark || "",
  };
  const order = mapWooCommerceOrder(
    unwrap(await request.post("/api/order/create", payload, { useCache: false })),
  );
  if (!order) {
    throw new Error("下单失败");
  }
  return order;
}

/**
 * 取消订单（仅待付款）
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<Object>} 更新后的订单 DTO
 */
async function fetchCancelOrder(orderId) {
  return mapWooCommerceOrder(
    unwrap(await request.post("/api/order/cancel", { id: orderId }, { useCache: false })),
  );
}

/**
 * 确认收货（仅待发货/已发货）
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<Object>} 更新后的订单 DTO
 */
async function fetchConfirmOrder(orderId) {
  return mapWooCommerceOrder(
    unwrap(await request.post("/api/order/confirm", { id: orderId }, { useCache: false })),
  );
}

module.exports = {
  fetchOrderList,
  fetchOrderDetail,
  fetchCreateOrder,
  fetchCancelOrder,
  fetchConfirmOrder,
};
