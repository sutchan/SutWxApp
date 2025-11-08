// cache-service.test.js - 楂樼骇缂撳瓨绠＄悊鏈嶅姟娴嬭瘯

// Mock wx API
jest.mock('../../../app', () => ({}), { virtual: true });

// Mock鍏ㄥ眬wx瀵硅薄
global.wx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  getStorageInfoSync: jest.fn()
};

// 瀵煎叆琚祴璇曟ā鍧?const cacheService = require('../cache-service');
const { CACHE_KEYS, CACHE_DURATION } = require('../cache-service');

// 淇濆瓨鍘熷鐨刢onsole鏂规硶浠ヤ究鎭㈠
const originalConsole = console;

// 鍦ㄦ瘡涓祴璇曞墠璁剧疆妯℃嫙
beforeEach(() => {
  // 娓呴櫎鎵€鏈夋ā鎷熺殑璋冪敤鍘嗗彶
  jest.clearAllMocks();
  
  // 閲嶇疆console.warn鍜宑onsole.error
  console.warn = jest.fn();
  console.error = jest.fn();
  console.debug = jest.fn();
  console.log = jest.fn();
  
  // Mock瀛樺偍淇℃伅
  wx.getStorageInfoSync.mockReturnValue({
    keys: [],
    currentSize: 1024,
    limitSize: 10240
  });
  
  // Mock鑾峰彇缂撳瓨
  wx.getStorageSync.mockReturnValue(null);
});

// 娴嬭瘯瀹屾垚鍚庢仮澶峜onsole
afterAll(() => {
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
  console.log = originalConsole.log;
});

describe('缂撳瓨鏈嶅姟鍒濆鍖?, () => {
  test('鍒濆鍖栨垚鍔熷苟杩斿洖瀹炰緥', () => {
    // 鐢变簬鎴戜滑鍦ㄦā鍧楀鍏ユ椂宸茬粡鍒濆鍖栦簡锛岃繖閲岄獙璇佸疄渚嬪瓨鍦?    expect(cacheService).toBeDefined();
    expect(typeof cacheService).toBe('object');
  });
  
  test('鍒濆鍖栨椂楠岃瘉鍩烘湰鍔熻兘', () => {
    // 涓嶅啀渚濊禆console.log锛岀洿鎺ラ獙璇佸疄渚嬫柟娉曞瓨鍦?    expect(cacheService.set).toBeDefined();
    expect(cacheService.get).toBeDefined();
  });
});

describe('缂撳瓨鍩烘湰鎿嶄綔', () => {
  test('set鏂规硶鑳芥纭缃紦瀛?, async () => {
    const success = await cacheService.set('testKey', 'testValue', CACHE_DURATION.SHORT);
    expect(success).toBe(true);
    expect(wx.setStorageSync).toHaveBeenCalledWith(
      expect.stringContaining('sut_wxcache_testKey'),
      expect.objectContaining({
        value: 'testValue',
        expiry: expect.any(Number)
      })
    );
  });
  
  test('get鏂规硶鑳芥纭幏鍙栫紦瀛?, async () => {
    const mockData = {
      value: 'testValue',
      expiry: Date.now() + 100000 // 鏈潵鐨勬椂闂达紝琛ㄧず鏈繃鏈?    };
    wx.getStorageSync.mockReturnValue(mockData);
    
    const value = await cacheService.get('testKey', 'fallback');
    expect(value).toBe('testValue');
    expect(wx.getStorageSync).toHaveBeenCalledWith(expect.stringContaining('sut_wxcache_testKey'));
  });
  
  test('get鏂规硶鍦ㄧ紦瀛樹笉瀛樺湪鏃惰繑鍥炲洖閫€鍊?, async () => {
    wx.getStorageSync.mockReturnValue(null);
    
    const value = await cacheService.get('nonexistentKey', 'fallback');
    expect(value).toBe('fallback');
  });
  
  test('浣跨敤瀛楃涓蹭綔涓鸿繃鏈熸椂闂寸瓥鐣?, async () => {
    await cacheService.set('testKey', 'testValue', 'SHORT');
    expect(wx.setStorageSync).toHaveBeenCalled();
  });
  
  test('搴忓垪鍖栧拰鍙嶅簭鍒楀寲鍔熻兘', async () => {
    const testObject = { name: 'test', value: 123 };
    
    // 娴嬭瘯搴忓垪鍖?    await cacheService.set('testObject', testObject, CACHE_DURATION.SHORT, { serialize: true });
    
    // 妯℃嫙鑾峰彇搴忓垪鍖栧悗鐨勬暟鎹?    const serializedCall = wx.setStorageSync.mock.calls.find(call => 
      call[0].includes('testObject')
    );
    const serializedValue = serializedCall[1].value;
    
    // 璁剧疆妯℃嫙杩斿洖搴忓垪鍖栧悗鐨勬暟鎹?    wx.getStorageSync.mockReturnValue({
      value: serializedValue,
      expiry: Date.now() + 100000
    });
    
    // 娴嬭瘯鍙嶅簭鍒楀寲
    const result = await cacheService.get('testObject', null, { deserialize: true });
    expect(result).toEqual(testObject);
  });
});

