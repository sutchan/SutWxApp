// 鍏虫敞鏈嶅姟妯″潡
import api from './api';

/**
 * 鍏虫敞鏈嶅姟锛屽鐞嗙敤鎴峰叧娉ㄧ浉鍏崇殑API璋冪敤
 */
const followingService = {
  /**
   * 鑾峰彇鐢ㄦ埛鍏虫敞鍒楄〃
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.per_page - 姣忛〉鏁伴噺
   * @returns {Promise<Object>} 鍏虫敞鍒楄〃鏁版嵁
   */
  async getUserFollowing(params = {}) {
    try {
      const response = await api.get('/following', {
        page: params.page || 1,
        per_page: params.per_page || 10
      });
      
      return response;
    } catch (error) {
      console.error('鑾峰彇鍏虫敞鍒楄〃澶辫触:', error);
      throw error;
    }
  }

  /**
   * 鍏虫敞鐢ㄦ埛
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {number} params.user_id - 瑕佸叧娉ㄧ殑鐢ㄦ埛ID
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async followUser(params = {}) {
    try {
      if (!params.user_id) {
        throw new Error('鐢ㄦ埛ID涓嶈兘涓虹┖');
      }
      
      const response = await api.post('/following', {
        user_id: params.user_id
      });
      
      return response;
    } catch (error) {
      console.error('鍏虫敞鐢ㄦ埛澶辫触:', error);
      throw error;
    }
  }

  /**
   * 鍙栨秷鍏虫敞
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {number} params.id - 鍏虫敞璁板綍ID
   * @returns {Promise<Object>} 鎿嶄綔缁撴灉
   */
  async unfollowUser(params = {}) {
    try {
      if (!params.id) {
        throw new Error('鍏虫敞ID涓嶈兘涓虹┖');
      }
      
      const response = await api.delete(`/following/${params.id}`);
      
      return response;
    } catch (error) {
      console.error('鍙栨秷鍏虫敞澶辫触:', error);
      throw error;
    }
  }

  /**
   * 妫€鏌ユ槸鍚﹀凡鍏虫敞鐢ㄦ埛
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {number} params.user_id - 瑕佹鏌ョ殑鐢ㄦ埛ID
   * @returns {Promise<Object>} 鍏虫敞鐘舵€?   */
  async checkFollowingStatus(params = {}) {
    try {
      if (!params.user_id) {
        throw new Error('鐢ㄦ埛ID涓嶈兘涓虹┖');
      }
      
      const response = await api.get(`/following/check/${params.user_id}`);
      
      return response;
    } catch (error) {
      console.error('妫€鏌ュ叧娉ㄧ姸鎬佸け璐?', error);
      throw error;
    }
  }

  /**
   * 鑾峰彇鎴戠殑绮変笣鍒楄〃
   * @param {Object} params - 璇锋眰鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.per_page - 姣忛〉鏁伴噺
   * @returns {Promise<Object>} 绮変笣鍒楄〃鏁版嵁
   */
  async getMyFollowers(params = {}) {
    try {
      const response = await api.get('/following/followers', {
        page: params.page || 1,
        per_page: params.per_page || 10
      });
      
      return response;
    } catch (error) {
      console.error('鑾峰彇绮変笣鍒楄〃澶辫触:', error);
      throw error;
    }
  }
};

export default followingService;
\n