﻿/**
 * 文件名 distributeService.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-29
 * 描述: 鍒嗛攢鏈嶅姟锛岃礋璐ｅ鐞嗗垎閿€鐩稿叧鐨勪笟鍔￠€昏緫
 */

const request = require('../utils/request');

const distributeService = {
  /**
   * 鑾峰彇鍒嗛攢鍒楄〃
   * @param {Object} options - 鏌ヨ鍙傛暟
   * @param {string} options.status - 鍒嗛攢鐘舵€侊細all/pending/approved/rejected/deleted
   * @param {string} options.type - 鍒嗛攢绫诲瀷锛歛ll/product/article
   * @param {number} options.page - 椤电爜锛岄粯璁や负1
   * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
   * @returns {Promise<Object>} 鍒嗛攢鍒楄〃鍜屽垎椤典俊鎭?   */
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
   * 鑾峰彇鍒嗛攢璇︽儏
   * @param {string} id - 鍒嗛攢ID
   * @returns {Promise<Object>} 鍒嗛攢璇︽儏
   */
  getDistributeDetail(id) {
    if (!id) {
      return Promise.reject(new Error('鍒嗛攢ID涓嶈兘涓虹┖'));
    }
    
    return request.get(`/distributes/${id}`);
  },

  /**
   * 鍒犻櫎鍒嗛攢
   * @param {string} id - 鍒嗛攢ID
   * @param {string} reason - 鍒犻櫎鍘熷洜
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  deleteDistribute(id, reason) {
    if (!id) {
      return Promise.reject(new Error('鍒嗛攢ID涓嶈兘涓虹┖'));
    }
    
    return request.delete(`/distributes/${id}`, { reason });
  },

  /**
   * 椹冲洖鍒嗛攢
   * @param {string} id - 鍒嗛攢ID
   * @param {string} reason - 椹冲洖鍘熷洜
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  rejectDistribute(id, reason) {
    if (!id || !reason) {
      return Promise.reject(new Error('鍒嗛攢ID鍜岄┏鍥炲師鍥犱笉鑳戒负绌?));
    }
    
    return request.put(`/distributes/${id}/reject`, { reason });
  },

  /**
   * 瀹℃牳閫氳繃鍒嗛攢
   * @param {string} id - 鍒嗛攢ID
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  approveDistribute(id) {
    if (!id) {
      return Promise.reject(new Error('鍒嗛攢ID涓嶈兘涓虹┖'));
    }
    
    return request.put(`/distributes/${id}/approve`);
  },

  /**
   * 鑾峰彇鍒嗛攢缁熻淇℃伅
   * @returns {Promise<Object>} 鍒嗛攢缁熻淇℃伅
   */
  getDistributeStats() {
    return request.get('/distributes/stats');
  },

  /**
   * 鑾峰彇鍒嗛攢瑙勫垯
   * @returns {Promise<Object>} 鍒嗛攢瑙勫垯
   */
  getDistributeRules() {
    return request.get('/distributes/rules');
  },

  /**
   * 鏇存柊鍒嗛攢瑙勫垯
   * @param {Object} rules - 鍒嗛攢瑙勫垯
   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  updateDistributeRules(rules) {
    return request.put('/distributes/rules', rules);
  }
};

module.exports = distributeService;