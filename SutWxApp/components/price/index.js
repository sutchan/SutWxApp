/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: Price 价格组件，用于统一展示商品价格
 */

Component({
  properties: {
    /**
     * 价格数值
     */
    value: {
      type: [Number, String],
      value: 0
    },
    /**
     * 原价数值
     */
    original: {
      type: [Number, String],
      value: ''
    },
    /**
     * 尺寸
     * sm: 小
     * md: 中
     * lg: 大
     */
    size: {
      type: String,
      value: 'md'
    },
    /**
     * 颜色变体
     * primary: 主色
     * error: 错误色（默认，商品价格）
     * text: 主文字色
     */
    color: {
      type: String,
      value: 'error'
    },
    /**
     * 货币符号
     */
    symbol: {
      type: String,
      value: '¥'
    },
    /**
     * 是否显示货币符号
     */
    showSymbol: {
      type: Boolean,
      value: true
    },
    /**
     * 是否显示小数部分
     */
    showDecimal: {
      type: Boolean,
      value: true
    }
  },

  data: {
    /**
     * 价格类名组合
     */
    priceClass: '',
    /**
     * 整数部分
     */
    integerPart: '',
    /**
     * 小数部分
     */
    decimalPart: '',
    /**
     * 原价整数部分
     */
    originalInteger: '',
    /**
     * 原价小数部分
     */
    originalDecimal: ''
  },

  observers: {
    'size, color': function (size, color) {
      this.updatePriceClass();
    },
    'value, showDecimal': function (value, showDecimal) {
      this.updatePriceParts();
    },
    'original': function (original) {
      this.updateOriginalParts();
    }
  },

  lifetimes: {
    attached: function () {
      this.updatePriceClass();
      this.updatePriceParts();
      this.updateOriginalParts();
    }
  },

  methods: {
    /**
     * 更新价格类名
     */
    updatePriceClass: function () {
      const { size, color } = this.properties;
      const classes = ['s-price'];
      classes.push(`s-price-${size}`);
      classes.push(`s-price-${color}`);
      this.setData({
        priceClass: classes.join(' ')
      });
    },

    /**
     * 更新价格各部分
     */
    updatePriceParts: function () {
      const { value, showDecimal } = this.properties;
      const priceStr = String(value);
      
      if (priceStr.indexOf('.') !== -1) {
        const parts = priceStr.split('.');
        this.setData({
          integerPart: parts[0],
          decimalPart: showDecimal ? parts[1] : ''
        });
      } else {
        this.setData({
          integerPart: priceStr,
          decimalPart: showDecimal ? '00' : ''
        });
      }
    },

    /**
     * 更新原价各部分
     */
    updateOriginalParts: function () {
      const { original } = this.properties;
      
      if (!original && original !== 0) {
        this.setData({
          originalInteger: '',
          originalDecimal: ''
        });
        return;
      }
      
      const originalStr = String(original);
      
      if (originalStr.indexOf('.') !== -1) {
        const parts = originalStr.split('.');
        this.setData({
          originalInteger: parts[0],
          originalDecimal: parts[1]
        });
      } else {
        this.setData({
          originalInteger: originalStr,
          originalDecimal: '00'
        });
      }
    }
  }
});
