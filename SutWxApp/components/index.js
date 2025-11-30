/**
 * 文件名: index.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 描述: 缁勪欢绠＄悊宸ュ叿 - 鐢ㄤ簬闆嗕腑绠＄悊鍜屾敞鍐屽叏灞€缁勪欢
 */

/**
 * 缁勪欢鍒楄〃閰嶇疆
 * 姣忎釜缁勪欢鍖呭惈浠ヤ笅灞炴€э細
 * - name: 缁勪欢鍚嶇О
 * - path: 缁勪欢璺緞
 * - global: 鏄惁鍏ㄥ眬娉ㄥ唽
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
 * 鍏ㄥ眬娉ㄥ唽缁勪欢
 * @param {Object} app - App瀹炰緥
 * @returns {void}
 */
function registerGlobalComponents(app) {
  if (!app) {
    console.error('娉ㄥ唽缁勪欢澶辫触: App瀹炰緥涓嶅瓨鍦?);
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
          console.error(`缁勪欢 ${comp.name} 娉ㄥ唽澶辫触:`, error);
        }
      }
    });
    console.log(`鍏ㄥ眬缁勪欢娉ㄥ唽瀹屾垚锛屾垚鍔熸敞鍐?${registeredComponents.length}/${components.filter(c => c.global).length} 涓粍浠?`, registeredComponents);
  } catch (error) {
    console.error('鍏ㄥ眬缁勪欢娉ㄥ唽澶辫触:', error);
  }
}

/**
 * 鑾峰彇缁勪欢閰嶇疆
 * @param {string} componentName - 缁勪欢鍚嶇О
 * @returns {Object|null} 缁勪欢閰嶇疆鎴杗ull
 */
function getComponent(componentName) {
  return components.find(comp => comp.name === componentName) || null;
}

/**
 * 鑾峰彇鎵€鏈夌粍浠跺垪琛? * @returns {Array<Object>} 缁勪欢鍒楄〃
 */
function getAllComponents() {
  return components;
}

/**
 * 娣诲姞鏂扮粍浠跺埌閰嶇疆
 * @param {Object} componentConfig - 缁勪欢閰嶇疆
 * @param {string} componentConfig.name - 缁勪欢鍚嶇О
 * @param {string} componentConfig.path - 缁勪欢璺緞
 * @param {boolean} [componentConfig.global=false] - 鏄惁鍏ㄥ眬娉ㄥ唽
 * @returns {boolean} 娣诲姞缁撴灉
 */
function addComponent(componentConfig) {
  if (!componentConfig || !componentConfig.name || !componentConfig.path) {
    console.error('娣诲姞缁勪欢澶辫触: 閰嶇疆涓嶅畬鏁?);
    return false;
  }
  
  const existingIndex = components.findIndex(comp => comp.name === componentConfig.name);
  if (existingIndex >= 0) {
    console.warn(`缁勪欢 ${componentConfig.name} 宸插瓨鍦紝灏嗚瑕嗙洊`);
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
