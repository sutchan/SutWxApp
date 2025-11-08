// 鐢ㄦ埛璇︽儏椤甸潰 - 鐢ㄤ簬鏌ョ湅鍏朵粬鐢ㄦ埛鐨勪俊鎭?import { showToast } from '../../utils/global';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    userId: '', // 鐢ㄦ埛ID
    userInfo: null, // 鐢ㄦ埛淇℃伅
    loading: true, // 鍔犺浇鐘舵€?    error: '', // 閿欒淇℃伅
    isFollowing: false, // 鏄惁宸插叧娉?    followingCount: 0, // 鍏虫敞鏁?    followersCount: 0, // 绮変笣鏁?    articlesCount: 0, // 鏂囩珷鏁?    isCurrentUser: false // 鏄惁涓哄綋鍓嶇敤鎴?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    const app = getApp();
    
    // 鑾峰彇浼犲叆鐨勭敤鎴稩D
    const userId = options.id || '';
    
    if (!userId) {
      this.setData({
        error: '鐢ㄦ埛ID涓嶅瓨鍦?,
        loading: false
      });
      return;
    }
    
    this.setData({
      userId: userId,
      // 妫€鏌ユ槸鍚︿负褰撳墠鐧诲綍鐢ㄦ埛
      isCurrentUser: app.globalData.userInfo && app.globalData.userInfo.id === userId
    });
    
    // 鍔犺浇鐢ㄦ埛淇℃伅
    this.loadUserInfo();
    
    // 璁板綍椤甸潰璁块棶浜嬩欢
    if (app.services && app.services.analytics) {
      app.services.analytics.trackPageView('user_profile_detail', { userId: userId });
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 椤甸潰鏄剧ず鏃跺埛鏂版暟鎹?    this.loadUserInfo();
  },

  /**
   * 鍔犺浇鐢ㄦ埛淇℃伅
   */
  loadUserInfo: async function() {
    const app = getApp();
    
    // 鏄剧ず鍔犺浇鐘舵€?    this.setData({
      loading: true,
      error: ''
    });

    try {
      // 浣跨敤鐢ㄦ埛鏈嶅姟鑾峰彇鐢ㄦ埛淇℃伅
      const result = await app.services.api.request({
        url: `/users/${this.data.userId}`,
        method: 'GET'
      });
      
      const userInfo = result.data || {};
      
      this.setData({
        userInfo: userInfo,
        followingCount: userInfo.following_count || 0,
        followersCount: userInfo.followers_count || 0,
        articlesCount: userInfo.articles_count || 0
      });
      
      // 濡傛灉涓嶆槸褰撳墠鐢ㄦ埛锛屾鏌ュ叧娉ㄧ姸鎬?      if (!this.data.isCurrentUser) {
        await this.checkFollowingStatus();
      }
    } catch (error) {
      console.error('鑾峰彇鐢ㄦ埛淇℃伅澶辫触:', error);
      this.setData({
        error: error.message || '鍔犺浇鐢ㄦ埛淇℃伅澶辫触',
        loading: false
      });
      showToast('鑾峰彇鐢ㄦ埛淇℃伅澶辫触', 'none');
    } finally {
      this.setData({
        loading: false
      });
    }
  },

  /**
   * 妫€鏌ュ叧娉ㄧ姸鎬?   */
  checkFollowingStatus: async function() {
    const app = getApp();
    
    try {
      // 妫€鏌ョ櫥褰曠姸鎬?      if (!app.isLoggedIn()) {
        this.setData({ isFollowing: false });
        return;
      }
      
      // 浣跨敤鍏虫敞鏈嶅姟妫€鏌ュ叧娉ㄧ姸鎬?      if (app.services && app.services.following) {
        const result = await app.services.following.checkFollowingStatus({
          user_id: this.data.userId
        });
        
        this.setData({
          isFollowing: result.data?.is_following || false
        });
      }
    } catch (error) {
      console.error('妫€鏌ュ叧娉ㄧ姸鎬佸け璐?', error);
      this.setData({ isFollowing: false });
    }
  },

  /**
   * 鍏虫敞/鍙栨秷鍏虫敞鐢ㄦ埛
   */
  toggleFollow: async function() {
    const app = getApp();
    
    // 妫€鏌ョ櫥褰曠姸鎬?    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    try {
      if (this.data.isFollowing) {
        // 鍙栨秷鍏虫敞
        await app.services.following.unfollowUser({
          id: this.data.userId
        });
        
        showToast('鍙栨秷鍏虫敞鎴愬姛', 'success');
        this.setData({
          isFollowing: false,
          followersCount: Math.max(0, this.data.followersCount - 1)
        });
      } else {
        // 鍏虫敞鐢ㄦ埛
        await app.services.following.followUser({
          user_id: this.data.userId
        });
        
        showToast('鍏虫敞鎴愬姛', 'success');
        this.setData({
          isFollowing: true,
          followersCount: this.data.followersCount + 1
        });
      }
      
      // 璁板綍浜嬩欢
      if (app.services && app.services.analytics) {
        app.services.analytics.trackEvent(
          this.data.isFollowing ? 'user_follow' : 'user_unfollow',
          { target_user_id: this.data.userId }
        );
      }
    } catch (error) {
      console.error('鎿嶄綔澶辫触:', error);
      showToast(error.message || '鎿嶄綔澶辫触', 'none');
    }
  },

  /**
   * 璺宠浆鍒扮敤鎴锋枃绔犲垪琛?   */
  navigateToUserArticles: function() {
    wx.navigateTo({
      url: `/pages/user/profile/articles?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 璺宠浆鍒扮敤鎴峰叧娉ㄥ垪琛?   */
  navigateToUserFollowing: function() {
    wx.navigateTo({
      url: `/pages/user/profile/following?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 璺宠浆鍒扮敤鎴风矇涓濆垪琛?   */
  navigateToUserFollowers: function() {
    wx.navigateTo({
      url: `/pages/user/profile/followers?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  retryLoad: function() {
    this.loadUserInfo();
  },

  /**
   * 璺宠浆鍒版垜鐨勪釜浜轰腑蹇?   */
  navigateToMyProfile: function() {
    wx.navigateTo({
      url: '/pages/user/profile/profile'
    });
  }
});
\n