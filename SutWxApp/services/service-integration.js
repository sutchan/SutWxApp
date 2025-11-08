// services/service-integration.js - 鏈嶅姟闆嗘垚妯″潡
// 璐熻矗鍒濆鍖栧拰閰嶇疆鎵€鏈夋湇鍔★紝鎻愪緵缁熶竴鐨勯泦鎴愭帴鍙?
/**
 * 鏈嶅姟闆嗘垚妯″潡
 * 闆嗕腑绠＄悊鏈嶅姟鐨勫垵濮嬪寲銆侀厤缃拰闆嗘垚
 */

const { registerServiceAdapters, serviceManager } = require('./service-adapter');
const { ServiceFactory } = require('./index');

/**
 * 鏈嶅姟闆嗘垚鍣ㄧ被
 * 鎻愪緵鏈嶅姟鐨勫垵濮嬪寲銆侀厤缃拰璁块棶鍔熻兘
 */
class ServiceIntegrator {
  constructor() {
    this.isInitialized = false;
    this.config = null;
  }
  
  /**
   * 鍒濆鍖栨湇鍔￠泦鎴愬櫒
   * @param {Object} config - 闆嗘垚鍣ㄩ厤缃?   * @param {boolean} useAdapters - 鏄惁浣跨敤閫傞厤鍣ㄦā寮?   * @returns {Promise<boolean>} 鍒濆鍖栨槸鍚︽垚鍔?   */
  async initialize(config = {}, useAdapters = true) {
    if (this.isInitialized) {
      console.warn('鏈嶅姟闆嗘垚鍣ㄥ凡缁忓垵濮嬪寲');
      return true;
    }
    
    try {
      // 瀛樺偍閰嶇疆
      this.config = config;
      
      // 鍔犺浇鎵€鏈夋湇鍔℃ā鍧?      const services = await this._loadServices();
      
      if (useAdapters) {
        // 浣跨敤閫傞厤鍣ㄦā寮忓垵濮嬪寲鏈嶅姟
        await this._initializeWithAdapters(services);
      } else {
        // 鐩存帴鍒濆鍖栨湇鍔?        await this._initializeDirect(services);
      }
      
      // 鎵ц鏈嶅姟鍚庡垵濮嬪寲閽╁瓙
      await this._postInitialize();
      
      this.isInitialized = true;
      console.log('鏈嶅姟闆嗘垚鍣ㄥ垵濮嬪寲鎴愬姛');
      return true;
    } catch (error) {
      console.error('鏈嶅姟闆嗘垚鍣ㄥ垵濮嬪寲澶辫触:', error);
      return false;
    }
  }
  
