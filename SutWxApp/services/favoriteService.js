﻿/**
 * 鏂囦欢鍚? favoriteService.js
 * 鐗堟湰鍙? 1.0.1
 * 鏇存柊鏃ユ湡: 2025-11-28
 * 鎻忚堪: 鏀惰棌涓庡叧娉ㄦ湇鍔? */

const request = require('../utils/request');

/**
 * 鑾峰彇鐢ㄦ埛鏀惰棌鍒楄〃
 * @param {Object} options - 鏌ヨ鍙傛暟
 * @param {string} options.userId - 鐢ㄦ埛ID锛屼笉浼犲垯鑾峰彇褰撳墠鐢ㄦ埛
 * @param {number} options.page - 椤电爜锛岄粯璁や负1
 * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
 * @param {string} options.type - 鏀惰棌绫诲瀷锛歱roduct/article/all
 * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歯ewest/oldest
 * @returns {Promise<Object>} 鏀惰棌鍒楄〃鍜屽垎椤典俊鎭? */
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
 * 娣诲姞鍟嗗搧鏀惰棌
 * @param {string} productId - 鍟嗗搧ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function addProductFavorite(productId) {
  if (!productId) {
    throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
  }

  return request.post('/user/favorites/product', { productId });
}

/**
 * 鍙栨秷鍟嗗搧鏀惰棌
 * @param {string} productId - 鍟嗗搧ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function removeProductFavorite(productId) {
  if (!productId) {
    throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
  }

  return request.delete(`/user/favorites/product/${productId}`);
}

/**
 * 妫€鏌ュ晢鍝佹槸鍚﹀凡鏀惰棌
 * @param {string} productId - 鍟嗗搧ID
 * @returns {Promise<Object>} 妫€鏌ョ粨鏋? */
async function checkProductFavorite(productId) {
  if (!productId) {
    throw new Error('鍟嗗搧ID涓嶈兘涓虹┖');
  }

  return request.get(`/user/favorites/product/${productId}/check`);
}

/**
 * 娣诲姞鏂囩珷鏀惰棌
 * @param {string} articleId - 鏂囩珷ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function addArticleFavorite(articleId) {
  if (!articleId) {
    throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
  }

  return request.post('/user/favorites/article', { articleId });
}

/**
 * 鍙栨秷鏂囩珷鏀惰棌
 * @param {string} articleId - 鏂囩珷ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function removeArticleFavorite(articleId) {
  if (!articleId) {
    throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
  }

  return request.delete(`/user/favorites/article/${articleId}`);
}

/**
 * 妫€鏌ユ枃绔犳槸鍚﹀凡鏀惰棌
 * @param {string} articleId - 鏂囩珷ID
 * @returns {Promise<Object>} 妫€鏌ョ粨鏋? */
async function checkArticleFavorite(articleId) {
  if (!articleId) {
    throw new Error('鏂囩珷ID涓嶈兘涓虹┖');
  }

  return request.get(`/user/favorites/article/${articleId}/check`);
}

/**
 * 鎵归噺鍙栨秷鏀惰棌
 * @param {Array} favoriteIds - 鏀惰棌ID鏁扮粍
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function batchRemoveFavorites(favoriteIds) {
  if (!favoriteIds || favoriteIds.length === 0) {
    throw new Error('鏀惰棌ID鍒楄〃涓嶈兘涓虹┖');
  }

  return request.delete('/user/favorites/batch', { favoriteIds });
}

/**
 * 鑾峰彇鐢ㄦ埛鍏虫敞鍒楄〃
 * @param {Object} options - 鏌ヨ鍙傛暟
 * @param {string} options.userId - 鐢ㄦ埛ID锛屼笉浼犲垯鑾峰彇褰撳墠鐢ㄦ埛
 * @param {number} options.page - 椤电爜锛岄粯璁や负1
 * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
 * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歯ewest/oldest
 * @returns {Promise<Object>} 鍏虫敞鍒楄〃鍜屽垎椤典俊鎭? */
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
 * 鑾峰彇鐢ㄦ埛绮変笣鍒楄〃
 * @param {Object} options - 鏌ヨ鍙傛暟
 * @param {string} options.userId - 鐢ㄦ埛ID锛屼笉浼犲垯鑾峰彇褰撳墠鐢ㄦ埛
 * @param {number} options.page - 椤电爜锛岄粯璁や负1
 * @param {number} options.pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
 * @param {string} options.sort - 鎺掑簭鏂瑰紡锛歯ewest/oldest
 * @returns {Promise<Object>} 绮変笣鍒楄〃鍜屽垎椤典俊鎭? */
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
 * 鍏虫敞鐢ㄦ埛
 * @param {string} targetUserId - 鐩爣鐢ㄦ埛ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function followUser(targetUserId) {
  if (!targetUserId) {
    throw new Error('鐩爣鐢ㄦ埛ID涓嶈兘涓虹┖');
  }

  return request.post('/user/following', { targetUserId });
}

