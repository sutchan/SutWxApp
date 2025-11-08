// 鏈嶅姟闆嗘垚妯″潡鍗曞厓娴嬭瘯
const { ServiceIntegrator, getService } = require('../service-integration');
const { ServiceManager } = require('../service-manager');
const { registerServiceAdapters } = require('../service-adapter');

// 妯℃嫙鎵€鏈変緷璧栨ā鍧楋紝閬垮厤瀹為檯瀵煎叆
jest.mock('../service-manager');
jest.mock('../service-adapter');

// 妯℃嫙utils鐩綍涓嬬殑鎵€鏈夋ā鍧楀鍏?jest.mock('../../utils/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    initialize: jest.fn()
  }
}));

jest.mock('../../utils/auth-service', () => ({
  default: {
    login: jest.fn(),
    logout: jest.fn(),
    initialize: jest.fn(),
    isAuthenticated: jest.fn(() => true)
  }
}));

jest.mock('../../utils/cache-service', () => ({
  default: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    initialize: jest.fn()
  }
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

// 鍒涘缓妯℃嫙鏈嶅姟
const mockServices = {
  api: { name: 'api', initialize: jest.fn() },
  auth: { name: 'auth', initialize: jest.fn() },
  user: { name: 'user', initialize: jest.fn() },
  article: { name: 'article', initialize: jest.fn() }
};

describe('ServiceIntegration', () => {
  let serviceIntegrator;
  let mockServiceManager;

  beforeEach(() => {
    // 閲嶇疆鎵€鏈塵ock
    jest.clearAllMocks();
    
    // 鍒涘缓妯℃嫙鐨凷erviceManager瀹炰緥
    mockServiceManager = {
      registerService: jest.fn(),
      initializeServices: jest.fn().mockResolvedValue(true),
      getService: jest.fn((name) => mockServices[name] || null),
      getAllServices: jest.fn(() => Object.values(mockServices)),
      sortServicesByDependencies: jest.fn(() => Object.values(mockServices))
    };
    
    // 璁㏒erviceManager鏋勯€犲嚱鏁拌繑鍥炴ā鎷熷疄渚?    ServiceManager.mockImplementation(() => mockServiceManager);
    
    // 妯℃嫙鏈嶅姟閫傞厤鍣ㄦ敞鍐?    registerServiceAdapters.mockImplementation((manager) => {
      // 娉ㄥ唽涓€浜涘熀纭€鏈嶅姟
      manager.registerService(mockServices.api, []);
      manager.registerService(mockServices.auth, ['api']);
      manager.registerService(mockServices.user, ['auth']);
      manager.registerService(mockServices.article, ['api']);
    });
    
    // 鍒涘缓ServiceIntegrator瀹炰緥
    serviceIntegrator = new ServiceIntegrator();
  });

  describe('initialize', () => {
    test('should initialize service integrator successfully', async () => {
      const config = {
        services: {
          useAdapters: true,
          enableCache: true
        },
        api: {
          baseUrl: 'https://example.com/api'
        }
      };
      
      const result = await serviceIntegrator.initialize(config);
      
      // 楠岃瘉鍒濆鍖栬繃绋?      expect(ServiceManager).toHaveBeenCalled();
      expect(registerServiceAdapters).toHaveBeenCalledWith(mockServiceManager);
      expect(mockServiceManager.initializeServices).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('should handle initialization failure', async () => {
      // 璁剧疆妯℃嫙鎶涘嚭閿欒
      mockServiceManager.initializeServices.mockRejectedValue(new Error('Initialization failed'));
      
      const config = {
        services: {
          useAdapters: true
        }
      };
      
      const result = await serviceIntegrator.initialize(config);
      
      expect(result).toBe(false);
      expect(serviceIntegrator.initializationError).toBeInstanceOf(Error);
    });

    test('should execute custom initialization callback', async () => {
      const customInitCallback = jest.fn();
      
      const config = {
        services: { useAdapters: true },
        customInitialization: customInitCallback
      };
      
      await serviceIntegrator.initialize(config);
      
      expect(customInitCallback).toHaveBeenCalledWith(serviceIntegrator);
    });
  });

  describe('getService', () => {
    test('should return registered service by name', () => {
      serviceIntegrator.serviceManager = mockServiceManager;
      
      const apiService = serviceIntegrator.getService('api');
      const authService = serviceIntegrator.getService('auth');
      
      expect(apiService).toBe(mockServices.api);
      expect(authService).toBe(mockServices.auth);
    });

    test('should return null for non-existent service', () => {
      serviceIntegrator.serviceManager = mockServiceManager;
      
      const nonExistentService = serviceIntegrator.getService('nonExistent');
      
      expect(nonExistentService).toBeNull();
    });

    test('should return null if service manager is not initialized', () => {
      serviceIntegrator.serviceManager = null;
      
      const service = serviceIntegrator.getService('api');
      
      expect(service).toBeNull();
    });
  });

  describe('getAllServices', () => {
    test('should return all registered services', () => {
      serviceIntegrator.serviceManager = mockServiceManager;
      
      const services = serviceIntegrator.getAllServices();
      
      expect(services).toEqual(Object.values(mockServices));
      expect(mockServiceManager.getAllServices).toHaveBeenCalled();
    });

    test('should return empty array if service manager is not initialized', () => {
      serviceIntegrator.serviceManager = null;
      
      const services = serviceIntegrator.getAllServices();
      
      expect(services).toEqual([]);
    });
  });

  describe('reinitialize', () => {
    test('should reinitialize the service layer', async () => {
      serviceIntegrator.serviceManager = mockServiceManager;
      
      const config = {
        services: {
          useAdapters: true
        }
      };
      
      const result = await serviceIntegrator.reinitialize(config);
      
      expect(ServiceManager).toHaveBeenCalledTimes(2); // 绗竴娆″湪鏋勯€犲嚱鏁帮紝绗簩娆″湪reinitialize
      expect(registerServiceAdapters).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });
  });

  describe('getInitializationStatus', () => {
    test('should return correct initialization status', () => {
      serviceIntegrator.initialized = true;
      serviceIntegrator.initializationTime = Date.now();
      
      const status = serviceIntegrator.getInitializationStatus();
      
      expect(status.initialized).toBe(true);
      expect(status.initializationTime).toBe(serviceIntegrator.initializationTime);
      expect(status.error).toBeNull();
    });

    test('should include error in status if initialization failed', () => {
      const error = new Error('Test error');
      serviceIntegrator.initialized = false;
      serviceIntegrator.initializationError = error;
      
      const status = serviceIntegrator.getInitializationStatus();
      
      expect(status.initialized).toBe(false);
      expect(status.error).toBe(error);
    });
  });

  describe('Static getService function', () => {
    test('should return service from default integrator', () => {
      // 璁剧疆榛樿鐨剆erviceIntegrator瀹炰緥
      ServiceIntegrator.defaultIntegrator = serviceIntegrator;
      serviceIntegrator.serviceManager = mockServiceManager;
      
      const apiService = getService('api');
      
      expect(apiService).toBe(mockServices.api);
    });

    test('should return null if no default integrator', () => {
      // 娓呴櫎榛樿鐨剆erviceIntegrator
      ServiceIntegrator.defaultIntegrator = null;
      
      const service = getService('api');
      
      expect(service).toBeNull();
    });
  });
});\n