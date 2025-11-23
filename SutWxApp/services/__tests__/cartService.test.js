/**
 * 文件名: cartService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-06-17
 * 描述: cartService 的单元测试
 */

// 模拟 request 模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const request = require('../../utils/request');
const CartService = require('../cartService');

describe('CartService', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('getCartList', () => {
    it('should call request.get with correct parameters', async () => {
      const mockOptions = { page: 1, pageSize: 10 };
      const mockResponse = { data: [], total: 0 };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await CartService.getCartList(mockOptions);
      
      expect(request.get).toHaveBeenCalledWith('/cart/list', mockOptions);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addToCart', () => {
    it('should call request.post with correct parameters', async () => {
      const mockData = { productId: '123', quantity: 2 };
      const mockResponse = { success: true, cartId: 'cart_123' };
      
      request.post.mockResolvedValue(mockResponse);
      
      const result = await CartService.addToCart(mockData);
      
      expect(request.post).toHaveBeenCalledWith('/cart/add', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should call request.put with correct parameters', async () => {
      const cartId = 'cart_123';
      const quantity = 5;
      const mockResponse = { success: true };
      
      request.put.mockResolvedValue(mockResponse);
      
      const result = await CartService.updateCartItemQuantity(cartId, quantity);
      
      expect(request.put).toHaveBeenCalledWith(`/cart/item/${cartId}`, { quantity });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeFromCart', () => {
    it('should handle single cart ID', async () => {
      const cartId = 'cart_123';
      const mockResponse = { success: true };
      
      request.delete.mockResolvedValue(mockResponse);
      
      const result = await CartService.removeFromCart(cartId);
      
      expect(request.delete).toHaveBeenCalledWith('/cart/remove', { cartIds: [cartId] });
      expect(result).toEqual(mockResponse);
    });

    it('should handle array of cart IDs', async () => {
      const cartIds = ['cart_123', 'cart_456'];
      const mockResponse = { success: true };
      
      request.delete.mockResolvedValue(mockResponse);
      
      const result = await CartService.removeFromCart(cartIds);
      
      expect(request.delete).toHaveBeenCalledWith('/cart/remove', { cartIds });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateCartItemSelection', () => {
    it('should call request.put with correct parameters', async () => {
      const cartIds = ['cart_123', 'cart_456'];
      const selected = true;
      const mockResponse = { success: true };
      
      request.put.mockResolvedValue(mockResponse);
      
      const result = await CartService.updateCartItemSelection(cartIds, selected);
      
      expect(request.put).toHaveBeenCalledWith('/cart/selection', { 
        cartIds, 
        selected 
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCartCount', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockResponse = { count: 5 };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await CartService.getCartCount();
      
      expect(request.get).toHaveBeenCalledWith('/cart/count');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('batchAddToCart', () => {
    it('should call request.post with correct parameters', async () => {
      const items = [
        { productId: '123', quantity: 2 },
        { productId: '456', quantity: 1 }
      ];
      const mockResponse = { success: true, addedItems: 2 };
      
      request.post.mockResolvedValue(mockResponse);
      
      const result = await CartService.batchAddToCart(items);
      
      expect(request.post).toHaveBeenCalledWith('/cart/batch-add', { items });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('calculateShipping', () => {
    it('should call request.get with correct parameters', async () => {
      const options = { regionId: 'region_123' };
      const mockResponse = { shipping: 10 };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await CartService.calculateShipping(options);
      
      expect(request.get).toHaveBeenCalledWith('/cart/shipping', options);
      expect(result).toEqual(mockResponse);
    });

    it('should call request.get with default empty options', async () => {
      const mockResponse = { shipping: 0 };
      
      request.get.mockResolvedValue(mockResponse);
      
      const result = await CartService.calculateShipping();
      
      expect(request.get).toHaveBeenCalledWith('/cart/shipping', {});
      expect(result).toEqual(mockResponse);
    });
  });
});