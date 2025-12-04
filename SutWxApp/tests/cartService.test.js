/**
 * 文件名: cartService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-03
 * 描述: 购物车服务单元测试
 */

const cartService = require('../services/cartService');

describe('cartService', () => {
  // 模拟wx对象
  global.wx = {
    request: jest.fn(),
    setStorageSync: jest.fn(),
    getStorageSync: jest.fn(),
    removeStorageSync: jest.fn()
  };

  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('getCartItems', () => {
    test('获取购物车列表成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: {
            items: [{ id: '1', productId: 'p1', quantity: 2 }, { id: '2', productId: 'p2', quantity: 1 }],
            total: 2
          }
        }
      });

      const result = await cartService.getCartItems();
      
      expect(result.success).toBe(true);
      expect(result.data.items).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/cart/items'),
        method: 'GET'
      }));
    });

    test('获取购物车列表失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '获取购物车列表失败'
        }
      });

      const result = await cartService.getCartItems();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('获取购物车列表失败');
    });
  });

  describe('addToCart', () => {
    test('添加商品到购物车成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { id: '3', productId: 'p3', quantity: 1 }
        }
      });

      const result = await cartService.addToCart({ productId: 'p3', quantity: 1 });
      
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('3');
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/cart/add'),
        method: 'POST',
        data: { productId: 'p3', quantity: 1 }
      }));
    });

    test('添加商品到购物车失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '添加商品失败'
        }
      });

      const result = await cartService.addToCart({ productId: 'p3', quantity: 1 });
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('添加商品失败');
    });
  });

  describe('updateCartItem', () => {
    test('更新购物车商品数量成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { id: '1', productId: 'p1', quantity: 3 }
        }
      });

      const result = await cartService.updateCartItem('1', 3);
      
      expect(result.success).toBe(true);
      expect(result.data.quantity).toBe(3);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/cart/update'),
        method: 'PUT',
        data: { cartItemId: '1', quantity: 3 }
      }));
    });

    test('更新购物车商品数量失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '更新失败'
        }
      });

      const result = await cartService.updateCartItem('1', 3);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('更新失败');
    });
  });

  describe('removeCartItem', () => {
    test('删除购物车商品成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { total: 1 }
        }
      });

      const result = await cartService.removeCartItem('1');
      
      expect(result.success).toBe(true);
      expect(result.data.total).toBe(1);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/cart/remove'),
        method: 'DELETE',
        data: { cartItemId: '1' }
      }));
    });

    test('删除购物车商品失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '删除失败'
        }
      });

      const result = await cartService.removeCartItem('1');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('删除失败');
    });
  });

  describe('clearCart', () => {
    test('清空购物车成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: { total: 0 }
        }
      });

      const result = await cartService.clearCart();
      
      expect(result.success).toBe(true);
      expect(result.data.total).toBe(0);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/cart/clear'),
        method: 'DELETE'
      }));
    });

    test('清空购物车失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '清空失败'
        }
      });

      const result = await cartService.clearCart();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('清空失败');
    });
  });
});