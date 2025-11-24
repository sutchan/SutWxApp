/**
 * 文件名: authService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: authService 的单元测试
 */

// 模拟微信小程序的 API
global.wx = {
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn()
};

const authService = require('../authService');

describe('authService', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      // 模拟正确的用户名和密码
      const username = 'test';
      const password = '123456';
      
      const result = await authService.login(username, password);
      
      expect(result).toEqual({
        id: 1,
        username: 'test',
        token: 'mock_token_123'
      });
      
      // 验证是否调用了 setStorageSync
      expect(wx.setStorageSync).toHaveBeenCalledWith('authToken', 'mock_token_123');
    });

    it('should reject with error for incorrect credentials', async () => {
      // 模拟错误的用户名和密码
      const username = 'wrong';
      const password = 'wrong';
      
      await expect(authService.login(username, password)).rejects.toThrow('用户名或密码错误');
      
      // 验证没有调用 setStorageSync
      expect(wx.setStorageSync).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await authService.logout();
      
      // 验证是否调用了 removeStorageSync
      expect(wx.removeStorageSync).toHaveBeenCalledWith('authToken');
    });
  });

  describe('getToken', () => {
    it('should return token when it exists', () => {
      // 模拟存储中有 token
      wx.getStorageSync.mockReturnValue('mock_token_123');
      
      const token = authService.getToken();
      
      expect(token).toBe('mock_token_123');
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
    });

    it('should return null when token does not exist', () => {
      // 模拟存储中没有 token
      wx.getStorageSync.mockReturnValue(null);
      
      const token = authService.getToken();
      
      expect(token).toBeNull();
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      // 模拟 getToken 返回 token
      wx.getStorageSync.mockReturnValue('mock_token_123');
      
      const isLoggedIn = authService.isLoggedIn();
      
      expect(isLoggedIn).toBe(true);
    });

    it('should return false when token does not exist', () => {
      // 模拟 getToken 返回 null
      wx.getStorageSync.mockReturnValue(null);
      
      const isLoggedIn = authService.isLoggedIn();
      
      expect(isLoggedIn).toBe(false);
    });
  });

  describe('checkSession', () => {
    it('should return true when token exists', async () => {
      // 模拟 getToken 返回 token
      wx.getStorageSync.mockReturnValue('mock_token_123');
      
      const isValid = await authService.checkSession();
      
      expect(isValid).toBe(true);
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
    });

    it('should return false when token does not exist', async () => {
      // 模拟 getToken 返回 null
      wx.getStorageSync.mockReturnValue(null);
      
      const isValid = await authService.checkSession();
      
      expect(isValid).toBe(false);
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
    });
  });
});