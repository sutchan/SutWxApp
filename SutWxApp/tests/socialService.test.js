/**
 * 文件名: socialService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-03
 * 描述: 社交服务单元测试
 */

const socialService = require('../services/socialService');

describe('socialService', () => {
  // 模拟wx对象
  global.wx = {
    request: jest.fn(),
    showToast: jest.fn(),
    setStorageSync: jest.fn(),
    getStorageSync: jest.fn(),
    removeStorageSync: jest.fn()
  };

  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('shareProduct', () => {
    test('分享产品成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { shareId: 'share123', success: true }
        }
      });

      const result = await socialService.shareProduct({
        productId: 'p1',
        title: '分享标题',
        description: '分享描述',
        imageUrl: 'https://example.com/image.jpg',
        shareChannel: 'wechat'
      });
      
      expect(result.success).toBe(true);
      expect(result.data.shareId).toBe('share123');
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/social/share/product'),
        method: 'POST',
        data: expect.objectContaining({
          productId: 'p1',
          title: '分享标题',
          description: '分享描述',
          imageUrl: 'https://example.com/image.jpg',
          shareChannel: 'wechat'
        })
      }));
    });

    test('分享产品缺少productId应该抛出错误', async () => {
      await expect(socialService.shareProduct({
        title: '分享标题',
        description: '分享描述',
        imageUrl: 'https://example.com/image.jpg',
        shareChannel: 'wechat'
      })).rejects.toThrow('产品ID不能为空');
    });
  });

  describe('shareArticle', () => {
    test('分享文章成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { shareId: 'share456', success: true }
        }
      });

      const result = await socialService.shareArticle({
        articleId: 'a1',
        title: '文章分享标题',
        description: '文章分享描述',
        imageUrl: 'https://example.com/article.jpg',
        shareChannel: 'circle'
      });
      
      expect(result.success).toBe(true);
      expect(result.data.shareId).toBe('share456');
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/social/share/article'),
        method: 'POST',
        data: expect.objectContaining({
          articleId: 'a1',
          title: '文章分享标题',
          description: '文章分享描述',
          imageUrl: 'https://example.com/article.jpg',
          shareChannel: 'circle'
        })
      }));
    });

    test('分享文章缺少articleId应该抛出错误', async () => {
      await expect(socialService.shareArticle({
        title: '文章分享标题',
        description: '文章分享描述',
        imageUrl: 'https://example.com/article.jpg',
        shareChannel: 'circle'
      })).rejects.toThrow('文章ID不能为空');
    });
  });

  describe('getProductComments', () => {
    test('获取产品评论列表成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: {
            comments: [{ id: 'c1', content: '评论1' }, { id: 'c2', content: '评论2' }],
            total: 2,
            page: 1,
            pageSize: 20
          }
        }
      });

      const result = await socialService.getProductComments({
        productId: 'p1',
        page: 1,
        pageSize: 20,
        sort: 'newest'
      });
      
      expect(result.success).toBe(true);
      expect(result.data.comments).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/products/p1/comments'),
        method: 'GET',
        data: { page: 1, pageSize: 20, sort: 'newest' }
      }));
    });

    test('获取产品评论缺少productId应该抛出错误', async () => {
      await expect(socialService.getProductComments({
        page: 1,
        pageSize: 20,
        sort: 'newest'
      })).rejects.toThrow('产品ID不能为空');
    });
  });

  describe('addProductComment', () => {
    test('添加产品评论成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { commentId: 'c3', content: '新评论' }
        }
      });

      const result = await socialService.addProductComment({
        productId: 'p1',
        content: '这是一条测试评论',
        rating: 5,
        images: ['https://example.com/comment1.jpg'],
        anonymous: false
      });
      
      expect(result.success).toBe(true);
      expect(result.data.commentId).toBe('c3');
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/social/comments/product'),
        method: 'POST',
        data: expect.objectContaining({
          productId: 'p1',
          content: '这是一条测试评论',
          rating: 5,
          images: ['https://example.com/comment1.jpg'],
          anonymous: false
        })
      }));
    });

    test('添加产品评论缺少productId应该抛出错误', async () => {
      await expect(socialService.addProductComment({
        content: '这是一条测试评论',
        rating: 5,
        images: ['https://example.com/comment1.jpg'],
        anonymous: false
      })).rejects.toThrow('产品ID不能为空');
    });

    test('添加产品评论内容为空应该抛出错误', async () => {
      await expect(socialService.addProductComment({
        productId: 'p1',
        content: '',
        rating: 5,
        images: ['https://example.com/comment1.jpg'],
        anonymous: false
      })).rejects.toThrow('评论内容不能为空');
    });

    test('添加产品评论评分不在1-5之间应该抛出错误', async () => {
      await expect(socialService.addProductComment({
        productId: 'p1',
        content: '这是一条测试评论',
        rating: 6,
        images: ['https://example.com/comment1.jpg'],
        anonymous: false
      })).rejects.toThrow('评分必须在1-5之间');
    });
  });

  describe('likeProduct', () => {
    test('点赞产品成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { liked: true, likeCount: 10 }
        }
      });

      const result = await socialService.likeProduct('p1');
      
      expect(result.success).toBe(true);
      expect(result.data.liked).toBe(true);
      expect(result.data.likeCount).toBe(10);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/social/like/product'),
        method: 'POST',
        data: { productId: 'p1' }
      }));
    });

    test('点赞产品缺少productId应该抛出错误', async () => {
      await expect(socialService.likeProduct()).rejects.toThrow('产品ID不能为空');
    });
  });

  describe('unlikeProduct', () => {
    test('取消点赞产品成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { liked: false, likeCount: 9 }
        }
      });

      const result = await socialService.unlikeProduct('p1');
      
      expect(result.success).toBe(true);
      expect(result.data.liked).toBe(false);
      expect(result.data.likeCount).toBe(9);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/social/unlike/product'),
        method: 'POST',
        data: { productId: 'p1' }
      }));
    });

    test('取消点赞产品缺少productId应该抛出错误', async () => {
      await expect(socialService.unlikeProduct()).rejects.toThrow('产品ID不能为空');
    });
  });

  describe('checkLikeStatus', () => {
    test('检查点赞状态成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { liked: true }
        }
      });

      const result = await socialService.checkLikeStatus({
        targetId: 'p1',
        targetType: 'product'
      });
      
      expect(result.success).toBe(true);
      expect(result.data.liked).toBe(true);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/social/like/check'),
        method: 'GET',
        data: { targetId: 'p1', targetType: 'product' }
      }));
    });

    test('检查点赞状态缺少targetId应该抛出错误', async () => {
      await expect(socialService.checkLikeStatus({
        targetType: 'product'
      })).rejects.toThrow('目标ID和类型不能为空');
    });

    test('检查点赞状态缺少targetType应该抛出错误', async () => {
      await expect(socialService.checkLikeStatus({
        targetId: 'p1'
      })).rejects.toThrow('目标ID和类型不能为空');
    });
  });

  describe('followUser', () => {
    test('关注用户成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { followed: true, followingCount: 5 }
        }
      });

      const result = await socialService.followUser('u123');
      
      expect(result.success).toBe(true);
      expect(result.data.followed).toBe(true);
      expect(result.data.followingCount).toBe(5);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/social/follow'),
        method: 'POST',
        data: { userId: 'u123' }
      }));
    });

    test('关注用户缺少userId应该抛出错误', async () => {
      await expect(socialService.followUser()).rejects.toThrow('用户ID不能为空');
    });
  });

  describe('unfollowUser', () => {
    test('取消关注用户成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { followed: false, followingCount: 4 }
        }
      });

      const result = await socialService.unfollowUser('u123');
      
      expect(result.success).toBe(true);
      expect(result.data.followed).toBe(false);
      expect(result.data.followingCount).toBe(4);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/social/follow/u123'),
        method: 'DELETE'
      }));
    });

    test('取消关注用户缺少userId应该抛出错误', async () => {
      await expect(socialService.unfollowUser()).rejects.toThrow('用户ID不能为空');
    });
  });
});