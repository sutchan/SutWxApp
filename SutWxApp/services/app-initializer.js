// services/app-initializer.js - 搴旂敤绋嬪簭鍒濆鍖栨ā鍧?// 璐熻矗鍦ㄥ簲鐢ㄥ惎鍔ㄦ椂鍒濆鍖栨湇鍔″眰鍜屽叾浠栨牳蹇冪粍浠?
/**
 * 搴旂敤绋嬪簭鍒濆鍖栨ā鍧? * 鎻愪緵搴旂敤鍚姩鏃剁殑鍒濆鍖栨祦绋嬬鐞? */

const { initializeServices, serviceIntegrator } = require('./service-integration');

/**
 * 搴旂敤鍒濆鍖栧櫒绫? * 绠＄悊搴旂敤绋嬪簭鐨勫垵濮嬪寲娴佺▼
 */
class AppInitializer {
  constructor() {
    this.initialized = false;
    this.initializationSteps = [];
    this.config = null;
    this.logger = null;
  }

  /**
   * 鍒濆鍖栧簲鐢ㄧ▼搴?   * @param {Object} config - 搴旂敤閰嶇疆
   * @returns {Promise<boolean>} 鍒濆鍖栨槸鍚︽垚鍔?   */
  async initialize(config = {}) {
    if (this.initialized) {
      console.warn('搴旂敤鍒濆鍖栧櫒宸茬粡鍒濆鍖?);
      return true;
    }

    try {
      // 瀛樺偍閰嶇疆
      this.config = { ...this._getDefaultConfig(), ...config };
      
      // 鍒濆鍖栨棩蹇楃郴缁?      this._initializeLogger();
      
      // 娉ㄥ唽鍒濆鍖栨楠?      this._registerInitializationSteps();
      
      // 鎵ц鍒濆鍖栨楠?      await this._executeInitializationSteps();
      
      this.initialized = true;
      this.logger?.info('搴旂敤绋嬪簭鍒濆鍖栨垚鍔?);
      return true;
    } catch (error) {
      this.logger?.error('搴旂敤绋嬪簭鍒濆鍖栧け璐?', error);
      console.error('搴旂敤绋嬪簭鍒濆鍖栧け璐?', error);
      return false;
    }
  }

  /**
   * 閲嶆柊鍒濆鍖栧簲鐢ㄧ▼搴?   * @returns {Promise<boolean>} 閲嶆柊鍒濆鍖栨槸鍚︽垚鍔?   */
  async reinitialize() {
    this.initialized = false;
    return this.initialize(this.config);
  }

  /**
   * 鍏抽棴搴旂敤绋嬪簭
   */
  shutdown() {
    try {
      // 鍏抽棴鏈嶅姟闆嗘垚鍣?      serviceIntegrator.shutdown();
      
      // 鎵ц娓呯悊鎿嶄綔
      this._cleanup();
      
      this.initialized = false;
      this.logger?.info('搴旂敤绋嬪簭宸插叧闂?);
    } catch (error) {
      console.error('搴旂敤绋嬪簭鍏抽棴澶辫触:', error);
    }
  }

  /**
   * 鑾峰彇搴旂敤绋嬪簭鐘舵€?   * @returns {Object} 搴旂敤鐘舵€佷俊鎭?   */
  getStatus() {
    return {
      initialized: this.initialized,
      serviceStatus: serviceIntegrator.getStatus(),
      config: this.config
    };
  }

  /**
   * 鍐呴儴鏂规硶锛氳幏鍙栭粯璁ら厤缃?   * @private
   * @returns {Object} 榛樿閰嶇疆
   */
  _getDefaultConfig() {
    return {
      // 鏈嶅姟閰嶇疆
      services: {
        useAdapters: true,
        enableCache: true,
        enableRetry: true,
        retryAttempts: 3,
        retryDelay: 1000
      },
      
      // 缂撳瓨閰嶇疆
      cache: {
        defaultExpireTime: 3600000, // 1灏忔椂
        shortExpireTime: 300000,     // 5鍒嗛挓
        longExpireTime: 86400000     // 24灏忔椂
      },
      
      // API閰嶇疆
      api: {
        baseUrl: '',
        timeout: 30000,
        headers: {}
      },
      
      // 鏃ュ織閰嶇疆
      logging: {
        enabled: true,
        level: 'info'
      }
    };
  }

  /**
   * 鍐呴儴鏂规硶锛氬垵濮嬪寲鏃ュ織绯荤粺
   * @private
   */
  _initializeLogger() {
    const loggingConfig = this.config.logging || {};
    
    // 鍒涘缓绠€鍗曠殑鏃ュ織璁板綍鍣?    this.logger = {
      info: (...args) => {
        if (loggingConfig.enabled && loggingConfig.level !== 'error') {
          console.log('[INFO]', ...args);
        }
      },
      warn: (...args) => {
        if (loggingConfig.enabled && loggingConfig.level !== 'error') {
          console.warn('[WARN]', ...args);
        }
      },
      error: (...args) => {
        if (loggingConfig.enabled) {
          console.error('[ERROR]', ...args);
        }
      },
      debug: (...args) => {
        if (loggingConfig.enabled && loggingConfig.level === 'debug') {
          console.debug('[DEBUG]', ...args);
        }
      }
    };
  }

  /**
   * 鍐呴儴鏂规硶锛氭敞鍐屽垵濮嬪寲姝ラ
   * @private
   */
  _registerInitializationSteps() {
    // 娉ㄥ唽鏍稿績鍒濆鍖栨楠?    this.initializationSteps = [
      {
        name: '鍒濆鍖栨湇鍔″眰',
        execute: async () => {
          return await this._initializeServiceLayer();
        }
      },
      {
        name: '鍔犺浇搴旂敤閰嶇疆',
        execute: async () => {
          return await this._loadAppConfig();
        }
      },
      {
        name: '鍒濆鍖栫紦瀛樼瓥鐣?,
        execute: async () => {
          return await this._initializeCachePolicies();
        }
      },
      {
        name: '娉ㄥ唽鍏ㄥ眬閿欒澶勭悊',
        execute: async () => {
          return await this._registerErrorHandlers();
        }
      },
      {
        name: '鎵ц鑷畾涔夊垵濮嬪寲',
        execute: async () => {
          return await this._executeCustomInitialization();
        }
      }
    ];
  }

  /**
   * 鍐呴儴鏂规硶锛氭墽琛屽垵濮嬪寲姝ラ
   * @private
   * @returns {Promise<void>}
   */
  async _executeInitializationSteps() {
    for (const step of this.initializationSteps) {
      try {
        this.logger?.info(`鎵ц鍒濆鍖栨楠? ${step.name}`);
        const result = await step.execute();
        
        if (result !== true) {
          throw new Error(`${step.name} 澶辫触`);
        }
        
        this.logger?.info(`鍒濆鍖栨楠ゅ畬鎴? ${step.name}`);
      } catch (error) {
        this.logger?.error(`鍒濆鍖栨楠ゅけ璐? ${step.name}`, error);
        throw error;
      }
    }
  }

  /**
   * 鍐呴儴鏂规硶锛氬垵濮嬪寲鏈嶅姟灞?   * @private
   * @returns {Promise<boolean>}
   */
  async _initializeServiceLayer() {
    const servicesConfig = this.config.services || {};
    
    // 鍒濆鍖栨湇鍔￠泦鎴愬櫒
    return await initializeServices({
      useAdapters: servicesConfig.useAdapters,
      enableCache: servicesConfig.enableCache,
      retryConfig: {
        enabled: servicesConfig.enableRetry,
        attempts: servicesConfig.retryAttempts,
        delay: servicesConfig.retryDelay
      },
      apiConfig: this.config.api
    });
  }

  /**
   * 鍐呴儴鏂规硶锛氬姞杞藉簲鐢ㄩ厤缃?   * @private
   * @returns {Promise<boolean>}
   */
  async _loadAppConfig() {
    try {
      const configService = serviceIntegrator.getService('config');
      
      if (configService && configService.load) {
        // 鍔犺浇鍩虹閰嶇疆
        await configService.load('base');
        
        // 鍔犺浇涓婚閰嶇疆
        await configService.load('theme');
        
        // 鍔犺浇鍔熻兘寮€鍏抽厤缃?        await configService.load('features');
      }
      
      return true;
    } catch (error) {
      this.logger?.error('鍔犺浇搴旂敤閰嶇疆澶辫触:', error);
      // 閰嶇疆鍔犺浇澶辫触涓嶅簲璇ラ樆姝㈠簲鐢ㄥ惎鍔?      return true;
    }
  }

  /**
   * 鍐呴儴鏂规硶锛氬垵濮嬪寲缂撳瓨绛栫暐
   * @private
   * @returns {Promise<boolean>}
   */
  async _initializeCachePolicies() {
    try {
      const cacheService = serviceIntegrator.getService('cache');
      const config = this.config.cache || {};
      
      if (cacheService) {
        // 璁剧疆缂撳瓨绛栫暐
        cacheService.setDefaultExpireTime(config.defaultExpireTime || 3600000);
        
        // 棰勫姞杞藉父鐢ㄧ紦瀛?        if (cacheService.preload) {
          await cacheService.preload(['config', 'categories']);
        }
      }
      
      return true;
    } catch (error) {
      this.logger?.error('鍒濆鍖栫紦瀛樼瓥鐣ュけ璐?', error);
      // 缂撳瓨鍒濆鍖栧け璐ヤ笉搴旇闃绘搴旂敤鍚姩
      return true;
    }
  }

