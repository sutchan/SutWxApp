/**
 * 用户服务单元测试
 * @file 用户服务单元测试
 * @version 1.0.0
 * @updateDate 2025-06-17
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
      const mockCode = 'test_code_123';
      const mockUserInfo = { nickName: '测试用户', avatarUrl: 'avatar.jpg' };
      const mockResponse = {
        success: true,
        data: { token: 'token_123', userId: 'user_123', userInfo: mockUserInfo }
      };
      
      wx.login.mockImplementation(({ success }) => {
        success({ code: mockCode });
      });
      request.mockResolvedValue(mockResponse);
      wx.setStorageSync.mockImplementation((key, data) => {
        console.log(`设置${key}:`, data);
      });

      const result = await authService.login();
      
      expect(wx.login).toHaveBeenCalled();
      expect(request).toHaveBeenCalledWith({
        url: '/auth/login',
        method: 'POST',
        data: { code: mockCode }
      });
      expect(result).toEqual(mockResponse.data);
      expect(wx.setStorageSync).toHaveBeenCalledWith('token', mockResponse.data.token);
      expect(wx.setStorageSync).toHaveBeenCalledWith('userInfo', mockResponse.data.userInfo);
    });

    it('应该处理登录失败的情况', async () => {
      const mockCode = 'test_code_123';
      const errorMessage = '登录失败';
      
      wx.login.mockImplementation(({ success }) => {
        success({ code: mockCode });
      });
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(authService.login()).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '登录失败',
        icon: 'none'
      });
    });
  });

  describe('logout', () => {
    it('应该成功登出', async () => {
      const mockResponse = { success: true, message: '登出成功' };
      
      request.mockResolvedValue(mockResponse);
      wx.removeStorageSync.mockImplementation((key) => {
        console.log(`移除${key}`);
      });
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      const result = await authService.logout();
      
      expect(request).toHaveBeenCalledWith({
        url: '/auth/logout',
        method: 'POST'
      });
      expect(result).toEqual(mockResponse);
      expect(wx.removeStorageSync).toHaveBeenCalledWith('token');
      expect(wx.removeStorageSync).toHaveBeenCalledWith('userInfo');
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '登出成功',
        icon: 'success'
      });
    });

    it('应该处理登出失败的情况', async () => {
      const errorMessage = '登出失败';
      
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(authService.logout()).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '登出失败',
        icon: 'none'
      });
    });
  });

  describe('checkSession', () => {
    it('应该成功检查会话状态', async () => {
      const mockToken = 'token_123';
      const mockResponse = { success: true, data: { valid: true } };
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue(mockResponse);

      const result = await authService.checkSession();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: '/auth/check-session',
        method: 'GET',
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('应该处理本地没有token的情况', async () => {
      wx.getStorageSync.mockReturnValue(null);

      const result = await authService.checkSession();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(result).toEqual({ valid: false });
    });

    it('应该处理检查会话失败的情况', async () => {
      const mockToken = 'token_123';
      const errorMessage = '会话已过期';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));
      wx.removeStorageSync.mockImplementation((key) => {
        console.log(`移除${key}`);
      });

      const result = await authService.checkSession();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: '/auth/check-session',
        method: 'GET',
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual({ valid: false });
      expect(wx.removeStorageSync).toHaveBeenCalledWith('token');
      expect(wx.removeStorageSync).toHaveBeenCalledWith('userInfo');
    });
  });

  describe('getUserProfile', () => {
    it('应该成功获取用户信息', async () => {
      const mockUserInfo = {
        nickName: '测试用户',
        avatarUrl: 'avatar.jpg',
        gender: 1,
        city: '北京',
        province: '北京',
        country: '中国'
      };
      
      wx.getUserProfile.mockImplementation(({ success }) => {
        success(mockUserInfo);
      });

      const result = await authService.getUserProfile();
      
      expect(wx.getUserProfile).toHaveBeenCalledWith({
        desc: '用于完善用户资料'
      });
      expect(result).toEqual(mockUserInfo);
    });

    it('应该处理用户拒绝授权的情况', async () => {
      const errorMessage = '用户拒绝授权';
      
      wx.getUserProfile.mockImplementation(({ fail }) => {
        fail(new Error(errorMessage));
      });
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(authService.getUserProfile()).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '获取用户信息失败',
        icon: 'none'
      });
    });
  });

  describe('updateUserInfo', () => {
    it('应该成功更新用户信息', async () => {
      const mockToken = 'token_123';
      const userInfo = { nickName: '新昵称', avatarUrl: 'new_avatar.jpg' };
      const mockResponse = { success: true, message: '更新成功' };
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue(mockResponse);
      wx.setStorageSync.mockImplementation((key, data) => {
        console.log(`设置${key}:`, data);
      });
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      const result = await authService.updateUserInfo(userInfo);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: '/user/profile',
        method: 'PUT',
        data: userInfo,
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse);
      expect(wx.setStorageSync).toHaveBeenCalledWith('userInfo', expect.objectContaining(userInfo));
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '更新成功',
        icon: 'success'
      });
    });

    it('应该处理更新用户信息失败的情况', async () => {
      const mockToken = 'token_123';
      const userInfo = { nickName: '新昵称' };
      const errorMessage = '更新失败';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(authService.updateUserInfo(userInfo)).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '更新失败',
        icon: 'none'
      });
    });
  });

  describe('getUserPoints', () => {
    it('应该成功获取用户积分', async () => {
      const mockToken = 'token_123';
      const mockResponse = {
        success: true,
        data: { total: 1000, available: 800, frozen: 200 }
      };
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue(mockResponse);

      const result = await authService.getUserPoints();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: '/user/points',
        method: 'GET',
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('应该处理获取用户积分失败的情况', async () => {
      const mockToken = 'token_123';
      const errorMessage = '获取积分失败';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));

      await expect(authService.getUserPoints()).rejects.toThrow(errorMessage);
    });
  });

  describe('getUserOrders', () => {
    it('应该成功获取用户订单', async () => {
      const mockToken = 'token_123';
      const options = { page: 1, pageSize: 10, status: 'completed' };
      const mockOrders = [
        { id: 1, status: 'completed', total: 299, createTime: '2023-06-01' },
        { id: 2, status: 'completed', total: 599, createTime: '2023-06-02' }
      ];
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue({
        success: true,
        data: mockOrders,
        total: 2
      });

      const result = await authService.getUserOrders(options);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: '/user/orders',
        method: 'GET',
        data: options,
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual({
        list: mockOrders,
        total: 2
      });
    });

    it('应该处理获取用户订单失败的情况', async () => {
      const mockToken = 'token_123';
      const errorMessage = '获取订单失败';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));

      await expect(authService.getUserOrders()).rejects.toThrow(errorMessage);
    });
  });

  describe('getUserFavorites', () => {
    it('应该成功获取用户收藏', async () => {
      const mockToken = 'token_123';
      const options = { page: 1, pageSize: 10 };
      const mockFavorites = [
        { id: 1, productId: 101, productName: '手机', addTime: '2023-06-01' },
        { id: 2, productId: 102, productName: '电脑', addTime: '2023-06-02' }
      ];
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue({
        success: true,
        data: mockFavorites,
        total: 2
      });

      const result = await authService.getUserFavorites(options);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: '/user/favorites',
        method: 'GET',
        data: options,
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual({
        list: mockFavorites,
        total: 2
      });
    });

    it('应该处理获取用户收藏失败的情况', async () => {
      const mockToken = 'token_123';
      const errorMessage = '获取收藏失败';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));

      await expect(authService.getUserFavorites()).rejects.toThrow(errorMessage);
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
        success: true,
        data: mockAddresses
      });

      const result = await authService.getUserAddresses();
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: '/user/addresses',
        method: 'GET',
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockAddresses);
    });

    it('应该处理获取用户地址失败的情况', async () => {
      const mockToken = 'token_123';
      const errorMessage = '获取地址失败';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));

      await expect(authService.getUserAddresses()).rejects.toThrow(errorMessage);
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
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      const result = await authService.addUserAddress(address);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: '/user/addresses',
        method: 'POST',
        data: address,
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '添加成功',
        icon: 'success'
      });
    });

    it('应该处理添加用户地址失败的情况', async () => {
      const mockToken = 'token_123';
      const address = { name: '王五', phone: '13700137000' };
      const errorMessage = '添加失败';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(authService.addUserAddress(address)).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '添加失败',
        icon: 'none'
      });
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
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      const result = await authService.updateUserAddress(addressId, address);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: `/user/addresses/${addressId}`,
        method: 'PUT',
        data: address,
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '更新成功',
        icon: 'success'
      });
    });

    it('应该处理更新用户地址失败的情况', async () => {
      const mockToken = 'token_123';
      const addressId = 1;
      const address = { name: '王五', phone: '13700137000' };
      const errorMessage = '更新失败';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(authService.updateUserAddress(addressId, address)).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '更新失败',
        icon: 'none'
      });
    });
  });

  describe('deleteUserAddress', () => {
    it('应该成功删除用户地址', async () => {
      const mockToken = 'token_123';
      const addressId = 1;
      const mockResponse = { success: true, message: '删除成功' };
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockResolvedValue(mockResponse);
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      const result = await authService.deleteUserAddress(addressId);
      
      expect(wx.getStorageSync).toHaveBeenCalledWith('token');
      expect(request).toHaveBeenCalledWith({
        url: `/user/addresses/${addressId}`,
        method: 'DELETE',
        header: { Authorization: `Bearer ${mockToken}` }
      });
      expect(result).toEqual(mockResponse);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '删除成功',
        icon: 'success'
      });
    });

    it('应该处理删除用户地址失败的情况', async () => {
      const mockToken = 'token_123';
      const addressId = 1;
      const errorMessage = '删除失败';
      
      wx.getStorageSync.mockReturnValue(mockToken);
      request.mockRejectedValue(new Error(errorMessage));
      wx.showToast.mockImplementation(({ title }) => {
        console.log(title);
      });

      await expect(authService.deleteUserAddress(addressId)).rejects.toThrow(errorMessage);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: '删除失败',
        icon: 'none'
      });
    });
  });
});