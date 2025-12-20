/**
 * 文件名: performanceService.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 性能监控服务，用于跟踪网络请求、页面加载、组件渲染等性能指标
 */

// 性能数据存储
let performanceData = {
  network: [],
  pageLoad: [],
  componentRender: [],
  memory: [],
  apiCalls: {},
  cache: {
    hit: 0,
    miss: 0
  }
};

// 性能监控配置
const config = {
  // 是否启用性能监控
  enabled: true,
  // 是否自动上报性能数据
  autoReport: true,
  // 上报间隔，单位毫秒
  reportInterval: 60 * 1000,
  // 是否记录详细的网络请求数据
  recordNetworkDetails: true,
  // 是否记录组件渲染时间
  recordComponentRender: true
};

// 上报定时器
let reportTimer = null;

/**
 * 性能监控服务
 */
const performanceService = {
  /**
   * 初始化性能监控
   * @param {Object} options - 配置选项
   */
  init(options = {}) {
    // 合并配置
    Object.assign(config, options);
    
    if (config.enabled) {
      // 启动自动上报
      if (config.autoReport) {
        this.startAutoReport();
      }
      
      // 监听页面加载事件
      this._listenPageLoad();
      
      // 监听组件渲染事件
      if (config.recordComponentRender) {
        this._listenComponentRender();
      }
      
      console.log('Performance monitoring initialized');
    }
  },
  
  /**
   * 监听页面加载事件
   * @private
   */
  _listenPageLoad() {
    // 重写Page函数，添加性能监控
    const originalPage = Page;
    
    Page = (options) => {
      // 保存原始生命周期函数
      const originalOnLoad = options.onLoad;
      const originalOnReady = options.onReady;
      const originalOnShow = options.onShow;
      const originalOnHide = options.onHide;
      const originalOnUnload = options.onUnload;
      
      // 页面加载开始时间
      let loadStartTime = 0;
      // 页面显示开始时间
      let showStartTime = 0;
      
      // 重写onLoad
      options.onLoad = function(...args) {
        loadStartTime = Date.now();
        if (originalOnLoad) {
          originalOnLoad.apply(this, args);
        }
      };
      
      // 重写onReady
      options.onReady = function(...args) {
        const loadTime = Date.now() - loadStartTime;
        const pagePath = this.route;
        
        // 记录页面加载时间
        performanceService.recordPageLoad({
          pagePath,
          loadTime,
          timestamp: Date.now()
        });
        
        if (originalOnReady) {
          originalOnReady.apply(this, args);
        }
      };
      
      // 重写onShow
      options.onShow = function(...args) {
        showStartTime = Date.now();
        if (originalOnShow) {
          originalOnShow.apply(this, args);
        }
      };
      
      // 重写onHide
      options.onHide = function(...args) {
        const showDuration = Date.now() - showStartTime;
        const pagePath = this.route;
        
        // 记录页面显示时长
        performanceService.recordPageShowDuration({
          pagePath,
          duration: showDuration,
          timestamp: Date.now()
        });
        
        if (originalOnHide) {
          originalOnHide.apply(this, args);
        }
      };
      
      // 重写onUnload
      options.onUnload = function(...args) {
        const pagePath = this.route;
        
        // 记录页面卸载
        performanceService.recordPageUnload({
          pagePath,
          timestamp: Date.now()
        });
        
        if (originalOnUnload) {
          originalOnUnload.apply(this, args);
        }
      };
      
      // 调用原始Page函数
      return originalPage(options);
    };
  },
  
  /**
   * 监听组件渲染事件
   * @private
   */
  _listenComponentRender() {
    // 重写Component函数，添加性能监控
    const originalComponent = Component;
    
    Component = (options) => {
      // 保存原始生命周期函数
      const originalCreated = options.created;
      const originalAttached = options.attached;
      const originalReady = options.ready;
      const originalDetached = options.detached;
      
      // 组件创建开始时间
      let createStartTime = 0;
      // 组件渲染开始时间
      let renderStartTime = 0;
      
      // 重写created
      options.created = function(...args) {
        createStartTime = Date.now();
        if (originalCreated) {
          originalCreated.apply(this, args);
        }
      };
      
      // 重写attached
      options.attached = function(...args) {
        renderStartTime = Date.now();
        if (originalAttached) {
          originalAttached.apply(this, args);
        }
      };
      
      // 重写ready
      options.ready = function(...args) {
        const renderTime = Date.now() - renderStartTime;
        const createTime = Date.now() - createStartTime;
        const componentName = this.is || this.__wxComponentName;
        
        // 记录组件渲染时间
        performanceService.recordComponentRender({
          componentName,
          createTime,
          renderTime,
          timestamp: Date.now()
        });
        
        if (originalReady) {
          originalReady.apply(this, args);
        }
      };
      
      // 重写detached
      options.detached = function(...args) {
        const componentName = this.is || this.__wxComponentName;
        
        // 记录组件卸载
        performanceService.recordComponentUnload({
          componentName,
          timestamp: Date.now()
        });
        
        if (originalDetached) {
          originalDetached.apply(this, args);
        }
      };
      
      // 调用原始Component函数
      return originalComponent(options);
    };
  },
  
  /**
   * 记录网络请求性能
   * @param {Object} data - 网络请求数据
   * @param {string} data.url - 请求URL
   * @param {string} data.method - 请求方法
   * @param {number} data.startTime - 开始时间
   * @param {number} data.endTime - 结束时间
   * @param {number} data.statusCode - 状态码
   * @param {number} data.responseSize - 响应大小
   * @param {string} data.error - 错误信息
   */
  recordNetwork(data) {
    if (!config.enabled || !config.recordNetworkDetails) {
      return;
    }
    
    const networkData = {
      url: data.url,
      method: data.method || 'GET',
      duration: data.endTime - data.startTime,
      statusCode: data.statusCode,
      responseSize: data.responseSize || 0,
      error: data.error,
      timestamp: Date.now()
    };
    
    performanceData.network.push(networkData);
    
    // 记录API调用次数
    const apiKey = data.url;
    if (!performanceData.apiCalls[apiKey]) {
      performanceData.apiCalls[apiKey] = 0;
    }
    performanceData.apiCalls[apiKey]++;
  },
  
  /**
   * 记录页面加载时间
   * @param {Object} data - 页面加载数据
   * @param {string} data.pagePath - 页面路径
   * @param {number} data.loadTime - 加载时间，单位毫秒
   * @param {number} data.timestamp - 时间戳
   */
  recordPageLoad(data) {
    if (!config.enabled) {
      return;
    }
    
    performanceData.pageLoad.push({
      pagePath: data.pagePath,
      loadTime: data.loadTime,
      timestamp: data.timestamp || Date.now()
    });
  },
  
  /**
   * 记录页面显示时长
   * @param {Object} data - 页面显示数据
   * @param {string} data.pagePath - 页面路径
   * @param {number} data.duration - 显示时长，单位毫秒
   * @param {number} data.timestamp - 时间戳
   */
  recordPageShowDuration(data) {
    if (!config.enabled) {
      return;
    }
    
    // 可以扩展记录页面显示时长
    console.log(`Page ${data.pagePath} shown for ${data.duration}ms`);
  },
  
  /**
   * 记录页面卸载
   * @param {Object} data - 页面卸载数据
   * @param {string} data.pagePath - 页面路径
   * @param {number} data.timestamp - 时间戳
   */
  recordPageUnload(data) {
    if (!config.enabled) {
      return;
    }
    
    // 可以扩展记录页面卸载
    console.log(`Page ${data.pagePath} unloaded`);
  },
  
  /**
   * 记录组件渲染时间
   * @param {Object} data - 组件渲染数据
   * @param {string} data.componentName - 组件名称
   * @param {number} data.createTime - 创建时间，单位毫秒
   * @param {number} data.renderTime - 渲染时间，单位毫秒
   * @param {number} data.timestamp - 时间戳
   */
  recordComponentRender(data) {
    if (!config.enabled || !config.recordComponentRender) {
      return;
    }
    
    performanceData.componentRender.push({
      componentName: data.componentName,
      createTime: data.createTime,
      renderTime: data.renderTime,
      timestamp: data.timestamp || Date.now()
    });
  },
  
  /**
   * 记录组件卸载
   * @param {Object} data - 组件卸载数据
   * @param {string} data.componentName - 组件名称
   * @param {number} data.timestamp - 时间戳
   */
  recordComponentUnload(data) {
    if (!config.enabled || !config.recordComponentRender) {
      return;
    }
    
    // 可以扩展记录组件卸载
    console.log(`Component ${data.componentName} unloaded`);
  },
  
  /**
   * 记录缓存命中情况
   * @param {boolean} hit - 是否命中缓存
   */
  recordCacheHit(hit) {
    if (!config.enabled) {
      return;
    }
    
    if (hit) {
      performanceData.cache.hit++;
    } else {
      performanceData.cache.miss++;
    }
  },
  
  /**
   * 获取性能数据
   * @returns {Object} 性能数据
   */
  getPerformanceData() {
    return {
      ...performanceData,
      cacheHitRate: performanceData.cache.hit + performanceData.cache.miss > 0 
        ? (performanceData.cache.hit / (performanceData.cache.hit + performanceData.cache.miss)).toFixed(2) 
        : '0.00'
    };
  },
  
  /**
   * 上报性能数据
   */
  reportPerformanceData() {
    if (!config.enabled) {
      return;
    }
    
    const data = this.getPerformanceData();
    
    // 这里可以实现性能数据上报逻辑
    // 例如发送到后端服务器
    console.log('Reporting performance data:', data);
    
    // 清空已上报的数据
    this.clearData();
  },
  
  /**
   * 清空性能数据
   */
  clearData() {
    performanceData = {
      network: [],
      pageLoad: [],
      componentRender: [],
      memory: [],
      apiCalls: {},
      cache: {
        hit: 0,
        miss: 0
      }
    };
  },
  
  /**
   * 启动自动上报
   */
  startAutoReport() {
    this.stopAutoReport();
    
    reportTimer = setInterval(() => {
      this.reportPerformanceData();
    }, config.reportInterval);
  },
  
  /**
   * 停止自动上报
   */
  stopAutoReport() {
    if (reportTimer) {
      clearInterval(reportTimer);
      reportTimer = null;
    }
  },
  
  /**
   * 启用性能监控
   */
  enable() {
    config.enabled = true;
    this.init();
  },
  
  /**
   * 禁用性能监控
   */
  disable() {
    config.enabled = false;
    this.stopAutoReport();
  },
  
  /**
   * 获取当前配置
   * @returns {Object} 配置
   */
  getConfig() {
    return { ...config };
  }
};

// 导出性能监控服务
module.exports = performanceService;
