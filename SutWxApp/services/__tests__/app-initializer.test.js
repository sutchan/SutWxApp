// 搴旂敤鍒濆鍖栨ā鍧楀崟鍏冩祴璇?const { AppInitializer, initializeServiceLayer, getService, getServiceLayerStatus } = require('../app-initializer');
const { ServiceIntegrator } = require('../service-integration');

// 妯℃嫙鎵€鏈変緷璧栨ā鍧楋紝閬垮厤瀹為檯瀵煎叆
jest.mock('../service-integration');

// 妯℃嫙utils鐩綍涓嬬殑鎵€鏈夋ā鍧楀鍏ワ紝閬垮厤ES6妯″潡鍏煎鎬ч棶棰?jest.mock('../../utils/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    initialize: jest.fn()
  }
}));

jest.mock('../../utils/auth-service', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  initialize: jest.fn()
}));

jest.mock('../../utils/config-service', () => ({
  getConfig: jest.fn(),
  setConfig: jest.fn(),
  initialize: jest.fn()
}));

// 妯℃嫙浣跨敤ES妯″潡璇硶鐨勬湇鍔?jest.mock('../../utils/article-service', () => ({
  default: {
    getArticles: jest.fn(),
    getArticleById: jest.fn()
  }
}));

jest.mock('../../utils/category-service', () => ({
  default: {
    getCategories: jest.fn()
  }
}));

jest.mock('../../utils/search-service', () => ({
  default: {
    search: jest.fn()
  }
}));

jest.mock('../../utils/comment-service', () => ({
  default: {
    getComments: jest.fn()
  }
}));

jest.mock('../../utils/notification-service', () => ({
  default: {
    getNotifications: jest.fn()
  }
}));

jest.mock('../../utils/analytics-service', () => ({
  default: {
    track: jest.fn()
  }
}));

jest.mock('../../utils/following-service', () => ({
  default: {
    getFollowings: jest.fn()
  }
}));

jest.mock('../../utils/user-service', () => ({
  default: {
    getUserProfile: jest.fn()
  }
}));

// 鐢靛晢鐩稿叧鏈嶅姟mock
jest.mock('../../utils/product-service', () => ({
  default: {
    getProducts: jest.fn()
  }
}));

jest.mock('../../utils/cart-service', () => ({
  default: {
    getCart: jest.fn()
  }
}));

jest.mock('../../utils/order-service', () => ({
  default: {
    getOrders: jest.fn()
  }
}));

jest.mock('../../utils/address-service', () => ({
  default: {
    getAddresses: jest.fn()
  }
}));

jest.mock('../../utils/payment-service', () => ({
  default: {
    processPayment: jest.fn()
  }
}));

jest.mock('../../utils/points-service', () => ({
  default: {
    getPoints: jest.fn()
  }
}));

jest.mock('../../utils/file-service', () => ({
  default: {
    uploadFile: jest.fn()
  }
}));

jest.mock('../../utils/feedback-service', () => ({
  default: {
    submitFeedback: jest.fn()
  }
}));

// 鍩虹宸ュ叿mock
jest.mock('../../utils/cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  removeCache: jest.fn(),
  CACHE_KEYS: {
    USER_TOKEN: 'user_token',
    USER_INFO: 'user_info'
  }
}));

jest.mock('../../utils/cache-service', () => ({
  default: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn()
  }
}));

