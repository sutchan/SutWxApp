锘?/ 閺堝秴濮熼梿鍡樺灇濡€虫健閸楁洖鍘撳ù瀣槸
const { ServiceIntegrator, getService } = require('../service-integration');
const { ServiceManager } = require('../service-manager');
const { registerServiceAdapters } = require('../service-adapter');

// 濡剝瀚欓幍鈧張澶夌贩鐠ф牗膩閸ф绱濋柆鍨帳鐎圭偤妾€电厧鍙?jest.mock('../service-manager');
jest.mock('../service-adapter');

// 濡剝瀚檜tils閻╊喖缍嶆稉瀣畱閹碘偓閺堝膩閸ф顕遍崗?jest.mock('../../utils/api', () => ({
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

// 閸掓稑缂撳Ο鈩冨珯閺堝秴濮?const mockServices = {
  api: { name: 'api', initialize: jest.fn() },
  auth: { name: 'auth', initialize: jest.fn() },
  user: { name: 'user', initialize: jest.fn() },
  article: { name: 'article', initialize: jest.fn() }
};

describe('ServiceIntegration', () => {
  let serviceIntegrator;
  let mockServiceManager;

  beforeEach(() => {
    // 闁插秶鐤嗛幍鈧張濉祇ck
    jest.clearAllMocks();
    
    // 閸掓稑缂撳Ο鈩冨珯閻ㄥ嚪erviceManager鐎圭偘绶?    mockServiceManager = {
      registerService: jest.fn(),
      initializeServices: jest.fn().mockResolvedValue(true),
      getService: jest.fn((name) => mockServices[name] || null),
      getAllServices: jest.fn(() => Object.values(mockServices)),
      sortServicesByDependencies: jest.fn(() => Object.values(mockServices))
    };
    
    // 鐠併彃erviceManager閺嬪嫰鈧姴鍤遍弫鎷岀箲閸ョ偞膩閹风喎鐤勬笟?    ServiceManager.mockImplementation(() => mockServiceManager);
    
    // 濡剝瀚欓張宥呭闁倿鍘ら崳銊︽暈閸?    registerServiceAdapters.mockImplementation((manager) => {
      // 濞夈劌鍞芥稉鈧禍娑樼唨绾偓閺堝秴濮?      manager.registerService(mockServices.api, []);
      manager.registerService(mockServices.auth, ['api']);
      manager.registerService(mockServices.user, ['auth']);
      manager.registerService(mockServices.article, ['api']);
    });
    
    // 閸掓稑缂揝erviceIntegrator鐎圭偘绶?    serviceIntegrator = new ServiceIntegrator();
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
      
      // 妤犲矁鐦夐崚婵嗩潗閸栨牞绻冪粙?      expect(ServiceManager).toHaveBeenCalled();
      expect(registerServiceAdapters).toHaveBeenCalledWith(mockServiceManager);
      expect(mockServiceManager.initializeServices).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('should handle initialization failure', async () => {
      // 鐠佸墽鐤嗗Ο鈩冨珯閹舵稑鍤柨娆掝嚖
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
      
      expect(ServiceManager).toHaveBeenCalledTimes(2); // 缁楊兛绔村▎鈥虫躬閺嬪嫰鈧姴鍤遍弫甯礉缁楊兛绨╁▎鈥虫躬reinitialize
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
      // 鐠佸墽鐤嗘妯款吇閻ㄥ墕erviceIntegrator鐎圭偘绶?      ServiceIntegrator.defaultIntegrator = serviceIntegrator;
      serviceIntegrator.serviceManager = mockServiceManager;
      
      const apiService = getService('api');
      
      expect(apiService).toBe(mockServices.api);
    });

    test('should return null if no default integrator', () => {
      // 濞撳懘娅庢妯款吇閻ㄥ墕erviceIntegrator
      ServiceIntegrator.defaultIntegrator = null;
      
      const service = getService('api');
      
      expect(service).toBeNull();
    });
  });
});\n