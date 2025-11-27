/**
 * 文件名: ratingService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 描述: 评价服务
 */

const request = require('../utils/request');

/**
 * 获取商品评价列表
 * @param {Object} options - 查询参数
 * @param {string} options.productId - 商品ID
 * @param {number} [options.page] - 页码，默认为1 (可选)
 * @param {number} [options.pageSize] - 每页数量，默认为20 (可选)
 * @param {string} [options.sort] - 排序方式：default/newest/highest/lowest (可选)
 * @param {number} [options.rating] - 评分筛选：1-5星 (可选)
 * @param {boolean} [options.hasImage] - 是否有图片 (可选)
 * @returns {Promise<Object>} 评价列表和分页信息
 */
async function getProductRatings(options = {}) {
  const {
    productId,
    page = 1,
    pageSize = 20,
    sort = 'default',
    rating,
    hasImage
  } = options;

  if (!productId) {
    throw new Error('商品ID不能为空');
  }

  const params = {
    page,
    pageSize,
    sort
  };

  if (rating) {
    params.rating = rating;
  }

  if (hasImage !== undefined) {
    params.hasImage = hasImage;
  }

  return request.get(`/products/${productId}/ratings`, { params });
}

/**
 * 获取商品评价统计
 * @param {string} productId - 商品ID
 * @returns {Promise<Object>} 评价统计信息
 */
async function getProductRatingStats(productId) {
  if (!productId) {
    throw new Error('商品ID不能为空');
  }

  return request.get(`/products/${productId}/ratings/stats`);
}

/**
 * 获取评价详情
 * @param {string} ratingId - 评价ID
 * @returns {Promise<Object>} 评价详情
 */
async function getRatingDetail(ratingId) {
  if (!ratingId) {
    throw new Error('评价ID不能为空');
  }

  return request.get(`/ratings/${ratingId}`);
}

/**
 * 提交商品评价
 * @param {Object} data - 评价数据
 * @param {string} data.productId - 商品ID
 * @param {string} data.orderId - 订单ID
 * @param {number} data.rating - 评分 1-5
 * @param {string} data.content - 评价内容
 * @param {Array} [data.images] - 评价图片URL数组 (可选)
 * @param {Array} [data.tags] - 评价标签数组 (可选)
 * @param {boolean} [data.anonymous] - 是否匿名评价 (可选)
 * @returns {Promise<Object>} 提交结果
 */
async function submitProductRating(data) {
  const {
    productId,
    orderId,
    rating,
    content,
    images = [],
    tags = [],
    anonymous = false
  } = data;

  if (!productId || !orderId) {
    throw new Error('商品ID和订单ID不能为空');
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new Error('评分必须是1-5之间的整数');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('评价内容不能为空');
  }

  if (content.length > 500) {
    throw new Error('评价内容不能超过500字');
  }

  if (images.length > 9) {
    throw new Error('评价图片最多上传9张');
  }

  return request.post('/ratings', {
    productId,
    orderId,
    rating,
    content: content.trim(),
    images,
    tags,
    anonymous
  });
}

/**
 * 上传评价图片
 * @param {string} filePath - 本地图片路径
 * @returns {Promise<Object>} 上传结果，包含图片URL
 */
