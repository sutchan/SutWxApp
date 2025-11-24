/**
 * 文件名: index.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 描述: 组件管理工具 - 用于集中管理和注册全局组件
 */

/**
 * 组件列表配置
 * 每个组件包含以下属性：
 * - name: 组件名称
 * - path: 组件路径
 * - global: 是否全局注册
 */
const components = [
  {
    name: 'lazyImage',
    path: './lazyImage/lazyImage',
    global: true
  },
  {
    name: 'modal',
    path: './modal/modal',
    global: true
  },
  {
    name: 'emptyState',
    path: './emptyState/emptyState',
    global: true
  },
  {
    name: 'loadMore',
    path: './loadMore/loadMore',
    global: true
  },
  {
    name: 'rating',
    path: './rating/rating',
    global: true
  },
  {
    name: 'productCard',
    path: './productCard/productCard',
    global: true
  },
  {
    name: 'orderCard',
    path: './orderCard/orderCard',
    global: true
  }
];

/**
 * 全局注册组件
 * @param {Object} app - App实例
 */
function registerGlobalComponents(app) {
  if (!app) {
    console.error('注册组件失败: App实例不存在');
    return;
  }
  
  try {
    components.forEach(comp => {
      if (comp.global) {
        app.component(comp.name, comp.path);
      }
    });
    console.log('全局组件注册完成');
  } catch (error) {
    console.error('全局组件注册失败:', error);
  }
}

/**
 * 获取组件配置
 * @param {string} componentName - 组件名称
 * @returns {Object|null} 组件配置或null
 */
function getComponent(componentName) {
  return components.find(comp => comp.name === componentName) || null;
}

/**
 * 获取所有组件列表
 * @returns {Array} 组件列表
 */
function getAllComponents() {
  return components;
}

/**
 * 添加新组件到配置
 * @param {Object} componentConfig - 组件配置
 */
function addComponent(componentConfig) {
  if (!componentConfig || !componentConfig.name || !componentConfig.path) {
    console.error('添加组件失败: 配置不完整');
    return false;
  }
  
  const existingIndex = components.findIndex(comp => comp.name === componentConfig.name);
  if (existingIndex >= 0) {
    console.warn(`组件 ${componentConfig.name} 已存在，将被覆盖`);
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
};
