// 关注服务模块
import api from './api';

/**
 * 关注服务，处理用户关注相关的API调用
 */
const followingService = {
  /**
   * 获取用户关注列表
   * @param {Object} params - 请求参数
   * @param {number} params.page - 页码
   * @param {number} params.per_page - 每页数量
   * @returns {Promise<Object>} 关注列表数据
   */
  async getUserFollowing(params = {}) {
    try {
      const response = await api.get('/following', {
        page: params.page || 1,
        per_page: params.per_page || 10
      });
      
      return response;
    } catch (error) {
      console.error('获取关注列表失败:', error);
      throw error;
    }
  }

  /**
   * 关注用户
   * @param {Object} params - 请求参数
   * @param {number} params.user_id - 要关注的用户ID
   * @returns {Promise<Object>} 操作结果
   */
  async followUser(params = {}) {
    try {
      if (!params.user_id) {
        throw new Error('用户ID不能为空');
      }
      
      const response = await api.post('/following', {
        user_id: params.user_id
      });
      
      return response;
    } catch (error) {
      console.error('关注用户失败:', error);
      throw error;
    }
  }

  /**
   * 取消关注
   * @param {Object} params - 请求参数
   * @param {number} params.id - 关注记录ID
   * @returns {Promise<Object>} 操作结果
   */
  async unfollowUser(params = {}) {
    try {
      if (!params.id) {
        throw new Error('关注ID不能为空');
      }
      
      const response = await api.delete(`/following/${params.id}`);
      
      return response;
    } catch (error) {
      console.error('取消关注失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否已关注用户
   * @param {Object} params - 请求参数
   * @param {number} params.user_id - 要检查的用户ID
   * @returns {Promise<Object>} 关注状态
   */
  async checkFollowingStatus(params = {}) {
    try {
      if (!params.user_id) {
        throw new Error('用户ID不能为空');
      }
      
      const response = await api.get(`/following/check/${params.user_id}`);
      
      return response;
    } catch (error) {
      console.error('检查关注状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取我的粉丝列表
   * @param {Object} params - 请求参数
   * @param {number} params.page - 页码
   * @param {number} params.per_page - 每页数量
   * @returns {Promise<Object>} 粉丝列表数据
   */
  async getMyFollowers(params = {}) {
    try {
      const response = await api.get('/following/followers', {
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

export default followingService;
