/**
 * 文件名: socialService.test.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-01
 * 作者: Sut
 * 描述: 社交服务单元测试
 */

// 模拟依赖模块
jest.mock('../../utils/request', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// 模拟微信API
jest.mock('wx', () => ({
  showToast: jest.fn()
}));

const request = require('../../utils/request');
const wx = require('wx');
const socialService = require('../../services/socialService');

describe('socialService', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('shareProduct', () => {
    it('should share product successfully', async () => {
      // 准备测试数据
      const mockOptions = {
        productId: '1',
        title: '测试产品',
        description: '测试产品描述',
        imageUrl: 'https://example.com/image.jpg',
        shareChannel: 'wechat'
      };
      const mockResponse = { success: true, shareId: 'share_123' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.shareProduct(mockOptions);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/social/share/product', mockOptions);
    });

    it('should use default shareChannel if not provided', async () => {
      // 准备测试数据
      const mockOptions = {
        productId: '1',
        title: '测试产品'
      };
      const mockResponse = { success: true, shareId: 'share_123' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      await socialService.shareProduct(mockOptions);
      
      // 验证结果
      expect(request.post).toHaveBeenCalledWith('/social/share/product', {
        ...mockOptions,
        shareChannel: 'wechat',
        description: undefined,
        imageUrl: undefined
      });
    });

    it('should throw error if productId is not provided', async () => {
      // 执行测试并验证结果
      await expect(socialService.shareProduct({})).rejects.toThrow('产品ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('getShareRecords', () => {
    it('should get share records successfully', async () => {
      // 准备测试数据
      const mockRecords = [
        { id: 'share_1', productId: '1', shareChannel: 'wechat', createdAt: '2025-11-30' },
        { id: 'share_2', productId: '2', shareChannel: 'friend', createdAt: '2025-11-29' }
      ];
      const mockResponse = { data: mockRecords, total: 2, page: 1, pageSize: 20 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.getShareRecords();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/social/share/records', {
        page: 1,
        pageSize: 20,
        sort: 'newest'
      });
    });

    it('should use custom options when provided', async () => {
      // 准备测试数据
      const mockOptions = {
        page: 2,
        pageSize: 10,
        sort: 'oldest'
      };
      const mockResponse = { data: [], total: 0, page: 2, pageSize: 10 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      await socialService.getShareRecords(mockOptions);
      
      // 验证结果
      expect(request.get).toHaveBeenCalledWith('/social/share/records', mockOptions);
    });
  });

  describe('getShareStats', () => {
    it('should get user share stats successfully', async () => {
      // 准备测试数据
      const mockStats = { totalShares: 10, totalProducts: 5, topChannels: ['wechat', 'friend'] };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockStats);
      
      // 执行测试
      const result = await socialService.getShareStats();
      
      // 验证结果
      expect(result).toEqual(mockStats);
      expect(request.get).toHaveBeenCalledWith('/social/share/stats');
    });

    it('should get product share stats successfully', async () => {
      // 准备测试数据
      const productId = '1';
      const mockStats = { totalShares: 5, shareChannels: ['wechat', 'circle'] };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockStats);
      
      // 执行测试
      const result = await socialService.getShareStats(productId);
      
      // 验证结果
      expect(result).toEqual(mockStats);
      expect(request.get).toHaveBeenCalledWith(`/social/share/stats/product/${productId}`);
    });
  });

  describe('getProductComments', () => {
    it('should get product comments successfully', async () => {
      // 准备测试数据
      const productId = '1';
      const mockComments = [
        { id: 'comment_1', content: '测试评论1', rating: 5, createdAt: '2025-11-30' },
        { id: 'comment_2', content: '测试评论2', rating: 4, createdAt: '2025-11-29' }
      ];
      const mockResponse = { data: mockComments, total: 2, page: 1, pageSize: 20 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.getProductComments({ productId });
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith(`/products/${productId}/comments`, {
        page: 1,
        pageSize: 20,
        sort: 'newest'
      });
    });

    it('should throw error if productId is not provided', async () => {
      // 执行测试并验证结果
      await expect(socialService.getProductComments({})).rejects.toThrow('产品ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });

    it('should use custom options when provided', async () => {
      // 准备测试数据
      const mockOptions = {
        productId: '1',
        page: 2,
        pageSize: 10,
        sort: 'highest',
        minRating: 4,
        withImages: true
      };
      const mockResponse = { data: [], total: 0, page: 2, pageSize: 10 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      await socialService.getProductComments(mockOptions);
      
      // 验证结果
      expect(request.get).toHaveBeenCalledWith(`/products/${mockOptions.productId}/comments`, {
        page: mockOptions.page,
        pageSize: mockOptions.pageSize,
        sort: mockOptions.sort,
        minRating: mockOptions.minRating,
        withImages: mockOptions.withImages
      });
    });
  });

  describe('addProductComment', () => {
    it('should add product comment successfully', async () => {
      // 准备测试数据
      const mockCommentData = {
        productId: '1',
        content: '测试评论内容',
        rating: 5,
        anonymous: false,
        images: []
      };
      const mockResponse = { id: 'comment_1', ...mockCommentData, createdAt: '2025-11-30' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.addProductComment(mockCommentData);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/social/comments/product', mockCommentData);
    });

    it('should throw error if productId is not provided', async () => {
      // 准备测试数据
      const mockCommentData = {
        content: '测试评论内容',
        rating: 5
      };
      
      // 执行测试并验证结果
      await expect(socialService.addProductComment(mockCommentData)).rejects.toThrow('产品ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should throw error if content is empty', async () => {
      // 准备测试数据
      const mockCommentData = {
        productId: '1',
        content: '',
        rating: 5
      };
      
      // 执行测试并验证结果
      await expect(socialService.addProductComment(mockCommentData)).rejects.toThrow('评论内容不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should throw error if rating is invalid', async () => {
      // 准备测试数据
      const mockCommentData = {
        productId: '1',
        content: '测试评论内容',
        rating: 6 // 超出范围1-5
      };
      
      // 执行测试并验证结果
      await expect(socialService.addProductComment(mockCommentData)).rejects.toThrow('评分必须在1-5之间');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('likeProduct', () => {
    it('should like product successfully', async () => {
      // 准备测试数据
      const productId = '1';
      const mockResponse = { success: true, likeId: 'like_123' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.likeProduct(productId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith(`/social/like/product/${productId}`);
    });

    it('should throw error if productId is not provided', async () => {
      // 执行测试并验证结果
      await expect(socialService.likeProduct()).rejects.toThrow('产品ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('unlikeProduct', () => {
    it('should unlike product successfully', async () => {
      // 准备测试数据
      const productId = '1';
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.unlikeProduct(productId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith(`/social/like/product/${productId}`);
    });

    it('should throw error if productId is not provided', async () => {
      // 执行测试并验证结果
      await expect(socialService.unlikeProduct()).rejects.toThrow('产品ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });

  describe('checkLikeStatus', () => {
    it('should check like status successfully', async () => {
      // 准备测试数据
      const mockOptions = {
        targetId: '1',
        targetType: 'product'
      };
      const mockResponse = { isLiked: true, likeId: 'like_123' };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.checkLikeStatus(mockOptions);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/social/like/check', mockOptions);
    });

    it('should throw error if targetId is not provided', async () => {
      // 执行测试并验证结果
      await expect(socialService.checkLikeStatus({ targetType: 'product' })).rejects.toThrow('目标ID和类型不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });

    it('should throw error if targetType is not provided', async () => {
      // 执行测试并验证结果
      await expect(socialService.checkLikeStatus({ targetId: '1' })).rejects.toThrow('目标ID和类型不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('likeComment', () => {
    it('should like comment successfully', async () => {
      // 准备测试数据
      const commentId = '1';
      const mockResponse = { success: true, likeId: 'like_123' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.likeComment(commentId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith(`/social/comments/${commentId}/like`);
    });

    it('should throw error if commentId is not provided', async () => {
      // 执行测试并验证结果
      await expect(socialService.likeComment()).rejects.toThrow('评论ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('unlikeComment', () => {
    it('should unlike comment successfully', async () => {
      // 准备测试数据
      const commentId = '1';
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await socialService.unlikeComment(commentId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith(`/social/comments/${commentId}/like`);
    });

    it('should throw error if commentId is not provided', async () => {
      // 执行测试并验证结果
      await expect(socialService.unlikeComment()).rejects.toThrow('评论ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });
});
