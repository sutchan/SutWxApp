/**
 * 鏂囦欢鍚? useStore.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-24
 * 浣滆€? Sut
 * 鐘舵€佺鐞嗚緟鍔╁嚱鏁帮紝鎻愪緵鍦ㄩ〉闈㈠拰缁勪欢涓娇鐢╯tore鐨勪究鎹锋柟娉曪紝鏀寔鐘舵€佹槧灏勫拰mutations缁戝畾
 */

const store = require('./store.js');

/**
 * 椤甸潰鍜岀粍浠朵娇鐢╯tore鐨勮緟鍔╂柟娉? * @param {Object} options - 缁勪欢閫夐」
 * @param {Array} mapState - 闇€瑕佹槧灏勭殑鐘舵€佽矾寰勬暟缁? * @param {Object} mapMutations - 闇€瑕佹槧灏勭殑mutations瀵硅薄
 * @returns {Object} 澧炲己鍚庣殑缁勪欢閫夐」
 */
function useStore(options = {}, mapState = [], mapMutations = {}) {
  const { onLoad, onUnload, ...restOptions } = options;
  
  return {
    ...restOptions,
    
    // 缁勪欢鏁版嵁涓垵濮嬪寲store鐘舵€?    data: {
      ...(options.data || {}),
      ...mapState.reduce((stateMap, statePath) => {
        stateMap[getStateKey(statePath)] = store.getState(statePath);
        return stateMap;
      }, {})
    },
    
    // 鐢熷懡鍛ㄦ湡鏂规硶锛氱粍浠跺姞杞芥椂璁㈤槄store
    onLoad(options) {
      // 鐢熸垚鍞竴鏍囪瘑绗︾敤浜庤闃?      this._storeId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 璁㈤槄store鍙樺寲
      store.subscribe(this._storeId, (newState) => {
        // 鏇存柊鏄犲皠鐨勭姸鎬?        const updateData = {};
        mapState.forEach(statePath => {
          const key = getStateKey(statePath);
          const value = store.getState(statePath);
          if (this.data[key] !== value) {
            updateData[key] = value;
          }
        });
        
        // 濡傛灉鏈夋暟鎹彉鍖栵紝鏇存柊缁勪欢鏁版嵁
        if (Object.keys(updateData).length > 0) {
          this.setData(updateData);
        }
      });
      
      // 璋冪敤鍘熷鐨刼nLoad
      if (onLoad) {
        onLoad.call(this, options);
      }
    },
    
    // 鐢熷懡鍛ㄦ湡鏂规硶锛氱粍浠跺嵏杞芥椂鍙栨秷璁㈤槄
    onUnload() {
      if (this._storeId) {
        store.unsubscribe(this._storeId);
      }
      
      // 璋冪敤鍘熷鐨刼nUnload
      if (onUnload) {
        onUnload.call(this);
      }
    },
    
    // 鏄犲皠mutations鍒扮粍浠舵柟娉?    ...Object.keys(mapMutations).reduce((methods, methodName) => {
      methods[methodName] = function(payload) {
        store.commit(mapMutations[methodName], payload);
      };
      return methods;
    }, {})
  };
}

/**
 * 灏嗙姸鎬佽矾寰勮浆鎹负缁勪欢鏁版嵁閿悕
 * @param {string} statePath - 鐘舵€佽矾寰? * @returns {string} 杞崲鍚庣殑閿悕
 */
function getStateKey(statePath) {
  return statePath.replace(/\./g, '_');
}

/**
 * 鍒涘缓store缁戝畾鐨勯〉闈㈤厤缃? * @param {Array} mapState - 闇€瑕佹槧灏勭殑鐘舵€佽矾寰勬暟缁? * @param {Object} mapMutations - 闇€瑕佹槧灏勭殑mutations瀵硅薄
 * @returns {Function} 椤甸潰澧炲己鍑芥暟
 */
function createPage(mapState = [], mapMutations = {}) {
  return function(options) {
    return useStore(options, mapState, mapMutations);
  };
}

/**
 * 鍒涘缓store缁戝畾鐨勭粍浠堕厤缃? * @param {Array} mapState - 闇€瑕佹槧灏勭殑鐘舵€佽矾寰勬暟缁? * @param {Object} mapMutations - 闇€瑕佹槧灏勭殑mutations瀵硅薄
 * @returns {Function} 缁勪欢澧炲己鍑芥暟
 */
function createComponent(mapState = [], mapMutations = {}) {
  return function(options) {
    // 瀵逛簬缁勪欢锛屼娇鐢╟reated鍜宒etached鐢熷懡鍛ㄦ湡
    const { created, detached, ...restOptions } = options;
    
    const storeOptions = useStore(restOptions, mapState, mapMutations);
    
    return {
      ...storeOptions,
      created() {
        // 缁勪欢鍒涘缓鏃惰闃卻tore
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
        // 缁勪欢鍒嗙鏃跺彇娑堣闃?        if (this._storeId) {
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
