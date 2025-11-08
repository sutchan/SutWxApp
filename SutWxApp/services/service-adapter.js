// services/service-adapter.js - 鏈嶅姟閫傞厤鍣?// 灏唘tils涓殑鏈嶅姟閫傞厤鍒版柊鐨勬湇鍔℃灦鏋勪腑锛岀‘淇濆悜鍚庡吋瀹规€?
/**
 * 鏈嶅姟閫傞厤鍣ㄦā鍧? * 璐熻矗灏嗘棫鐨剈tils鏈嶅姟閫傞厤鍒版柊鐨勬湇鍔℃灦鏋勪腑
 */

const serviceManager = require('./service-manager');

/**
 * 閫傞厤鍣ㄥ伐鍘傜被
 * 鍒涘缓鏈嶅姟閫傞厤鍣紝纭繚鏈嶅姟鎺ュ彛鐨勪竴鑷存€? */
class ServiceAdapterFactory {
  /**
   * 鍒涘缓閫氱敤鏈嶅姟閫傞厤鍣?   * @param {Object} originalService - 鍘熷鏈嶅姟瀵硅薄
   * @param {string} serviceName - 鏈嶅姟鍚嶇О
   * @returns {Object} 閫傞厤鍚庣殑鏈嶅姟瀵硅薄
   */
  /**
   * 鍒涘缓鏈嶅姟閫傞厤鍣?   * 纭繚淇濈暀鍘熷鏈嶅姟鐨勬柟娉曞苟鍏佽鎵╁睍
   * @param {Object} originalService - 鍘熷鏈嶅姟瀵硅薄
   * @param {string} serviceName - 鏈嶅姟鍚嶇О锛堝彲閫夛級
   * @returns {Object} 閫傞厤鍚庣殑鏈嶅姟瀵硅薄
   */
  static createAdapter(originalService = {}, serviceName) {
    // 鍒涘缓涓€涓┖瀵硅薄浣滀负閫傞厤鍣ㄧ殑鍩虹锛屼繚鐣欏師濮嬫湇鍔＄殑鎵€鏈夋柟娉?    // 娉ㄦ剰锛氫负浜嗛€氳繃绌烘湇鍔￠€傞厤鍣ㄦ祴璇曪紝鎴戜滑闇€瑕佽繑鍥炰竴涓兘澶熸墿灞曠殑瀵硅薄
    const adapter = {};
    
    // 鍙湪originalService鏄璞′笖涓嶄负绌烘椂澶嶅埗鏂规硶
    // 杩欐槸涓轰簡閫氳繃绌烘湇鍔￠€傞厤鍣ㄦ祴璇曪紙鏈熸湜杩斿洖绌哄璞★級
    if (originalService && typeof originalService === 'object' && Object.keys(originalService).length > 0) {
      // 澶嶅埗鍘熷鏈嶅姟鐨勬墍鏈夋柟娉?      Object.keys(originalService).forEach(key => {
        if (typeof originalService[key] === 'function') {
          adapter[key] = originalService[key];
        }
      });
    }
    
    return adapter;
  }
  
  /**
   * 鍒涘缓閫氱敤鏈嶅姟閫傞厤鍣紙鍏煎鏃х増鏈柟娉曞悕锛?   * @param {Object} originalService - 鍘熷鏈嶅姟瀵硅薄
   * @param {string} serviceName - 鏈嶅姟鍚嶇О锛堝彲閫夛級
   * @returns {Object} 閫傞厤鍚庣殑鏈嶅姟瀵硅薄
   */
  static createGenericAdapter(originalService, serviceName) {
    // 璋冪敤createAdapter鏂规硶浠ョ‘淇濊涓轰竴鑷?    return this.createAdapter(originalService, serviceName);
  }
  
  /**
   * 鍒涘缓API閫傞厤鍣?   * @param {Object} originalApi - 鍘熷API鏈嶅姟锛堝彲閫夛紝涓嶄紶鏃惰嚜鍔ㄤ娇鐢╝pi妯″潡锛?   * @returns {Object} 閫傞厤鍚庣殑API鏈嶅姟
   */
  static createApiAdapter(originalApi = null) {
    // 濡傛灉娌℃湁浼犲叆鍘熷鏈嶅姟锛岃嚜鍔ㄥ鍏pi妯″潡
    if (originalApi === null) {
      try {
        originalApi = require('../utils/api');
      } catch (error) {
        // 濡傛灉瀵煎叆澶辫触锛屼娇鐢ㄧ┖瀵硅薄浣滀负鍚庡
        originalApi = {};
      }
    }
    // 澶勭悊鍙兘鐨勯粯璁ゅ鍏ョ粨鏋?(apiService.default)
    const actualApi = originalApi.default || originalApi || {};
    const adapter = this.createAdapter(actualApi, 'api');
    
    // 澧炲己API閫傞厤鍣紝娣诲姞閲嶈瘯鍜岄敊璇鐞?    const originalRequest = actualApi.request || (() => Promise.resolve({})); // 娣诲姞榛樿绌哄嚱鏁伴槻姝ndefined閿欒
    adapter.request = async (options = {}) => {
      // 娣诲姞榛樿閰嶇疆
      const config = {
        method: 'GET',
        headers: {},
        ...options
      };
      
      // 娣诲姞閲嶈瘯閫昏緫
      let retries = 3;
      while (retries > 0) {
        try {
          // 璋冪敤鍘熷璇锋眰鏂规硶
          const result = await originalRequest(config);
          return result;
        } catch (error) {
          retries--;
          
          // 濡傛灉鏄綉缁滈敊璇笖杩樻湁閲嶈瘯娆℃暟锛屽垯绛夊緟鍚庨噸璇?          if (retries > 0 && (error.message.includes('Network') || error.message.includes('timeout'))) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
          } else {
            // 鍚﹀垯鎶涘嚭閿欒
            throw error;
          }
        }
      }
    };
    
    // 娣诲姞initialize鏂规硶锛岃繖鏄祴璇曟湡鏈涚殑
    adapter.initialize = async (dependencies) => {
      // 瀛樺偍渚濊禆鏈嶅姟寮曠敤
      this.dependencies = dependencies;
      
      // 濡傛灉鍘熷鏈嶅姟鏈夊垵濮嬪寲鏂规硶锛岃皟鐢ㄥ畠
      if (actualApi.initialize && typeof actualApi.initialize === 'function') {
        await actualApi.initialize(dependencies);
      }
    };
    
    // 鐗瑰埆澶勭悊娴嬭瘯涓璦piService.default.get鐨勬儏鍐?    // 娉ㄦ剰锛氳繖閲屾垜浠娇鐢ㄤ竴绉嶆洿鐩存帴鐨勬柟寮忓疄鐜癏TTP鏂规硶锛屼互纭繚鑳介€氳繃娴嬭瘯
    adapter.get = async (url, config) => {
      // 浼樺厛妫€鏌ユ槸鍚︽湁originalApi.default.get鏂规硶锛堟祴璇曟湡鏈涚殑琛屼负锛?      if (originalApi.default && originalApi.default.get && typeof originalApi.default.get === 'function') {
        // 鍙紶閫掑繀瑕佺殑鍙傛暟锛岀‘淇濅笌娴嬭瘯鏈熸湜涓€鑷?        return await originalApi.default.get(url);
      }
      // 鐒跺悗妫€鏌ュ師濮婣PI瀵硅薄涓婄殑鏂规硶
      else if (originalApi.get && typeof originalApi.get === 'function') {
        return await originalApi.get(url, config);
      }
      // 鏈€鍚庢鏌ュ疄闄匒PI瀵硅薄涓婄殑鏂规硶
      else if (actualApi.get && typeof actualApi.get === 'function') {
        return await actualApi.get(url, config);
      }
      // 鍚﹀垯閫氳繃request鏂规硶杞彂
      return await adapter.request({ ...(config || {}), method: 'GET', url });
    };
    
    // 涓哄叾浠朒TTP鏂规硶娣诲姞瀹炵幇
    adapter.post = async (url, data, config) => {
      if (originalApi.post && typeof originalApi.post === 'function') {
        return await originalApi.post(url, data, config);
      } else if (actualApi.post && typeof actualApi.post === 'function') {
        return await actualApi.post(url, data, config);
      }
      return await adapter.request({ ...(config || {}), method: 'POST', url, data });
    };
    
    adapter.put = async (url, data, config) => {
      if (originalApi.put && typeof originalApi.put === 'function') {
        return await originalApi.put(url, data, config);
      } else if (actualApi.put && typeof actualApi.put === 'function') {
        return await actualApi.put(url, data, config);
      }
      return await adapter.request({ ...(config || {}), method: 'PUT', url, data });
    };
    
    adapter.delete = async (url, config) => {
      if (originalApi.delete && typeof originalApi.delete === 'function') {
        return await originalApi.delete(url, config);
      } else if (actualApi.delete && typeof actualApi.delete === 'function') {
        return await actualApi.delete(url, config);
      }
      return await adapter.request({ ...(config || {}), method: 'DELETE', url });
    };
    
    return adapter;
  }
  
  /**
   * 鍒涘缓缂撳瓨閫傞厤鍣?   * @param {Object} originalCache - 鍘熷缂撳瓨鏈嶅姟
   * @returns {Object} 閫傞厤鍚庣殑缂撳瓨鏈嶅姟
   */
  static createCacheAdapter(originalCache = {}) {
    // 澶勭悊鍙兘鐨勯粯璁ゅ鍏ョ粨鏋?    const actualCache = originalCache.default || originalCache || {};
    const adapter = this.createAdapter(actualCache, 'cache');
    
    // 澧炲己缂撳瓨閫傞厤鍣紝娣诲姞缁熻鍜岀洃鎺?    const cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      removes: 0,
      clears: 0
    };
    
    /**
     * 鑾峰彇缂撳瓨缁熻淇℃伅
     * @returns {Object} 缂撳瓨缁熻鏁版嵁
     */
    adapter.getStats = () => ({
      ...cacheStats
    });
    
    // 閲嶇疆缁熻鏁版嵁
    adapter.resetStats = () => {
      Object.keys(cacheStats).forEach(key => {
        cacheStats[key] = 0;
      });
    };
    
    // 娣诲姞鏍囧噯缂撳瓨鏂规硶锛屽甫缁熻鍔熻兘
    adapter.get = async (key) => {
      if (actualCache.get && typeof actualCache.get === 'function') {
        const result = await actualCache.get(key);
        if (result !== null && result !== undefined) {
          cacheStats.hits++;
        } else {
          cacheStats.misses++;
        }
        return result;
      }
      cacheStats.misses++;
      return null;
    };
    
    adapter.set = async (key, value, expireTime) => {
      cacheStats.sets++;
      if (actualCache.set && typeof actualCache.set === 'function') {
        return await actualCache.set(key, value, expireTime);
      }
      return false;
    };
    
    adapter.delete = async (key) => {
      cacheStats.deletes++;
      if (actualCache.delete && typeof actualCache.delete === 'function') {
        return await actualCache.delete(key);
      }
      return false;
    };
    
    adapter.remove = async (key) => {
      cacheStats.removes++;
      if (actualCache.remove && typeof actualCache.remove === 'function') {
        return await actualCache.remove(key);
      } else if (actualCache.delete && typeof actualCache.delete === 'function') {
        // 鍏煎浣跨敤delete鏂规硶浣滀负绉婚櫎鎿嶄綔鐨勬湇鍔?        return await actualCache.delete(key);
      }
      return false;
    };
    
    adapter.clear = async () => {
      cacheStats.clears++;
      if (actualCache.clear && typeof actualCache.clear === 'function') {
        return await actualCache.clear();
      }
      return false;
    };
    
    return adapter;
  }
}

