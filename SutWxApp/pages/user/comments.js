// 鐢ㄦ埛璇勮椤甸潰閫昏緫
import { showToast } from '../../utils/global';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    commentsList: [], // 璇勮鍒楄〃
    loading: true, // 鏄惁姝ｅ湪鍔犺浇
    error: false, // 鏄惁鍔犺浇澶辫触
    hasMore: true, // 鏄惁鏈夋洿澶氭暟鎹?    page: 1, // 褰撳墠椤电爜
    pageSize: 10, // 姣忛〉鏁版嵁閲?    refreshing: false // 鏄惁姝ｅ湪鍒锋柊
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    const app = getApp();
    
    // 妫€鏌ョ櫥褰曠姸鎬?    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 鍔犺浇璇勮鏁版嵁
    this.loadCommentsData();
    
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.services.analytics.trackPageView('user_comments');
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 姣忔鏄剧ず椤甸潰鏃跺彲浠ュ埛鏂版暟鎹紝鐗瑰埆鏄粠鍏朵粬椤甸潰杩斿洖鏃?    if (!this.data.loading && !this.data.refreshing) {
      this.loadCommentsData(true);
    }
  },

  /**
   * 鍔犺浇璇勮鏁版嵁
   * @param {boolean} refresh 鏄惁鍒锋柊鏁版嵁锛堥噸缃〉鐮侊級
   */
  loadCommentsData: async function(refresh = false) {
    const app = getApp();
    
    if (refresh) {
      // 閲嶇疆鐘舵€?      this.setData({
        page: 1,
        commentsList: [],
        hasMore: true
      });
    }

    if (!this.data.hasMore && !refresh) {
      return;
    }

    // 鏄剧ず鍔犺浇鐘舵€?    this.setData({
      loading: true,
      error: false
    });

    try {
      // 浣跨敤commentService鑾峰彇鐢ㄦ埛璇勮
      const result = await app.services.comment.getUserComments({
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
      console.error('鑾峰彇鐢ㄦ埛璇勮澶辫触:', error);
      this.setData({
        loading: false,
        error: true,
        refreshing: false
      });
      showToast(error.message || '鑾峰彇璇勮澶辫触', 'none');
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 澶勭悊璇锋眰閿欒
   * @param {Object} error 閿欒瀵硅薄
   */
  handleRequestError: function(error) {
    const errorMsg = error.message || '鑾峰彇璇勮鏁版嵁澶辫触';
    
    showToast(errorMsg, 'none');
    
    this.setData({
      loading: false,
      error: true,
      refreshing: false
    });
  },

  /**
   * 璺宠浆鍒版枃绔犺鎯呴〉
   * @param {Object} e 浜嬩欢瀵硅薄
   */
  navigateToArticleDetail: function(e) {
    const { articleId } = e.currentTarget.dataset;
    const app = getApp();
    
    // 璁板綍璺宠浆浜嬩欢
    app.services.analytics.trackEvent('user_comment_article_click', {
      article_id: articleId
    });
    
    wx.navigateTo({
      url: `/pages/article/detail/detail?id=${articleId}`
    });
  },

  /**
   * 鍒犻櫎璇勮
   * @param {Object} e 浜嬩欢瀵硅薄
   */
  deleteComment: async function(e) {
    const { commentId, index } = e.currentTarget.dataset;
    const app = getApp();
    
    wx.showModal({
      title: '纭鍒犻櫎',
      content: '纭畾瑕佸垹闄よ繖鏉¤瘎璁哄悧锛?,
      success: async (res) => {
        if (res.confirm) {
          try {
            // 浣跨敤commentService鍒犻櫎璇勮
            await app.services.comment.deleteComment(commentId);
            
            // 浠庡垪琛ㄤ腑绉婚櫎璇勮
            const updatedList = this.data.commentsList.filter((item, i) => i !== index);
            this.setData({
              commentsList: updatedList
            });
            
            showToast('鍒犻櫎鎴愬姛', 'success');
            
            // 璁板綍鍒犻櫎璇勮浜嬩欢
            app.services.analytics.trackEvent('user_comment_delete', {
              comment_id: commentId
            });
          } catch (error) {
            console.error('鍒犻櫎璇勮澶辫触:', error);
            showToast(error.message || '鍒犻櫎澶辫触', 'none');
          }
        }
      }
    });
  }

  /**
   * 鍔犺浇鏇村鏁版嵁
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore && !this.data.error) {
      this.loadCommentsData(false);
    }
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true
    });
    this.loadCommentsData(true);
  },

  /**
   * 涓婃媺瑙﹀簳
   */
  onReachBottom: function() {
    this.loadMore();
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  retryLoad: function() {
    this.loadCommentsData(true);
  }
});