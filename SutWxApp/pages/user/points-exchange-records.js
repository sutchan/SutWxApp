// 绉垎鍏戞崲璁板綍椤甸潰閫昏緫
const app = getApp();
const { showToast, showLoading, hideLoading } = app.global;

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    records: [],
    loading: true,
    error: null,
    page: 1,
    pageSize: 20,
    hasMore: true,
    refreshing: false,
    tab: 'all', // all, processing, completed, cancelled
    tabs: [
      { key: 'all', name: '鍏ㄩ儴' },
      { key: 'processing', name: '澶勭悊涓? },
      { key: 'completed', name: '宸插畬鎴? },
      { key: 'cancelled', name: '宸插彇娑? }
    ]
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'points_exchange_records'
    });
    
    // 鍔犺浇鍏戞崲璁板綍
    this.loadExchangeRecords();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 濡傛灉闇€瑕佸埛鏂帮紝鍒欓噸鏂板姞杞芥暟鎹?    if (this.data.needRefresh) {
      this.setData({ needRefresh: false, page: 1, hasMore: true });
      this.loadExchangeRecords(true);
    }
  },

  /**
   * 鍔犺浇绉垎鍏戞崲璁板綍
   */
  async loadExchangeRecords(refresh = false) {
    try {
      if (refresh) {
        this.setData({ records: [], page: 1, hasMore: true, refreshing: true });
      } else if (!this.data.refreshing) {
        this.setData({ loading: true, error: null });
      }

      // 璋冪敤API鑾峰彇鍏戞崲璁板綍
      const queryParams = {
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: this.data.tab !== 'all' ? this.data.tab : ''
      };
      const result = await app.services.points.getPointsExchangeRecords(queryParams);
      
      const newRecords = result.list || [];
      const updatedRecords = refresh ? newRecords : [...this.data.records, ...newRecords];
      
      this.setData({
        records: updatedRecords,
        hasMore: newRecords.length >= this.data.pageSize,
        error: null
      });
    } catch (err) {
      console.error('鍔犺浇鍏戞崲璁板綍澶辫触:', err);
      let errorMsg = '鑾峰彇鍏戞崲璁板綍澶辫触';
      if (err.message) {
        errorMsg = err.message;
      }
      
      this.setData({ error: errorMsg });
      showToast({ title: errorMsg, icon: 'none' });
    } finally {
      this.setData({ loading: false, refreshing: false });
    }
  },

  /**
   * 鍒囨崲鏍囩椤?   */
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.tab) {
      this.setData({ tab, page: 1, hasMore: true });
      this.loadExchangeRecords(true);
    }
  },

  /**
   * 鍔犺浇鏇村璁板綍
   */
  onLoadMore: function() {
    if (this.data.hasMore && !this.data.loading && !this.data.refreshing) {
      this.setData({ page: this.data.page + 1 });
      this.loadExchangeRecords();
    }
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    this.setData({ refreshing: true, page: 1, hasMore: true });
    this.loadExchangeRecords(true);
    wx.stopPullDownRefresh();
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    this.loadExchangeRecords(true);
  },

  /**
   * 鑾峰彇璁㈠崟鐘舵€佹枃鏈?   */
  getStatusText: function(status) {
    const statusMap = {
      'processing': '澶勭悊涓?,
      'completed': '宸插畬鎴?,
      'cancelled': '宸插彇娑?
    };
    return statusMap[status] || '鏈煡鐘舵€?;
  },

  /**
   * 鑾峰彇璁㈠崟鐘舵€佹牱寮忕被
   */
  getStatusClass: function(status) {
    return `status-${status}`;
  },

  /**
   * 鍓嶅線绉垎鍟嗗煄
   */
  navigateToMall: function() {
    wx.navigateTo({
      url: '/pages/user/points-mall'
    });
  }
});
\n