// 閰嶇疆绠＄悊鏈嶅姟娴嬭瘯
const configService = require('../config-service');
const api = require('../api');

// Mock渚濊禆
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

// Mock缂撳瓨妯″潡
jest.mock('../cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  removeCache: jest.fn(),
  CACHE_KEYS: {
    SYSTEM_CONFIG: 'system_config'
  },
  CACHE_DURATION: {
    VERY_LONG: 86400
  }
}));

const cache = require('../cache');

describe('閰嶇疆绠＄悊鏈嶅姟', () => {
  beforeEach(() => {
    // 娓呴櫎鎵€鏈夋ā鎷熺殑璋冪敤鍘嗗彶
    jest.clearAllMocks();
  });

  describe('getSystemConfig', () => {
    test('浠庣紦瀛樿幏鍙栭厤缃垚鍔?, async () => {
      const mockConfig = { appName: '娴嬭瘯灏忕▼搴?, version: '1.0.0' };
      cache.getCache.mockReturnValue(mockConfig);

      const result = await configService.getSystemConfig();

      expect(cache.getCache).toHaveBeenCalled();
      expect(api.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    test('缂撳瓨涓嶅瓨鍦ㄦ椂浠嶢PI鑾峰彇閰嶇疆', async () => {
      const mockConfig = { appName: '娴嬭瘯灏忕▼搴?, version: '1.0.0' };
      cache.getCache.mockReturnValue(null);
      api.get.mockResolvedValue(mockConfig);

      const result = await configService.getSystemConfig();

      expect(api.get).toHaveBeenCalledWith('/system/config', {
        useCache: true,
        cacheDuration: cache.CACHE_DURATION.VERY_LONG
      });
      expect(cache.setCache).toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    test('API璇锋眰澶辫触浣嗘湁缂撳瓨鏃朵娇鐢ㄧ紦瀛?, async () => {
      const mockConfig = { appName: '娴嬭瘯灏忕▼搴?, version: '1.0.0' };
      cache.getCache.mockReturnValue(mockConfig);
      api.get.mockRejectedValue(new Error('缃戠粶閿欒'));

      const result = await configService.getSystemConfig();

      expect(result).toEqual(mockConfig);
    });

    test('API璇锋眰澶辫触涓旀棤缂撳瓨鏃舵姏鍑洪敊璇?, async () => {
      cache.getCache.mockReturnValue(null);
      api.get.mockRejectedValue(new Error('缃戠粶閿欒'));

      await expect(configService.getSystemConfig()).rejects.toThrow('缃戠粶閿欒');
    });
  });

  describe('getBasicConfig', () => {
    test('鎴愬姛鑾峰彇鍩虹閰嶇疆', async () => {
      const mockConfig = { basic: { appName: '娴嬭瘯灏忕▼搴? } };
      jest.spyOn(configService, 'getSystemConfig').mockResolvedValue(mockConfig);

      const result = await configService.getBasicConfig();

      expect(result).toEqual({ appName: '娴嬭瘯灏忕▼搴? });
    });

    test('鏃犲熀纭€閰嶇疆鏃惰繑鍥炵┖瀵硅薄', async () => {
      const mockConfig = {};
      jest.spyOn(configService, 'getSystemConfig').mockResolvedValue(mockConfig);

      const result = await configService.getBasicConfig();

      expect(result).toEqual({});
    });

    test('鑾峰彇澶辫触鏃惰繑鍥炵┖瀵硅薄', async () => {
      jest.spyOn(configService, 'getSystemConfig').mockRejectedValue(new Error('鑾峰彇澶辫触'));

      const result = await configService.getBasicConfig();

      expect(result).toEqual({});
    });
  });

  describe('getThemeConfig', () => {
    test('鎴愬姛鑾峰彇涓婚閰嶇疆', async () => {
      const mockConfig = { theme: { colors: { primary: '#ff0000' } } };
      jest.spyOn(configService, 'getSystemConfig').mockResolvedValue(mockConfig);

      const result = await configService.getThemeConfig();

      expect(result).toEqual({ colors: { primary: '#ff0000' } });
    });
  });

  describe('getFeatureFlags', () => {
    test('鎴愬姛鑾峰彇鍔熻兘寮€鍏抽厤缃?, async () => {
      const mockConfig = { features: { enableNewUI: true, enableChat: false } };
      jest.spyOn(configService, 'getSystemConfig').mockResolvedValue(mockConfig);

      const result = await configService.getFeatureFlags();

      expect(result).toEqual({ enableNewUI: true, enableChat: false });
    });
  });

  describe('isFeatureEnabled', () => {
    test('鍔熻兘宸插惎鐢ㄦ椂杩斿洖true', async () => {
      const mockConfig = { features: { enableNewUI: true } };
      jest.spyOn(configService, 'getSystemConfig').mockResolvedValue(mockConfig);

      const result = await configService.isFeatureEnabled('enableNewUI');

      expect(result).toBe(true);
    });

    test('鍔熻兘鏈惎鐢ㄦ椂杩斿洖false', async () => {
      const mockConfig = { features: { enableNewUI: false } };
      jest.spyOn(configService, 'getSystemConfig').mockResolvedValue(mockConfig);

      const result = await configService.isFeatureEnabled('enableNewUI');

      expect(result).toBe(false);
    });

    test('鍔熻兘涓嶅瓨鍦ㄦ椂杩斿洖false', async () => {
      const mockConfig = { features: {} };
      jest.spyOn(configService, 'getSystemConfig').mockResolvedValue(mockConfig);

      const result = await configService.isFeatureEnabled('nonExistentFeature');

      expect(result).toBe(false);
    });
  });

  describe('clearConfigCache', () => {
    test('娓呴櫎閰嶇疆缂撳瓨', () => {
      configService.clearConfigCache();

      expect(cache.removeCache).toHaveBeenCalled();
    });
  });

  describe('refreshAllConfigs', () => {
    test('鍒锋柊鎵€鏈夐厤缃?, async () => {
      const spy = jest.spyOn(configService, 'getSystemConfig').mockResolvedValue({});

      await configService.refreshAllConfigs();

      expect(spy).toHaveBeenCalledWith(true);
    });
  });
});
\n