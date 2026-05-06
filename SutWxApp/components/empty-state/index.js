
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: '暂无数据'
    },
    image: {
      type: String,
      value: ''
    },
    showButton: {
      type: Boolean,
      value: false
    },
    buttonText: {
      type: String,
      value: '重新加载'
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
    onButtonTap() {
      this.triggerEvent('buttonTap');
    }
  }
});

