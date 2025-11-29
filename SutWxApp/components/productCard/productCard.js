/**
 * 鏂囦欢鍚? productCard.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 鍟嗗搧鍗＄墖缁勪欢
 */
Component({
  /**
   * 缁勪欢鐨勫睘鎬у垪琛?   */
  properties: {
    // 鍟嗗搧淇℃伅
    product: {
      type: Object,
      value: {}
    },
    // 鏄惁鏄剧ず杈规
    bordered: {
      type: Boolean,
      value: true
    },
    // 鏄惁鏄剧ず鎿嶄綔鎸夐挳
    showActions: {
      type: Boolean,
      value: true
    },
    // 鍗＄墖瀹藉害锛岄粯璁?00%
    width: {
      type: String,
      value: '100%'
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
    // 榛樿鍟嗗搧鍥剧墖
    defaultImage: '/assets/images/product-placeholder.png',
    // 鏈湴鍟嗗搧鏁版嵁锛岀敤浜庡鐞嗗浘鐗囧姞杞藉け璐ョ瓑鎯呭喌
    localProduct: {}
  },

  /**
   * 鐩戝惉灞炴€у彉鍖?   */
  observers: {
    'product': function(product) {
      this.setData({
        localProduct: { ...product }
      });
    }
  },

  /**
   * 缁勪欢鐨勬柟娉曞垪琛?   */
  methods: {
    /**
     * 鐐瑰嚮鍟嗗搧鍗＄墖
     * @returns {void}
     */
    onProductTap() {
      this.triggerEvent('tap', {
        product: this.properties.product
      });
    },

    /**
     * 鐐瑰嚮娣诲姞鍒拌喘鐗╄溅
     * @param {Object} e - 浜嬩欢瀵硅薄
     * @returns {void}
     */
    onAddToCart(e) {
      e.stopPropagation();
      this.triggerEvent('addtocart', {
        product: this.properties.product
      });
    },

    /**
     * 鐐瑰嚮鏀惰棌
     * @param {Object} e - 浜嬩欢瀵硅薄
     * @returns {void}
     */
    onFavorite(e) {
      e.stopPropagation();
      this.triggerEvent('favorite', {
        product: this.properties.product,
        isFavorite: !this.properties.product.isFavorite
      });
    },

    /**
     * 鍥剧墖鍔犺浇澶辫触澶勭悊
     * @returns {void}
     */
    onImageError() {
      this.setData({
        'localProduct.image': this.data.defaultImage
      });
    }
  }
});