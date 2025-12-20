﻿/**
 * 文件名: distributeService.js
 * 版本号: 1.0.1
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 分销服务，负责处理分销相关的业务逻辑
 */

const request = require('../utils/request');

const distributeService = {
  /**
   * 获取分销列表
   * @param {Object} options - 查询参数
   * @param {string} options.status - 分销状态：all/pending/approved/rejected/deleted
   * @param {string} options.type - 分销类型：all/product/article
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 分销列表和分页信息
   */
  getDistributeList(options = {}) {
    const params = {
      status: options.status || 'all',
      type: options.type || 'all',
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };
    
    return request.get('/distributes', params);
  },

  /**
   * 获取分销详情
   * @param {string} id - 分销ID
   * @returns {Promise<Object>} 分销详情
   */
  getDistributeDetail(id) {
    if (!id) {
      return Promise.reject(new Error('分销ID不能为空'));
    }
    
    return request.get(`/distributes/${id}`);
  },

  /**
   * 删除分销
   * @param {string} id - 分销ID
   * @param {string} reason - 删除原因
   * @returns {Promise<Object>} 操作结果
   */
  deleteDistribute(id, reason) {
    if (!id) {
      return Promise.reject(new Error('分销ID不能为空'));
    }
    
    if (!reason) {
      return Promise.reject(new Error('删除原因不能为空'));
    }
    
    return request.delete(`/distributes/${id}`, { reason });
  },

  /**
   * 拒绝分销
   * @param {string} id - 分销ID
   * @param {string} reason - 拒绝原因
   * @returns {Promise<Object>} 操作结果
   */
  rejectDistribute(id, reason) {
    if (!id || !reason) {
      return Promise.reject(new Error('分销ID和拒绝原因不能为空'));
    }
    
    return request.put(`/distributes/${id}/reject`, { reason });
  },

  /**
   * 审核通过分销
   * @param {string} id - 分销ID
   * @returns {Promise<Object>} 操作结果
   */
  approveDistribute(id) {
    if (!id) {
      return Promise.reject(new Error('分销ID不能为空'));
    }
    
    return request.put(`/distributes/${id}/approve`);
  },

  /**
   * 获取分销统计信息
   * @returns {Promise<Object>} 分销统计信息
   */
  getDistributeStats() {
    return request.get('/distributes/stats');
  },

  /**
   * 获取分销规则
   * @returns {Promise<Object>} 分销规则
   */
  getDistributeRules() {
    return request.get('/distributes/rules');
  },

  /**
   * 更新分销规则
   * @param {Object} rules - 分销规则
   * @returns {Promise<Object>} 更新结果
   */
  updateDistributeRules(rules) {
    return request.put('/distributes/rules', rules);
  },

  /**
   * 用户申请分销
   * @param {Object} data - 申请数据
   * @param {string} data.userId - 用户ID
   * @param {string} data.type - 分销类型：product/article
   * @param {string} data.content - 申请说明
   * @returns {Promise<Object>} 申请结果
   */
  applyForDistribution(data) {
    if (!data.userId || !data.type) {
      return Promise.reject(new Error('用户ID和分销类型不能为空'));
    }
    
    return request.post('/distributes/apply', data);
  },

  /**
   * 用户获取自己的分销记录
   * @param {Object} options - 查询参数
   * @param {string} options.status - 分销状态：all/pending/approved/rejected
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 分销记录和分页信息
   */
  getUserDistributionRecords(options = {}) {
    const params = {
      status: options.status || 'all',
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };
    
    return request.get('/user/distributes', params);
  },

  /**
   * 用户获取自己的分销业绩
   * @param {Object} options - 查询参数
   * @param {string} options.timeRange - 时间范围：today/week/month/year/all
   * @returns {Promise<Object>} 分销业绩数据
   */
  getUserDistributionPerformance(options = {}) {
    const params = {
      timeRange: options.timeRange || 'all'
    };
    
    return request.get('/user/distributes/performance', params);
  },

  /**
   * 获取分销链接
   * @param {Object} options - 链接参数
   * @param {string} options.productId - 产品ID（可选）
   * @param {string} options.articleId - 文章ID（可选）
   * @returns {Promise<Object>} 分销链接信息
   */
  getDistributionLink(options = {}) {
    return request.get('/distributes/link', options);
  },

  /**
   * 获取分销二维码
   * @param {Object} options - 二维码参数
   * @param {string} options.productId - 产品ID（可选）
   * @param {string} options.articleId - 文章ID（可选）
   * @param {number} options.size - 二维码尺寸，默认为200
   * @returns {Promise<Object>} 分销二维码信息
   */
  getDistributionQRCode(options = {}) {
    const params = {
      size: options.size || 200,
      productId: options.productId,
      articleId: options.articleId
    };
    
    return request.get('/distributes/qrcode', params);
  },

  /**
   * 获取分销收益
   * @param {Object} options - 查询参数
   * @param {string} options.timeRange - 时间范围：today/week/month/year/all
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 分销收益数据和分页信息
   */
  getDistributionEarnings(options = {}) {
    const params = {
      timeRange: options.timeRange || 'all',
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };
    
    return request.get('/user/distributes/earnings', params);
  },

  /**
   * 申请提现分销收益
   * @param {Object} data - 提现数据
   * @param {number} data.amount - 提现金额
   * @param {string} data.method - 提现方式：wechat/alipay
   * @param {string} data.account - 提现账户
   * @returns {Promise<Object>} 提现申请结果
   */
  applyWithdrawal(data) {
    if (!data.amount || !data.method || !data.account) {
      return Promise.reject(new Error('提现金额、提现方式和提现账户不能为空'));
    }
    
    return request.post('/user/distributes/withdrawal', data);
  },

  /**
   * 获取提现记录
   * @param {Object} options - 查询参数
   * @param {string} options.status - 提现状态：all/pending/approved/rejected
   * @param {number} options.page - 页码，默认为1
   * @param {number} options.pageSize - 每页数量，默认为20
   * @returns {Promise<Object>} 提现记录和分页信息
   */
  getWithdrawalRecords(options = {}) {
    const params = {
      status: options.status || 'all',
      page: options.page || 1,
      pageSize: options.pageSize || 20
    };
    
    return request.get('/user/distributes/withdrawal/records', params);
  }
};

module.exports = distributeService;