/**
 * 文件名: productCard.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 商品卡片组件
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 商品信息
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
    // 默认商品图片
    defaultImage: '/assets/images/product-placeholder.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击商品卡片
     */
    onProductTap() {
      this.triggerEvent('tap', {
        product: this.data.product
      });
    },

    /**
     * 点击添加到购物车
     */
    onAddToCart(e) {
      e.stopPropagation();
      this.triggerEvent('addtocart', {
        product: this.data.product
      });
    },

    /**
     * 点击收藏
     */
    onFavorite(e) {
      e.stopPropagation();
      this.triggerEvent('favorite', {
        product: this.data.product,
        isFavorite: !this.data.product.isFavorite
      });
    },

    /**
     * 图片加载失败处理
     */
    onImageError() {
      this.setData({
        'product.image': this.data.defaultImage
      });
    }
  }
});