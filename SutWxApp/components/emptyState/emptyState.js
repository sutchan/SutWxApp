/**
 * 文件名: emptyState.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 作者: Sut
 * 描述: 空状态组件，用于在各种场景下显示空状态提示
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 空状态类型: default, search, cart, order, network, error
    type: {
      type: String,
      value: 'default'
    },
    // 自定义图片
    image: {
      type: String,
      value: ''
    },
    // 标题文本
    title: {
      type: String,
      value: ''
    },
    // 描述文本
    description: {
      type: String,
      value: ''
    },
    // 是否显示按钮
    showButton: {
      type: Boolean,
      value: false
    },
    // 按钮文本
    buttonText: {
      type: String,
      value: '重新尝试'
    },
    // 图片宽度
    imageWidth: {
      type: String,
      value: '200rpx'
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
    // 默认空状态图片映射
    defaultImages: {
      'default': '/assets/images/empty.svg',
      'search': '/assets/images/empty-search.svg',
      'cart': '/assets/images/empty-cart.svg',
      'order': '/assets/images/empty-order.svg',
      'network': '/assets/images/error.svg',
      'error': '/assets/images/error.svg'
    },
    // 默认标题映射
    defaultTitles: {
      'default': '暂无数据',
      'search': '没有找到相关内容',
      'cart': '购物车是空的',
      'order': '暂无订单',
      'network': '网络连接失败',
      'error': '出错了'
    },
    // 默认描述映射
    defaultDescriptions: {
      'default': '',
      'search': '换个关键词试试',
      'cart': '快去选择喜欢的商品吧',
      'order': '您还没有订单记录',
      'network': '请检查网络连接后重试',
      'error': '请稍后再试'
    }
  },

  /**
   * 计算属性
   */
  computed: {
    /**
     * 获取最终显示的图片
     * @returns {string} 图片路径
     */
    displayImage() {
      return this.properties.image || this.data.defaultImages[this.properties.type] || this.data.defaultImages.default;
    },
    
    /**
     * 获取最终显示的标题
     * @returns {string} 标题文本
     */
    displayTitle() {
      return this.properties.title || this.data.defaultTitles[this.properties.type] || this.data.defaultTitles.default;
    },
    
    /**
     * 获取最终显示的描述
     * @returns {string} 描述文本
     */
    displayDescription() {
      return this.properties.description || this.data.defaultDescriptions[this.properties.type] || this.data.defaultDescriptions.default;
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击按钮
     * @returns {void}
     */
    onButtonTap() {
      this.triggerEvent('button');
    }
  }
});