/**
 * 文件名: distributeService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-29
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
    
    return request.delete(`/distributes/${id}`, { reason });
  },

  /**
   * 驳回分销
   * @param {string} id - 分销ID
   * @param {string} reason - 驳回原因
   * @returns {Promise<Object>} 操作结果
   */
  rejectDistribute(id, reason) {
    if (!id || !reason) {
      return Promise.reject(new Error('分销ID和驳回原因不能为空'));
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
  }
};

module.exports = distributeService;