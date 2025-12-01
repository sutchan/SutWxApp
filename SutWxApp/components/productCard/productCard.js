/**
 * 文件名: productCard.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 作者: Sut
 * 描述: 产品卡片组件 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 产品数据
    product: {
      type: Object,
      value: {}
    },
    // 是否显示边框
    bordered: {
      type: Boolean,
      value: true
    },
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      value: true
    },
    // 卡片宽度，默认100%
    width: {
      type: String,
      value: '100%'
    },
    // 图片高度
    imageHeight: {
      type: String,
      value: '200rpx'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 默认图片
    defaultImage: '/assets/images/product-placeholder.png',
    // 本地产品数据，用于处理图片加载失败等情况
    localProduct: {}
  },

  /**
   * 数据监听器
   */
  observers: {
    'product': function(product) {
      this.setData({
        localProduct: { ...product }
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击产品卡片
     * @returns {void}
     */
    onProductTap() {
      this.triggerEvent('tap', {
        product: this.properties.product
      });
    },

    /**
     * 点击加入购物车按钮
     * @param {Object} e - 事件对象
     * @returns {void}
     */
    onAddToCart(e) {
      e.stopPropagation();
      this.triggerEvent('addtocart', {
        product: this.properties.product
      });
    },

    /**
     * 点击收藏按钮
     * @param {Object} e - 事件对象
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
     * 图片加载失败处理
     * @returns {void}
     */
    onImageError() {
      this.setData({
        'localProduct.image': this.data.defaultImage
      });
    }
  }
});