describe('AppInitializer', () => {
  let appInitializer;
  let mockServiceIntegrator;
  
  beforeEach(() => {
    // 閲嶇疆鎵€鏈塵ock
    jest.clearAllMocks();
    
    // 鍒涘缓妯℃嫙鐨凷erviceIntegrator瀹炰緥
    mockServiceIntegrator = {
      initialize: jest.fn().mockResolvedValue(true),
      getService: jest.fn(),
      getInitializationStatus: jest.fn().mockReturnValue({
        initialized: true,
        initializationTime: Date.now(),
        error: null
      }),
      reinitialize: jest.fn().mockResolvedValue(true),
      getAllServices: jest.fn().mockReturnValue([])
    };
    
    // 璁㏒erviceIntegrator鏋勯€犲嚱鏁拌繑鍥炴ā鎷熷疄渚?    ServiceIntegrator.mockImplementation(() => mockServiceIntegrator);
    
    // 鍒涘缓AppInitializer瀹炰緥
    appInitializer = new AppInitializer();
  });

  describe('initialize', () => {
    test('should initialize app successfully', async () => {
      const appConfig = {
        apiBaseUrl: 'https://example.com/api',
        appName: 'TestApp',
        appVersion: '1.0.0',
        environment: 'development'
      };
      
      const result = await appInitializer.initialize(appConfig);
      
      // 楠岃瘉鍒濆鍖栬繃绋?      expect(ServiceIntegrator).toHaveBeenCalled();
      expect(mockServiceIntegrator.initialize).toHaveBeenCalledWith(appConfig);
      expect(appInitializer.isInitialized).toBe(true);
      expect(result).toBe(true);
    });

    test('should handle initialization failure', async () => {
      const appConfig = { appName: 'TestApp' };
      
      // 妯℃嫙鍒濆鍖栧け璐?      mockServiceIntegrator.initialize.mockResolvedValue(false);
      
      const result = await appInitializer.initialize(appConfig);
      
      expect(appInitializer.isInitialized).toBe(false);
      expect(result).toBe(false);
    });

    test('should handle initialization exception', async () => {
      const appConfig = { appName: 'TestApp' };
      
      // 妯℃嫙鍒濆鍖栨姏鍑哄紓甯?      const error = new Error('Initialization failed');
      mockServiceIntegrator.initialize.mockRejectedValue(error);
      
      const result = await appInitializer.initialize(appConfig);
      
      expect(appInitializer.isInitialized).toBe(false);
      expect(result).toBe(false);
      expect(appInitializer.lastError).toBe(error);
    });

    test('should handle initialization timeout', async () => {
      const appConfig = { appName: 'TestApp', initializationTimeout: 100 };
      
      // 妯℃嫙鍒濆鍖栬秴鏃?      mockServiceIntegrator.initialize.mockImplementation(() => {
        return new Promise(() => {
          // 姘歌繙涓峳esolve
        });
      });
      
      const result = await appInitializer.initialize(appConfig);
      
      expect(appInitializer.isInitialized).toBe(false);
      expect(result).toBe(false);
      expect(appInitializer.lastError).toBeInstanceOf(Error);
      expect(appInitializer.lastError.message).toContain('timeout');
    });
  });

  describe('reinitialize', () => {
    test('should reinitialize app successfully', async () => {
      // 鍏堝垵濮嬪寲
      appInitializer.isInitialized = true;
      
      const appConfig = { appName: 'TestApp', appVersion: '1.1.0' };
      
      const result = await appInitializer.reinitialize(appConfig);
      
      expect(mockServiceIntegrator.reinitialize).toHaveBeenCalledWith(appConfig);
      expect(result).toBe(true);
    });

    test('should handle reinitialization failure', async () => {
      // 鍏堝垵濮嬪寲
      appInitializer.isInitialized = true;
      
      const appConfig = { appName: 'TestApp' };
      
      // 妯℃嫙閲嶆柊鍒濆鍖栧け璐?      mockServiceIntegrator.reinitialize.mockResolvedValue(false);
      
      const result = await appInitializer.reinitialize(appConfig);
      
      expect(appInitializer.isInitialized).toBe(false);
      expect(result).toBe(false);
    });
  });

  describe('shutdown', () => {
    test('should shutdown app successfully', () => {
      // 鍏堝垵濮嬪寲
      appInitializer.isInitialized = true;
      appInitializer.serviceIntegrator = mockServiceIntegrator;
      
      const result = appInitializer.shutdown();
      
      expect(appInitializer.isInitialized).toBe(false);
      expect(appInitializer.serviceIntegrator).toBeNull();
      expect(appInitializer.lastError).toBeNull();
      expect(result).toBe(true);
    });

    test('should return true if app is not initialized', () => {
      appInitializer.isInitialized = false;
      
      const result = appInitializer.shutdown();
      
      expect(result).toBe(true);
    });
  });

  describe('getService', () => {
    test('should return service from service integrator', () => {
      appInitializer.serviceIntegrator = mockServiceIntegrator;
      
      const mockService = { name: 'testService' };
      mockServiceIntegrator.getService.mockReturnValue(mockService);
      
      const result = appInitializer.getService('testService');
      
      expect(mockServiceIntegrator.getService).toHaveBeenCalledWith('testService');
      expect(result).toBe(mockService);
    });

    test('should return null if service integrator is not available', () => {
      appInitializer.serviceIntegrator = null;
      
      const result = appInitializer.getService('testService');
      
      expect(result).toBeNull();
    });
  });

  describe('getStatus', () => {
    test('should return initialization status', () => {
      appInitializer.isInitialized = true;
      appInitializer.serviceIntegrator = mockServiceIntegrator;
      appInitializer.initializationTime = Date.now();
      
      const mockStatus = {
        initialized: true,
        initializationTime: Date.now(),
        error: null
      };
      mockServiceIntegrator.getInitializationStatus.mockReturnValue(mockStatus);
      
      const status = appInitializer.getStatus();
      
      expect(mockServiceIntegrator.getInitializationStatus).toHaveBeenCalled();
      expect(status).toEqual({
        initialized: true,
        initializationTime: appInitializer.initializationTime,
        lastError: null,
        serviceStatus: mockStatus
      });
    });

    test('should return status when app is not initialized', () => {
      appInitializer.isInitialized = false;
      appInitializer.lastError = new Error('Test error');
      
      const status = appInitializer.getStatus();
      
      expect(status).toEqual({
        initialized: false,
        initializationTime: null,
        lastError: appInitializer.lastError,
        serviceStatus: null
      });
    });
  });

  describe('Static utility functions', () => {
    beforeEach(() => {
      // 璁剧疆榛樿鐨刟ppInitializer瀹炰緥
      AppInitializer.defaultInitializer = appInitializer;
    });

    test('initializeServiceLayer should initialize default initializer', async () => {
      const appConfig = { appName: 'TestApp' };
      
      const result = await initializeServiceLayer(appConfig);
      
      expect(appInitializer.initialize).toHaveBeenCalledWith(appConfig);
      expect(result).toBe(true);
    });

    test('getService should get service from default initializer', () => {
      const mockService = { name: 'testService' };
      mockServiceIntegrator.getService.mockReturnValue(mockService);
      
      const result = getService('testService');
      
      expect(appInitializer.getService).toHaveBeenCalledWith('testService');
      expect(result).toBe(mockService);
    });

    test('getServiceLayerStatus should get status from default initializer', () => {
      const mockStatus = {
        initialized: true,
        initializationTime: Date.now(),
        lastError: null,
        serviceStatus: {}
      };
      appInitializer.getStatus = jest.fn().mockReturnValue(mockStatus);
      
      const status = getServiceLayerStatus();
      
      expect(appInitializer.getStatus).toHaveBeenCalled();
      expect(status).toBe(mockStatus);
    });
  });

  describe('Initialization events', () => {
    test('should trigger onInitializationStart event', async () => {
      const onStartCallback = jest.fn();
      appInitializer.onInitializationStart = onStartCallback;
      
      await appInitializer.initialize({ appName: 'TestApp' });
      
      expect(onStartCallback).toHaveBeenCalled();
    });

    test('should trigger onInitializationComplete event on success', async () => {
      const onCompleteCallback = jest.fn();
      appInitializer.onInitializationComplete = onCompleteCallback;
      
      await appInitializer.initialize({ appName: 'TestApp' });
      
      expect(onCompleteCallback).toHaveBeenCalledWith(true);
    });

    test('should trigger onInitializationComplete event on failure', async () => {
      const onCompleteCallback = jest.fn();
      appInitializer.onInitializationComplete = onCompleteCallback;
      
      mockServiceIntegrator.initialize.mockResolvedValue(false);
      
      await appInitializer.initialize({ appName: 'TestApp' });
      
      expect(onCompleteCallback).toHaveBeenCalledWith(false);
    });
  });
});\n