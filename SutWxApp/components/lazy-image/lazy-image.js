// lazy-image.js - 鍥剧墖鎳掑姞杞界粍浠?// 鍩轰簬鎶€鏈璁℃枃妗ｅ疄鐜扮殑楂樻€ц兘鍥剧墖鎳掑姞杞界粍浠?Component({
  /**
   * 缁勪欢鐨勫睘鎬у垪琛?   */
  properties: {
    // 鍥剧墖src鍦板潃
    src: {
      type: String,
      value: ''
    },
    
    // 鍗犱綅鍥惧湴鍧€
    placeholder: {
      type: String,
      value: '/images/placeholder.png'
    },
    
    // 鍥剧墖鍔犺浇澶辫触鏃舵樉绀虹殑鍥?    error: {
      type: String,
      value: '/images/error.png'
    },
    
    // 鏄惁浣跨敤娓愯繘寮忓姞杞?    progressive: {
      type: Boolean,
      value: false
    },
    
    // 娓愯繘寮忓姞杞界殑缂╃暐鍥惧湴鍧€
    thumbSrc: {
      type: String,
      value: ''
    },
    
    // 鍥剧墖alt灞炴€?    alt: {
      type: String,
      value: ''
    },
    
    // 鍥剧墖鏍峰紡绫?    imageClass: {
      type: String,
      value: ''
    },
    
    // 瀹瑰櫒鏍峰紡绫?    containerClass: {
      type: String,
      value: ''
    },
    
    // 鍥剧墖鍐呰仈鏍峰紡
    imgStyle: {
      type: String,
      value: ''
    },
    
    // 瀹瑰櫒鍐呰仈鏍峰紡
    containerStyle: {
      type: String,
      value: ''
    },
    
    // 鏄惁鏄剧ず鍔犺浇鍔ㄧ敾
    showLoading: {
      type: Boolean,
      value: true
    },
    
    // 棰勫姞杞介槇鍊硷紙鍍忕礌锛?    preloadThreshold: {
      type: Number,
      value: 200
    },
    
    // 鏄惁鑷姩鍔犺浇锛岄粯璁や负true
    autoLoad: {
      type: Boolean,
      value: true
    },
    
    // 鏄惁鍚敤鑺傛祦
    throttle: {
      type: Boolean,
      value: true
    },
    
    // 鑺傛祦鏃堕棿锛堝崟浣峬s锛?    throttleTime: {
      type: Number,
      value: 100
    },
    
    // 鍥剧墖mode灞炴€?    mode: {
      type: String,
      value: 'aspectFill'
    }
  },

  /**
   * 缁勪欢鐨勫垵濮嬫暟鎹?   */
  data: {
    // 褰撳墠鏄剧ず鐨勫浘鐗囧湴鍧€
    displaySrc: '',
    // 鏄惁宸茬粡鍔犺浇杩囧浘鐗?    loaded: false,
    // 鏄惁鍦ㄥ彲瑙嗗尯鍩熷唴
    visible: false,
    // 鏄惁姝ｅ湪鍔犺浇涓?    isLoading: false,
    // 鏄惁鍔犺浇澶辫触
    error: false
  },

  /**
   * 缁勪欢鐨勬柟娉曞垪琛?   */
  methods: {
    /**
     * 鑾峰彇鍏冪礌浣嶇疆淇℃伅
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
                reject(new Error('鑾峰彇鍏冪礌浣嶇疆澶辫触'));
              }
            });
        } catch (error) {
          reject(error);
        }
      });
    },

    /**
     * 缁戝畾婊氬姩浜嬩欢
     */
    bindScrollEvent() {
      if (this._scrollHandler) return;
      
      // 鍒涘缓鑺傛祦鐨勬粴鍔ㄥ鐞嗗嚱鏁?      if (this.data.throttle) {
        this._scrollHandler = this.throttle(this.handleScroll, this.data.throttleTime);
      } else {
        this._scrollHandler = this.handleScroll.bind(this);
      }
      
      // 浣跨敤IntersectionObserver鐩戝惉鍏冪礌鍙鎬э紙鏇寸幇浠ｇ殑鏂瑰紡锛?      try {
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
        console.warn('IntersectionObserver涓嶅彲鐢紝浣跨敤婊氬姩浜嬩欢浣滀负澶囩敤:', error);
      }
      
      // 鍚屾椂鐩戝惉椤甸潰婊氬姩浣滀负澶囩敤鏂规
      wx.onPageScroll(this._scrollHandler);
    },

    /**
     * 瑙ｇ粦婊氬姩浜嬩欢
     */
    unbindScrollEvent() {
      if (this._scrollHandler) {
        wx.offPageScroll(this._scrollHandler);
        this._scrollHandler = null;
      }
      
      // 鍏抽棴鐩镐氦瑙傚療鑰?      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    },

    /**
     * 澶勭悊椤甸潰婊氬姩
     */
    async handleScroll() {
      if (!this.data.loaded && !this.data.isLoading) {
        await this.checkVisibility();
      }
    },

    /**
     * 鑺傛祦鍑芥暟
     * @param {Function} func - 闇€瑕佽妭娴佺殑鍑芥暟
     * @param {number} delay - 寤惰繜鏃堕棿锛堟绉掞級
     * @returns {Function} 鑺傛祦鍚庣殑鍑芥暟
     */
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
     * 妫€鏌ュ浘鐗囨槸鍚﹀彲瑙?     */
    async checkVisibility() {
      try {
        const rect = await this.getRect();
        if (!rect) return;

        // 鑾峰彇绐楀彛楂樺害
        const windowHeight = wx.getSystemInfoSync().windowHeight;
        
        // 璁＄畻鍥剧墖鏄惁鍦ㄥ彲瑙嗗尯鍩熷唴鎴栭鍔犺浇璺濈鍐?        const isVisible = rect.top < windowHeight + this.data.preloadThreshold && 
                          rect.bottom > -this.data.preloadThreshold;
        
        if (isVisible && !this.data.visible) {
          this.setData({ visible: true });
          this.loadImage();
        }
      } catch (error) {
        console.error('妫€鏌ュ浘鐗囧彲瑙佹€уけ璐?', error);
      }
    },

    /**
     * 鍔犺浇鍥剧墖
     * @param {string} [imageUrl] - 鍥剧墖鍦板潃锛屽鏋滀笉浼犲垯浣跨敤缁勪欢灞炴€т腑鐨剆rc
     */
    loadImage(imageUrl) {
      // 濡傛灉娌℃湁璁剧疆鍥剧墖鍦板潃锛屾垨鑰呭凡缁忓姞杞借繃锛屾垨鑰呮鍦ㄥ姞杞戒腑锛屽垯涓嶆墽琛?      const src = imageUrl || this.data.src;
      if (!src || this.data.loaded || this.data.isLoading) return;
      
      this.setData({ isLoading: true, error: false });
      
      // 璁剧疆鍒濆鏄剧ず鐨勫浘鐗?      if (this.data.progressive && this.data.thumbSrc) {
        // 娓愯繘寮忓姞杞芥椂鏄剧ず缂╃暐鍥?        this.setData({ displaySrc: this.data.thumbSrc });
        // 鍏堝姞杞界缉鐣ュ浘
        this.loadThumbnail().then(() => {
          // 缂╃暐鍥惧姞杞芥垚鍔熷悗锛屽啀鍔犺浇鍘熷浘
          return this.loadOriginalImage(src);
        }).catch(() => {
          // 缂╃暐鍥惧姞杞藉け璐ワ紝鐩存帴鍔犺浇鍘熷浘
          return this.loadOriginalImage(src);
        });
      } else {
        // 闈炴笎杩涘紡鍔犺浇鏃舵樉绀哄崰浣嶅浘
        this.setData({ displaySrc: this.data.placeholder });
        // 鐩存帴鍔犺浇鍘熷浘
        this.loadOriginalImage(src);
      }
    },
    
    /**
     * 鍔犺浇缂╃暐鍥?     * @returns {Promise}
     */
    loadThumbnail() {
      return new Promise((resolve, reject) => {
        const img = wx.createImage();
        img.src = this.data.thumbSrc;
        
        img.onload = () => {
          resolve();
        };
        
        img.onerror = () => {
          reject(new Error('缂╃暐鍥惧姞杞藉け璐?));
        };
      });
    },
    
    /**
     * 鍔犺浇鍘熷鍥剧墖
     * @param {string} src - 鍥剧墖鍦板潃
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
        
        // 瑙﹀彂鍔犺浇鎴愬姛浜嬩欢
        this.triggerEvent('load', {
          src: src,
          width: image.width,
          height: image.height
        });
        
        // 鍥剧墖鍔犺浇鎴愬姛鍚庯紝鍋滄瑙傚療
        this.unbindScrollEvent();
      };
      
      image.onerror = (error) => {
        console.error('鍥剧墖鍔犺浇澶辫触:', error);
        
        // 鍥剧墖鍔犺浇澶辫触锛屾樉绀洪敊璇浘鐗?        this.setData({
          displaySrc: this.data.error,
          loaded: true,
          isLoading: false,
          error: true
        });
        
        // 瑙﹀彂鍔犺浇澶辫触浜嬩欢
        this.triggerEvent('error', {
          src: src,
          error: error
        });
      };
      
      // 璁剧疆鍥剧墖鍦板潃
      image.src = src;
    },
    
    /**
     * 鎵嬪姩鍔犺浇鍥剧墖锛堝綋autoLoad涓篺alse鏃朵娇鐢級
     */
    manuallyLoad() {
      if (!this.data.loaded && !this.data.isLoading) {
        this.setData({ visible: true });
        this.loadImage();
      }
    },
    
    /**
     * 閲嶆柊鍔犺浇鍥剧墖
     */
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
     * 鍥剧墖鐐瑰嚮浜嬩欢
     */
    onImageTap() {
      this.triggerEvent('tap');
      
      // 濡傛灉鍥剧墖鍔犺浇澶辫触锛屽彲浠ヨЕ鍙戦噸鏂板姞杞?      if (this.data.error) {
        this.reload();
      }
    },
    
    /**
     * 寮€濮嬭瀵熷厓绱犳槸鍚﹀湪鍙鍖哄煙
     */
    startObserver() {
      // 濡傛灉宸茬粡鍔犺浇杩囷紝鍒欎笉鍐嶈瀵?      if (this.data.loaded) return;
      
      // 缁戝畾婊氬姩浜嬩欢
      this.bindScrollEvent();
      
      // 绔嬪嵆妫€鏌ヤ竴娆?      this.checkVisibility();
    },
    
    /**
     * 鍋滄瑙傚療鍏冪礌
     */
    stopObserver() {
      this.unbindScrollEvent();
    }
  },

  /**
   * 缁勪欢鐢熷懡鍛ㄦ湡
   */
  lifetimes: {
    // 缁勪欢瀹炰緥杩涘叆椤甸潰鑺傜偣鏍戞椂鎵ц
    attached() {
      // 鍒濆鍖栨暟鎹?      this.setData({ 
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
    
    // 缁勪欢瀹炰緥琚粠椤甸潰鑺傜偣鏍戠Щ闄ゆ椂鎵ц
    detached() {
      this.stopObserver();
    },
    
    // 缁勪欢绉诲姩浣嶇疆鏃舵墽琛?    moved() {
      // 缁勪欢绉诲姩浣嶇疆鍚庨噸鏂版鏌ュ彲瑙佹€?      if (this.data.autoLoad && !this.data.loaded) {
        setTimeout(() => {
          this.checkVisibility();
        }, 0);
      }
    },
    
    // 缁勪欢鎵€鍦ㄩ〉闈㈡樉绀烘椂鎵ц
    show() {
      if (this.data.autoLoad && !this.data.loaded) {
        this.startObserver();
      }
    },
    
    // 缁勪欢鎵€鍦ㄩ〉闈㈤殣钘忔椂鎵ц
    hide() {
      this.stopObserver();
    }
  },

  /**
   * 鐩戝惉灞炴€у彉鍖?   */
  observers: {
    'src': function(newSrc) {
      if (newSrc) {
        // 鍥剧墖鍦板潃鏀瑰彉鏃堕噸缃姸鎬?        this.setData({
          loaded: false,
          isLoading: false,
          visible: false,
          error: false
        });
        
        // 濡傛灉鍏冪礌宸茬粡鍙鎴栬缃负鑷姩鍔犺浇锛屽垯閲嶆柊鍔犺浇
        if ((this.data.visible || this.data.autoLoad) && !this.data.loaded && !this.data.isLoading) {
          this.loadImage(newSrc);
        }
      }
    }
  }
});\n