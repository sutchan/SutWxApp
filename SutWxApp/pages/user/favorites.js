/**
 * 鐢ㄦ埛鏀惰棌椤甸潰
 * 灞曠ず鐢ㄦ埛鏀惰棌鐨勬枃绔犲垪琛紝鏀寔鍙栨秷鏀惰棌鍜岃烦杞埌鏂囩珷璇︽儏
 */
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    favorites: [], // 鏀惰棌鍒楄〃鏁版嵁
    loading: false, // 鍔犺浇鐘舵€?    refreshing: false, // 涓嬫媺鍒锋柊鐘舵€?    error: null, // 閿欒淇℃伅
    hasMore: true, // 鏄惁鏈夋洿澶氭暟鎹?    page: 1, // 褰撳墠椤电爜
    pageSize: 10 // 姣忛〉鏁伴噺
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function() {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'favorites'
    });
    
    // 鍔犺浇鏀惰棌鏁版嵁
    this.loadFavorites();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   * 姣忔鏄剧ず椤甸潰鏃跺埛鏂版暟鎹?   */
  onShow: function() {
    // 妫€鏌ユ槸鍚﹂渶瑕佸埛鏂?    if (this.data.hasDataChanged) {
      this.setData({
        hasDataChanged: false,
        page: 1,
        hasMore: true
      });
      this.loadFavorites(true);
    }
  },

  /**
   * 鍔犺浇鏀惰棌鏁版嵁
   * @param {boolean} refresh - 鏄惁涓哄埛鏂版搷浣?   */
  async loadFavorites(refresh = false) {
    try {
      // 濡傛灉鏄埛鏂帮紝閲嶇疆椤电爜
      if (refresh) {
        this.setData({
          refreshing: true,
          page: 1,
          hasMore: true,
          error: null
        });
      } else {
        // 濡傛灉涓嶆槸鍒锋柊涓斿凡缁忔病鏈夋洿澶氭暟鎹紝涓嶆墽琛屽姞杞?        if (!this.data.hasMore || this.data.loading) {
          return;
        }
        
        this.setData({
          loading: true,
          error: null
        });
      }

      // 浣跨敤favoriteService鑾峰彇鏀惰棌鍒楄〃
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize
      };
      const result = await app.services.favorite.getFavoriteList(params);
      
      const newItems = result.items || [];
      const favoritesList = refresh ? newItems : [...this.data.favorites, ...newItems];
      
      this.setData({
        favorites: favoritesList,
        hasMore: favoritesList.length < result.total || false,
        page: this.data.page + 1
      });
    } catch (err) {
      this.handleError(err);
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
      // 鍋滄涓嬫媺鍒锋柊
      if (refresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  /**
   * 澶勭悊閿欒
   * @param {Object} error - 閿欒瀵硅薄
   */
  handleError(error) {
    let errorMessage = '鑾峰彇鏀惰棌鍒楄〃澶辫触';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (error.errMsg) {
      errorMessage = error.errMsg;
    }
    
    this.setData({
      error: errorMessage
    });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  retryLoad: function() {
    // 璁板綍閲嶈瘯鍔犺浇浜嬩欢
    app.analyticsService.track('retry_loading', {
      page: 'favorites'
    });
    
    this.loadFavorites(true);
  },

  /**
   * 鍙栨秷鏀惰棌
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  cancelFavorite(e) {
    const favoriteId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const articleId = e.currentTarget.dataset.articleId;
    
    // 鏄剧ず纭瀵硅瘽妗?    wx.showModal({
      title: '纭鍙栨秷鏀惰棌',
      content: '纭畾瑕佸彇娑堟敹钘忚繖绡囨枃绔犲悧锛?,
      success: async (res) => {
        if (res.confirm) {
          try {
            // 涔愯UI鏇存柊
            const updatedFavorites = [...this.data.favorites];
            updatedFavorites.splice(index, 1);
            
            this.setData({
              favorites: updatedFavorites
            });
            
            // 璁板綍鍙栨秷鏀惰棌浜嬩欢
            app.analyticsService.track('favorite_removed', {
              favorite_id: favoriteId,
              article_id: articleId
            });
            
            // 浣跨敤favoriteService鍙栨秷鏀惰棌
            await app.services.favorite.removeFavorite(favoriteId);
            
            this.setData({
              hasDataChanged: true
            });
            
            showToast('鍙栨秷鏀惰棌鎴愬姛', 'success');
          } catch (err) {
            // 澶辫触鏃跺洖婊歎I
            this.loadFavorites(true);
            showToast(err.message || '鍙栨秷鏀惰棌澶辫触锛岃閲嶈瘯', 'none');
          }
        }
      }
    });
  },

  /**
   * 璺宠浆鍒版枃绔犺鎯?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  navigateToArticleDetail: function(e) {
    const articleId = e.currentTarget.dataset.articleId;
    
    // 璁板綍鏂囩珷鐐瑰嚮浜嬩欢
    app.analyticsService.track('favorite_article_clicked', {
      article_id: articleId
    });
    
    wx.navigateTo({
      url: `/pages/article/detail?id=${articleId}`
    });
  },

  /**
   * 鍔犺浇鏇村
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadFavorites();
    }
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    this.loadFavorites(true);
  },

  /**
   * 涓婃媺鍔犺浇鏇村
   */
  onReachBottom: function() {
    this.loadMore();
  }
});\n