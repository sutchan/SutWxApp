/**
 * 文件名: lazyImage.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 作者: Sut
 * 描述: 懒加载图片组件
 */

const lazyImage = {
  /**
   * 组件创建时调用
   */
  created() {
    this.setData({
      loaded: false,
      error: false,
      inView: false
    });
  },

  /**
   * 组件附加到页面时调用
   */
  attached() {
    if (this.data.lazy) {
      // 创建交叉观察器，用于检测图片是否进入视口
      this.observer = wx.createIntersectionObserver(this, {
        thresholds: [this.data.threshold / 100]
      }).relativeToViewport().observe('.lazy-image', this.handleIntersection);
    } else {
      // 非懒加载模式，直接加载图片
      this.setData({
        inView: true
      });
    }
  },

  /**
   * 组件从页面分离时调用
   */
  detached() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  /**
   * src属性变化时调用
   * @param {Object} newProps - 新属性
   */
  onSrcChange(newProps) {
    if (newProps.value !== this.data.src) {
      this.setData({
        src: newProps.value,
        loaded: false,
        error: false
      });

      // 如果图片在视口中，重新加载
      if (this.data.inView) {
        this.loadImage();
      }
    }
  },

  /**
   * 图片加载成功时调用
   */
  onLoad() {
    this.setData({
      loaded: true,
      error: false
    });
  },

  /**
   * 图片加载失败时调用
   */
  onError() {
    this.setData({
      error: true
    });
  },

  /**
   * 处理交叉观察器回调
   * @param {Object} event - 事件对象
   */
  handleIntersection(event) {
    if (event.detail.intersectionRatio > 0) {
      this.setData({
        inView: true
      });
    }
  },

  /**
   * 获取当前应显示的图片地址
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

// 如果是微信小程序环境，使用Component定义组件
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
    methods: {
      created: lazyImage.created,
      attached: lazyImage.attached,
      detached: lazyImage.detached,
      onSrcChange: lazyImage.onSrcChange,
      onLoad: lazyImage.onLoad,
      onError: lazyImage.onError,
      handleIntersection: lazyImage.handleIntersection,
      getImageSrc: lazyImage.getImageSrc
    }
  });
} else {
  // 否则导出普通对象，用于测试
  module.exports = lazyImage;
}