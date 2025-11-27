/**
 * 文件名: useStore.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 状态管理辅助函数，提供在页面和组件中使用store的便捷方法，支持状态映射和mutations绑定
 */

const store = require('./store.js');

/**
 * 页面和组件使用store的辅助方法
 * @param {Object} options - 组件选项
 * @param {Array} mapState - 需要映射的状态路径数组
 * @param {Object} mapMutations - 需要映射的mutations对象
 * @returns {Object} 增强后的组件选项
 */
function useStore(options = {}, mapState = [], mapMutations = {}) {
  const { onLoad, onUnload, ...restOptions } = options;
  
  return {
    ...restOptions,
    
    // 组件数据中初始化store状态
    data: {
      ...(options.data || {}),
      ...mapState.reduce((stateMap, statePath) => {
        stateMap[getStateKey(statePath)] = store.getState(statePath);
        return stateMap;
      }, {})
    },
    
    // 生命周期方法：组件加载时订阅store
    onLoad(options) {
      // 生成唯一标识符用于订阅
      this._storeId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 订阅store变化
      store.subscribe(this._storeId, (newState) => {
        // 更新映射的状态
        const updateData = {};
        mapState.forEach(statePath => {
          const key = getStateKey(statePath);
          const value = store.getState(statePath);
          if (this.data[key] !== value) {
            updateData[key] = value;
          }
        });
        
        // 如果有数据变化，更新组件数据
        if (Object.keys(updateData).length > 0) {
          this.setData(updateData);
        }
      });
      
      // 调用原始的onLoad
      if (onLoad) {
        onLoad.call(this, options);
      }
    },
    
    // 生命周期方法：组件卸载时取消订阅
    onUnload() {
      if (this._storeId) {
        store.unsubscribe(this._storeId);
      }
      
      // 调用原始的onUnload
      if (onUnload) {
        onUnload.call(this);
      }
    },
    
    // 映射mutations到组件方法
    ...Object.keys(mapMutations).reduce((methods, methodName) => {
      methods[methodName] = function(payload) {
        store.commit(mapMutations[methodName], payload);
      };
      return methods;
    }, {})
  };
}

/**
 * 将状态路径转换为组件数据键名
 * @param {string} statePath - 状态路径
 * @returns {string} 转换后的键名
 */
function getStateKey(statePath) {
  return statePath.replace(/\./g, '_');
}

/**
 * 创建store绑定的页面配置
 * @param {Array} mapState - 需要映射的状态路径数组
 * @param {Object} mapMutations - 需要映射的mutations对象
 * @returns {Function} 页面增强函数
 */
function createPage(mapState = [], mapMutations = {}) {
  return function(options) {
    return useStore(options, mapState, mapMutations);
  };
}

/**
 * 创建store绑定的组件配置
 * @param {Array} mapState - 需要映射的状态路径数组
 * @param {Object} mapMutations - 需要映射的mutations对象
 * @returns {Function} 组件增强函数
 */
function createComponent(mapState = [], mapMutations = {}) {
  return function(options) {
    // 对于组件，使用created和detached生命周期
    const { created, detached, ...restOptions } = options;
    
    const storeOptions = useStore(restOptions, mapState, mapMutations);
    
    return {
      ...storeOptions,
      created() {
        // 组件创建时订阅store
        this._storeId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        store.subscribe(this._storeId, (newState) => {
          const updateData = {};
          mapState.forEach(statePath => {
            const key = getStateKey(statePath);
            const value = store.getState(statePath);
            if (this.data[key] !== value) {
              updateData[key] = value;
            }
          });
          
          if (Object.keys(updateData).length > 0) {
            this.setData(updateData);
          }
        });
        
        if (created) {
          created.call(this);
        }
      },
      detached() {
        // 组件分离时取消订阅
        if (this._storeId) {
          store.unsubscribe(this._storeId);
        }
        
        if (detached) {
          detached.call(this);
        }
      }
    };
  };
}

module.exports = {
  useStore,
  createPage,
  createComponent
};
