/**
 * following-service.js - 关注服务模块
 * 提供用户关注相关的API调用
 */

const api = require('./api');

/**
 * 关注服务对象
 */
const followingService = {
  /**
   * 获取用户关注列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.per_page - 每页数量
   * @returns {Promise<Object>} 关注列表响应数据
   */
  async getUserFollowing(params = {}) {
    try {
      const response = await api.get('/api/following', {
        page: params.page || 1,
        per_page: params.per_page || 10
      });
      
      return response;
    } catch (error) {
      console.error('获取用户关注列表失败:', error);
      throw error;
    }
  },

  /**
   * 关注用户
   * @param {Object} params - 查询参数
   * @param {number} params.user_id - 要关注的用户ID
   * @returns {Promise<Object>} 操作结果
   */
  async followUser(params = {}) {
    try {
      if (!params.user_id) {
        throw new Error('用户ID不能为空');
      }
      
      const response = await api.post('/api/following', {
        user_id: params.user_id
      });
      
      return response;
    } catch (error) {
      console.error('关注用户失败', error);
      throw error;
    }
  },

  /**
   * 取消关注
   * @param {Object} params - 查询参数
   * @param {number} params.id - 关注记录ID
   * @returns {Promise<Object>} 操作结果
   */
  async unfollowUser(params = {}) {
    try {
      if (!params.id) {
        throw new Error('关注ID不能为空');
      }
      
      const response = await api.delete(`/api/following/${params.id}`);
      
      return response;
    } catch (error) {
      console.error('取消关注失败', error);
      throw error;
    }
  },

  /**
   * 检查当前用户是否关注了指定用户
   * @param {Object} params - 查询参数
   * @param {number} params.user_id - 目标用户ID
   * @returns {Promise<Object>} 关注状态
   */
  async checkFollowingStatus(params = {}) {
    try {
      if (!params.user_id) {
        throw new Error('用户ID不能为空');
      }
      
      const response = await api.get(`/api/following/check/${params.user_id}`);
      
      return response;
    } catch (error) {
      console.error('检查关注状态失败', error);
      throw error;
    }
  },

  /**
   * 获取我的粉丝列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.per_page - 每页数量
   * @returns {Promise<Object>} 粉丝列表响应数据
   */
  async getMyFollowers(params = {}) {
    try {
      const response = await api.get('/api/following/followers', {
        page: params.page || 1,
        per_page: params.per_page || 10
      });
      
      return response;
    } catch (error) {
      console.error('获取粉丝列表失败:', error);
      throw error;
    }
  }
};

module.exports = followingService;
