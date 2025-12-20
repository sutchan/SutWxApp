/**
 * 文件名: lazyImage.js
 * 版本号: 1.0.2
 * 更新日期: 2025-12-04
 * 作者: Sut
 * 描述: 图片懒加载组件，用于优化图片加载性能
 */

const lazyImage = {
  /**
   * 组件创建时执行
   * @returns {void}
   */
  created() {
    this.setData({
      loaded: false,
      error: false,
      inView: false
    });
  },

  /**
   * 组件挂载到节点树时执行
   * @returns {void}
   */
  attached() {
    if (this.data.lazy) {
      // 创建交叉观察器，用于检测图片是否进入视口
      // 当图片进入视口时，触发加载
      this.observer = wx.createIntersectionObserver(this, {
        thresholds: [this.data.threshold / 100],
        observeAll: false, // 不观察所有匹配的元素
        initialRatio: 0.1 // 初始相交比例
      }).relativeToViewport().observe('.lazy-image', this.handleIntersection);
    } else {
      // 非懒加载模式，直接加载图片
      this.setData({
        inView: true
      });
      this.loadImage();
    }
  },

  /**
   * 组件从节点树移除时执行
   * @returns {void}
   */
  detached() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'inView': function(inView) {
      if (inView && !this.data.loaded && !this.data.error) {
        this.loadImage();
      }
    }
  },

  /**
   * src属性变化时触发
   * @param {Object} newProps - 新属性值
   * @returns {void}
   */
  onSrcChange(newProps) {
    if (newProps.value !== this.data.src) {
      this.setData({
        src: newProps.value,
        loaded: false,
        error: false
      });

      // 如果图片已经在视口中，重新加载
      if (this.data.inView) {
        this.loadImage();
      }
    }
  },

  /**
   * 加载图片
   * @returns {void}
   */
  loadImage() {
    if (!this.data.src) return;
    
    // 图片加载逻辑由wxml中的bindload和binderror事件处理
  },

  /**
   * 图片加载成功时触发
   * @returns {void}
   */
  onLoad() {
    this.setData({
      loaded: true,
      error: false
    });
  },

  /**
   * 图片加载失败时触发
   * @returns {void}
   */
  onError() {
    this.setData({
      error: true
    });
  },

  /**
   * 交叉观察器回调函数
   * @param {Object} event - 交叉观察器事件
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
   * 获取当前应该显示的图片地址
   * @returns {string} 图片地址
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

// 注册组件
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
  // 兼容非组件环境
  module.exports = lazyImage;
}