/**
 * 文件名: productService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-03
 * 描述: 产品服务单元测试
 */

const productService = require('../services/productService');

describe('productService', () => {
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

  describe('getProductList', () => {
    test('获取产品列表成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: {
            products: [{ id: 'p1', name: '产品1' }, { id: 'p2', name: '产品2' }],
            total: 2,
            page: 1,
            pageSize: 20
          }
        }
      });

      const result = await productService.getProductList({ categoryId: 'c1', page: 1, pageSize: 20 });
      
      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/products'),
        method: 'GET',
        data: { categoryId: 'c1', page: 1, pageSize: 20 }
      }));
    });

    test('获取产品列表失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '获取产品列表失败'
        }
      });

      const result = await productService.getProductList();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('获取产品列表失败');
    });
  });

  describe('getProductDetail', () => {
    test('获取产品详情成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: {
            id: 'p1',
            name: '产品1',
            price: 100,
            description: '产品描述'
          }
        }
      });

      const result = await productService.getProductDetail('p1');
      
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('p1');
      expect(result.data.name).toBe('产品1');
      expect(result.data.price).toBe(100);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/products/p1'),
        method: 'GET'
      }));
    });

    test('获取产品详情失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '获取产品详情失败'
        }
      });

      const result = await productService.getProductDetail('p1');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('获取产品详情失败');
    });
  });

  describe('searchProducts', () => {
    test('搜索产品成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: {
            products: [{ id: 'p1', name: '产品1' }, { id: 'p2', name: '产品2' }],
            total: 2,
            page: 1,
            pageSize: 20
          }
        }
      });

      const result = await productService.searchProducts({ keyword: '产品', page: 1, pageSize: 20 });
      
      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/products/search'),
        method: 'GET',
        data: { keyword: '产品', page: 1, pageSize: 20 }
      }));
    });

    test('搜索产品失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '搜索产品失败'
        }
      });

      const result = await productService.searchProducts({ keyword: '产品' });
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('搜索产品失败');
    });
  });

  describe('getProductCategories', () => {
    test('获取产品分类成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: {
            categories: [{ id: 'c1', name: '分类1' }, { id: 'c2', name: '分类2' }]
          }
        }
      });

      const result = await productService.getProductCategories();
      
      expect(result.success).toBe(true);
      expect(result.data.categories).toHaveLength(2);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/product-categories'),
        method: 'GET'
      }));
    });

    test('获取产品分类失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '获取产品分类失败'
        }
      });

      const result = await productService.getProductCategories();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('获取产品分类失败');
    });
  });

  describe('getProductRecommendations', () => {
    test('获取产品推荐成功', async () => {
      // 模拟wx.request返回成功响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: true,
          data: {
            products: [{ id: 'p1', name: '推荐产品1' }, { id: 'p2', name: '推荐产品2' }]
          }
        }
      });

      const result = await productService.getProductRecommendations({ limit: 10 });
      
      expect(result.success).toBe(true);
      expect(result.data.products).toHaveLength(2);
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: expect.stringContaining('/products/recommendations'),
        method: 'GET',
        data: { limit: 10 }
      }));
    });

    test('获取产品推荐失败', async () => {
      // 模拟wx.request返回失败响应
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: {
          success: false,
          message: '获取产品推荐失败'
        }
      });

      const result = await productService.getProductRecommendations();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('获取产品推荐失败');
    });
  });
});