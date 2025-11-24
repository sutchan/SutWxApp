/**
 * 文件名: ratingService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 评价服务单元测试
 */

const request = require('../../utils/request');
const {
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
} = require('../ratingService');

// Mock request模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  baseURL: 'https://api.example.com'
}));

// Mock微信API
jest.mock('../../utils/wx', () => ({
  uploadFile: jest.fn(),
  getStorageSync: jest.fn()
}));

describe('ratingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductRatings', () => {
    it('应该获取商品评价列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await getProductRatings({
        productId: 'product123',
        page: 1,
        pageSize: 10,
        sort: 'newest',
        rating: 5,
        hasImage: true
      });
      
      expect(request.get).toHaveBeenCalledWith('/products/product123/ratings', {
        params: {
          page: 1,
          pageSize: 10,
          sort: 'newest',
          rating: 5,
          hasImage: true
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { list: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await getProductRatings({ productId: 'product123' });
      
      expect(request.get).toHaveBeenCalledWith('/products/product123/ratings', {
        params: {
          page: 1,
          pageSize: 20,
          sort: 'default'
        }
      });
    });

    it('商品ID为空时应抛出错误', async () => {
      await expect(getProductRatings({})).rejects.toThrow('商品ID不能为空');
    });
  });

  describe('getProductRatingStats', () => {
    it('应该获取商品评价统计', async () => {
      const mockResponse = {
        success: true,
        data: {
          averageRating: 4.5,
          totalRatings: 100,
          ratingDistribution: {
            5: 50,
            4: 30,
            3: 15,
            2: 3,
            1: 2
          }
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await getProductRatingStats('product123');
      
      expect(request.get).toHaveBeenCalledWith('/products/product123/ratings/stats');
      expect(result).toEqual(mockResponse);
    });

    it('商品ID为空时应抛出错误', async () => {
      await expect(getProductRatingStats('')).rejects.toThrow('商品ID不能为空');
    });
  });

  describe('getRatingDetail', () => {
    it('应该获取评价详情', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'rating123',
          content: '很好的商品',
          rating: 5
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await getRatingDetail('rating123');
      
      expect(request.get).toHaveBeenCalledWith('/ratings/rating123');
      expect(result).toEqual(mockResponse);
    });

    it('评价ID为空时应抛出错误', async () => {
      await expect(getRatingDetail('')).rejects.toThrow('评价ID不能为空');
    });
  });

  describe('submitProductRating', () => {
    it('应该提交商品评价', async () => {
      const mockResponse = { success: true, data: { id: 'newRating123' } };
      request.post.mockResolvedValue(mockResponse);
      
      const ratingData = {
        productId: 'product123',
        orderId: 'order123',
        rating: 5,
        content: '很好的商品',
        images: ['image1.jpg', 'image2.jpg'],
        tags: ['质量好', '物流快'],
        anonymous: false
      };
      
      const result = await submitProductRating(ratingData);
      
      expect(request.post).toHaveBeenCalledWith('/ratings', {
        productId: 'product123',
        orderId: 'order123',
        rating: 5,
        content: '很好的商品',
        images: ['image1.jpg', 'image2.jpg'],
        tags: ['质量好', '物流快'],
        anonymous: false
      });
      expect(result).toEqual(mockResponse);
    });

    it('商品ID和订单ID为空时应抛出错误', async () => {
      await expect(submitProductRating({})).rejects.toThrow('商品ID和订单ID不能为空');
    });

    it('评分无效时应抛出错误', async () => {
      await expect(submitProductRating({
        productId: 'product123',
        orderId: 'order123',
        rating: 6
      })).rejects.toThrow('评分必须是1-5之间的整数');
    });

    it('评价内容为空时应抛出错误', async () => {
      await expect(submitProductRating({
        productId: 'product123',
        orderId: 'order123',
        rating: 5,
        content: ''
      })).rejects.toThrow('评价内容不能为空');
    });

    it('评价内容过长时应抛出错误', async () => {
      const longContent = 'a'.repeat(501);
      await expect(submitProductRating({
        productId: 'product123',
        orderId: 'order123',
        rating: 5,
        content: longContent
      })).rejects.toThrow('评价内容不能超过500字');
    });

    it('图片数量超过限制时应抛出错误', async () => {
      const images = Array(10).fill('image.jpg');
      await expect(submitProductRating({
        productId: 'product123',
        orderId: 'order123',
        rating: 5,
        content: '很好的商品',
        images
      })).rejects.toThrow('评价图片最多上传9张');
    });
  });

  describe('uploadRatingImage', () => {
    it('应该上传评价图片', async () => {
      const mockResponse = {
        success: true,
        data: { imageUrl: 'https://example.com/image.jpg' }
      };
      
      const wx = require('../../utils/wx');
      wx.uploadFile.mockImplementation(({ success }) => {
        success({ data: JSON.stringify(mockResponse) });
      });
      wx.getStorageSync.mockReturnValue('token123');
      
      const result = await uploadRatingImage('/path/to/image.jpg');
      
      expect(wx.uploadFile).toHaveBeenCalledWith({
        url: 'https://api.example.com/ratings/upload-image',
        filePath: '/path/to/image.jpg',
        name: 'image',
        header: {
          'Authorization': 'Bearer token123'
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('图片路径为空时应抛出错误', async () => {
      await expect(uploadRatingImage('')).rejects.toThrow('图片路径不能为空');
    });

    it('上传失败时应抛出错误', async () => {
      const wx = require('../../utils/wx');
      wx.uploadFile.mockImplementation(({ fail }) => {
        fail({ errMsg: '上传失败' });
      });
      
      await expect(uploadRatingImage('/path/to/image.jpg')).rejects.toThrow('上传失败');
    });
  });

  describe('likeRating', () => {
    it('应该点赞评价', async () => {
      const mockResponse = { success: true, data: { liked: true } };
      request.post.mockResolvedValue(mockResponse);
      
      const result = await likeRating('rating123');
      
      expect(request.post).toHaveBeenCalledWith('/ratings/rating123/like');
      expect(result).toEqual(mockResponse);
    });

    it('评价ID为空时应抛出错误', async () => {
      await expect(likeRating('')).rejects.toThrow('评价ID不能为空');
    });
  });

  describe('unlikeRating', () => {
    it('应该取消点赞评价', async () => {
      const mockResponse = { success: true, data: { liked: false } };
      request.delete.mockResolvedValue(mockResponse);
      
      const result = await unlikeRating('rating123');
      
      expect(request.delete).toHaveBeenCalledWith('/ratings/rating123/like');
      expect(result).toEqual(mockResponse);
    });

    it('评价ID为空时应抛出错误', async () => {
      await expect(unlikeRating('')).rejects.toThrow('评价ID不能为空');
    });
  });

  describe('reportRating', () => {
    it('应该举报评价', async () => {
      const mockResponse = { success: true, data: { reported: true } };
      request.post.mockResolvedValue(mockResponse);
      
      const result = await reportRating('rating123', '不当内容', '详细描述');
      
      expect(request.post).toHaveBeenCalledWith('/ratings/rating123/report', {
        reason: '不当内容',
        description: '详细描述'
      });
      expect(result).toEqual(mockResponse);
    });

    it('评价ID为空时应抛出错误', async () => {
      await expect(reportRating('', '不当内容')).rejects.toThrow('评价ID不能为空');
    });

    it('举报原因为空时应抛出错误', async () => {
      await expect(reportRating('rating123', '')).rejects.toThrow('举报原因不能为空');
    });
  });

  describe('replyRating', () => {
    it('应该回复评价', async () => {
      const mockResponse = { success: true, data: { id: 'reply123' } };
      request.post.mockResolvedValue(mockResponse);
      
      const result = await replyRating('rating123', '感谢评价');
      
      expect(request.post).toHaveBeenCalledWith('/ratings/rating123/reply', {
        content: '感谢评价'
      });
      expect(result).toEqual(mockResponse);
    });

    it('评价ID为空时应抛出错误', async () => {
      await expect(replyRating('', '感谢评价')).rejects.toThrow('评价ID不能为空');
    });

    it('回复内容为空时应抛出错误', async () => {
      await expect(replyRating('rating123', '')).rejects.toThrow('回复内容不能为空');
    });

    it('回复内容过长时应抛出错误', async () => {
      const longContent = 'a'.repeat(201);
      await expect(replyRating('rating123', longContent)).rejects.toThrow('回复内容不能超过200字');
    });
  });

  describe('getRatingReplies', () => {
    it('应该获取评价回复列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await getRatingReplies('rating123', 1, 10);
      
      expect(request.get).toHaveBeenCalledWith('/ratings/rating123/replies', {
        params: { page: 1, pageSize: 10 }
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { list: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await getRatingReplies('rating123');
      
      expect(request.get).toHaveBeenCalledWith('/ratings/rating123/replies', {
        params: { page: 1, pageSize: 20 }
      });
    });

    it('评价ID为空时应抛出错误', async () => {
      await expect(getRatingReplies('')).rejects.toThrow('评价ID不能为空');
    });
  });

  describe('getUserRatings', () => {
    it('应该获取用户评价列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await getUserRatings({
        userId: 'user123',
        page: 1,
        pageSize: 10,
        type: 'good'
      });
      
      expect(request.get).toHaveBeenCalledWith('/users/user123/ratings', {
        params: {
          page: 1,
          pageSize: 10,
          type: 'good'
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('不传用户ID时应获取当前用户评价', async () => {
      const mockResponse = { success: true, data: { list: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await getUserRatings();
      
      expect(request.get).toHaveBeenCalledWith('/user/ratings', {
        params: {
          page: 1,
          pageSize: 20,
          type: 'all'
        }
      });
    });
  });

  describe('getPendingRatings', () => {
    it('应该获取用户待评价订单列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          list: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await getPendingRatings(1, 10);
      
      expect(request.get).toHaveBeenCalledWith('/user/pending-ratings', {
        params: { page: 1, pageSize: 10 }
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { list: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await getPendingRatings();
      
      expect(request.get).toHaveBeenCalledWith('/user/pending-ratings', {
        params: { page: 1, pageSize: 20 }
      });
    });
  });

  describe('deleteRating', () => {
    it('应该删除自己的评价', async () => {
      const mockResponse = { success: true, data: { deleted: true } };
      request.delete.mockResolvedValue(mockResponse);
      
      const result = await deleteRating('rating123');
      
      expect(request.delete).toHaveBeenCalledWith('/ratings/rating123');
      expect(result).toEqual(mockResponse);
    });

    it('评价ID为空时应抛出错误', async () => {
      await expect(deleteRating('')).rejects.toThrow('评价ID不能为空');
    });
  });

  describe('updateRating', () => {
    it('应该修改自己的评价', async () => {
      const mockResponse = { success: true, data: { updated: true } };
      request.put.mockResolvedValue(mockResponse);
      
      const updateData = {
        rating: 4,
        content: '修改后的评价',
        images: ['image1.jpg'],
        tags: ['新标签'],
        anonymous: true
      };
      
      const result = await updateRating('rating123', updateData);
      
      expect(request.put).toHaveBeenCalledWith('/ratings/rating123', {
        rating: 4,
        content: '修改后的评价',
        images: ['image1.jpg'],
        tags: ['新标签'],
        anonymous: true
      });
      expect(result).toEqual(mockResponse);
    });

    it('评价ID为空时应抛出错误', async () => {
      await expect(updateRating('', {})).rejects.toThrow('评价ID不能为空');
    });

    it('评分无效时应抛出错误', async () => {
      await expect(updateRating('rating123', { rating: 6 })).rejects.toThrow('评分必须是1-5之间的整数');
    });

    it('评价内容为空时应抛出错误', async () => {
      await expect(updateRating('rating123', { content: '' })).rejects.toThrow('评价内容不能为空');
    });

    it('评价内容过长时应抛出错误', async () => {
      const longContent = 'a'.repeat(501);
      await expect(updateRating('rating123', { content: longContent })).rejects.toThrow('评价内容不能超过500字');
    });

    it('图片数量超过限制时应抛出错误', async () => {
      const images = Array(10).fill('image.jpg');
      await expect(updateRating('rating123', { images })).rejects.toThrow('评价图片最多上传9张');
    });
  });

  describe('getRatingTags', () => {
    it('应该获取评价标签列表', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 1, name: '质量好' },
          { id: 2, name: '物流快' },
          { id: 3, name: '服务好' }
        ]
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await getRatingTags();
      
      expect(request.get).toHaveBeenCalledWith('/ratings/tags');
      expect(result).toEqual(mockResponse);
    });
  });
});