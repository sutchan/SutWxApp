/**
 * 文件名: notificationService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-03
 * 描述: 通知服务单元测试
 */

const notificationService = require('../services/notificationService');

describe('notificationService', () => {
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

  describe('getNotificationList', () => {
    test('获取通知列表成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: {
            notifications: [{ id: '1', title: '通知1' }, { id: '2', title: '通知2' }],
            total: 2,
            page: 1,
            pageSize: 20
          }
        }
      });

      const result = await notificationService.getNotificationList({ type: 'all', status: 'all', page: 1, pageSize: 20 });
      
      expect(result.success).toBe(true);
      expect(result.data.notifications).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/notifications'),
        method: 'GET',
        data: { type: 'all', status: 'all', page: 1, pageSize: 20 }
      }));
    });

    test('获取通知列表失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '获取通知列表失败'
        }
      });

      const result = await notificationService.getNotificationList();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('获取通知列表失败');
    });
  });

  describe('getNotificationDetail', () => {
    test('获取通知详情成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { id: '1', title: '通知1', content: '通知内容' }
        }
      });

      const result = await notificationService.getNotificationDetail('1');
      
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.data.title).toBe('通知1');
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/notifications/1'),
        method: 'GET'
      }));
    });

    test('获取通知详情失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '获取通知详情失败'
        }
      });

      const result = await notificationService.getNotificationDetail('1');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('获取通知详情失败');
    });

    test('通知ID为空应该返回错误', async () => {
      await expect(notificationService.getNotificationDetail()).rejects.toThrow('通知ID不能为空');
    });
  });

  describe('markAsRead', () => {
    test('标记单个通知为已读成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { success: true }
        }
      });

      const result = await notificationService.markAsRead('1');
      
      expect(result.success).toBe(true);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/notifications/1/read'),
        method: 'PUT'
      }));
    });

    test('标记所有通知为已读成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { success: true }
        }
      });

      const result = await notificationService.markAsRead();
      
      expect(result.success).toBe(true);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/notifications/read-all'),
        method: 'PUT'
      }));
    });

    test('标记通知为已读失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '标记通知为已读失败'
        }
      });

      const result = await notificationService.markAsRead('1');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('标记通知为已读失败');
    });
  });

  describe('deleteNotification', () => {
    test('删除单个通知成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { success: true }
        }
      });

      const result = await notificationService.deleteNotification('1');
      
      expect(result.success).toBe(true);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/notifications/1'),
        method: 'DELETE'
      }));
    });

    test('删除所有已读通知成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { success: true }
        }
      });

      const result = await notificationService.deleteNotification();
      
      expect(result.success).toBe(true);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/notifications/clear-read'),
        method: 'DELETE'
      }));
    });

    test('删除通知失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '删除通知失败'
        }
      });

      const result = await notificationService.deleteNotification('1');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('删除通知失败');
    });
  });

  describe('getUnreadCount', () => {
    test('获取未读通知数量成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { count: 5 }
        }
      });

      const result = await notificationService.getUnreadCount();
      
      expect(result.success).toBe(true);
      expect(result.data.count).toBe(5);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/notifications/unread-count'),
        method: 'GET'
      }));
    });

    test('获取未读通知数量失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '获取未读通知数量失败'
        }
      });

      const result = await notificationService.getUnreadCount();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('获取未读通知数量失败');
    });
  });
});