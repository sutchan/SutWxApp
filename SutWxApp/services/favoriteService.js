﻿﻿﻿﻿/**
 * 文件名 favoriteService.js
 * 版本号 1.0.1
 * 更新日期: 2025-12-04
 * 描述: 收藏与关注服务
 */

const request = require('../utils/request');

/**
 * 获取用户收藏列表
 * @param {Object} options - 查询参数
 * @param {string} options.userId - 用户ID，不传递则获取当前用户
 * @param {number} options.page - 页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为20
 * @param {string} options.type - 收藏类型，可选值：product/article/all
 * @param {string} options.sort - 排序方式，可选值：newest/oldest
 * @returns {Promise<Object>} 收藏列表和分页信息
 */
async function getUserFavorites(options = {}) {
  const {
    userId,
    page = 1,
    pageSize = 20,
    type = 'all',
    sort = 'newest'
  } = options;

  const params = {
    page,
    pageSize,
    type,
    sort
  };

  const url = userId ? `/users/${userId}/favorites` : '/user/favorites';

  return request.get(url, params);
}

/**
 * 添加商品收藏
 * @param {string} productId - 商品ID
 * @returns {Promise<Object>} 操作结果
 */
async function addProductFavorite(productId) {
  if (!productId) {
    throw new Error('商品ID不能为空');
  }

  return request.post('/user/favorites/product', { productId });
}

/**
 * 取消商品收藏
 * @param {string} productId - 商品ID
 * @returns {Promise<Object>} 操作结果
 */
async function removeProductFavorite(productId) {
  if (!productId) {
    throw new Error('商品ID不能为空');
  }

  return request.delete(`/user/favorites/product/${productId}`);
}

/**
 * 检查商品是否已收藏
 * @param {string} productId - 商品ID
 * @returns {Promise<Object>} 检查结果
 */
async function checkProductFavorite(productId) {
  if (!productId) {
    throw new Error('商品ID不能为空');
  }

  return request.get(`/user/favorites/product/${productId}/check`);
}

/**
 * 添加文章收藏
 * @param {string} articleId - 文章ID
 * @returns {Promise<Object>} 操作结果
 */
async function addArticleFavorite(articleId) {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  return request.post('/user/favorites/article', { articleId });
}

/**
 * 取消文章收藏
 * @param {string} articleId - 文章ID
 * @returns {Promise<Object>} 操作结果
 */
async function removeArticleFavorite(articleId) {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  return request.delete(`/user/favorites/article/${articleId}`);
}

/**
 * 检查文章是否已收藏
 * @param {string} articleId - 文章ID
 * @returns {Promise<Object>} 检查结果
 */
async function checkArticleFavorite(articleId) {
  if (!articleId) {
    throw new Error('文章ID不能为空');
  }

  return request.get(`/user/favorites/article/${articleId}/check`);
}

/**
 * 批量取消收藏
 * @param {Array} favoriteIds - 收藏ID数组
 * @returns {Promise<Object>} 操作结果
 */
async function batchRemoveFavorites(favoriteIds) {
  if (!favoriteIds || favoriteIds.length === 0) {
    throw new Error('收藏ID列表不能为空');
  }

  return request.delete('/user/favorites/batch', { favoriteIds });
}

/**
 * 获取用户关注列表
 * @param {Object} options - 查询参数
 * @param {string} options.userId - 用户ID，不传递则获取当前用户
 * @param {number} options.page - 页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为20
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

  const url = userId ? `/users/${userId}/following` : '/user/following';

  return request.get(url, params);
}

/**
 * 获取用户粉丝列表
 * @param {Object} options - 查询参数
 * @param {string} options.userId - 用户ID，不传递则获取当前用户
 * @param {number} options.page - 页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为20
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

  const url = userId ? `/users/${userId}/followers` : '/user/followers';

  return request.get(url, params);
}

/**
 * 关注用户
 * @param {string} targetUserId - 目标用户ID
 * @returns {Promise<Object>} 操作结果
 */
async function followUser(targetUserId) {
  if (!targetUserId) {
    throw new Error('目标用户ID不能为空');
  }

  return request.post('/user/following', { targetUserId });
}

/**
 * 取消关注用户
 * @param {string} targetUserId - 目标用户ID
 * @returns {Promise<Object>} 操作结果
 */
async function unfollowUser(targetUserId) {
  if (!targetUserId) {
    throw new Error('目标用户ID不能为空');
  }

  return request.delete(`/user/following/${targetUserId}`);
}

/**
 * 检查是否已关注用户
 * @param {string} targetUserId - 目标用户ID
 * @returns {Promise<Object>} 检查结果
 */