  /**
   * 鑾峰彇鏈嶅姟瀹炰緥
   * @param {string} serviceName - 鏈嶅姟鍚嶇О
   * @returns {Object|null} 鏈嶅姟瀹炰緥
   */
  getService(serviceName) {
    if (!this.isInitialized) {
      console.error('鏈嶅姟闆嗘垚鍣ㄦ湭鍒濆鍖?);
      return null;
    }
    
    // 浼樺厛浠巗erviceManager鑾峰彇
    try {
      return serviceManager.get(serviceName);
    } catch (error) {
      // 鍥為€€鍒癝erviceFactory
      return ServiceFactory.getService(serviceName);
    }
  }
  
  /**
   * 鑾峰彇鎵€鏈夋湇鍔?   * @returns {Object} 鎵€鏈夋湇鍔＄殑鏄犲皠
   */
  getAllServices() {
    if (!this.isInitialized) {
      console.error('鏈嶅姟闆嗘垚鍣ㄦ湭鍒濆鍖?);
      return {};
    }
    
    // 鍚堝苟serviceManager鍜孲erviceFactory鐨勬湇鍔?    const smServices = serviceManager.getInstances();
    const sfServices = ServiceFactory.getAllServices();
    
    return {
      ...sfServices,
      ...smServices
    };
  }
  
  /**
   * 閲嶆柊鍒濆鍖栨湇鍔?   * @returns {Promise<boolean>} 閲嶆柊鍒濆鍖栨槸鍚︽垚鍔?   */
  async reinitialize() {
    // 娓呯悊鐜版湁鐘舵€?    this.isInitialized = false;
    serviceManager.clear();
    
    // 閲嶆柊鍒濆鍖?    return this.initialize(this.config);
  }
  
  /**
   * 鍏抽棴鏈嶅姟闆嗘垚鍣?   */
  shutdown() {
    // 娓呯悊璧勬簮
    this.isInitialized = false;
    serviceManager.clear();
    this.config = null;
    console.log('鏈嶅姟闆嗘垚鍣ㄥ凡鍏抽棴');
  }
  
  /**
   * 鑾峰彇闆嗘垚鍣ㄧ姸鎬?   * @returns {Object} 闆嗘垚鍣ㄧ姸鎬佷俊鎭?   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      registeredServices: serviceManager.getRegisteredServices(),
      config: this.config
    };
  }
  
  /**
   * 鑾峰彇鍒濆鍖栫姸鎬侊紙鐢ㄤ簬娴嬭瘯锛?   * @returns {Object} 鍒濆鍖栫姸鎬佷俊鎭?   */
  getInitializationStatus() {
    return {
      initialized: this.isInitialized,
      initializationTime: this.initializationTime,
      error: this.initializationError
    };
  }
  
  /**
   * 鍐呴儴鏂规硶锛氬姞杞芥墍鏈夋湇鍔℃ā鍧?   * @private
   * @returns {Promise<Object>} 鏈嶅姟鏄犲皠瀵硅薄
   */
  async _loadServices() {
    // 鍔ㄦ€佸姞杞芥墍鏈夋湇鍔℃ā鍧?    const services = {
      // 鏍稿績鏈嶅姟
      api: require('../utils/api'),
      cache: require('../utils/cache-service'),
      config: require('../utils/config-service'),
      
      // 鐢ㄦ埛鐩稿叧鏈嶅姟
      auth: require('../utils/auth-service'),
      user: require('../utils/user-service'),
      following: require('../utils/following-service'),
      
      // 鍐呭鐩稿叧鏈嶅姟
      article: require('../utils/article-service'),
      category: require('../utils/category-service'),
      comment: require('../utils/comment-service'),
      
      // 鐢靛晢鐩稿叧鏈嶅姟
      product: require('../utils/product-service'),
      cart: require('../utils/cart-service'),
      order: require('../utils/order-service'),
      address: require('../utils/address-service'),
      payment: require('../utils/payment-service'),
      points: require('../utils/points-service'),
      
      // 杈呭姪鍔熻兘鏈嶅姟
      file: require('../utils/file-service'),
      feedback: require('../utils/feedback-service'),
      analytics: require('../utils/analytics-service'),
      notification: require('../utils/notification-service'),
      search: require('../utils/search-service')
    };
    
    return services;
  }
  
  /**
   * 鍐呴儴鏂规硶锛氫娇鐢ㄩ€傞厤鍣ㄥ垵濮嬪寲鏈嶅姟
   * @private
   * @param {Object} services - 鏈嶅姟鏄犲皠瀵硅薄
   * @returns {Promise<void>}
   */
  async _initializeWithAdapters(services) {
    // 浣跨敤閫傞厤鍣ㄦ敞鍐屽苟鍒濆鍖栨湇鍔?    await registerServiceAdapters(services);
  }
  
  /**
   * 鍐呴儴鏂规硶锛氱洿鎺ュ垵濮嬪寲鏈嶅姟
   * @private
   * @param {Object} services - 鏈嶅姟鏄犲皠瀵硅薄
   * @returns {Promise<void>}
   */
  async _initializeDirect(services) {
    // 鐩存帴娉ㄥ唽鍒皊erviceManager
    const servicesMap = {};
    
    Object.keys(services).forEach(serviceName => {
      servicesMap[serviceName] = {
        service: services[serviceName],
        deps: []
      };
    });
    
    serviceManager.registerBulk(servicesMap);
    await serviceManager.initialize();
  }
  
  /**
   * 鍐呴儴鏂规硶锛氭墽琛屽悗鍒濆鍖栭挬瀛?   * @private
   * @returns {Promise<void>}
   */
  async _postInitialize() {
    // 鎵ц鏈嶅姟闂寸殑鍚庡垵濮嬪寲鎿嶄綔
    try {
      // 鍒濆鍖栭厤缃湇鍔?      const configService = this.getService('config');
      if (configService && configService.loadInitialConfig) {
        await configService.loadInitialConfig();
      }
      
      // 鍒濆鍖栫紦瀛樼瓥鐣?      const cacheService = this.getService('cache');
      if (cacheService && cacheService.setupCachePolicies) {
        await cacheService.setupCachePolicies();
      }
      
    } catch (error) {
      console.warn('鏈嶅姟鍚庡垵濮嬪寲閽╁瓙鎵ц澶辫触:', error);
    }
  }
}

// 鍒涘缓骞跺鍑哄崟渚嬪疄渚?const serviceIntegrator = new ServiceIntegrator();

// 璁剧疆榛樿闆嗘垚鍣紙鐢ㄤ簬娴嬭瘯锛?ServiceIntegrator.defaultIntegrator = serviceIntegrator;

/**
 * 瀵煎嚭鏈嶅姟闆嗘垚鍣ㄥ疄渚嬪拰闆嗘垚鍑芥暟
 */
module.exports = {
  serviceIntegrator,
  ServiceIntegrator, // 瀵煎嚭绫讳緵娴嬭瘯浣跨敤
  
  /**
   * 鍒濆鍖栨湇鍔￠泦鎴愮殑渚挎嵎鏂规硶
   * @param {Object} config - 閰嶇疆瀵硅薄
   * @returns {Promise<boolean>} 鍒濆鍖栨槸鍚︽垚鍔?   */
  async initializeServices(config = {}) {
    // 瀛樺偍鍒濆鍖栨椂闂村拰閿欒淇℃伅锛堢敤浜庢祴璇曪級
    serviceIntegrator.initializationTime = Date.now();
    serviceIntegrator.initializationError = null;
    try {
      const result = await serviceIntegrator.initialize(config);
      if (!result) {
        serviceIntegrator.initializationError = new Error('Initialization failed');
      }
      return result;
    } catch (error) {
      serviceIntegrator.initializationError = error;
      return false;
    }
  },
  
  /**
   * 鑾峰彇鏈嶅姟鐨勪究鎹锋柟娉?   * @param {string} serviceName - 鏈嶅姟鍚嶇О
   * @returns {Object|null} 鏈嶅姟瀹炰緥
   */
  getService(serviceName) {
    // 鐩存帴杩斿洖榛樿闆嗘垚鍣ㄤ腑鐨勬湇鍔★紙閽堝娴嬭瘯鐜浼樺寲锛?    if (ServiceIntegrator.defaultIntegrator && ServiceIntegrator.defaultIntegrator[serviceName]) {
      return ServiceIntegrator.defaultIntegrator[serviceName];
    }
    
    // 灏濊瘯浠巗erviceIntegrator瀹炰緥鑾峰彇
    if (serviceIntegrator && serviceIntegrator.getService) {
      return serviceIntegrator.getService(serviceName);
    }
    
    return null;
  }
};
