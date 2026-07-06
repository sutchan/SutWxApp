/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: EmptyState 空状态组件，用于无数据时的展示和引导
 */

Component({
  properties: {
    /**
     * 图标类型（预留）
     */
    icon: {
      type: String,
      value: ''
    },
    /**
     * 自定义图片地址
     */
    image: {
      type: String,
      value: ''
    },
    /**
     * 标题文字
     */
    title: {
      type: String,
      value: '暂无数据'
    },
    /**
     * 描述文字
     */
    description: {
      type: String,
      value: ''
    },
    /**
     * 是否显示操作按钮
     */
    showButton: {
      type: Boolean,
      value: false
    },
    /**
     * 按钮文字
     */
    buttonText: {
      type: String,
      value: '重新加载'
    },
    /**
     * 按钮变体
     */
    buttonVariant: {
      type: String,
      value: 'primary'
    },
    /**
     * 图标位置
     * top: 顶部（垂直布局）
     * left: 左侧（水平布局）
     */
    iconPosition: {
      type: String,
      value: 'top'
    }
  },

  data: {
    /**
     * 空状态类名组合
     */
    emptyStateClass: ''
  },

  observers: {
    'iconPosition': function (iconPosition) {
      this.updateEmptyStateClass();
    }
  },

  lifetimes: {
    attached: function () {
      this.updateEmptyStateClass();
    }
  },

  methods: {
    /**
     * 更新空状态类名
     */
    updateEmptyStateClass: function () {
      const { iconPosition } = this.properties;
      const classes = ['s-empty-state'];
      classes.push(`s-empty-state-${iconPosition}`);
      this.setData({
        emptyStateClass: classes.join(' ')
      });
    },

    /**
     * 按钮点击事件
     */
    onButtonTap: function (e) {
      this.triggerEvent('buttonTap', e.detail);
    },

    /**
     * 区域点击事件
     */
    onTap: function (e) {
      this.triggerEvent('tap', e.detail);
    }
  }
});
