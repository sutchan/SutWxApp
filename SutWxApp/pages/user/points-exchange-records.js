锘?/ 缁夘垰鍨庨崗鎴炲床鐠佹澘缍嶆い鐢告桨闁槒绶?const app = getApp();
const { showToast, showLoading, hideLoading } = app.global;

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
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
      { key: 'all', name: '閸忋劑鍎? },
      { key: 'processing', name: '婢跺嫮鎮婃稉? },
      { key: 'completed', name: '瀹告彃鐣幋? },
      { key: 'cancelled', name: '瀹告彃褰囧☉? }
    ]
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'points_exchange_records'
    });
    
    // 閸旂姾娴囬崗鎴炲床鐠佹澘缍?    this.loadExchangeRecords();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 婵″倹鐏夐棁鈧憰浣稿煕閺傚府绱濋崚娆撳櫢閺傛澘濮炴潪鑺ユ殶閹?    if (this.data.needRefresh) {
      this.setData({ needRefresh: false, page: 1, hasMore: true });
      this.loadExchangeRecords(true);
    }
  },

  /**
   * 閸旂姾娴囩粔顖氬瀻閸忔垶宕茬拋鏉跨秿
   */
  async loadExchangeRecords(refresh = false) {
    try {
      if (refresh) {
        this.setData({ records: [], page: 1, hasMore: true, refreshing: true });
      } else if (!this.data.refreshing) {
        this.setData({ loading: true, error: null });
      }

      // 鐠嬪啰鏁PI閼惧嘲褰囬崗鎴炲床鐠佹澘缍?      const queryParams = {
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
      console.error('閸旂姾娴囬崗鎴炲床鐠佹澘缍嶆径杈Е:', err);
      let errorMsg = '閼惧嘲褰囬崗鎴炲床鐠佹澘缍嶆径杈Е';
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
   * 閸掑洦宕查弽鍥╊劮妞?   */
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.tab) {
      this.setData({ tab, page: 1, hasMore: true });
      this.loadExchangeRecords(true);
    }
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋鐠佹澘缍?   */
  onLoadMore: function() {
    if (this.data.hasMore && !this.data.loading && !this.data.refreshing) {
      this.setData({ page: this.data.page + 1 });
      this.loadExchangeRecords();
    }
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    this.setData({ refreshing: true, page: 1, hasMore: true });
    this.loadExchangeRecords(true);
    wx.stopPullDownRefresh();
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    this.loadExchangeRecords(true);
  },

  /**
   * 閼惧嘲褰囩拋銏犲礋閻樿埖鈧焦鏋冮張?   */
  getStatusText: function(status) {
    const statusMap = {
      'processing': '婢跺嫮鎮婃稉?,
      'completed': '瀹告彃鐣幋?,
      'cancelled': '瀹告彃褰囧☉?
    };
    return statusMap[status] || '閺堫亞鐓￠悩鑸碘偓?;
  },

  /**
   * 閼惧嘲褰囩拋銏犲礋閻樿埖鈧焦鐗卞蹇曡
   */
  getStatusClass: function(status) {
    return `status-${status}`;
  },

  /**
   * 閸撳秴绶氱粔顖氬瀻閸熷棗鐓?   */
  navigateToMall: function() {
    wx.navigateTo({
      url: '/pages/user/points-mall'
    });
  }
});
\n