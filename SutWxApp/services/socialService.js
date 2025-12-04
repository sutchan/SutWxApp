/**
 * 文件名: socialService.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-02
 * 描述: 社交功能服务，包含产品分享、评论、点赞、用户关注等
 */

const request = require('../utils/request');

/**
 * 分享产品
 * @param {Object} options - 分享参数
 * @param {string} options.productId - 产品ID
 * @param {string} options.title - 分享标题
 * @param {string} options.description - 分享描述
 * @param {string} options.imageUrl - 分享图片URL
 * @param {string} options.shareChannel - 分享渠道: wechat/friend/circle/qq/weibo/link/copy
 * @param {Object} options.extra - 额外参数
 * @returns {Promise<Object>} 分享结果
 */
async function shareProduct(options = {}) {
  const {
    productId,
    title,
    description,
    imageUrl,
    shareChannel = 'wechat',
    extra = {}
  } = options;

  if (!productId) {
    throw new Error('产品ID不能为空');
  }

  return request.post('/social/share/product', {
    productId,
    title,
    description,
    imageUrl,
    shareChannel,
    extra
  });
}

/**
 * 分享文章
 * @param {Object} options - 分享参数
 * @param {string} options.articleId - 文章ID
 * @param {string} options.title - 分享标题
 * @param {string} options.description - 分享描述
 * @param {string} options.imageUrl - 分享图片URL
 * @param {string} options.shareChannel - 分享渠道: wechat/friend/circle/qq/weibo/link/copy
 * @param {Object} options.extra - 额外参数
 * @returns {Promise<Object>} 分享结果
 */
async function shareArticle(options = {}) {
  const {
    articleId,
    title,
    description,
    imageUrl,
    shareChannel = 'wechat',
    extra = {}
  } = options;

  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  return request.post('/social/share/article', {
    articleId,
    title,
    description,
    imageUrl,
    shareChannel,
    extra
  });
}

/**
 * 分享活动
 * @param {Object} options - 分享参数
 * @param {string} options.activityId - 活动ID
 * @param {string} options.title - 分享标题
 * @param {string} options.description - 分享描述
 * @param {string} options.imageUrl - 分享图片URL
 * @param {string} options.shareChannel - 分享渠道: wechat/friend/circle/qq/weibo/link/copy
 * @param {Object} options.extra - 额外参数
 * @returns {Promise<Object>} 分享结果
 */
async function shareActivity(options = {}) {
  const {
    activityId,
    title,
    description,
    imageUrl,
    shareChannel = 'wechat',
    extra = {}
  } = options;

  if (!activityId) {
    throw new Error('活动ID不能为空');
  }

  return request.post('/social/share/activity', {
    activityId,
    title,
    description,
    imageUrl,
    shareChannel,
    extra
  });
}

/**
 * 获取分享记录
 * @param {Object} options - 查询参数
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @param {string} options.sort - 排序方式: newest/oldest
 * @param {string} options.targetType - 分享目标类型: product/article/activity/all
 * @param {string} options.shareChannel - 分享渠道，可选值：wechat/friend/circle/qq/weibo/link/copy
 * @returns {Promise<Object>} 分享记录列表和分页信息
 */
async function getShareRecords(options = {}) {
  const {
    page = 1,
    pageSize = 20,
    sort = 'newest',
    targetType = 'all',
    shareChannel
  } = options;

  const params = {
    page,
    pageSize,
    sort,
    targetType
  };

  if (shareChannel) params.shareChannel = shareChannel;

  return request.get('/social/share/records', params);
}

/**
 * 获取分享统计
 * @param {Object} options - 统计参数
 * @param {string} options.targetId - 目标ID，可选
 * @param {string} options.targetType - 目标类型: product/article/activity
 * @param {string} options.timeRange - 时间范围: today/week/month/year/all
 * @param {string} options.shareChannel - 分享渠道，可选
 * @returns {Promise<Object>} 分享统计信息
 */
