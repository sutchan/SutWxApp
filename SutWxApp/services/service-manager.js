// services/service-manager.js - 鏈嶅姟绠＄悊鍣?// 鎻愪緵鏈嶅姟鐨勭敓鍛藉懆鏈熺鐞嗐€佷緷璧栨敞鍏ュ拰鍒濆鍖栧姛鑳?
/**
 * 鏈嶅姟绠＄悊鍣ㄧ被
 * 璐熻矗鏈嶅姟鐨勬敞鍐屻€佸垵濮嬪寲銆佷緷璧栨敞鍏ュ拰鐢熷懡鍛ㄦ湡绠＄悊
 */
class ServiceManager {
  constructor() {
    // 鏈嶅姟娉ㄥ唽琛?    this.services = {};
    // 鏈嶅姟瀹炰緥缂撳瓨
    this.instances = {};
    // 鏈嶅姟渚濊禆鍏崇郴鍥?    this.dependencies = {};
    // 鍒濆鍖栫姸鎬?    this.initialized = false;
  }

  /**
   * 娉ㄥ唽鏈嶅姟
   * @param {string} name - 鏈嶅姟鍚嶇О
   * @param {Function|Object} service - 鏈嶅姟鏋勯€犲嚱鏁版垨鏈嶅姟瀵硅薄
   * @param {Array<string>} deps - 渚濊禆鐨勬湇鍔″悕绉板垪琛?   */
  register(name, service, deps = []) {
    if (this.services[name]) {
      console.warn(`鏈嶅姟 ${name} 宸茬粡瀛樺湪锛屽皢琚鐩朻);
    }
    
    this.services[name] = service;
    this.dependencies[name] = deps;
    
    // 濡傛灉鏈嶅姟宸茬粡鍒濆鍖栵紝鍒欐敞閿€鏃у疄渚?    if (this.initialized && this.instances[name]) {
      delete this.instances[name];
    }
  }

  /**
   * 鎵归噺娉ㄥ唽鏈嶅姟
   * @param {Object} servicesMap - 鏈嶅姟鏄犲皠瀵硅薄 { name: { service, deps } }
   */
  registerBulk(servicesMap) {
    Object.keys(servicesMap).forEach(name => {
      const { service, deps = [] } = servicesMap[name];
      this.register(name, service, deps);
    });
  }

  /**
   * 鑾峰彇鏈嶅姟瀹炰緥
   * @param {string} name - 鏈嶅姟鍚嶇О
   * @returns {Object} 鏈嶅姟瀹炰緥
   */
  get(name) {
    // 濡傛灉瀹炰緥宸插瓨鍦紝鐩存帴杩斿洖
    if (this.instances[name]) {
      return this.instances[name];
    }

    // 妫€鏌ユ湇鍔℃槸鍚﹀凡娉ㄥ唽
    if (!this.services[name]) {
      throw new Error(`鏈嶅姟 ${name} 鏈敞鍐宍);
    }

    // 瑙ｆ瀽渚濊禆
    const instance = this._resolveService(name);
    return instance;
  }

  /**
   * 鍒濆鍖栨墍鏈夋湇鍔?   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      console.warn('鏈嶅姟绠＄悊鍣ㄥ凡缁忓垵濮嬪寲');
      return;
    }

    try {
      // 鎸変緷璧栭『搴忓垵濮嬪寲鏈嶅姟
      const sortedServices = this._topologicalSort();
      
      for (const name of sortedServices) {
        await this._resolveService(name);
      }

      this.initialized = true;
      console.log('鎵€鏈夋湇鍔″垵濮嬪寲瀹屾垚');
    } catch (error) {
      console.error('鏈嶅姟鍒濆鍖栧け璐?', error);
      throw error;
    }
  }

  /**
   * 娓呯悊鏈嶅姟瀹炰緥
   */
  clear() {
    this.instances = {};
    this.initialized = false;
  }

  /**
   * 鑾峰彇鎵€鏈夊凡娉ㄥ唽鐨勬湇鍔″悕绉?   * @returns {Array<string>} 鏈嶅姟鍚嶇О鍒楄〃
   */
  getRegisteredServices() {
    return Object.keys(this.services);
  }

