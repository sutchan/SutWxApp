// 模拟微信小程序wx对象
module.exports = {
  login: jest.fn().mockResolvedValue({ code: 'test-code' }),
  request: jest.fn().mockResolvedValue({ statusCode: 200, data: {} }),
  getStorageSync: jest.fn().mockReturnValue(null),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  navigateTo: jest.fn(),
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn().mockResolvedValue({ confirm: true })
};
