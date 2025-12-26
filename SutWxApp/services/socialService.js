/**
 * 文件名: socialService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 描述: 社交服务，处理分享、评论、点赞、关注等社交功能
 */

const request = require('../utils/request');

/**
 * 分享产品
 * @param {Object} params - 分享参数
 * @param {string} params.productId - 产品ID
 * @param {string} params.title - 分享标题
 * @param {string} params.description - 分享描述
 * @param {string} params.imageUrl - 分享图片URL
 * @param {string} params.shareChannel - 分享渠道
 * @param {Object} [params.extra] - 额外参数
 * @returns {Promise<Object>} 分享结果
 */
async function shareProduct(params) {
  if (!params.productId) {
    throw new Error('产品ID不能为空');
  }
  
  return request.post('/social/share/product', {
    ...params,
    extra: params.extra || {}
  });
}

/**
 * 分享文章
 * @param {Object} params - 分享参数
 * @param {string} params.articleId - 文章ID
 * @param {string} params.title - 分享标题
 * @param {string} params.description - 分享描述
 * @param {string} params.imageUrl - 分享图片URL
 * @param {string} params.shareChannel - 分享渠道
 * @param {Object} [params.extra] - 额外参数
 * @returns {Promise<Object>} 分享结果
 */
async function shareArticle(params) {
  if (!params.articleId) {
    throw new Error('文章ID不能为空');
  }
  
  return request.post('/social/share/article', {
    ...params,
    extra: params.extra || {}
  });
}

/**
 * 分享活动
 * @param {Object} params - 分享参数
 * @param {string} params.activityId - 活动ID
 * @param {string} params.title - 分享标题
 * @param {string} params.description - 分享描述
 * @param {string} params.imageUrl - 分享图片URL
 * @param {string} params.shareChannel - 分享渠道
 * @param {Object} [params.extra] - 额外参数
 * @returns {Promise<Object>} 分享结果
 */
async function shareActivity(params) {
  if (!params.activityId) {
    throw new Error('活动ID不能为空');
  }
  
  return request.post('/social/share/activity', {
    ...params,
    extra: params.extra || {}
  });
}

/**
 * 获取分享记录
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.sort='newest'] - 排序方式
 * @param {string} [params.targetType] - 目标类型
 * @param {string} [params.shareChannel] - 分享渠道
 * @returns {Promise<Object>} 分享记录列表
 */
async function getShareRecords(params = {}) {
  return request.get('/social/share/records', {
    page: 1,
    pageSize: 20,
    sort: 'newest',
    ...params
  });
}

/**
 * 获取分享统计
 * @param {Object} params - 查询参数
 * @param {string} params.targetId - 目标ID
 * @param {string} params.targetType - 目标类型
 * @param {string} [params.timeRange='month'] - 时间范围
 * @param {string} [params.shareChannel] - 分享渠道
 * @returns {Promise<Object>} 分享统计数据
 */
async function getShareStats(params) {
  return request.get(`/social/share/stats/${params.targetType}/${params.targetId}`, {
    timeRange: 'month',
    ...params
  });
}

/**
 * 获取分享渠道列表
 * @returns {Promise<Object>} 分享渠道列表
 */
async function getShareChannels() {
  return request.get('/social/share/channels', {});
}

/**
 * 获取分享奖励记录
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.sort='newest'] - 排序方式
 * @returns {Promise<Object>} 分享奖励记录
 */
async function getShareRewards(params = {}) {
  return request.get('/social/share/rewards', {
    page: 1,
    pageSize: 20,
    sort: 'newest',
    ...params
  });
}

/**
 * 获取分享奖励规则
 * @returns {Promise<Object>} 分享奖励规则
 */
async function getShareRewardRules() {
  return request.get('/social/share/reward-rules', {});
}

/**
 * 检查分享奖励状态
 * @param {string} shareId - 分享记录ID
 * @returns {Promise<Object>} 分享奖励状态
 */
async function checkShareRewardStatus(shareId) {
  if (!shareId) {
    throw new Error('分享记录ID不能为空');
  }
  
  return request.get(`/social/share/rewards/check/${shareId}`, {});
}

