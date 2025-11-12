锘?/ services/service-integration.js - 閺堝秴濮熼梿鍡樺灇濡€虫健
// 鐠愮喕鐭楅崚婵嗩潗閸栨牕鎷伴柊宥囩枂閹碘偓閺堝婀囬崝鈽呯礉閹绘劒绶电紒鐔剁閻ㄥ嫰娉﹂幋鎰复閸?
/**
 * 閺堝秴濮熼梿鍡樺灇濡€虫健
 * 闂嗗棔鑵戠粻锛勬倞閺堝秴濮熼惃鍕灥婵瀵查妴渚€鍘ょ純顔兼嫲闂嗗棙鍨? */

const { registerServiceAdapters, serviceManager } = require('./service-adapter');
const { ServiceFactory } = require('./index');

/**
 * 閺堝秴濮熼梿鍡樺灇閸ｃ劎琚? * 閹绘劒绶甸張宥呭閻ㄥ嫬鍨垫慨瀣閵嗕線鍘ょ純顔兼嫲鐠佸潡妫堕崝鐔诲厴
 */
class ServiceIntegrator {
  constructor() {
    this.isInitialized = false;
    this.config = null;
  }
  
  /**
   * 閸掓繂顫愰崠鏍ㄦ箛閸旓繝娉﹂幋鎰珤
   * @param {Object} config - 闂嗗棙鍨氶崳銊╁帳缂?   * @param {boolean} useAdapters - 閺勵垰鎯佹担璺ㄦ暏闁倿鍘ら崳銊δ佸?   * @returns {Promise<boolean>} 閸掓繂顫愰崠鏍ㄦЦ閸氾附鍨氶崝?   */
  async initialize(config = {}, useAdapters = true) {
    if (this.isInitialized) {
      console.warn('閺堝秴濮熼梿鍡樺灇閸ｃ劌鍑＄紒蹇撳灥婵瀵?);
      return true;
    }
    
    try {
      // 鐎涙ê鍋嶉柊宥囩枂
      this.config = config;
      
      // 閸旂姾娴囬幍鈧張澶嬫箛閸斺剝膩閸?      const services = await this._loadServices();
      
      if (useAdapters) {
        // 娴ｈ法鏁ら柅鍌炲帳閸ｃ劍膩瀵繐鍨垫慨瀣閺堝秴濮?        await this._initializeWithAdapters(services);
      } else {
        // 閻╁瓨甯撮崚婵嗩潗閸栨牗婀囬崝?        await this._initializeDirect(services);
      }
      
      // 閹笛嗩攽閺堝秴濮熼崥搴″灥婵瀵查柦鈺佺摍
      await this._postInitialize();
      
      this.isInitialized = true;
      console.log('閺堝秴濮熼梿鍡樺灇閸ｃ劌鍨垫慨瀣閹存劕濮?);
      return true;
    } catch (error) {
      console.error('閺堝秴濮熼梿鍡樺灇閸ｃ劌鍨垫慨瀣婢惰精瑙?', error);
      return false;
    }
  }
  
  /**
   * 閼惧嘲褰囬張宥呭鐎圭偘绶?   * @param {string} serviceName - 閺堝秴濮熼崥宥囆?   * @returns {Object|null} 閺堝秴濮熺€圭偘绶?   */
  getService(serviceName) {
    if (!this.isInitialized) {
      console.error('閺堝秴濮熼梿鍡樺灇閸ｃ劍婀崚婵嗩潗閸?);
      return null;
    }
    
    // 娴兼ê鍘涙禒宸梕rviceManager閼惧嘲褰?    try {
      return serviceManager.get(serviceName);
    } catch (error) {
      // 閸ョ偤鈧偓閸掔櫇erviceFactory
      return ServiceFactory.getService(serviceName);
    }
  }
  
  /**
   * 閼惧嘲褰囬幍鈧張澶嬫箛閸?   * @returns {Object} 閹碘偓閺堝婀囬崝锛勬畱閺勭姴鐨?   */
  getAllServices() {
    if (!this.isInitialized) {
      console.error('閺堝秴濮熼梿鍡樺灇閸ｃ劍婀崚婵嗩潗閸?);
      return {};
    }
    
    // 閸氬牆鑻焥erviceManager閸滃erviceFactory閻ㄥ嫭婀囬崝?    const smServices = serviceManager.getInstances();
    const sfServices = ServiceFactory.getAllServices();
    
    return {
      ...sfServices,
      ...smServices
    };
  }
  
  /**
   * 闁插秵鏌婇崚婵嗩潗閸栨牗婀囬崝?   * @returns {Promise<boolean>} 闁插秵鏌婇崚婵嗩潗閸栨牗妲搁崥锔藉灇閸?   */
  async reinitialize() {
    // 濞撳懐鎮婇悳鐗堟箒閻樿埖鈧?    this.isInitialized = false;
    serviceManager.clear();
    
    // 闁插秵鏌婇崚婵嗩潗閸?    return this.initialize(this.config);
  }
  
  /**
   * 閸忔娊妫撮張宥呭闂嗗棙鍨氶崳?   */
  shutdown() {
    // 濞撳懐鎮婄挧鍕爱
    this.isInitialized = false;
    serviceManager.clear();
    this.config = null;
    console.log('閺堝秴濮熼梿鍡樺灇閸ｃ劌鍑￠崗鎶芥４');
  }
  
  /**
   * 閼惧嘲褰囬梿鍡樺灇閸ｃ劎濮搁幀?   * @returns {Object} 闂嗗棙鍨氶崳銊уЦ閹椒淇婇幁?   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      registeredServices: serviceManager.getRegisteredServices(),
      config: this.config
    };
  }
  
  /**
   * 閼惧嘲褰囬崚婵嗩潗閸栨牜濮搁幀渚婄礄閻劋绨ù瀣槸閿?   * @returns {Object} 閸掓繂顫愰崠鏍Ц閹椒淇婇幁?   */
  getInitializationStatus() {
    return {
      initialized: this.isInitialized,
      initializationTime: this.initializationTime,
      error: this.initializationError
    };
  }
  
  /**
   * 閸愬懘鍎撮弬瑙勭《閿涙艾濮炴潪鑺ュ閺堝婀囬崝鈩兡侀崸?   * @private
   * @returns {Promise<Object>} 閺堝秴濮熼弰鐘茬殸鐎电钖?   */
  async _loadServices() {
    // 閸斻劍鈧礁濮炴潪鑺ュ閺堝婀囬崝鈩兡侀崸?    const services = {
      // 閺嶇绺鹃張宥呭
      api: require('../utils/api'),
      cache: require('../utils/cache-service'),
      config: require('../utils/config-service'),
      
      // 閻劍鍩涢惄绋垮彠閺堝秴濮?      auth: require('../utils/auth-service'),
      user: require('../utils/user-service'),
      following: require('../utils/following-service'),
      
      // 閸愬懎顔愰惄绋垮彠閺堝秴濮?      article: require('../utils/article-service'),
      category: require('../utils/category-service'),
      comment: require('../utils/comment-service'),
      
      // 閻㈤潧鏅㈤惄绋垮彠閺堝秴濮?      product: require('../utils/product-service'),
      cart: require('../utils/cart-service'),
      order: require('../utils/order-service'),
      address: require('../utils/address-service'),
      payment: require('../utils/payment-service'),
      points: require('../utils/points-service'),
      
      // 鏉堝懎濮崝鐔诲厴閺堝秴濮?      file: require('../utils/file-service'),
      feedback: require('../utils/feedback-service'),
      analytics: require('../utils/analytics-service'),
      notification: require('../utils/notification-service'),
      search: require('../utils/search-service')
    };
    
    return services;
  }
  
  /**
   * 閸愬懘鍎撮弬瑙勭《閿涙矮濞囬悽銊┾偓鍌炲帳閸ｃ劌鍨垫慨瀣閺堝秴濮?   * @private
   * @param {Object} services - 閺堝秴濮熼弰鐘茬殸鐎电钖?   * @returns {Promise<void>}
   */
  async _initializeWithAdapters(services) {
    // 娴ｈ法鏁ら柅鍌炲帳閸ｃ劍鏁為崘灞借嫙閸掓繂顫愰崠鏍ㄦ箛閸?    await registerServiceAdapters(services);
  }
  
  /**
   * 閸愬懘鍎撮弬瑙勭《閿涙氨娲块幒銉ュ灥婵瀵查張宥呭
   * @private
   * @param {Object} services - 閺堝秴濮熼弰鐘茬殸鐎电钖?   * @returns {Promise<void>}
   */
  async _initializeDirect(services) {
    // 閻╁瓨甯村▔銊ュ斀閸掔殜erviceManager
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
   * 閸愬懘鍎撮弬瑙勭《閿涙碍澧界悰灞芥倵閸掓繂顫愰崠鏍尙鐎?   * @private
   * @returns {Promise<void>}
   */
  async _postInitialize() {
    // 閹笛嗩攽閺堝秴濮熼梻瀵告畱閸氬骸鍨垫慨瀣閹垮秳缍?    try {
      // 閸掓繂顫愰崠鏍帳缂冾喗婀囬崝?      const configService = this.getService('config');
      if (configService && configService.loadInitialConfig) {
        await configService.loadInitialConfig();
      }
      
      // 閸掓繂顫愰崠鏍处鐎涙鐡ラ悾?      const cacheService = this.getService('cache');
      if (cacheService && cacheService.setupCachePolicies) {
        await cacheService.setupCachePolicies();
      }
      
    } catch (error) {
      console.warn('閺堝秴濮熼崥搴″灥婵瀵查柦鈺佺摍閹笛嗩攽婢惰精瑙?', error);
    }
  }
}

// 閸掓稑缂撻獮璺侯嚤閸戝搫宕熸笟瀣杽娓?const serviceIntegrator = new ServiceIntegrator();

// 鐠佸墽鐤嗘妯款吇闂嗗棙鍨氶崳顭掔礄閻劋绨ù瀣槸閿?ServiceIntegrator.defaultIntegrator = serviceIntegrator;

/**
 * 鐎电厧鍤張宥呭闂嗗棙鍨氶崳銊ョ杽娓氬鎷伴梿鍡樺灇閸戣姤鏆? */
module.exports = {
  serviceIntegrator,
  ServiceIntegrator, // 鐎电厧鍤猾璁崇返濞村鐦担璺ㄦ暏
  
  /**
   * 閸掓繂顫愰崠鏍ㄦ箛閸旓繝娉﹂幋鎰畱娓氭寧宓庨弬瑙勭《
   * @param {Object} config - 闁板秶鐤嗙€电钖?   * @returns {Promise<boolean>} 閸掓繂顫愰崠鏍ㄦЦ閸氾附鍨氶崝?   */
  async initializeServices(config = {}) {
    // 鐎涙ê鍋嶉崚婵嗩潗閸栨牗妞傞梻鏉戞嫲闁挎瑨顕ゆ穱鈩冧紖閿涘牏鏁ゆ禍搴㈢ゴ鐠囨洩绱?    serviceIntegrator.initializationTime = Date.now();
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
   * 閼惧嘲褰囬張宥呭閻ㄥ嫪绌堕幑閿嬫煙濞?   * @param {string} serviceName - 閺堝秴濮熼崥宥囆?   * @returns {Object|null} 閺堝秴濮熺€圭偘绶?   */
  getService(serviceName) {
    // 閻╁瓨甯存潻鏂挎礀姒涙顓婚梿鍡樺灇閸ｃ劋鑵戦惃鍕箛閸斺槄绱欓柦鍫濐嚠濞村鐦悳顖氼暔娴兼ê瀵查敍?    if (ServiceIntegrator.defaultIntegrator && ServiceIntegrator.defaultIntegrator[serviceName]) {
      return ServiceIntegrator.defaultIntegrator[serviceName];
    }
    
    // 鐏忔繆鐦禒宸梕rviceIntegrator鐎圭偘绶ラ懢宄板絿
    if (serviceIntegrator && serviceIntegrator.getService) {
      return serviceIntegrator.getService(serviceName);
    }
    
    return null;
  }
};
\n