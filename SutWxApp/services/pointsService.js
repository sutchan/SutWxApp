﻿/**
 * 鏂囦欢鍚? pointsService.js
 * 鐗堟湰鍙? 1.0.1
 * 鏇存柊鏃ユ湡: 2025-11-28
 * 鎻忚堪: 绉垎鏈嶅姟
 */

const request = require('../utils/request');

class PointsService {
  /**
   * 鑾峰彇鐢ㄦ埛绉垎淇℃伅
   * @returns {Promise<Object>} 鐢ㄦ埛绉垎淇℃伅
   */
  static async getUserPoints() {
    return request.get('/points/user-info');
  }

  /**
   * 鑾峰彇绉垎浠诲姟鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 浠诲姟绫诲瀷锛歛ll/once/daily/weekly/monthly
   * @param {string} options.status - 浠诲姟鐘舵€侊細all/pending/completed/unclaimed
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 浠诲姟鍒楄〃鍜屽垎椤典俊鎭?   */
  static async getPointsTasks(options = {}) {
    return request.get('/points/tasks', options);
  }

  /**
   * 瀹屾垚绉垎浠诲姟
   * @param {string} taskId - 浠诲姟ID
   * @returns {Promise<Object>} 瀹屾垚缁撴灉
   */
  static async completeTask(taskId) {
    return request.post(`/points/tasks/${taskId}/complete`);
  }

  /**
   * 棰嗗彇浠诲姟濂栧姳
   * @param {string} taskId - 浠诲姟ID
   * @returns {Promise<Object>} 棰嗗彇缁撴灉
   */
  static async claimTaskReward(taskId) {
    return request.post(`/points/tasks/${taskId}/claim`);
  }

  /**
   * 鑾峰彇绉垎璁板綍鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 璁板綍绫诲瀷锛歛ll/earn/spend
   * @param {string} options.source - 绉垎鏉ユ簮
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @param {string} options.startDate - 寮€濮嬫棩鏈?   * @param {string} options.endDate - 缁撴潫鏃ユ湡
   * @returns {Promise<Object>} 绉垎璁板綍鍒楄〃鍜屽垎椤典俊鎭?   */
  static async getPointsRecords(options = {}) {
    return request.get('/points/records', options);
  }

  /**
   * 鑾峰彇绉垎璇︽儏
   * @param {string} recordId - 璁板綍ID
   * @returns {Promise<Object>} 绉垎璇︽儏
   */
  static async getPointsRecordDetail(recordId) {
    return request.get(`/points/records/${recordId}`);
  }

  /**
   * 姣忔棩绛惧埌
   * @returns {Promise<Object>} 绛惧埌缁撴灉
   */
  static async dailySignin() {
    return request.post('/points/daily-signin');
  }

  /**
   * 鑾峰彇绛惧埌淇℃伅
   * @returns {Promise<Object>} 绛惧埌淇℃伅
   */
  static async getSigninInfo() {
    return request.get('/points/signin-info');
  }

  /**
   * 鑾峰彇绉垎鍟嗗煄鍟嗗搧鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.categoryId - 鍒嗙被ID
   * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歞efault/points_asc/points_desc/sales
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鍟嗗搧鍒楄〃鍜屽垎椤典俊鎭?   */
  static async getPointsMallProducts(options = {}) {
    return request.get('/points/mall/products', options);
  }

  /**
   * 鑾峰彇绉垎鍟嗗煄鍟嗗搧璇︽儏
   * @param {string} productId - 鍟嗗搧ID
   * @returns {Promise<Object>} 鍟嗗搧璇︽儏
   */
  static async getPointsMallProductDetail(productId) {
    return request.get(`/points/mall/products/${productId}`);
  }

  /**
   * 绉垎鍏戞崲鍟嗗搧
   * @param {Object} data - 鍏戞崲鏁版嵁
   * @param {string} data.productId - 鍟嗗搧ID
   * @param {number} data.quantity - 鍏戞崲鏁伴噺
   * @param {string} [data.addressId] - 鏀惰揣鍦板潃ID
   * @param {string} [data.remark] - 澶囨敞
   * @returns {Promise<Object>} 鍏戞崲缁撴灉
   */
  static async exchangeProduct(data) {
    return request.post('/points/mall/exchange', data);
  }

  /**
   * 鑾峰彇绉垎鍏戞崲璁板綍
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.status - 鍏戞崲鐘舵€侊細all/pending/shipped/completed/cancelled
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鍏戞崲璁板綍鍒楄〃鍜屽垎椤典俊鎭?   */
  static async getExchangeRecords(options = {}) {
    return request.get('/points/mall/exchange-records', options);
  }

