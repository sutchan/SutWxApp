﻿/**
 * 鏂囦欢鍚? paymentService.js
 * 鐗堟湰鍙? 1.0.1
 * 鏇存柊鏃ユ湡: 2025-11-28
 * 浣滆€? Sut
 * 鎻忚堪: 鏀粯鏈嶅姟
 */

const request = require('../utils/request');

class PaymentService {
  /**
   * 鍒涘缓鏀粯璁㈠崟
   * @param {Object} data - 鏀粯鏁版嵁
   * @param {Array} data.items - 鍟嗗搧鍒楄〃
   * @param {number} data.totalAmount - 鎬婚噾棰?   * @param {string} [data.couponId] - 浼樻儬鍒窱D (鍙€?
   * @param {string} [data.addressId] - 鏀惰揣鍦板潃ID (鍙€?
   * @param {string} [data.remark] - 璁㈠崟澶囨敞 (鍙€?
   * @returns {Promise<Object>} 鍒涘缓缁撴灉
   */
  static async createPayment(data) {
    return request.post('/payment/create', data);
  }

  /**
   * 鑾峰彇鏀粯鏂瑰紡鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @returns {Promise<Object>} 鏀粯鏂瑰紡鍒楄〃
   */
  static async getPaymentMethods(options = {}) {
    return request.get('/payment/methods', options);
  }

  /**
   * 鍙戣捣鏀粯璇锋眰
   * @param {Object} data - 鏀粯鍙傛暟
   * @param {string} data.orderId - 璁㈠崟ID
   * @param {string} data.paymentMethod - 鏀粯鏂瑰紡
   * @param {string} [data.returnUrl] - 鏀粯鎴愬姛杩斿洖URL (鍙€?
   * @param {string} [data.notifyUrl] - 鏀粯缁撴灉閫氱煡URL (鍙€?
   * @returns {Promise<Object>} 鏀粯璇锋眰缁撴灉
   */
  static async initiatePayment(data) {
    return request.post('/payment/initiate', data);
  }

  /**
   * 鏌ヨ鏀粯鐘舵€?   * @param {string} paymentId - 鏀粯ID
   * @returns {Promise<Object>} 鏀粯鐘舵€?   */
  static async getPaymentStatus(paymentId) {
    return request.get(`/payment/status/${paymentId}`);
  }

  /**
   * 鍙栨秷鏀粯
   * @param {string} paymentId - 鏀粯ID
   * @returns {Promise<Object>} 鍙栨秷缁撴灉
   */
  static async cancelPayment(paymentId) {
    return request.post(`/payment/cancel/${paymentId}`);
  }

  /**
   * 鐢宠閫€娆?   * @param {Object} data - 閫€娆炬暟鎹?   * @param {string} data.orderId - 璁㈠崟ID
   * @param {number} data.refundAmount - 閫€娆鹃噾棰?   * @param {string} data.reason - 閫€娆惧師鍥?   * @returns {Promise<Object>} 閫€娆捐姹傜粨鏋?   */
  static async requestRefund(data) {
    return request.post('/payment/refund', data);
  }

  /**
   * 鏌ヨ閫€娆剧姸鎬?   * @param {string} refundId - 閫€娆綢D
   * @returns {Promise<Object>} 閫€娆剧姸鎬?   */
  static async getRefundStatus(refundId) {
    return request.get(`/payment/refund/status/${refundId}`);
  }

  /**
   * 鑾峰彇鏀粯璁板綍鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {number} [options.page] - 椤电爜锛岄粯璁や负1
   * @param {number} [options.pageSize] - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @param {string} [options.status] - 鏀粯鐘舵€佺瓫閫?   * @param {string} [options.startDate] - 寮€濮嬫棩鏈?   * @param {string} [options.endDate] - 缁撴潫鏃ユ湡
   * @returns {Promise<Object>} 鏀粯璁板綍鍒楄〃鍜屽垎椤典俊鎭?   */
  static async getPaymentHistory(options = {}) {
    return request.get('/payment/history', options);
  }

  /**
   * 鑾峰彇閫€娆捐褰曞垪琛?   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {number} [options.page] - 椤电爜锛岄粯璁や负1
   * @param {number} [options.pageSize] - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @param {string} [options.status] - 閫€娆剧姸鎬佺瓫閫?   * @param {string} [options.startDate] - 寮€濮嬫棩鏈?   * @param {string} [options.endDate] - 缁撴潫鏃ユ湡
   * @returns {Promise<Object>} 閫€娆捐褰曞垪琛ㄥ拰鍒嗛〉淇℃伅
   */
  static async getRefundHistory(options = {}) {
    return request.get('/payment/refund/history', options);
  }

