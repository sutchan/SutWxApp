/**
 * 文件名: orderService.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 订单服务层（编排），提供订单相关功能
 *       woocommerce 数据源走 /api/order/* 真实端点（见 orderService.api.js），
 *       mock 数据源沿用本地演示数据。支付能力见 payService.js。
 */

const { mockOrders } = require("./orderService.mock");
const { getDataSource } = require("./dataSource");
const orderApi = require("./orderService.api");

/**
 * 生成订单编号（SU + 年月日 + 3 位随机序号）
 * @returns {string}
 */
function genOrderNo() {
  return `SU${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
}

/**
 * 组装 mock 订单对象
 * @param {Array} items 下单商品列表
 * @param {string} [remark] 订单备注
 * @returns {Object}
 */
function buildOrderPayload(items, remark) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = total >= 99 ? 0 : 10;
  return {
    id: Date.now(),
    orderNo: genOrderNo(),
    status: 1,
    statusText: "待付款",
    totalPrice: total,
    productPrice: total,
    shippingFee,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    createTime: new Date().toLocaleString(),
    products: items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      spec: item.spec,
    })),
    address: {
      name: "测试用户",
      phone: "13800138000",
      detail: "测试地址",
    },
    remark: remark || "",
  };
}

/**
 * 购物车商品 → 后端下单 items（{productId, quantity}）
 * @param {Array} items 页面商品列表
 * @returns {Array<Object>}
 */
function toOrderItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    productId: item.id,
    quantity: item.quantity,
  }));
}

/**
 * 地址对象 → 后端地址快照 {name, phone, detail}
 * @param {Object} address 页面地址对象
 * @returns {Object}
 */
function toAddressSnapshot(address) {
  const a = address || {};
  return {
    name: a.name || "",
    phone: a.phone || "",
    detail: a.detail || "",
  };
}

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
    let orders = [...mockOrders];

    if (status !== null && status !== undefined) {
      orders = orders.filter((order) => order.status === status);
    }

    return orders;
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return [];
  }
}

async function getOrderDetail(orderId) {
  if (getDataSource() === "woocommerce") {
    return orderApi.fetchOrderDetail(orderId);
  }

  try {
    const order = mockOrders.find((o) => o.id == orderId);
    if (!order) {
      throw new Error("订单不存在");
    }

    return {
      ...order,
      couponDiscount: 0,
    };
  } catch (error) {
    console.error("获取订单详情失败:", error);
    throw error;
  }
}

async function createOrder(orderData) {
  if (getDataSource() === "woocommerce") {
    return orderApi.fetchCreateOrder({
      items: toOrderItems(orderData.items),
      address: toAddressSnapshot(orderData.address),
      remark: orderData.remark,
    });
  }

  try {
    // 注：addressId 暂未使用（当前为 mock 地址），woocommerce 数据源回填真实收货地址
    const { items, remark } = orderData;
    return buildOrderPayload(items, remark);
  } catch (error) {
    console.error("创建订单失败:", error);
    throw error;
  }
}

async function cancelOrder(orderId) {
  if (getDataSource() === "woocommerce") {
    return orderApi.fetchCancelOrder(orderId);
  }

  try {
    const orderIndex = mockOrders.findIndex((o) => o.id == orderId);
    if (orderIndex >= 0) {
      mockOrders[orderIndex].status = 0;
      mockOrders[orderIndex].statusText = "已取消";
    }
    return true;
  } catch (error) {
    console.error("取消订单失败:", error);
    return false;
  }
}

async function confirmReceive(orderId) {
  if (getDataSource() === "woocommerce") {
    return orderApi.fetchConfirmOrder(orderId);
  }

  try {
    const orderIndex = mockOrders.findIndex((o) => o.id == orderId);
    if (orderIndex >= 0) {
      mockOrders[orderIndex].status = 4;
      mockOrders[orderIndex].statusText = "已完成";
      mockOrders[orderIndex].completeTime = new Date().toLocaleString();
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