async function checkUserFollowing(targetUserId) {
  if (!targetUserId) {
    throw new Error('目标用户ID不能为空');
  }

  return request.get(`/user/following/${targetUserId}/check`);
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

/**
 * 获取收藏文件夹列表
 * @param {number} page - 页码，默认为1
 * @param {number} pageSize - 每页数量，默认为20
 * @returns {Promise<Object>} 收藏文件夹列表和分页信息
 */
async function getFavoriteFolders(page = 1, pageSize = 20) {
  return request.get('/user/favorite-folders', { page, pageSize });
}

/**
 * 创建收藏文件夹
 * @param {Object} data - 收藏文件夹数据
 * @param {string} data.name - 收藏文件夹名称
 * @param {string} data.description - 收藏文件夹描述
 * @param {boolean} data.isPublic - 是否公开
 * @returns {Promise<Object>} 创建结果
 */
async function createFavoriteFolder(data) {
  const { name, description, isPublic = false } = data;

  if (!name || name.trim().length === 0) {
    throw new Error('收藏文件夹名称不能为空');
  }

  if (name.length > 20) {
    throw new Error('收藏文件夹名称不能超过20个字符');
  }

  if (description && description.length > 100) {
    throw new Error('收藏文件夹描述不能超过100个字符');
  }

  return request.post('/user/favorite-folders', {
    name: name.trim(),
    description: description ? description.trim() : '',
    isPublic
  });
}

/**
 * 更新收藏文件夹
 * @param {string} folderId - 收藏文件夹ID
 * @param {Object} data - 更新数据
 * @param {string} data.name - 收藏文件夹名称
 * @param {string} data.description - 收藏文件夹描述
 * @param {boolean} data.isPublic - 是否公开
 * @returns {Promise<Object>} 更新结果
 */
async function updateFavoriteFolder(folderId, data) {
  const { name, description, isPublic } = data;

  if (!folderId) {
    throw new Error('收藏文件夹ID不能为空');
  }

  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      throw new Error('收藏文件夹名称不能为空');
    }

    if (name.length > 20) {
      throw new Error('收藏文件夹名称不能超过20个字符');
    }
  }

  if (description !== undefined && description && description.length > 100) {
    throw new Error('收藏文件夹描述不能超过100个字符');
  }

  const updateData = {};

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description ? description.trim() : '';
  if (isPublic !== undefined) updateData.isPublic = isPublic;

  return request.put(`/user/favorite-folders/${folderId}`, updateData);
}

/**
 * 删除收藏文件夹
 * @param {string} folderId - 收藏文件夹ID
 * @returns {Promise<Object>} 删除结果
 */
async function deleteFavoriteFolder(folderId) {
  if (!folderId) {
    throw new Error('收藏文件夹ID不能为空');
  }

  return request.delete(`/user/favorite-folders/${folderId}`);
}

/**
 * 获取收藏文件夹内容
 * @param {string} folderId - 收藏文件夹ID
 * @param {number} page - 页码，默认为1
 * @param {number} pageSize - 每页数量，默认为20
 * @returns {Promise<Object>} 收藏文件夹内容和分页信息
 */
async function getFavoriteFolderContent(folderId, page = 1, pageSize = 20) {
  if (!folderId) {
    throw new Error('收藏文件夹ID不能为空');
  }

  return request.get(`/user/favorite-folders/${folderId}/content`, { page, pageSize });
}

/**
 * 将收藏添加到收藏文件夹
 * @param {string} folderId - 收藏文件夹ID
 * @param {string} favoriteId - 收藏ID
 * @returns {Promise<Object>} 操作结果
 */
async function addToFavoriteFolder(folderId, favoriteId) {
  if (!folderId) {
    throw new Error('收藏文件夹ID不能为空');
  }

  if (!favoriteId) {
    throw new Error('收藏ID不能为空');
  }

  return request.post(`/user/favorite-folders/${folderId}/add`, { favoriteId });
}

/**
 * 从收藏文件夹移除收藏
 * @param {string} folderId - 收藏文件夹ID
 * @param {string} favoriteId - 收藏ID
 * @returns {Promise<Object>} 操作结果
 */
async function removeFromFavoriteFolder(folderId, favoriteId) {
  if (!folderId) {
    throw new Error('收藏文件夹ID不能为空');
  }

  if (!favoriteId) {
    throw new Error('收藏ID不能为空');
  }

  return request.delete(`/user/favorite-folders/${folderId}/favorites/${favoriteId}`);
}

module.exports = {
  getUserFavorites,
  addProductFavorite,
  removeProductFavorite,
  checkProductFavorite,
  addArticleFavorite,
  removeArticleFavorite,
  checkArticleFavorite,
  batchRemoveFavorites,
  getUserFollowing,
  getUserFollowers,
  followUser,
  unfollowUser,
  checkUserFollowing,
  removeFollower,
  getRecommendedUsers,
  getUserFollowStats,
  getFavoriteFolders,
  createFavoriteFolder,
  updateFavoriteFolder,
  deleteFavoriteFolder,
  getFavoriteFolderContent,
  addToFavoriteFolder,
  removeFromFavoriteFolder
};