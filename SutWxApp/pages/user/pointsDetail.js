/**
 * 文件名 pointsDetail.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 缁夘垰鍨庨弰搴ｇ矎妞ょ敻娼? */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 瑜版挸澧犵粔顖氬瀻
    currentPoints: 0,
    
    // 缁涙盯鈧琚崹?    activeTab: 'all',
    tabs: [
      { key: 'all', label: '閸忋劑鍎? },
      { key: 'earn', label: '閼惧嘲绶? },
      { key: 'spend', label: '濞戝牐鍨? }
    ],
    
    // 閺冨爼妫跨粵娑⑩偓?    timeRange: 'all',
    timeOptions: [
      { key: 'all', label: '閸忋劑鍎撮弮鍫曟？' },
      { key: 'today', label: '娴犲﹤銇? },
      { key: 'week', label: '閺堫剙鎳? },
      { key: 'month', label: '閺堫剚婀€' }
    ],
    
    // 閺勫海绮忛崚妤勩€?    detailList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false,
    isEmpty: false
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    this.loadCurrentPoints();
    this.loadDetailList();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 娴犲骸鍙炬禒鏍€夐棃銏ｇ箲閸ョ偞妞傞敍灞藉煕閺傛澘缍嬮崜宥囆濋崚?    this.loadCurrentPoints();
  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   */
  onPullDownRefresh: function () {
    this.refreshData();
  },

  /**
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadMoreDetailList();
    }
  },

  /**
   * 閸旂姾娴囪ぐ鎾冲缁夘垰鍨?   */
  loadCurrentPoints: function() {
    pointsService.getUserPoints()
      .then(res => {
        this.setData({
          currentPoints: res.data.points || 0
        });
      })
      .catch(err => {
        console.error('閼惧嘲褰囪ぐ鎾冲缁夘垰鍨庢径杈Е', err);
      });
  },

  /**
   * 閸旂姾娴囩粔顖氬瀻閺勫海绮忛崚妤勩€?   */
  loadDetailList: function() {
    if (this.data.isLoading) return;
    
    this.setData({
      isLoading: true
    });

    const params = {
      type: this.data.activeTab === 'all' ? undefined : this.data.activeTab,
      timeRange: this.data.timeRange === 'all' ? undefined : this.data.timeRange,
      page: this.data.page,
      pageSize: this.data.pageSize
    };

    pointsService.getPointsDetail(params)
      .then(res => {
        const newList = res.data.list || [];
        const isEmpty = this.data.page === 1 && newList.length === 0;
        const hasMore = newList.length >= this.data.pageSize;
        
        this.setData({
          detailList: this.data.page === 1 ? newList : [...this.data.detailList, ...newList],
          hasMore,
          isEmpty,
          isLoading: false
        });
        
        wx.stopPullDownRefresh();
      })
      .catch(err => {
        console.error('閼惧嘲褰囩粔顖氬瀻閺勫海绮忔径杈Е', err);
        this.setData({
          isLoading: false
        });
        wx.stopPullDownRefresh();
        
        wx.showToast({
          title: '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸',
          icon: 'none'
        });
      });
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋缁夘垰鍨庨弰搴ｇ矎
   */
  loadMoreDetailList: function() {
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadDetailList();
    });
  },

  /**
   * 閸掗攱鏌婇弫鐗堝祦
   */
  refreshData: function() {
    this.setData({
      page: 1,
      detailList: []
    }, () => {
      this.loadCurrentPoints();
      this.loadDetailList();
    });
  },

  /**
   * 閸掑洦宕茬猾璇茬€烽弽鍥╊劮
   */
  onTabChange: function(e) {
    const activeTab = e.currentTarget.dataset.tab;
    if (activeTab === this.data.activeTab) return;
    
    this.setData({
      activeTab,
      page: 1,
      detailList: []
    }, () => {
      this.loadDetailList();
    });
  },

  /**
   * 閸掑洦宕查弮鍫曟？缁涙盯鈧?   */
  onTimeFilterChange: function(e) {
    const timeRange = e.currentTarget.dataset.time;
    if (timeRange === this.data.timeRange) return;
    
    this.setData({
      timeRange,
      page: 1,
      detailList: []
    }, () => {
      this.loadDetailList();
    });
  },

  /**
   * 閺屻儳婀呴弰搴ｇ矎鐠囷附鍎?   */
  onViewDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/pointsDetailItem?id=${id}`
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡曟崲閸旓繝銆夐棃?   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡楁櫌閸╁酣銆夐棃?   */
  onGoToMall: function() {
    wx.switchTab({
      url: '/pages/user/pointsMall'
    });
  }
});
