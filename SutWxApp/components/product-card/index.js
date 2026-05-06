
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    product: {
      type: Object,
      value: {}
    },
    layout: {
      type: String,
      value: 'vertical'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onProductTap() {
      this.triggerEvent('productTap', { product: this.properties.product });
    },
    onAddCartTap() {
      this.triggerEvent('addCartTap', { product: this.properties.product });
    }
  }
});