/**
 * 添加产品评论
 * @param {Object} params - 评论参数
 * @param {string} params.productId - 产品ID
 * @param {string} params.content - 评论内容
 * @param {number} params.rating - 评分（1-5）
 * @param {Array} [params.images] - 评论图片
 * @param {boolean} [params.anonymous=false] - 是否匿名
 * @returns {Promise<Object>} 评论结果
 */
async function addProductComment(params) {
  if (!params.content) {
    throw new Error('评论内容不能为空');
  }
  
  if (params.rating < 1 || params.rating > 5) {
    throw new Error('评分必须在1-5之间');
  }
  
  return request.post('/social/comments/product', {
    anonymous: false,
    images: [],
    ...params
  });
}

/**
 * 点赞产品
 * @param {string} productId - 产品ID
 * @returns {Promise<Object>} 点赞结果
 */
async function likeProduct(productId) {
  return request.post('/social/like/product', {
    productId
  });
}

/**
 * 取消点赞产品
 * @param {string} productId - 产品ID
 * @returns {Promise<Object>} 取消点赞结果
 */
async function unlikeProduct(productId) {
  return request.post('/social/unlike/product', {
    productId
  });
}

/**
 * 关注用户
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 关注结果
 */
async function followUser(userId) {
  return request.post('/social/follow', {
    userId
  });
}

/**
 * 取消关注用户
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} 取消关注结果
 */
async function unfollowUser(userId) {
  return request.delete(`/social/follow/${userId}`);
}

/**
 * 获取关注列表
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.sort='newest'] - 排序方式
 * @param {string} [params.userId] - 目标用户ID（不传则查询当前用户）
 * @returns {Promise<Object>} 关注列表
 */
async function getUserFollowing(params = {}) {
  if (params.userId) {
    return request.get(`/users/${params.userId}/following`, {
      page: 1,
      pageSize: 20,
      sort: 'newest',
      ...params
    });
  }
  
  return request.get('/social/following', {
    page: 1,
    pageSize: 20,
    sort: 'newest',
    ...params
  });
}

/**
 * 获取粉丝列表
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.sort='newest'] - 排序方式
 * @param {string} [params.userId] - 目标用户ID（不传则查询当前用户）
 * @returns {Promise<Object>} 粉丝列表
 */
async function getUserFollowers(params = {}) {
  if (params.userId) {
    return request.get(`/users/${params.userId}/followers`, {
      page: 1,
      pageSize: 20,
      sort: 'newest',
      ...params
    });
  }
  
  return request.get('/social/followers', {
    page: 1,
    pageSize: 20,
    sort: 'newest',
    ...params
  });
}

/**
 * 删除粉丝
 * @param {string} userId - 粉丝用户ID
 * @returns {Promise<Object>} 删除结果
 */
async function removeFollower(userId) {
  return request.delete(`/user/followers/${userId}`);
}

/**
 * 获取推荐关注用户
 * @param {number} [limit=10] - 数量限制
 * @returns {Promise<Object>} 推荐关注用户列表
 */
async function getRecommendedUsers(limit = 10) {
  return request.get('/users/recommended', { limit });
}

/**
 * 获取用户关注统计
 * @param {string} [userId] - 目标用户ID（不传则查询当前用户）
 * @returns {Promise<Object>} 关注统计数据
 */
async function getUserFollowStats(userId) {
  if (userId) {
    return request.get(`/users/${userId}/follow-stats`, {});
  }
  
  return request.get('/user/follow-stats', {});
}

/**
 * 搜索用户
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @returns {Promise<Object>} 搜索结果
 */
async function searchUsers(params) {
  if (!params.keyword) {
    throw new Error('搜索关键词不能为空');
  }
  
  return request.get('/social/users/search', {
    page: 1,
    pageSize: 20,
    ...params
  });
}

module.exports = {
  // 分享功能
  shareProduct,
  shareArticle,
  shareActivity,
  getShareRecords,
  getShareStats,
  getShareChannels,
  getShareRewards,
  getShareRewardRules,
  checkShareRewardStatus,
  
  // 评论功能
  addProductComment,
  
  // 点赞功能
  likeProduct,
  unlikeProduct,
  
  // 关注功能
  followUser,
  unfollowUser,
  getUserFollowing,
  getUserFollowers,
  removeFollower,
  getRecommendedUsers,
  getUserFollowStats,
  
  // 搜索功能
  searchUsers
};
