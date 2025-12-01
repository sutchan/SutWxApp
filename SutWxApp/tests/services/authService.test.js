/**
 * 文件名: authService.test.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-01
 * 作者: Sut
 * 描述: 认证服务单元测试
 */

// 模拟依赖模块
jest.mock('../../utils/request', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

jest.mock('../../utils/store.js', () => ({
  commit: jest.fn()
}));

// 模拟微信API
jest.mock('wx', () => ({
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  showToast: jest.fn()
}));

const request = require('../../utils/request');
const store = require('../../utils/store.js');
const wx = require('wx');
const authService = require('../../services/authService');
const TOKEN_KEY = 'authToken';

describe('authService', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      // 准备测试数据
      const mockUser = { id: 1, username: 'testuser' };
      const mockToken = 'test-token-123';
      const mockResponse = { token: mockToken, user: mockUser };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await authService.login('testuser', 'password123');
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith(
        '/auth/login',
        { username: 'testuser', password: 'password123' },
        { needAuth: false }
      );
      expect(wx.setStorageSync).toHaveBeenCalledWith(TOKEN_KEY, mockToken);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', mockToken);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', mockUser);
    });

    it('should handle login failure', async () => {
      // 设置模拟返回值
      const mockError = new Error('Invalid credentials');
      request.post.mockRejectedValue(mockError);
      
      // 执行测试并验证结果
      await expect(authService.login('testuser', 'wrongpassword')).rejects.toThrow(mockError);
      expect(request.post).toHaveBeenCalled();
      expect(wx.setStorageSync).not.toHaveBeenCalled();
      expect(store.commit).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // 设置模拟返回值
      request.post.mockResolvedValue({});
      
      // 执行测试
      await authService.logout();
      
      // 验证结果
      expect(request.post).toHaveBeenCalledWith('/auth/logout');
      expect(wx.removeStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });

    it('should clear local data even if API call fails', async () => {
      // 设置模拟返回值
      request.post.mockRejectedValue(new Error('Logout failed'));
      
      // 执行测试
      await authService.logout();
      
      // 验证结果
      expect(request.post).toHaveBeenCalledWith('/auth/logout');
      expect(wx.removeStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });
  });

  describe('getToken', () => {
    it('should return token from storage', () => {
      // 设置模拟返回值
      const mockToken = 'test-token-123';
      wx.getStorageSync.mockReturnValue(mockToken);
      
      // 执行测试
      const result = authService.getToken();
      
      // 验证结果
      expect(result).toBe(mockToken);
      expect(wx.getStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
    });

    it('should return null if no token in storage', () => {
      // 设置模拟返回值
      wx.getStorageSync.mockReturnValue(null);
      
      // 执行测试
      const result = authService.getToken();
      
      // 验证结果
      expect(result).toBeNull();
      expect(wx.getStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if token exists', () => {
      // 设置模拟返回值
      wx.getStorageSync.mockReturnValue('test-token-123');
      
      // 执行测试
      const result = authService.isLoggedIn();
      
      // 验证结果
      expect(result).toBe(true);
    });

    it('should return false if no token exists', () => {
      // 设置模拟返回值
      wx.getStorageSync.mockReturnValue(null);
      
      // 执行测试
      const result = authService.isLoggedIn();
      
      // 验证结果
      expect(result).toBe(false);
    });
  });

  describe('checkSession', () => {
    it('should return true if session is valid', async () => {
      // 设置模拟返回值
      wx.getStorageSync.mockReturnValue('test-token-123');
      request.get.mockResolvedValue({});
      
      // 执行测试
      const result = await authService.checkSession();
      
      // 验证结果
      expect(result).toBe(true);
      expect(request.get).toHaveBeenCalledWith('/auth/check-session');
    });

    it('should return false if no token exists', async () => {
      // 设置模拟返回值
      wx.getStorageSync.mockReturnValue(null);
      
      // 执行测试
      const result = await authService.checkSession();
      
      // 验证结果
      expect(result).toBe(false);
      expect(request.get).not.toHaveBeenCalled();
    });

    it('should logout and return false if session is invalid', async () => {
      // 设置模拟返回值
      wx.getStorageSync.mockReturnValue('test-token-123');
      request.get.mockRejectedValue(new Error('Session expired'));
      
      // 执行测试
      const result = await authService.checkSession();
      
      // 验证结果
      expect(result).toBe(false);
      expect(request.get).toHaveBeenCalledWith('/auth/check-session');
      expect(wx.removeStorageSync).toHaveBeenCalledWith(TOKEN_KEY);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });
  });

  describe('getUserFavorites', () => {
    it('should return user favorites successfully', async () => {
      // 准备测试数据
      const mockFavorites = [{ id: 1, productId: 100 }, { id: 2, productId: 200 }];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockFavorites);
      
      // 执行测试
      const result = await authService.getUserFavorites();
      
      // 验证结果
      expect(result).toEqual(mockFavorites);
      expect(request.get).toHaveBeenCalledWith('/user/favorites');
    });

    it('should handle failure when getting user favorites', async () => {
      // 设置模拟返回值
      const mockError = new Error('Failed to get favorites');
      request.get.mockRejectedValue(mockError);
      
      // 执行测试并验证结果
      await expect(authService.getUserFavorites()).rejects.toThrow(mockError);
      expect(request.get).toHaveBeenCalledWith('/user/favorites');
    });
  });

  describe('getUserAddresses', () => {
    it('should return user addresses successfully', async () => {
      // 准备测试数据
      const mockAddresses = [{ id: 1, name: 'Test Address 1' }, { id: 2, name: 'Test Address 2' }];
      
      // 设置模拟返回值
      request.get.mockResolvedValue(mockAddresses);
      
      // 执行测试
      const result = await authService.getUserAddresses();
      
      // 验证结果
      expect(result).toEqual(mockAddresses);
      expect(request.get).toHaveBeenCalledWith('/user/addresses');
    });

    it('should handle failure when getting user addresses', async () => {
      // 设置模拟返回值
      const mockError = new Error('Failed to get addresses');
      request.get.mockRejectedValue(mockError);
      
      // 执行测试并验证结果
      await expect(authService.getUserAddresses()).rejects.toThrow(mockError);
      expect(request.get).toHaveBeenCalledWith('/user/addresses');
    });
  });

  describe('addUserAddress', () => {
    it('should add user address successfully', async () => {
      // 准备测试数据
      const mockAddress = { name: 'Test User', phone: '13800138000', address: 'Test Address' };
      const mockResponse = { id: 1, ...mockAddress };
      
      // 设置模拟返回值
      request.post.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await authService.addUserAddress(mockAddress);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.post).toHaveBeenCalledWith('/user/addresses', mockAddress);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '添加成功',
        icon: 'success'
      });
    });

    it('should handle failure when adding user address', async () => {
      // 准备测试数据
      const mockAddress = { name: 'Test User', phone: '13800138000', address: 'Test Address' };
      const mockError = new Error('Failed to add address');
      
      // 设置模拟返回值
      request.post.mockRejectedValue(mockError);
      
      // 执行测试并验证结果
      await expect(authService.addUserAddress(mockAddress)).rejects.toThrow(mockError);
      expect(request.post).toHaveBeenCalledWith('/user/addresses', mockAddress);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '添加失败',
        icon: 'none'
      });
    });
  });

  describe('updateUserAddress', () => {
    it('should update user address successfully', async () => {
      // 准备测试数据
      const addressId = 1;
      const mockAddress = { name: 'Updated User', phone: '13900139000', address: 'Updated Address' };
      const mockResponse = { id: addressId, ...mockAddress };
      
      // 设置模拟返回值
      request.put.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await authService.updateUserAddress(addressId, mockAddress);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.put).toHaveBeenCalledWith(`/user/addresses/${addressId}`, mockAddress);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '更新成功',
        icon: 'success'
      });
    });

    it('should handle failure when updating user address', async () => {
      // 准备测试数据
      const addressId = 1;
      const mockAddress = { name: 'Updated User', phone: '13900139000', address: 'Updated Address' };
      const mockError = new Error('Failed to update address');
      
      // 设置模拟返回值
      request.put.mockRejectedValue(mockError);
      
      // 执行测试并验证结果
      await expect(authService.updateUserAddress(addressId, mockAddress)).rejects.toThrow(mockError);
      expect(request.put).toHaveBeenCalledWith(`/user/addresses/${addressId}`, mockAddress);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '更新失败',
        icon: 'none'
      });
    });
  });

  describe('deleteUserAddress', () => {
    it('should delete user address successfully', async () => {
      // 准备测试数据
      const addressId = 1;
      const mockResponse = { success: true };
      
      // 设置模拟返回值
      request.delete.mockResolvedValue(mockResponse);
      
      // 执行测试
      const result = await authService.deleteUserAddress(addressId);
      
      // 验证结果
      expect(result).toEqual(mockResponse);
      expect(request.delete).toHaveBeenCalledWith(`/user/addresses/${addressId}`);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '删除成功',
        icon: 'success'
      });
    });

    it('should handle failure when deleting user address', async () => {
      // 准备测试数据
      const addressId = 1;
      const mockError = new Error('Failed to delete address');
      
      // 设置模拟返回值
      request.delete.mockRejectedValue(mockError);
      
      // 执行测试并验证结果
      await expect(authService.deleteUserAddress(addressId)).rejects.toThrow(mockError);
      expect(request.delete).toHaveBeenCalledWith(`/user/addresses/${addressId}`);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '删除失败',
        icon: 'none'
      });
    });
  });
});
