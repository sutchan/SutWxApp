/**
 * 文件名: cacheService.test.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-01
 * 作者: Sut
 * 描述: 缓存服务工具类单元测试
 */

// 模拟微信API
jest.mock('wx', () => ({
  getStorageInfo: jest.fn(),
  getStorage: jest.fn(),
  setStorage: jest.fn(),
  removeStorage: jest.fn(),
  downloadFile: jest.fn(),
  getFileInfo: jest.fn()
}));

const wx = require('wx');
const { instance: cacheService, CACHE_POLICY, CACHE_TYPE, EXPIRY_TIME } = require('../../utils/cacheService');

describe('cacheService', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });
  
  describe('CACHE_POLICY', () => {
    it('should define correct cache policy constants', () => {
      expect(CACHE_POLICY).toEqual({
        NO_CACHE: 'no_cache',
        CACHE_FIRST: 'cache_first',
        NETWORK_FIRST: 'network_first',
        CACHE_AND_NETWORK: 'cache_and_network'
      });
    });
  });
  
  describe('CACHE_TYPE', () => {
    it('should define correct cache type constants', () => {
      expect(CACHE_TYPE).toEqual({
        DATA: 'data',
        IMAGE: 'image',
        CONFIG: 'config',
        TEMP: 'temp'
      });
    });
  });
  
  describe('EXPIRY_TIME', () => {
    it('should define correct expiry time constants', () => {
      expect(EXPIRY_TIME).toEqual({
        SHORT: 5 * 60 * 1000,
        MEDIUM: 60 * 60 * 1000,
        LONG: 24 * 60 * 60 * 1000,
        WEEK: 7 * 24 * 60 * 60 * 1000,
        NEVER: null
      });
    });
  });
  
  describe('set', () => {
    it('should set cache data with metadata', async () => {
      // 设置模拟返回值
      wx.getStorageInfo.mockResolvedValue({ currentSize: 0 });
      
      // 执行测试
      await cacheService.set('test_key', 'test_value', {
        type: CACHE_TYPE.DATA,
        expiry: EXPIRY_TIME.MEDIUM
      });
      
      // 验证结果
      expect(wx.setStorage).toHaveBeenCalledTimes(2); // 一次数据，一次元数据
    });
    
    it('should handle cache with group', async () => {
      // 设置模拟返回值
      wx.getStorageInfo.mockResolvedValue({ currentSize: 0 });
      
      // 执行测试
      await cacheService.set('test_key', 'test_value', {
        type: CACHE_TYPE.DATA,
        group: 'test_group'
      });
      
      // 验证结果
      expect(wx.setStorage).toHaveBeenCalledTimes(2); // 一次数据，一次元数据
    });
  });
  
  describe('get', () => {
    it('should get cached data when it exists and is not expired', async () => {
      // 设置模拟返回值
      const mockData = 'test_value';
      const mockMeta = {
        type: CACHE_TYPE.DATA,
        group: null,
        createdAt: Date.now(),
        expiry: Date.now() + EXPIRY_TIME.MEDIUM
      };
      
      wx.getStorage.mockImplementation((options) => {
        if (options.key.includes('_meta')) {
          return Promise.resolve({ data: mockMeta });
        } else {
          return Promise.resolve({ data: mockData });
        }
      });
      
      // 执行测试
      const result = await cacheService.get('test_key');
      
      // 验证结果
      expect(result).toBe(mockData);
      expect(wx.getStorage).toHaveBeenCalledTimes(2);
    });
    
    it('should return null when cache is expired', async () => {
      // 设置模拟返回值
      const mockData = 'test_value';
      const mockMeta = {
        type: CACHE_TYPE.DATA,
        group: null,
        createdAt: Date.now() - EXPIRY_TIME.MEDIUM * 2,
        expiry: Date.now() - EXPIRY_TIME.MEDIUM
      };
      
      wx.getStorage.mockImplementation((options) => {
        if (options.key.includes('_meta')) {
          return Promise.resolve({ data: mockMeta });
        } else {
          return Promise.resolve({ data: mockData });
        }
      });
      
      // 执行测试
      const result = await cacheService.get('test_key');
      
      // 验证结果
      expect(result).toBeNull();
      expect(wx.removeStorage).toHaveBeenCalledTimes(2); // 移除过期的缓存和元数据
    });
    
    it('should return null when cache does not exist', async () => {
      // 设置模拟返回值
      wx.getStorage.mockRejectedValue({ errMsg: 'getStorage:fail' });
      
      // 执行测试
      const result = await cacheService.get('non_existent_key');
      
      // 验证结果
      expect(result).toBeNull();
    });
  });
  
  describe('remove', () => {
    it('should remove cache data and metadata', async () => {
      // 执行测试
      await cacheService.remove('test_key');
      
      // 验证结果
      expect(wx.removeStorage).toHaveBeenCalledTimes(2); // 一次数据，一次元数据
    });
  });
  
  describe('clear', () => {
    it('should clear all cache data', async () => {
      // 设置模拟返回值
      wx.getStorageInfo.mockResolvedValue({
        keys: ['sut_cache_data_test_key', 'sut_cache_data_test_key_meta', 'sut_cache_index']
      });
      
      // 执行测试
      await cacheService.clear();
      
      // 验证结果
      expect(wx.removeStorage).toHaveBeenCalledTimes(2); // 清除所有缓存键
      expect(wx.removeStorage).toHaveBeenCalledWith({ key: ['sut_cache_data_test_key', 'sut_cache_data_test_key_meta', 'sut_cache_index'] });
    });
  });
  
  describe('clearByType', () => {
    it('should clear cache by type', async () => {
      // 设置模拟返回值
      wx.getStorage.mockResolvedValue({ 
        data: {
          [CACHE_TYPE.DATA]: {
            all: ['test_key'],
            test_group: ['test_key']
          }
        }
      });
      
      // 执行测试
      await cacheService.clearByType(CACHE_TYPE.DATA);
      
      // 验证结果
      expect(wx.removeStorage).toHaveBeenCalled();
      expect(wx.setStorage).toHaveBeenCalled(); // 更新索引
    });
  });
  
  describe('clearByGroup', () => {
    it('should clear cache by group', async () => {
      // 设置模拟返回值
      wx.getStorage.mockResolvedValue({ 
        data: {
          [CACHE_TYPE.DATA]: {
            all: ['test_key'],
            test_group: ['test_key']
          }
        }
      });
      
      // 执行测试
      await cacheService.clearByGroup('test_group');
      
      // 验证结果
      expect(wx.removeStorage).toHaveBeenCalled();
      expect(wx.setStorage).toHaveBeenCalled(); // 更新索引
    });
  });
  
  describe('getCacheSize', () => {
    it('should return current cache size', async () => {
      // 设置模拟返回值
      const mockSize = 1024; // 1KB
      wx.getStorageInfo.mockResolvedValue({ currentSize: mockSize });
      
      // 执行测试
      const result = await cacheService.getCacheSize();
      
      // 验证结果
      expect(result).toBe(mockSize);
      expect(wx.getStorageInfo).toHaveBeenCalled();
    });
  });
  
  describe('cachedRequest', () => {
    it('should return cached data first when policy is CACHE_FIRST', async () => {
      // 设置模拟返回值
      const mockData = { id: 1, name: 'test' };
      const mockMeta = {
        type: CACHE_TYPE.DATA,
        group: null,
        createdAt: Date.now(),
        expiry: Date.now() + EXPIRY_TIME.MEDIUM
      };
      
      wx.getStorage.mockImplementation((options) => {
        if (options.key.includes('_meta')) {
          return Promise.resolve({ data: mockMeta });
        } else {
          return Promise.resolve({ data: mockData });
        }
      });
      
      // 执行测试
      const requestFn = jest.fn();
      const result = await cacheService.cachedRequest('test_url', requestFn, {
        policy: CACHE_POLICY.CACHE_FIRST
      });
      
      // 验证结果
      expect(result).toEqual(mockData);
      expect(requestFn).not.toHaveBeenCalled();
    });
    
    it('should fetch from network first when policy is NETWORK_FIRST', async () => {
      // 设置模拟返回值
      const mockData = { id: 1, name: 'test' };
      
      // 缓存不存在
      wx.getStorage.mockRejectedValue({ errMsg: 'getStorage:fail' });
      
      // 执行测试
      const requestFn = jest.fn().mockResolvedValue(mockData);
      const result = await cacheService.cachedRequest('test_url', requestFn, {
        policy: CACHE_POLICY.NETWORK_FIRST
      });
      
      // 验证结果
      expect(result).toEqual(mockData);
      expect(requestFn).toHaveBeenCalled();
    });
  });
  
  describe('cacheImage', () => {
    it('should return cached image path when it exists', async () => {
      // 设置模拟返回值
      const mockFilePath = 'wxfile://test/path/image.jpg';
      const mockMeta = {
        type: CACHE_TYPE.IMAGE,
        group: null,
        createdAt: Date.now(),
        expiry: Date.now() + EXPIRY_TIME.WEEK
      };
      
      wx.getStorage.mockImplementation((options) => {
        if (options.key.includes('_meta')) {
          return Promise.resolve({ data: mockMeta });
        } else {
          return Promise.resolve({ data: mockFilePath });
        }
      });
      
      wx.getFileInfo.mockResolvedValue({ exists: true });
      
      // 执行测试
      const result = await cacheService.cacheImage('https://example.com/image.jpg');
      
      // 验证结果
      expect(result).toBe(mockFilePath);
      expect(wx.downloadFile).not.toHaveBeenCalled();
    });
    
    it('should download image when it is not cached', async () => {
      // 设置模拟返回值
      const mockFilePath = 'wxfile://test/path/image.jpg';
      
      // 缓存不存在
      wx.getStorage.mockRejectedValue({ errMsg: 'getStorage:fail' });
      
      // 下载成功
      wx.downloadFile.mockResolvedValue({
        tempFilePath: mockFilePath,
        statusCode: 200
      });
      
      // 执行测试
      const result = await cacheService.cacheImage('https://example.com/image.jpg');
      
      // 验证结果
      expect(result).toBe(mockFilePath);
      expect(wx.downloadFile).toHaveBeenCalled();
      expect(wx.setStorage).toHaveBeenCalled(); // 缓存下载的图片
    });
    
    it('should return original url when download fails', async () => {
      // 设置模拟返回值
      // 缓存不存在
      wx.getStorage.mockRejectedValue({ errMsg: 'getStorage:fail' });
      
      // 下载失败
      wx.downloadFile.mockRejectedValue({ errMsg: 'downloadFile:fail' });
      
      // 执行测试
      const originalUrl = 'https://example.com/image.jpg';
      const result = await cacheService.cacheImage(originalUrl);
      
      // 验证结果
      expect(result).toBe(originalUrl);
      expect(wx.downloadFile).toHaveBeenCalled();
    });
  });
  
  describe('cacheImages', () => {
    it('should cache multiple images', async () => {
      // 设置模拟返回值
      const mockFilePath = 'wxfile://test/path/image.jpg';
      
      // 缓存不存在
      wx.getStorage.mockRejectedValue({ errMsg: 'getStorage:fail' });
      
      // 下载成功
      wx.downloadFile.mockResolvedValue({
        tempFilePath: mockFilePath,
        statusCode: 200
      });
      
      // 执行测试
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ];
      const result = await cacheService.cacheImages(urls);
      
      // 验证结果
      expect(result).toEqual([mockFilePath, mockFilePath]);
      expect(wx.downloadFile).toHaveBeenCalledTimes(2);
    });
  });
});
