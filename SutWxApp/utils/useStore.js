/**
 * 鏂囦欢鍚? useStore.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-24
 * 娴ｆ粏鈧? Sut
 * 閻樿埖鈧胶顓搁悶鍡氱窡閸斺晛鍤遍弫甯礉閹绘劒绶甸崷銊┿€夐棃銏犳嫲缂佸嫪娆㈡稉顓濆▏閻⑩暞tore閻ㄥ嫪绌堕幑閿嬫煙濞夋洩绱濋弨顖涘瘮閻樿埖鈧焦妲х亸鍕嫲mutations缂佹垵鐣? */

const store = require('./store.js');

/**
 * 妞ょ敻娼伴崪宀€绮嶆禒鏈靛▏閻⑩暞tore閻ㄥ嫯绶熼崝鈺傛煙濞? * @param {Object} options - 缂佸嫪娆㈤柅澶愩€? * @param {Array} mapState - 闂団偓鐟曚焦妲х亸鍕畱閻樿埖鈧浇鐭惧鍕殶缂? * @param {Object} mapMutations - 闂団偓鐟曚焦妲х亸鍕畱mutations鐎电钖? * @returns {Object} 婢х偛宸遍崥搴ｆ畱缂佸嫪娆㈤柅澶愩€? */
function useStore(options = {}, mapState = [], mapMutations = {}) {
  const { onLoad, onUnload, ...restOptions } = options;
  
  return {
    ...restOptions,
    
    // 缂佸嫪娆㈤弫鐗堝祦娑擃厼鍨垫慨瀣store閻樿埖鈧?    data: {
      ...(options.data || {}),
      ...mapState.reduce((stateMap, statePath) => {
        stateMap[getStateKey(statePath)] = store.getState(statePath);
        return stateMap;
      }, {})
    },
    
    // 閻㈢喎鎳￠崨銊︽埂閺傝纭堕敍姘辩矋娴犺泛濮炴潪鑺ユ鐠併垽妲剆tore
    onLoad(options) {
      // 閻㈢喐鍨氶崬顖欑閺嶅洩鐦戠粭锔炬暏娴滃氦顓归梼?      this._storeId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 鐠併垽妲剆tore閸欐ê瀵?      store.subscribe(this._storeId, (newState) => {
        // 閺囧瓨鏌婇弰鐘茬殸閻ㄥ嫮濮搁幀?        const updateData = {};
        mapState.forEach(statePath => {
          const key = getStateKey(statePath);
          const value = store.getState(statePath);
          if (this.data[key] !== value) {
            updateData[key] = value;
          }
        });
        
        // 婵″倹鐏夐張澶嬫殶閹诡喖褰夐崠鏍电礉閺囧瓨鏌婄紒鍕閺佺増宓?        if (Object.keys(updateData).length > 0) {
          this.setData(updateData);
        }
      });
      
      // 鐠嬪啰鏁ら崢鐔奉潗閻ㄥ埣nLoad
      if (onLoad) {
        onLoad.call(this, options);
      }
    },
    
    // 閻㈢喎鎳￠崨銊︽埂閺傝纭堕敍姘辩矋娴犺泛宓忔潪鑺ユ閸欐牗绉风拋銏ゆ
    onUnload() {
      if (this._storeId) {
        store.unsubscribe(this._storeId);
      }
      
      // 鐠嬪啰鏁ら崢鐔奉潗閻ㄥ埣nUnload
      if (onUnload) {
        onUnload.call(this);
      }
    },
    
    // 閺勭姴鐨爉utations閸掓壆绮嶆禒鑸垫煙濞?    ...Object.keys(mapMutations).reduce((methods, methodName) => {
      methods[methodName] = function(payload) {
        store.commit(mapMutations[methodName], payload);
      };
      return methods;
    }, {})
  };
}

/**
 * 鐏忓棛濮搁幀浣界熅瀵板嫯娴嗛幑顫礋缂佸嫪娆㈤弫鐗堝祦闁款喖鎮? * @param {string} statePath - 閻樿埖鈧浇鐭惧? * @returns {string} 鏉烆剚宕查崥搴ｆ畱闁款喖鎮? */
function getStateKey(statePath) {
  return statePath.replace(/\./g, '_');
}

/**
 * 閸掓稑缂搒tore缂佹垵鐣鹃惃鍕€夐棃銏ゅ帳缂? * @param {Array} mapState - 闂団偓鐟曚焦妲х亸鍕畱閻樿埖鈧浇鐭惧鍕殶缂? * @param {Object} mapMutations - 闂団偓鐟曚焦妲х亸鍕畱mutations鐎电钖? * @returns {Function} 妞ょ敻娼版晶鐐插繁閸戣姤鏆? */
function createPage(mapState = [], mapMutations = {}) {
  return function(options) {
    return useStore(options, mapState, mapMutations);
  };
}

/**
 * 閸掓稑缂搒tore缂佹垵鐣鹃惃鍕矋娴犲爼鍘ょ純? * @param {Array} mapState - 闂団偓鐟曚焦妲х亸鍕畱閻樿埖鈧浇鐭惧鍕殶缂? * @param {Object} mapMutations - 闂団偓鐟曚焦妲х亸鍕畱mutations鐎电钖? * @returns {Function} 缂佸嫪娆㈡晶鐐插繁閸戣姤鏆? */
function createComponent(mapState = [], mapMutations = {}) {
  return function(options) {
    // 鐎甸€涚艾缂佸嫪娆㈤敍灞煎▏閻⑩暉reated閸滃畳etached閻㈢喎鎳￠崨銊︽埂
    const { created, detached, ...restOptions } = options;
    
    const storeOptions = useStore(restOptions, mapState, mapMutations);
    
    return {
      ...storeOptions,
      created() {
        // 缂佸嫪娆㈤崚娑樼紦閺冩儼顓归梼鍗籺ore
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
        // 缂佸嫪娆㈤崚鍡欘瀲閺冭泛褰囧☉鍫ｎ吂闂?        if (this._storeId) {
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
