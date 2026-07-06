/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: Tag 标签组件，用于分类、标记属性或筛选条件
 */

Component({
  properties: {
    /**
     * 标签变体
     * default: 默认灰色
     * primary: 主色
     * success: 成功色
     * warning: 警告色
     * error: 错误色
     */
    variant: {
      type: String,
      value: 'default'
    },
    /**
     * 标签尺寸
     * sm: 小尺寸
     * md: 中尺寸（默认）
     */
    size: {
      type: String,
      value: 'md'
    },
    /**
     * 是否为镂空样式
     */
    plain: {
      type: Boolean,
      value: false
    },
    /**
     * 是否可关闭
     */
    closable: {
      type: Boolean,
      value: false
    }
  },

  data: {
    /**
     * 标签类名组合
     */
    tagClass: ''
  },

  observers: {
    'variant, size, plain': function (variant, size, plain) {
      this.updateTagClass();
    }
  },

  lifetimes: {
    attached: function () {
      this.updateTagClass();
    }
  },

  methods: {
    /**
     * 更新标签类名
     */
    updateTagClass: function () {
      const { variant, size, plain } = this.properties;
      const classes = ['s-tag'];
      
      classes.push(`s-tag-${variant}`);
      classes.push(`s-tag-${size}`);
      
      if (plain) classes.push('s-tag-plain');
      
      this.setData({
        tagClass: classes.join(' ')
      });
    },

    /**
     * 标签点击事件
     */
    onTap: function (e) {
      this.triggerEvent('tap', e.detail);
    },

    /**
     * 关闭按钮点击事件
     */
    onClose: function (e) {
      this.triggerEvent('close', e.detail);
    }
  }
});
