// pages/category/category.js
/**
 * 鍒嗙被椤甸潰 - 灞曠ず鏂囩珷鍒嗙被鍒楄〃鍙婂悇鍒嗙被涓嬬殑鏂囩珷鍐呭
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    categories: [], // 鍒嗙被鍒楄〃
    loading: true, // 鍔犺浇鐘舵€?    loadingMore: false, // 鍔犺浇鏇村鐘舵€?    error: '', // 閿欒淇℃伅
    showSkeleton: true, // 鏄惁鏄剧ず楠ㄦ灦灞?    currentCategoryId: 0, // 褰撳墠閫変腑鐨勫垎绫籌D
    currentSubCategoryId: 0, // 褰撳墠閫変腑鐨勫瓙鍒嗙被ID
    currentCategory: null, // 褰撳墠閫変腑鐨勫垎绫诲璞?    articles: [], // 褰撳墠鍒嗙被涓嬬殑鏂囩珷鍒楄〃
    hasMore: true, // 鏄惁鏈夋洿澶氭暟鎹?    page: 1, // 褰撳墠椤电爜
    pageSize: 10, // 姣忛〉鏁伴噺
    needRefresh: false // 鏄惁闇€瑕佸埛鏂版暟鎹紙浠庡叾浠栭〉闈㈣繑鍥炴椂锛?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    this.loadCategories();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 濡傛灉浠庡叾浠栭〉闈㈣繑鍥烇紝鍙互閲嶆柊鍔犺浇鏁版嵁
    if (this.data.needRefresh) {
      this.setData({
        needRefresh: false,
        articles: [],
        page: 1,
        hasMore: true
      });
      this.loadCategoryArticles(this.data.currentCategoryId, this.data.currentSubCategoryId);
    }
  },

  /**
   * 鍔犺浇鍒嗙被鍒楄〃
   */
  loadCategories: function() {
    const app = getApp();
    
    app.request({
      url: '/content/categories',
      method: 'GET',
      loadingText: '鍔犺浇鍒嗙被涓?,
      success: (res) => {
        if (res.code === 200) {
          const categories = res.data.categories || [];
          this.setData({
            categories: categories,
            loading: false,
            showSkeleton: false,
            error: ''
          });
          
          // 濡傛灉鏈夊垎绫伙紝榛樿閫変腑绗竴涓垎绫?          if (categories && categories.length > 0) {
            const firstCategory = categories[0];
            this.setData({
              currentCategoryId: firstCategory.id,
              currentCategory: firstCategory
            });
            // 濡傛灉绗竴涓垎绫绘湁瀛愬垎绫伙紝榛樿閫変腑绗竴涓瓙鍒嗙被
            if (firstCategory.children && firstCategory.children.length > 0) {
              this.setData({
                currentSubCategoryId: firstCategory.children[0].id
              });
              this.loadCategoryArticles(firstCategory.id, firstCategory.children[0].id);
            } else {
              this.loadCategoryArticles(firstCategory.id, 0);
            }
          }
        } else {
          const errorMsg = res.message || '鑾峰彇鍒嗙被澶辫触';
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
          this.setData({
            loading: false,
            showSkeleton: false,
            error: errorMsg
          });
        }
      },
      fail: (error) => {
        console.error('鑾峰彇鍒嗙被鍒楄〃澶辫触:', error);
        const errorMsg = '缃戠粶閿欒锛岃閲嶈瘯';
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
        
        // 璁板綍閿欒淇℃伅锛屽寘鍚郴缁熺幆澧?        const systemInfo = this._getSystemInfo();
        console.error('鍒嗙被椤甸潰鍔犺浇澶辫触璇︽儏:', {
          error: error,
          system: {
            platform: systemInfo.platform,
            version: systemInfo.version
          }
        });
        
        this.setData({
          loading: false,
          showSkeleton: false,
          error: errorMsg
        });
      }
    });
  },
  
  /**
   * 鍔犺浇鍒嗙被鏂囩珷
   */
  loadCategoryArticles: function(categoryId, subCategoryId) {
    this.setData({
      articles: [],
      page: 1,
      hasMore: true,
      loadingMore: false
    });
    this.getCategoryArticles(categoryId, subCategoryId, 1);
  },
  
  /**
   * 鑾峰彇绯荤粺淇℃伅锛岀敤浜庤皟璇曞拰閿欒璺熻釜
   * @private
   */
  _getSystemInfo: function() {
    try {
      return wx.getSystemInfoSync();
    } catch (e) {
      console.error('鑾峰彇绯荤粺淇℃伅澶辫触:', e);
      return {};
    }
  },

  /**
   * 鑾峰彇鍒嗙被鏂囩珷鍒楄〃
   * @param {number} categoryId - 鍒嗙被ID
   * @param {number} subCategoryId - 瀛愬垎绫籌D
   * @param {number} page - 椤电爜
   */
  getCategoryArticles: function(categoryId, subCategoryId, page) {
    if (!this.data.hasMore && page > 1) return;

    const app = getApp();
    
    const params = {
      category: categoryId,
      page: page,
      per_page: this.data.pageSize,
      orderby: 'date',
      order: 'desc'
    };

    // 濡傛灉鏈夊瓙鍒嗙被锛屾坊鍔犲瓙鍒嗙被鍙傛暟
    if (subCategoryId && subCategoryId > 0) {
      // 娉ㄦ剰锛氭牴鎹瓵PI鏂囨。锛岃繖閲屽彲鑳介渶瑕佺壒娈婂鐞嗗瓙鍒嗙被锛屽彲鑳介渶瑕佽皟鏁村弬鏁板悕
      params.sub_category = subCategoryId;
    }

    app.request({
      url: '/content/posts',
      method: 'GET',
      data: params,
      loadingText: '鍔犺浇鏂囩珷涓?,
      success: (res) => {
        if (res.code === 200) {
          const articles = res.data.posts || [];
          const total = res.data.total || 0;
          const pages = res.data.pages || 1;
          
          // 濡傛灉鏄涓€椤碉紝鍒欐浛鎹㈡枃绔犲垪琛紱鍚﹀垯杩藉姞
          if (page === 1) {
            this.setData({
              articles: articles
            });
          } else {
            this.setData({
              articles: [...this.data.articles, ...articles]
            });
          }
          
          // 鍒ゆ柇鏄惁杩樻湁鏇村鏁版嵁
          this.setData({
            hasMore: page < pages,
            page: page + 1,
            loadingMore: false
          });
          
          // 濡傛灉娌℃湁鏁版嵁锛屾樉绀烘彁绀?          if (articles.length === 0 && page === 1) {
            wx.showToast({
              title: '褰撳墠鍒嗙被鏆傛棤鏂囩珷',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          wx.showToast({
            title: res.message || '鑾峰彇鏂囩珷澶辫触',
            icon: 'none',
            duration: 2000
          });
          this.setData({
            loadingMore: false
          });
        }
      },
      fail: (error) => {
        console.error('鑾峰彇鏂囩珷鍒楄〃澶辫触:', error);
        
        // 鍔犺浇鏇村鏃剁殑閿欒澶勭悊涓嶅悓浜庡垵濮嬪姞杞?        if (page > 1) {
          // 鍔犺浇鏇村澶辫触锛屼笉鏄剧ず鍏ㄥ眬閿欒锛屼絾鏄剧ずtoast鎻愮ず
          wx.showToast({
            title: '鍔犺浇鏇村澶辫触锛岃閲嶈瘯',
            icon: 'none',
            duration: 2000
          });
        } else {
          // 鍒濆鍔犺浇澶辫触锛屾樉绀洪敊璇彁绀?          wx.showToast({
            title: '鍔犺浇鏂囩珷澶辫触锛岃閲嶈瘯',
            icon: 'none',
            duration: 2000
          });
        }
        
        this.setData({
          loadingMore: false
        });
      },
      complete: () => {
        // 纭繚涓嬫媺鍒锋柊鍋滄
        wx.stopPullDownRefresh();
      }
    });
  },

  /**
   * 鍒囨崲鍒嗙被
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    if (categoryId === this.data.currentCategoryId) return; // 闃叉閲嶅鐐瑰嚮
    
    const category = this.data.categories.find(cat => cat.id === categoryId);
    
    if (category) {
      this.setData({
        currentCategoryId: categoryId,
        currentCategory: category,
        currentSubCategoryId: category.children && category.children.length > 0 ? category.children[0].id : 0,
        articles: [],
        page: 1,
        hasMore: true
      });
      
      this.loadCategoryArticles(categoryId, this.data.currentSubCategoryId);
    }
  },

  /**
   * 鍒囨崲瀛愬垎绫?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  switchSubCategory: function(e) {
    const subCategoryId = e.currentTarget.dataset.id;
    if (subCategoryId === this.data.currentSubCategoryId) return; // 闃叉閲嶅鐐瑰嚮
    
    this.setData({
      currentSubCategoryId: subCategoryId,
      articles: [],
      page: 1,
      hasMore: true
    });
    
    this.loadCategoryArticles(this.data.currentCategoryId, subCategoryId);
  },

  /**
   * 璺宠浆鍒版枃绔犺鎯呴〉
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  goToArticleDetail: function(e) {
    const articleId = e.currentTarget.dataset.id;
    if (!articleId) {
      wx.showToast({
        title: '鏂囩珷ID涓嶅瓨鍦?,
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/article/detail/detail?id=' + articleId,
      fail: function() {
        wx.showToast({
          title: '璺宠浆鏂囩珷璇︽儏澶辫触',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 鍔犺浇鏇村鏂囩珷
   */
  loadMoreArticles: function() {
    if (this.data.loadingMore || !this.data.hasMore) return;
    
    this.setData({
      loadingMore: true
    });
    
    const nextPage = this.data.page;
    this.getCategoryArticles(this.data.currentCategoryId, this.data.currentSubCategoryId, nextPage);
  },
  
  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function() {
    this.loadMoreArticles();
  },

  /**
   * 椤甸潰涓嬫媺鍒锋柊浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onPullDownRefresh: function() {
    this.setData({
      showSkeleton: true,
      error: ''
    });
    this.loadCategories();
    wx.stopPullDownRefresh();
  },
  
  /**
   * 閲嶈瘯鍔犺浇鏁版嵁
   */
  onRetry: function() {
    this.setData({
      loading: true,
      showSkeleton: true,
      error: ''
    });
    this.loadCategories();
  }
});