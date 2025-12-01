/**
 * 文件名 jest.setup.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 描述: Jest 娴嬭瘯鐜璁剧疆鏂囦欢
 */

// 妯℃嫙寰俊灏忕▼搴忕幆澧?global.wx = {
  // 瀛樺偍鐩稿叧
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  getStorageInfoSync: jest.fn(),
  
  // 缃戠粶璇锋眰
  request: jest.fn(),
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  
  // 濯掍綋鐩稿叧
  chooseImage: jest.fn(),
  previewImage: jest.fn(),
  getSystemInfoSync: jest.fn(),
  
  // 瀵艰埅鐩稿叧
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),
  reLaunch: jest.fn(),
  
  // 鐣岄潰鐩稿叧
  showToast: jest.fn(),
  showModal: jest.fn(),
  showLoading: jest.fn(),
  hideToast: jest.fn(),
  hideLoading: jest.fn(),
  showNavigationBarLoading: jest.fn(),
  hideNavigationBarLoading: jest.fn(),
  startPullDownRefresh: jest.fn(),
  stopPullDownRefresh: jest.fn(),
  
  // 璁惧鐩稿叧
  getSystemInfo: jest.fn(),
  getSystemInfoSync: jest.fn(() => ({
    platform: 'devtools',
    version: '7.0.0',
    SDKVersion: '2.10.0',
    windowWidth: 375,
    windowHeight: 667
  })),
  
  // 浣嶇疆鐩稿叧
  getLocation: jest.fn(),
  chooseLocation: jest.fn(),
  openLocation: jest.fn(),
  
  // 鏂囦欢鐩稿叧
  saveFile: jest.fn(),
  getFileInfo: jest.fn(),
  openDocument: jest.fn(),
  
  // 鏀粯鐩稿叧
  requestPayment: jest.fn(),
  
  // 鐧诲綍鐩稿叧
  login: jest.fn(),
  checkSession: jest.fn(),
  getUserInfo: jest.fn(),
  getUserProfile: jest.fn(),
  
  // 鍒嗕韩鐩稿叧
  showShareMenu: jest.fn(),
  hideShareMenu: jest.fn(),
  updateShareMenu: jest.fn(),
  onShareAppMessage: jest.fn(),
  
  // 璁剧疆鐩稿叧
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

// 妯℃嫙寰俊灏忕▼搴忕殑 Page 鍑芥暟
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

  // 灏嗘柟娉曞悎骞跺埌瀹炰緥涓?  Object.assign(pageInstance, options.methods || {});
  
  return pageInstance;
};

// 妯℃嫙寰俊灏忕▼搴忕殑 Component 鍑芥暟
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
      // 妯℃嫙浜嬩欢瑙﹀彂
      return { name, detail, options };
    }
  };

  // 灏?properties 鐨勯粯璁ゅ€煎悎骞跺埌 data 涓?  for (const key in componentInstance.properties) {
    if (componentInstance.properties[key] && componentInstance.properties[key].value !== undefined) {
      componentInstance.data[key] = componentInstance.properties[key].value;
    }
  }

  // 灏嗘柟娉曞悎骞跺埌瀹炰緥涓?  Object.assign(componentInstance, options.methods || {});
  
  return componentInstance;
};

// 妯℃嫙寰俊灏忕▼搴忕殑 App 鍑芥暟
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

// 妯℃嫙寰俊灏忕▼搴忕殑 getApp 鍑芥暟
global.getApp = () => ({
  globalData: {}
});

// 妯℃嫙寰俊灏忕▼搴忕殑 getCurrentPages 鍑芥暟
global.getCurrentPages = () => [];

// 妯℃嫙鎺у埗鍙拌緭鍑猴紝閬垮厤娴嬭瘯鏃惰緭鍑鸿繃澶氫俊鎭?global.console = {
  ...console,
  // 鍦ㄦ祴璇曚腑淇濈暀 error 鍜?warn锛岄潤榛?log 鍜?info
  log: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error
};