describe('鎵归噺缂撳瓨鎿嶄綔', () => {
  test('batchSet鑳芥壒閲忚缃紦瀛?, async () => {
    const items = [
      { key: 'key1', value: 'value1', expiry: CACHE_DURATION.SHORT },
      { key: 'key2', value: 'value2' },
      { key: 'key3', value: 'value3', expiry: CACHE_DURATION.LONG }
    ];
    
    const result = await cacheService.batchSet(items);
    
    expect(result.success).toHaveLength(3);
    expect(result.failed).toHaveLength(0);
    expect(wx.setStorageSync).toHaveBeenCalledTimes(3);
  });
  
  test('batchGet鑳芥壒閲忚幏鍙栫紦瀛?, async () => {
    // Mock涓嶅悓閿殑杩斿洖鍊?    wx.getStorageSync.mockImplementation(key => {
      if (key.includes('key1')) {
        return { value: 'value1', expiry: Date.now() + 100000 };
      } else if (key.includes('key2')) {
        return { value: 'value2', expiry: Date.now() + 100000 };
      }
      return null;
    });
    
    const result = await cacheService.batchGet(['key1', 'key2', 'key3']);
    
    expect(result.key1).toBe('value1');
    expect(result.key2).toBe('value2');
    expect(result.key3).toBeNull();
  });
  
  test('batchRemove鑳芥壒閲忓垹闄ょ紦瀛?, async () => {
    const keys = ['key1', 'key2', 'key3'];
    
    const result = await cacheService.batchRemove(keys);
    
    expect(result.success).toHaveLength(3);
    expect(result.failed).toHaveLength(0);
    expect(wx.removeStorageSync).toHaveBeenCalledTimes(3);
  });
});

describe('楂樼骇缂撳瓨绛栫暐', () => {
  test('getOrSet鏂规硶鍦ㄧ紦瀛樹笉瀛樺湪鏃惰缃紦瀛?, async () => {
    wx.getStorageSync.mockReturnValue(null);
    
    const value = await cacheService.getOrSet('testKey', () => 'newValue');
    
    expect(value).toBe('newValue');
    expect(wx.setStorageSync).toHaveBeenCalled();
  });
  
  test('getOrSet鏂规硶鍦ㄧ紦瀛樺瓨鍦ㄦ椂鐩存帴杩斿洖缂撳瓨鍊?, async () => {
    wx.getStorageSync.mockReturnValue({
      value: 'cachedValue',
      expiry: Date.now() + 100000
    });
    
    const value = await cacheService.getOrSet('testKey', () => 'newValue');
    
    expect(value).toBe('cachedValue');
    expect(wx.setStorageSync).not.toHaveBeenCalled();
  });
  
  test('setIf鏂规硶鍦ㄦ潯浠朵负true鏃惰缃紦瀛?, async () => {
    const value = await cacheService.setIf('testKey', true, 'conditionalValue');
    
    expect(value).toBe('conditionalValue');
    expect(wx.setStorageSync).toHaveBeenCalled();
  });
  
  test('setIf鏂规硶鍦ㄦ潯浠朵负false鏃朵笉璁剧疆缂撳瓨', async () => {
    const value = await cacheService.setIf('testKey', false, 'conditionalValue');
    
    expect(value).toBeNull();
    expect(wx.setStorageSync).not.toHaveBeenCalled();
  });
  
  test('refresh鏂规硶鑳藉埛鏂扮紦瀛?, async () => {
    const value = await cacheService.refresh('testKey', () => 'refreshedValue');
    
    expect(value).toBe('refreshedValue');
    expect(wx.setStorageSync).toHaveBeenCalled();
  });
});

