锘?/ 閻劍鍩涚拠鍕啈妞ょ敻娼伴柅鏄忕帆
import { showToast } from '../../utils/global';

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    commentsList: [], // 鐠囧嫯顔戦崚妤勩€?    loading: true, // 閺勵垰鎯佸锝呮躬閸旂姾娴?    error: false, // 閺勵垰鎯侀崝鐘烘祰婢惰精瑙?    hasMore: true, // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?    page: 1, // 瑜版挸澧犳い鐢电垳
    pageSize: 10, // 濮ｅ繘銆夐弫鐗堝祦闁?    refreshing: false // 閺勵垰鎯佸锝呮躬閸掗攱鏌?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    const app = getApp();
    
    // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 閸旂姾娴囩拠鍕啈閺佺増宓?    this.loadCommentsData();
    
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.services.analytics.trackPageView('user_comments');
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 濮ｅ繑顐奸弰鍓с仛妞ょ敻娼伴弮璺哄讲娴犮儱鍩涢弬鐗堟殶閹诡噯绱濋悧鐟板焼閺勵垯绮犻崗鏈电铂妞ょ敻娼版潻鏂挎礀閺?    if (!this.data.loading && !this.data.refreshing) {
      this.loadCommentsData(true);
    }
  },

  /**
   * 閸旂姾娴囩拠鍕啈閺佺増宓?   * @param {boolean} refresh 閺勵垰鎯侀崚閿嬫煀閺佺増宓侀敍鍫ュ櫢缂冾噣銆夐惍渚婄礆
   */
  loadCommentsData: async function(refresh = false) {
    const app = getApp();
    
    if (refresh) {
      // 闁插秶鐤嗛悩鑸碘偓?      this.setData({
        page: 1,
        commentsList: [],
        hasMore: true
      });
    }

    if (!this.data.hasMore && !refresh) {
      return;
    }

    // 閺勫墽銇氶崝鐘烘祰閻樿埖鈧?    this.setData({
      loading: true,
      error: false
    });

    try {
      // 娴ｈ法鏁ommentService閼惧嘲褰囬悽銊﹀煕鐠囧嫯顔?      const result = await app.services.comment.getUserComments({
        page: this.data.page,
        per_page: this.data.pageSize
      });
      
      const newData = result.comments || [];
      const updatedList = refresh ? newData : [...this.data.commentsList, ...newData];
      
      this.setData({
        commentsList: updatedList,
        hasMore: newData.length === this.data.pageSize,
        page: this.data.page + 1,
        loading: false,
        error: false,
        refreshing: false
      });
    } catch (error) {
      console.error('閼惧嘲褰囬悽銊﹀煕鐠囧嫯顔戞径杈Е:', error);
      this.setData({
        loading: false,
        error: true,
        refreshing: false
      });
      showToast(error.message || '閼惧嘲褰囩拠鍕啈婢惰精瑙?, 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 婢跺嫮鎮婄拠閿嬬湴闁挎瑨顕?   * @param {Object} error 闁挎瑨顕ょ€电钖?   */
  handleRequestError: function(error) {
    const errorMsg = error.message || '閼惧嘲褰囩拠鍕啈閺佺増宓佹径杈Е';
    
    showToast(errorMsg, 'none');
    
    this.setData({
      loading: false,
      error: true,
      refreshing: false
    });
  },

  /**
   * 鐠哄疇娴嗛崚鐗堟瀮缁旂姾顕涢幆鍛淬€?   * @param {Object} e 娴滃娆㈢€电钖?   */
  navigateToArticleDetail: function(e) {
    const { articleId } = e.currentTarget.dataset;
    const app = getApp();
    
    // 鐠佹澘缍嶇捄瀹犳祮娴滃娆?    app.services.analytics.trackEvent('user_comment_article_click', {
      article_id: articleId
    });
    
    wx.navigateTo({
      url: `/pages/article/detail/detail?id=${articleId}`
    });
  },

  /**
   * 閸掔娀娅庣拠鍕啈
   * @param {Object} e 娴滃娆㈢€电钖?   */
  deleteComment: async function(e) {
    const { commentId, index } = e.currentTarget.dataset;
    const app = getApp();
    
    wx.showModal({
      title: '绾喛顓婚崚鐘绘珟',
      content: '绾喖鐣剧憰浣稿灩闂勩倛绻栭弶陇鐦庣拋鍝勬偋閿?,
      success: async (res) => {
        if (res.confirm) {
          try {
            // 娴ｈ法鏁ommentService閸掔娀娅庣拠鍕啈
            await app.services.comment.deleteComment(commentId);
            
            // 娴犲骸鍨悰銊よ厬缁夊娅庣拠鍕啈
            const updatedList = this.data.commentsList.filter((item, i) => i !== index);
            this.setData({
              commentsList: updatedList
            });
            
            showToast('閸掔娀娅庨幋鎰', 'success');
            
            // 鐠佹澘缍嶉崚鐘绘珟鐠囧嫯顔戞禍瀣╂
            app.services.analytics.trackEvent('user_comment_delete', {
              comment_id: commentId
            });
          } catch (error) {
            console.error('閸掔娀娅庣拠鍕啈婢惰精瑙?', error);
            showToast(error.message || '閸掔娀娅庢径杈Е', 'none');
          }
        }
      }
    });
  }

  /**
   * 閸旂姾娴囬弴鏉戭樋閺佺増宓?   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore && !this.data.error) {
      this.loadCommentsData(false);
    }
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true
    });
    this.loadCommentsData(true);
  },

  /**
   * 娑撳﹥濯虹憴锕€绨?   */
  onReachBottom: function() {
    this.loadMore();
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  retryLoad: function() {
    this.loadCommentsData(true);
  }
});\n