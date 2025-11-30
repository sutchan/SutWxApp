/**
 * 文件名: emptyState.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 浣滆€? Sut
 * 描述: 绌虹姸鎬佺粍浠? */
Component({
  /**
   * 缁勪欢鐨勫睘鎬у垪琛?   */
  properties: {
    // 绌虹姸鎬佺被鍨嬶細default, search, cart, order, network, error
    type: {
      type: String,
      value: 'default'
    },
    // 鑷畾涔夊浘鐗?    image: {
      type: String,
      value: ''
    },
    // 鏍囬鏂囨湰
    title: {
      type: String,
      value: ''
    },
    // 鎻忚堪鏂囨湰
    description: {
      type: String,
      value: ''
    },
    // 鏄惁鏄剧ず鎸夐挳
    showButton: {
      type: Boolean,
      value: false
    },
    // 鎸夐挳鏂囨湰
    buttonText: {
      type: String,
      value: '鍘婚€涢€?
    },
    // 鍥剧墖瀹藉害
    imageWidth: {
      type: String,
      value: '200rpx'
    },
    // 鍥剧墖楂樺害
    imageHeight: {
      type: String,
      value: '200rpx'
    }
  },

  /**
   * 缁勪欢鐨勫垵濮嬫暟鎹?   */
  data: {
    // 榛樿绌虹姸鎬佸浘鐗囨槧灏?    defaultImages: {
      'default': '/assets/images/empty.svg',
      'search': '/assets/images/empty-search.svg',
      'cart': '/assets/images/empty-cart.svg',
      'order': '/assets/images/empty-order.svg',
      'network': '/assets/images/error.svg',
      'error': '/assets/images/error.svg'
    },
    // 榛樿鏍囬鏄犲皠
    defaultTitles: {
      'default': '鏆傛棤鏁版嵁',
      'search': '娌℃湁鎵惧埌鐩稿叧鍐呭',
      'cart': '璐墿杞︽槸绌虹殑',
      'order': '鏆傛棤璁㈠崟',
      'network': '缃戠粶杩炴帴澶辫触',
      'error': '鍑洪敊浜?
    },
    // 榛樿鎻忚堪鏄犲皠
    defaultDescriptions: {
      'default': '',
      'search': '鎹釜鍏抽敭璇嶈瘯璇?,
      'cart': '蹇幓鎸戦€夊枩娆㈢殑鍟嗗搧鍚?,
      'order': '鎮ㄨ繕娌℃湁璁㈠崟璁板綍',
      'network': '璇锋鏌ョ綉缁滆繛鎺ュ悗閲嶈瘯',
      'error': '璇风◢鍚庡啀璇?
    }
  },

  /**
   * 璁＄畻灞炴€?   */
  computed: {
    /**
     * 鑾峰彇鏈€缁堟樉绀虹殑鍥剧墖
     * @returns {string} 鍥剧墖璺緞
     */
    displayImage() {
      return this.properties.image || this.data.defaultImages[this.properties.type] || this.data.defaultImages.default;
    },
    
    /**
     * 鑾峰彇鏈€缁堟樉绀虹殑鏍囬
     * @returns {string} 鏍囬鏂囨湰
     */
    displayTitle() {
      return this.properties.title || this.data.defaultTitles[this.properties.type] || this.data.defaultTitles.default;
    },
    
    /**
     * 鑾峰彇鏈€缁堟樉绀虹殑鎻忚堪
     * @returns {string} 鎻忚堪鏂囨湰
     */
    displayDescription() {
      return this.properties.description || this.data.defaultDescriptions[this.properties.type] || this.data.defaultDescriptions.default;
    }
  },

  /**
   * 缁勪欢鐨勬柟娉曞垪琛?   */
  methods: {
    /**
     * 鐐瑰嚮鎸夐挳
     * @returns {void}
     */
    onButtonTap() {
      this.triggerEvent('button');
    }
  }
});