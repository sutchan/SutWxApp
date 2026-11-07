/**
 * 文件名: orderService.helpers.js
 * 版本号: 3.5.12
 * 更新日期: 2026-11-07
 * 描述: 订单服务纯辅助函数（自 orderService.js 拆出）：单号生成、mock 订单组装、
 *       购物车商品与收货地址 → 后端请求快照。不含 IO，便于单测。
 */

/**
 * 生成订单编号（SU + 年月日 + 3 位随机序号）
 * @returns {string}
 */
function genOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `SU${y}${m}${d}${seq}`;
}

/**
 * 组装 mock 订单对象
 * @param {Array} items 下单商品列表
 * @param {string} [remark] 订单备注
 * @returns {Object}
 */
function buildOrderPayload(items, remark) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
  // 购物车项用 productId，部分页面/测试传 id，两者都兼容，避免下单商品 ID 丢失。
  return (Array.isArray(items) ? items : []).map((item) => ({
    productId: item.productId !== undefined ? item.productId : item.id,
    quantity: item.quantity,
  }));
}

/**
 * 地址对象 → 后端地址快照 {name, phone, province, city, district, detail}
 * @param {Object} address 页面地址对象
 * @returns {Object}
 */
function toAddressSnapshot(address) {
  const a = address || {};
  return {
    name: a.name || "",
    phone: a.phone || "",
    province: a.province || "",
    city: a.city || "",
    district: a.district || "",
    detail: a.detail || "",
  };
}

module.exports = {
  genOrderNo,
  buildOrderPayload,
  toOrderItems,
  toAddressSnapshot,
};
