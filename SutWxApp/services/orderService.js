
/**
 * 文件名: orderService.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 订单服务层，提供订单相关功能
 */

const STORAGE_KEY_ORDERS = "order_list";

const defaultMockOrders = [
  {
    id: 1,
    orderNo: "SU20260506001",
    status: 1,
    statusText: "待付款",
    totalPrice: 29.9,
    productPrice: 29.9,
    shippingFee: 0,
    totalQuantity: 1,
    createTime: "2026-05-06 10:30:00",
    products: [
      {
        id: 1,
        name: "绿萝盆栽",
        image: "/images/placeholder.svg",
        price: 29.9,
        quantity: 1,
        spec: "中号盆"
      }
    ],
    address: {
      name: "张三",
      phone: "13800138000",
      detail: "北京市朝阳区某某街道123号"
    }
  },
  {
    id: 2,
    orderNo: "SU20260506002",
    status: 3,
    statusText: "待收货",
    totalPrice: 137.9,
    productPrice: 127.9,
    shippingFee: 10,
    totalQuantity: 3,
    createTime: "2026-05-05 15:20:00",
    products: [
      {
        id: 2,
        name: "多肉植物组合",
        image: "/images/placeholder.svg",
        price: 49.9,
        quantity: 2,
        spec: "5株装"
      },
      {
        id: 3,
        name: "发财树",
        image: "/images/placeholder.svg",
        price: 38.1,
        quantity: 1,
        spec: "1米高"
      }
    ],
    address: {
      name: "李四",
      phone: "13900139000",
      detail: "上海市浦东新区某某路456号"
    }
  },
  {
    id: 3,
    orderNo: "SU20260506003",
    status: 4,
    statusText: "已完成",
    totalPrice: 88.0,
    productPrice: 88.0,
    shippingFee: 0,
    totalQuantity: 1,
    createTime: "2026-05-01 09:10:00",
    completeTime: "2026-05-04 14:20:00",
    products: [
      {
        id: 3,
        name: "发财树",
        image: "/images/placeholder.svg",
        price: 88.0,
        quantity: 1,
        spec: "1米高"
      }
    ],
    address: {
      name: "王五",
      phone: "13700137000",
      detail: "广州市天河区某某巷789号"
    }
  }
];

function getOrdersFromStorage() {
  try {
    const data = wx.getStorageSync(STORAGE_KEY_ORDERS);
    return data && data.length > 0 ? data : defaultMockOrders;
  } catch (e) {
    return defaultMockOrders;
  }
}

function saveOrdersToStorage(orders) {
  try {
    wx.setStorageSync(STORAGE_KEY_ORDERS, orders);
  } catch (e) {
    console.error("保存订单数据失败:", e);
  }
}

/**
 * 获取订单列表
 * @param {number|null} status 订单状态
 * @returns {Promise<Array>} 订单列表
 */
async function getOrderList(status) {
  try {
    let orders = [...getOrdersFromStorage()];

    if (status !== null && status !== undefined) {
      orders = orders.filter(order => order.status === status);
    }

    return orders;
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return [];
  }
}

/**
 * 获取订单详情
 * @param {number} orderId 订单ID
 * @returns {Promise<Object>} 订单详情
 */
async function getOrderDetail(orderId) {
  try {
    const orders = getOrdersFromStorage();
    const order = orders.find(o => o.id == orderId);
    if (!order) {
      throw new Error("订单不存在");
    }

    return {
      ...order,
      couponDiscount: 0
    };
  } catch (error) {
    console.error("获取订单详情失败:", error);
    throw error;
  }
}

/**
 * 创建订单
 * @param {Object} orderData { items, addressId, address, remark }
 * @returns {Promise<Object>} 新订单
 */
async function createOrder(orderData) {
  try {
    const { items, addressId, address, remark } = orderData;
    const orders = getOrdersFromStorage();

    const productPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = productPrice >= 99 ? 0 : 10;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    const newOrder = {
      id: Date.now(),
      orderNo: `SU${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      status: 1,
      statusText: "待付款",
      totalPrice: productPrice + shippingFee,
      productPrice,
      shippingFee,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      createTime: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      products: items.map(item => ({
        id: item.id || item.productId,
        name: item.name || item.productName,
        image: item.image || item.productImage || "/images/placeholder.svg",
        price: item.price,
        quantity: item.quantity,
        spec: item.spec || item.specName || ""
      })),
      address: address || {
        id: addressId,
        name: "收货人",
        phone: "13800138000",
        detail: "收货地址"
      },
      remark: remark || ""
    };

    orders.unshift(newOrder);
    saveOrdersToStorage(orders);

    return newOrder;
  } catch (error) {
    console.error("创建订单失败:", error);
    throw error;
  }
}

/**
 * 取消订单
 * @param {number} orderId 订单ID
 * @returns {Promise<boolean>} 操作结果
 */
async function cancelOrder(orderId) {
  try {
    const orders = getOrdersFromStorage();
    const orderIndex = orders.findIndex(o => o.id == orderId);
    if (orderIndex >= 0) {
      orders[orderIndex].status = 0;
      orders[orderIndex].statusText = "已取消";
      saveOrdersToStorage(orders);
    }
    return true;
  } catch (error) {
    console.error("取消订单失败:", error);
    return false;
  }
}

/**
 * 确认收货
 * @param {number} orderId 订单ID
 * @returns {Promise<boolean>} 操作结果
 */
async function confirmReceive(orderId) {
  try {
    const orders = getOrdersFromStorage();
    const orderIndex = orders.findIndex(o => o.id == orderId);
    if (orderIndex >= 0) {
      orders[orderIndex].status = 4;
      orders[orderIndex].statusText = "已完成";
      orders[orderIndex].completeTime = new Date().toLocaleString();
      saveOrdersToStorage(orders);
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
  confirmReceive
};