async function getShareStats(options = {}) {
  const {
    targetId,
    targetType,
    timeRange = 'all',
    shareChannel
  } = options;

  let url;
  if (targetId && targetType) {
    url = `/social/share/stats/${targetType}/${targetId}`;
  } else {
    url = '/social/share/stats';
  }

  const params = {
    timeRange
  };

  if (shareChannel) params.shareChannel = shareChannel;
  if (!targetId && targetType) params.targetType = targetType;

  return request.get(url, params);
}

/**
 * 获取分享渠道列表
 * @returns {Promise<Array>} 分享渠道列表
 */
async function getShareChannels() {
  return request.get('/social/share/channels');
}

/**
 * 获取分享奖励记录
 * @param {Object} options - 查询参数
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @param {string} options.sort - 排序方式: newest/oldest
 * @returns {Promise<Object>} 奖励记录列表和分页信息
 */
async function getShareRewards(options = {}) {
  const {
    page = 1,
    pageSize = 20,
    sort = 'newest'
  } = options;

  return request.get('/social/share/rewards', {
    page,
    pageSize,
    sort
  });
}

/**
 * 获取分享奖励规则
 * @returns {Promise<Object>} 奖励规则
 */
async function getShareRewardRules() {
  return request.get('/social/share/reward-rules');
}

/**
 * 检查分享奖励状态
 * @param {string} shareId - 分享记录ID
 * @returns {Promise<Object>} 奖励状态
 */
async function checkShareRewardStatus(shareId) {
  if (!shareId) {
    throw new Error('分享记录ID不能为空');
  }

  return request.get(`/social/share/rewards/check/${shareId}`);
}

/**
 * 获取产品评论列表
 * @param {Object} options - 查询参数
 * @param {string} options.productId - 产品ID
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @param {string} options.sort - 排序方式: newest/oldest/highest/lowest
 * @param {number} options.minRating - 最低评分，1-5
 * @param {boolean} options.withImages - 是否只显示带图评论
 * @returns {Promise<Object>} 评论列表和分页信息
 */
async function getProductComments(options = {}) {
  const {
    productId,
    page = 1,
    pageSize = 20,
    sort = 'newest',
    minRating,
    withImages
  } = options;

  if (!productId) {
    throw new Error('产品ID不能为空');
  }

  const params = {
    page,
    pageSize,
    sort
  };

  if (minRating) params.minRating = minRating;
  if (withImages) params.withImages = withImages;

  return request.get(`/products/${productId}/comments`, params);
}

/**
 * 获取文章评论列表
 * @param {Object} options - 查询参数
 * @param {string} options.articleId - 文章ID
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @param {string} options.sort - 排序方式: newest/oldest
 * @param {boolean} options.withImages - 是否只显示带图评论
 * @param {boolean} options.withReplies - 是否只显示有回复的评论
 * @param {string} options.authorId - 按作者ID筛选
 * @returns {Promise<Object>} 评论列表和分页信息
 */
async function getArticleComments(options = {}) {
  const {
    articleId,
    page = 1,
    pageSize = 20,
    sort = 'newest',
    withImages,
    withReplies,
    authorId
  } = options;

  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  const params = {
    page,
    pageSize,
    sort
  };

  if (withImages !== undefined) params.withImages = withImages;
  if (withReplies !== undefined) params.withReplies = withReplies;
  if (authorId) params.authorId = authorId;

  return request.get(`/articles/${articleId}/comments`, params);
}

/**
 * 添加产品评论
 * @param {Object} data - 评论数据
 * @param {string} data.productId - 产品ID
 * @param {string} data.content - 评论内容
 * @param {number} data.rating - 评分，1-5
 * @param {Array} data.images - 评论图片URL数组
 * @param {boolean} data.anonymous - 是否匿名
 * @returns {Promise<Object>} 评论结果
 */
async function addProductComment(data) {
  const {
    productId,
    content,
    rating,
    images = [],
    anonymous = false
  } = data;

  if (!productId) {
    throw new Error('产品ID不能为空');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('评论内容不能为空');
  }

  if (rating < 1 || rating > 5) {
    throw new Error('评分必须在1-5之间');
  }

  return request.post('/social/comments/product', {
    productId,
    content: content.trim(),
    rating,
    images,
    anonymous
  });
}

