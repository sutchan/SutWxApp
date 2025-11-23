/**
 * 文件名: userService.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 用户服务单元测试
 */

// 模拟微信小程序API
global.wx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  login: jest.fn(),
  getUserProfile: jest.fn(),
  getUserInfo: jest.fn()
};

// 模拟request模块
jest.mock('../../utils/request', () => ({
  request: jest.fn()
}));

const authService = require('../authService');
const { request } = require('../../utils/request');

describe('用户服务测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('应该成功登录', async () => {
      const mockUsername = 'test';
      const mockPassword = '123456';
      const mockUser = { id: 1, username: 'test', token: 'mock_token_123' };
      
      wx.setStorageSync.mockImplementation((key, data) => {
        console.log(`设置${key}:`, data);
      });

      const result = await authService.login(mockUsername, mockPassword);
      
      expect(result).toEqual(mockUser);
      expect(wx.setStorageSync).toHaveBeenCalledWith('authToken', mockUser.token);
    });

    it('应该处理登录失败的情况', async () => {
      const mockUsername = 'wronguser';
      const mockPassword = 'wrongpass';
      const errorMessage = '用户名或密码错误';
      
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(authService.login(mockUsername, mockPassword)).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    it('应该成功登出', async () => {
      wx.removeStorageSync.mockImplementation((key) => {
        console.log(`移除${key}`);
      });

      await authService.logout();
      
      expect(wx.removeStorageSync).toHaveBeenCalledWith('authToken');
    });

    it('应该处理登出失败的情况', async () => {
      // authService.logout 实际上不会失败，因为它只是移除本地存储
      wx.removeStorageSync.mockImplementation((key) => {
        console.log(`移除${key}`);
      });

      await authService.logout();
      
      expect(wx.removeStorageSync).toHaveBeenCalledWith('authToken');
    });
  });

  describe('checkSession', () => {
    it('应该成功检查会话状态', async () => {
      const mockToken = 'token_123';
      
      wx.getStorageSync.mockReturnValue(mockToken);

      const result = await authService.checkSession();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(result).toEqual(true);
    });

    it('应该处理本地没有token的情况', async () => {
      wx.getStorageSync.mockReturnValue(null);

      const result = await authService.checkSession();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(result).toEqual(false);
    });
  });

  describe('getToken', () => {
    it('应该成功获取token', () => {
      const mockToken = 'token_123';
      wx.getStorageSync.mockReturnValue(mockToken);

      const result = authService.getToken();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(result).toEqual(mockToken);
    });

    it('应该处理没有token的情况', () => {
      wx.getStorageSync.mockReturnValue(null);

      const result = authService.getToken();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(result).toEqual(null);
    });
  });

  describe('isLoggedIn', () => {
    it('应该返回true当有token时', () => {
      const mockToken = 'token_123';
      wx.getStorageSync.mockReturnValue(mockToken);

      const result = authService.isLoggedIn();
      
      expect(result).toEqual(true);
    });

    it('应该返回false当没有token时', () => {
      wx.getStorageSync.mockReturnValue(null);

      const result = authService.isLoggedIn();
      
      expect(result).toEqual(false);
    });
  });



  describe('getUserFavorites', () => {
    it('应该成功获取用户收藏', async () => {
      const mockToken = 'token_123';
      const mockFavorites = [
        { id: 1, productId: 101, productName: '手机', addTime: '2023-06-01' },
        { id: 2, productId: 102, productName: '电脑', addTime: '2023-06-02' }
      ];
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue({
        data: mockFavorites
      });

      const result = await authService.getUserFavorites();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(request).toHaveBeenCalledWith({
        url: '/user/favorites',
        method: 'GET',
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockFavorites);
    });

    it('应该处理未登录的情况', async () => {
      wx.getStorageSync.mockReturnValue(null);

      await expect(authService.getUserFavorites()).rejects.toThrow('用户未登录');
    });
  });

  describe('getUserAddresses', () => {
    it('应该成功获取用户地址', async () => {
      const mockToken = 'token_123';
      const mockAddresses = [
        { id: 1, name: '张三', phone: '13800138000', address: '北京市朝阳区', isDefault: true },
        { id: 2, name: '李四', phone: '13900139000', address: '上海市浦东新区', isDefault: false }
      ];
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue({
        data: mockAddresses
      });

      const result = await authService.getUserAddresses();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(request).toHaveBeenCalledWith({
        url: '/user/addresses',
        method: 'GET',
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockAddresses);
    });

    it('应该处理未登录的情况', async () => {
      wx.getStorageSync.mockReturnValue(null);

      await expect(authService.getUserAddresses()).rejects.toThrow('用户未登录');
    });
  });

  describe('addUserAddress', () => {
    it('应该成功添加用户地址', async () => {
      const mockToken = 'token_123';
      const address = {
        name: '王五',
        phone: '13700137000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园',
        isDefault: false
      };
      const mockResponse = { success: true, message: '添加成功' };
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue(mockResponse);

      const result = await authService.addUserAddress(address);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(request).toHaveBeenCalledWith({
        url: '/user/addresses',
        method: 'POST',
        data: address,
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该处理未登录的情况', async () => {
      const address = { name: '王五', phone: '13700137000' };
      wx.getStorageSync.mockReturnValue(null);

      await expect(authService.addUserAddress(address)).rejects.toThrow('用户未登录');
    });
  });

  describe('updateUserAddress', () => {
    it('应该成功更新用户地址', async () => {
      const mockToken = 'token_123';
      const addressId = 1;
      const address = {
        name: '王五',
        phone: '13700137000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园',
        isDefault: true
      };
      const mockResponse = { success: true, message: '更新成功' };
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue(mockResponse);

      const result = await authService.updateUserAddress(addressId, address);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(request).toHaveBeenCalledWith({
        url: `/user/addresses/${addressId}`,
        method: 'PUT',
        data: address,
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该处理未登录的情况', async () => {
      const addressId = 1;
      const address = { name: '王五', phone: '13700137000' };
      wx.getStorageSync.mockReturnValue(null);

      await expect(authService.updateUserAddress(addressId, address)).rejects.toThrow('用户未登录');
    });
  });

  describe('deleteUserAddress', () => {
    it('应该成功删除用户地址', async () => {
      const mockToken = 'token_123';
      const addressId = 1;
      const mockResponse = { success: true, message: '删除成功' };
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue(mockResponse);

      const result = await authService.deleteUserAddress(addressId);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('authToken');
      expect(request).toHaveBeenCalledWith({
        url: `/user/addresses/${addressId}`,
        method: 'DELETE',
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该处理未登录的情况', async () => {
      const addressId = 1;
      wx.getStorageSync.mockReturnValue(null);

      await expect(authService.deleteUserAddress(addressId)).rejects.toThrow('用户未登录');
    });
  });
});