/**
 * 文件名: jest.setup.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: Jest 测试环境设置文件
 */

// 模拟微信小程序环境
global.wx = {
  // 存储相关
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  getStorageInfoSync: jest.fn(),
  
  // 网络请求
  request: jest.fn(),
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  
  // 媒体相关
  chooseImage: jest.fn(),
  previewImage: jest.fn(),
  getSystemInfoSync: jest.fn(),
  
  // 导航相关
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),
  reLaunch: jest.fn(),
  
  // 界面相关
  showToast: jest.fn(),
  showModal: jest.fn(),
  showLoading: jest.fn(),
  hideToast: jest.fn(),
  hideLoading: jest.fn(),
  showNavigationBarLoading: jest.fn(),
  hideNavigationBarLoading: jest.fn(),
  startPullDownRefresh: jest.fn(),
  stopPullDownRefresh: jest.fn(),
  
  // 设备相关
  getSystemInfo: jest.fn(),
  getSystemInfoSync: jest.fn(() => ({
    platform: 'devtools',
    version: '7.0.0',
    SDKVersion: '2.10.0',
    windowWidth: 375,
    windowHeight: 667
  })),
  
  // 位置相关
  getLocation: jest.fn(),
  chooseLocation: jest.fn(),
  openLocation: jest.fn(),
  
  // 文件相关
  saveFile: jest.fn(),
  getFileInfo: jest.fn(),
  openDocument: jest.fn(),
  
  // 支付相关
  requestPayment: jest.fn(),
  
  // 登录相关
  login: jest.fn(),
  checkSession: jest.fn(),
  getUserInfo: jest.fn(),
  getUserProfile: jest.fn(),
  
  // 分享相关
  showShareMenu: jest.fn(),
  hideShareMenu: jest.fn(),
  updateShareMenu: jest.fn(),
  onShareAppMessage: jest.fn(),
  
  // 设置相关
  openSetting: jest.fn(),
  getSetting: jest.fn(),
  authorize: jest.fn(),
  openBluetoothAdapter: jest.fn(),
  closeBluetoothAdapter: jest.fn(),
  getBluetoothAdapterState: jest.fn(),
  startBluetoothDevicesDiscovery: jest.fn(),
  stopBluetoothDevicesDiscovery: jest.fn(),
  getBluetoothDevices: jest.fn(),
  createBLEConnection: jest.fn(),
  closeBLEConnection: jest.fn(),
  getBLEDeviceServices: jest.fn(),
  getBLEDeviceCharacteristics: jest.fn(),
  readBLECharacteristicValue: jest.fn(),
  writeBLECharacteristicValue: jest.fn(),
  notifyBLECharacteristicValueChange: jest.fn()
};

// 模拟微信小程序的 Page 函数
global.Page = (options) => {
  const pageInstance = {
    data: { ...options.data },
    methods: options.methods || {},
    onLoad: options.onLoad,
    onUnload: options.onUnload,
    onShow: options.onShow,
    onHide: options.onHide,
    onReady: options.onReady,
    onPullDownRefresh: options.onPullDownRefresh,
    onReachBottom: options.onReachBottom,
    onPageScroll: options.onPageScroll,
    onShareAppMessage: options.onShareAppMessage,
    onResize: options.onResize,
    onTabItemTap: options.onTabItemTap,
    setData(newData, callback) {
      Object.assign(pageInstance.data, newData);
      if (typeof callback === 'function') {
        callback();
      }
    }
  };

  // 将方法合并到实例上
  Object.assign(pageInstance, options.methods || {});
  
  return pageInstance;
};

// 模拟微信小程序的 Component 函数
global.Component = (options) => {
  const componentInstance = {
    properties: options.properties || {},
    data: { ...options.data },
    methods: options.methods || {},
    behaviors: options.behaviors || [],
    created: options.created,
    attached: options.attached,
    ready: options.ready,
    moved: options.moved,
    detached: options.detached,
    relations: options.relations || {},
    externalClasses: options.externalClasses || [],
    options: options.options || {},
    lifetimes: options.lifetimes || {},
    pageLifetimes: options.pageLifetimes || {},
    setData(newData, callback) {
      Object.assign(componentInstance.data, newData);
      if (typeof callback === 'function') {
        callback();
      }
    },
    hasBehavior(behavior) {
      return componentInstance.behaviors.includes(behavior);
    },
    triggerEvent(name, detail, options) {
      // 模拟事件触发
      return { name, detail, options };
    }
  };

  // 将 properties 的默认值合并到 data 中
  for (const key in componentInstance.properties) {
    if (componentInstance.properties[key] && componentInstance.properties[key].value !== undefined) {
      componentInstance.data[key] = componentInstance.properties[key].value;
    }
  }

  // 将方法合并到实例上
  Object.assign(componentInstance, options.methods || {});
  
  return componentInstance;
};

// 模拟微信小程序的 App 函数
global.App = (options) => {
  const appInstance = {
    globalData: options.globalData || {},
    onLaunch: options.onLaunch,
    onShow: options.onShow,
    onHide: options.onHide,
    onError: options.onError,
    onPageNotFound: options.onPageNotFound,
    ...options.methods
  };
  
  return appInstance;
};

// 模拟微信小程序的 getApp 函数
global.getApp = () => ({
  globalData: {}
});

// 模拟微信小程序的 getCurrentPages 函数
global.getCurrentPages = () => [];

// 模拟控制台输出，避免测试时输出过多信息
global.console = {
  ...console,
  // 在测试中保留 error 和 warn，静默 log 和 info
  log: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error
};