/**
 * 添加文章评论
 * @param {Object} data - 评论数据
 * @param {string} data.articleId - 文章ID
 * @param {string} data.content - 评论内容
 * @param {boolean} data.anonymous - 是否匿名
 * @returns {Promise<Object>} 评论结果
 */
async function addArticleComment(data) {
  const {
    articleId,
    content,
    anonymous = false
  } = data;

  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('评论内容不能为空');
  }

  return request.post('/social/comments/article', {
    articleId,
    content: content.trim(),
    anonymous
  });
}

/**
 * 回复评论
 * @param {Object} data - 回复数据
 * @param {string} data.commentId - 评论ID
 * @param {string} data.content - 回复内容
 * @param {boolean} data.anonymous - 是否匿名
 * @returns {Promise<Object>} 回复结果
 */
async function replyComment(data) {
  const {
    commentId,
    content,
    anonymous = false
  } = data;

  if (!commentId) {
    throw new Error('评论ID不能为空');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('回复内容不能为空');
  }

  return request.post('/social/comments/reply', {
    commentId,
    content: content.trim(),
    anonymous
  });
}

/**
 * 删除评论
 * @param {string} commentId - 评论ID
 * @returns {Promise<Object>} 删除结果
 */
async function deleteComment(commentId) {
  if (!commentId) {
    throw new Error('评论ID不能为空');
  }

  return request.delete(`/social/comments/${commentId}`);
}

/**
 * 点赞评论
 * @param {string} commentId - 评论ID
 * @returns {Promise<Object>} 点赞结果
 */
async function likeComment(commentId) {
  if (!commentId) {
    throw new Error('评论ID不能为空');
  }

  return request.post('/social/like/comment', {
    commentId
  });
}

/**
 * 取消点赞评论
 * @param {string} commentId - 评论ID
 * @returns {Promise<Object>} 取消点赞结果
 */
async function unlikeComment(commentId) {
  if (!commentId) {
    throw new Error('评论ID不能为空');
  }

  return request.post('/social/unlike/comment', {
    commentId
  });
}

/**
 * 点赞产品
 * @param {string} productId - 产品ID
 * @returns {Promise<Object>} 点赞结果
 */
async function likeProduct(productId) {
  if (!productId) {
    throw new Error('产品ID不能为空');
  }

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
  if (!productId) {
    throw new Error('产品ID不能为空');
  }

  return request.post('/social/unlike/product', {
    productId
  });
}

/**
 * 点赞文章
 * @param {string} articleId - 文章ID
 * @returns {Promise<Object>} 点赞结果
 */
async function likeArticle(articleId) {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  return request.post('/social/like/article', {
    articleId
  });
}

/**
 * 取消点赞文章
 * @param {string} articleId - 文章ID
 * @returns {Promise<Object>} 取消点赞结果
 */
async function unlikeArticle(articleId) {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  return request.post('/social/unlike/article', {
    articleId
  });
}

/**
 * 检查是否已点赞
 * @param {Object} options - 检查参数
 * @param {string} options.targetId - 目标ID
 * @param {string} options.targetType - 目标类型: product/article/comment
 * @returns {Promise<Object>} 检查结果
 */
async function checkLikeStatus(options = {}) {
  const {
    targetId,
    targetType
  } = options;

  if (!targetId || !targetType) {
    throw new Error('目标ID和类型不能为空');
  }

  return request.get('/social/like/check', {
    targetId,
    targetType
  });
}

/**
 * 获取点赞记录
 * @param {Object} options - 查询参数
 * @param {string} options.targetType - 目标类型: product/article/comment/all
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @returns {Promise<Object>} 点赞记录列表和分页信息
 */
async function getLikeRecords(options = {}) {
  const {
    targetType = 'all',
    page = 1,
    pageSize = 20
  } = options;

  return request.get('/social/like/records', {
    targetType,
    page,
    pageSize
  });
}

/**
 * 获取产品点赞统计
 * @param {string} productId - 产品ID
 * @returns {Promise<Object>} 点赞统计信息
 */
