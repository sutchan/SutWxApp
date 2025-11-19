/**
 * wx.js - 微信小程序wx模块的模拟实现
 * 用于在测试环境中替代真实的wx对象
 */

module.exports = {
  // 网络请求
  request: jest.fn().mockResolvedValue({
    data: {},
    statusCode: 200,
    header: {},
    cookies: []
  }),

  // 存储相关
  getStorageSync: jest.fn().mockReturnValue(null),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),

  // 界面交互
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn().mockResolvedValue({ confirm: true, cancel: false }),
  showActionSheet: jest.fn().mockResolvedValue({ tapIndex: 0 }),

  // 导航相关
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),

  // 用户相关
  login: jest.fn().mockResolvedValue({
    code: 'mock-login-code',
    errMsg: 'login:ok'
  }),
  getUserInfo: jest.fn().mockResolvedValue({
    userInfo: {
      openId: 'mock-openid',
      nickName: 'Mock User',
      avatarUrl: 'https://example.com/avatar.jpg'
    },
    errMsg: 'getUserInfo:ok'
  }),

  // 文件上传
  uploadFile: jest.fn().mockResolvedValue({
    data: {},
    statusCode: 200,
    header: {},
    tempFilePath: 'mock-temp-file-path',
    errMsg: 'uploadFile:ok'
  }),

  // 其他常用方法
  getSystemInfoSync: jest.fn().mockReturnValue({
    platform: 'devtools',
    SDKVersion: '2.20.0',
    windowWidth: 375,
    windowHeight: 667
  }),
  getNetworkTypeSync: jest.fn().mockReturnValue({
    networkType: 'wifi'
  }),
  startPullDownRefresh: jest.fn(),
  stopPullDownRefresh: jest.fn()
};
