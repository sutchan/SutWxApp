/**
 * 鏂囦欢鍚? lazyImage.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 鍥剧墖鎳掑姞杞界粍浠?*/

const lazyImage = {
  /**
   * 缁勪欢鍒涘缓鏃舵墽琛?   * @returns {void}
   */
  created() {
    this.setData({
      loaded: false,
      error: false,
      inView: false
    });
  },

  /**
   * 缁勪欢鎸傝浇鍒拌妭鐐规爲鏃舵墽琛?   * @returns {void}
   */
  attached() {
    if (this.data.lazy) {
      // 鍒涘缓浜ゅ弶瑙傚療鍣紝鐢ㄤ簬妫€娴嬪浘鐗囨槸鍚﹁繘鍏ヨ鍙?      // 褰撳浘鐗囪繘鍏ヨ鍙ｆ椂锛屽紑濮嬪姞杞藉浘鐗?      this.observer = wx.createIntersectionObserver(this, {
        thresholds: [this.data.threshold / 100],
        observeAll: false, // 涓嶈瀵熸墍鏈夊尮閰嶅厓绱?        initialRatio: 0.1 // 鍒濆鐩镐氦姣斾緥
      }).relativeToViewport().observe('.lazy-image', this.handleIntersection);
    } else {
      // 闈炴噿鍔犺浇妯″紡锛岀洿鎺ュ姞杞藉浘鐗?      this.setData({
        inView: true
      });
      this.loadImage();
    }
  },

  /**
   * 缁勪欢浠庤妭鐐规爲绉婚櫎鏃舵墽琛?   * @returns {void}
   */
  detached() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  /**
   * 鏁版嵁鐩戝惉鍣?   */
  observers: {
    'inView': function(inView) {
      if (inView && !this.data.loaded && !this.data.error) {
        this.loadImage();
      }
    }
  },

  /**
   * src灞炴€у彉鍖栨椂鎵ц
   * @param {Object} newProps - 鏂板睘鎬?   * @returns {void}
   */
  onSrcChange(newProps) {
    if (newProps.value !== this.data.src) {
      this.setData({
        src: newProps.value,
        loaded: false,
        error: false
      });

      // 濡傛灉鍥剧墖宸插湪瑙嗗彛涓紝閲嶆柊鍔犺浇
      if (this.data.inView) {
        this.loadImage();
      }
    }
  },

  /**
   * 鍔犺浇鍥剧墖
   * @returns {void}
   */
  loadImage() {
    if (!this.data.src) return;
    
    // 鍥剧墖鍔犺浇閫昏緫浼氬湪wxml涓€氳繃bindload鍜宐inderror浜嬩欢澶勭悊
  },

  /**
   * 鍥剧墖鍔犺浇鎴愬姛浜嬩欢澶勭悊
   * @returns {void}
   */
  onLoad() {
    this.setData({
      loaded: true,
      error: false
    });
  },

  /**
   * 鍥剧墖鍔犺浇澶辫触浜嬩欢澶勭悊
   * @returns {void}
   */
  onError() {
    this.setData({
      error: true
    });
  },

  /**
   * 浜ゅ弶瑙傚療鍣ㄥ洖璋冨嚱鏁?   * @param {Object} event - 浜ゅ弶瑙傚療浜嬩欢
   * @returns {void}
   */
  handleIntersection(event) {
    if (event.detail.intersectionRatio > 0) {
      this.setData({
        inView: true
      });
    }
  },

  /**
   * 鑾峰彇褰撳墠搴旇鏄剧ず鐨勫浘鐗囧湴鍧€
   * @returns {string} 鍥剧墖鍦板潃
   */
  getImageSrc() {
    if (this.data.error) {
      return this.data.errorImage;
    }

    if (this.data.loaded || this.data.inView) {
      return this.data.src;
    }

    return this.data.placeholder;
  }
};

// 瀵煎嚭缁勪欢
if (typeof Component !== 'undefined') {
  Component({
    properties: {
      src: {
        type: String,
        value: ''
      },
      placeholder: {
        type: String,
        value: '/images/placeholder.png'
      },
      errorImage: {
        type: String,
        value: '/images/error.png'
      },
      mode: {
        type: String,
        value: 'aspectFill'
      },
      lazy: {
        type: Boolean,
        value: true
      },
      threshold: {
        type: Number,
        value: 100
      }
    },
    data: {
      loaded: false,
      error: false,
      inView: false
    },
    observers: {
      'inView': function(inView) {
        if (inView && !this.data.loaded && !this.data.error) {
          this.loadImage();
        }
      },
      'src': function(newSrc) {
        if (newSrc && this.data.inView) {
          this.setData({
            loaded: false,
            error: false
          });
          this.loadImage();
        }
      }
    },
    methods: {
      created: lazyImage.created,
      attached: lazyImage.attached,
      detached: lazyImage.detached,
      onSrcChange: lazyImage.onSrcChange,
      loadImage: lazyImage.loadImage,
      onLoad: lazyImage.onLoad,
      onError: lazyImage.onError,
      handleIntersection: lazyImage.handleIntersection,
      getImageSrc: lazyImage.getImageSrc
    }
  });
} else {
  // 鍏煎闈炵粍浠剁幆澧?  module.exports = lazyImage;
}
