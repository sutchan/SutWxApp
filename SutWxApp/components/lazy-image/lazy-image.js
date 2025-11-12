锘?/ lazy-image.js - 閸ュ墽澧栭幊鎺戝鏉炵晫绮嶆禒?// 閸╄桨绨幎鈧張顖濐啎鐠佲剝鏋冨锝呯杽閻滄壆娈戞妯烩偓褑鍏橀崶鍓у閹虫帒濮炴潪鐣岀矋娴?Component({
  /**
   * 缂佸嫪娆㈤惃鍕潣閹冨灙鐞?   */
  properties: {
    // 閸ュ墽澧杝rc閸︽澘娼?    src: {
      type: String,
      value: ''
    },
    
    // 閸楃姳缍呴崶鎯ф勾閸р偓
    placeholder: {
      type: String,
      value: '/images/placeholder.png'
    },
    
    // 閸ュ墽澧栭崝鐘烘祰婢惰精瑙﹂弮鑸垫▔缁€铏规畱閸?    error: {
      type: String,
      value: '/images/error.png'
    },
    
    // 閺勵垰鎯佹担璺ㄦ暏濞撴劘绻樺蹇撳鏉?    progressive: {
      type: Boolean,
      value: false
    },
    
    // 濞撴劘绻樺蹇撳鏉炵晫娈戠紓鈺冩殣閸ユ儳婀撮崸鈧?    thumbSrc: {
      type: String,
      value: ''
    },
    
    // 閸ュ墽澧朼lt鐏炵偞鈧?    alt: {
      type: String,
      value: ''
    },
    
    // 閸ュ墽澧栭弽宄扮础缁?    imageClass: {
      type: String,
      value: ''
    },
    
    // 鐎圭懓娅掗弽宄扮础缁?    containerClass: {
      type: String,
      value: ''
    },
    
    // 閸ュ墽澧栭崘鍛颁粓閺嶅嘲绱?    imgStyle: {
      type: String,
      value: ''
    },
    
    // 鐎圭懓娅掗崘鍛颁粓閺嶅嘲绱?    containerStyle: {
      type: String,
      value: ''
    },
    
    // 閺勵垰鎯侀弰鍓с仛閸旂姾娴囬崝銊ф暰
    showLoading: {
      type: Boolean,
      value: true
    },
    
    // 妫板嫬濮炴潪浠嬫閸婄》绱欓崓蹇曠閿?    preloadThreshold: {
      type: Number,
      value: 200
    },
    
    // 閺勵垰鎯侀懛顏勫З閸旂姾娴囬敍宀勭帛鐠併倓璐焧rue
    autoLoad: {
      type: Boolean,
      value: true
    },
    
    // 閺勵垰鎯侀崥顖滄暏閼哄倹绁?    throttle: {
      type: Boolean,
      value: true
    },
    
    // 閼哄倹绁﹂弮鍫曟？閿涘牆宕熸担宄瑂閿?    throttleTime: {
      type: Number,
      value: 100
    },
    
    // 閸ュ墽澧杕ode鐏炵偞鈧?    mode: {
      type: String,
      value: 'aspectFill'
    }
  },

  /**
   * 缂佸嫪娆㈤惃鍕灥婵鏆熼幑?   */
  data: {
    // 瑜版挸澧犻弰鍓с仛閻ㄥ嫬娴橀悧鍥ф勾閸р偓
    displaySrc: '',
    // 閺勵垰鎯佸鑼病閸旂姾娴囨潻鍥ф禈閻?    loaded: false,
    // 閺勵垰鎯侀崷銊ュ讲鐟欏棗灏崺鐔峰敶
    visible: false,
    // 閺勵垰鎯佸锝呮躬閸旂姾娴囨稉?    isLoading: false,
    // 閺勵垰鎯侀崝鐘烘祰婢惰精瑙?    error: false
  },

  /**
   * 缂佸嫪娆㈤惃鍕煙濞夋洖鍨悰?   */
  methods: {
    /**
     * 閼惧嘲褰囬崗鍐娴ｅ秶鐤嗘穱鈩冧紖
     */
    getRect() {
      return new Promise((resolve, reject) => {
        try {
          wx.createSelectorQuery().in(this)
            .select('.lazy-image-container')
            .boundingClientRect()
            .exec(res => {
              if (res && res[0]) {
                resolve(res[0]);
              } else {
                reject(new Error('閼惧嘲褰囬崗鍐娴ｅ秶鐤嗘径杈Е'));
              }
            });
        } catch (error) {
          reject(error);
        }
      });
    },

    /**
     * 缂佹垵鐣惧姘З娴滃娆?     */
    bindScrollEvent() {
      if (this._scrollHandler) return;
      
      // 閸掓稑缂撻懞鍌涚ウ閻ㄥ嫭绮撮崝銊ヮ槱閻炲棗鍤遍弫?      if (this.data.throttle) {
        this._scrollHandler = this.throttle(this.handleScroll, this.data.throttleTime);
      } else {
        this._scrollHandler = this.handleScroll.bind(this);
      }
      
      // 娴ｈ法鏁ntersectionObserver閻╂垵鎯夐崗鍐閸欘垵顫嗛幀褝绱欓弴瀵稿箛娴狅絿娈戦弬鐟扮础閿?      try {
        this._observer = wx.createIntersectionObserver(this, {
          rootMargin: `${this.data.preloadThreshold}px 0px ${this.data.preloadThreshold}px 0px`
        });
        
        this._observer.relativeToViewport().observe('.lazy-image-container', (res) => {
          if (res.intersectionRatio > 0 && !this.data.loaded && !this.data.isLoading) {
            this.setData({ visible: true });
            this.loadImage();
          }
        });
      } catch (error) {
        console.warn('IntersectionObserver娑撳秴褰查悽顭掔礉娴ｈ法鏁ゅ姘З娴滃娆㈡担婊€璐熸径鍥╂暏:', error);
      }
      
      // 閸氬本妞傞惄鎴濇儔妞ょ敻娼板姘З娴ｆ粈璐熸径鍥╂暏閺傝顢?      wx.onPageScroll(this._scrollHandler);
    },

    /**
     * 鐟欙絿绮﹀姘З娴滃娆?     */
    unbindScrollEvent() {
      if (this._scrollHandler) {
        wx.offPageScroll(this._scrollHandler);
        this._scrollHandler = null;
      }
      
      // 閸忔娊妫撮惄闀愭唉鐟欏倸鐧傞懓?      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    },

    /**
     * 婢跺嫮鎮婃い鐢告桨濠婃艾濮?     */
    async handleScroll() {
      if (!this.data.loaded && !this.data.isLoading) {
        await this.checkVisibility();
      }
    },

    /**
     * 閼哄倹绁﹂崙鑺ユ殶
     * @param {Function} func - 闂団偓鐟曚浇濡ù浣烘畱閸戣姤鏆?     * @param {number} delay - 瀵ゆ儼绻滈弮鍫曟？閿涘牊顕犵粔鎺炵礆
     * @returns {Function} 閼哄倹绁﹂崥搴ｆ畱閸戣姤鏆?     */
    throttle(func, delay) {
      let lastCall = 0;
      return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return func.apply(this, args);
        }
      };
    },

    /**
     * 濡偓閺屻儱娴橀悧鍥ㄦЦ閸氾箑褰茬憴?     */
    async checkVisibility() {
      try {
        const rect = await this.getRect();
        if (!rect) return;

        // 閼惧嘲褰囩粣妤€褰涙妯哄
        const windowHeight = wx.getSystemInfoSync().windowHeight;
        
        // 鐠侊紕鐣婚崶鍓у閺勵垰鎯侀崷銊ュ讲鐟欏棗灏崺鐔峰敶閹存牠顣╅崝鐘烘祰鐠烘繄顬囬崘?        const isVisible = rect.top < windowHeight + this.data.preloadThreshold && 
                          rect.bottom > -this.data.preloadThreshold;
        
        if (isVisible && !this.data.visible) {
          this.setData({ visible: true });
          this.loadImage();
        }
      } catch (error) {
        console.error('濡偓閺屻儱娴橀悧鍥у讲鐟欎焦鈧冦亼鐠?', error);
      }
    },

    /**
     * 閸旂姾娴囬崶鍓у
     * @param {string} [imageUrl] - 閸ュ墽澧栭崷鏉挎絻閿涘苯顩ч弸婊€绗夋导鐘插灟娴ｈ法鏁ょ紒鍕鐏炵偞鈧傝厬閻ㄥ墕rc
     */
    loadImage(imageUrl) {
      // 婵″倹鐏夊▽鈩冩箒鐠佸墽鐤嗛崶鍓у閸︽澘娼冮敍灞惧灗閼板懎鍑＄紒蹇撳鏉炲€熺箖閿涘本鍨ㄩ懓鍛劀閸︺劌濮炴潪鎴掕厬閿涘苯鍨稉宥嗗⒔鐞?      const src = imageUrl || this.data.src;
      if (!src || this.data.loaded || this.data.isLoading) return;
      
      this.setData({ isLoading: true, error: false });
      
      // 鐠佸墽鐤嗛崚婵嗩潗閺勫墽銇氶惃鍕禈閻?      if (this.data.progressive && this.data.thumbSrc) {
        // 濞撴劘绻樺蹇撳鏉炶姤妞傞弰鍓с仛缂傗晝鏆愰崶?        this.setData({ displaySrc: this.data.thumbSrc });
        // 閸忓牆濮炴潪鐣岀級閻ｃ儱娴?        this.loadThumbnail().then(() => {
          // 缂傗晝鏆愰崶鎯у鏉炶姤鍨氶崝鐔锋倵閿涘苯鍟€閸旂姾娴囬崢鐔锋禈
          return this.loadOriginalImage(src);
        }).catch(() => {
          // 缂傗晝鏆愰崶鎯у鏉炶棄銇戠拹銉礉閻╁瓨甯撮崝鐘烘祰閸樼喎娴?          return this.loadOriginalImage(src);
        });
      } else {
        // 闂堢偞绗庢潻娑樼础閸旂姾娴囬弮鑸垫▔缁€鍝勫窗娴ｅ秴娴?        this.setData({ displaySrc: this.data.placeholder });
        // 閻╁瓨甯撮崝鐘烘祰閸樼喎娴?        this.loadOriginalImage(src);
      }
    },
    
    /**
     * 閸旂姾娴囩紓鈺冩殣閸?     * @returns {Promise}
     */
    loadThumbnail() {
      return new Promise((resolve, reject) => {
        const img = wx.createImage();
        img.src = this.data.thumbSrc;
        
        img.onload = () => {
          resolve();
        };
        
        img.onerror = () => {
          reject(new Error('缂傗晝鏆愰崶鎯у鏉炶棄銇戠拹?));
        };
      });
    },
    
    /**
     * 閸旂姾娴囬崢鐔奉潗閸ュ墽澧?     * @param {string} src - 閸ュ墽澧栭崷鏉挎絻
     */
    loadOriginalImage(src) {
      const image = wx.createImage();
      
      image.onload = () => {
        this.setData({
          displaySrc: src,
          loaded: true,
          isLoading: false,
          error: false
        });
        
        // 鐟欙箑褰傞崝鐘烘祰閹存劕濮涙禍瀣╂
        this.triggerEvent('load', {
          src: src,
          width: image.width,
          height: image.height
        });
        
        // 閸ュ墽澧栭崝鐘烘祰閹存劕濮涢崥搴礉閸嬫粍顒涚憴鍌氱檪
        this.unbindScrollEvent();
      };
      
      image.onerror = (error) => {
        console.error('閸ュ墽澧栭崝鐘烘祰婢惰精瑙?', error);
        
        // 閸ュ墽澧栭崝鐘烘祰婢惰精瑙﹂敍灞炬▔缁€娲晩鐠囶垰娴橀悧?        this.setData({
          displaySrc: this.data.error,
          loaded: true,
          isLoading: false,
          error: true
        });
        
        // 鐟欙箑褰傞崝鐘烘祰婢惰精瑙︽禍瀣╂
        this.triggerEvent('error', {
          src: src,
          error: error
        });
      };
      
      // 鐠佸墽鐤嗛崶鍓у閸︽澘娼?      image.src = src;
    },
    
    /**
     * 閹靛濮╅崝鐘烘祰閸ュ墽澧栭敍鍫濈秼autoLoad娑撶alse閺冩湹濞囬悽顭掔礆
     */
    manuallyLoad() {
      if (!this.data.loaded && !this.data.isLoading) {
        this.setData({ visible: true });
        this.loadImage();
      }
    },
    
    /**
     * 闁插秵鏌婇崝鐘烘祰閸ュ墽澧?     */
    reload() {
      this.setData({
        loaded: false,
        isLoading: false,
        error: false,
        visible: false
      });
      
      if (this.data.autoLoad) {
        this.bindScrollEvent();
        this.checkVisibility();
      }
    },
    
    /**
     * 閸ュ墽澧栭悙鐟板毊娴滃娆?     */
    onImageTap() {
      this.triggerEvent('tap');
      
      // 婵″倹鐏夐崶鍓у閸旂姾娴囨径杈Е閿涘苯褰叉禒銉ㄐ曢崣鎴﹀櫢閺傛澘濮炴潪?      if (this.data.error) {
        this.reload();
      }
    },
    
    /**
     * 瀵偓婵顫囩€电喎鍘撶槐鐘虫Ц閸氾箑婀崣顖濐潒閸栧搫鐓?     */
    startObserver() {
      // 婵″倹鐏夊鑼病閸旂姾娴囨潻鍥风礉閸掓瑤绗夐崘宥堫潎鐎?      if (this.data.loaded) return;
      
      // 缂佹垵鐣惧姘З娴滃娆?      this.bindScrollEvent();
      
      // 缁斿宓嗗Λ鈧弻銉ょ濞?      this.checkVisibility();
    },
    
    /**
     * 閸嬫粍顒涚憴鍌氱檪閸忓啰绀?     */
    stopObserver() {
      this.unbindScrollEvent();
    }
  },

  /**
   * 缂佸嫪娆㈤悽鐔锋嚒閸涖劍婀?   */
  lifetimes: {
    // 缂佸嫪娆㈢€圭偘绶ユ潻娑樺弳妞ょ敻娼伴懞鍌滃仯閺嶆垶妞傞幍褑顢?    attached() {
      // 閸掓繂顫愰崠鏍ㄦ殶閹?      this.setData({ 
        displaySrc: this.data.placeholder,
        loaded: false,
        visible: false,
        isLoading: false,
        error: false
      });
      
      if (this.data.autoLoad) {
        this.startObserver();
      }
    },
    
    // 缂佸嫪娆㈢€圭偘绶ョ悮顐＄矤妞ょ敻娼伴懞鍌滃仯閺嶆垹些闂勩倖妞傞幍褑顢?    detached() {
      this.stopObserver();
    },
    
    // 缂佸嫪娆㈢粔璇插З娴ｅ秶鐤嗛弮鑸靛⒔鐞?    moved() {
      // 缂佸嫪娆㈢粔璇插З娴ｅ秶鐤嗛崥搴ㄥ櫢閺傜増顥呴弻銉ュ讲鐟欎焦鈧?      if (this.data.autoLoad && !this.data.loaded) {
        setTimeout(() => {
          this.checkVisibility();
        }, 0);
      }
    },
    
    // 缂佸嫪娆㈤幍鈧崷銊┿€夐棃銏℃▔缁€鐑樻閹笛嗩攽
    show() {
      if (this.data.autoLoad && !this.data.loaded) {
        this.startObserver();
      }
    },
    
    // 缂佸嫪娆㈤幍鈧崷銊┿€夐棃銏ゆ閽樺繑妞傞幍褑顢?    hide() {
      this.stopObserver();
    }
  },

  /**
   * 閻╂垵鎯夌仦鐐粹偓褍褰夐崠?   */
  observers: {
    'src': function(newSrc) {
      if (newSrc) {
        // 閸ュ墽澧栭崷鏉挎絻閺€鐟板綁閺冨爼鍣哥純顔惧Ц閹?        this.setData({
          loaded: false,
          isLoading: false,
          visible: false,
          error: false
        });
        
        // 婵″倹鐏夐崗鍐瀹歌尙绮￠崣顖濐潌閹存牞顔曠純顔昏礋閼奉亜濮╅崝鐘烘祰閿涘苯鍨柌宥嗘煀閸旂姾娴?        if ((this.data.visible || this.data.autoLoad) && !this.data.loaded && !this.data.isLoading) {
          this.loadImage(newSrc);
        }
      }
    }
  }
});\n