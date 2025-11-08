// pages/user/followers.js
// 绮変笣鍒楄〃椤甸潰
import { showToast } from '../../utils/global';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    followersList: [], // 绮変笣鍒楄〃
    loading: false, // 鍔犺浇鐘舵€?    error: null, // 閿欒淇℃伅
    currentPage: 1, // 褰撳墠椤电爜
    pageSize: 10, // 姣忛〉鏁伴噺
    hasMore: true // 鏄惁鏈夋洿澶氭暟鎹?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    this.loadFollowersList();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 椤甸潰鏄剧ず鏃跺埛鏂版暟鎹?    if (this.data.followersList.length > 0) {
      this.refreshList();
    }
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh: function() {
    this.refreshList();
  },

  /**
   * 鍔犺浇绮変笣鍒楄〃
   */
  loadFollowersList: function(refresh = false) {
    const app = getApp();
    
    // 妫€鏌ユ槸鍚﹀凡鐧诲綍
    if (!app.isLoggedIn()) {
      wx.stopPullDownRefresh();
      this.setData({
        loading: false,
        error: '璇峰厛鐧诲綍',
        hasMore: false
      });
      showToast('璇峰厛鐧诲綍', 'none');
      return;
    }

    // 璁剧疆椤电爜
    if (refresh) {
      this.setData({ currentPage: 1, hasMore: true, error: null });
    } else if (!this.data.hasMore) {
      wx.stopPullDownRefresh();
      return;
    }

    // 鏄剧ず鍔犺浇鐘舵€?    this.setData({ loading: true });

    // 璋冪敤鍏虫敞鏈嶅姟鑾峰彇绮変笣鍒楄〃
    app.services.following.getMyFollowers({
      page: this.data.currentPage,
      per_page: this.data.pageSize
    })
    .then(res => {
      wx.stopPullDownRefresh();
      
      if (res.code === 200) {
        const newFollowers = res.data.list || [];
        const followersList = refresh ? newFollowers : [...this.data.followersList, ...newFollowers];
        
        this.setData({
          followersList: followersList,
          hasMore: newFollowers.length === this.data.pageSize,
          loading: false,
          error: null
        });
        
        // 澧炲姞椤电爜
        if (!refresh && newFollowers.length > 0) {
          this.setData({ currentPage: this.data.currentPage + 1 });
        }
      } else {
        this.setData({
          loading: false,
          error: res.message || '鑾峰彇绮変笣鍒楄〃澶辫触'
        });
      }
    })
    .catch(error => {
      wx.stopPullDownRefresh();
      console.error('鑾峰彇绮変笣鍒楄〃澶辫触:', error);
      this.setData({
        loading: false,
        error: '缃戠粶閿欒锛岃閲嶈瘯'
      });
    });
  },

  /**
   * 鍒锋柊鍒楄〃
   */
  refreshList: function() {
    this.loadFollowersList(true);
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  retryLoad: function() {
    this.refreshList();
  },

  /**
   * 鍔犺浇鏇村
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadFollowersList(false);
    }
  },

  /**
   * 璺宠浆鍒扮敤鎴疯鎯呴〉
   */
  navigateToUserProfile: function(e) {
    const userId = e.currentTarget.dataset.user_id;
    if (userId) {
      wx.navigateTo({
        url: `/pages/user/user-detail?id=${userId}`
      });
    }
  },

  /**
   * 鍏虫敞鐢ㄦ埛
   */
  followUser: function(e) {
    const { id, index } = e.currentTarget.dataset;
    const app = getApp();
    
    // 鏄剧ず鍔犺浇鐘舵€?    wx.showLoading({ title: '鎿嶄綔涓? });
    
    // 璋冪敤鍏虫敞鏈嶅姟杩涜鍏虫敞鎿嶄綔
    app.services.following.followUser(id)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 200) {
          // 鏇存柊绮変笣鍒楄〃涓殑鍏虫敞鐘舵€?          const followersList = [...this.data.followersList];
          if (followersList[index]) {
            followersList[index].is_following = true;
          }
          this.setData({ followersList });
          
          showToast('鍏虫敞鎴愬姛');
        } else {
          showToast(res.message || '鍏虫敞澶辫触', 'none');
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.error('鍏虫敞鐢ㄦ埛澶辫触:', error);
        showToast('缃戠粶閿欒锛岃閲嶈瘯', 'none');
      });
  }
});\n