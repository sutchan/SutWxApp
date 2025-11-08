// 鐢ㄦ埛绉垎椤甸潰閫昏緫
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    totalPoints: 0, // 鎬荤Н鍒?    availablePoints: 0, // 鍙敤绉垎
    pendingPoints: 0, // 寰呯敓鏁堢Н鍒?    expiringPoints: 0, // 鍗冲皢杩囨湡绉垎
    expiringDate: '', // 杩囨湡鏃ユ湡
    level: '', // 鐢ㄦ埛绛夌骇
    pointsHistory: [], // 绉垎鍘嗗彶璁板綍
    loading: true, // 鏄惁姝ｅ湪鍔犺浇
    error: false, // 鏄惁鍔犺浇澶辫触
    hasMore: true, // 鏄惁鏈夋洿澶氭暟鎹?    page: 1, // 褰撳墠椤电爜
    pageSize: 20, // 姣忛〉鏁版嵁閲?    refreshing: false, // 鏄惁姝ｅ湪鍒锋柊
    showFilterModal: false, // 鏄惁鏄剧ず绛涢€夊脊绐?    filterType: 'all' // 绛涢€夌被鍨? all/gain/use
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'points'
    });
    
    // 鍔犺浇绉垎鏁版嵁
    this.loadPointsData();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 姣忔鏄剧ず椤甸潰鏃跺彲浠ュ埛鏂版暟鎹紝鐗瑰埆鏄粠鍏朵粬椤甸潰杩斿洖鏃?    if (!this.data.loading && !this.data.refreshing) {
      this.loadPointsData(true);
    }
  },

  /**
   * 鍔犺浇绉垎鏁版嵁
   * @param {boolean} refresh 鏄惁鍒锋柊鏁版嵁锛堥噸缃〉鐮侊級
   */
  async loadPointsData(refresh = false) {
    try {
      if (refresh) {
        // 閲嶇疆鐘舵€?        this.setData({
          page: 1,
          pointsHistory: [],
          hasMore: true
        });
      }

      if (!this.data.hasMore && !refresh) {
        return;
      }

      // 鏄剧ず鍔犺浇鐘舵€?      this.setData({
        loading: true,
        error: false
      });

      // 妫€鏌ョ櫥褰曠姸鎬?      if (!app.isLoggedIn()) {
        this.setData({
          loading: false,
          error: true
        });
        showToast('璇峰厛鐧诲綍', 'none');
        return;
      }

      // 鑾峰彇鐢ㄦ埛绉垎璇︾粏淇℃伅
      const pointsInfoPromise = app.services.points.getUserPointsInfo();
      
      // 浣跨敤pointsService鑾峰彇绉垎鏁版嵁
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize,
        type: this.data.filterType
      };
      const historyPromise = app.services.points.getUserPointsHistory(params);
      
      // 骞惰璇锋眰鏁版嵁
      const [pointsInfo, result] = await Promise.all([pointsInfoPromise, historyPromise]);
      
      const newData = result.list || [];
      const updatedHistory = refresh ? newData : [...this.data.pointsHistory, ...newData];
      
      this.setData({
        totalPoints: pointsInfo.totalPoints || 0,
        availablePoints: pointsInfo.availablePoints || 0,
        pendingPoints: pointsInfo.pendingPoints || 0,
        expiringPoints: pointsInfo.expiringPoints || 0,
        expiringDate: pointsInfo.expiringDate || '',
        level: pointsInfo.level || '',
        pointsHistory: updatedHistory,
        hasMore: newData.length === this.data.pageSize,
        page: this.data.page + 1,
        loading: false,
        error: false,
        refreshing: false
      });","},{"old_str":
      

    } catch (err) {
      this.setData({
        loading: false,
        error: true,
        refreshing: false
      });
      this.handleRequestError(err);
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 澶勭悊璇锋眰閿欒
   * @param {Object} err 閿欒瀵硅薄
   */
  handleRequestError(err) {
    let errorMsg = '鑾峰彇绉垎鏁版嵁澶辫触';
    
    if (err.message) {
      errorMsg = err.message;
    } else if (err.data && err.data.message) {
      errorMsg = err.data.message;
    }
    
    showToast(errorMsg, 'none');
    
    this.setData({
      loading: false,
      error: true,
      refreshing: false
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗚鍒欓〉闈?   */
  navigateToPointsRules: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_points_rules');
    
    wx.navigateTo({
      url: '/pages/user/points-rules'
    });
  },
  
  /**
   * 璺宠浆鍒扮鍒伴〉闈?   */
  navigateToSignIn: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_sign_in');
    
    wx.navigateTo({
      url: '/pages/user/points-signin'
    });
  },
  
  /**
   * 璺宠浆鍒扮Н鍒嗗晢鍩?   */
  navigateToPointsMall: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_points_mall');
    
    wx.navigateTo({
      url: '/pages/user/points-mall'
    });
  },
  
  /**
   * 璺宠浆鍒板厬鎹㈣褰?   */
  navigateToExchangeRecords: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_exchange_records');
    
    wx.navigateTo({
      url: '/pages/user/points-exchange-records'
    });
  },
  
  /**
   * 璺宠浆鍒扮Н鍒嗕换鍔?   */
  navigateToPointsTasks: function() {
    // 璁板綍瀵艰埅浜嬩欢
    app.analyticsService.track('navigate_to_points_tasks');
    
    wx.navigateTo({
      url: '/pages/user/points-tasks'
    });
  },
  
  /**
   * 鏄剧ず绛涢€夐€夐」
   */
  showFilterOptions: function() {
    this.setData({
      showFilterModal: true
    });
  },
  
  /**
   * 闅愯棌绛涢€夐€夐」
   */
  hideFilterOptions: function() {
    this.setData({
      showFilterModal: false
    });
  },
  
  /**
   * 绛涢€夌被鍨嬫敼鍙?   */
  onFilterTypeChange: function(e) {
    this.setData({
      filterType: e.detail.value
    });
  },
  
  /**
   * 搴旂敤绛涢€?   */
  applyFilter: function() {
    // 闅愯棌绛涢€夊脊绐?    this.hideFilterOptions();
    
    // 閲嶆柊鍔犺浇鏁版嵁
    this.loadPointsData(true);
    
    // 璁板綍绛涢€変簨浠?    app.analyticsService.track('points_filter_applied', {
      filterType: this.data.filterType
    });
  },

  /**
   * 鍔犺浇鏇村鏁版嵁
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore && !this.data.error) {
      this.loadPointsData(false);
    }
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh: function() {
    // 璁板綍涓嬫媺鍒锋柊浜嬩欢
    app.analyticsService.track('pull_down_refresh', {
      page: 'points'
    });
    
    this.setData({
      refreshing: true
    });
    this.loadPointsData(true);
  },

  /**
   * 涓婃媺瑙﹀簳
   */
  onReachBottom: function() {
    // 璁板綍涓婃媺鍔犺浇浜嬩欢
    app.analyticsService.track('pull_up_load', {
      page: 'points'
    });
    
    this.loadMore();
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  retryLoad: function() {
    // 璁板綍閲嶈瘯鍔犺浇浜嬩欢
    app.analyticsService.track('retry_loading', {
      page: 'points'
    });
    
    this.loadPointsData(true);
  },
  
  /**
   * 鏍煎紡鍖栨椂闂?   * @param {string} timeStr ISO鏍煎紡鐨勬椂闂村瓧绗︿覆
   * @returns {string} 鏍煎紡鍖栧悗鐨勬椂闂?   */
  formatTime: function(timeStr) {
    if (!timeStr) return '';
    
    try {
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (err) {
      return '';
    }
  }
});