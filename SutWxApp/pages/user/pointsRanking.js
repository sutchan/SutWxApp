/**
 * 文件名 pointsRanking.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 缁夘垰鍨庨幒鎺曨攽濮掓粓銆夐棃? */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 瑜版挸澧犻悽銊﹀煕缁夘垰鍨庢穱鈩冧紖
    userInfo: {
      avatar: '/images/default-avatar.png',
      nickname: '閻劍鍩涢弰鐢敌?,
      points: 0,
      rank: 0
    },
    
    // 濮掓粌宕熺猾璇茬€?    activeTab: 'total',
    tabs: [
      { key: 'total', label: '閹粯顪? },
      { key: 'daily', label: '閺冦儲顪? },
      { key: 'weekly', label: '閸涖劍顪? },
      { key: 'monthly', label: '閺堝牊顪? }
    ],
    
    // 閹烘帟顢戝婊冨灙鐞?    rankingList: [],
    
    // 閸掑棝銆夐崣鍌涙殶
    page: 1,
    pageSize: 20,
    hasMore: true,
    
    // 加载状态   isLoading: false,
    isEmpty: false,
    
    // 閸掗攱鏌婇悩鑸碘偓?    isRefreshing: false
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    this.loadUserInfo();
    this.loadRankingList();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸掓繃顐煎〒鍙夌厠鐎瑰本鍨?   */
  onReady: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨闂呮劘妫?   */
  onHide: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   */
  onUnload: function () {
    
  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
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
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadRankingList();
    }
  },

  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   */
  onShareAppMessage: function () {
    return {
      title: '缁夘垰鍨庨幒鎺曨攽濮?,
      path: '/pages/user/pointsRanking/pointsRanking'
    };
  },

  /**
   * 閸旂姾娴囪ぐ鎾冲閻劍鍩涙穱鈩冧紖
   */
  loadUserInfo: function() {
    pointsService.getUserPoints()
      .then(res => {
        if (res.success) {
          this.setData({
            'userInfo.points': res.data.points,
            'userInfo.rank': res.data.rank,
            'userInfo.avatar': res.data.avatar || '/images/default-avatar.png',
            'userInfo.nickname': res.data.nickname || '閻劍鍩涢弰鐢敌?
          });
        }
      })
      .catch(err => {
        console.error('閼惧嘲褰囬悽銊﹀煕缁夘垰鍨庢穱鈩冧紖婢惰精瑙?, err);
      });
  },

  /**
   * 閸旂姾娴囬幒鎺曨攽濮掓粌鍨悰?   */
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
            title: res.message || '閸旂姾娴囨径杈Е',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('閸旂姾娴囬幒鎺曨攽濮掓粌銇戠拹?, err);
        wx.showToast({
          title: '缂冩垹绮堕柨娆掝嚖',
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
   * 閸掑洦宕插婊冨礋缁鐎?   */
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
   * 閺屻儳婀呴悽銊﹀煕鐠囷附鍎?   */
  onViewUser: function(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/userDetail/userDetail?id=${userId}`
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡曟崲閸旓繝銆夐棃?   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks/pointsTasks'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡樻缂佸棝銆夐棃?   */
  onGoToDetail: function() {
    wx.navigateTo({
      url: '/pages/user/pointsDetail/pointsDetail'
    });
  }
});