/**
 * 鍙栨秷鍏虫敞鐢ㄦ埛
 * @param {string} targetUserId - 鐩爣鐢ㄦ埛ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function unfollowUser(targetUserId) {
  if (!targetUserId) {
    throw new Error('鐩爣鐢ㄦ埛ID涓嶈兘涓虹┖');
  }

  return request.delete(`/user/following/${targetUserId}`);
}

/**
 * 妫€鏌ユ槸鍚﹀凡鍏虫敞鐢ㄦ埛
 * @param {string} targetUserId - 鐩爣鐢ㄦ埛ID
 * @returns {Promise<Object>} 妫€鏌ョ粨鏋? */
async function checkUserFollowing(targetUserId) {
  if (!targetUserId) {
    throw new Error('鐩爣鐢ㄦ埛ID涓嶈兘涓虹┖');
  }

  return request.get(`/user/following/${targetUserId}/check`);
}

/**
 * 鍒犻櫎绮変笣
 * @param {string} followerId - 绮変笣ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function removeFollower(followerId) {
  if (!followerId) {
    throw new Error('绮変笣ID涓嶈兘涓虹┖');
  }

  return request.delete(`/user/followers/${followerId}`);
}

/**
 * 鑾峰彇鎺ㄨ崘鍏虫敞鐢ㄦ埛
 * @param {number} limit - 鎺ㄨ崘鏁伴噺锛岄粯璁や负10
 * @returns {Promise<Array>} 鎺ㄨ崘鐢ㄦ埛鍒楄〃
 */
async function getRecommendedUsers(limit = 10) {
  return request.get('/users/recommended', { limit });
}

/**
 * 鑾峰彇鐢ㄦ埛鍏虫敞/绮変笣缁熻
 * @param {string} userId - 鐢ㄦ埛ID锛屼笉浼犲垯鑾峰彇褰撳墠鐢ㄦ埛
 * @returns {Promise<Object>} 缁熻淇℃伅
 */
async function getUserFollowStats(userId) {
  const url = userId ? `/users/${userId}/follow-stats` : '/user/follow-stats';
  return request.get(url);
}

/**
 * 鑾峰彇鏀惰棌鏂囦欢澶瑰垪琛? * @param {number} page - 椤电爜锛岄粯璁や负1
 * @param {number} pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
 * @returns {Promise<Object>} 鏀惰棌鏂囦欢澶瑰垪琛ㄥ拰鍒嗛〉淇℃伅
 */
async function getFavoriteFolders(page = 1, pageSize = 20) {
  return request.get('/user/favorite-folders', { page, pageSize });
}

/**
 * 鍒涘缓鏀惰棌鏂囦欢澶? * @param {Object} data - 鏀惰棌鏂囦欢澶规暟鎹? * @param {string} data.name - 鏀惰棌鏂囦欢澶瑰悕绉? * @param {string} data.description - 鏀惰棌鏂囦欢澶规弿杩? * @param {boolean} data.isPublic - 鏄惁鍏紑
 * @returns {Promise<Object>} 鍒涘缓缁撴灉
 */