  /**
   * 鍐呴儴鏂规硶锛氭敞鍐屽叏灞€閿欒澶勭悊
   * @private
   * @returns {Promise<boolean>}
   */
  async _registerErrorHandlers() {
    try {
      // 娉ㄥ唽鍏ㄥ眬鏈崟鑾峰紓甯稿鐞?      if (typeof process !== 'undefined' && process.on) {
        process.on('uncaughtException', (error) => {
          this.logger?.error('鏈崟鑾风殑寮傚父:', error);
          // 杩欓噷鍙互娣诲姞涓婃姤閫昏緫
        });
        
        process.on('unhandledRejection', (reason, promise) => {
          this.logger?.error('鏈鐞嗙殑Promise鎷掔粷:', reason);
          // 杩欓噷鍙互娣诲姞涓婃姤閫昏緫
        });
      }
      
      // 鍦ㄥ井淇″皬绋嬪簭鐜涓敞鍐岄敊璇鐞?      if (typeof wx !== 'undefined') {
        wx.onError((error) => {
          this.logger?.error('寰俊灏忕▼搴忛敊璇?', error);
          // 杩欓噷鍙互娣诲姞涓婃姤閫昏緫
        });
      }
      
      return true;
    } catch (error) {
      this.logger?.error('娉ㄥ唽鍏ㄥ眬閿欒澶勭悊澶辫触:', error);
      // 閿欒澶勭悊娉ㄥ唽澶辫触涓嶅簲璇ラ樆姝㈠簲鐢ㄥ惎鍔?      return true;
    }
  }

  /**
   * 鍐呴儴鏂规硶锛氭墽琛岃嚜瀹氫箟鍒濆鍖?   * @private
   * @returns {Promise<boolean>}
   */
  async _executeCustomInitialization() {
    try {
      // 鎵ц閰嶇疆涓寚瀹氱殑鑷畾涔夊垵濮嬪寲鍑芥暟
      if (this.config.customInitialization && typeof this.config.customInitialization === 'function') {
        await this.config.customInitialization(serviceIntegrator);
      }
      
      return true;
    } catch (error) {
      this.logger?.error('鎵ц鑷畾涔夊垵濮嬪寲澶辫触:', error);
      // 鑷畾涔夊垵濮嬪寲澶辫触涓嶅簲璇ラ樆姝㈠簲鐢ㄥ惎鍔?      return true;
    }
  }

  /**
   * 鍐呴儴鏂规硶锛氭墽琛屾竻鐞嗘搷浣?   * @private
   */
  _cleanup() {
    // 娓呯悊璧勬簮
    this.initializationSteps = [];
    this.logger = null;
  }
}

// 鍒涘缓骞跺鍑哄崟渚嬪疄渚?const appInitializer = new AppInitializer();

/**
 * 瀵煎嚭搴旂敤鍒濆鍖栧櫒鍜屼究鎹锋柟娉? */
module.exports = {
  appInitializer,
  AppInitializer, // 瀵煎嚭绫讳緵娴嬭瘯浣跨敤
  
  /**
   * 鍒濆鍖栧簲鐢ㄧ殑渚挎嵎鏂规硶
   * @param {Object} config - 搴旂敤閰嶇疆
   * @returns {Promise<boolean>} 鍒濆鍖栨槸鍚︽垚鍔?   */
  async initializeApp(config = {}) {
    return appInitializer.initialize(config);
  },
  
  /**
   * 鑾峰彇搴旂敤鐘舵€佺殑渚挎嵎鏂规硶
   * @returns {Object} 搴旂敤鐘舵€?   */
  getAppStatus() {
    return appInitializer.getStatus();
  },
  
  /**
   * 鍏抽棴搴旂敤鐨勪究鎹锋柟娉?   */
  shutdownApp() {
    appInitializer.shutdown();
  }
};
\n