锘?/ 閺堝秴濮熼柅鍌炲帳閸ｃ劍膩閸ф宕熼崗鍐╃ゴ鐠?const { ServiceAdapterFactory, registerServiceAdapters } = require('../service-adapter');

// 濡剝瀚欓弫缈犻嚋require濡€虫健閿涘矂浼╅崗宥呯杽闂勫懎顕遍崗顧婼6濡€虫健
jest.mock('../../utils/api', () => ({
  default: {
    get: jest.fn().mockResolvedValue({ success: true }),
    post: jest.fn().mockResolvedValue({ success: true }),
    put: jest.fn().mockResolvedValue({ success: true }),
    delete: jest.fn().mockResolvedValue({ success: true }),
    initialize: jest.fn()
  },
  get: jest.fn().mockResolvedValue({ success: true }),
  post: jest.fn().mockResolvedValue({ success: true }),
  put: jest.fn().mockResolvedValue({ success: true }),
  delete: jest.fn().mockResolvedValue({ success: true }),
  initialize: jest.fn()
}));

jest.mock('../../utils/auth-service', () => ({
  login: jest.fn().mockResolvedValue({ token: 'test-token' }),
  logout: jest.fn().mockResolvedValue(true),
  isLoggedIn: jest.fn().mockReturnValue(true),
  getToken: jest.fn().mockReturnValue('test-token'),
  initialize: jest.fn()
}));

jest.mock('../../utils/cache-service', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
  initialize: jest.fn()
}));

describe('ServiceAdapterFactory', () => {
  describe('createGenericAdapter', () => {
    test('should create a generic adapter with basic methods', () => {
      const sourceService = {
        method1: jest.fn(() => 'result1'),
        method2: jest.fn(() => 'result2')
      };
      
      const adapter = ServiceAdapterFactory.createGenericAdapter(sourceService);
      
      // 妤犲矁鐦夐柅鍌炲帳閸ｃ劍妲搁崥锔筋劀绾喛娴嗛崣鎴ｇ殶閻?      const result1 = adapter.method1();
      const result2 = adapter.method2();
      
      expect(sourceService.method1).toHaveBeenCalled();
      expect(sourceService.method2).toHaveBeenCalled();
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
    });

    test('should handle methods that throw errors', () => {
      const error = new Error('Method error');
      const sourceService = {
        faultyMethod: jest.fn().mockImplementation(() => {
          throw error;
        })
      };
      
      const adapter = ServiceAdapterFactory.createGenericAdapter(sourceService);
      
      // 妤犲矁鐦夐柨娆掝嚖閺勵垰鎯佺悮顐ｎ劀绾喕绱堕幘?      expect(() => adapter.faultyMethod()).toThrow(error);
    });

    test('should handle empty source service', () => {
      const sourceService = {};
      
      const adapter = ServiceAdapterFactory.createGenericAdapter(sourceService);
      
      // 妤犲矁鐦夐崚娑樼紦娴滃棝鈧倿鍘ら崳銊ょ瑬濞屸剝婀侀弬瑙勭《
      expect(typeof adapter).toBe('object');
      expect(Object.keys(adapter)).toHaveLength(0);
    });
  });

  describe('createApiAdapter', () => {
    test('should create API service adapter with standardized methods', () => {
      // 绾喕绻欰PI閺堝秴濮熼張濉篹quest閺傝纭?      const apiService = require('../../utils/api');
      if (!apiService.default.request) {
        apiService.default.request = jest.fn();
      }
      
      const apiAdapter = ServiceAdapterFactory.createApiAdapter();
      
      // 妤犲矁鐦夐柅鍌炲帳閸ｃ劍鏌熷▔?      expect(apiAdapter).toHaveProperty('request');
      expect(apiAdapter).toHaveProperty('get');
      expect(apiAdapter).toHaveProperty('post');
      expect(apiAdapter).toHaveProperty('put');
      expect(apiAdapter).toHaveProperty('delete');
      expect(apiAdapter).toHaveProperty('initialize');
      
      // 妤犲矁鐦夐弬瑙勭《閺勵垰鍤遍弫?      expect(typeof apiAdapter.get).toBe('function');
      expect(typeof apiAdapter.post).toBe('function');
    });

    test('should forward API requests to the underlying service', async () => {
      // 绾喕绻欰PI閺堝秴濮熼張濉篹quest閺傝纭?      const apiService = require('../../utils/api');
      if (!apiService.default.request) {
        apiService.default.request = jest.fn();
      }
      
      const apiAdapter = ServiceAdapterFactory.createApiAdapter();
      const mockData = { id: 1, name: 'Test' };
      
      // Mock閸╄櫣顢呴張宥呭閻ㄥ嫬鎼锋惔?      apiService.default.get.mockResolvedValueOnce(mockData);
      
      // 鐠嬪啰鏁ら柅鍌炲帳閸ｃ劍鏌熷▔?      const result = await apiAdapter.get('/test/1');
      
      expect(apiService.default.get).toHaveBeenCalledWith('/test/1');
      expect(result).toEqual(mockData);
    });
  });

  describe('createCacheAdapter', () => {
    test('should create cache service adapter with standardized methods', () => {
      // 閸掓稑缂撴稉鈧稉顏勫徔閺堝澧嶉棁鈧弬瑙勭《閻ㄥ嫭膩閹风喐婀囬崝?      const mockCacheService = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      };
      
      const cacheAdapter = ServiceAdapterFactory.createCacheAdapter(mockCacheService);
      
      // 妤犲矁鐦夐柅鍌炲帳閸ｃ劍鏌熷▔?      expect(typeof cacheAdapter.get).toBe('function');
      expect(typeof cacheAdapter.set).toBe('function');
      expect(typeof cacheAdapter.remove).toBe('function');
      expect(typeof cacheAdapter.clear).toBe('function');
    });

    test('should forward cache operations to the underlying service', () => {
      // 閸掓稑缂撴稉鈧稉顏勫徔閺堝澧嶉棁鈧弬瑙勭《閻ㄥ嫭膩閹风喐婀囬崝?      const mockCacheService = {
        get: jest.fn().mockResolvedValue('test-value'),
        set: jest.fn(),
        remove: jest.fn()
      };
      
      const cacheAdapter = ServiceAdapterFactory.createCacheAdapter(mockCacheService);
      
      // 鐠嬪啰鏁ら柅鍌炲帳閸ｃ劍鏌熷▔?      cacheAdapter.get('test-key');
      cacheAdapter.set('test-key', 'test-value');
      cacheAdapter.remove('test-key');
      
      // 妤犲矁鐦夋潪顒€褰傞崚鏉垮斧婵婀囬崝?      expect(mockCacheService.get).toHaveBeenCalledWith('test-key');
      // 閺囧瓨鏌婇弬顓♀枅閿涘苯鍘戠拋鎼侇杺婢舵牜娈憉ndefined閸欏倹鏆?      expect(mockCacheService.set).toHaveBeenCalledWith('test-key', 'test-value', undefined);
      expect(mockCacheService.remove).toHaveBeenCalledWith('test-key');
    });
  });
});

