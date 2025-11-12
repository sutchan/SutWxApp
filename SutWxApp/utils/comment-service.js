/**
 * 评论服务
 * 提供文章评论相关的API调用功能
 */

const api = require('./api');
const { getStorage } = require('./global');

/**
 * 获取文章评论列表
 * @param {number|string} postId - 文章ID
 * @param {Object} params - 请求参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @param {string} params.order - 排序方向，默认为'desc'
 * @returns {Promise<Object>} - 返回评论列表和分页信息
 */
const getComments = async (postId, params = {}) => {
  try {
    // 准备请求参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      order: params.order || 'desc'
    };
    
    // 调用API
    return await api.get(`/api/posts/${postId}/comments`, queryParams);
  } catch (error) {
    console.error('获取评论列表失败:', error);
    throw error;
  }
};

/**
 * 创建评论
 * @param {number|string} postId - 文章ID
 * @param {string} content - 评论内容
 * @param {Object} options - 可选参数
 * @param {number|string} options.parent - 父评论ID，默认为0，用于回复其他评论
 * @param {string} options.author_name - 游客评论时的用户名，登录用户不需要
 * @param {string} options.author_email - 游客评论时的邮箱，登录用户不需要
 * @returns {Promise<Object>} - 返回创建的评论对象
 */
const createComment = async (postId, content, options = {}) => {
  try {
    // 验证评论内容
    if (!content || content.trim() === '') {
      throw new Error('评论内容不能为空');
    }
    
    // 准备评论数据
    const commentData = {
      content: content.trim(),
      parent: options.parent || 0
    };
    
    // 检查用户登录状态，未登录需要提供用户名和邮箱
    const userInfo = getStorage('userInfo');
    if (!userInfo || !userInfo.token) {
      if (!options.author_name || !options.author_email) {
        throw new Error('请提供用户名和邮箱');
      }
      commentData.author_name = options.author_name;
      commentData.author_email = options.author_email;
    }
    
    // 调用API
    return await api.post(`/api/posts/${postId}/comments`, commentData);
  } catch (error) {
    console.error('创建评论失败:', error);
    throw error;
  }
};

/**
 * 回复评论
 * @param {number|string} postId - 文章ID
 * @param {number|string} commentId - 被回复的评论ID
 * @param {string} content - 回复内容
 * @returns {Promise<Object>} - 返回创建的回复评论对象
 */
const replyComment = async (postId, commentId, content) => {
  try {
    // 复用createComment方法，设置parent参数
    return await createComment(postId, content, { parent: commentId });
  } catch (error) {
    console.error('回复评论失败:', error);
    throw error;
  }
};

/**
 * 删除评论
 * @param {number|string} commentId - 评论ID
 * @returns {Promise<boolean>} - 返回是否删除成功
 */
const deleteComment = async (commentId) => {
  try {
    // 调用API
    await api.delete(`/api/comments/${commentId}`);
    return true;
  } catch (error) {
    console.error('删除评论失败:', error);
    throw error;
  }
};

/**
 * 点赞评论
 * @param {number|string} commentId - 评论ID
 * @returns {Promise<Object>} - 返回点赞后的评论点赞信息
 */
const likeComment = async (commentId) => {
  try {
    return await api.post(`/api/comments/${commentId}/like`);
  } catch (error) {
    console.error('点赞评论失败:', error);
    throw error;
  }
};

/**
 * 取消点赞评论
 * @param {number|string} commentId - 评论ID
 * @returns {Promise<Object>} - 返回取消点赞后的评论点赞信息
 */
const unlikeComment = async (commentId) => {
  try {
    return await api.delete(`/api/comments/${commentId}/like`);
  } catch (error) {
    console.error('取消点赞评论失败:', error);
    throw error;
  }
};

/**
 * 举报评论
 * @param {number|string} commentId - 评论ID
 * @param {string} reason - 举报原因
 * @returns {Promise<Object>} - 返回举报结果
 */
const reportComment = async (commentId, reason) => {
  try {
    // 验证举报原因
    if (!reason || reason.trim() === '') {
      throw new Error('举报原因不能为空');
    }
    
    // 调用API
    return await api.post(`/api/comments/${commentId}/report`, {
      reason: reason.trim()
    });
  } catch (error) {
    console.error('举报评论失败:', error);
    throw error;
  }
};

/**
 * 获取评论回复
 * @param {number|string} commentId - 评论ID
 * @param {Object} params - 请求参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @returns {Promise<Object>} - 返回回复列表
 */
const getCommentReplies = async (commentId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    return await api.get(`/api/comments/${commentId}/replies`, queryParams);
  } catch (error) {
    console.error('获取评论回复失败:', error);
    throw error;
  }
};

/**
 * 获取用户的评论
 * @param {number|string} userId - 用户ID
 * @param {Object} params - 请求参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.per_page - 每页数量，默认为10
 * @returns {Promise<Object>} - 返回用户评论列表
 */
const getUserComments = async (userId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    return await api.get(`/api/users/${userId}/comments`, queryParams);
  } catch (error) {
    console.error('获取用户评论失败:', error);
    throw error;
  }
};

/**
 * 更新评论内容
 * @param {number|string} commentId - 评论ID
 * @param {string} content - 新的评论内容
 * @returns {Promise<Object>} - 返回更新后的评论对象
 */
const updateComment = async (commentId, content) => {
  try {
    // 验证评论内容
    if (!content || content.trim() === '') {
      throw new Error('评论内容不能为空');
    }
    
    // 调用API
    return await api.put(`/api/comments/${commentId}`, {
      content: content.trim()
    });
  } catch (error) {
    console.error('更新评论失败:', error);
    throw error;
  }
};

/**
 * 过滤评论内容
 * @param {string} content - 需要过滤的评论内容
 * @returns {string} - 过滤后的评论内容
 */
const filterCommentContent = (content) => {
  if (!content) return '';
  
  // 基础的HTML标签过滤
  let filteredContent = content
    // 移除潜在的脚本标签
    .replace(/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gi, '')
    // 移除其他危险标签
    .replace(/<\s*(iframe|object|embed|form)[^>]*>.*?<\s*\/\s*(?:iframe|object|embed|form)\s*>/gi, '')
    // 移除on事件处理属性
    .replace(/\s*on\w+\s*=\s*["\'][^"\']*["\']/gi, '')
    // 保留基本的文本格式标签
    .replace(/<\s*(?!(b|i|strong|em|br|p|span|div|h[1-6]))[^>]*>/gi, '');
    
  return filteredContent.trim();
};

// 导出模块
module.exports = {
  getComments,
  createComment,
  replyComment,
  deleteComment,
  likeComment,
  unlikeComment,
  reportComment,
  getCommentReplies,
  getUserComments,
  updateComment,
  filterCommentContent
};
