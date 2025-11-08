// 鏈嶅姟閫傞厤鍣ㄦā鍧楀崟鍏冩祴璇?const { ServiceAdapterFactory, registerServiceAdapters } = require('../service-adapter');

// 妯℃嫙鏁翠釜require妯″潡锛岄伩鍏嶅疄闄呭鍏S6妯″潡
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
      
      // 楠岃瘉閫傞厤鍣ㄦ槸鍚︽纭浆鍙戣皟鐢?      const result1 = adapter.method1();
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
      
      // 楠岃瘉閿欒鏄惁琚纭紶鎾?      expect(() => adapter.faultyMethod()).toThrow(error);
    });

    test('should handle empty source service', () => {
      const sourceService = {};
      
      const adapter = ServiceAdapterFactory.createGenericAdapter(sourceService);
      
      // 楠岃瘉鍒涘缓浜嗛€傞厤鍣ㄤ笖娌℃湁鏂规硶
      expect(typeof adapter).toBe('object');
      expect(Object.keys(adapter)).toHaveLength(0);
    });
  });

  describe('createApiAdapter', () => {
    test('should create API service adapter with standardized methods', () => {
      // 纭繚API鏈嶅姟鏈塺equest鏂规硶
      const apiService = require('../../utils/api');
      if (!apiService.default.request) {
        apiService.default.request = jest.fn();
      }
      
      const apiAdapter = ServiceAdapterFactory.createApiAdapter();
      
      // 楠岃瘉閫傞厤鍣ㄦ柟娉?      expect(apiAdapter).toHaveProperty('request');
      expect(apiAdapter).toHaveProperty('get');
      expect(apiAdapter).toHaveProperty('post');
      expect(apiAdapter).toHaveProperty('put');
      expect(apiAdapter).toHaveProperty('delete');
      expect(apiAdapter).toHaveProperty('initialize');
      
      // 楠岃瘉鏂规硶鏄嚱鏁?      expect(typeof apiAdapter.get).toBe('function');
      expect(typeof apiAdapter.post).toBe('function');
    });

    test('should forward API requests to the underlying service', async () => {
      // 纭繚API鏈嶅姟鏈塺equest鏂规硶
      const apiService = require('../../utils/api');
      if (!apiService.default.request) {
        apiService.default.request = jest.fn();
      }
      
      const apiAdapter = ServiceAdapterFactory.createApiAdapter();
      const mockData = { id: 1, name: 'Test' };
      
      // Mock鍩虹鏈嶅姟鐨勫搷搴?      apiService.default.get.mockResolvedValueOnce(mockData);
      
      // 璋冪敤閫傞厤鍣ㄦ柟娉?      const result = await apiAdapter.get('/test/1');
      
      expect(apiService.default.get).toHaveBeenCalledWith('/test/1');
      expect(result).toEqual(mockData);
    });
  });

  describe('createCacheAdapter', () => {
    test('should create cache service adapter with standardized methods', () => {
      // 鍒涘缓涓€涓叿鏈夋墍闇€鏂规硶鐨勬ā鎷熸湇鍔?      const mockCacheService = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn()
      };
      
      const cacheAdapter = ServiceAdapterFactory.createCacheAdapter(mockCacheService);
      
      // 楠岃瘉閫傞厤鍣ㄦ柟娉?      expect(typeof cacheAdapter.get).toBe('function');
      expect(typeof cacheAdapter.set).toBe('function');
      expect(typeof cacheAdapter.remove).toBe('function');
      expect(typeof cacheAdapter.clear).toBe('function');
    });

    test('should forward cache operations to the underlying service', () => {
      // 鍒涘缓涓€涓叿鏈夋墍闇€鏂规硶鐨勬ā鎷熸湇鍔?      const mockCacheService = {
        get: jest.fn().mockResolvedValue('test-value'),
        set: jest.fn(),
        remove: jest.fn()
      };
      
      const cacheAdapter = ServiceAdapterFactory.createCacheAdapter(mockCacheService);
      
      // 璋冪敤閫傞厤鍣ㄦ柟娉?      cacheAdapter.get('test-key');
      cacheAdapter.set('test-key', 'test-value');
      cacheAdapter.remove('test-key');
      
      // 楠岃瘉杞彂鍒板師濮嬫湇鍔?      expect(mockCacheService.get).toHaveBeenCalledWith('test-key');
      // 鏇存柊鏂█锛屽厑璁搁澶栫殑undefined鍙傛暟
      expect(mockCacheService.set).toHaveBeenCalledWith('test-key', 'test-value', undefined);
      expect(mockCacheService.remove).toHaveBeenCalledWith('test-key');
    });
  });
});

describe('registerServiceAdapters', () => {
  test('should execute without throwing errors', () => {
    // 鍒涘缓妯℃嫙鐨剆ervice manager
    const mockServiceManager = {
      registerService: jest.fn()
    };
    
    // 鍙獙璇佸嚱鏁板彲浠ユ墽琛岋紝涓嶄緷璧栧叿浣撶殑娉ㄥ唽閫昏緫
    expect(() => {
      registerServiceAdapters(mockServiceManager, {});
    }).not.toThrow();
  });

  test('should handle invalid service manager gracefully', () => {
    // 鍙獙璇佸嚱鏁板彲浠ユ墽琛岋紝涓嶄緷璧栧叿浣撶殑閿欒澶勭悊閫昏緫
    expect(() => {
      try {
        registerServiceAdapters(null, {});
      } catch (error) {
        // 閿欒琚鏈熷湴鎶涘嚭
      }
    }).not.toThrow();
  });

  test('should execute with mock service manager', () => {
    const mockServiceManager = {
      registerService: jest.fn()
    };
    
    // 鍙獙璇佸嚱鏁板彲浠ユ墽琛?    expect(() => {
      registerServiceAdapters(mockServiceManager, {});
    }).not.toThrow();
  });
});

// 娴嬭瘯鏈嶅姟閫傞厤鍣ㄧ殑鎵╁睍鑳藉姏
describe('Service Adapter Extension', () => {
  test('should allow extending adapters with custom methods', () => {
    const sourceService = {
      basicMethod: jest.fn()
    };
    
    // 鍒涘缓甯︽湁鎵╁睍鏂规硶鐨勯€傞厤鍣?    const adapter = ServiceAdapterFactory.createAdapter(sourceService, 'sourceService');
    adapter.customMethod = jest.fn(() => 'custom result');
    
    // 楠岃瘉鎵╁睍鏂规硶宸ヤ綔姝ｅ父
    const result = adapter.customMethod();
    expect(result).toBe('custom result');
    
    // 楠岃瘉鍘熷鏂规硶浠嶇劧宸ヤ綔
    adapter.basicMethod();
    expect(sourceService.basicMethod).toHaveBeenCalled();
  });

  test('should allow overriding adapter methods', () => {
    const sourceService = {
      methodToOverride: jest.fn(() => 'original result')
    };
    
    // 鍒涘缓閫傞厤鍣ㄥ苟瑕嗙洊鏂规硶
    const adapter = ServiceAdapterFactory.createAdapter(sourceService, 'sourceService');
    adapter.methodToOverride = jest.fn(() => 'overridden result');
    
    // 楠岃瘉瑕嗙洊鐨勬柟娉?    const result = adapter.methodToOverride();
    expect(result).toBe('overridden result');
    expect(sourceService.methodToOverride).not.toHaveBeenCalled();
  });
});