/**
 * 鏂囦欢鍚? pointsDetail.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鎻忚堪: 绉垎鏄庣粏椤甸潰
 */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 褰撳墠绉垎
    currentPoints: 0,
    
    // 绛涢€夌被鍨?    activeTab: 'all',
    tabs: [
      { key: 'all', label: '鍏ㄩ儴' },
      { key: 'earn', label: '鑾峰緱' },
      { key: 'spend', label: '娑堣垂' }
    ],
    
    // 鏃堕棿绛涢€?    timeRange: 'all',
    timeOptions: [
      { key: 'all', label: '鍏ㄩ儴鏃堕棿' },
      { key: 'today', label: '浠婂ぉ' },
      { key: 'week', label: '鏈懆' },
      { key: 'month', label: '鏈湀' }
    ],
    
    // 鏄庣粏鍒楄〃
    detailList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false,
    isEmpty: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    this.loadCurrentPoints();
    this.loadDetailList();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 浠庡叾浠栭〉闈㈣繑鍥炴椂锛屽埛鏂板綋鍓嶇Н鍒?    this.loadCurrentPoints();
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh: function () {
    this.refreshData();
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadMoreDetailList();
    }
  },

  /**
   * 鍔犺浇褰撳墠绉垎
   */
  loadCurrentPoints: function() {
    pointsService.getUserPoints()
      .then(res => {
        this.setData({
          currentPoints: res.data.points || 0
        });
      })
      .catch(err => {
        console.error('鑾峰彇褰撳墠绉垎澶辫触', err);
      });
  },

  /**
   * 鍔犺浇绉垎鏄庣粏鍒楄〃
   */
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
        console.error('鑾峰彇绉垎鏄庣粏澶辫触', err);
        this.setData({
          isLoading: false
        });
        wx.stopPullDownRefresh();
        
        wx.showToast({
          title: '鍔犺浇澶辫触锛岃閲嶈瘯',
          icon: 'none'
        });
      });
  },

  /**
   * 鍔犺浇鏇村绉垎鏄庣粏
   */
  loadMoreDetailList: function() {
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadDetailList();
    });
  },

  /**
   * 鍒锋柊鏁版嵁
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
   * 鍒囨崲绫诲瀷鏍囩
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
   * 鍒囨崲鏃堕棿绛涢€?   */
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
   * 鏌ョ湅鏄庣粏璇︽儏
   */
  onViewDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/pointsDetailItem?id=${id}`
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗕换鍔￠〉闈?   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗗晢鍩庨〉闈?   */
  onGoToMall: function() {
    wx.switchTab({
      url: '/pages/user/pointsMall'
    });
  }
});