/**
 * 文件名: notificationService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: notificationService 的单元测试
 */

// 模拟请求模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const request = require('../../utils/request');
const notificationService = require('../notificationService');

describe('notificationService', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('getNotificationList', () => {
    it('should call request.get with correct endpoint and default options', async () => {
      const mockData = { notifications: [], total: 0 };
      request.get.mockResolvedValue(mockData);

      const result = await notificationService.getNotificationList();

      expect(request.get).toHaveBeenCalledWith('/notifications', {
        type: 'all',
        status: 'all',
        page: 1,
        pageSize: 20
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom options', async () => {
      const mockData = { notifications: [], total: 0 };
      const options = { type: 'system', status: 'unread', page: 2, pageSize: 10 };
      request.get.mockResolvedValue(mockData);

      const result = await notificationService.getNotificationList(options);

      expect(request.get).toHaveBeenCalledWith('/notifications', options);
      expect(result).toEqual(mockData);
    });
  });

  describe('getNotificationDetail', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { id: 'notif1', title: 'Test Notification' };
      const id = 'notif1';
      request.get.mockResolvedValue(mockData);

      const result = await notificationService.getNotificationDetail(id);

      expect(request.get).toHaveBeenCalledWith(`/notifications/${id}`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when id is empty', async () => {
      await expect(notificationService.getNotificationDetail('')).rejects.toThrow('通知ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should call request.put with correct endpoint when id is provided', async () => {
      const mockData = { success: true };
      const id = 'notif1';
      request.put.mockResolvedValue(mockData);

      const result = await notificationService.markAsRead(id);

      expect(request.put).toHaveBeenCalledWith(`/notifications/${id}/read`);
      expect(result).toEqual(mockData);
    });

    it('should call request.put with correct endpoint when id is not provided', async () => {
      const mockData = { success: true };
      request.put.mockResolvedValue(mockData);

      const result = await notificationService.markAsRead();

      expect(request.put).toHaveBeenCalledWith('/notifications/read-all');
      expect(result).toEqual(mockData);
    });
  });

  describe('deleteNotification', () => {
    it('should call request.delete with correct endpoint when id is provided', async () => {
      const mockData = { success: true };
      const id = 'notif1';
      request.delete.mockResolvedValue(mockData);

      const result = await notificationService.deleteNotification(id);

      expect(request.delete).toHaveBeenCalledWith(`/notifications/${id}`);
      expect(result).toEqual(mockData);
    });

    it('should call request.delete with correct endpoint when id is not provided', async () => {
      const mockData = { success: true };
      request.delete.mockResolvedValue(mockData);

      const result = await notificationService.deleteNotification();

      expect(request.delete).toHaveBeenCalledWith('/notifications/clear-read');
      expect(result).toEqual(mockData);
    });
  });

  describe('getUnreadCount', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { count: 5 };
      request.get.mockResolvedValue(mockData);

      const result = await notificationService.getUnreadCount();

      expect(request.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toEqual(mockData);
    });
  });

  describe('getNotificationSettings', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { systemNotification: true, orderNotification: false };
      request.get.mockResolvedValue(mockData);

      const result = await notificationService.getNotificationSettings();

      expect(request.get).toHaveBeenCalledWith('/notifications/settings');
      expect(result).toEqual(mockData);
    });
  });

  describe('updateNotificationSettings', () => {
    it('should call request.put with correct endpoint and data', async () => {
      const mockData = { success: true };
      const settings = { 
        systemNotification: true, 
        orderNotification: false, 
        promotionNotification: true, 
        activityNotification: false 
      };
      request.put.mockResolvedValue(mockData);

      const result = await notificationService.updateNotificationSettings(settings);

      expect(request.put).toHaveBeenCalledWith('/notifications/settings', settings);
      expect(result).toEqual(mockData);
    });
  });

  describe('subscribePushNotification', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true };
      const subscription = { 
        platform: 'ios', 
        token: 'device_token_123', 
        userId: 'user123' 
      };
      request.post.mockResolvedValue(mockData);

      const result = await notificationService.subscribePushNotification(subscription);

      expect(request.post).toHaveBeenCalledWith('/notifications/subscribe', subscription);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when platform is missing', async () => {
      const subscription = { token: 'device_token_123', userId: 'user123' };
      
      await expect(notificationService.subscribePushNotification(subscription)).rejects.toThrow('平台和设备令牌不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should reject with error when token is missing', async () => {
      const subscription = { platform: 'ios', userId: 'user123' };
      
      await expect(notificationService.subscribePushNotification(subscription)).rejects.toThrow('平台和设备令牌不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribePushNotification', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true };
      const token = 'device_token_123';
      request.post.mockResolvedValue(mockData);

      const result = await notificationService.unsubscribePushNotification(token);

      expect(request.post).toHaveBeenCalledWith('/notifications/unsubscribe', { token });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when token is empty', async () => {
      await expect(notificationService.unsubscribePushNotification('')).rejects.toThrow('设备令牌不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true };
      const notification = { 
        title: 'Test Title', 
        content: 'Test Content', 
        type: 'system', 
        targetUsers: ['user1', 'user2'] 
      };
      request.post.mockResolvedValue(mockData);

      const result = await notificationService.sendNotification(notification);

      expect(request.post).toHaveBeenCalledWith('/notifications/send', notification);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when title is missing', async () => {
      const notification = { content: 'Test Content', type: 'system' };
      
      await expect(notificationService.sendNotification(notification)).rejects.toThrow('通知标题、内容和类型不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should reject with error when content is missing', async () => {
      const notification = { title: 'Test Title', type: 'system' };
      
      await expect(notificationService.sendNotification(notification)).rejects.toThrow('通知标题、内容和类型不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });

    it('should reject with error when type is missing', async () => {
      const notification = { title: 'Test Title', content: 'Test Content' };
      
      await expect(notificationService.sendNotification(notification)).rejects.toThrow('通知标题、内容和类型不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });
});