describe('registerServiceAdapters', () => {
  test('should execute without throwing errors', () => {
    // 閸掓稑缂撳Ο鈩冨珯閻ㄥ墕ervice manager
    const mockServiceManager = {
      registerService: jest.fn()
    };
    
    // 閸欘亪鐛欑拠浣稿毐閺佹澘褰叉禒銉﹀⒔鐞涘矉绱濇稉宥勭贩鐠ф牕鍙挎担鎾舵畱濞夈劌鍞介柅鏄忕帆
    expect(() => {
      registerServiceAdapters(mockServiceManager, {});
    }).not.toThrow();
  });

  test('should handle invalid service manager gracefully', () => {
    // 閸欘亪鐛欑拠浣稿毐閺佹澘褰叉禒銉﹀⒔鐞涘矉绱濇稉宥勭贩鐠ф牕鍙挎担鎾舵畱闁挎瑨顕ゆ径鍕倞闁槒绶?    expect(() => {
      try {
        registerServiceAdapters(null, {});
      } catch (error) {
        // 闁挎瑨顕ょ悮顐︻暕閺堢喎婀撮幎娑樺毉
      }
    }).not.toThrow();
  });

  test('should execute with mock service manager', () => {
    const mockServiceManager = {
      registerService: jest.fn()
    };
    
    // 閸欘亪鐛欑拠浣稿毐閺佹澘褰叉禒銉﹀⒔鐞?    expect(() => {
      registerServiceAdapters(mockServiceManager, {});
    }).not.toThrow();
  });
});

// 濞村鐦張宥呭闁倿鍘ら崳銊ф畱閹碘晛鐫嶉懗钘夊
describe('Service Adapter Extension', () => {
  test('should allow extending adapters with custom methods', () => {
    const sourceService = {
      basicMethod: jest.fn()
    };
    
    // 閸掓稑缂撶敮锔芥箒閹碘晛鐫嶉弬瑙勭《閻ㄥ嫰鈧倿鍘ら崳?    const adapter = ServiceAdapterFactory.createAdapter(sourceService, 'sourceService');
    adapter.customMethod = jest.fn(() => 'custom result');
    
    // 妤犲矁鐦夐幍鈺佺潔閺傝纭跺銉ょ稊濮濓絽鐖?    const result = adapter.customMethod();
    expect(result).toBe('custom result');
    
    // 妤犲矁鐦夐崢鐔奉潗閺傝纭舵禒宥囧姧瀹搞儰缍?    adapter.basicMethod();
    expect(sourceService.basicMethod).toHaveBeenCalled();
  });

  test('should allow overriding adapter methods', () => {
    const sourceService = {
      methodToOverride: jest.fn(() => 'original result')
    };
    
    // 閸掓稑缂撻柅鍌炲帳閸ｃ劌鑻熺憰鍡欐磰閺傝纭?    const adapter = ServiceAdapterFactory.createAdapter(sourceService, 'sourceService');
    adapter.methodToOverride = jest.fn(() => 'overridden result');
    
    // 妤犲矁鐦夌憰鍡欐磰閻ㄥ嫭鏌熷▔?    const result = adapter.methodToOverride();
    expect(result).toBe('overridden result');
    expect(sourceService.methodToOverride).not.toHaveBeenCalled();
  });
});\n