/**
 * 文件名: searchService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 搜索服务单元测试
 */

const request = require('../../utils/request');
const searchService = require('../searchService');

// Mock request模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

describe('searchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('应该执行通用搜索', async () => {
      const mockResponse = {
        success: true,
        data: {
          results: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        keyword: '测试关键词',
        type: 'product',
        filters: { categoryId: '123', brandId: '456' },
        sort: 'price_asc',
        page: 1,
        pageSize: 10
      };
      
      const result = await searchService.search(options);
      
      expect(request.get).toHaveBeenCalledWith('/search', {
        keyword: '测试关键词',
        type: 'product',
        categoryId: '123',
        brandId: '456',
        sort: 'price_asc',
        page: 1,
        pageSize: 10
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { results: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.search();
      
      expect(request.get).toHaveBeenCalledWith('/search', {
        keyword: '',
        type: 'all',
        sort: '',
        page: 1,
        pageSize: 20
      });
    });
  });

  describe('searchProducts', () => {
    it('应该搜索商品', async () => {
      const mockResponse = {
        success: true,
        data: {
          products: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        keyword: '手机',
        categoryId: '123',
        brandId: '456',
        minPrice: '1000',
        maxPrice: '5000',
        sort: 'price_desc',
        page: 1,
        pageSize: 10
      };
      
      const result = await searchService.searchProducts(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/products', {
        keyword: '手机',
        categoryId: '123',
        brandId: '456',
        minPrice: '1000',
        maxPrice: '5000',
        sort: 'price_desc',
        page: 1,
        pageSize: 10
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { products: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.searchProducts();
      
      expect(request.get).toHaveBeenCalledWith('/search/products', {
        keyword: '',
        categoryId: '',
        brandId: '',
        minPrice: '',
        maxPrice: '',
        sort: 'default',
        page: 1,
        pageSize: 20
      });
    });
  });

  describe('searchArticles', () => {
    it('应该搜索文章', async () => {
      const mockResponse = {
        success: true,
        data: {
          articles: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        keyword: '微信小程序',
        categoryId: '123',
        tag: '技术',
        sort: 'views_desc',
        page: 1,
        pageSize: 10
      };
      
      const result = await searchService.searchArticles(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/articles', {
        keyword: '微信小程序',
        categoryId: '123',
        tag: '技术',
        sort: 'views_desc',
        page: 1,
        pageSize: 10
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { articles: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.searchArticles();
      
      expect(request.get).toHaveBeenCalledWith('/search/articles', {
        keyword: '',
        categoryId: '',
        tag: '',
        sort: 'default',
        page: 1,
        pageSize: 20
      });
    });
  });

  describe('searchUsers', () => {
    it('应该搜索用户', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        keyword: '张三',
        sort: 'fans_desc',
        page: 1,
        pageSize: 10
      };
      
      const result = await searchService.searchUsers(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/users', {
        keyword: '张三',
        sort: 'fans_desc',
        page: 1,
        pageSize: 10
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { users: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.searchUsers();
      
      expect(request.get).toHaveBeenCalledWith('/search/users', {
        keyword: '',
        sort: 'default',
        page: 1,
        pageSize: 20
      });
    });
  });

  describe('searchOrders', () => {
    it('应该搜索订单', async () => {
      const mockResponse = {
        success: true,
        data: {
          orders: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        keyword: '订单123',
        status: 'completed',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        sort: 'amount_desc',
        page: 1,
        pageSize: 10
      };
      
      const result = await searchService.searchOrders(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/orders', {
        keyword: '订单123',
        status: 'completed',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        sort: 'amount_desc',
        page: 1,
        pageSize: 10
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { orders: [] } };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.searchOrders();
      
      expect(request.get).toHaveBeenCalledWith('/search/orders', {
        keyword: '',
        status: '',
        startDate: '',
        endDate: '',
        sort: 'default',
        page: 1,
        pageSize: 20
      });
    });
  });

  describe('getSearchHistory', () => {
    it('应该获取搜索历史', async () => {
      const mockResponse = {
        success: true,
        data: [
          { keyword: '手机', type: 'product', createdAt: '2023-01-01' },
          { keyword: '微信小程序', type: 'article', createdAt: '2023-01-02' }
        ]
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        type: 'product',
        limit: 5
      };
      
      const result = await searchService.getSearchHistory(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/history', {
        type: 'product',
        limit: 5
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: [] };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.getSearchHistory();
      
      expect(request.get).toHaveBeenCalledWith('/search/history', {
        type: 'all',
        limit: 10
      });
    });
  });

  describe('addSearchHistory', () => {
    it('应该添加搜索历史', async () => {
      const mockResponse = { success: true, data: { added: true } };
      request.post.mockResolvedValue(mockResponse);
      
      const options = {
        keyword: '手机',
        type: 'product'
      };
      
      const result = await searchService.addSearchHistory(options);
      
      expect(request.post).toHaveBeenCalledWith('/search/history', {
        keyword: '手机',
        type: 'product'
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认类型', async () => {
      const mockResponse = { success: true, data: { added: true } };
      request.post.mockResolvedValue(mockResponse);
      
      await searchService.addSearchHistory({ keyword: '测试' });
      
      expect(request.post).toHaveBeenCalledWith('/search/history', {
        keyword: '测试',
        type: 'all'
      });
    });
  });

  describe('removeSearchHistory', () => {
    it('应该删除搜索历史', async () => {
      const mockResponse = { success: true, data: { removed: true } };
      request.delete.mockResolvedValue(mockResponse);
      
      const options = {
        keyword: '手机',
        type: 'product'
      };
      
      const result = await searchService.removeSearchHistory(options);
      
      expect(request.delete).toHaveBeenCalledWith('/search/history', {
        keyword: '手机',
        type: 'product'
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认类型', async () => {
      const mockResponse = { success: true, data: { removed: true } };
      request.delete.mockResolvedValue(mockResponse);
      
      await searchService.removeSearchHistory({ keyword: '测试' });
      
      expect(request.delete).toHaveBeenCalledWith('/search/history', {
        keyword: '测试',
        type: 'all'
      });
    });
  });

  describe('clearSearchHistory', () => {
    it('应该清空指定类型的搜索历史', async () => {
      const mockResponse = { success: true, data: { cleared: true } };
      request.delete.mockResolvedValue(mockResponse);
      
      const options = {
        type: 'product'
      };
      
      const result = await searchService.clearSearchHistory(options);
      
      expect(request.delete).toHaveBeenCalledWith('/search/history/clear', {
        type: 'product'
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该清空所有搜索历史', async () => {
      const mockResponse = { success: true, data: { cleared: true } };
      request.delete.mockResolvedValue(mockResponse);
      
      await searchService.clearSearchHistory();
      
      expect(request.delete).toHaveBeenCalledWith('/search/history/clear', {});
    });
  });

  describe('getHotKeywords', () => {
    it('应该获取热门搜索关键词', async () => {
      const mockResponse = {
        success: true,
        data: [
          { keyword: '手机', count: 1000 },
          { keyword: '电脑', count: 800 },
          { keyword: '耳机', count: 600 }
        ]
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        type: 'product',
        limit: 5
      };
      
      const result = await searchService.getHotKeywords(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/hot-keywords', {
        type: 'product',
        limit: 5
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: [] };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.getHotKeywords();
      
      expect(request.get).toHaveBeenCalledWith('/search/hot-keywords', {
        type: 'all',
        limit: 10
      });
    });
  });

  describe('getSearchSuggestions', () => {
    it('应该获取搜索建议', async () => {
      const mockResponse = {
        success: true,
        data: [
          { keyword: '手机壳' },
          { keyword: '手机膜' },
          { keyword: '手机充电器' }
        ]
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        keyword: '手机',
        type: 'product',
        limit: 3
      };
      
      const result = await searchService.getSearchSuggestions(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/suggestions', {
        keyword: '手机',
        type: 'product',
        limit: 3
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: [] };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.getSearchSuggestions();
      
      expect(request.get).toHaveBeenCalledWith('/search/suggestions', {
        keyword: '',
        type: 'all',
        limit: 5
      });
    });
  });

  describe('getSearchFilters', () => {
    it('应该获取搜索筛选条件', async () => {
      const mockResponse = {
        success: true,
        data: {
          categories: [
            { id: '1', name: '电子产品' },
            { id: '2', name: '服装' }
          ],
          brands: [
            { id: '1', name: '苹果' },
            { id: '2', name: '华为' }
          ],
          priceRanges: [
            { min: 0, max: 100, label: '0-100' },
            { min: 100, max: 500, label: '100-500' }
          ]
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        type: 'product'
      };
      
      const result = await searchService.getSearchFilters(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/filters', {
        type: 'product'
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认类型', async () => {
      const mockResponse = { success: true, data: {} };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.getSearchFilters();
      
      expect(request.get).toHaveBeenCalledWith('/search/filters', {
        type: 'product'
      });
    });
  });

  describe('saveSearchFilters', () => {
    it('应该保存搜索筛选条件', async () => {
      const mockResponse = { success: true, data: { saved: true } };
      request.post.mockResolvedValue(mockResponse);
      
      const options = {
        type: 'product',
        filters: {
          categoryId: '123',
          brandId: '456',
          minPrice: '1000',
          maxPrice: '5000'
        }
      };
      
      const result = await searchService.saveSearchFilters(options);
      
      expect(request.post).toHaveBeenCalledWith('/search/filters', {
        type: 'product',
        filters: {
          categoryId: '123',
          brandId: '456',
          minPrice: '1000',
          maxPrice: '5000'
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认参数', async () => {
      const mockResponse = { success: true, data: { saved: true } };
      request.post.mockResolvedValue(mockResponse);
      
      await searchService.saveSearchFilters();
      
      expect(request.post).toHaveBeenCalledWith('/search/filters', {
        type: 'product',
        filters: {}
      });
    });
  });

  describe('getSavedSearchFilters', () => {
    it('应该获取保存的搜索筛选条件', async () => {
      const mockResponse = {
        success: true,
        data: {
          filters: {
            categoryId: '123',
            brandId: '456',
            minPrice: '1000',
            maxPrice: '5000'
          },
          name: '我的筛选条件',
          createdAt: '2023-01-01'
        }
      };
      
      request.get.mockResolvedValue(mockResponse);
      
      const options = {
        type: 'product'
      };
      
      const result = await searchService.getSavedSearchFilters(options);
      
      expect(request.get).toHaveBeenCalledWith('/search/filters/saved', {
        type: 'product'
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该使用默认类型', async () => {
      const mockResponse = { success: true, data: {} };
      request.get.mockResolvedValue(mockResponse);
      
      await searchService.getSavedSearchFilters();
      
      expect(request.get).toHaveBeenCalledWith('/search/filters/saved', {
        type: 'product'
      });
    });
  });
});