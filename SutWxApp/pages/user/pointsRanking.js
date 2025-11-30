/**
 * 文件名: pointsRanking.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 绉垎鎺掕姒滈〉闈? */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 褰撳墠鐢ㄦ埛绉垎淇℃伅
    userInfo: {
      avatar: '/images/default-avatar.png',
      nickname: '鐢ㄦ埛鏄电О',
      points: 0,
      rank: 0
    },
    
    // 姒滃崟绫诲瀷
    activeTab: 'total',
    tabs: [
      { key: 'total', label: '鎬绘' },
      { key: 'daily', label: '鏃ユ' },
      { key: 'weekly', label: '鍛ㄦ' },
      { key: 'monthly', label: '鏈堟' }
    ],
    
    // 鎺掕姒滃垪琛?    rankingList: [],
    
    // 鍒嗛〉鍙傛暟
    page: 1,
    pageSize: 20,
    hasMore: true,
    
    // 鍔犺浇鐘舵€?    isLoading: false,
    isEmpty: false,
    
    // 鍒锋柊鐘舵€?    isRefreshing: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    this.loadUserInfo();
    this.loadRankingList();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍒濇娓叉煋瀹屾垚
   */
  onReady: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰闅愯棌
   */
  onHide: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload: function () {
    
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh: function () {
    this.setData({
      isRefreshing: true,
      page: 1,
      hasMore: true,
      rankingList: []
    });
    
    Promise.all([
      this.loadUserInfo(),
      this.loadRankingList()
    ]).finally(() => {
      this.setData({
        isRefreshing: false
      });
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadRankingList();
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   */
  onShareAppMessage: function () {
    return {
      title: '绉垎鎺掕姒?,
      path: '/pages/user/pointsRanking/pointsRanking'
    };
  },

  /**
   * 鍔犺浇褰撳墠鐢ㄦ埛淇℃伅
   */
  loadUserInfo: function() {
    pointsService.getUserPoints()
      .then(res => {
        if (res.success) {
          this.setData({
            'userInfo.points': res.data.points,
            'userInfo.rank': res.data.rank,
            'userInfo.avatar': res.data.avatar || '/images/default-avatar.png',
            'userInfo.nickname': res.data.nickname || '鐢ㄦ埛鏄电О'
          });
        }
      })
      .catch(err => {
        console.error('鑾峰彇鐢ㄦ埛绉垎淇℃伅澶辫触', err);
      });
  },

  /**
   * 鍔犺浇鎺掕姒滃垪琛?   */
  loadRankingList: function() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({
      isLoading: true
    });
    
    const { activeTab, page, pageSize } = this.data;
    
    pointsService.getRankingList({
      type: activeTab,
      page,
      pageSize
    })
      .then(res => {
        if (res.success) {
          const newList = res.data.list || [];
          const hasMore = newList.length >= pageSize;
          
          this.setData({
            rankingList: page === 1 ? newList : [...this.data.rankingList, ...newList],
            page: page + 1,
            hasMore,
            isEmpty: page === 1 && newList.length === 0
          });
        } else {
          wx.showToast({
            title: res.message || '鍔犺浇澶辫触',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('鍔犺浇鎺掕姒滃け璐?, err);
        wx.showToast({
          title: '缃戠粶閿欒',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({
          isLoading: false
        });
      });
  },

  /**
   * 鍒囨崲姒滃崟绫诲瀷
   */
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true,
      rankingList: [],
      isEmpty: false
    });
    
    this.loadRankingList();
  },

  /**
   * 鏌ョ湅鐢ㄦ埛璇︽儏
   */
  onViewUser: function(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/userDetail/userDetail?id=${userId}`
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗕换鍔￠〉闈?   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks/pointsTasks'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗘槑缁嗛〉闈?   */
  onGoToDetail: function() {
    wx.navigateTo({
      url: '/pages/user/pointsDetail/pointsDetail'
    });
  }
});