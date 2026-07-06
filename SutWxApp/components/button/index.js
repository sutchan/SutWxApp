/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: Button 按钮组件，支持多种变体、尺寸和状态
 */

Component({
  properties: {
    /**
     * 按钮变体
     * primary: 主按钮
     * default: 默认按钮
     * ghost: 幽灵按钮
     * link: 链接按钮
     * destructive: 危险按钮
     */
    variant: {
      type: String,
      value: 'default'
    },
    /**
     * 按钮尺寸
     * sm: 小尺寸
     * md: 中尺寸（默认）
     * lg: 大尺寸
     */
    size: {
      type: String,
      value: 'md'
    },
    /**
     * 是否加载中
     */
    loading: {
      type: Boolean,
      value: false
    },
    /**
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      value: false
    },
    /**
     * 是否块级元素（宽度 100%）
     */
    block: {
      type: Boolean,
      value: false
    },
    /**
     * 微信开放能力
     */
    openType: {
      type: String,
      value: ''
    }
  },

  data: {
    /**
     * 按钮类名组合
     */
    buttonClass: ''
  },

  observers: {
    /**
     * 监听属性变化，更新按钮类名
     */
    'variant, size, loading, disabled, block': function (variant, size, loading, disabled, block) {
      this.updateButtonClass();
    }
  },

  lifetimes: {
    attached: function () {
      this.updateButtonClass();
    }
  },

  methods: {
    /**
     * 更新按钮类名
     */
    updateButtonClass: function () {
      const { variant, size, loading, disabled, block } = this.properties;
      const classes = ['s-button'];
      
      classes.push(`s-button-${variant}`);
      classes.push(`s-button-${size}`);
      
      if (block) classes.push('s-button-block');
      if (loading) classes.push('s-button-loading');
      if (disabled) classes.push('s-button-disabled');
      
      this.setData({
        buttonClass: classes.join(' ')
      });
    },

    /**
     * 按钮点击事件
     */
    onTap: function (e) {
      if (this.properties.loading || this.properties.disabled) {
        return;
      }
      this.triggerEvent('tap', e.detail);
    },

    /**
     * 获取用户手机号回调
     */
    onGetPhoneNumber: function (e) {
      this.triggerEvent('getphonenumber', e.detail);
    },

    /**
     * 获取用户信息回调
     */
    onGetUserInfo: function (e) {
      this.triggerEvent('getuserinfo', e.detail);
    },

    /**
     * 打开设置页面回调
     */
    onOpenSetting: function (e) {
      this.triggerEvent('opensetting', e.detail);
    },

    /**
     * 选择会话回调
     */
    onChooseAvatar: function (e) {
      this.triggerEvent('chooseavatar', e.detail);
    }
  }
});
