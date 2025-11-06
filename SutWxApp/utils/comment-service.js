// comment-service.js - 评论相关服务模块
// 处理文章评论、回复等功能

import api from './api';
import { getStorage } from './global';

/**
 * 获取文章评论列表
 * @param {number|string} postId - 文章ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @param {string} params.order - 排序方向，默认'desc'
 * @returns {Promise<Object>} - 包含评论列表和总数的对象
 */
export const getComments = async (postId, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10,
      order: params.order || 'desc'
    };
    
    // 调用API
    return await api.get(`/posts/${postId}/comments`, queryParams);
  } catch (error) {
    console.error('获取评论列表失败:', error);
    throw error;
  }
};

/**
 * 发表评论
 * @param {number|string} postId - 文章ID
 * @param {string} content - 评论内容
 * @param {Object} options - 其他选项
 * @param {number|string} options.parent - 父评论ID（用于回复），默认0表示顶级评论
 * @param {string} options.author_name - 评论者名称（未登录用户使用）
 * @param {string} options.author_email - 评论者邮箱（未登录用户使用）
 * @returns {Promise<Object>} - 返回创建的评论对象
 */
export const createComment = async (postId, content, options = {}) => {
  try {
    // 检查内容是否为空
    if (!content || content.trim() === '') {
      throw new Error('评论内容不能为空');
    }
    
    // 构建评论数据
    const commentData = {
      content: content.trim(),
      parent: options.parent || 0
    };
    
    // 如果用户未登录，需要提供名称和邮箱
    const userInfo = getStorage('userInfo');
    if (!userInfo || !userInfo.token) {
      if (!options.author_name || !options.author_email) {
        throw new Error('请提供评论者名称和邮箱');
      }
      commentData.author_name = options.author_name;
      commentData.author_email = options.author_email;
    }
    
    // 调用API
    return await api.post(`/posts/${postId}/comments`, commentData);
  } catch (error) {
    console.error('发表评论失败:', error);
    throw error;
  }
};

/**
 * 回复评论
 * @param {number|string} postId - 文章ID
 * @param {number|string} commentId - 要回复的评论ID
 * @param {string} content - 回复内容
 * @returns {Promise<Object>} - 返回创建的回复评论对象
 */
export const replyComment = async (postId, commentId, content) => {
  try {
    // 直接调用createComment，设置parent参数
    return await createComment(postId, content, { parent: commentId });
  } catch (error) {
    console.error('回复评论失败:', error);
    throw error;
  }
};

/**
 * 删除评论
 * @param {number|string} commentId - 评论ID
 * @returns {Promise<boolean>} - 是否删除成功
 */
export const deleteComment = async (commentId) => {
  try {
    // 调用API
    await api.delete(`/comments/${commentId}`);
    return true;
  } catch (error) {
    console.error('删除评论失败:', error);
    throw error;
  }
};

/**
 * 点赞评论
 * @param {number|string} commentId - 评论ID
 * @returns {Promise<Object>} - 返回点赞后的评论对象，包含点赞数
 */
export const likeComment = async (commentId) => {
  try {
    // 调用API
    return await api.post(`/comments/${commentId}/like`);
  } catch (error) {
    console.error('点赞评论失败:', error);
    throw error;
  }
};

/**
 * 取消点赞评论
 * @param {number|string} commentId - 评论ID
 * @returns {Promise<Object>} - 返回取消点赞后的评论对象，包含点赞数
 */
export const unlikeComment = async (commentId) => {
  try {
    // 调用API
    return await api.delete(`/comments/${commentId}/like`);
  } catch (error) {
    console.error('取消点赞评论失败:', error);
    throw error;
  }
};

/**
 * 举报评论
 * @param {number|string} commentId - 评论ID
 * @param {string} reason - 举报原因
 * @returns {Promise<boolean>} - 是否举报成功
 */
export const reportComment = async (commentId, reason) => {
  try {
    // 检查原因是否为空
    if (!reason || reason.trim() === '') {
      throw new Error('请提供举报原因');
    }
    
    // 调用API
    await api.post(`/comments/${commentId}/report`, {
      reason: reason.trim()
    });
    
    return true;
  } catch (error) {
    console.error('举报评论失败:', error);
    throw error;
  }
};

/**
 * 获取评论回复列表
 * @param {number|string} commentId - 父评论ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @returns {Promise<Object>} - 包含回复列表和总数的对象
 */
export const getCommentReplies = async (commentId, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 调用API
    return await api.get(`/comments/${commentId}/replies`, queryParams);
  } catch (error) {
    console.error('获取评论回复失败:', error);
    throw error;
  }
};

/**
 * 获取用户评论列表
 * @param {number|string} userId - 用户ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.per_page - 每页数量，默认10
 * @returns {Promise<Object>} - 包含评论列表和总数的对象
 */
export const getUserComments = async (userId, params = {}) => {
  try {
    // 构建查询参数
    const queryParams = {
      page: params.page || 1,
      per_page: params.per_page || 10
    };
    
    // 调用API
    return await api.get(`/users/${userId}/comments`, queryParams);
  } catch (error) {
    console.error('获取用户评论失败:', error);
    throw error;
  }
};

/**
 * 编辑评论
 * @param {number|string} commentId - 评论ID
 * @param {string} content - 新的评论内容
 * @returns {Promise<Object>} - 返回更新后的评论对象
 */
export const updateComment = async (commentId, content) => {
  try {
    // 检查内容是否为空
    if (!content || content.trim() === '') {
      throw new Error('评论内容不能为空');
    }
    
    // 调用API
    return await api.put(`/comments/${commentId}`, {
      content: content.trim()
    });
  } catch (error) {
    console.error('编辑评论失败:', error);
    throw error;
  }
};

/**
 * 评论内容过滤（客户端预过滤，减轻服务器压力）
 * @param {string} content - 待过滤的评论内容
 * @returns {Object} - 包含过滤后的内容和是否需要进一步检查的标志
 */
export const filterCommentContent = (content) => {
  // 基本的内容过滤逻辑
  // 1. 长度限制
  let filteredContent = content.trim();
  const MAX_LENGTH = 2000;
  
  if (filteredContent.length > MAX_LENGTH) {
    filteredContent = filteredContent.substring(0, MAX_LENGTH);
  }
  
  // 2. 检查是否包含明显的垃圾内容特征（简单示例）
  const spamPatterns = [
    /(http|https):\/\/[^\s]+/gi,  // URL检测
    /([\u4e00-\u9fa5])\1{4,}/g,   // 中文重复字符
    /([a-zA-Z])\1{4,}/g,           // 英文重复字符
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,}/g  // 特殊字符堆砌
  ];
  
  let needsReview = false;
  for (const pattern of spamPatterns) {
    if (pattern.test(filteredContent)) {
      needsReview = true;
      break;
    }
  }
  
  return {
    content: filteredContent,
    needsReview
  };
};

// 导出所有方法
export default {
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