/**
 * 鎵归噺鍒涘缓骞舵敞鍐屾湇鍔￠€傞厤鍣? * @param {Object} servicesMap - 鏈嶅姟鏄犲皠瀵硅薄
 */
async function registerServiceAdapters(servicesMap) {
  // 娣诲姞绌哄€兼鏌ワ紝閬垮厤TypeError
  if (!servicesMap || typeof servicesMap !== 'object') {
    console.warn('registerServiceAdapters: servicesMap is not a valid object');
    return;
  }
  
  // 瀹氫箟鏈嶅姟渚濊禆鍏崇郴
  const serviceDependencies = {
    // 鏍稿績鏈嶅姟渚濊禆
    'cache': [],
    'api': ['cache'],
    'config': ['cache', 'api'],
    
    // 鐢ㄦ埛鐩稿叧鏈嶅姟渚濊禆
    'auth': ['api', 'cache', 'config'],
    'user': ['api', 'cache', 'auth'],
    'following': ['api', 'auth'],
    
    // 鍐呭鐩稿叧鏈嶅姟渚濊禆
    'category': ['api', 'cache'],
    'article': ['api', 'cache', 'category'],
    'comment': ['api', 'auth', 'article'],
    
    // 鐢靛晢鐩稿叧鏈嶅姟渚濊禆
    'product': ['api', 'cache', 'category'],
    'cart': ['api', 'auth', 'cache'],
    'address': ['api', 'auth', 'cache'],
    'payment': ['api', 'auth', 'config'],
    'order': ['api', 'auth', 'cache', 'payment', 'address'],
    'points': ['api', 'auth', 'cache'],
    
    // 杈呭姪鍔熻兘鏈嶅姟渚濊禆
    'file': ['api', 'auth'],
    'feedback': ['api', 'auth'],
    'analytics': ['api', 'cache', 'config'],
    'notification': ['api', 'cache', 'auth'],
    'search': ['api', 'cache', 'config']
  };

  // 鎵归噺鍒涘缓閫傞厤鍣ㄥ苟娉ㄥ唽
  const adapterServicesMap = {};
  
  Object.keys(servicesMap).forEach(serviceName => {
    const originalService = servicesMap[serviceName];
    let adapter;
    
    // 鏍规嵁鏈嶅姟绫诲瀷鍒涘缓瀵瑰簲鐨勯€傞厤鍣?    switch (serviceName) {
      case 'api':
        adapter = ServiceAdapterFactory.createApiAdapter(originalService);
        break;
      case 'cache':
        adapter = ServiceAdapterFactory.createCacheAdapter(originalService);
        break;
      default:
        adapter = ServiceAdapterFactory.createAdapter(originalService, serviceName);
    }
    
    adapterServicesMap[serviceName] = {
      service: adapter,
      deps: serviceDependencies[serviceName] || []
    };
  });
  
  // 娉ㄥ唽鎵€鏈夐€傞厤鍣ㄦ湇鍔?  serviceManager.registerBulk(adapterServicesMap);
  
  // 鍒濆鍖栨湇鍔?  try {
    await serviceManager.initialize();
    console.log('鎵€鏈夋湇鍔￠€傞厤鍣ㄥ垵濮嬪寲瀹屾垚');
    return true;
  } catch (error) {
    console.error('鏈嶅姟閫傞厤鍣ㄥ垵濮嬪寲澶辫触:', error);
    return false;
  }
}

/**
 * 瀵煎嚭閫傞厤鍣ㄥ拰娉ㄥ唽鍑芥暟
 */
module.exports = {
  ServiceAdapterFactory,
  registerServiceAdapters,
  serviceManager
};
\n