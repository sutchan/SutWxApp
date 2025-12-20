﻿﻿﻿﻿/**
 * 文件名 pointsService.js
 * 版本号 1.0.1
 * 更新日期: 2025-12-04
 * 描述: 积分服务
 */

const request = require('../utils/request');

class PointsService {
  /**
   * 获取用户积分信息
   * @returns {Promise<Object>} 用户积分信息
   */
  static async getUserPoints() {
    return request.get('/points/user-info');
  }

  /**
   * 获取积分任务列表
   * @param {Object} options - 查询参数
   * @param {string} options.type - 任务类型，可选值：all/once/daily/weekly/monthly
   * @param {string} options.status - 任务状态，可选值：all/pending/completed/unclaimed
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 任务列表和分页信息
   */
  static async getPointsTasks(options = {}) {
    return request.get('/points/tasks', options);
  }

  /**
   * 完成积分任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 完成结果
   */
  static async completeTask(taskId) {
    return request.post(`/points/tasks/${taskId}/complete`);
  }

  /**
   * 领取任务奖励
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 领取结果
   */
  static async claimTaskReward(taskId) {
    return request.post(`/points/tasks/${taskId}/claim`);
  }

  /**
   * 获取积分记录列表
   * @param {Object} options - 查询参数
   * @param {string} options.type - 记录类型，可选值：all/earn/spend
   * @param {string} options.source - 积分来源
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @param {string} options.startDate - 开始日期
   * @param {string} options.endDate - 结束日期
   * @returns {Promise<Object>} 积分记录列表和分页信息
   */
  static async getPointsRecords(options = {}) {
    return request.get('/points/records', options);
  }

  /**
   * 获取积分记录详情
   * @param {string} recordId - 记录ID
   * @returns {Promise<Object>} 积分记录详情
   */
  static async getPointsRecordDetail(recordId) {
    return request.get(`/points/records/${recordId}`);
  }

  /**
   * 每日签到
   * @returns {Promise<Object>} 签到结果
   */
  static async dailySignin() {
    return request.post('/points/daily-signin');
  }

  /**
   * 获取签到信息
   * @returns {Promise<Object>} 签到信息
   */
  static async getSigninInfo() {
    return request.get('/points/signin-info');
  }

  /**
   * 获取积分商城商品列表
   * @param {Object} options - 查询参数
   * @param {string} options.categoryId - 分类ID
   * @param {string} options.sort - 排序方式，可选值：default/points_asc/points_desc/sales
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 商品列表和分页信息
   */
  static async getPointsMallProducts(options = {}) {
    return request.get('/points/mall/products', options);
  }

  /**
   * 获取积分商城商品详情
   * @param {string} productId - 商品ID
   * @returns {Promise<Object>} 商品详情
   */
  static async getPointsMallProductDetail(productId) {
    return request.get(`/points/mall/products/${productId}`);
  }

  /**
   * 积分兑换商品
   * @param {Object} data - 兑换数据
   * @param {string} data.productId - 商品ID
   * @param {number} data.quantity - 兑换数量
   * @param {string} [data.addressId] - 收货地址ID
   * @param {string} [data.remark] - 备注
   * @returns {Promise<Object>} 兑换结果
   */
  static async exchangeProduct(data) {
    return request.post('/points/mall/exchange', data);
  }

  /**
   * 获取积分兑换记录
   * @param {Object} options - 查询参数
   * @param {string} options.status - 兑换状态，可选值：all/pending/shipped/completed/cancelled
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 兑换记录列表和分页信息
   */
  static async getExchangeRecords(options = {}) {
    return request.get('/points/mall/exchange-records', options);
  }

  /**
   * 获取积分兑换详情
   * @param {string} recordId - 兑换记录ID
   * @returns {Promise<Object>} 兑换详情
   */
  static async getExchangeRecordDetail(recordId) {
    return request.get(`/points/mall/exchange-records/${recordId}`);
  }

  /**
   * 取消积分兑换
   * @param {string} recordId - 兑换记录ID
   * @param {string} reason - 取消原因
   * @returns {Promise<Object>} 取消结果
   */
  static async cancelExchange(recordId, reason) {
    return request.post(`/points/mall/exchange-records/${recordId}/cancel`, { reason });
  }

  /**
   * 确认收货
   * @param {string} recordId - 兑换记录ID
   * @returns {Promise<Object>} 确认结果
   */
  static async confirmExchangeReceipt(recordId) {
    return request.post(`/points/mall/exchange-records/${recordId}/confirm-receipt`);
  }

  /**
   * 获取积分商城分类列表
   * @returns {Promise<Object>} 分类列表
   */
  static async getPointsMallCategories() {
    return request.get('/points/mall/categories');
  }

  /**
   * 获取积分规则
   * @returns {Promise<Object>} 积分规则
   */
  static async getPointsRules() {
    return request.get('/points/rules');
  }

  /**
   * 获取积分统计信息
   * @param {Object} options - 查询参数
   * @param {string} options.period - 统计周期，可选值：day/week/month/year
   * @param {string} options.startDate - 开始日期
   * @param {string} options.endDate - 结束日期
   * @returns {Promise<Object>} 积分统计信息
   */
  static async getPointsStatistics(options = {}) {
    return request.get('/points/statistics', options);
  }

  /**
   * 获取即将过期积分
   * @returns {Promise<Object>} 即将过期积分信息
   */
  static async getExpiringPoints() {
    return request.get('/points/expiring');
  }

  /**
   * 积分转账
   * @param {Object} data - 转账数据
   * @param {string} data.toUserId - 接收用户ID
   * @param {number} data.amount - 转账积分数量
   * @param {string} data.message - 转账留言
   * @returns {Promise<Object>} 转账结果
   */
  static async transferPoints(data) {
    return request.post('/points/transfer', data);
  }

  /**
   * 获取积分转账记录
   * @param {Object} options - 查询参数
   * @param {string} options.type - 转账类型，可选值：all/sent/received
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 转账记录列表和分页信息
   */
  static async getTransferRecords(options = {}) {
    return request.get('/points/transfer-records', options);
  }

  /**
   * 计算可抵扣积分
   * @param {Object} data - 计算参数
   * @param {number} data.orderAmount - 订单金额
   * @returns {Promise<Object>} 可抵扣积分信息
   */
  static async calculateDeductiblePoints(data) {
    return request.post('/points/calculate-deductible', data);
  }

  /**
   * 使用积分抵扣
   * @param {Object} data - 抵扣参数
   * @param {string} data.orderId - 订单ID
   * @param {number} data.points - 抵扣积分数量
   * @returns {Promise<Object>} 抵扣结果
   */
  static async usePointsForDeduction(data) {
    return request.post('/points/use-for-deduction', data);
  }

  /**
   * 积分返还
   * @param {Object} data - 返还参数
   * @param {string} data.orderId - 订单ID
   * @param {number} data.points - 返还积分数量
   * @returns {Promise<Object>} 返还结果
   */
  static async refundPoints(data) {
    return request.post('/points/refund', data);
  }
}

module.exports = PointsService;