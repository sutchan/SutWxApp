锘?/ 鎼存梻鏁ら崚婵嗩潗閸栨牗膩閸ф宕熼崗鍐╃ゴ鐠?const { AppInitializer, initializeServiceLayer, getService, getServiceLayerStatus } = require('../app-initializer');
const { ServiceIntegrator } = require('../service-integration');

// 濡剝瀚欓幍鈧張澶夌贩鐠ф牗膩閸ф绱濋柆鍨帳鐎圭偤妾€电厧鍙?jest.mock('../service-integration');

// 濡剝瀚檜tils閻╊喖缍嶆稉瀣畱閹碘偓閺堝膩閸ф顕遍崗銉礉闁灝鍘S6濡€虫健閸忕厧顔愰幀褔妫舵０?jest.mock('../../utils/api', () => ({
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

// 濡剝瀚欐担璺ㄦ暏ES濡€虫健鐠囶厽纭堕惃鍕箛閸?jest.mock('../../utils/article-service', () => ({
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

// 閻㈤潧鏅㈤惄绋垮彠閺堝秴濮焟ock
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

// 閸╄櫣顢呭銉ュ徔mock
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
    // 闁插秶鐤嗛幍鈧張濉祇ck
    jest.clearAllMocks();
    
    // 閸掓稑缂撳Ο鈩冨珯閻ㄥ嚪erviceIntegrator鐎圭偘绶?    mockServiceIntegrator = {
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
    
    // 鐠併彃erviceIntegrator閺嬪嫰鈧姴鍤遍弫鎷岀箲閸ョ偞膩閹风喎鐤勬笟?    ServiceIntegrator.mockImplementation(() => mockServiceIntegrator);
    
    // 閸掓稑缂揂ppInitializer鐎圭偘绶?    appInitializer = new AppInitializer();
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
      
      // 妤犲矁鐦夐崚婵嗩潗閸栨牞绻冪粙?      expect(ServiceIntegrator).toHaveBeenCalled();
      expect(mockServiceIntegrator.initialize).toHaveBeenCalledWith(appConfig);
      expect(appInitializer.isInitialized).toBe(true);
      expect(result).toBe(true);
    });

    test('should handle initialization failure', async () => {
      const appConfig = { appName: 'TestApp' };
      
      // 濡剝瀚欓崚婵嗩潗閸栨牕銇戠拹?      mockServiceIntegrator.initialize.mockResolvedValue(false);
      
      const result = await appInitializer.initialize(appConfig);
      
      expect(appInitializer.isInitialized).toBe(false);
      expect(result).toBe(false);
    });

    test('should handle initialization exception', async () => {
      const appConfig = { appName: 'TestApp' };
      
      // 濡剝瀚欓崚婵嗩潗閸栨牗濮忛崙鍝勭磽鐢?      const error = new Error('Initialization failed');
      mockServiceIntegrator.initialize.mockRejectedValue(error);
      
      const result = await appInitializer.initialize(appConfig);
      
      expect(appInitializer.isInitialized).toBe(false);
      expect(result).toBe(false);
      expect(appInitializer.lastError).toBe(error);
    });

    test('should handle initialization timeout', async () => {
      const appConfig = { appName: 'TestApp', initializationTimeout: 100 };
      
      // 濡剝瀚欓崚婵嗩潗閸栨牞绉撮弮?      mockServiceIntegrator.initialize.mockImplementation(() => {
        return new Promise(() => {
          // 濮樻瓕绻欐稉宄砮solve
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
      // 閸忓牆鍨垫慨瀣
      appInitializer.isInitialized = true;
      
      const appConfig = { appName: 'TestApp', appVersion: '1.1.0' };
      
      const result = await appInitializer.reinitialize(appConfig);
      
      expect(mockServiceIntegrator.reinitialize).toHaveBeenCalledWith(appConfig);
      expect(result).toBe(true);
    });

    test('should handle reinitialization failure', async () => {
      // 閸忓牆鍨垫慨瀣
      appInitializer.isInitialized = true;
      
      const appConfig = { appName: 'TestApp' };
      
      // 濡剝瀚欓柌宥嗘煀閸掓繂顫愰崠鏍с亼鐠?      mockServiceIntegrator.reinitialize.mockResolvedValue(false);
      
      const result = await appInitializer.reinitialize(appConfig);
      
      expect(appInitializer.isInitialized).toBe(false);
      expect(result).toBe(false);
    });
  });

  describe('shutdown', () => {
    test('should shutdown app successfully', () => {
      // 閸忓牆鍨垫慨瀣
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
      // 鐠佸墽鐤嗘妯款吇閻ㄥ垷ppInitializer鐎圭偘绶?      AppInitializer.defaultInitializer = appInitializer;
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