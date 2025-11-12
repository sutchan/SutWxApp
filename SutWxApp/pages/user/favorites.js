锘?**
 * 閻劍鍩涢弨鎯版妞ょ敻娼? * 鐏炴洜銇氶悽銊﹀煕閺€鎯版閻ㄥ嫭鏋冪粩鐘插灙鐞涱煉绱濋弨顖涘瘮閸欐牗绉烽弨鎯版閸滃矁鐑︽潪顒€鍩岄弬鍥╃彿鐠囷附鍎? */
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    favorites: [], // 閺€鎯版閸掓銆冮弫鐗堝祦
    loading: false, // 閸旂姾娴囬悩鑸碘偓?    refreshing: false, // 娑撳濯洪崚閿嬫煀閻樿埖鈧?    error: null, // 闁挎瑨顕ゆ穱鈩冧紖
    hasMore: true, // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?    page: 1, // 瑜版挸澧犳い鐢电垳
    pageSize: 10 // 濮ｅ繘銆夐弫浼村櫤
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function() {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'favorites'
    });
    
    // 閸旂姾娴囬弨鎯版閺佺増宓?    this.loadFavorites();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   * 濮ｅ繑顐奸弰鍓с仛妞ょ敻娼伴弮璺哄煕閺傜増鏆熼幑?   */
  onShow: function() {
    // 濡偓閺屻儲妲搁崥锕傛付鐟曚礁鍩涢弬?    if (this.data.hasDataChanged) {
      this.setData({
        hasDataChanged: false,
        page: 1,
        hasMore: true
      });
      this.loadFavorites(true);
    }
  },

  /**
   * 閸旂姾娴囬弨鎯版閺佺増宓?   * @param {boolean} refresh - 閺勵垰鎯佹稉鍝勫煕閺傜増鎼锋担?   */
  async loadFavorites(refresh = false) {
    try {
      // 婵″倹鐏夐弰顖氬煕閺傚府绱濋柌宥囩枂妞ょ數鐖?      if (refresh) {
        this.setData({
          refreshing: true,
          page: 1,
          hasMore: true,
          error: null
        });
      } else {
        // 婵″倹鐏夋稉宥嗘Ц閸掗攱鏌婃稉鏂垮嚒缂佸繑鐥呴張澶嬫纯婢舵碍鏆熼幑顕嗙礉娑撳秵澧界悰灞藉鏉?        if (!this.data.hasMore || this.data.loading) {
          return;
        }
        
        this.setData({
          loading: true,
          error: null
        });
      }

      // 娴ｈ法鏁avoriteService閼惧嘲褰囬弨鎯版閸掓銆?      const params = {
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
      // 閸嬫粍顒涙稉瀣閸掗攱鏌?      if (refresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  /**
   * 婢跺嫮鎮婇柨娆掝嚖
   * @param {Object} error - 闁挎瑨顕ょ€电钖?   */
  handleError(error) {
    let errorMessage = '閼惧嘲褰囬弨鎯版閸掓銆冩径杈Е';
    
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
   * 闁插秷鐦崝鐘烘祰
   */
  retryLoad: function() {
    // 鐠佹澘缍嶉柌宥堢槸閸旂姾娴囨禍瀣╂
    app.analyticsService.track('retry_loading', {
      page: 'favorites'
    });
    
    this.loadFavorites(true);
  },

  /**
   * 閸欐牗绉烽弨鎯版
   * @param {Object} e - 娴滃娆㈢€电钖?   */
  cancelFavorite(e) {
    const favoriteId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const articleId = e.currentTarget.dataset.articleId;
    
    // 閺勫墽銇氱涵顔款吇鐎电鐦藉?    wx.showModal({
      title: '绾喛顓婚崣鏍ㄧХ閺€鎯版',
      content: '绾喖鐣剧憰浣稿絿濞戝牊鏁归挊蹇氱箹缁″洦鏋冪粩鐘叉偋閿?,
      success: async (res) => {
        if (res.confirm) {
          try {
            // 娑旀劘顫嘦I閺囧瓨鏌?            const updatedFavorites = [...this.data.favorites];
            updatedFavorites.splice(index, 1);
            
            this.setData({
              favorites: updatedFavorites
            });
            
            // 鐠佹澘缍嶉崣鏍ㄧХ閺€鎯版娴滃娆?            app.analyticsService.track('favorite_removed', {
              favorite_id: favoriteId,
              article_id: articleId
            });
            
            // 娴ｈ法鏁avoriteService閸欐牗绉烽弨鎯版
            await app.services.favorite.removeFavorite(favoriteId);
            
            this.setData({
              hasDataChanged: true
            });
            
            showToast('閸欐牗绉烽弨鎯版閹存劕濮?, 'success');
          } catch (err) {
            // 婢惰精瑙﹂弮璺烘礀濠婃瓗I
            this.loadFavorites(true);
            showToast(err.message || '閸欐牗绉烽弨鎯版婢惰精瑙﹂敍宀冾嚞闁插秷鐦?, 'none');
          }
        }
      }
    });
  },

  /**
   * 鐠哄疇娴嗛崚鐗堟瀮缁旂姾顕涢幆?   * @param {Object} e - 娴滃娆㈢€电钖?   */
  navigateToArticleDetail: function(e) {
    const articleId = e.currentTarget.dataset.articleId;
    
    // 鐠佹澘缍嶉弬鍥╃彿閻愮懓鍤禍瀣╂
    app.analyticsService.track('favorite_article_clicked', {
      article_id: articleId
    });
    
    wx.navigateTo({
      url: `/pages/article/detail?id=${articleId}`
    });
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadFavorites();
    }
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    this.loadFavorites(true);
  },

  /**
   * 娑撳﹥濯洪崝鐘烘祰閺囨潙顦?   */
  onReachBottom: function() {
    this.loadMore();
  }
});\n