async function createFavoriteFolder(data) {
  const { name, description, isPublic = false } = data;

  if (!name || name.trim().length === 0) {
    throw new Error('鏀惰棌鏂囦欢澶瑰悕绉颁笉鑳戒负绌?);
  }

  if (name.length > 20) {
    throw new Error('鏀惰棌鏂囦欢澶瑰悕绉颁笉鑳借秴杩?0涓瓧绗?);
  }

  if (description && description.length > 100) {
    throw new Error('鏀惰棌鏂囦欢澶规弿杩颁笉鑳借秴杩?00涓瓧绗?);
  }

  return request.post('/user/favorite-folders', {
    name: name.trim(),
    description: description ? description.trim() : '',
    isPublic
  });
}

/**
 * 鏇存柊鏀惰棌鏂囦欢澶? * @param {string} folderId - 鏀惰棌鏂囦欢澶笽D
 * @param {Object} data - 鏇存柊鏁版嵁
 * @param {string} data.name - 鏀惰棌鏂囦欢澶瑰悕绉? * @param {string} data.description - 鏀惰棌鏂囦欢澶规弿杩? * @param {boolean} data.isPublic - 鏄惁鍏紑
 * @returns {Promise<Object>} 鏇存柊缁撴灉
 */
async function updateFavoriteFolder(folderId, data) {
  const { name, description, isPublic } = data;

  if (!folderId) {
    throw new Error('鏀惰棌鏂囦欢澶笽D涓嶈兘涓虹┖');
  }

  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      throw new Error('鏀惰棌鏂囦欢澶瑰悕绉颁笉鑳戒负绌?);
    }

    if (name.length > 20) {
      throw new Error('鏀惰棌鏂囦欢澶瑰悕绉颁笉鑳借秴杩?0涓瓧绗?);
    }
  }

  if (description !== undefined && description && description.length > 100) {
    throw new Error('鏀惰棌鏂囦欢澶规弿杩颁笉鑳借秴杩?00涓瓧绗?);
  }

  const updateData = {};

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description ? description.trim() : '';
  if (isPublic !== undefined) updateData.isPublic = isPublic;

  return request.put(`/user/favorite-folders/${folderId}`, updateData);
}

/**
 * 鍒犻櫎鏀惰棌鏂囦欢澶? * @param {string} folderId - 鏀惰棌鏂囦欢澶笽D
 * @returns {Promise<Object>} 鍒犻櫎缁撴灉
 */
async function deleteFavoriteFolder(folderId) {
  if (!folderId) {
    throw new Error('鏀惰棌鏂囦欢澶笽D涓嶈兘涓虹┖');
  }

  return request.delete(`/user/favorite-folders/${folderId}`);
}

/**
 * 鑾峰彇鏀惰棌鏂囦欢澶瑰唴瀹? * @param {string} folderId - 鏀惰棌鏂囦欢澶笽D
 * @param {number} page - 椤电爜锛岄粯璁や负1
 * @param {number} pageSize - 姣忛〉鏁伴噺锛岄粯璁や负20
 * @returns {Promise<Object>} 鏀惰棌鏂囦欢澶瑰唴瀹瑰拰鍒嗛〉淇℃伅
 */
async function getFavoriteFolderContent(folderId, page = 1, pageSize = 20) {
  if (!folderId) {
    throw new Error('鏀惰棌鏂囦欢澶笽D涓嶈兘涓虹┖');
  }

  return request.get(`/user/favorite-folders/${folderId}/content`, { page, pageSize });
}

/**
 * 灏嗘敹钘忔坊鍔犲埌鏀惰棌鏂囦欢澶? * @param {string} folderId - 鏀惰棌鏂囦欢澶笽D
 * @param {string} favoriteId - 鏀惰棌ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function addToFavoriteFolder(folderId, favoriteId) {
  if (!folderId) {
    throw new Error('鏀惰棌鏂囦欢澶笽D涓嶈兘涓虹┖');
  }

  if (!favoriteId) {
    throw new Error('鏀惰棌ID涓嶈兘涓虹┖');
  }

  return request.post(`/user/favorite-folders/${folderId}/add`, { favoriteId });
}

/**
 * 浠庢敹钘忔枃浠跺す绉婚櫎鏀惰棌
 * @param {string} folderId - 鏀惰棌鏂囦欢澶笽D
 * @param {string} favoriteId - 鏀惰棌ID
 * @returns {Promise<Object>} 鎿嶄綔缁撴灉
 */
async function removeFromFavoriteFolder(folderId, favoriteId) {
  if (!folderId) {
    throw new Error('鏀惰棌鏂囦欢澶笽D涓嶈兘涓虹┖');
  }

  if (!favoriteId) {
    throw new Error('鏀惰棌ID涓嶈兘涓虹┖');
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