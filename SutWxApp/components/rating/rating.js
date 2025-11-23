/**
 * 文件名: rating.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 评分组件
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 当前评分值
    value: {
      type: Number,
      value: 0
    },
    // 最大评分值
    max: {
      type: Number,
      value: 5
    },
    // 是否只读
    readonly: {
      type: Boolean,
      value: false
    },
    // 是否允许半星
    allowHalf: {
      type: Boolean,
      value: false
    },
    // 星星大小
    size: {
      type: String,
      value: '40rpx'
    },
    // 星星间距
    gutter: {
      type: String,
      value: '10rpx'
    },
    // 未选中颜色
    voidColor: {
      type: String,
      value: '#ddd'
    },
    // 选中颜色
    color: {
      type: String,
      value: '#ffc107'
    },
    // 是否显示分数
    showScore: {
      type: Boolean,
      value: false
    },
    // 分数文本模板
    scoreText: {
      type: String,
      value: '{value}分'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    stars: []
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    /**
     * 组件实例进入页面节点树时执行
     */
    attached() {
      this.initStars();
    }
  },

  /**
   * 组件的属性监听器
   */
  observers: {
    'value, max, allowHalf': function(value, max, allowHalf) {
      this.initStars();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 初始化星星数组
     */
    initStars() {
      const { value, max, allowHalf } = this.data;
      const stars = [];
      
      for (let i = 1; i <= max; i++) {
        let status = 'void'; // void, half, full
        
        if (allowHalf) {
          if (value >= i) {
            status = 'full';
          } else if (value >= i - 0.5) {
            status = 'half';
          }
        } else {
          status = value >= i ? 'full' : 'void';
        }
        
        stars.push({
          index: i,
          status: status
        });
      }
      
      this.setData({ stars });
    },

    /**
     * 点击星星
     */
    onStarTap(e) {
      if (this.data.readonly) return;
      
      const { index } = e.currentTarget.dataset;
      this.setData({ value: index });
      this.triggerEvent('change', { value: index });
    },

    /**
     * 点击星星左半部分（用于半星）
     */
    onStarHalfTap(e) {
      if (this.data.readonly || !this.data.allowHalf) return;
      
      const { index } = e.currentTarget.dataset;
      const halfValue = index - 0.5;
      this.setData({ value: halfValue });
      this.triggerEvent('change', { value: halfValue });
    }
  }
});