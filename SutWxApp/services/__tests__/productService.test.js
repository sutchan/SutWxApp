/**
 * 文件名: productService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 商品服务单元测试
 */

// 模拟微信小程序API
global.wx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn()
};

// 模拟request模块
jest.mock('../../utils/request', () => ({
  request: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const productService = require('../productService');
const { request, get, post, put, delete: del } = require('../../utils/request');

describe('商品服务测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductList', () => {
    it('应该成功获取商品列表', async () => {
      const options = { page: 1, pageSize: 10, category: 'electronics' };
      const mockProducts = [
        { id: 1, name: '手机', price: 2999, category: 'electronics' },
        { id: 2, name: '电脑', price: 5999, category: 'electronics' }
      ];
      
      request.mockResolvedValue({
        success: true,
        data: mockProducts,
        total: 2
      });

      const result = await productService.getProductList(options);
      
      expect(request).toHaveBeenCalledWith({
        url: '/products',
        method: 'GET',
        data: options
      });
      expect(result).toEqual({
        list: mockProducts,
        total: 2
      });
    });

    it('应该处理获取商品列表失败的情况', async () => {
      const options = { page: 1, pageSize: 10 };
      const errorMessage = '网络错误';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getProductList(options)).rejects.toThrow(errorMessage);
    });
  });

  describe('getProductDetail', () => {
    it('应该成功获取商品详情', async () => {
      const productId = 1;
      const mockProduct = {
        id: 1,
        name: '手机',
        price: 2999,
        description: '高性能智能手机',
        images: ['image1.jpg', 'image2.jpg']
      };
      
      request.mockResolvedValue({
        success: true,
        data: mockProduct
      });

      const result = await productService.getProductDetail(productId);
      
      expect(request).toHaveBeenCalledWith({
        url: `/products/${productId}`,
        method: 'GET'
      });
      expect(result).toEqual(mockProduct);
    });

    it('应该处理获取商品详情失败的情况', async () => {
      const productId = 999;
      const errorMessage = '商品不存在';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getProductDetail(productId)).rejects.toThrow(errorMessage);
    });
  });

  describe('searchProducts', () => {
    it('应该成功搜索商品', async () => {
      const keyword = '手机';
      const options = { page: 1, pageSize: 10, sort: 'price_asc' };
      const mockProducts = [
        { id: 1, name: '智能手机', price: 2999 },
        { id: 2, name: '老人手机', price: 599 }
      ];
      
      request.mockResolvedValue({
        success: true,
        data: mockProducts,
        total: 2
      });

      const result = await productService.searchProducts(keyword, options);
      
      expect(request).toHaveBeenCalledWith({
        url: '/products/search',
        method: 'GET',
        data: { keyword, ...options }
      });
      expect(result).toEqual({
        list: mockProducts,
        total: 2
      });
    });

    it('应该处理搜索商品失败的情况', async () => {
      const keyword = '不存在';
      const errorMessage = '搜索失败';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.searchProducts(keyword)).rejects.toThrow(errorMessage);
    });
  });

  describe('getProductCategories', () => {
    it('应该成功获取商品分类', async () => {
      const mockCategories = [
        { id: 1, name: '电子产品', icon: 'electronics.png' },
        { id: 2, name: '服装', icon: 'clothing.png' }
      ];
      
      request.mockResolvedValue({
        success: true,
        data: mockCategories
      });

      const result = await productService.getProductCategories();
      
      expect(request).toHaveBeenCalledWith({
        url: '/products/categories',
        method: 'GET'
      });
      expect(result).toEqual(mockCategories);
    });

    it('应该处理获取商品分类失败的情况', async () => {
      const errorMessage = '获取分类失败';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getProductCategories()).rejects.toThrow(errorMessage);
    });
  });

  describe('getProductReviews', () => {
    it('应该成功获取商品评价', async () => {
      const productId = 1;
      const options = { page: 1, pageSize: 10, rating: 5 };
      const mockReviews = [
        { id: 1, userId: 101, rating: 5, content: '非常好用' },
        { id: 2, userId: 102, rating: 5, content: '物超所值' }
      ];
      
      request.mockResolvedValue({
        success: true,
        data: mockReviews,
        total: 2
      });

      const result = await productService.getProductReviews(productId, options);
      
      expect(request).toHaveBeenCalledWith({
        url: `/products/${productId}/reviews`,
        method: 'GET',
        data: options
      });
      expect(result).toEqual({
        list: mockReviews,
        total: 2
      });
    });

    it('应该处理获取商品评价失败的情况', async () => {
      const productId = 1;
      const errorMessage = '获取评价失败';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getProductReviews(productId)).rejects.toThrow(errorMessage);
    });
  });

  describe('addProductReview', () => {
    it('应该成功添加商品评价', async () => {
      const productId = 1;
      const review = { rating: 5, content: '非常好用', images: ['review1.jpg'] };
      const mockResponse = { success: true, message: '评价成功' };
      
      request.mockResolvedValue(mockResponse);
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      const result = await productService.addProductReview(productId, review);
      
      expect(request).toHaveBeenCalledWith({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        data: review
      });
      expect(result).toEqual(mockResponse);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '评价成功',
        icon: 'success'
      });
    });

    it('应该处理添加商品评价失败的情况', async () => {
      const productId = 1;
      const review = { rating: 5, content: '非常好用' };
      const errorMessage = '评价失败';
      
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(productService.addProductReview(productId, review)).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '评价失败',
        icon: 'none'
      });
    });
  });

  describe('getProductRecommendations', () => {
    it('应该成功获取商品推荐', async () => {
      const productId = 1;
      const mockProducts = [
        { id: 2, name: '手机壳', price: 29 },
        { id: 3, name: '贴膜', price: 19 }
      ];
      
      request.mockResolvedValue({
        success: true,
        data: mockProducts
      });

      const result = await productService.getProductRecommendations(productId);
      
      expect(request).toHaveBeenCalledWith({
        url: `/products/${productId}/recommendations`,
        method: 'GET'
      });
      expect(result).toEqual(mockProducts);
    });

    it('应该处理获取商品推荐失败的情况', async () => {
      const productId = 1;
      const errorMessage = '获取推荐失败';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getProductRecommendations(productId)).rejects.toThrow(errorMessage);
    });
  });

  describe('getHotProducts', () => {
    it('应该成功获取热门商品', async () => {
      const options = { limit: 10, category: 'electronics' };
      const mockProducts = [
        { id: 1, name: '手机', price: 2999, sales: 1000 },
        { id: 2, name: '电脑', price: 5999, sales: 500 }
      ];
      
      request.mockResolvedValue({
        success: true,
        data: mockProducts
      });

      const result = await productService.getHotProducts(options);
      
      expect(request).toHaveBeenCalledWith({
        url: '/products/hot',
        method: 'GET',
        data: options
      });
      expect(result).toEqual(mockProducts);
    });

    it('应该处理获取热门商品失败的情况', async () => {
      const errorMessage = '获取热门商品失败';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getHotProducts()).rejects.toThrow(errorMessage);
    });
  });

  describe('getNewProducts', () => {
    it('应该成功获取最新商品', async () => {
      const options = { limit: 10, category: 'electronics' };
      const mockProducts = [
        { id: 3, name: '新款手机', price: 3999, createTime: '2023-06-01' },
        { id: 4, name: '新款电脑', price: 6999, createTime: '2023-06-02' }
      ];
      
      request.mockResolvedValue({
        success: true,
        data: mockProducts
      });

      const result = await productService.getNewProducts(options);
      
      expect(request).toHaveBeenCalledWith({
        url: '/products/new',
        method: 'GET',
        data: options
      });
      expect(result).toEqual(mockProducts);
    });

    it('应该处理获取最新商品失败的情况', async () => {
      const errorMessage = '获取最新商品失败';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getNewProducts()).rejects.toThrow(errorMessage);
    });
  });

  describe('getDiscountProducts', () => {
    it('应该成功获取折扣商品', async () => {
      const options = { limit: 10, category: 'electronics' };
      const mockProducts = [
        { id: 5, name: '特价手机', price: 1999, originalPrice: 2999, discount: 33 },
        { id: 6, name: '特价电脑', price: 3999, originalPrice: 5999, discount: 33 }
      ];
      
      request.mockResolvedValue({
        success: true,
        data: mockProducts
      });

      const result = await productService.getDiscountProducts(options);
      
      expect(request).toHaveBeenCalledWith({
        url: '/products/discount',
        method: 'GET',
        data: options
      });
      expect(result).toEqual(mockProducts);
    });

    it('应该处理获取折扣商品失败的情况', async () => {
      const errorMessage = '获取折扣商品失败';
      
      request.mockRejectedValue(new Error(errorMessage));

      await expect(productService.getDiscountProducts()).rejects.toThrow(errorMessage);
    });
  });

  describe('addToFavorites', () => {
    it('应该成功添加商品到收藏', async () => {
      const productId = 1;
      const mockResponse = { success: true, message: '收藏成功' };
      
      request.mockResolvedValue(mockResponse);
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      const result = await productService.addToFavorites(productId);
      
      expect(request).toHaveBeenCalledWith({
        url: `/products/${productId}/favorite`,
        method: 'POST'
      });
      expect(result).toEqual(mockResponse);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '收藏成功',
        icon: 'success'
      });
    });

    it('应该处理添加商品到收藏失败的情况', async () => {
      const productId = 1;
      const errorMessage = '收藏失败';
      
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(productService.addToFavorites(productId)).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '收藏失败',
        icon: 'none'
      });
    });
  });

  describe('removeFromFavorites', () => {
    it('应该成功从收藏中移除商品', async () => {
      const productId = 1;
      const mockResponse = { success: true, message: '取消收藏成功' };
      
      request.mockResolvedValue(mockResponse);
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      const result = await productService.removeFromFavorites(productId);
      
      expect(request).toHaveBeenCalledWith({
        url: `/products/${productId}/favorite`,
        method: 'DELETE'
      });
      expect(result).toEqual(mockResponse);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '取消收藏成功',
        icon: 'success'
      });
    });

    it('应该处理从收藏中移除商品失败的情况', async () => {
      const productId = 1;
      const errorMessage = '取消收藏失败';
      
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(productService.removeFromFavorites(productId)).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '取消收藏失败',
        icon: 'none'
      });
    });
  });
});