  /**
   * 鑾峰彇鏀粯璇︽儏
   * @param {string} paymentId - 鏀粯ID
   * @returns {Promise<Object>} 鏀粯璇︽儏
   */
  static async getPaymentDetail(paymentId) {
    return request.get(`/payment/detail/${paymentId}`);
  }

  /**
   * 閲嶆柊鍙戣捣鏀粯
   * @param {string} paymentId - 鍘熸敮浠業D
   * @returns {Promise<Object>} 鏂版敮浠樿姹傜粨鏋?   */
  static async retryPayment(paymentId) {
    return request.post(`/payment/retry/${paymentId}`);
  }

  /**
   * 楠岃瘉鏀粯缁撴灉
   * @param {Object} data - 楠岃瘉鏁版嵁
   * @param {string} data.paymentId - 鏀粯ID
   * @param {Object} data.verifyData - 楠岃瘉鏁版嵁锛堝绛惧悕绛夛級
   * @returns {Promise<Object>} 楠岃瘉缁撴灉
   */
  static async verifyPayment(data) {
    return request.post('/payment/verify', data);
  }

  /**
   * 鑾峰彇鏀粯缁熻淇℃伅
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} [options.period] - 缁熻鍛ㄦ湡锛歞ay/week/month/year
   * @param {string} [options.startDate] - 寮€濮嬫棩鏈?   * @param {string} [options.endDate] - 缁撴潫鏃ユ湡
   * @returns {Promise<Object>} 鏀粯缁熻淇℃伅
   */
  static async getPaymentStatistics(options = {}) {
    return request.get('/payment/statistics', options);
  }

  /**
   * 璁剧疆榛樿鏀粯鏂瑰紡
   * @param {string} paymentMethod - 鏀粯鏂瑰紡ID
   * @returns {Promise<Object>} 璁剧疆缁撴灉
   */
  static async setDefaultPaymentMethod(paymentMethod) {
    return request.put('/payment/default-method', { paymentMethod });
  }

  /**
   * 鑾峰彇榛樿鏀粯鏂瑰紡
   * @returns {Promise<Object>} 榛樿鏀粯鏂瑰紡
   */
  static async getDefaultPaymentMethod() {
    return request.get('/payment/default-method');
  }

  /**
   * 缁戝畾鏀粯璐︽埛
   * @param {Object} data - 缁戝畾鏁版嵁
   * @param {string} data.paymentMethod - 鏀粯鏂瑰紡
   * @param {Object} data.accountInfo - 璐︽埛淇℃伅
   * @returns {Promise<Object>} 缁戝畾缁撴灉
   */
  static async bindPaymentAccount(data) {
    return request.post('/payment/bind-account', data);
  }

  /**
   * 瑙ｇ粦鏀粯璐︽埛
   * @param {string} accountId - 璐︽埛ID
   * @returns {Promise<Object>} 瑙ｇ粦缁撴灉
   */
  static async unbindPaymentAccount(accountId) {
    return request.delete(`/payment/unbind-account/${accountId}`);
  }

  /**
   * 鑾峰彇宸茬粦瀹氱殑鏀粯璐︽埛鍒楄〃
   * @returns {Promise<Object>} 宸茬粦瀹氳处鎴峰垪琛?   */
  static async getBoundAccounts() {
    return request.get('/payment/bound-accounts');
  }

  /**
   * 棰勬敮浠樿鍗?   * @param {Object} data - 棰勬敮浠樻暟鎹?   * @param {Array} data.items - 鍟嗗搧鍒楄〃
   * @param {number} data.totalAmount - 鎬婚噾棰?   * @returns {Promise<Object>} 棰勬敮浠樼粨鏋?   */
  static async prePayment(data) {
    return request.post('/payment/pre-payment', data);
  }

  /**
   * 纭棰勬敮浠樿鍗?   * @param {string} prePaymentId - 棰勬敮浠業D
   * @returns {Promise<Object>} 纭缁撴灉
   */
  static async confirmPrePayment(prePaymentId) {
    return request.post(`/payment/confirm-pre-payment/${prePaymentId}`);
  }
}

module.exports = PaymentService;