async function getProductLikeStats(productId) {
  if (!productId) {
    throw new Error('产品ID不能为空');
  }

  return request.get(`/social/like/stats/product/${productId}`);
}

/**
 * 获取文章点赞统计
 * @param {string} articleId - 文章ID
 * @returns {Promise<Object>} 点赞统计信息
 */
async function getArticleLikeStats(articleId) {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  return request.get(`/social/like/stats/article/${articleId}`);
}

/**
 * 获取评论点赞统计
 * @param {string} commentId - 评论ID
 * @returns {Promise<Object>} 点赞统计信息
 */
async function getCommentLikeStats(commentId) {
  if (!commentId) {
    throw new Error('评论ID不能为空');
  }

  return request.get(`/social/like/stats/comment/${commentId}`);
}

/**
 * 举报评论
 * @param {Object} data - 举报数据
 * @param {string} data.commentId - 评论ID
 * @param {string} data.reason - 举报原因: spam/abuse/pornography/violence/other
 * @param {string} data.description - 举报描述
 * @returns {Promise<Object>} 举报结果
 */
async function reportComment(data) {
  const {
    commentId,
    reason,
    description
  } = data;

  if (!commentId || !reason) {
    throw new Error('评论ID和举报原因不能为空');
  }

  return request.post('/social/comments/report', {
    commentId,
    reason,
    description
  });
}

/**
 * 获取评论回复列表
 * @param {string} commentId - 评论ID
 * @param {number} page - 页码，默认1
 * @param {number} pageSize - 每页数量，默认20
 * @returns {Promise<Object>} 回复列表和分页信息
 */
async function getCommentReplies(commentId, page = 1, pageSize = 20) {
  if (!commentId) {
    throw new Error('评论ID不能为空');
  }

  return request.get(`/social/comments/${commentId}/replies`, {
    page,
    pageSize
  });
}

/**
 * 获取热门评论
 * @param {Object} options - 查询参数
 * @param {string} options.targetId - 目标ID
 * @param {string} options.targetType - 目标类型: product/article
 * @param {number} options.limit - 数量限制，默认10
 * @returns {Promise<Array>} 热门评论列表
 */
async function getHotComments(options = {}) {
  const {
    targetId,
    targetType,
    limit = 10
  } = options;

  if (!targetId || !targetType) {
    throw new Error('目标ID和类型不能为空');
  }

  return request.get('/social/comments/hot', {
    targetId,
    targetType,
    limit
  });
}

/**
 * 获取用户评论列表
 * @param {Object} options - 查询参数
 * @param {string} options.userId - 用户ID，不传则获取当前用户
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @param {string} options.sort - 排序方式: newest/oldest
 * @returns {Promise<Object>} 评论列表和分页信息
 */
async function getUserComments(options = {}) {
  const {
    userId,
    page = 1,
    pageSize = 20,
    sort = 'newest'
  } = options;

  const params = {
    page,
    pageSize,
    sort
  };

  const url = userId ? `/users/${userId}/comments` : '/user/comments';

  return request.get(url, params);
}

/**
 * 获取用户点赞列表
 * @param {Object} options - 查询参数
 * @param {string} options.userId - 用户ID，不传则获取当前用户
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @param {string} options.sort - 排序方式: newest/oldest
 * @returns {Promise<Object>} 点赞列表和分页信息
 */
async function getUserLikes(options = {}) {
  const {
    userId,
    page = 1,
    pageSize = 20,
    sort = 'newest'
  } = options;

  const params = {
    page,
    pageSize,
    sort
  };

  const url = userId ? `/users/${userId}/likes` : '/user/likes';

  return request.get(url, params);
}

/**
 * 获取关注列表
 * @param {Object} options - 查询参数
 * @param {string} options.userId - 用户ID，不传递则获取当前用户
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @param {string} options.sort - 排序方式，可选值：newest/oldest
 * @returns {Promise<Object>} 关注列表和分页信息
 */
