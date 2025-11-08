// 鐢ㄦ埛鍏虫敞椤甸潰
import { showToast } from '../../utils/global';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    followingList: [], // 鍏虫敞鍒楄〃
    loading: false, // 鍔犺浇鐘舵€?    refreshing: false, // 涓嬫媺鍒锋柊鐘舵€?    error: '', // 閿欒淇℃伅
    hasMore: true, // 鏄惁鏈夋洿澶氭暟鎹?    page: 1, // 褰撳墠椤电爜
    pageSize: 10 // 姣忛〉鏁版嵁閲?  },

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
    
    // 鍔犺浇鍏虫敞鏁版嵁
    this.loadFollowingData();
    
    // 璁板綍椤甸潰璁块棶浜嬩欢
    if (app.services && app.services.analytics) {
      app.services.analytics.trackPageView('user_following');
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    const app = getApp();
    
    // 妫€鏌ョ櫥褰曠姸鎬?    if (!app.isLoggedIn()) {
      return;
    }
    
    // 椤甸潰鏄剧ず鏃跺埛鏂版暟鎹?    this.setData({
      page: 1,
      followingList: [],
      hasMore: true
    });
    this.loadFollowingData();
  },

  /**
   * 鍔犺浇鍏虫敞鏁版嵁
   * @param {boolean} refresh - 鏄惁涓哄埛鏂版搷浣?   */
  loadFollowingData: async function(refresh = false) {
    const app = getApp();
    
    // 濡傛灉姝ｅ湪鍔犺浇锛岀洿鎺ヨ繑鍥?    if (this.data.loading) return;

    // 鏄剧ず鍔犺浇鐘舵€?    this.setData({
      loading: true,
      error: ''
    });

    try {
      // 妫€鏌ュ叧娉ㄦ湇鍔℃槸鍚﹀瓨鍦?      if (!app.services || !app.services.following) {
        throw new Error('鍏虫敞鏈嶅姟鏆備笉鍙敤');
      }
      
      // 鏋勫缓璇锋眰鍙傛暟
      const page = refresh ? 1 : this.data.page;
      
      // 浣跨敤鍏虫敞鏈嶅姟鑾峰彇鍏虫敞鍒楄〃
      const result = await app.services.following.getUserFollowing({
        page: page,
        per_page: this.data.pageSize
      });
      
      const newList = result.list || [];
      const newFollowingList = refresh ? newList : [...this.data.followingList, ...newList];
      
      // 鍒ゆ柇鏄惁杩樻湁鏇村鏁版嵁
      const hasMore = newList.length === this.data.pageSize;
      const nextPage = refresh ? 2 : this.data.page + 1;

      this.setData({
        followingList: newFollowingList,
        hasMore: hasMore,
        page: nextPage,
        error: ''
      });
    } catch (error) {
      console.error('鑾峰彇鍏虫敞鍒楄〃澶辫触:', error);
      this.setData({
        error: error.message || '鍔犺浇澶辫触锛岃閲嶈瘯'
      });
      showToast('鑾峰彇鍏虫敞澶辫触', 'none');
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 澶勭悊璇锋眰鎴愬姛
   * @param {Object} result - 鍝嶅簲鏁版嵁
   * @param {boolean} refresh - 鏄惁涓哄埛鏂版搷浣?   */
  handleRequestSuccess: function(result, refresh) {
    const newList = result.list || [];
    const newFollowingList = refresh ? newList : [...this.data.followingList, ...newList];
    
    // 鍒ゆ柇鏄惁杩樻湁鏇村鏁版嵁
    const hasMore = newList.length === this.data.pageSize;
    const nextPage = refresh ? 2 : this.data.page + 1;

    this.setData({
      followingList: newFollowingList,
      hasMore: hasMore,
      page: nextPage,
      error: ''
    });
  },

  /**
   * 澶勭悊璇锋眰閿欒
   * @param {Object} error - 閿欒淇℃伅
   */
  handleRequestError: function(error) {
    console.error('鑾峰彇鍏虫敞鍒楄〃澶辫触:', error);
    this.setData({
      error: error.message || '缃戠粶寮傚父锛岃妫€鏌ョ綉缁滆繛鎺ュ悗閲嶈瘯'
    });
    showToast('鑾峰彇鍏虫敞澶辫触', 'none');
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  retryLoad: function() {
    this.setData({
      page: 1,
      followingList: [],
      hasMore: true
    });
    this.loadFollowingData();
  },

  /**
   * 鍔犺浇鏇村
   */
  loadMore: function() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadFollowingData(false);
  },

  /**
   * 鍙栨秷鍏虫敞
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  unfollow: function(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const userId = e.currentTarget.dataset.userId;

    wx.showModal({
      title: '纭鎿嶄綔',
      content: '纭畾瑕佸彇娑堝叧娉ㄥ悧锛?,
      success: (res) => {
        if (res.confirm) {
          this.executeUnfollow(id, index, userId);
        }
      }
    });
  },

  /**
   * 鎵ц鍙栨秷鍏虫敞鎿嶄綔
   * @param {number} id - 鍏虫敞ID
   * @param {number} index - 鍒楄〃绱㈠紩
   * @param {number} userId - 鐢ㄦ埛ID
   */
  executeUnfollow: async function(id, index, userId) {
    const app = getApp();
    
    try {
      // 妫€鏌ュ叧娉ㄦ湇鍔℃槸鍚﹀瓨鍦?      if (!app.services || !app.services.following) {
        throw new Error('鍏虫敞鏈嶅姟鏆備笉鍙敤');
      }
      
      // 浣跨敤鍏虫敞鏈嶅姟鍙栨秷鍏虫敞
      await app.services.following.unfollowUser({
        id: id
      });
      
      // 浠庡垪琛ㄤ腑绉婚櫎璇ュ叧娉ㄩ」
      const newFollowingList = [...this.data.followingList];
      newFollowingList.splice(index, 1);
      
      this.setData({
        followingList: newFollowingList
      });
      
      showToast('鍙栨秷鍏虫敞鎴愬姛', 'success');
      
      // 璁板綍鍙栨秷鍏虫敞浜嬩欢
      if (app.services && app.services.analytics) {
        app.services.analytics.trackEvent('user_unfollow', {
          following_id: id,
          user_id: userId
        });
      }
    } catch (error) {
      console.error('鍙栨秷鍏虫敞澶辫触:', error);
      showToast(error.message || '鍙栨秷鍏虫敞澶辫触', 'none');
    }
  },

  /**
   * 璺宠浆鍒扮敤鎴疯鎯呴〉
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  navigateToUserProfile: function(e) {
    const userId = e.currentTarget.dataset.userId;
    const app = getApp();
    
    // 璁板綍璺宠浆浜嬩欢
    if (app.services && app.services.analytics) {
      app.services.analytics.trackEvent('user_following_profile_click', {
        user_id: userId
      });
    }
    
    wx.navigateTo({
      url: `/pages/user/user-detail?id=${userId}`
    });
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    this.loadFollowingData(true);
  },

  /**
   * 涓婃媺瑙﹀簳鍔犺浇鏇村
   */
  onReachBottom: function() {
    this.loadMore();
  }
});