锘?/ 閻劍鍩涚粔顖氬瀻妞ょ敻娼伴柅鏄忕帆
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    totalPoints: 0, // 閹崵袧閸?    availablePoints: 0, // 閸欘垳鏁ょ粔顖氬瀻
    pendingPoints: 0, // 瀵板懐鏁撻弫鍫⑿濋崚?    expiringPoints: 0, // 閸楀啿鐨㈡潻鍥ㄦ埂缁夘垰鍨?    expiringDate: '', // 鏉╁洦婀￠弮銉︽埂
    level: '', // 閻劍鍩涚粵澶岄獓
    pointsHistory: [], // 缁夘垰鍨庨崢鍡楀蕉鐠佹澘缍?    loading: true, // 閺勵垰鎯佸锝呮躬閸旂姾娴?    error: false, // 閺勵垰鎯侀崝鐘烘祰婢惰精瑙?    hasMore: true, // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?    page: 1, // 瑜版挸澧犳い鐢电垳
    pageSize: 20, // 濮ｅ繘銆夐弫鐗堝祦闁?    refreshing: false, // 閺勵垰鎯佸锝呮躬閸掗攱鏌?    showFilterModal: false, // 閺勵垰鎯侀弰鍓с仛缁涙盯鈧鑴婄粣?    filterType: 'all' // 缁涙盯鈧琚崹? all/gain/use
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'points'
    });
    
    // 閸旂姾娴囩粔顖氬瀻閺佺増宓?    this.loadPointsData();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 濮ｅ繑顐奸弰鍓с仛妞ょ敻娼伴弮璺哄讲娴犮儱鍩涢弬鐗堟殶閹诡噯绱濋悧鐟板焼閺勵垯绮犻崗鏈电铂妞ょ敻娼版潻鏂挎礀閺?    if (!this.data.loading && !this.data.refreshing) {
      this.loadPointsData(true);
    }
  },

  /**
   * 閸旂姾娴囩粔顖氬瀻閺佺増宓?   * @param {boolean} refresh 閺勵垰鎯侀崚閿嬫煀閺佺増宓侀敍鍫ュ櫢缂冾噣銆夐惍渚婄礆
   */
  async loadPointsData(refresh = false) {
    try {
      if (refresh) {
        // 闁插秶鐤嗛悩鑸碘偓?        this.setData({
          page: 1,
          pointsHistory: [],
          hasMore: true
        });
      }

      if (!this.data.hasMore && !refresh) {
        return;
      }

      // 閺勫墽銇氶崝鐘烘祰閻樿埖鈧?      this.setData({
        loading: true,
        error: false
      });

      // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?      if (!app.isLoggedIn()) {
        this.setData({
          loading: false,
          error: true
        });
        showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
        return;
      }

      // 閼惧嘲褰囬悽銊﹀煕缁夘垰鍨庣拠锔剧矎娣団剝浼?      const pointsInfoPromise = app.services.points.getUserPointsInfo();
      
      // 娴ｈ法鏁ointsService閼惧嘲褰囩粔顖氬瀻閺佺増宓?      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize,
        type: this.data.filterType
      };
      const historyPromise = app.services.points.getUserPointsHistory(params);
      
      // 楠炴儼顢戠拠閿嬬湴閺佺増宓?      const [pointsInfo, result] = await Promise.all([pointsInfoPromise, historyPromise]);
      
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
   * 婢跺嫮鎮婄拠閿嬬湴闁挎瑨顕?   * @param {Object} err 闁挎瑨顕ょ€电钖?   */
  handleRequestError(err) {
    let errorMsg = '閼惧嘲褰囩粔顖氬瀻閺佺増宓佹径杈Е';
    
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
   * 鐠哄疇娴嗛崚鎵濋崚鍡氼潐閸掓瑩銆夐棃?   */
  navigateToPointsRules: function() {
    // 鐠佹澘缍嶇€佃壈鍩呮禍瀣╂
    app.analyticsService.track('navigate_to_points_rules');
    
    wx.navigateTo({
      url: '/pages/user/points-rules'
    });
  },
  
  /**
   * 鐠哄疇娴嗛崚鎵劮閸掍即銆夐棃?   */
  navigateToSignIn: function() {
    // 鐠佹澘缍嶇€佃壈鍩呮禍瀣╂
    app.analyticsService.track('navigate_to_sign_in');
    
    wx.navigateTo({
      url: '/pages/user/points-signin'
    });
  },
  
  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡楁櫌閸?   */
  navigateToPointsMall: function() {
    // 鐠佹澘缍嶇€佃壈鍩呮禍瀣╂
    app.analyticsService.track('navigate_to_points_mall');
    
    wx.navigateTo({
      url: '/pages/user/points-mall'
    });
  },
  
  /**
   * 鐠哄疇娴嗛崚鏉垮幀閹广垼顔囪ぐ?   */
  navigateToExchangeRecords: function() {
    // 鐠佹澘缍嶇€佃壈鍩呮禍瀣╂
    app.analyticsService.track('navigate_to_exchange_records');
    
    wx.navigateTo({
      url: '/pages/user/points-exchange-records'
    });
  },
  
  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡曟崲閸?   */
  navigateToPointsTasks: function() {
    // 鐠佹澘缍嶇€佃壈鍩呮禍瀣╂
    app.analyticsService.track('navigate_to_points_tasks');
    
    wx.navigateTo({
      url: '/pages/user/points-tasks'
    });
  },
  
  /**
   * 閺勫墽銇氱粵娑⑩偓澶愨偓澶愩€?   */
  showFilterOptions: function() {
    this.setData({
      showFilterModal: true
    });
  },
  
  /**
   * 闂呮劘妫岀粵娑⑩偓澶愨偓澶愩€?   */
  hideFilterOptions: function() {
    this.setData({
      showFilterModal: false
    });
  },
  
  /**
   * 缁涙盯鈧琚崹瀣暭閸?   */
  onFilterTypeChange: function(e) {
    this.setData({
      filterType: e.detail.value
    });
  },
  
  /**
   * 鎼存梻鏁ょ粵娑⑩偓?   */
  applyFilter: function() {
    // 闂呮劘妫岀粵娑⑩偓澶婅剨缁?    this.hideFilterOptions();
    
    // 闁插秵鏌婇崝鐘烘祰閺佺増宓?    this.loadPointsData(true);
    
    // 鐠佹澘缍嶇粵娑⑩偓澶夌皑娴?    app.analyticsService.track('points_filter_applied', {
      filterType: this.data.filterType
    });
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋閺佺増宓?   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore && !this.data.error) {
      this.loadPointsData(false);
    }
  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   */
  onPullDownRefresh: function() {
    // 鐠佹澘缍嶆稉瀣閸掗攱鏌婃禍瀣╂
    app.analyticsService.track('pull_down_refresh', {
      page: 'points'
    });
    
    this.setData({
      refreshing: true
    });
    this.loadPointsData(true);
  },

  /**
   * 娑撳﹥濯虹憴锕€绨?   */
  onReachBottom: function() {
    // 鐠佹澘缍嶆稉濠冨閸旂姾娴囨禍瀣╂
    app.analyticsService.track('pull_up_load', {
      page: 'points'
    });
    
    this.loadMore();
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  retryLoad: function() {
    // 鐠佹澘缍嶉柌宥堢槸閸旂姾娴囨禍瀣╂
    app.analyticsService.track('retry_loading', {
      page: 'points'
    });
    
    this.loadPointsData(true);
  },
  
  /**
   * 閺嶇厧绱￠崠鏍ㄦ闂?   * @param {string} timeStr ISO閺嶇厧绱￠惃鍕闂傛潙鐡х粭锔胯
   * @returns {string} 閺嶇厧绱￠崠鏍ф倵閻ㄥ嫭妞傞梻?   */
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
});\n