/**
 * 文件名: payService.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 支付服务层（FE-004）：对接后端 /api/pay/* 微信支付 V3 端点。
 *       流程：prepay 获取 wx.requestPayment 参数 → 调起支付 →
 *       回调延迟时主动查单（/api/pay/query）兜底同步订单状态。
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");
const { mapWooCommerceOrder } = require("../models/order");

/**
 * 获取预支付参数
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<Object>} wx.requestPayment 参数（含 orderId）
 */
async function fetchPrepayParams(orderId) {
  const params = unwrap(
    await request.post("/api/pay/prepay", { orderId }, { useCache: false }),
  );
  if (!params || !params.paySign) {
    throw new Error("支付参数获取失败");
  }
  return params;
}

/**
 * 主动查单：支付回调延迟时同步订单状态
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<Object>} { tradeState, order }
 */
async function fetchPayResult(orderId) {
  const result = unwrap(
    await request.post("/api/pay/query", { orderId }, { useCache: false }),
  );
  return {
    tradeState: (result && result.tradeState) || "",
    order: mapWooCommerceOrder(result && result.order),
  };
}

/**
 * 调起微信支付（Promise 封装 wx.requestPayment）
 * @param {Object} params 预支付参数
 * @returns {Promise<void>} 用户完成支付；用户取消则 reject
 */
function requestPayment(params) {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: String(params.timeStamp),
      nonceStr: params.nonceStr,
      package: params.package,
      signType: params.signType || "RSA",
      paySign: params.paySign,
      success: () => resolve(),
      fail: (err) => reject(err),
    });
  });
}

/**
 * 订单支付全流程
 * @param {number|string} orderId 订单 ID
 * @returns {Promise<Object>} 支付后的最新订单 DTO（查单失败时返回 null）
 */
async function payOrder(orderId) {
  const params = await fetchPrepayParams(orderId);

  try {
    await requestPayment(params);
  } catch (err) {
    // 支付失败/用户取消：查单兜底（微信侧可能已扣款但回调延迟）
    const result = await fetchPayResult(orderId).catch(() => null);
    if (result && result.order && result.order.status !== 1) {
      return result.order;
    }
    throw err;
  }

  // 支付成功：主动查单同步状态（notify 可能尚未到达）
  const result = await fetchPayResult(orderId).catch(() => null);
  return result ? result.order : null;
}

module.exports = {
  fetchPrepayParams,
  fetchPayResult,
  requestPayment,
  payOrder,
};
