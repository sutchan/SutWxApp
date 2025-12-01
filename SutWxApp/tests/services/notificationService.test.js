/**
 * 文件名: notificationService.test.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-01
 * 作者: Sut
 * 描述: 通知服务单元测试
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
const notificationService = require('../../services/notificationService');

describe('notificationService', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('getNotificationList', () => {
    it('should get notification list successfully', async () => {
      // 准备测试数据
      const mockNotifications = [
        { id: '1', title: '测试通知1', content: '测试内容1', type: 'system', isRead: false },
        { id: '2', title: '测试通知2', content: '测试内容2', type: 'order', isRead: true }
      ];
      const mockResponse = { data: mockNotifications, total: 2, page: 1, pageSize: 20 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.getNotificationList();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/notifications', {
        type: 'all',
        status: 'all',
        page: 1,
        pageSize: 20
      });
    });

    it('should use custom options when provided', async () => {
      // 准备测试数据
      const mockOptions = {
        type: 'order',
        status: 'unread',
        page: 2,
        pageSize: 10
      };
      const mockResponse = { data: [], total: 0, page: 2, pageSize: 10 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      await notificationService.getNotificationList(mockOptions);
      
      // 验证结果
      expect(request.get).toHaveBeenCalledWith('/notifications', mockOptions);
    });
  });

  describe('getNotificationDetail', () => {
    it('should get notification detail successfully', async () => {
      // 准备测试数据
      const notificationId = '1';
      const mockResponse = { id: notificationId, title: '测试通知', content: '测试内容', type: 'system' };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.getNotificationDetail(notificationId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith(`/notifications/${notificationId}`);
    });

    it('should throw error if id is not provided', async () => {
      // 执行测试并验证结果
      await expect(notificationService.getNotificationDetail()).rejects.toThrow('通知ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read successfully', async () => {
      // 准备测试数据
      const notificationId = '1';
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.markAsRead(notificationId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith(`/notifications/${notificationId}/read`);
    });

    it('should mark all notifications as read successfully', async () => {
      // 准备测试数据
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.markAsRead();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith('/notifications/read-all');
    });
  });

  describe('deleteNotification', () => {
    it('should delete single notification successfully', async () => {
      // 准备测试数据
      const notificationId = '1';
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.deleteNotification(notificationId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith(`/notifications/${notificationId}`);
    });

    it('should delete all read notifications successfully', async () => {
      // 准备测试数据
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.deleteNotification();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/notifications/clear-read');
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count successfully', async () => {
      // 准备测试数据
      const mockResponse = { count: 5 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.getUnreadCount();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/notifications/unread-count');
    });
  });

  describe('getNotificationSettings', () => {
    it('should get notification settings successfully', async () => {
      // 准备测试数据
      const mockResponse = {
        systemNotification: true,
        orderNotification: true,
        promotionNotification: false,
        activityNotification: true
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.getNotificationSettings();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/notifications/settings');
    });
  });

  describe('updateNotificationSettings', () => {
    it('should update notification settings successfully', async () => {
      // 准备测试数据
      const mockSettings = {
        systemNotification: true,
        orderNotification: false,
        promotionNotification: true,
        activityNotification: false
      };
      const mockResponse = { success: true, ...mockSettings };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.updateNotificationSettings(mockSettings);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith('/notifications/settings', mockSettings);
    });
  });

  describe('subscribePushNotification', () => {
    it('should subscribe push notification successfully', async () => {
      // 准备测试数据
      const mockSubscription = {
        platform: 'web',
        token: 'test-token',
        userId: 'user-123'
      };
      const mockResponse = { success: true, subscriptionId: 'sub-123' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.subscribePushNotification(mockSubscription);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/notifications/subscribe', mockSubscription);
    });

    it('should throw error if platform is not provided', async () => {
      // 准备测试数据
      const mockSubscription = {
        token: 'test-token',
        userId: 'user-123'
      };
      
      // 执行测试并验证结果
      await expect(notificationService.subscribePushNotification(mockSubscription)).rejects.toThrow('平台和设备令牌不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should throw error if token is not provided', async () => {
      // 准备测试数据
      const mockSubscription = {
        platform: 'web',
        userId: 'user-123'
      };
      
      // 执行测试并验证结果
      await expect(notificationService.subscribePushNotification(mockSubscription)).rejects.toThrow('平台和设备令牌不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribePushNotification', () => {
    it('should unsubscribe push notification successfully', async () => {
      // 准备测试数据
      const token = 'test-token';
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.unsubscribePushNotification(token);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/notifications/unsubscribe', { token });
    });

    it('should throw error if token is not provided', async () => {
      // 执行测试并验证结果
      await expect(notificationService.unsubscribePushNotification()).rejects.toThrow('设备令牌不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      // 准备测试数据
      const mockNotification = {
        title: '测试通知',
        content: '测试内容',
        type: 'system',
        targetUsers: ['user-123', 'user-456']
      };
      const mockResponse = { success: true, notificationId: 'notify-123' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.sendNotification(mockNotification);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/notifications/send', mockNotification);
    });

    it('should throw error if title is not provided', async () => {
      // 准备测试数据
      const mockNotification = {
        content: '测试内容',
        type: 'system'
      };
      
      // 执行测试并验证结果
      await expect(notificationService.sendNotification(mockNotification)).rejects.toThrow('通知标题、内容和类型不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should throw error if content is not provided', async () => {
      // 准备测试数据
      const mockNotification = {
        title: '测试通知',
        type: 'system'
      };
      
      // 执行测试并验证结果
      await expect(notificationService.sendNotification(mockNotification)).rejects.toThrow('通知标题、内容和类型不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should throw error if type is not provided', async () => {
      // 准备测试数据
      const mockNotification = {
        title: '测试通知',
        content: '测试内容'
      };
      
      // 执行测试并验证结果
      await expect(notificationService.sendNotification(mockNotification)).rejects.toThrow('通知标题、内容和类型不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('sendSubscribeMessage', () => {
    it('should send subscribe message successfully', async () => {
      // 准备测试数据
      const mockMessage = {
        templateId: 'template-123',
        data: { title: '测试模板消息', content: '测试内容' },
        openId: 'openid-123'
      };
      const mockResponse = { success: true, messageId: 'msg-123' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await notificationService.sendSubscribeMessage(mockMessage);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/notifications/subscribe-message', mockMessage);
    });

    it('should throw error if templateId is not provided', async () => {
      // 准备测试数据
      const mockMessage = {
        data: { title: '测试模板消息', content: '测试内容' },
        openId: 'openid-123'
      };
      
      // 执行测试并验证结果
      await expect(notificationService.sendSubscribeMessage(mockMessage)).rejects.toThrow('模板ID、消息数据和用户openId不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should handle send failure', async () => {
      // 准备测试数据
      const mockMessage = {
        templateId: 'template-123',
        data: { title: '测试模板消息', content: '测试内容' },
        openId: 'openid-123'
      };
      
      // 设置模拟返回值
      request.post.mockRejectedValue(new Error('发送失败'));
      
      // 执行测试并验证结果
      await expect(notificationService.sendSubscribeMessage(mockMessage)).rejects.toThrow('发送失败');
      expect(request.post).toHaveBeenCalledWith('/notifications/subscribe-message', mockMessage);
    });
  });
});