async function getUserFollowing(options = {}) {
  const {
    userId,
    page = 1,
    pageSize = 20,
    sort = 'newest'
  } = options;

  const params = {
    page,
    pageSize,
    sort
  };

  const url = userId ? `/users/${userId}/following` : '/social/following';

  return request.get(url, params);
}

/**
 * 获取粉丝列表
 * @param {Object} options - 查询参数
 * @param {string} options.userId - 用户ID，不传递则获取当前用户
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @param {string} options.sort - 排序方式，可选值：newest/oldest
 * @returns {Promise<Object>} 粉丝列表和分页信息
 */
async function getUserFollowers(options = {}) {
  const {
    userId,
    page = 1,
    pageSize = 20,
    sort = 'newest'
  } = options;

  const params = {
    page,
    pageSize,
    sort
  };

  const url = userId ? `/users/${userId}/followers` : '/social/followers';

  return request.get(url, params);
}

/**
 * 关注用户
 * @param {string} userId - 要关注的用户ID
 * @returns {Promise<Object>} 关注结果
 */
async function followUser(userId) {
  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  return request.post('/social/follow', {
    userId
  });
}

/**
 * 取消关注
 * @param {string} userId - 要取消关注的用户ID
 * @returns {Promise<Object>} 取消关注结果
 */
async function unfollowUser(userId) {
  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  return request.delete(`/social/follow/${userId}`);
}

/**
 * 删除粉丝
 * @param {string} followerId - 粉丝ID
 * @returns {Promise<Object>} 操作结果
 */
async function removeFollower(followerId) {
  if (!followerId) {
    throw new Error('粉丝ID不能为空');
  }

  return request.delete(`/user/followers/${followerId}`);
}

/**
 * 搜索用户
 * @param {Object} options - 搜索参数
 * @param {string} options.keyword - 搜索关键词
 * @param {number} options.page - 页码，默认1
 * @param {number} options.pageSize - 每页数量，默认20
 * @returns {Promise<Object>} 搜索结果和分页信息
 */
async function searchUsers(options = {}) {
  const {
    keyword,
    page = 1,
    pageSize = 20
  } = options;

  if (!keyword) {
    throw new Error('搜索关键词不能为空');
  }

  return request.get('/social/users/search', {
    keyword,
    page,
    pageSize
  });
}

/**
 * 检查是否已关注
 * @param {string} userId - 要检查的用户ID
 * @returns {Promise<Object>} 检查结果
 */
async function checkFollowStatus(userId) {
  if (!userId) {
    throw new Error('用户ID不能为空');
  }

  return request.get(`/social/follow/check/${userId}`);
}

/**
 * 获取推荐关注用户
 * @param {number} limit - 推荐数量，默认为10
 * @returns {Promise<Array>} 推荐用户列表
 */
async function getRecommendedUsers(limit = 10) {
  return request.get('/users/recommended', { limit });
}

/**
 * 获取用户关注/粉丝统计
 * @param {string} userId - 用户ID，不传递则获取当前用户
 * @returns {Promise<Object>} 统计信息
 */
async function getUserFollowStats(userId) {
  const url = userId ? `/users/${userId}/follow-stats` : '/user/follow-stats';
  return request.get(url);
}

module.exports = {
  shareProduct,
  shareArticle,
  shareActivity,
  getShareRecords,
  getShareStats,
  getShareChannels,
  getShareRewards,
  getShareRewardRules,
  checkShareRewardStatus,
  getProductComments,
  getArticleComments,
  addProductComment,
  addArticleComment,
  replyComment,
  deleteComment,
  likeComment,
  unlikeComment,
  likeProduct,
  unlikeProduct,
  likeArticle,
  unlikeArticle,
  checkLikeStatus,
  getLikeRecords,
  getProductLikeStats,
  getArticleLikeStats,
  getCommentLikeStats,
  reportComment,
  getCommentReplies,
  getHotComments,
  getUserComments,
  getUserLikes,
  getUserFollowing,
  getUserFollowers,
  followUser,
  unfollowUser,
  removeFollower,
  searchUsers,
  checkFollowStatus,
  getRecommendedUsers,
  getUserFollowStats
};
