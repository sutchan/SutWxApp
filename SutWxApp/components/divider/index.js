/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: Divider 分割线组件，用于分隔内容区块或列表项
 */

Component({
  properties: {
    /**
     * 分割线方向
     * horizontal: 水平
     * vertical: 垂直
     */
    direction: {
      type: String,
      value: 'horizontal'
    },
    /**
     * 是否为虚线
     */
    dashed: {
      type: Boolean,
      value: false
    },
    /**
     * 分割线中间文字
     */
    text: {
      type: String,
      value: ''
    },
    /**
     * 文字位置
     * left: 左侧
     * center: 居中
     * right: 右侧
     */
    textPosition: {
      type: String,
      value: 'center'
    }
  },

  data: {
    /**
     * 分割线类名组合
     */
    dividerClass: ''
  },

  observers: {
    'direction, dashed, textPosition': function (direction, dashed, textPosition) {
      this.updateDividerClass();
    }
  },

  lifetimes: {
    attached: function () {
      this.updateDividerClass();
    }
  },

  methods: {
    /**
     * 更新分割线类名
     */
    updateDividerClass: function () {
      const { direction, dashed, text, textPosition } = this.properties;
      const classes = ['s-divider'];
      
      classes.push(`s-divider-${direction}`);
      
      if (dashed) classes.push('s-divider-dashed');
      if (text) classes.push('s-divider-with-text');
      if (text) classes.push(`s-divider-text-${textPosition}`);
      
      this.setData({
        dividerClass: classes.join(' ')
      });
    }
  }
});