async function uploadRatingImage(filePath) {
  if (!filePath) {
    throw new Error('图片路径不能为空');
  }

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${request.baseURL}/ratings/upload-image`,
      filePath,
      name: 'image',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (e) {
          reject(new Error('上传响应解析失败'));
        }
      },
      fail: (error) => {
        reject(new Error(error.errMsg || '上传失败'));
      }
    });
  });
}

/**
 * 点赞评价
 * @param {string} ratingId - 评价ID
 * @returns {Promise<Object>} 操作结果
 */
async function likeRating(ratingId) {
  if (!ratingId) {
    throw new Error('评价ID不能为空');
  }

  return request.post(`/ratings/${ratingId}/like`);
}

/**
 * 取消点赞评价
 * @param {string} ratingId - 评价ID
 * @returns {Promise<Object>} 操作结果
 */
async function unlikeRating(ratingId) {
  if (!ratingId) {
    throw new Error('评价ID不能为空');
  }

  return request.delete(`/ratings/${ratingId}/like`);
}

/**
 * 举报评价
 * @param {string} ratingId - 评价ID
 * @param {string} reason - 举报原因
 * @param {string} [description] - 举报描述 (可选)
 * @returns {Promise<Object>} 操作结果
 */
async function reportRating(ratingId, reason, description = '') {
  if (!ratingId) {
    throw new Error('评价ID不能为空');
  }

  if (!reason) {
    throw new Error('举报原因不能为空');
  }

  return request.post(`/ratings/${ratingId}/report`, {
    reason,
    description
  });
}

/**
 * 回复评价
 * @param {string} ratingId - 评价ID
 * @param {string} content - 回复内容
 * @returns {Promise<Object>} 操作结果
 */
async function replyRating(ratingId, content) {
  if (!ratingId) {
    throw new Error('评价ID不能为空');
  }

  if (!content || content.trim().length === 0) {
    throw new Error('回复内容不能为空');
  }

  if (content.length > 200) {
    throw new Error('回复内容不能超过200字');
  }

  return request.post(`/ratings/${ratingId}/reply`, {
    content: content.trim()
  });
}

/**
 * 获取评价回复列表
 * @param {string} ratingId - 评价ID
 * @param {number} [page] - 页码，默认为1 (可选)
 * @param {number} [pageSize] - 每页数量，默认为20 (可选)
 * @returns {Promise<Object>} 回复列表和分页信息
 */
async function getRatingReplies(ratingId, page = 1, pageSize = 20) {
  if (!ratingId) {
    throw new Error('评价ID不能为空');
  }

  return request.get(`/ratings/${ratingId}/replies`, {
    params: { page, pageSize }
  });
}

/**
 * 获取用户评价列表
 * @param {Object} options - 查询参数
 * @param {string} [options.userId] - 用户ID，不传则获取当前用户 (可选)
 * @param {number} [options.page] - 页码，默认为1 (可选)
 * @param {number} [options.pageSize] - 每页数量，默认为20 (可选)
 * @param {string} [options.type] - 评价类型：all/good/medium/bad (可选)
 * @returns {Promise<Object>} 评价列表和分页信息
 */
async function getUserRatings(options = {}) {
  const {
    userId,
    page = 1,
    pageSize = 20,
    type = 'all'
  } = options;

  const params = {
    page,
    pageSize,
    type
  };

  const url = userId ? `/users/${userId}/ratings` : '/user/ratings';

  return request.get(url, { params });
}

/**
 * 获取用户待评价订单列表
 * @param {number} page - 页码，默认为1
 * @param {number} pageSize - 每页数量，默认为20
 * @returns {Promise<Object>} 待评价订单列表和分页信息
 */
async function getPendingRatings(page = 1, pageSize = 20) {
  return request.get('/user/pending-ratings', {
    params: { page, pageSize }
  });
}

/**
 * 删除自己的评价
 * @param {string} ratingId - 评价ID
 * @returns {Promise<Object>} 操作结果
 */
async function deleteRating(ratingId) {
  if (!ratingId) {
    throw new Error('评价ID不能为空');
  }

  return request.delete(`/ratings/${ratingId}`);
}

/**
 * 修改自己的评价
 * @param {string} ratingId - 评价ID
 * @param {Object} data - 修改数据
 * @param {number} [data.rating] - 评分 1-5 (可选)
 * @param {string} [data.content] - 评价内容 (可选)
 * @param {Array} [data.images] - 评价图片URL数组 (可选)
 * @param {Array} [data.tags] - 评价标签数组 (可选)
 * @param {boolean} [data.anonymous] - 是否匿名评价 (可选)
 * @returns {Promise<Object>} 操作结果
 */
async function updateRating(ratingId, data) {
  const {
    rating,
    content,
    images = [],
    tags = [],
    anonymous = false
  } = data;

  if (!ratingId) {
    throw new Error('评价ID不能为空');
  }

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new Error('评分必须是1-5之间的整数');
  }

  if (content !== undefined) {
    if (!content || content.trim().length === 0) {
      throw new Error('评价内容不能为空');
    }

    if (content.length > 500) {
      throw new Error('评价内容不能超过500字');
    }
  }

  if (images.length > 9) {
    throw new Error('评价图片最多上传9张');
  }

  const updateData = {};

  if (rating !== undefined) updateData.rating = rating;
  if (content !== undefined) updateData.content = content.trim();
  if (images.length > 0) updateData.images = images;
  if (tags.length > 0) updateData.tags = tags;
  if (anonymous !== undefined) updateData.anonymous = anonymous;

  return request.put(`/ratings/${ratingId}`, updateData);
}

/**
 * 获取评价标签列表
 * @returns {Promise<Array>} 评价标签列表
 */
async function getRatingTags() {
  return request.get('/ratings/tags');
}

module.exports = {
  getProductRatings,
  getProductRatingStats,
  getRatingDetail,
  submitProductRating,
  uploadRatingImage,
  likeRating,
  unlikeRating,
  reportRating,
  replyRating,
  getRatingReplies,
  getUserRatings,
  getPendingRatings,
  deleteRating,
  updateRating,
  getRatingTags
};