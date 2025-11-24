/**
 * 文件名: componentTemplate.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 描述: 组件模板 - 提供标准化的组件结构示例
 */

const { createComponent } = require('../../utils/componentFactory');

// 使用组件工厂创建组件配置
const componentConfig = createComponent({
  /**
   * 组件的属性列表
   */
  properties: {
    // 示例属性 - 标题
    title: {
      type: String,
      value: '',
      observer: function(newVal) {
        // 属性变化时的处理逻辑
        this._onTitleChange(newVal);
      }
    },
    
    // 示例属性 - 是否显示
    show: {
      type: Boolean,
      value: true
    },
    
    // 示例属性 - 自定义样式类
    customClass: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 内部状态数据
    isLoading: false,
    error: null
  },
  
  /**
   * 状态映射（自动连接到全局状态管理）
   */
  mapState: {
    // 映射全局用户信息
    userInfo: 'user.userInfo',
    // 使用函数形式进行更复杂的映射
    appTheme: state => state.ui.theme || 'light'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理标题变化
     * @private
     * @param {string} newTitle - 新标题
     */
    _onTitleChange(newTitle) {
      // 私有方法，处理内部逻辑
      console.log('标题已更改为:', newTitle);
    },
    
    /**
     * 公共方法 - 重置组件状态
     * @public
     */
    reset() {
      this.setData({
        isLoading: false,
        error: null
      });
    },
    
    /**
     * 公共方法 - 触发事件
     * @public
     * @param {string} eventType - 事件类型
     * @param {Object} detail - 事件详情
     */
    triggerCustomEvent(eventType, detail = {}) {
      this.triggerEvent(eventType, {
        ...detail,
        source: this.data.title || 'componentTemplate'
      });
    },
    
    /**
     * 处理点击事件
     * @public
     */
    handleClick() {
      this.triggerCustomEvent('click');
    }
  },

  /**
   * 组件生命周期函数
   */
  lifetimes: {
    /**
     * 组件实例刚被创建好
     */
    created() {
      console.log('组件被创建');
    },
    
    /**
     * 组件实例进入页面节点树
     */
    attached() {
      console.log('组件已挂载');
      // 初始化逻辑可以在这里进行
      this._initialize();
    },
    
    /**
     * 组件在视图层布局完成
     */
    ready() {
      console.log('组件已就绪');
    },
    
    /**
     * 组件实例被移动到节点树另一个位置
     */
    moved() {
      console.log('组件被移动');
    },
    
    /**
     * 组件实例被从页面节点树移除
     */
    detached() {
      console.log('组件已卸载');
      // 清理资源
      this._cleanup();
    }
  },
  
  /**
   * 组件所在页面的生命周期函数
   */
  pageLifetimes: {
    /**
     * 组件所在的页面被展示时执行
     */
    show() {
      console.log('页面显示');
    },
    
    /**
     * 组件所在的页面被隐藏时执行
     */
    hide() {
      console.log('页面隐藏');
    },
    
    /**
     * 组件所在的页面尺寸变化时执行
     */
    resize(size) {
      console.log('页面尺寸变化:', size);
    }
  },
  
  /**
   * 数据监听器
   */
  observers: {
    // 监听多个属性变化
    'title, show': function(title, show) {
      console.log('标题和显示状态发生变化:', title, show);
    }
  },
  
  /**
   * 外部样式类
   */
  externalClasses: ['custom-class'],
  
  /**
   * 组件间关系定义
   */
  relations: {
    // 定义与其他组件的关系
  },
  
  /**
   * 组件选项
   */
  options: {
    // 启用多slot支持
    multipleSlots: true,
    // 样式隔离
    styleIsolation: 'isolated'
  },
  
  /**
   * 错误处理器
   * @param {Error} error - 错误对象
   * @param {string} hookName - 发生错误的钩子名称
   */
  errorHandler(error, hookName) {
    console.error(`组件 ${hookName} 钩子发生错误:`, error);
    this.setData({
      error: error.message || 'Unknown error'
    });
  }
});

// 私有方法定义
Object.assign(componentConfig.methods, {
  /**
   * 初始化组件
   * @private
   */
  _initialize() {
    // 初始化逻辑
  },
  
  /**
   * 清理资源
   * @private
   */
  _cleanup() {
    // 清理定时器、事件监听器等
  }
});

Component(componentConfig);
