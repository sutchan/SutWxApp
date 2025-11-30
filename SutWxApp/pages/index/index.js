/**
 * 文件名: index.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 浣滆€? Sut
 * 棣栭〉椤甸潰鑴氭湰
 */

const i18n = require('../../utils/i18n');
const { createPage } = require('../../utils/useStore.js');

// 浣跨敤鐘舵€佺鐞嗗垱寤洪〉闈㈤厤缃?Page(createPage(
  // 鏄犲皠鐨勭姸鎬?  ['user.isLoggedIn', 'ui.loading'],
  // 鏄犲皠鐨刴utations
  {
    setLoading: 'SET_LOADING'
  }
)({
  data: {
    i18n: i18n,
    banners: [],
    categories: [],
    products: [],
    timer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad() {
    this.loadData();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload() {
    // 娓呯悊瀹氭椂鍣紝闃叉鍐呭瓨娉勬紡
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 椤甸潰鏄剧ず鏃惰Е鍙?   */
  onShow() {
    // 鍙互鍦ㄦ澶勫埛鏂伴儴鍒嗘暟鎹?  },

  /**
   * 涓嬫媺鍒锋柊鍥炶皟
   */
  onPullDownRefresh() {
    this.loadData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 瑙﹀簳鍔犺浇鏇村
   */
  onReachBottom() {
    // 棰勭暀锛氬垎椤靛姞杞?  },

  /**
   * 鏁版嵁缂撳瓨閿?   */
  cacheKeys: {
    BANNERS: 'index_banners',
    CATEGORIES: 'index_categories',
    PRODUCTS: 'index_products'
  },

  /**
   * 缂撳瓨杩囨湡鏃堕棿(姣)
   */
  cacheExpireTime: 5 * 60 * 1000, // 5鍒嗛挓

  /**
   * 鍔犺浇棣栭〉鏁版嵁
   * @param {Function} done - 瀹屾垚鍥炶皟
   */
  loadData(done) {
    // 浣跨敤store璁剧疆鍔犺浇鐘舵€?    this.setLoading(true);
    
    // 灏濊瘯浠庣紦瀛樿幏鍙栨暟鎹?    const cachedData = this.getCachedData();
    
    if (cachedData && Object.keys(cachedData).length > 0) {
      // 鏈夌紦瀛樻暟鎹紝鍏堟樉绀虹紦瀛?      this.setData(cachedData);
      this.setLoading(false);
      
      if (typeof done === 'function') done();
    }
    
    // 寮傛鍔犺浇鏈€鏂版暟鎹?    const timer = setTimeout(() => {
      const mockBanners = [
        { id: 1, image: '/images/placeholder.svg' },
        { id: 2, image: '/images/placeholder.svg' },
        { id: 3, image: '/images/placeholder.svg' }
      ];
      const mockCategories = [
        { id: 1, name: i18n.translate('鏂板搧') || '鏂板搧', icon: '/images/placeholder.svg' },
        { id: 2, name: i18n.translate('鎺ㄨ崘') || '鎺ㄨ崘', icon: '/images/placeholder.svg' },
        { id: 3, name: i18n.translate('鐑崠') || '鐑崠', icon: '/images/placeholder.svg' },
        { id: 4, name: i18n.translate('鍒嗙被') || '鍒嗙被', icon: '/images/placeholder.svg' }
      ];
      const mockProducts = [
        { id: 1, name: i18n.translate('鍟嗗搧A') || '鍟嗗搧A', image: '/images/placeholder.svg', price: '99.00' },
        { id: 2, name: i18n.translate('鍟嗗搧B') || '鍟嗗搧B', image: '/images/placeholder.svg', price: '129.00' },
        { id: 3, name: i18n.translate('鍟嗗搧C') || '鍟嗗搧C', image: '/images/placeholder.svg', price: '79.00' },
        { id: 4, name: i18n.translate('鍟嗗搧D') || '鍟嗗搧D', image: '/images/placeholder.svg', price: '159.00' }
      ];
      
      // 棰勫姞杞藉浘鐗?      this.preloadImages([
        ...mockBanners.map(item => item.image),
        ...mockCategories.map(item => item.icon),
        ...mockProducts.map(item => item.image)
      ]);

      this.setData({
        banners: mockBanners,
        categories: mockCategories,
        products: mockProducts,
        timer: null
      });
      
      // 缂撳瓨鏁版嵁
      this.cacheData({
        banners: mockBanners,
        categories: mockCategories,
        products: mockProducts
      });
      
      // 浣跨敤store璁剧疆鍔犺浇鐘舵€佷负false
      this.setLoading(false);
      
      // 濡傛灉娌℃湁缂撳瓨鏁版嵁锛屽垯璋冪敤鍥炶皟
      if (!cachedData && typeof done === 'function') {
        done();
      }
    }, 300);
    
    this.setData({ timer });
  },

  /**
   * 浠庣紦瀛樿幏鍙栨暟鎹?   * @returns {Object|null} 缂撳瓨鐨勬暟鎹?   */
  getCachedData() {
    try {
      const now = Date.now();
      const cachedData = {};
      let hasValidCache = false;
      
      // 妫€鏌ユ瘡涓紦瀛橀」
      Object.values(this.cacheKeys).forEach(key => {
        const cached = wx.getStorageSync(key);
        if (cached && now - cached.timestamp < this.cacheExpireTime) {
          // 鏍规嵁缂撳瓨閿幏鍙栧搴旂殑瀛楁鍚?          if (key === this.cacheKeys.BANNERS) {
            cachedData.banners = cached.data;
          } else if (key === this.cacheKeys.CATEGORIES) {
            cachedData.categories = cached.data;
          } else if (key === this.cacheKeys.PRODUCTS) {
            cachedData.products = cached.data;
          }
          hasValidCache = true;
        }
      });
      
      return hasValidCache ? cachedData : null;
    } catch (error) {
      console.error('鑾峰彇缂撳瓨鏁版嵁澶辫触:', error);
      return null;
    }
  },

  /**
   * 缂撳瓨鏁版嵁
   * @param {Object} data - 瑕佺紦瀛樼殑鏁版嵁
   */
  cacheData(data) {
    try {
      const timestamp = Date.now();
      
      // 缂撳瓨鍚勪釜鏁版嵁椤?      if (data.banners) {
        wx.setStorageSync(this.cacheKeys.BANNERS, {
          data: data.banners,
          timestamp
        });
      }
      
      if (data.categories) {
        wx.setStorageSync(this.cacheKeys.CATEGORIES, {
          data: data.categories,
          timestamp
        });
      }
      
      if (data.products) {
        wx.setStorageSync(this.cacheKeys.PRODUCTS, {
          data: data.products,
          timestamp
        });
      }
    } catch (error) {
      console.error('缂撳瓨鏁版嵁澶辫触:', error);
    }
  },

  /**
   * 棰勫姞杞藉浘鐗?   * @param {Array} imageUrls - 鍥剧墖URL鏁扮粍
   */
  preloadImages(imageUrls) {
    imageUrls.forEach(url => {
      wx.getImageInfo({
        src: url,
        success: () => {},
        fail: () => {}
      });
    });
  },

  /**
   * 璺宠浆鍒板垎绫婚〉闈?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  goToCategory(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/category/category?id=${id}`
    });
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯呴〉
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  },
  
  /**
   * 璺宠浆鍒扮敤鎴蜂腑蹇?   */
  goToUserCenter() {
    wx.navigateTo({
      url: '/pages/user/user'
    });
  },
  
  /**
   * 璺宠浆鍒拌喘鐗╄溅
   */
  goToCart() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    });
  }
}));