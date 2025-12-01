﻿/**
 * 文件名: cartService.test.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-01
 * 作者: Sut
 * 描述: 购物车服务单元测试
 */

// 模拟依赖模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const request = require('../../utils/request');
const cartService = require('../../services/cartService');

describe('cartService', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('getCartList', () => {
    it('should get cart list successfully', async () => {
      // 准备测试数据
      const mockResponse = {
        list: [{ id: 'cart1', productId: 'prod1', quantity: 2 }],
        total: 2,
        totalPrice: 100
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.getCartList();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/list', {}, {});
    });

    it('should get cart list with options', async () => {
      // 准备测试数据
      const mockResponse = {
        list: [{ id: 'cart1', productId: 'prod1', quantity: 2 }],
        total: 2,
        totalPrice: 100
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const options = { needAuth: false };
      const result = await cartService.getCartList(options);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/list', {}, options);
    });
  });

  describe('addToCart', () => {
    it('should add product to cart successfully', async () => {
      // 准备测试数据
      const mockData = {
        productId: 'prod1',
        quantity: 2,
        skuId: 'sku1',
        specifications: { color: 'red', size: 'M' }
      };
      const mockResponse = { success: true, cartId: 'cart1' };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.addToCart(mockData);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/add', mockData);
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update cart item quantity successfully', async () => {
      // 准备测试数据
      const cartId = 'cart1';
      const quantity = 3;
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.updateCartItemQuantity(cartId, quantity);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith(`/cart/item/${cartId}`, { quantity });
    });
  });

  describe('updateCartItemSpecifications', () => {
    it('should update cart item specifications successfully', async () => {
      // 准备测试数据
      const cartId = 'cart1';
      const specifications = { color: 'blue', size: 'L' };
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.updateCartItemSpecifications(cartId, specifications);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith(`/cart/item/${cartId}/specifications`, { specifications });
    });
  });

  describe('removeFromCart', () => {
    it('should remove single cart item successfully', async () => {
      // 准备测试数据
      const cartId = 'cart1';
      const mockResponse = { success: true, removedCount: 1 };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.removeFromCart(cartId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/remove', { cartIds: [cartId] });
    });

    it('should remove multiple cart items successfully', async () => {
      // 准备测试数据
      const cartIds = ['cart1', 'cart2', 'cart3'];
      const mockResponse = { success: true, removedCount: 3 };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.removeFromCart(cartIds);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/remove', { cartIds });
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', async () => {
      // 准备测试数据
      const mockResponse = { success: true, clearedCount: 5 };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.clearCart();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/clear');
    });
  });

  describe('updateCartItemSelection', () => {
    it('should update single cart item selection successfully', async () => {
      // 准备测试数据
      const cartId = 'cart1';
      const selected = true;
      const mockResponse = { success: true, updatedCount: 1 };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.updateCartItemSelection(cartId, selected);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith('/cart/selection', { cartIds: [cartId], selected });
    });

    it('should update multiple cart items selection successfully', async () => {
      // 准备测试数据
      const cartIds = ['cart1', 'cart2', 'cart3'];
      const selected = false;
      const mockResponse = { success: true, updatedCount: 3 };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.updateCartItemSelection(cartIds, selected);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith('/cart/selection', { cartIds, selected });
    });
  });

  describe('updateAllCartItemSelection', () => {
    it('should select all cart items successfully', async () => {
      // 准备测试数据
      const selected = true;
      const mockResponse = { success: true, updatedCount: 5 };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.updateAllCartItemSelection(selected);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith('/cart/selection/all', { selected });
    });
  });

  describe('getCartCount', () => {
    it('should get cart count successfully', async () => {
      // 准备测试数据
      const mockResponse = { count: 5 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.getCartCount();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/count');
    });
  });

  describe('getSelectedItemsTotal', () => {
    it('should get selected items total successfully', async () => {
      // 准备测试数据
      const mockResponse = { totalPrice: 200, totalQuantity: 4 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.getSelectedItemsTotal();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/total');
    });
  });

  describe('batchAddToCart', () => {
    it('should batch add items to cart successfully', async () => {
      // 准备测试数据
      const items = [
        { productId: 'prod1', quantity: 2, skuId: 'sku1' },
        { productId: 'prod2', quantity: 1, specifications: { color: 'red' } }
      ];
      const mockResponse = { success: true, addedCount: 2 };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.batchAddToCart(items);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/batch-add', { items });
    });
  });

  describe('moveToFavorite', () => {
    it('should move single cart item to favorite successfully', async () => {
      // 准备测试数据
      const cartId = 'cart1';
      const mockResponse = { success: true, movedCount: 1 };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.moveToFavorite(cartId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/move-to-favorite', { cartIds: [cartId] });
    });

    it('should move multiple cart items to favorite successfully', async () => {
      // 准备测试数据
      const cartIds = ['cart1', 'cart2', 'cart3'];
      const mockResponse = { success: true, movedCount: 3 };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.moveToFavorite(cartIds);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/move-to-favorite', { cartIds });
    });
  });

  describe('checkCartItemsStock', () => {
    it('should check single cart item stock successfully', async () => {
      // 准备测试数据
      const cartId = 'cart1';
      const mockResponse = { stockStatus: 'in_stock', cartItems: [{ cartId, stock: 10 }] };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.checkCartItemsStock(cartId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/check-stock', { cartIds: [cartId] });
    });

    it('should check multiple cart items stock successfully', async () => {
      // 准备测试数据
      const cartIds = ['cart1', 'cart2'];
      const mockResponse = {
        stockStatus: 'partial_out_of_stock',
        cartItems: [
          { cartId: 'cart1', stock: 0, status: 'out_of_stock' },
          { cartId: 'cart2', stock: 5, status: 'in_stock' }
        ]
      };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.checkCartItemsStock(cartIds);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/check-stock', { cartIds });
    });
  });

  describe('getInvalidItems', () => {
    it('should get invalid items successfully', async () => {
      // 准备测试数据
      const mockResponse = { invalidItems: [{ cartId: 'cart1', reason: 'expired' }] };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.getInvalidItems();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/invalid-items');
    });
  });

  describe('clearInvalidItems', () => {
    it('should clear invalid items successfully', async () => {
      // 准备测试数据
      const mockResponse = { success: true, clearedCount: 2 };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.clearInvalidItems();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/invalid-items');
    });
  });

  describe('applyCoupon', () => {
    it('should apply coupon to cart successfully', async () => {
      // 准备测试数据
      const couponId = 'coupon1';
      const mockResponse = { success: true, discount: 20 };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.applyCoupon(couponId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/cart/apply-coupon', { couponId });
    });
  });

  describe('removeCoupon', () => {
    it('should remove coupon from cart successfully', async () => {
      // 准备测试数据
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.removeCoupon();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith('/cart/coupon');
    });
  });

  describe('calculateShipping', () => {
    it('should calculate shipping successfully with default options', async () => {
      // 准备测试数据
      const mockResponse = { shippingFee: 10, estimatedDays: 3 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.calculateShipping();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/shipping', {});
    });

    it('should calculate shipping with regionId', async () => {
      // 准备测试数据
      const options = { regionId: 'region1' };
      const mockResponse = { shippingFee: 15, estimatedDays: 2 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await cartService.calculateShipping(options);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/cart/shipping', options);
    });
  });
});
