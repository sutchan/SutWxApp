/**
 * 文件名: loadMore.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 加载更多组件
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 加载状态：loading, noMore, error, normal
    status: {
      type: String,
      value: 'normal'
    },
    // 是否显示加载更多按钮
    showButton: {
      type: Boolean,
      value: true
    },
    // 按钮文本
    buttonText: {
      type: String,
      value: '加载更多'
    },
    // 加载中文本
    loadingText: {
      type: String,
      value: '加载中...'
    },
    // 无更多数据文本
    noMoreText: {
      type: String,
      value: '没有更多数据了'
    },
    // 加载失败文本
    errorText: {
      type: String,
      value: '加载失败，点击重试'
    },
    // 组件高度
    height: {
      type: String,
      value: 'auto'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击加载更多
     */
    onLoadMore() {
      if (this.data.status !== 'loading' && this.data.status !== 'noMore') {
        this.triggerEvent('loadmore');
      }
    }
  }
});