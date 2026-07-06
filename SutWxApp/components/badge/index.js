/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: Badge 徽章组件，用于标记状态、数量或提示
 */

Component({
  properties: {
    /**
     * 徽章变体
     * default: 默认
     * secondary: 次要
     * destructive: 危险
     * outline: 轮廓
     */
    variant: {
      type: String,
      value: 'default'
    },
    /**
     * 徽章尺寸
     * sm: 小尺寸
     * md: 中尺寸（默认）
     */
    size: {
      type: String,
      value: 'md'
    },
    /**
     * 是否显示为小圆点
     */
    dot: {
      type: Boolean,
      value: false
    },
    /**
     * 徽章内容
     */
    content: {
      type: [String, Number],
      value: ''
    },
    /**
     * 最大数字，超过显示 +
     */
    max: {
      type: Number,
      value: 99
    }
  },

  data: {
    /**
     * 徽章类名组合
     */
    badgeClass: '',
    /**
     * 显示的内容
     */
    displayContent: ''
  },

  observers: {
    'variant, size, dot': function (variant, size, dot) {
      this.updateBadgeClass();
    },
    'content, max': function (content, max) {
      this.updateDisplayContent();
    }
  },

  lifetimes: {
    attached: function () {
      this.updateBadgeClass();
      this.updateDisplayContent();
    }
  },

  methods: {
    /**
     * 更新徽章类名
     */
    updateBadgeClass: function () {
      const { variant, size, dot } = this.properties;
      const classes = ['s-badge'];
      
      classes.push(`s-badge-${variant}`);
      classes.push(`s-badge-${size}`);
      
      if (dot) classes.push('s-badge-dot');
      
      this.setData({
        badgeClass: classes.join(' ')
      });
    },

    /**
     * 更新显示内容
     */
    updateDisplayContent: function () {
      const { content, max, dot } = this.properties;
      
      if (dot) {
        this.setData({ displayContent: '' });
        return;
      }
      
      let display = content;
      
      if (typeof content === 'number' || !isNaN(Number(content))) {
        const num = Number(content);
        if (num > max) {
          display = `${max}+`;
        }
      }
      
      this.setData({
        displayContent: display
      });
    }
  }
});
