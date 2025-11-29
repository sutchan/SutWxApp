/**
 * 鏂囦欢鍚? lazyImage.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 鎳掑姞杞藉浘鐗囩粍浠? */

const lazyImage = {
  /**
   * 缁勪欢鍒涘缓鏃惰皟鐢?   * @returns {void}
   */
  created() {
    this.setData({
      loaded: false,
      error: false,
      inView: false
    });
  },

  /**
   * 缁勪欢闄勫姞鍒伴〉闈㈡椂璋冪敤
   * @returns {void}
   */
  attached() {
    if (this.data.lazy) {
      // 鍒涘缓浜ゅ弶瑙傚療鍣紝鐢ㄤ簬妫€娴嬪浘鐗囨槸鍚﹁繘鍏ヨ鍙?      // 浼樺寲閰嶇疆锛氶檷浣庡垵濮嬮槇鍊硷紝鍑忓皯涓嶅繀瑕佺殑鍥炶皟
      this.observer = wx.createIntersectionObserver(this, {
        thresholds: [this.data.threshold / 100],
        observeAll: false, // 鍙瀵熷綋鍓嶇粍浠?        initialRatio: 0.1 // 鍒濆瑙傚療姣斾緥
      }).relativeToViewport().observe('.lazy-image', this.handleIntersection);
    } else {
      // 闈炴噿鍔犺浇妯″紡锛岀洿鎺ュ姞杞藉浘鐗?      this.setData({
        inView: true
      });
      this.loadImage();
    }
  },

  /**
   * 缁勪欢浠庨〉闈㈠垎绂绘椂璋冪敤
   * @returns {void}
   */
  detached() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  /**
   * 鐩戝惉鏁版嵁鍙樺寲
   */
  observers: {
    'inView': function(inView) {
      if (inView && !this.data.loaded && !this.data.error) {
        this.loadImage();
      }
    }
  },

  /**
   * src灞炴€у彉鍖栨椂璋冪敤
   * @param {Object} newProps - 鏂板睘鎬?   * @returns {void}
   */
  onSrcChange(newProps) {
    if (newProps.value !== this.data.src) {
      this.setData({
        src: newProps.value,
        loaded: false,
        error: false
      });

      // 濡傛灉鍥剧墖鍦ㄨ鍙ｄ腑锛岄噸鏂板姞杞?      if (this.data.inView) {
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
    
    // 杩欓噷鍙互娣诲姞鍥剧墖鍔犺浇閫昏緫锛屼緥濡備娇鐢╳x.getImageInfo棰勫姞杞?    // 鐩墠渚濊禆寰俊灏忕▼搴忕殑image缁勪欢鑷甫鐨勫姞杞芥満鍒?  },

  /**
   * 鍥剧墖鍔犺浇鎴愬姛鏃惰皟鐢?   * @returns {void}
   */
  onLoad() {
    this.setData({
      loaded: true,
      error: false
    });
  },

  /**
   * 鍥剧墖鍔犺浇澶辫触鏃惰皟鐢?   * @returns {void}
   */
  onError() {
    this.setData({
      error: true
    });
  },

  /**
   * 澶勭悊浜ゅ弶瑙傚療鍣ㄥ洖璋?   * @param {Object} event - 浜嬩欢瀵硅薄
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
   * 鑾峰彇褰撳墠搴旀樉绀虹殑鍥剧墖鍦板潃
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

// 濡傛灉鏄井淇″皬绋嬪簭鐜锛屼娇鐢–omponent瀹氫箟缁勪欢
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
  // 鍚﹀垯瀵煎嚭鏅€氬璞★紝鐢ㄤ簬娴嬭瘯
  module.exports = lazyImage;
}