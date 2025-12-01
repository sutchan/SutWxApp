﻿/**
 * 鏂囦欢鍚? index.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 鎻忚堪: 缂佸嫪娆㈢粻锛勬倞瀹搞儱鍙?- 閻劋绨梿鍡曡厬缁狅紕鎮婇崪灞炬暈閸愬苯鍙忕仦鈧紒鍕
 */

/**
 * 缂佸嫪娆㈤崚妤勩€冮柊宥囩枂
 * 濮ｅ繋閲滅紒鍕閸栧懎鎯堟禒銉ょ瑓鐏炵偞鈧嶇窗
 * - name: 缂佸嫪娆㈤崥宥囆? * - path: 缂佸嫪娆㈢捄顖氱窞
 * - global: 閺勵垰鎯侀崗銊ョ湰濞夈劌鍞? */
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
 * 閸忋劌鐪▔銊ュ斀缂佸嫪娆? * @param {Object} app - App鐎圭偘绶? * @returns {void}
 */
function registerGlobalComponents(app) {
  if (!app) {
    console.error('濞夈劌鍞界紒鍕婢惰精瑙? App鐎圭偘绶ユ稉宥呯摠閸?);
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
          console.error(`缂佸嫪娆?${comp.name} 濞夈劌鍞芥径杈Е:`, error);
        }
      }
    });
    console.log(`閸忋劌鐪紒鍕濞夈劌鍞界€瑰本鍨氶敍灞惧灇閸旂喐鏁為崘?${registeredComponents.length}/${components.filter(c => c.global).length} 娑擃亞绮嶆禒?`, registeredComponents);
  } catch (error) {
    console.error('閸忋劌鐪紒鍕濞夈劌鍞芥径杈Е:', error);
  }
}

/**
 * 閼惧嘲褰囩紒鍕闁板秶鐤? * @param {string} componentName - 缂佸嫪娆㈤崥宥囆? * @returns {Object|null} 缂佸嫪娆㈤柊宥囩枂閹存潡ull
 */
function getComponent(componentName) {
  return components.find(comp => comp.name === componentName) || null;
}

/**
 * 閼惧嘲褰囬幍鈧張澶岀矋娴犺泛鍨悰? * @returns {Array<Object>} 缂佸嫪娆㈤崚妤勩€? */
function getAllComponents() {
  return components;
}

/**
 * 濞ｈ濮為弬鎵矋娴犺泛鍩岄柊宥囩枂
 * @param {Object} componentConfig - 缂佸嫪娆㈤柊宥囩枂
 * @param {string} componentConfig.name - 缂佸嫪娆㈤崥宥囆? * @param {string} componentConfig.path - 缂佸嫪娆㈢捄顖氱窞
 * @param {boolean} [componentConfig.global=false] - 閺勵垰鎯侀崗銊ョ湰濞夈劌鍞? * @returns {boolean} 濞ｈ濮炵紒鎾寸亯
 */
function addComponent(componentConfig) {
  if (!componentConfig || !componentConfig.name || !componentConfig.path) {
    console.error('濞ｈ濮炵紒鍕婢惰精瑙? 闁板秶鐤嗘稉宥呯暚閺?);
    return false;
  }
  
  const existingIndex = components.findIndex(comp => comp.name === componentConfig.name);
  if (existingIndex >= 0) {
    console.warn(`缂佸嫪娆?${componentConfig.name} 瀹告彃鐡ㄩ崷顭掔礉鐏忓棜顫︾憰鍡欐磰`);
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
