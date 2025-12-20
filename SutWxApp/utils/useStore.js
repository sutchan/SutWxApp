﻿﻿/**
 * 文件名 useStore.js
 * 版本号 1.0.0
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 状态管理钩子函数，用于在组件中使用状态管理
 */

const store = require('./store.js');

/**
 * 在组件中使用状态管理
 * @param {Object} options - 组件选项
 * @param {Array} mapState - 要映射的状态路径数组
 * @param {Object} mapMutations - 要映射的mutations对象
 * @returns {Object} 处理后的组件选项
 */
function useStore(options = {}, mapState = [], mapMutations = {}) {
  const { onLoad, onUnload, ...restOptions } = options;
  
  return {
    ...restOptions,
    
    // 将状态映射到组件数据
    data: {
      ...(options.data || {}),
      ...mapState.reduce((stateMap, statePath) => {
        stateMap[getStateKey(statePath)] = store.getState(statePath);
        return stateMap;
      }, {})
    },
    
    // 监听页面加载，订阅状态变化
    onLoad(options) {
      // 生成唯一的store ID
      this._storeId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 订阅状态变化
      store.subscribe(this._storeId, (newState) => {
        // 只更新变化的状态
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
      
      // 调用原始的onLoad方法
      if (onLoad) {
        onLoad.call(this, options);
      }
    },
    
    // 监听页面卸载，取消订阅
    onUnload() {
      if (this._storeId) {
        store.unsubscribe(this._storeId);
      }
      
      // 调用原始的onUnload方法
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
 * @returns {string} 组件数据键名
 */
function getStateKey(statePath) {
  return statePath.replace(/\./g, '_');
}

/**
 * 创建页面组件
 * @param {Array} mapState - 要映射的状态路径数组
 * @param {Object} mapMutations - 要映射的mutations对象
 * @returns {Function} 页面组件创建函数
 */
function createPage(mapState = [], mapMutations = {}) {
  return function(options) {
    return useStore(options, mapState, mapMutations);
  };
}

/**
 * 创建组件
 * @param {Array} mapState - 要映射的状态路径数组
 * @param {Object} mapMutations - 要映射的mutations对象
 * @returns {Function} 组件创建函数
 */
function createComponent(mapState = [], mapMutations = {}) {
  return function(options) {
    // 处理组件的created和detached生命周期
    const { created, detached, ...restOptions } = options;
    
    const storeOptions = useStore(restOptions, mapState, mapMutations);
    
    return {
      ...storeOptions,
      created() {
        // 生成唯一的store ID
        this._storeId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 订阅状态变化
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
        // 取消订阅
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