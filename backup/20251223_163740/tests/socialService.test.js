/**
 * 文件名: socialService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-02
 * 描述: 社交服务单元测试
 */

// 模拟request模块
const mockRequest = {
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
};

// 保存原始的require
const originalRequire = require;

// 模拟require
jest.mock('../SutWxApp/utils/request', () => mockRequest);

// 导入要测试的服务
const socialService = require('../SutWxApp/services/socialService');

describe('社交服务测试', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('分享功能', () => {
    test('分享产品应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { shareId: 'share_123' } };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.shareProduct({
        productId: 'prod_123',
        title: '测试产品',
        description: '测试产品描述',
        imageUrl: 'https://example.com/image.jpg',
        shareChannel: 'wechat',
        extra: { source: 'home' }
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/social/share/product', {
        productId: 'prod_123',
        title: '测试产品',
        description: '测试产品描述',
        imageUrl: 'https://example.com/image.jpg',
        shareChannel: 'wechat',
        extra: { source: 'home' }
      });
    });

    test('分享文章应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { shareId: 'share_456' } };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.shareArticle({
        articleId: 'art_123',
        title: '测试文章',
        description: '测试文章描述',
        imageUrl: 'https://example.com/article.jpg',
        shareChannel: 'circle'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/social/share/article', {
        articleId: 'art_123',
        title: '测试文章',
        description: '测试文章描述',
        imageUrl: 'https://example.com/article.jpg',
        shareChannel: 'circle',
        extra: {}
      });
    });

    test('分享活动应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { shareId: 'share_789' } };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.shareActivity({
        activityId: 'act_123',
        title: '测试活动',
        description: '测试活动描述',
        imageUrl: 'https://example.com/activity.jpg',
        shareChannel: 'weibo'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/social/share/activity', {
        activityId: 'act_123',
        title: '测试活动',
        description: '测试活动描述',
        imageUrl: 'https://example.com/activity.jpg',
        shareChannel: 'weibo',
        extra: {}
      });
    });

    test('缺少产品ID应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(socialService.shareProduct({
        title: '测试产品',
        description: '测试产品描述',
        imageUrl: 'https://example.com/image.jpg'
      })).rejects.toThrow('产品ID不能为空');
    });

    test('缺少文章ID应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(socialService.shareArticle({
        title: '测试文章',
        description: '测试文章描述',
        imageUrl: 'https://example.com/article.jpg'
      })).rejects.toThrow('文章ID不能为空');
    });

    test('缺少活动ID应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(socialService.shareActivity({
        title: '测试活动',
        description: '测试活动描述',
        imageUrl: 'https://example.com/activity.jpg'
      })).rejects.toThrow('活动ID不能为空');
    });

    test('获取分享记录应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [], total: 0, page: 1, pageSize: 20 };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getShareRecords({
        page: 1,
        pageSize: 20,
        sort: 'newest',
        targetType: 'product',
        shareChannel: 'wechat'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/share/records', {
        page: 1,
        pageSize: 20,
        sort: 'newest',
        targetType: 'product',
        shareChannel: 'wechat'
      });
    });

    test('获取分享统计应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { totalShares: 100, uniqueUsers: 50 } };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getShareStats({
        targetId: 'prod_123',
        targetType: 'product',
        timeRange: 'month',
        shareChannel: 'wechat'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/share/stats/product/prod_123', {
        timeRange: 'month',
        shareChannel: 'wechat'
      });
    });

    test('获取分享渠道列表应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [{ id: 'wechat', name: '微信好友' }, { id: 'circle', name: '朋友圈' }] };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getShareChannels();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/share/channels', {});
    });

    test('获取分享奖励记录应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [], total: 0, page: 1, pageSize: 20 };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getShareRewards({
        page: 1,
        pageSize: 20,
        sort: 'newest'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/share/rewards', {
        page: 1,
        pageSize: 20,
        sort: 'newest'
      });
    });

    test('获取分享奖励规则应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { rules: [{ id: 1, name: '首次分享奖励', points: 10 }] } };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getShareRewardRules();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/share/reward-rules', {});
    });

    test('检查分享奖励状态应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { rewarded: true, points: 10 } };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.checkShareRewardStatus('share_123');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/share/rewards/check/share_123', {});
    });

    test('缺少分享ID应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(socialService.checkShareRewardStatus()).rejects.toThrow('分享记录ID不能为空');
    });
  });

  describe('评论功能', () => {
    test('添加产品评论应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { commentId: 'comment_123' } };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.addProductComment({
        productId: 'prod_123',
        content: '这是一个测试评论',
        rating: 5,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        anonymous: false
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/social/comments/product', {
        productId: 'prod_123',
        content: '这是一个测试评论',
        rating: 5,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        anonymous: false
      });
    });

    test('缺少评论内容应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(socialService.addProductComment({
        productId: 'prod_123',
        content: '',
        rating: 5
      })).rejects.toThrow('评论内容不能为空');
    });

    test('评分超出范围应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(socialService.addProductComment({
        productId: 'prod_123',
        content: '测试评论',
        rating: 6
      })).rejects.toThrow('评分必须在1-5之间');
    });
  });

  describe('点赞功能', () => {
    test('点赞产品应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { liked: true } };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.likeProduct('prod_123');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/social/like/product', {
        productId: 'prod_123'
      });
    });

    test('取消点赞产品应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { liked: false } };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.unlikeProduct('prod_123');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/social/unlike/product', {
        productId: 'prod_123'
      });
    });
  });

  describe('关注功能', () => {
    test('关注用户应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { followed: true } };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.followUser('user_123');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/social/follow', {
        userId: 'user_123'
      });
    });

    test('取消关注用户应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { followed: false } };
      mockRequest.delete.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.unfollowUser('user_123');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.delete).toHaveBeenCalledWith('/social/follow/user_123');
    });

    test('获取关注列表应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [], total: 0, page: 1, pageSize: 20 };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getUserFollowing({
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/following', {
        page: 1,
        pageSize: 20
      });
    });

    test('获取粉丝列表应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [], total: 0, page: 1, pageSize: 20 };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getUserFollowers({
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/followers', {
        page: 1,
        pageSize: 20
      });
    });

    test('获取指定用户关注列表应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [], total: 0, page: 1, pageSize: 20 };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getUserFollowing({
        userId: 'user_456',
        page: 1,
        pageSize: 20,
        sort: 'oldest'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/users/user_456/following', {
        page: 1,
        pageSize: 20,
        sort: 'oldest'
      });
    });

    test('获取指定用户粉丝列表应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [], total: 0, page: 1, pageSize: 20 };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getUserFollowers({
        userId: 'user_456',
        page: 1,
        pageSize: 20,
        sort: 'oldest'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/users/user_456/followers', {
        page: 1,
        pageSize: 20,
        sort: 'oldest'
      });
    });

    test('删除粉丝应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { removed: true } };
      mockRequest.delete.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.removeFollower('user_123');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.delete).toHaveBeenCalledWith('/user/followers/user_123');
    });

    test('获取推荐关注用户应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [{ id: 'user_123', name: '测试用户1' }, { id: 'user_456', name: '测试用户2' }] };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getRecommendedUsers(5);

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/users/recommended', { limit: 5 });
    });

    test('获取当前用户关注统计应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { following: 10, followers: 20 } };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getUserFollowStats();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/user/follow-stats', {});
    });

    test('获取指定用户关注统计应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: { following: 15, followers: 25 } };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.getUserFollowStats('user_123');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/users/user_123/follow-stats', {});
    });
  });

  describe('搜索功能', () => {
    test('搜索用户应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, data: [], total: 0, page: 1, pageSize: 20 };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await socialService.searchUsers({
        keyword: 'test',
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/social/users/search', {
        keyword: 'test',
        page: 1,
        pageSize: 20
      });
    });

    test('缺少搜索关键词应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(socialService.searchUsers({
        page: 1,
        pageSize: 20
      })).rejects.toThrow('搜索关键词不能为空');
    });
  });
});
