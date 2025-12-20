﻿﻿﻿﻿/**
 * 文件名 paymentService.js
 * 版本号 1.0.1
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 支付服务
 */

const request = require('../utils/request');

class PaymentService {
  /**
   * 创建支付订单
   * @param {Object} data - 支付数据
   * @param {Array} data.items - 商品列表
   * @param {number} data.totalAmount - 总金额
   * @param {string} [data.couponId] - 优惠券ID (可选)
   * @param {string} [data.addressId] - 收货地址ID (可选)
   * @param {string} [data.remark] - 订单备注 (可选)
   * @returns {Promise<Object>} 创建结果
   */
  static async createPayment(data) {
    return request.post('/payment/create', data);
  }

  /**
   * 获取支付方式列表
   * @param {Object} options - 查询参数
   * @returns {Promise<Object>} 支付方式列表
   */
  static async getPaymentMethods(options = {}) {
    return request.get('/payment/methods', options);
  }

  /**
   * 发起支付请求
   * @param {Object} data - 支付参数
   * @param {string} data.orderId - 订单ID
   * @param {string} data.paymentMethod - 支付方式
   * @param {string} [data.returnUrl] - 支付成功返回URL (可选)
   * @param {string} [data.notifyUrl] - 支付结果通知URL (可选)
   * @returns {Promise<Object>} 支付请求结果
   */
  static async initiatePayment(data) {
    return request.post('/payment/initiate', data);
  }

  /**
   * 查询支付状态
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 支付状态
   */
  static async getPaymentStatus(paymentId) {
    return request.get(`/payment/status/${paymentId}`);
  }

  /**
   * 取消支付
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 取消结果
   */
  static async cancelPayment(paymentId) {
    return request.post(`/payment/cancel/${paymentId}`);
  }

  /**
   * 申请退款
   * @param {Object} data - 退款数据
   * @param {string} data.orderId - 订单ID
   * @param {number} data.refundAmount - 退款金额
   * @param {string} data.reason - 退款原因
   * @returns {Promise<Object>} 退款申请结果
   */
  static async requestRefund(data) {
    return request.post('/payment/refund', data);
  }

  /**
   * 查询退款状态
   * @param {string} refundId - 退款ID
   * @returns {Promise<Object>} 退款状态
   */
  static async getRefundStatus(refundId) {
    return request.get(`/payment/refund/status/${refundId}`);
  }

  /**
   * 获取支付记录列表
   * @param {Object} options - 查询参数
   * @param {number} [options.page] - 页码，默认为1
   * @param {number} [options.pageSize] - 每页数量，默认为20
   * @param {string} [options.status] - 支付状态筛选
   * @param {string} [options.startDate] - 开始日期
   * @param {string} [options.endDate] - 结束日期
   * @returns {Promise<Object>} 支付记录列表和分页信息
   */
  static async getPaymentHistory(options = {}) {
    return request.get('/payment/history', options);
  }

  /**
   * 获取退款记录列表
   * @param {Object} options - 查询参数
   * @param {number} [options.page] - 页码，默认为1
   * @param {number} [options.pageSize] - 每页数量，默认为20
   * @param {string} [options.status] - 退款状态筛选
   * @param {string} [options.startDate] - 开始日期
   * @param {string} [options.endDate] - 结束日期
   * @returns {Promise<Object>} 退款记录列表和分页信息
   */
  static async getRefundHistory(options = {}) {
    return request.get('/payment/refund/history', options);
  }

  /**
   * 获取支付详情
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 支付详情
   */
  static async getPaymentDetail(paymentId) {
    return request.get(`/payment/detail/${paymentId}`);
  }

  /**
   * 重新发起支付
   * @param {string} paymentId - 原支付ID
   * @returns {Promise<Object>} 新支付请求结果
   */
  static async retryPayment(paymentId) {
    return request.post(`/payment/retry/${paymentId}`);
  }

  /**
   * 验证支付结果
   * @param {Object} data - 验证数据
   * @param {string} data.paymentId - 支付ID
   * @param {Object} data.verifyData - 验证数据（如签名等）
   * @returns {Promise<Object>} 验证结果
   */
  static async verifyPayment(data) {
    return request.post('/payment/verify', data);
  }

  /**
   * 获取支付统计信息
   * @param {Object} options - 查询参数
   * @param {string} [options.period] - 统计周期，可选值：day/week/month/year
   * @param {string} [options.startDate] - 开始日期
   * @param {string} [options.endDate] - 结束日期
   * @returns {Promise<Object>} 支付统计信息
   */
  static async getPaymentStatistics(options = {}) {
    return request.get('/payment/statistics', options);
  }

  /**
   * 设置默认支付方式
   * @param {string} paymentMethod - 支付方式ID
   * @returns {Promise<Object>} 设置结果
   */
  static async setDefaultPaymentMethod(paymentMethod) {
    return request.put('/payment/default-method', { paymentMethod });
  }

  /**
   * 获取默认支付方式
   * @returns {Promise<Object>} 默认支付方式
   */
  static async getDefaultPaymentMethod() {
    return request.get('/payment/default-method');
  }

  /**
   * 绑定支付账户
   * @param {Object} data - 绑定数据
   * @param {string} data.paymentMethod - 支付方式
   * @param {Object} data.accountInfo - 账户信息
   * @returns {Promise<Object>} 绑定结果
   */
  static async bindPaymentAccount(data) {
    return request.post('/payment/bind-account', data);
  }

  /**
   * 解绑支付账户
   * @param {string} accountId - 账户ID
   * @returns {Promise<Object>} 解绑结果
   */
  static async unbindPaymentAccount(accountId) {
    return request.delete(`/payment/unbind-account/${accountId}`);
  }

  /**
   * 获取已绑定的支付账户列表
   * @returns {Promise<Object>} 已绑定账户列表
   */
  static async getBoundAccounts() {
    return request.get('/payment/bound-accounts');
  }

  /**
   * 预支付
   * @param {Object} data - 预支付数据
   * @param {Array} data.items - 商品列表
   * @param {number} data.totalAmount - 总金额
   * @returns {Promise<Object>} 预支付结果
   */
  static async prePayment(data) {
    return request.post('/payment/pre-payment', data);
  }

  /**
   * 确认预支付订单
   * @param {string} prePaymentId - 预支付ID
   * @returns {Promise<Object>} 确认结果
   */
  static async confirmPrePayment(prePaymentId) {
    return request.post(`/payment/confirm-pre-payment/${prePaymentId}`);
  }
}

module.exports = PaymentService;