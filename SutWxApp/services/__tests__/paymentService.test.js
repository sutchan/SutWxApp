/**
 * 文件名: paymentService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: paymentService 的单元测试
 */

// 模拟请求模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const request = require('../../utils/request');
const PaymentService = require('../paymentService');

describe('PaymentService', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true, paymentId: 'pay123' };
      const paymentData = { 
        items: [{ id: 'prod1', quantity: 2, price: 10 }], 
        totalAmount: 20, 
        couponId: 'coupon123',
        addressId: 'addr123',
        remark: 'Test order'
      };
      request.post.mockResolvedValue(mockData);

      const result = await PaymentService.createPayment(paymentData);

      expect(request.post).toHaveBeenCalledWith('/payment/create', paymentData);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPaymentMethods', () => {
    it('should call request.get with correct endpoint and options', async () => {
      const mockData = { methods: [{ id: 'wechat', name: '微信支付' }] };
      const options = { type: 'online' };
      request.get.mockResolvedValue(mockData);

      const result = await PaymentService.getPaymentMethods(options);

      expect(request.get).toHaveBeenCalledWith('/payment/methods', options);
      expect(result).toEqual(mockData);
    });

    it('should call request.get with default options when none provided', async () => {
      const mockData = { methods: [] };
      request.get.mockResolvedValue(mockData);

      const result = await PaymentService.getPaymentMethods();

      expect(request.get).toHaveBeenCalledWith('/payment/methods', {});
      expect(result).toEqual(mockData);
    });
  });

  describe('initiatePayment', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true, paymentUrl: 'https://example.com/pay' };
      const paymentData = { 
        orderId: 'order123', 
        paymentMethod: 'wechat',
        returnUrl: 'https://example.com/return',
        notifyUrl: 'https://example.com/notify'
      };
      request.post.mockResolvedValue(mockData);

      const result = await PaymentService.initiatePayment(paymentData);

      expect(request.post).toHaveBeenCalledWith('/payment/initiate', paymentData);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPaymentStatus', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { status: 'success', paidAt: '2023-01-01T00:00:00Z' };
      const paymentId = 'pay123';
      request.get.mockResolvedValue(mockData);

      const result = await PaymentService.getPaymentStatus(paymentId);

      expect(request.get).toHaveBeenCalledWith(`/payment/status/${paymentId}`);
      expect(result).toEqual(mockData);
    });
  });

  describe('cancelPayment', () => {
    it('should call request.post with correct endpoint', async () => {
      const mockData = { success: true };
      const paymentId = 'pay123';
      request.post.mockResolvedValue(mockData);

      const result = await PaymentService.cancelPayment(paymentId);

      expect(request.post).toHaveBeenCalledWith(`/payment/cancel/${paymentId}`);
      expect(result).toEqual(mockData);
    });
  });

  describe('requestRefund', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true, refundId: 'refund123' };
      const refundData = { 
        orderId: 'order123', 
        refundAmount: 10, 
        reason: '商品质量问题' 
      };
      request.post.mockResolvedValue(mockData);

      const result = await PaymentService.requestRefund(refundData);

      expect(request.post).toHaveBeenCalledWith('/payment/refund', refundData);
      expect(result).toEqual(mockData);
    });
  });

  describe('getRefundStatus', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { status: 'processing', refundAmount: 10 };
      const refundId = 'refund123';
      request.get.mockResolvedValue(mockData);

      const result = await PaymentService.getRefundStatus(refundId);

      expect(request.get).toHaveBeenCalledWith(`/payment/refund/status/${refundId}`);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPaymentHistory', () => {
    it('should call request.get with correct endpoint and options', async () => {
      const mockData = { payments: [], total: 0 };
      const options = { page: 1, pageSize: 20, status: 'success' };
      request.get.mockResolvedValue(mockData);

      const result = await PaymentService.getPaymentHistory(options);

      expect(request.get).toHaveBeenCalledWith('/payment/history', options);
      expect(result).toEqual(mockData);
    });
  });

  describe('getPaymentDetail', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { paymentId: 'pay123', amount: 100, status: 'success' };
      const paymentId = 'pay123';
      request.get.mockResolvedValue(mockData);

      const result = await PaymentService.getPaymentDetail(paymentId);

      expect(request.get).toHaveBeenCalledWith(`/payment/detail/${paymentId}`);
      expect(result).toEqual(mockData);
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('should call request.put with correct endpoint and data', async () => {
      const mockData = { success: true };
      const paymentMethod = 'wechat';
      request.put.mockResolvedValue(mockData);

      const result = await PaymentService.setDefaultPaymentMethod(paymentMethod);

      expect(request.put).toHaveBeenCalledWith('/payment/default-method', { paymentMethod });
      expect(result).toEqual(mockData);
    });
  });

  describe('bindPaymentAccount', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true, accountId: 'acc123' };
      const accountData = { 
        paymentMethod: 'alipay', 
        accountInfo: { account: 'test@example.com' } 
      };
      request.post.mockResolvedValue(mockData);

      const result = await PaymentService.bindPaymentAccount(accountData);

      expect(request.post).toHaveBeenCalledWith('/payment/bind-account', accountData);
      expect(result).toEqual(mockData);
    });
  });

  describe('prePayment', () => {
    it('should call request.post with correct endpoint and data', async () => {
      const mockData = { success: true, prePaymentId: 'prepay123' };
      const prePaymentData = { 
        items: [{ id: 'prod1', quantity: 1, price: 10 }], 
        totalAmount: 10 
      };
      request.post.mockResolvedValue(mockData);

      const result = await PaymentService.prePayment(prePaymentData);

      expect(request.post).toHaveBeenCalledWith('/payment/pre-payment', prePaymentData);
      expect(result).toEqual(mockData);
    });
  });
});