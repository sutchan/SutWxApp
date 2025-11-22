/**
 * 文件名: lazyImage.js
 * 懒加载图片组件
 */
Component({
  properties: {
    src: {
      type: String,
      value: ''
    },
    mode: {
      type: String,
      value: 'aspectFill'
    },
    lazyLoad: {
      type: Boolean,
      value: true
    }
  },
  data: {
    show: false
  },
  methods: {
    onLoad() {
      this.setData({
        show: true
      });
    }
  }
})