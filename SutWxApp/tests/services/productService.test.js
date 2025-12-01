/**
 * 文件名: productService.test.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-01
 * 作者: Sut
 * 描述: 产品服务单元测试
 */

// 模拟依赖模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

const request = require('../../utils/request');
const productService = require('../../services/productService');

describe('productService', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('getProductList', () => {
    it('should get product list with default parameters', async () => {
      // 准备测试数据
      const mockResponse = {
        list: [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }],
        total: 2,
        page: 1,
        pageSize: 20
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await productService.getProductList();
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/products', {
        categoryId: '',
        keyword: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        page: 1,
        pageSize: 20
      });
    });

    it('should get product list with custom parameters', async () => {
      // 准备测试数据
      const mockResponse = {
        list: [{ id: 1, name: 'Product 1' }],
        total: 1,
        page: 2,
        pageSize: 10
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await productService.getProductList({
        categoryId: 'cat123',
        keyword: 'test',
        minPrice: 100,
        maxPrice: 500,
        sort: 'price_asc',
        page: 2,
        pageSize: 10
      });
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/products', {
        categoryId: 'cat123',
        keyword: 'test',
        minPrice: 100,
        maxPrice: 500,
        sort: 'price_asc',
        page: 2,
        pageSize: 10
      });
    });
  });

  describe('getProductDetail', () => {
    it('should get product detail successfully', async () => {
      // 准备测试数据
      const mockProduct = { id: 'prod123', name: 'Test Product', price: 199 };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockProduct);
      
      // 执行测试
      const result = await productService.getProductDetail('prod123');
      
      // 验证结果
      expect(result).toEqual(mockProduct);
      expect(request.get).toHaveBeenCalledWith('/products/prod123');
    });

    it('should throw error when productId is empty', async () => {
      // 执行测试并验证结果
      await expect(productService.getProductDetail('')).rejects.toThrow('产品ID不能为空');
      await expect(productService.getProductDetail(null)).rejects.toThrow('产品ID不能为空');
      await expect(productService.getProductDetail(undefined)).rejects.toThrow('产品ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('searchProducts', () => {
    it('should search products successfully', async () => {
      // 准备测试数据
      const mockResponse = {
        list: [{ id: 1, name: 'Test Product' }],
        total: 1,
        page: 1,
        pageSize: 20
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await productService.searchProducts('test');
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/products/search', {
        keyword: 'test',
        page: 1,
        pageSize: 20,
        sort: 'newest'
      });
    });

    it('should search products with custom parameters', async () => {
      // 准备测试数据
      const mockResponse = {
        list: [{ id: 1, name: 'Test Product' }],
        total: 1,
        page: 3,
        pageSize: 10
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await productService.searchProducts('test', {
        page: 3,
        pageSize: 10,
        sort: 'price_desc'
      });
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.get).toHaveBeenCalledWith('/products/search', {
        keyword: 'test',
        page: 3,
        pageSize: 10,
        sort: 'price_desc'
      });
    });

    it('should throw error when keyword is empty', async () => {
      // 执行测试并验证结果
      await expect(productService.searchProducts('')).rejects.toThrow('搜索关键词不能为空');
      await expect(productService.searchProducts(null)).rejects.toThrow('搜索关键词不能为空');
      await expect(productService.searchProducts(undefined)).rejects.toThrow('搜索关键词不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('getProductCategories', () => {
    it('should get product categories successfully', async () => {
      // 准备测试数据
      const mockCategories = [
        { id: 'cat1', name: 'Category 1' },
        { id: 'cat2', name: 'Category 2' }
      ];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockCategories);
      
      // 执行测试
      const result = await productService.getProductCategories();
      
      // 验证结果
      expect(result).toEqual(mockCategories);
      expect(request.get).toHaveBeenCalledWith('/products/categories');
    });
  });

  describe('getProductReviews', () => {
    it('should get product reviews successfully', async () => {
      // 准备测试数据
      const mockReviews = {
        list: [{ id: 1, content: 'Great product!' }],
        total: 1,
        page: 1,
        pageSize: 10
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockReviews);
      
      // 执行测试
      const result = await productService.getProductReviews('prod123');
      
      // 验证结果
      expect(result).toEqual(mockReviews);
      expect(request.get).toHaveBeenCalledWith('/products/prod123/reviews', {
        page: 1,
        pageSize: 10,
        rating: '',
        hasImage: ''
      });
    });

    it('should get product reviews with custom parameters', async () => {
      // 准备测试数据
      const mockReviews = {
        list: [{ id: 1, content: 'Great product!', rating: 5 }],
        total: 1,
        page: 2,
        pageSize: 5
      };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockReviews);
      
      // 执行测试
      const result = await productService.getProductReviews('prod123', {
        page: 2,
        pageSize: 5,
        rating: 5,
        hasImage: true
      });
      
      // 验证结果
      expect(result).toEqual(mockReviews);
      expect(request.get).toHaveBeenCalledWith('/products/prod123/reviews', {
        page: 2,
        pageSize: 5,
        rating: 5,
        hasImage: 1
      });
    });

    it('should throw error when productId is empty', async () => {
      // 执行测试并验证结果
      await expect(productService.getProductReviews('')).rejects.toThrow('产品ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('getProductRecommendations', () => {
    it('should get product recommendations successfully', async () => {
      // 准备测试数据
      const mockRecommendations = [
        { id: 1, name: 'Recommended Product 1' },
        { id: 2, name: 'Recommended Product 2' }
      ];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockRecommendations);
      
      // 执行测试
      const result = await productService.getProductRecommendations('prod123');
      
      // 验证结果
      expect(result).toEqual(mockRecommendations);
      expect(request.get).toHaveBeenCalledWith('/products/prod123/recommendations', {
        limit: 10
      });
    });

    it('should get product recommendations with custom limit', async () => {
      // 准备测试数据
      const mockRecommendations = [{ id: 1, name: 'Recommended Product 1' }];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockRecommendations);
      
      // 执行测试
      const result = await productService.getProductRecommendations('prod123', 5);
      
      // 验证结果
      expect(result).toEqual(mockRecommendations);
      expect(request.get).toHaveBeenCalledWith('/products/prod123/recommendations', {
        limit: 5
      });
    });
  });

  describe('getHotProducts', () => {
    it('should get hot products successfully', async () => {
      // 准备测试数据
      const mockHotProducts = [
        { id: 1, name: 'Hot Product 1' },
        { id: 2, name: 'Hot Product 2' }
      ];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockHotProducts);
      
      // 执行测试
      const result = await productService.getHotProducts();
      
      // 验证结果
      expect(result).toEqual(mockHotProducts);
      expect(request.get).toHaveBeenCalledWith('/products/hot', { limit: 10 });
    });

    it('should get hot products with custom limit', async () => {
      // 准备测试数据
      const mockHotProducts = [{ id: 1, name: 'Hot Product 1' }];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockHotProducts);
      
      // 执行测试
      const result = await productService.getHotProducts(1);
      
      // 验证结果
      expect(result).toEqual(mockHotProducts);
      expect(request.get).toHaveBeenCalledWith('/products/hot', { limit: 1 });
    });
  });

  describe('getNewProducts', () => {
    it('should get new products successfully', async () => {
      // 准备测试数据
      const mockNewProducts = [
        { id: 1, name: 'New Product 1' },
        { id: 2, name: 'New Product 2' }
      ];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockNewProducts);
      
      // 执行测试
      const result = await productService.getNewProducts();
      
      // 验证结果
      expect(result).toEqual(mockNewProducts);
      expect(request.get).toHaveBeenCalledWith('/products/new', { limit: 10 });
    });
  });

  describe('getSearchHistory', () => {
    it('should get search history successfully', async () => {
      // 准备测试数据
      const mockHistory = ['test1', 'test2', 'test3'];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockHistory);
      
      // 执行测试
      const result = await productService.getSearchHistory();
      
      // 验证结果
      expect(result).toEqual(mockHistory);
      expect(request.get).toHaveBeenCalledWith('/products/search-history');
    });
  });

  describe('clearSearchHistory', () => {
    it('should clear search history successfully', async () => {
      // 准备测试数据
      const mockResult = { success: true };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResult);
      
      // 执行测试
      const result = await productService.clearSearchHistory();
      
      // 验证结果
      expect(result).toEqual(mockResult);
      expect(request.delete).toHaveBeenCalledWith('/products/search-history');
    });
  });

  describe('addSearchHistory', () => {
    it('should add search history successfully', async () => {
      // 准备测试数据
      const mockResult = { success: true };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResult);
      
      // 执行测试
      const result = await productService.addSearchHistory('test');
      
      // 验证结果
      expect(result).toEqual(mockResult);
      expect(request.post).toHaveBeenCalledWith('/products/search-history', { keyword: 'test' });
    });

    it('should throw error when keyword is empty', async () => {
      // 执行测试并验证结果
      await expect(productService.addSearchHistory('')).rejects.toThrow('搜索关键词不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('getFavoriteStatus', () => {
    it('should get favorite status successfully', async () => {
      // 准备测试数据
      const mockStatus = { isFavorite: true };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockStatus);
      
      // 执行测试
      const result = await productService.getFavoriteStatus('prod123');
      
      // 验证结果
      expect(result).toEqual(mockStatus);
      expect(request.get).toHaveBeenCalledWith('/products/prod123/favorite-status');
    });

    it('should throw error when productId is empty', async () => {
      // 执行测试并验证结果
      await expect(productService.getFavoriteStatus('')).rejects.toThrow('产品ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('addToFavorites', () => {
    it('should add product to favorites successfully', async () => {
      // 准备测试数据
      const mockResult = { success: true };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResult);
      
      // 执行测试
      const result = await productService.addToFavorites('prod123');
      
      // 验证结果
      expect(result).toEqual(mockResult);
      expect(request.post).toHaveBeenCalledWith('/favorites', { productId: 'prod123' });
    });

    it('should throw error when productId is empty', async () => {
      // 执行测试并验证结果
      await expect(productService.addToFavorites('')).rejects.toThrow('产品ID不能为空');
      expect(request.post).not.toHaveBeenCalled();
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove product from favorites successfully', async () => {
      // 准备测试数据
      const mockResult = { success: true };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResult);
      
      // 执行测试
      const result = await productService.removeFromFavorites('prod123');
      
      // 验证结果
      expect(result).toEqual(mockResult);
      expect(request.delete).toHaveBeenCalledWith('/favorites/prod123');
    });

    it('should throw error when productId is empty', async () => {
      // 执行测试并验证结果
      await expect(productService.removeFromFavorites('')).rejects.toThrow('产品ID不能为空');
      expect(request.delete).not.toHaveBeenCalled();
    });
  });

  describe('getProductStock', () => {
    it('should get product stock successfully', async () => {
      // 准备测试数据
      const mockStock = { stock: 100, skuStock: {} };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockStock);
      
      // 执行测试
      const result = await productService.getProductStock('prod123');
      
      // 验证结果
      expect(result).toEqual(mockStock);
      expect(request.get).toHaveBeenCalledWith('/products/prod123/stock', { skuId: '' });
    });

    it('should get product stock with skuId', async () => {
      // 准备测试数据
      const mockStock = { stock: 100, skuStock: { sku1: 50 } };
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockStock);
      
      // 执行测试
      const result = await productService.getProductStock('prod123', { skuId: 'sku1' });
      
      // 验证结果
      expect(result).toEqual(mockStock);
      expect(request.get).toHaveBeenCalledWith('/products/prod123/stock', { skuId: 'sku1' });
    });

    it('should throw error when productId is empty', async () => {
      // 执行测试并验证结果
      await expect(productService.getProductStock('')).rejects.toThrow('产品ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });
});
