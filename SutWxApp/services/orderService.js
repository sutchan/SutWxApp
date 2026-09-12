/**
 * 文件名: orderService.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 订单服务层，提供订单相关功能
 */

const { mockOrders } = require("./orderService.mock");

/**
 * 生成订单编号（SU + 年月日 + 3 位随机序号）
 * @returns {string}
 */
function genOrderNo() {
  return `SU${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
}

/**
 * 组装订单对象
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

async function getOrderList(status) {
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
  try {
    // 注：addressId 暂未使用（当前为 mock 地址），待接入 WordPress/WooCommerce 订单接口后回填真实收货地址
    const { items, remark } = orderData;
    return buildOrderPayload(items, remark);
  } catch (error) {
    console.error("创建订单失败:", error);
    throw error;
  }
}

async function cancelOrder(orderId) {
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