describe('缂撳瓨绠＄悊鍔熻兘', () => {
  test('clearByType鏂规硶鑳芥竻闄ゆ寚瀹氱被鍨嬬殑缂撳瓨', async () => {
    // 纭繚wx瀵硅薄宸插畾涔夊苟鏈塩learStorageSync鏂规硶
    if (!wx.clearStorageSync) {
      wx.clearStorageSync = jest.fn();
    }
    
    const success = cacheService.clearByType('all');
    
    expect(success).toBe(true);
    expect(wx.clearStorageSync).toHaveBeenCalled();
  });
  
  test('getCacheStats鏂规硶鑳借幏鍙栫紦瀛樼粺璁′俊鎭?, async () => {
    wx.getStorageInfoSync.mockReturnValue({
      keys: ['sut_wxcache_key1', 'sut_wxcache_key2', 'other_key'],
      currentSize: 2048,
      limitSize: 10240
    });
    
    wx.getStorageSync.mockImplementation(key => {
      return { value: 'test', expiry: Date.now() + 100000 };
    });
    
    const stats = cacheService.getCacheStats();
    
    expect(stats).toBeDefined();
    expect(stats.totalKeys).toBe(3);
    expect(stats.ourCacheKeys).toBe(2);
  });
  
  test('checkCacheHealth鏂规硶鍦ㄧ紦瀛樹娇鐢ㄨ秴杩?0%鏃舵竻鐞嗚繃鏈熺紦瀛?, async () => {
    wx.getStorageInfoSync.mockReturnValue({
      keys: [],
      currentSize: 9000, // 瓒呰繃80%
      limitSize: 10000
    });
    
    // 淇濆瓨鍘熷鐨刢leanExpiredCache鏂规硶
    const originalCleanExpiredCache = cacheService.cleanExpiredCache;
    cacheService.cleanExpiredCache = jest.fn();
    
    cacheService.checkCacheHealth();
    
    expect(cacheService.cleanExpiredCache).toHaveBeenCalled();
    
    // 鎭㈠鍘熷鏂规硶
    cacheService.cleanExpiredCache = originalCleanExpiredCache;
  });
});

describe('缂撳瓨闄嶇骇绛栫暐', () => {
  test('getWithFallback鏂规硶鍦ㄦ甯告儏鍐典笅浣跨敤鏂板€?, async () => {
    const valueFn = jest.fn().mockResolvedValue('newValue');
    
    const value = await cacheService.getWithFallback('testKey', valueFn);
    
    expect(value).toBe('newValue');
    expect(valueFn).toHaveBeenCalled();
    expect(wx.setStorageSync).toHaveBeenCalled();
  });
  
  test('getWithFallback鏂规硶鍦ㄨ幏鍙栨柊鍊煎け璐ユ椂浣跨敤杩囨湡缂撳瓨', async () => {
    const valueFn = jest.fn().mockRejectedValue(new Error('Network error'));
    
    // 妯℃嫙瀛樺湪杩囨湡缂撳瓨
    wx.getStorageSync.mockReturnValue({
      value: 'staleValue',
      expiry: Date.now() - 1000 // 杩囧幓鐨勬椂闂达紝琛ㄧず宸茶繃鏈?    });
    
    const value = await cacheService.getWithFallback('testKey', valueFn);
    
    expect(value).toBe('staleValue');
    expect(valueFn).toHaveBeenCalled();
  });
  
  test('getWithFallback鏂规硶鍦ㄦ病鏈夎繃鏈熺紦瀛樻椂鎶涘嚭閿欒', async () => {
    const valueFn = jest.fn().mockRejectedValue(new Error('Network error'));
    wx.getStorageSync.mockReturnValue(null);
    
    await expect(cacheService.getWithFallback('testKey', valueFn))
      .rejects.toThrow('Network error');
  });
});

describe('缂撳瓨棰勭儹鍔熻兘', () => {
  test('preheat鏂规硶鑳介鐑涓紦瀛橀」', async () => {
    const items = [
      {
        key: 'key1',
        valueFn: jest.fn().mockResolvedValue('value1'),
        expiry: CACHE_DURATION.SHORT
      },
      {
        key: 'key2',
        valueFn: jest.fn().mockResolvedValue('value2')
      }
    ];
    
    const results = await cacheService.preheat(items);
    
    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(true);
    expect(wx.setStorageSync).toHaveBeenCalledTimes(2);
  });
  
  test('preheat鏂规硶鑳藉鐞嗛鐑け璐ョ殑椤?, async () => {
    const items = [
      {
        key: 'key1',
        valueFn: jest.fn().mockRejectedValue(new Error('Failed'))
      }
    ];
    
    const results = await cacheService.preheat(items);
    
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBe('Failed');
  });
});