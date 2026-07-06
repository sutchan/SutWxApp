/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: ProductCard 商品卡片组件，电商核心展示组件
 */

Component({
  properties: {
    /**
     * 布局方式
     * vertical: 纵向布局（网格）
     * horizontal: 横向布局（列表）
     */
    layout: {
      type: String,
      value: 'vertical'
    },
    /**
     * 商品数据
     */
    product: {
      type: Object,
      value: {}
    },
    /**
     * 是否显示加入购物车按钮
     */
    showCart: {
      type: Boolean,
      value: true
    },
    /**
     * 是否显示商品标签
     */
    showTag: {
      type: Boolean,
      value: true
    }
  },

  data: {
    /**
     * 商品卡片类名组合
     */
    cardClass: ''
  },

  observers: {
    'layout': function (layout) {
      this.updateCardClass();
    }
  },

  lifetimes: {
    attached: function () {
      this.updateCardClass();
    }
  },

  methods: {
    /**
     * 更新卡片类名
     */
    updateCardClass: function () {
      const { layout } = this.properties;
      const classes = ['s-product-card'];
      classes.push(`s-product-card-${layout}`);
      this.setData({
        cardClass: classes.join(' ')
      });
    },

    /**
     * 卡片点击事件
     */
    onProductTap: function (e) {
      this.triggerEvent('productTap', { product: this.properties.product });
    },

    /**
     * 加入购物车点击事件
     */
    onAddCartTap: function (e) {
      this.triggerEvent('addCartTap', { product: this.properties.product });
    }
  }
});
