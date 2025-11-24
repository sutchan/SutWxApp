/**
 * 文件名: categoryService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: categoryService 的单元测试
 */

// 模拟请求模块
jest.mock('../../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const request = require('../../utils/request');
const categoryService = require('../categoryService');

describe('categoryService', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('getCategoryList', () => {
    it('should call request.get with correct endpoint and default options', async () => {
      const mockData = { categories: [], total: 0 };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryList();

      expect(request.get).toHaveBeenCalledWith('/api/categories', {
        parentId: 0,
        includeChildren: 0,
        includeProductCount: 0
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom options', async () => {
      const mockData = { categories: [], total: 0 };
      const options = { parentId: 1, includeChildren: true, includeProductCount: true };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryList(options);

      expect(request.get).toHaveBeenCalledWith('/api/categories', {
        parentId: 1,
        includeChildren: 1,
        includeProductCount: 1
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('getCategoryDetail', () => {
    it('should call request.get with correct endpoint and default options', async () => {
      const mockData = { id: 'cat1', name: 'Test Category' };
      const id = 'cat1';
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryDetail(id);

      expect(request.get).toHaveBeenCalledWith(`/api/categories/${id}`, {
        includeChildren: 0,
        includeParent: 0,
        includeProductCount: 0
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom options', async () => {
      const mockData = { id: 'cat1', name: 'Test Category' };
      const id = 'cat1';
      const options = { includeChildren: true, includeParent: true, includeProductCount: true };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryDetail(id, options);

      expect(request.get).toHaveBeenCalledWith(`/api/categories/${id}`, {
        includeChildren: 1,
        includeParent: 1,
        includeProductCount: 1
      });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when id is empty', async () => {
      await expect(categoryService.getCategoryDetail('')).rejects.toThrow('分类ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('getCategoryTree', () => {
    it('should call request.get with correct endpoint and default options', async () => {
      const mockData = { tree: [] };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryTree();

      expect(request.get).toHaveBeenCalledWith('/api/categories/tree', {
        maxLevel: 3,
        includeEmpty: 0,
        includeProductCount: 0
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom options', async () => {
      const mockData = { tree: [] };
      const options = { maxLevel: 2, includeEmpty: true, includeProductCount: true };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryTree(options);

      expect(request.get).toHaveBeenCalledWith('/api/categories/tree', {
        maxLevel: 2,
        includeEmpty: 1,
        includeProductCount: 1
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('getHotCategories', () => {
    it('should call request.get with correct endpoint and default limit', async () => {
      const mockData = { categories: [] };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getHotCategories();

      expect(request.get).toHaveBeenCalledWith('/api/categories/hot', {
        limit: 10
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom limit', async () => {
      const mockData = { categories: [] };
      const limit = 5;
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getHotCategories(limit);

      expect(request.get).toHaveBeenCalledWith('/api/categories/hot', {
        limit
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('getCategoryProducts', () => {
    it('should call request.get with correct endpoint and default options', async () => {
      const mockData = { products: [], total: 0 };
      const categoryId = 'cat1';
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryProducts(categoryId);

      expect(request.get).toHaveBeenCalledWith(`/api/categories/${categoryId}/products`, {
        limit: 10,
        sort: 'sales'
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom options', async () => {
      const mockData = { products: [], total: 0 };
      const categoryId = 'cat1';
      const options = { limit: 5, sort: 'price_asc' };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryProducts(categoryId, options);

      expect(request.get).toHaveBeenCalledWith(`/api/categories/${categoryId}/products`, {
        limit: 5,
        sort: 'price_asc'
      });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when categoryId is empty', async () => {
      await expect(categoryService.getCategoryProducts('')).rejects.toThrow('分类ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('searchCategories', () => {
    it('should call request.get with correct endpoint and default options', async () => {
      const mockData = { categories: [], total: 0 };
      const keyword = 'test';
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.searchCategories(keyword);

      expect(request.get).toHaveBeenCalledWith('/api/categories/search', {
        keyword,
        limit: 10,
        includeChildren: 0
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom options', async () => {
      const mockData = { categories: [], total: 0 };
      const keyword = 'test';
      const options = { limit: 5, includeChildren: true };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.searchCategories(keyword, options);

      expect(request.get).toHaveBeenCalledWith('/api/categories/search', {
        keyword,
        limit: 5,
        includeChildren: 1
      });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when keyword is empty', async () => {
      await expect(categoryService.searchCategories('')).rejects.toThrow('搜索关键词不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('getCategoryBreadcrumb', () => {
    it('should call request.get with correct endpoint', async () => {
      const mockData = { breadcrumb: [] };
      const categoryId = 'cat1';
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getCategoryBreadcrumb(categoryId);

      expect(request.get).toHaveBeenCalledWith(`/api/categories/${categoryId}/breadcrumb`);
      expect(result).toEqual(mockData);
    });

    it('should reject with error when categoryId is empty', async () => {
      await expect(categoryService.getCategoryBreadcrumb('')).rejects.toThrow('分类ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });

  describe('getSiblingCategories', () => {
    it('should call request.get with correct endpoint and default options', async () => {
      const mockData = { categories: [] };
      const categoryId = 'cat1';
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getSiblingCategories(categoryId);

      expect(request.get).toHaveBeenCalledWith(`/api/categories/${categoryId}/siblings`, {
        includeSelf: 0
      });
      expect(result).toEqual(mockData);
    });

    it('should call request.get with correct endpoint and custom options', async () => {
      const mockData = { categories: [] };
      const categoryId = 'cat1';
      const options = { includeSelf: true };
      request.get.mockResolvedValue(mockData);

      const result = await categoryService.getSiblingCategories(categoryId, options);

      expect(request.get).toHaveBeenCalledWith(`/api/categories/${categoryId}/siblings`, {
        includeSelf: 1
      });
      expect(result).toEqual(mockData);
    });

    it('should reject with error when categoryId is empty', async () => {
      await expect(categoryService.getSiblingCategories('')).rejects.toThrow('分类ID不能为空');
      expect(request.get).not.toHaveBeenCalled();
    });
  });
});