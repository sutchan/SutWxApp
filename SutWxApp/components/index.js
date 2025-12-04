/**
 * 文件名: index.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 描述: 组件管理器，用于注册和管理全局组件
 */

/**
 * 组件配置数组
 * 用于存储所有组件的配置信息
 * - name: 组件名称
 * - path: 组件路径
 * - global: 是否全局注册组件
 */
const components = [
  {
    name: 'lazyImage',
    path: './lazyImage',
    global: true
  },
  {
    name: 'emptyState',
    path: './emptyState',
    global: true
  },
  {
    name: 'productCard',
    path: './productCard',
    global: true
  },
  {
    name: 'orderCard',
    path: './orderCard',
    global: true
  }
];

/**
 * 注册全局组件
 * @param {Object} app - App实例
 * @returns {void}
 */
function registerGlobalComponents(app) {
  if (!app) {
    console.error('注册全局组件失败: 未提供App实例');
    return;
  }
  
  try {
    const registeredComponents = [];
    components.forEach(comp => {
      if (comp.global) {
        try {
          const componentConfig = require(comp.path);
          app.component(comp.name, componentConfig);
          registeredComponents.push(comp.name);
        } catch (error) {
          console.error(`注册组件 ${comp.name} 失败:`, error);
        }
      }
    });
    console.log(`全局组件注册完成: 共注册 ${registeredComponents.length}/${components.filter(c => c.global).length} 个组件`, registeredComponents);
  } catch (error) {
    console.error('注册全局组件失败:', error);
  }
}

/**
 * 获取指定组件配置
 * @param {string} componentName - 组件名称
 * @returns {Object|null} 组件配置对象或null
 */
function getComponent(componentName) {
  return components.find(comp => comp.name === componentName) || null;
}

/**
 * 获取所有组件配置
 * @returns {Array<Object>} 组件配置数组
 */
function getAllComponents() {
  return components;
}

/**
 * 添加组件配置
 * @param {Object} componentConfig - 组件配置
 * @param {string} componentConfig.name - 组件名称
 * @param {string} componentConfig.path - 组件路径
 * @param {boolean} [componentConfig.global=false] - 是否全局注册组件
 * @returns {boolean} 添加是否成功
 */
function addComponent(componentConfig) {
  if (!componentConfig || !componentConfig.name || !componentConfig.path) {
    console.error('添加组件失败: 缺少必要配置');
    return false;
  }
  
  const existingIndex = components.findIndex(comp => comp.name === componentConfig.name);
  if (existingIndex >= 0) {
    console.warn(`组件 ${componentConfig.name} 已存在，将更新配置`);
    components[existingIndex] = componentConfig;
  } else {
    components.push(componentConfig);
  }
  
  return true;
}

module.exports = {
  registerGlobalComponents,
  getComponent,
  getAllComponents,
  addComponent,
  components
}