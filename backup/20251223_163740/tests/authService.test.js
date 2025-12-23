/**
 * 文件名: authService.test.js
 * 版本号: 1.0.4
 * 更新日期: 2025-12-04
 * 描述: 认证服务单元测试
 */

// 模拟request模块
const mockRequest = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

// 模拟utils/request
jest.mock('../SutWxApp/utils/request', () => mockRequest);

// 模拟store
const mockStore = {
  commit: jest.fn()
};
jest.mock('../SutWxApp/utils/store', () => mockStore);

// 导入要测试的模块
const authService = require('../SutWxApp/services/authService');

describe('AuthService测试', () => {
  beforeEach(() => {
    // 清除所有模拟调用
    jest.clearAllMocks();
  });

  describe('微信授权登录功能', () => {
    test('wechatLogin应正确处理完整登录流程', async () => {
      // 模拟登录成功响应
      const mockToken = 'test-token';
      const mockUser = {
        id: 1,
        nickName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      // 模拟request.post返回token和用户信息
      mockRequest.post.mockResolvedValueOnce({
        token: mockToken,
        user: mockUser
      });

      // 调用wechatLogin方法
      const result = await authService.wechatLogin();

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith(
        '/auth/wechat-login',
        expect.objectContaining({ code: expect.any(String) }),
        expect.objectContaining({ needAuth: false })
      );
      expect(mockStore.commit).toHaveBeenCalledWith('SET_TOKEN', mockToken);
      expect(mockStore.commit).toHaveBeenCalledWith('SET_USER_INFO', mockUser);
      expect(result).toEqual({
        token: mockToken,
        user: mockUser
      });
    });

    test('wechatLogin应在没有用户信息时尝试获取并更新', async () => {
      // 模拟第一次登录只返回token
      const mockToken = 'test-token';
      mockRequest.post.mockResolvedValueOnce({
        token: mockToken
      }).mockResolvedValueOnce({
        user: {
          id: 1,
          nickName: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          gender: 1
        }
      });

      // 调用wechatLogin方法
      const result = await authService.wechatLogin();

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledTimes(2);
      expect(mockStore.commit).toHaveBeenCalledWith('SET_TOKEN', mockToken);
      expect(mockStore.commit).toHaveBeenCalledWith('SET_USER_INFO', expect.any(Object));
    });
  });

  describe('普通登录功能', () => {
    test('login应正确处理用户名密码登录', async () => {
      // 模拟登录成功响应
      const mockToken = 'test-token';
      const mockUser = {
        id: 1,
        username: 'testuser'
      };

      mockRequest.post.mockResolvedValueOnce({
        token: mockToken,
        user: mockUser
      });

      // 调用login方法
      const result = await authService.login('testuser', 'password123');

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith(
        '/auth/login',
        { username: 'testuser', password: 'password123' },
        expect.objectContaining({ needAuth: false })
      );
      expect(mockStore.commit).toHaveBeenCalledWith('SET_TOKEN', mockToken);
      expect(mockStore.commit).toHaveBeenCalledWith('SET_USER_INFO', mockUser);
      expect(result).toEqual({
        token: mockToken,
        user: mockUser
      });
    });
  });

  describe('手机号登录功能', () => {
    test('loginWithPhone应正确处理手机号验证码登录', async () => {
      // 模拟登录成功响应
      const mockToken = 'test-token';
      const mockUser = {
        id: 1,
        phone: '13800138000'
      };

      mockRequest.post.mockResolvedValueOnce({
        token: mockToken,
        user: mockUser
      });

      // 调用loginWithPhone方法
      const result = await authService.loginWithPhone('13800138000', '123456');

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith(
        '/auth/login/phone',
        { phone: '13800138000', code: '123456' },
        expect.objectContaining({ needAuth: false })
      );
      expect(mockStore.commit).toHaveBeenCalledWith('SET_TOKEN', mockToken);
      expect(mockStore.commit).toHaveBeenCalledWith('SET_USER_INFO', mockUser);
      expect(result).toEqual({
        token: mockToken,
        user: mockUser
      });
    });
  });

  describe('登出功能', () => {
    test('logout应正确清除token和用户信息', async () => {
      // 模拟登出成功
      mockRequest.post.mockResolvedValueOnce({});

      // 调用logout方法
      await authService.logout();

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockStore.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(mockStore.commit).toHaveBeenCalledWith('SET_USER_INFO', null);
    });

    test('logout应处理登出失败情况', async () => {
      // 模拟登出失败
      mockRequest.post.mockRejectedValueOnce(new Error('Logout failed'));

      // 调用logout方法，应不抛出错误
      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('用户信息管理', () => {
    test('getUserInfo应获取并更新用户信息', async () => {
      // 模拟获取用户信息成功
      const mockUser = {
        id: 1,
        nickName: 'Test User',
        email: 'test@example.com'
      };

      mockRequest.get.mockResolvedValueOnce(mockUser);

      // 调用getUserInfo方法
      const result = await authService.getUserInfo();

      // 验证结果
      expect(mockRequest.get).toHaveBeenCalledWith('/user/info');
      expect(mockStore.commit).toHaveBeenCalledWith('SET_USER_INFO', mockUser);
      expect(result).toEqual(mockUser);
    });

    test('updateUserInfo应更新用户信息', async () => {
      // 模拟更新用户信息成功
      const mockUserInfo = {
        nickName: 'Updated User',
        gender: 2
      };
      const mockResponse = {
        id: 1,
        nickName: 'Updated User',
        gender: 2,
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      mockRequest.put.mockResolvedValueOnce(mockResponse);

      // 调用updateUserInfo方法
      const result = await authService.updateUserInfo(mockUserInfo);

      // 验证结果
      expect(mockRequest.put).toHaveBeenCalledWith('/user/info', mockUserInfo);
      expect(mockStore.commit).toHaveBeenCalledWith('SET_USER_INFO', mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('地址管理功能', () => {
    test('getUserAddresses应获取用户地址列表', async () => {
      // 模拟地址列表
      const mockAddresses = [
        {
          id: 1,
          name: '张三',
          phone: '13800138000',
          address: '北京市朝阳区'
        }
      ];

      mockRequest.get.mockResolvedValueOnce(mockAddresses);

      // 调用getUserAddresses方法
      const result = await authService.getUserAddresses();

      // 验证结果
      expect(mockRequest.get).toHaveBeenCalledWith('/user/addresses');
      expect(result).toEqual(mockAddresses);
    });

    test('addUserAddress应添加新地址', async () => {
      // 模拟添加地址请求
      const mockAddress = {
        name: '李四',
        phone: '13900139000',
        address: '上海市浦东新区'
      };
      const mockResponse = {
        id: 2,
        ...mockAddress
      };

      mockRequest.post.mockResolvedValueOnce(mockResponse);

      // 调用addUserAddress方法
      const result = await authService.addUserAddress(mockAddress);

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith('/user/addresses', mockAddress);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('其他功能', () => {
    test('isLoggedIn应正确判断登录状态', () => {
      // 模拟token存在
      jest.spyOn(authService, 'getToken').mockReturnValue('test-token');
      expect(authService.isLoggedIn()).toBe(true);

      // 模拟token不存在
      jest.spyOn(authService, 'getToken').mockReturnValue(null);
      expect(authService.isLoggedIn()).toBe(false);
    });

    test('sendVerificationCode应发送验证码', async () => {
      // 模拟发送验证码成功
      mockRequest.post.mockResolvedValueOnce({ success: true });

      // 调用sendVerificationCode方法
      const result = await authService.sendVerificationCode('13800138000');

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith('/auth/send-code', { phone: '13800138000', type: 'login' });
      expect(result).toEqual({ success: true });
    });
  });

  describe('密码重置功能', () => {
    test('sendVerificationCode应支持发送重置密码验证码', async () => {
      // 模拟发送验证码成功
      mockRequest.post.mockResolvedValueOnce({ success: true });

      // 调用sendVerificationCode方法，指定type为reset
      const result = await authService.sendVerificationCode('13800138000', 'reset');

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith('/auth/send-code', { phone: '13800138000', type: 'reset' });
      expect(result).toEqual({ success: true });
    });

    test('verifyResetCode应验证重置密码验证码', async () => {
      // 模拟验证验证码成功
      mockRequest.post.mockResolvedValueOnce({ success: true });

      // 调用verifyResetCode方法
      const result = await authService.verifyResetCode('13800138000', '123456');

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith(
        '/auth/verify-reset-code',
        { phone: '13800138000', code: '123456' },
        expect.objectContaining({ needAuth: false })
      );
      expect(result).toEqual({ success: true });
    });

    test('resetPassword应重置密码', async () => {
      // 模拟重置密码成功
      mockRequest.post.mockResolvedValueOnce({ success: true, message: '密码重置成功' });

      // 调用resetPassword方法
      const result = await authService.resetPassword('13800138000', '123456', 'newPassword123');

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith(
        '/auth/reset-password',
        { phone: '13800138000', code: '123456', newPassword: 'newPassword123' },
        expect.objectContaining({ needAuth: false })
      );
      expect(result).toEqual({ success: true, message: '密码重置成功' });
    });

    test('changePassword应修改密码', async () => {
      // 模拟修改密码成功
      mockRequest.post.mockResolvedValueOnce({ success: true, message: '密码修改成功' });

      // 调用changePassword方法
      const result = await authService.changePassword('oldPassword123', 'newPassword456');

      // 验证结果
      expect(mockRequest.post).toHaveBeenCalledWith(
        '/auth/change-password',
        { oldPassword: 'oldPassword123', newPassword: 'newPassword456' }
      );
      expect(result).toEqual({ success: true, message: '密码修改成功' });
    });
  });
});
