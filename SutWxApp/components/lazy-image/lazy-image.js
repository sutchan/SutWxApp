// lazy-image.js - 图片懒加载组件
// 基于技术设计文档实现的高性能图片懒加载组件
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图片src地址
    src: {
      type: String,
      value: ''
    },
    
    // 占位图地址
    placeholder: {
      type: String,
      value: '/images/placeholder.png'
    },
    
    // 图片加载失败时显示的图
    error: {
      type: String,
      value: '/images/error.png'
    },
    
    // 是否使用渐进式加载
    progressive: {
      type: Boolean,
      value: false
    },
    
    // 渐进式加载的缩略图地址
    thumbSrc: {
      type: String,
      value: ''
    },
    
    // 图片alt属性
    alt: {
      type: String,
      value: ''
    },
    
    // 图片样式类
    imageClass: {
      type: String,
      value: ''
    },
    
    // 容器样式类
    containerClass: {
      type: String,
      value: ''
    },
    
    // 图片内联样式
    imgStyle: {
      type: String,
      value: ''
    },
    
    // 容器内联样式
    containerStyle: {
      type: String,
      value: ''
    },
    
    // 是否显示加载动画
    showLoading: {
      type: Boolean,
      value: true
    },
    
    // 预加载阈值（像素）
    preloadThreshold: {
      type: Number,
      value: 200
    },
    
    // 是否自动加载，默认为true
    autoLoad: {
      type: Boolean,
      value: true
    },
    
    // 是否启用节流
    throttle: {
      type: Boolean,
      value: true
    },
    
    // 节流时间（单位ms）
    throttleTime: {
      type: Number,
      value: 100
    },
    
    // 图片mode属性
    mode: {
      type: String,
      value: 'aspectFill'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 当前显示的图片地址
    displaySrc: '',
    // 是否已经加载过图片
    loaded: false,
    // 是否在可视区域内
    visible: false,
    // 是否正在加载中
    isLoading: false,
    // 是否加载失败
    error: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取元素位置信息
     */
    getRect() {
      return new Promise((resolve, reject) => {
        try {
          wx.createSelectorQuery().in(this)
            .select('.lazy-image-container')
            .boundingClientRect()
            .exec(res => {
              if (res && res[0]) {
                resolve(res[0]);
              } else {
                reject(new Error('获取元素位置失败'));
              }
            });
        } catch (error) {
          reject(error);
        }
      });
    },

    /**
     * 绑定滚动事件
     */
    bindScrollEvent() {
      if (this._scrollHandler) return;
      
      // 创建节流的滚动处理函数
      if (this.data.throttle) {
        this._scrollHandler = this.throttle(this.handleScroll, this.data.throttleTime);
      } else {
        this._scrollHandler = this.handleScroll.bind(this);
      }
      
      // 使用IntersectionObserver监听元素可见性（更现代的方式）
      try {
        this._observer = wx.createIntersectionObserver(this, {
          rootMargin: `${this.data.preloadThreshold}px 0px ${this.data.preloadThreshold}px 0px`
        });
        
        this._observer.relativeToViewport().observe('.lazy-image-container', (res) => {
          if (res.intersectionRatio > 0 && !this.data.loaded && !this.data.isLoading) {
            this.setData({ visible: true });
            this.loadImage();
          }
        });
      } catch (error) {
        console.warn('IntersectionObserver不可用，使用滚动事件作为备用:', error);
      }
      
      // 同时监听页面滚动作为备用方案
      wx.onPageScroll(this._scrollHandler);
    },

    /**
     * 解绑滚动事件
     */
    unbindScrollEvent() {
      if (this._scrollHandler) {
        wx.offPageScroll(this._scrollHandler);
        this._scrollHandler = null;
      }
      
      // 关闭相交观察者
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    },

    /**
     * 处理页面滚动
     */
    async handleScroll() {
      if (!this.data.loaded && !this.data.isLoading) {
        await this.checkVisibility();
      }
    },

    /**
     * 节流函数
     * @param {Function} func - 需要节流的函数
     * @param {number} delay - 延迟时间（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, delay) {
      let lastCall = 0;
      return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          return func.apply(this, args);
        }
      };
    },

    /**
     * 检查图片是否可见
     */
    async checkVisibility() {
      try {
        const rect = await this.getRect();
        if (!rect) return;

        // 获取窗口高度
        const windowHeight = wx.getSystemInfoSync().windowHeight;
        
        // 计算图片是否在可视区域内或预加载距离内
        const isVisible = rect.top < windowHeight + this.data.preloadThreshold && 
                          rect.bottom > -this.data.preloadThreshold;
        
        if (isVisible && !this.data.visible) {
          this.setData({ visible: true });
          this.loadImage();
        }
      } catch (error) {
        console.error('检查图片可见性失败:', error);
      }
    },

    /**
     * 加载图片
     * @param {string} [imageUrl] - 图片地址，如果不传则使用组件属性中的src
     */
    loadImage(imageUrl) {
      // 如果没有设置图片地址，或者已经加载过，或者正在加载中，则不执行
      const src = imageUrl || this.data.src;
      if (!src || this.data.loaded || this.data.isLoading) return;
      
      this.setData({ isLoading: true, error: false });
      
      // 设置初始显示的图片
      if (this.data.progressive && this.data.thumbSrc) {
        // 渐进式加载时显示缩略图
        this.setData({ displaySrc: this.data.thumbSrc });
        // 先加载缩略图
        this.loadThumbnail().then(() => {
          // 缩略图加载成功后，再加载原图
          return this.loadOriginalImage(src);
        }).catch(() => {
          // 缩略图加载失败，直接加载原图
          return this.loadOriginalImage(src);
        });
      } else {
        // 非渐进式加载时显示占位图
        this.setData({ displaySrc: this.data.placeholder });
        // 直接加载原图
        this.loadOriginalImage(src);
      }
    },
    
    /**
     * 加载缩略图
     * @returns {Promise}
     */
    loadThumbnail() {
      return new Promise((resolve, reject) => {
        const img = wx.createImage();
        img.src = this.data.thumbSrc;
        
        img.onload = () => {
          resolve();
        };
        
        img.onerror = () => {
          reject(new Error('缩略图加载失败'));
        };
      });
    },
    
    /**
     * 加载原始图片
     * @param {string} src - 图片地址
     */
    loadOriginalImage(src) {
      const image = wx.createImage();
      
      image.onload = () => {
        this.setData({
          displaySrc: src,
          loaded: true,
          isLoading: false,
          error: false
        });
        
        // 触发加载成功事件
        this.triggerEvent('load', {
          src: src,
          width: image.width,
          height: image.height
        });
        
        // 图片加载成功后，停止观察
        this.unbindScrollEvent();
      };
      
      image.onerror = (error) => {
        console.error('图片加载失败:', error);
        
        // 图片加载失败，显示错误图片
        this.setData({
          displaySrc: this.data.error,
          loaded: true,
          isLoading: false,
          error: true
        });
        
        // 触发加载失败事件
        this.triggerEvent('error', {
          src: src,
          error: error
        });
      };
      
      // 设置图片地址
      image.src = src;
    },
    
    /**
     * 手动加载图片（当autoLoad为false时使用）
     */
    manuallyLoad() {
      if (!this.data.loaded && !this.data.isLoading) {
        this.setData({ visible: true });
        this.loadImage();
      }
    },
    
    /**
     * 重新加载图片
     */
    reload() {
      this.setData({
        loaded: false,
        isLoading: false,
        error: false,
        visible: false
      });
      
      if (this.data.autoLoad) {
        this.bindScrollEvent();
        this.checkVisibility();
      }
    },
    
    /**
     * 图片点击事件
     */
    onImageTap() {
      this.triggerEvent('tap');
      
      // 如果图片加载失败，可以触发重新加载
      if (this.data.error) {
        this.reload();
      }
    },
    
    /**
     * 开始观察元素是否在可视区域
     */
    startObserver() {
      // 如果已经加载过，则不再观察
      if (this.data.loaded) return;
      
      // 绑定滚动事件
      this.bindScrollEvent();
      
      // 立即检查一次
      this.checkVisibility();
    },
    
    /**
     * 停止观察元素
     */
    stopObserver() {
      this.unbindScrollEvent();
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    // 组件实例进入页面节点树时执行
    attached() {
      // 初始化数据
      this.setData({ 
        displaySrc: this.data.placeholder,
        loaded: false,
        visible: false,
        isLoading: false,
        error: false
      });
      
      if (this.data.autoLoad) {
        this.startObserver();
      }
    },
    
    // 组件实例被从页面节点树移除时执行
    detached() {
      this.stopObserver();
    },
    
    // 组件移动位置时执行
    moved() {
      // 组件移动位置后重新检查可见性
      if (this.data.autoLoad && !this.data.loaded) {
        setTimeout(() => {
          this.checkVisibility();
        }, 0);
      }
    },
    
    // 组件所在页面显示时执行
    show() {
      if (this.data.autoLoad && !this.data.loaded) {
        this.startObserver();
      }
    },
    
    // 组件所在页面隐藏时执行
    hide() {
      this.stopObserver();
    }
  },

  /**
   * 监听属性变化
   */
  observers: {
    'src': function(newSrc) {
      if (newSrc) {
        // 图片地址改变时重置状态
        this.setData({
          loaded: false,
          isLoading: false,
          visible: false,
          error: false
        });
        
        // 如果元素已经可见或设置为自动加载，则重新加载
        if ((this.data.visible || this.data.autoLoad) && !this.data.loaded && !this.data.isLoading) {
          this.loadImage(newSrc);
        }
      }
    }
  }
});