/**
 * 服务管理器
 * 用于统一管理应用中的各种服务实例
 */

class ServiceManager {
  constructor() {
    // 服务注册表
    this.serviceRegistry = {};
    // 服务依赖关系
    this.dependencies = {};
    // 已初始化的服务实例
    this.instances = {};
    // 是否已初始化
    this.initialized = false;
  }

  /**
   * 注册服务
   * @param {string} name - 服务名称
   * @param {Function|Object} service - 服务构造函数或对象
   * @param {Array<string>} deps - 依赖的其他服务列表
   */
  register(name, service, deps = []) {
    if (this.initialized && this.instances[name]) {
      console.warn(`服务 ${name} 已经初始化，重新注册将在下次初始化时生效`);
    }
    
    this.serviceRegistry[name] = service;
    this.dependencies[name] = deps;
  }

  /**
   * 批量注册服务
   * @param {Object} servicesMap - 服务映射对象 {name: {service, deps}}
   */
  registerBulk(servicesMap) {
    if (!servicesMap || typeof servicesMap !== 'object') {
      return;
    }
    
    Object.keys(servicesMap).forEach(name => {
      const { service, deps = [] } = servicesMap[name];
      this.register(name, service, deps);
    });
  }

  /**
   * 初始化所有服务
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      console.warn('服务管理器已经初始化');
      return;
    }

    try {
      // 获取依赖排序后的服务名称列表
      const sortedServices = this._topologicalSort();
      
      // 按顺序初始化每个服务
      for (const name of sortedServices) {
        await this._initializeService(name);
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取依赖排序后的服务名称列表
   * @returns {Array<string>} 排序后的服务名称列表
   */
  _topologicalSort() {
    const visited = new Set();
    const visiting = new Set();
    const sorted = [];
    
    const visit = (node) => {
      if (visited.has(node)) return;
      if (visiting.has(node)) {
        throw new Error(`服务依赖存在循环引用: ${node}`);
      }
      
      visiting.add(node);
      
      // 先访问所有依赖
      for (const dep of this.dependencies[node] || []) {
        if (this.serviceRegistry[dep]) {
          visit(dep);
        }
      }
      
      visiting.delete(node);
      visited.add(node);
      sorted.push(node);
    };
    
    // 对所有服务进行拓扑排序
    Object.keys(this.serviceRegistry).forEach(serviceName => {
      visit(serviceName);
    });
    
    return sorted;
  }

  /**
   * 获取所有服务实例
   * @returns {Object} 服务实例映射
   */
  getInstances() {
    return { ...this.instances };
  }

  /**
   * 获取指定服务实例
   * @param {string} name - 服务名称
   * @returns {*} 服务实例
   */
  getService(name) {
    if (!this.initialized) {
      throw new Error('服务管理器尚未初始化');
    }
    
    if (!this.instances[name]) {
      throw new Error(`服务 ${name} 不存在或未初始化`);
    }
    
    return this.instances[name];
  }

  /**
   * 初始化单个服务
   * @param {string} name - 服务名称
   * @returns {Promise<Object>} 服务实例
   * @private
   */
  async _initializeService(name) {
    // 检查是否正在初始化或已初始化
    if (this.instances[name] === '__initializing__') {
      throw new Error(`服务依赖存在循环引用: ${name}`);
    }
    
    if (this.instances[name]) {
      return this.instances[name];
    }
    
    // 标记为正在初始化
    this.instances[name] = '__initializing__';
    
    try {
      const Service = this.serviceRegistry[name];
      const deps = this.dependencies[name] || [];
      
      // 获取所有依赖的服务实例
      const dependencyInstances = {};
      for (const dep of deps) {
        dependencyInstances[dep] = await this._initializeService(dep);
      }
      
      // 创建服务实例
      let instance;
      if (typeof Service === 'function') {
        // 构造函数方式
        instance = new Service(dependencyInstances);
      } else if (typeof Service === 'object') {
        // 直接对象方式
        instance = Service;
      } else {
        throw new Error(`服务 ${name} 类型无效`);
      }
      
      // 如果服务有初始化方法，调用它
      if (instance.initialize && typeof instance.initialize === 'function') {
        await instance.initialize(dependencyInstances);
      }
      
      this.instances[name] = instance;
      return instance;
    } catch (error) {
      console.error(`初始化服务 ${name} 失败:`, error);
      delete this.instances[name];
      throw error;
    }
  }

  /**
   * 检查服务是否已注册
   * @param {string} name - 服务名称
   * @returns {boolean} 是否已注册
   */
  hasService(name) {
    return !!this.serviceRegistry[name];
  }
}

// 导出单例实例
const serviceManager = new ServiceManager();

module.exports = {
  ServiceManager,
  serviceManager
};
