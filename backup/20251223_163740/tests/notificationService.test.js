/**
 * 文件名: notificationService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-03
 * 描述: 通知服务单元测试
 */

// 模拟request模块
const mockRequest = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// 保存原始的require
const originalRequire = require;

// 模拟require
jest.mock('../SutWxApp/utils/request', () => mockRequest);

// 导入要测试的服务
const notificationService = require('../SutWxApp/services/notificationService');

describe('通知服务测试', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('通知列表功能', () => {
    test('获取通知列表应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: [
          { id: 'notification_1', title: '测试通知1', content: '测试内容1', type: 'system' },
          { id: 'notification_2', title: '测试通知2', content: '测试内容2', type: 'order' }
        ],
        total: 2,
        page: 1,
        pageSize: 20
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.getNotificationList({
        type: 'all',
        status: 'all',
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/notifications', {
        type: 'all',
        status: 'all',
        page: 1,
        pageSize: 20
      });
    });

    test('获取未读通知列表应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: [
          { id: 'notification_3', title: '未读通知', content: '未读内容', type: 'promotion', isRead: false }
        ],
        total: 1,
        page: 1,
        pageSize: 20
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.getNotificationList({
        status: 'unread',
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/notifications', {
        type: 'all',
        status: 'unread',
        page: 1,
        pageSize: 20
      });
    });
  });

  describe('通知详情功能', () => {
    test('获取通知详情应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          id: 'notification_1',
          title: '测试通知',
          content: '测试内容',
          type: 'system',
          isRead: false,
          createTime: Date.now()
        }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.getNotificationDetail('notification_1');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/notifications/notification_1');
    });

    test('缺少通知ID应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(notificationService.getNotificationDetail('')).rejects.toThrow('通知ID不能为空');
      await expect(notificationService.getNotificationDetail(null)).rejects.toThrow('通知ID不能为空');
      await expect(notificationService.getNotificationDetail(undefined)).rejects.toThrow('通知ID不能为空');
    });
  });

  describe('通知状态管理', () => {
    test('标记单条通知为已读应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.put.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.markAsRead('notification_1');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.put).toHaveBeenCalledWith('/notifications/notification_1/read');
    });

    test('标记所有通知为已读应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.put.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.markAsRead();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.put).toHaveBeenCalledWith('/notifications/read-all');
    });

    test('删除单条通知应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.delete.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.deleteNotification('notification_1');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.delete).toHaveBeenCalledWith('/notifications/notification_1');
    });

    test('删除所有已读通知应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.delete.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.deleteNotification();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.delete).toHaveBeenCalledWith('/notifications/clear-read');
    });

    test('获取未读通知数量应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true, count: 5 };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.getUnreadCount();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/notifications/unread-count');
    });
  });

  describe('通知设置功能', () => {
    test('获取通知设置应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          systemNotification: true,
          orderNotification: true,
          promotionNotification: true,
          activityNotification: true,
          socialNotification: true,
          notificationSound: true,
          notificationVibration: true,
          pushNotification: true
        }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.getNotificationSettings();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/notifications/settings');
    });

    test('更新通知设置应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.put.mockResolvedValue(mockResponse);

      // 调用服务方法
      const settings = {
        systemNotification: false,
        orderNotification: true,
        promotionNotification: false,
        activityNotification: true,
        socialNotification: true
      };
      const result = await notificationService.updateNotificationSettings(settings);

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.put).toHaveBeenCalledWith('/notifications/settings', settings);
    });
  });

  describe('推送通知功能', () => {
    test('订阅推送通知应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const subscription = {
        platform: 'ios',
        token: 'device_token_123',
        userId: 'user_123'
      };
      const result = await notificationService.subscribePushNotification(subscription);

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/notifications/subscribe', subscription);
    });

    test('缺少平台信息应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(notificationService.subscribePushNotification({
        token: 'device_token_123',
        userId: 'user_123'
      })).rejects.toThrow('平台和设备令牌不能为空');
    });

    test('取消订阅推送通知应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await notificationService.unsubscribePushNotification('device_token_123');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/notifications/unsubscribe', { token: 'device_token_123' });
    });

    test('缺少设备令牌应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(notificationService.unsubscribePushNotification('')).rejects.toThrow('设备令牌不能为空');
      await expect(notificationService.unsubscribePushNotification(null)).rejects.toThrow('设备令牌不能为空');
      await expect(notificationService.unsubscribePushNotification(undefined)).rejects.toThrow('设备令牌不能为空');
    });
  });

  describe('订阅消息功能', () => {
    test('发送订阅消息应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const message = {
        templateId: 'template_123',
        data: { keyword1: { value: '测试消息' } },
        openId: 'openid_123'
      };
      const result = await notificationService.sendSubscribeMessage(message);

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/notifications/subscribe-message', message);
    });

    test('缺少模板ID应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(notificationService.sendSubscribeMessage({
        data: { keyword1: { value: '测试消息' } },
        openId: 'openid_123'
      })).rejects.toThrow('模板ID、消息数据和用户openId不能为空');
    });

    test('发送订阅消息失败应加入重试队列', async () => {
      // 模拟API返回错误
      mockRequest.post.mockRejectedValue(new Error('发送失败'));

      // 调用服务方法
      const message = {
        templateId: 'template_123',
        data: { keyword1: { value: '测试消息' } },
        openId: 'openid_123'
      };
      const result = await notificationService.sendSubscribeMessage(message);

      // 验证结果
      expect(result).toEqual({ success: false, retry: true, retryCount: 1 });
    });
  });
});