  /**
   * 鑾峰彇鎵€鏈夊凡鍒濆鍖栫殑鏈嶅姟瀹炰緥
   * @returns {Object} 鏈嶅姟瀹炰緥鏄犲皠
   */
  getInstances() {
    return { ...this.instances };
  }

  /**
   * 妫€鏌ユ湇鍔℃槸鍚﹀凡鍒濆鍖?   * @returns {boolean} 鏄惁宸插垵濮嬪寲
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * 鍐呴儴鏂规硶锛氳В鏋愭湇鍔′緷璧栧苟鍒涘缓瀹炰緥
   * @private
   * @param {string} name - 鏈嶅姟鍚嶇О
   * @returns {Object} 鏈嶅姟瀹炰緥
   */
  async _resolveService(name) {
    // 妫€鏌ュ惊鐜緷璧?    if (!this.instances[name]) {
      // 鏍囪涓烘鍦ㄥ垵濮嬪寲锛岀敤浜庢娴嬪惊鐜緷璧?      this.instances[name] = '__initializing__';

      try {
        // 瑙ｆ瀽渚濊禆鏈嶅姟
        const depsInstances = {};
        for (const depName of this.dependencies[name]) {
          if (this.instances[depName] === '__initializing__') {
            throw new Error(`妫€娴嬪埌寰幆渚濊禆: ${name} -> ${depName}`);
          }
          depsInstances[depName] = await this._resolveService(depName);
        }

        const service = this.services[name];
        let instance;

        // 鏍规嵁鏈嶅姟绫诲瀷鍒涘缓瀹炰緥
        if (typeof service === 'function') {
          // 鏋勯€犲嚱鏁板舰寮?          instance = new service(depsInstances);
        } else if (typeof service === 'object') {
          // 瀵硅薄褰㈠紡
          instance = service;
        } else {
          throw new Error(`鏈嶅姟 ${name} 绫诲瀷鏃犳晥`);
        }

        // 濡傛灉鏈嶅姟鏈夊垵濮嬪寲鏂规硶锛岃皟鐢ㄥ畠
        if (instance.initialize && typeof instance.initialize === 'function') {
          await instance.initialize(depsInstances);
        }

        this.instances[name] = instance;
      } catch (error) {
        // 鍒濆鍖栧け璐ワ紝娓呯悊鐘舵€?        delete this.instances[name];
        throw error;
      }
    }

    return this.instances[name];
  }

  /**
   * 鍐呴儴鏂规硶锛氭嫇鎵戞帓搴忥紝鎸変緷璧栭『搴忔帓鍒楁湇鍔?   * @private
   * @returns {Array<string>} 鎺掑簭鍚庣殑鏈嶅姟鍚嶇О鍒楄〃
   */
  _topologicalSort() {
    const visited = new Set();
    const result = [];
    const tempVisited = new Set(); // 鐢ㄤ簬妫€娴嬪惊鐜緷璧?
    const visit = (node) => {
      // 妫€娴嬪惊鐜緷璧?      if (tempVisited.has(node)) {
        throw new Error(`妫€娴嬪埌寰幆渚濊禆: ${node}`);
      }

      if (!visited.has(node)) {
        tempVisited.add(node);
        
        // 鍏堣闂緷璧?        for (const dep of this.dependencies[node]) {
          visit(dep);
        }
        
        tempVisited.delete(node);
        visited.add(node);
        result.push(node);
      }
    };

    // 璁块棶鎵€鏈夋湭璁块棶鐨勮妭鐐?    for (const node of Object.keys(this.services)) {
      if (!visited.has(node)) {
        visit(node);
      }
    }

    return result;
  }
}

// 鍒涘缓骞跺鍑哄崟渚嬪疄渚?const serviceManager = new ServiceManager();
module.exports = serviceManager;
module.exports.ServiceManager = ServiceManager; // 瀵煎嚭绫讳緵娴嬭瘯浣跨敤
