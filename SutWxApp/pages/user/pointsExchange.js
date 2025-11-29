/**
 * 鏂囦欢鍚? pointsExchange.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鎻忚堪: 绉垎鍏戞崲椤甸潰
 */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 褰撳墠绉垎
    currentPoints: 0,
    
    // 鍒嗙被鏍囩
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '鍏ㄩ儴' },
      { key: 'coupon', label: '浼樻儬鍒? },
      { key: 'product', label: '瀹炵墿鍟嗗搧' },
      { key: 'vip', label: '浼氬憳鐗规潈' }
    ],
    
    // 鎺掑簭鏂瑰紡
    sortType: 'default',
    sortOptions: [
      { key: 'default', label: '榛樿鎺掑簭' },
      { key: 'points_asc', label: '绉垎浠庝綆鍒伴珮' },
      { key: 'points_desc', label: '绉垎浠庨珮鍒颁綆' },
      { key: 'hot', label: '鐑棬鍏戞崲' }
    ],
    
    // 鍏戞崲鍟嗗搧鍒楄〃
    exchangeList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false,
    isEmpty: false,
    
    // 绛涢€夊脊绐?    showFilter: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    this.loadCurrentPoints();
    this.loadExchangeList();
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
      this.loadMoreExchangeList();
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
   * 鍔犺浇鍏戞崲鍟嗗搧鍒楄〃
   */
  loadExchangeList: function() {
    if (this.data.isLoading) return;
    
    this.setData({
      isLoading: true
    });

    const params = {
      category: this.data.activeTab === 'all' ? undefined : this.data.activeTab,
      sortType: this.data.sortType === 'default' ? undefined : this.data.sortType,
      page: this.data.page,
      pageSize: this.data.pageSize
    };

    pointsService.getExchangeList(params)
      .then(res => {
        const newList = res.data.list || [];
        const isEmpty = this.data.page === 1 && newList.length === 0;
        const hasMore = newList.length >= this.data.pageSize;
        
        this.setData({
          exchangeList: this.data.page === 1 ? newList : [...this.data.exchangeList, ...newList],
          hasMore,
          isEmpty,
          isLoading: false
        });
        
        wx.stopPullDownRefresh();
      })
      .catch(err => {
        console.error('鑾峰彇鍏戞崲鍒楄〃澶辫触', err);
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
   * 鍔犺浇鏇村鍏戞崲鍟嗗搧
   */
  loadMoreExchangeList: function() {
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadExchangeList();
    });
  },

  /**
   * 鍒锋柊鏁版嵁
   */
  refreshData: function() {
    this.setData({
      page: 1,
      exchangeList: []
    }, () => {
      this.loadCurrentPoints();
      this.loadExchangeList();
    });
  },

  /**
   * 鍒囨崲鍒嗙被鏍囩
   */
  onTabChange: function(e) {
    const activeTab = e.currentTarget.dataset.tab;
    if (activeTab === this.data.activeTab) return;
    
    this.setData({
      activeTab,
      page: 1,
      exchangeList: []
    }, () => {
      this.loadExchangeList();
    });
  },

  /**
   * 鏄剧ず绛涢€夊脊绐?   */
  onShowFilter: function() {
    this.setData({
      showFilter: true
    });
  },

  /**
   * 闅愯棌绛涢€夊脊绐?   */
  onHideFilter: function() {
    this.setData({
      showFilter: false
    });
  },

  /**
   * 閫夋嫨鎺掑簭鏂瑰紡
   */
  onSelectSort: function(e) {
    const sortType = e.currentTarget.dataset.sort;
    if (sortType === this.data.sortType) return;
    
    this.setData({
      sortType,
      showFilter: false,
      page: 1,
      exchangeList: []
    }, () => {
      this.loadExchangeList();
    });
  },

  /**
   * 鏌ョ湅鍏戞崲璇︽儏
   */
  onViewDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/pointsExchangeDetail?id=${id}`
    });
  },

  /**
   * 绔嬪嵆鍏戞崲
   */
  onExchange: function(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.exchangeList.find(item => item.id === id);
    
    if (!item) return;
    
    // 妫€鏌ョН鍒嗘槸鍚﹁冻澶?    if (this.data.currentPoints < item.points) {
      wx.showToast({
        title: '绉垎涓嶈冻',
        icon: 'none'
      });
      return;
    }
    
    // 妫€鏌ュ簱瀛?    if (item.stock <= 0) {
      wx.showToast({
        title: '搴撳瓨涓嶈冻',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '纭鍏戞崲',
      content: `纭畾浣跨敤${item.points}绉垎鍏戞崲${item.name}鍚楋紵`,
      success: (res) => {
        if (res.confirm) {
          this.confirmExchange(id);
        }
      }
    });
  },

  /**
   * 纭鍏戞崲
   */
  confirmExchange: function(id) {
    wx.showLoading({
      title: '鍏戞崲涓?..'
    });
    
    pointsService.exchangePoints(id)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 0) {
          wx.showToast({
            title: '鍏戞崲鎴愬姛',
            icon: 'success'
          });
          
          // 鍒锋柊褰撳墠绉垎鍜屽垪琛?          this.loadCurrentPoints();
          this.refreshData();
          
          // 濡傛灉鏄紭鎯犲埜锛岃烦杞埌浼樻儬鍒稿垪琛?          const item = this.data.exchangeList.find(item => item.id === id);
          if (item && item.category === 'coupon') {
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/user/coupon/list/list'
              });
            }, 1500);
          }
        } else {
          wx.showToast({
            title: res.message || '鍏戞崲澶辫触',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('鍏戞崲澶辫触', err);
        wx.showToast({
          title: '鍏戞崲澶辫触锛岃閲嶈瘯',
          icon: 'none'
        });
      });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗘槑缁嗛〉闈?   */
  onGoToDetail: function() {
    wx.navigateTo({
      url: '/pages/user/pointsDetail'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗕换鍔￠〉闈?   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks'
    });
  }
});