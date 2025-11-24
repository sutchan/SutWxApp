/**
 * 文件名: pointsService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: pointsService 的单元测试
 */

// 模拟请求模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

const request = require('../../utils/request');
const PointsService = require('../pointsService');

describe('PointsService', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('getUserPoints', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { points: 100, level: 1 };
      request.get.mockResolvedValue(mockData);

      const result = await PointsService.getUserPoints();

      expect(request.get).toHaveBeenCalledWith('/points/user-info');
      expect(result).toEqual(mockData);
    });
  });

  describe('getPointsTasks', () => {
    it('should call request.get with correct endpoint and options', async () => {
      const mockData = { tasks: [], total: 0 };
      const options = { type: 'daily', status: 'pending', page: 1, pageSize: 20 };
      request.get.mockResolvedValue(mockData);

      const result = await PointsService.getPointsTasks(options);

      expect(request.get).toHaveBeenCalledWith('/points/tasks', options);
      expect(result).toEqual(mockData);
    });

    it('should call request.get with default options when none provided', async () => {
      const mockData = { tasks: [], total: 0 };
      request.get.mockResolvedValue(mockData);

      const result = await PointsService.getPointsTasks();

      expect(request.get).toHaveBeenCalledWith('/points/tasks', {});
      expect(result).toEqual(mockData);
    });
  });

  describe('completeTask', () => {
    it('should call request.post with correct endpoint', async () => {
      const mockData = { success: true };
      const taskId = 'task123';
      request.post.mockResolvedValue(mockData);

      const result = await PointsService.completeTask(taskId);

      expect(request.post).toHaveBeenCalledWith(`/points/tasks/${taskId}/complete`);
      expect(result).toEqual(mockData);
    });
  });

  describe('claimTaskReward', () => {
    it('should call request.post with correct endpoint', async () => {
      const mockData = { success: true, reward: 10 };
      const taskId = 'task123';
      request.post.mockResolvedValue(mockData);

      const result = await PointsService.claimTaskReward(taskId);

      expect(request.post).toHaveBeenCalledWith(`/points/tasks/${taskId}/claim`);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPointsRecords', () => {
    it('should call request.get with correct endpoint and options', async () => {
      const mockData = { records: [], total: 0 };
      const options = { type: 'earn', page: 1, pageSize: 20 };
      request.get.mockResolvedValue(mockData);

      const result = await PointsService.getPointsRecords(options);

      expect(request.get).toHaveBeenCalledWith('/points/records', options);
      expect(result).toEqual(mockData);
    });
  });

  describe('dailySignin', () => {
    it('should call request.post with correct endpoint', async () => {
      const mockData = { success: true, points: 5 };
      request.post.mockResolvedValue(mockData);

      const result = await PointsService.dailySignin();

      expect(request.post).toHaveBeenCalledWith('/points/daily-signin');
      expect(result).toEqual(mockData);
    });
  });

  describe('getSigninInfo', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { signed: false, consecutiveDays: 0 };
      request.get.mockResolvedValue(mockData);

      const result = await PointsService.getSigninInfo();

      expect(request.get).toHaveBeenCalledWith('/points/signin-info');
      expect(result).toEqual(mockData);
    });
  });

  describe('getPointsMallProducts', () => {
    it('should call request.get with correct endpoint and options', async () => {
      const mockData = { products: [], total: 0 };
      const options = { categoryId: 'cat1', sort: 'points_asc', page: 1, pageSize: 20 };
      request.get.mockResolvedValue(mockData);

      const result = await PointsService.getPointsMallProducts(options);

      expect(request.get).toHaveBeenCalledWith('/points/mall/products', options);
      expect(result).toEqual(mockData);
    });
  });

  describe('exchangeProduct', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true, orderId: 'order123' };
      const exchangeData = { productId: 'prod123', quantity: 1, addressId: 'addr123' };
      request.post.mockResolvedValue(mockData);

      const result = await PointsService.exchangeProduct(exchangeData);

      expect(request.post).toHaveBeenCalledWith('/points/mall/exchange', exchangeData);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPointsStatistics', () => {
    it('should call request.get with correct endpoint and options', async () => {
      const mockData = { statistics: {} };
      const options = { period: 'month', startDate: '2023-01-01', endDate: '2023-01-31' };
      request.get.mockResolvedValue(mockData);

      const result = await PointsService.getPointsStatistics(options);

      expect(request.get).toHaveBeenCalledWith('/points/statistics', options);
      expect(result).toEqual(mockData);
    });
  });

  describe('transferPoints', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true, transactionId: 'trans123' };
      const transferData = { toUserId: 'user123', amount: 10, message: 'Test transfer' };
      request.post.mockResolvedValue(mockData);

      const result = await PointsService.transferPoints(transferData);

      expect(request.post).toHaveBeenCalledWith('/points/transfer', transferData);
      expect(result).toEqual(mockData);
    });
  });
});