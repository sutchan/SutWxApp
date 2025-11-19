/**
 * Jest 设置文件
 * 用于在所有测试文件运行前配置全局模拟和环境
 */

// 设置全局wx对象模拟
global.wx = {
  request: jest.fn().mockResolvedValue({ data: {}, statusCode: 200 }),
  getStorageSync: jest.fn().mockReturnValue(null),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn(),
  login: jest.fn().mockResolvedValue({ code: 'mock-login-code' }),
  getUserInfo: jest.fn().mockResolvedValue({ userInfo: { openId: 'mock-openid' } }),
  uploadFile: jest.fn().mockResolvedValue({ data: {}, statusCode: 200 })
};

// 全局模拟console方法
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
