/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: Avatar 头像组件，支持图片和文字首字母展示
 */

Component({
  properties: {
    /**
     * 头像尺寸
     * sm: 小尺寸 32px
     * md: 中尺寸 40px（默认）
     * lg: 大尺寸 56px
     */
    size: {
      type: String,
      value: 'md'
    },
    /**
     * 头像图片地址
     */
    src: {
      type: String,
      value: ''
    },
    /**
     * 文字头像（无图片时显示）
     */
    text: {
      type: String,
      value: ''
    },
    /**
     * 文字头像背景色
     */
    bgColor: {
      type: String,
      value: ''
    }
  },

  data: {
    /**
     * 头像类名组合
     */
    avatarClass: '',
    /**
     * 文字头像首字母
     */
    firstLetter: '',
    /**
     * 计算后的背景色
     */
    computedBgColor: ''
  },

  observers: {
    'size': function (size) {
      this.updateAvatarClass();
    },
    'text, bgColor': function (text, bgColor) {
      this.updateTextAndColor();
    }
  },

  lifetimes: {
    attached: function () {
      this.updateAvatarClass();
      this.updateTextAndColor();
    }
  },

  methods: {
    /**
     * 更新头像类名
     */
    updateAvatarClass: function () {
      const { size } = this.properties;
      const classes = ['s-avatar'];
      classes.push(`s-avatar-${size}`);
      this.setData({
        avatarClass: classes.join(' ')
      });
    },

    /**
     * 更新文字和背景色
     */
    updateTextAndColor: function () {
      const { text, bgColor, src } = this.properties;
      
      if (src) {
        return;
      }
      
      let firstLetter = '';
      if (text && text.length > 0) {
        firstLetter = text.charAt(0).toUpperCase();
      }
      
      let computedBgColor = bgColor;
      if (!computedBgColor && text) {
        computedBgColor = this.getColorByName(text);
      }
      
      this.setData({
        firstLetter,
        computedBgColor
      });
    },

    /**
     * 根据名称生成背景色
     * @param {string} name 名称
     * @returns {string} 背景色
     */
    getColorByName: function (name) {
      const colors = [
        '#2E7D32',
        '#4CAF50',
        '#FF9800',
        '#F44336',
        '#2196F3',
        '#9C27B0',
        '#00BCD4',
        '#FF5722',
        '#795548',
        '#607D8B'
      ];
      
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const index = Math.abs(hash) % colors.length;
      return colors[index];
    },

    /**
     * 头像点击事件
     */
    onTap: function (e) {
      this.triggerEvent('tap', e.detail);
    },

    /**
     * 图片加载错误
     */
    onImageError: function (e) {
      this.triggerEvent('error', e.detail);
    },

    /**
     * 图片加载完成
     */
    onImageLoad: function (e) {
      this.triggerEvent('load', e.detail);
    }
  }
});
