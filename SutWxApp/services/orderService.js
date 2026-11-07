/**
 * 文件名: orderService.js
 * 版本号: 3.5.12
 * 更新日期: 2026-11-07
 * 描述: 订单服务层（编排），提供订单相关功能
 *       woocommerce 数据源走 /api/order/* 真实端点（见 orderService.api.js），
 *       mock 数据源沿用本地演示数据。支付能力见 payService.js。
 *       纯辅助函数见 orderService.helpers.js。
 */

const { mockOrders } = require("./orderService.mock");
const { getDataSource } = require("./dataSource");
const orderApi = require("./orderService.api");
const { buildOrderPayload, toOrderItems, toAddressSnapshot } = require("./orderService.helpers");

/**
 * 查询订单列表
 * @param {number|null} status 状态码筛选
 * @returns {Promise<Array>}
 */
async function getOrderList(status) {
  if (getDataSource() === "woocommerce") {
    try {
      const { list } = await orderApi.fetchOrderList({ status });
      return list;
    } catch (error) {
      console.error("获取订单列表失败:", error);
      throw error;
    }
  }

  try {
    const orders = status !== null && status !== undefined
      ? mockOrders.filter((order) => order.status === status)
      : [...mockOrders];
    return orders;
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return [];
  }
}

/**
 * 查询订单详情
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<Object>}
 */
async function getOrderDetail(orderId) {
  if (getDataSource() === "woocommerce") {
    return orderApi.fetchOrderDetail(orderId);
  }

  try {
    const order = mockOrders.find((o) => String(o.id) === String(orderId));
    if (!order) {
      throw new Error("订单不存在");
    }
    return { ...order, couponDiscount: 0 };
  } catch (error) {
    console.error("获取订单详情失败:", error);
    throw error;
  }
}

/**
 * 创建订单
 * @param {Object} orderData 下单数据
 * @returns {Promise<Object>}
 */
async function createOrder(orderData) {
  if (getDataSource() === "woocommerce") {
    return orderApi.fetchCreateOrder({
      items: toOrderItems(orderData.items),
      address: toAddressSnapshot(orderData.address),
      remark: orderData.remark,
    });
  }

  try {
    const { items, remark } = orderData;
    return buildOrderPayload(items, remark);
  } catch (error) {
    console.error("创建订单失败:", error);
    throw error;
  }
}

/**
 * 取消订单
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<boolean>}
 */
async function cancelOrder(orderId) {
  if (getDataSource() === "woocommerce") {
    return orderApi.fetchCancelOrder(orderId);
  }

  try {
    const index = mockOrders.findIndex((o) => String(o.id) === String(orderId));
    if (index >= 0) {
      mockOrders[index].status = 0;
      mockOrders[index].statusText = "已取消";
    }
    return true;
  } catch (error) {
    console.error("取消订单失败:", error);
    return false;
  }
}

/**
 * 确认收货
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<boolean>}
 */
async function confirmReceive(orderId) {
  if (getDataSource() === "woocommerce") {
    return orderApi.fetchConfirmOrder(orderId);
  }

  try {
    const index = mockOrders.findIndex((o) => String(o.id) === String(orderId));
    if (index >= 0) {
      mockOrders[index].status = 4;
      mockOrders[index].statusText = "已完成";
      mockOrders[index].completeTime = new Date().toLocaleString();
    }
    return true;
  } catch (error) {
    console.error("确认收货失败:", error);
    return false;
  }
}

module.exports = {
  getOrderList,
  getOrderDetail,
  createOrder,
  cancelOrder,
  confirmReceive,
};
