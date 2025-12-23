/**
 * 文件名: distributeService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-03
 * 描述: 分销服务单元测试
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
const distributeService = require('../SutWxApp/services/distributeService');

describe('分销服务测试', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('管理员功能测试', () => {
    test('获取分销列表应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: [
          { id: 'distribute_1', userId: 'user_1', type: 'product', status: 'approved' },
          { id: 'distribute_2', userId: 'user_2', type: 'article', status: 'pending' }
        ],
        total: 2,
        page: 1,
        pageSize: 20
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getDistributeList({
        status: 'all',
        type: 'all',
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/distributes', {
        status: 'all',
        type: 'all',
        page: 1,
        pageSize: 20
      });
    });

    test('获取分销详情应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: { id: 'distribute_1', userId: 'user_1', type: 'product', status: 'approved' }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getDistributeDetail('distribute_1');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/distributes/distribute_1');
    });

    test('缺少分销ID应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(distributeService.getDistributeDetail('')).rejects.toThrow('分销ID不能为空');
      await expect(distributeService.getDistributeDetail(null)).rejects.toThrow('分销ID不能为空');
      await expect(distributeService.getDistributeDetail(undefined)).rejects.toThrow('分销ID不能为空');
    });

    test('审核通过分销应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.put.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.approveDistribute('distribute_1');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.put).toHaveBeenCalledWith('/distributes/distribute_1/approve');
    });

    test('拒绝分销应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.put.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.rejectDistribute('distribute_1', '不符合分销条件');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.put).toHaveBeenCalledWith('/distributes/distribute_1/reject', {
        reason: '不符合分销条件'
      });
    });

    test('删除分销应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.delete.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.deleteDistribute('distribute_1', '违规操作');

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.delete).toHaveBeenCalledWith('/distributes/distribute_1', {
        reason: '违规操作'
      });
    });

    test('获取分销统计信息应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          total: 100,
          pending: 20,
          approved: 70,
          rejected: 10
        }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getDistributeStats();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/distributes/stats');
    });

    test('获取分销规则应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          enableDistribute: true,
          commissionRate: 0.1,
          minOrderAmount: 100,
          maxCommissionAmount: 1000
        }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getDistributeRules();

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/distributes/rules');
    });

    test('更新分销规则应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = { success: true };
      mockRequest.put.mockResolvedValue(mockResponse);

      // 调用服务方法
      const rules = {
        enableDistribute: true,
        commissionRate: 0.15,
        minOrderAmount: 200
      };
      const result = await distributeService.updateDistributeRules(rules);

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.put).toHaveBeenCalledWith('/distributes/rules', rules);
    });
  });

  describe('用户功能测试', () => {
    test('用户申请分销应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          id: 'distribute_3',
          userId: 'user_3',
          type: 'product',
          status: 'pending'
        }
      };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const applyData = {
        userId: 'user_3',
        type: 'product',
        content: '我想申请产品分销'
      };
      const result = await distributeService.applyForDistribution(applyData);

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/distributes/apply', applyData);
    });

    test('缺少用户ID应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(distributeService.applyForDistribution({
        type: 'product',
        content: '我想申请产品分销'
      })).rejects.toThrow('用户ID和分销类型不能为空');
    });

    test('获取用户分销记录应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: [
          { id: 'distribute_1', type: 'product', status: 'approved', createTime: Date.now() },
          { id: 'distribute_2', type: 'article', status: 'pending', createTime: Date.now() }
        ],
        total: 2,
        page: 1,
        pageSize: 20
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getUserDistributionRecords({
        status: 'all',
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/user/distributes', {
        status: 'all',
        page: 1,
        pageSize: 20
      });
    });

    test('获取用户分销业绩应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          totalOrders: 50,
          totalAmount: 10000,
          totalCommission: 1000,
          monthOrders: 10,
          monthAmount: 2000,
          monthCommission: 200
        }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getUserDistributionPerformance({
        timeRange: 'all'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/user/distributes/performance', {
        timeRange: 'all'
      });
    });

    test('获取分销链接应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          link: 'https://example.com/distribute?userId=user_1&productId=product_1',
          shortLink: 'https://example.com/d/abc123'
        }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getDistributionLink({
        productId: 'product_1'
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/distributes/link', {
        productId: 'product_1'
      });
    });

    test('获取分销二维码应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          qrCodeUrl: 'https://example.com/qrcode/distribute_1.png',
          qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
        }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getDistributionQRCode({
        productId: 'product_1',
        size: 300
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/distributes/qrcode', {
        productId: 'product_1',
        articleId: undefined,
        size: 300
      });
    });

    test('获取分销收益应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'earning_1',
            orderId: 'order_1',
            amount: 100,
            commission: 10,
            createTime: Date.now()
          },
          {
            id: 'earning_2',
            orderId: 'order_2',
            amount: 200,
            commission: 20,
            createTime: Date.now()
          }
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        summary: {
          totalCommission: 30,
          totalOrders: 2
        }
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getDistributionEarnings({
        timeRange: 'month',
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/user/distributes/earnings', {
        timeRange: 'month',
        page: 1,
        pageSize: 20
      });
    });

    test('申请提现应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: {
          id: 'withdrawal_1',
          userId: 'user_1',
          amount: 100,
          method: 'wechat',
          status: 'pending',
          createTime: Date.now()
        }
      };
      mockRequest.post.mockResolvedValue(mockResponse);

      // 调用服务方法
      const withdrawalData = {
        amount: 100,
        method: 'wechat',
        account: 'wechat_account_1'
      };
      const result = await distributeService.applyWithdrawal(withdrawalData);

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.post).toHaveBeenCalledWith('/user/distributes/withdrawal', withdrawalData);
    });

    test('缺少提现金额应抛出错误', async () => {
      // 调用服务方法，预期会抛出错误
      await expect(distributeService.applyWithdrawal({
        method: 'wechat',
        account: 'wechat_account_1'
      })).rejects.toThrow('提现金额、提现方式和提现账户不能为空');
    });

    test('获取提现记录应调用正确的API', async () => {
      // 模拟API返回
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'withdrawal_1',
            amount: 100,
            method: 'wechat',
            status: 'approved',
            createTime: Date.now()
          },
          {
            id: 'withdrawal_2',
            amount: 200,
            method: 'alipay',
            status: 'pending',
            createTime: Date.now()
          }
        ],
        total: 2,
        page: 1,
        pageSize: 20
      };
      mockRequest.get.mockResolvedValue(mockResponse);

      // 调用服务方法
      const result = await distributeService.getWithdrawalRecords({
        status: 'all',
        page: 1,
        pageSize: 20
      });

      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(mockRequest.get).toHaveBeenCalledWith('/user/distributes/withdrawal/records', {
        status: 'all',
        page: 1,
        pageSize: 20
      });
    });
  });
});