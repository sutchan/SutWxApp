/**
 * 文件名: authService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-27
 * 描述: 认证服务测试用例
 */

const authService = require('../services/authService');

// 模拟wx对象
jest.mock('wx', () => ({
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  showToast: jest.fn()
}));

// 模拟store
jest.mock('../utils/store.js', () => ({
  getState: jest.fn(),
  commit: jest.fn()
}));

// 模拟Request
jest.mock('../utils/request', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

const Request = require('../utils/request');
const wx = require('wx');
const store = require('../utils/store.js');

describe('authService', () => {
  beforeEach(() => {
    // 清除所有模拟的调用和实例
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and save token', async () => {
      // 模拟请求成功
      const mockResponse = {
        token: 'test_token',
        user: { id: 1, username: 'test' }
      };
      Request.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test', '123456');

      // 验证请求是否正确调用
      expect(Request.post).toHaveBeenCalledWith('/auth/login', { username: 'test', password: '123456' }, { needAuth: false });
      // 验证token是否保存
      expect(wx.setStorageSync).toHaveBeenCalledWith('authToken', 'test_token');
      // 验证store是否更新
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', 'test_token');
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', { id: 1, username: 'test' });
      // 验证返回值
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when login fails', async () => {
      // 模拟请求失败
      const mockError = new Error('登录失败');
      Request.post.mockRejectedValue(mockError);

      await expect(authService.login('test', 'wrong_password')).rejects.toThrow('登录失败');
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear token', async () => {
      // 模拟请求成功
      Request.post.mockResolvedValue({});

      await authService.logout();

      // 验证请求是否正确调用
      expect(Request.post).toHaveBeenCalledWith('/auth/logout');
      // 验证token是否清除
      expect(wx.removeStorageSync).toHaveBeenCalledWith('authToken');
      // 验证store是否更新
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });

    it('should clear token even when logout request fails', async () => {
      // 模拟请求失败
      const mockError = new Error('登出失败');
      Request.post.mockRejectedValue(mockError);

      await authService.logout();

      // 验证token是否清除
      expect(wx.removeStorageSync).toHaveBeenCalledWith('authToken');
      // 验证store是否更新
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });
  });

  describe('getToken', () => {
    it('should return token from storage', () => {
      // 模拟存储中有token
      wx.getStorageSync.mockReturnValue('test_token');

      const token = authService.getToken();

      expect(token).toBe('test_token');
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
    });

    it('should return null when no token in storage', () => {
      // 模拟存储中没有token
      wx.getStorageSync.mockReturnValue('');

      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      // 模拟getToken返回token
      jest.spyOn(authService, 'getToken').mockReturnValue('test_token');

      const result = authService.isLoggedIn();

      expect(result).toBe(true);
    });

    it('should return false when no token', () => {
      // 模拟getToken返回null
      jest.spyOn(authService, 'getToken').mockReturnValue(null);

      const result = authService.isLoggedIn();

      expect(result).toBe(false);
    });
  });

  describe('checkSession', () => {
    it('should return false when no token', async () => {
      // 模拟getToken返回null
      jest.spyOn(authService, 'getToken').mockReturnValue(null);

      const result = await authService.checkSession();

      expect(result).toBe(false);
    });

    it('should return true when session is valid', async () => {
      // 模拟getToken返回token
      jest.spyOn(authService, 'getToken').mockReturnValue('test_token');
      // 模拟请求成功
      Request.get.mockResolvedValue({});

      const result = await authService.checkSession();

      expect(Request.get).toHaveBeenCalledWith('/auth/check-session');
      expect(result).toBe(true);
    });

    it('should return false and logout when session is invalid', async () => {
      // 模拟getToken返回token
      jest.spyOn(authService, 'getToken').mockReturnValue('test_token');
      // 模拟请求失败
      Request.get.mockRejectedValue(new Error('Session invalid'));
      // 模拟logout方法
      const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue();

      const result = await authService.checkSession();

      expect(Request.get).toHaveBeenCalledWith('/auth/check-session');
      expect(logoutSpy).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