  /**
   * 鑾峰彇绉垎鍏戞崲璇︽儏
   * @param {string} recordId - 鍏戞崲璁板綍ID
   * @returns {Promise<Object>} 鍏戞崲璇︽儏
   */
  static async getExchangeRecordDetail(recordId) {
    return request.get(`/points/mall/exchange-records/${recordId}`);
  }

  /**
   * 鍙栨秷绉垎鍏戞崲
   * @param {string} recordId - 鍏戞崲璁板綍ID
   * @param {string} reason - 鍙栨秷鍘熷洜
   * @returns {Promise<Object>} 鍙栨秷缁撴灉
   */
  static async cancelExchange(recordId, reason) {
    return request.post(`/points/mall/exchange-records/${recordId}/cancel`, { reason });
  }

  /**
   * 纭鏀惰揣
   * @param {string} recordId - 鍏戞崲璁板綍ID
   * @returns {Promise<Object>} 纭缁撴灉
   */
  static async confirmExchangeReceipt(recordId) {
    return request.post(`/points/mall/exchange-records/${recordId}/confirm-receipt`);
  }

  /**
   * 鑾峰彇绉垎鍟嗗煄鍒嗙被鍒楄〃
   * @returns {Promise<Object>} 鍒嗙被鍒楄〃
   */
  static async getPointsMallCategories() {
    return request.get('/points/mall/categories');
  }

  /**
   * 鑾峰彇绉垎瑙勫垯
   * @returns {Promise<Object>} 绉垎瑙勫垯
   */
  static async getPointsRules() {
    return request.get('/points/rules');
  }

  /**
   * 鑾峰彇绉垎缁熻淇℃伅
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.period - 缁熻鍛ㄦ湡锛歞ay/week/month/year
   * @param {string} options.startDate - 寮€濮嬫棩鏈?   * @param {string} options.endDate - 缁撴潫鏃ユ湡
   * @returns {Promise<Object>} 绉垎缁熻淇℃伅
   */
  static async getPointsStatistics(options = {}) {
    return request.get('/points/statistics', options);
  }

  /**
   * 鑾峰彇鍗冲皢杩囨湡绉垎
   * @returns {Promise<Object>} 鍗冲皢杩囨湡绉垎淇℃伅
   */
  static async getExpiringPoints() {
    return request.get('/points/expiring');
  }

  /**
   * 绉垎杞处
   * @param {Object} data - 杞处鏁版嵁
   * @param {string} data.toUserId - 鎺ユ敹鐢ㄦ埛ID
   * @param {number} data.amount - 杞处绉垎鏁伴噺
   * @param {string} data.message - 杞处鐣欒█
   * @returns {Promise<Object>} 杞处缁撴灉
   */
  static async transferPoints(data) {
    return request.post('/points/transfer', data);
  }

  /**
   * 鑾峰彇绉垎杞处璁板綍
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.type - 杞处绫诲瀷锛歛ll/sent/received
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 杞处璁板綍鍒楄〃鍜屽垎椤典俊鎭?   */
  static async getTransferRecords(options = {}) {
    return request.get('/points/transfer-records', options);
  }

  /**
   * 璁＄畻鍙姷鎵ｇН鍒?   * @param {Object} data - 璁＄畻鍙傛暟
   * @param {number} data.orderAmount - 璁㈠崟閲戦
   * @returns {Promise<Object>} 鍙姷鎵ｇН鍒嗕俊鎭?   */
  static async calculateDeductiblePoints(data) {
    return request.post('/points/calculate-deductible', data);
  }

  /**
   * 浣跨敤绉垎鎶垫墸
   * @param {Object} data - 鎶垫墸鍙傛暟
   * @param {string} data.orderId - 璁㈠崟ID
   * @param {number} data.points - 鎶垫墸绉垎鏁伴噺
   * @returns {Promise<Object>} 鎶垫墸缁撴灉
   */
  static async usePointsForDeduction(data) {
    return request.post('/points/use-for-deduction', data);
  }

  /**
   * 绉垎閫€娆捐繑杩?   * @param {Object} data - 杩旇繕鍙傛暟
   * @param {string} data.orderId - 璁㈠崟ID
   * @param {number} data.points - 杩旇繕绉垎鏁伴噺
   * @returns {Promise<Object>} 杩旇繕缁撴灉
   */
  static async refundPoints(data) {
    return request.post('/points/refund', data);
  }
}

module.exports = PointsService;