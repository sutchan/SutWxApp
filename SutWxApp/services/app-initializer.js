// services/app-initializer.js - 应用初始化管理器
// 用于管理应用的初始化流程和服务注册

/**
 * 应用初始化管理器
 * 负责协调整个应用的初始化流程
 */
class AppInitializer {
  constructor(config = {}) {
    this.config = config;
    this.initializationSteps = [];
    this.logger = null;
  }

  /**
   * 初始化应用
   * 配置环境并启动初始化流程
   * @param {Object} config - 应用配置
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize(config = {}) {
    // 合并配置
    this.config = { ...this.config, ...config };
    
    try {
      // 初始化日志系统
      this._initializeLogger();
      
      // 注册初始化步骤
      this._registerInitializationSteps();
      
      // 执行初始化流程
      await this._executeInitializationSteps();
      
      this.logger?.info('应用初始化完成');
      return true;
    } catch (error) {
      this.logger?.error('应用初始化失败', error);
      console.error('应用初始化失败', error);
      return false;
    }
  }

  /**
   * 重新初始化应用
   * @returns {Promise<boolean>} 重新初始化是否成功
   */
  async reinitialize() {
    try {
      return await this.initialize();
    } catch (error) {
      console.error('重新初始化失败:', error);
      return false;
    }
  }

  /**
   * 关闭应用
   */
  shutdown() {
    // 关闭日志系统
    if (this.logger && typeof this.logger.close === 'function') {
      this.logger.close();
    }
    
    this.logger?.info('应用初始化器关闭');
    
    try {
      // 关闭服务集成器
      const { getServiceIntegrator } = require('./service-integration');
      const serviceIntegrator = getServiceIntegrator();
      if (serviceIntegrator) {
        serviceIntegrator.shutdown();
      }
    } catch (error) {
      console.error('应用关闭失败:', error);
    }
  }

  /**
   * 默认配置常量
   * @private
   */
  get DEFAULT_CONFIG() {
    return {
      environment: 'development',
      debug: true,
      cache: {
        enabled: true,
        defaultExpireTime: 3600000, // 1小时
        shortExpireTime: 300000,     // 5分钟
        longExpireTime: 86400000     // 24小时
      },
      services: {
        autoInitialize: true,
        useAdapters: true
      }
    };
  }

  /**
   * 初始化日志系统
   * @private
   */
  _initializeLogger() {
    // 创建简单的日志记录器
    this.logger = {
      info: (message) => {
        if (this.config.debug) {
          console.log(`[INFO] ${message}`);
        }
      },
      warn: (message) => {
        console.warn(`[WARN] ${message}`);
      },
      error: (message, error) => {
        console.error(`[ERROR] ${message}`, error);
      },
      debug: (message) => {
        if (this.config.debug) {
          console.debug(`[DEBUG] ${message}`);
        }
      }
    };
  }

  /**
   * 注册初始化步骤
   * @private
   */
  _registerInitializationSteps() {
    // 清空现有步骤
    this.initializationSteps = [
      {
        name: '环境配置',
        execute: this._initializeEnvironment.bind(this)
      },
      {
        name: '加载配置文件',
        execute: this._loadConfigurations.bind(this)
      },
      {
        name: '初始化服务层',
        execute: this._initializeServices.bind(this)
      },
      {
        name: '自定义初始化',
        execute: this._customInitialization.bind(this)
      }
    ];
  }

  /**
   * 执行初始化步骤
   * @private
   */
  async _executeInitializationSteps() {
    for (const step of this.initializationSteps) {
      this.logger?.info(`开始执行初始化步骤: ${step.name}`);
      try {
        await step.execute();
        this.logger?.info(`初始化步骤完成: ${step.name}`);
      } catch (error) {
        this.logger?.error(`初始化步骤失败: ${step.name}`, error);
        throw error;
      }
    }
  }

  /**
   * 初始化运行环境
   * @private
   */
  async _initializeEnvironment() {
    // 设置全局环境变量
    this.logger?.info('设置应用环境:', this.config.environment);
    
    // 处理不同环境的特殊配置
    if (this.config.environment === 'production') {
      this.config.debug = false;
    }
  }

  /**
   * 加载配置文件
   * @private
   */
  async _loadConfigurations() {
    try {
      // 延迟导入以避免循环依赖
      const { initializeServiceLayer } = require('./service-integration');
      
      // 先初始化基本服务层，以便加载配置
      await initializeServiceLayer({ minimal: true });
      
      // 加载配置服务
      const { getService } = require('./service-integration');
      const configService = getService('config');
      
      if (configService) {
        // 加载基础配置
        await configService.load('base');
        
        // 加载主题配置
        await configService.load('theme');
        
        // 加载功能配置
        await configService.load('features');
      }
    } catch (error) {
      this.logger?.error('加载配置文件失败:', error);
      // 配置加载失败不应阻止应用启动
    }
  }

  /**
   * 初始化服务层
   * @private
   */
  async _initializeServices() {
    try {
      // 延迟导入以避免循环依赖
      const { initializeServiceLayer } = require('./service-integration');
      
      // 初始化完整服务层
      await initializeServiceLayer({
        useAdapters: this.config.services.useAdapters,
        environment: this.config.environment
      });
    } catch (error) {
      this.logger?.error('初始化服务层失败:', error);
      // 服务初始化失败视为严重错误，应用无法正常运行
      throw error;
    }
  }

  /**
   * 初始化应用生命周期
   * @private
   */
  _initializeAppLifecycle() {
    // 监听小程序生命周期事件
    if (typeof wx !== 'undefined') {
      // 监听小程序显示
      wx.onAppShow(() => {
        this.logger?.info('小程序显示');
      });
      
      // 监听小程序隐藏
      wx.onAppHide(() => {
        this.logger?.info('小程序隐藏');
      });
      
      // 监听小程序错误
      wx.onError((error) => {
        this.logger?.error('小程序发生错误:', error);
      });
    }
    
    // 应用生命周期初始化成功
    return true;
  }

  /**
   * 自定义初始化逻辑
   * @private
   */
  async _customInitialization() {
    // 执行用户自定义初始化逻辑
    if (this.config.customInitialization && typeof this.config.customInitialization === 'function') {
      try {
        await this.config.customInitialization(this);
      } catch (error) {
        this.logger?.error('自定义初始化失败:', error);
        // 自定义初始化失败不应阻止应用启动
      }
    }
    
    // 自定义初始化成功
    return true;
  }

  /**
   * 获取服务实例
   * @param {string} serviceName - 服务名称
   * @returns {Object|null} 服务实例或null
   */
  getService(serviceName) {
    try {
      const { getService } = require('./service-integration');
      return getService(serviceName);
    } catch (error) {
      this.logger?.error(`获取服务[${serviceName}]失败:`, error);
      return null;
    }
  }
}

// 创建全局应用初始化器实例
const appInitializer = new AppInitializer();

/**
 * 导出应用初始化器实例
 */
module.exports = {
  AppInitializer,
  appInitializer,
  
  /**
   * 初始化应用
   * @param {Object} config - 应用配置
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initializeApp(config = {}) {
    return appInitializer.initialize(config);
  },
  
  /**
   * 关闭应用
   */
  shutdownApp() {
    appInitializer.shutdown();
  },
  
  /**
   * 获取应用初始化器实例
   * @returns {AppInitializer} 应用初始化器实例
   */
  getAppInitializer() {
    return appInitializer;
  }
};