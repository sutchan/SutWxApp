/**
 * 文件名 pointsExchange.js
 * 版本号 1.0.0
 * 更新日期: 2025-12-04
 * 描述: 缁夘垰鍨庨崗鎴炲床妞ょ敻娼? */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 瑜版挸澧犵粔顖氬瀻
    currentPoints: 0,
    
    // 閸掑棛琚弽鍥╊劮
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '閸忋劑鍎? },
      { key: 'coupon', label: '娴兼ɑ鍎崚? },
      { key: 'product', label: '鐎圭偟澧块崯鍡楁惂' },
      { key: 'vip', label: '娴兼艾鎲抽悧瑙勬綀' }
    ],
    
    // 閹烘帒绨弬鐟扮础
    sortType: 'default',
    sortOptions: [
      { key: 'default', label: '姒涙顓婚幒鎺戠碍' },
      { key: 'points_asc', label: '缁夘垰鍨庢禒搴濈秵閸掍即鐝? },
      { key: 'points_desc', label: '缁夘垰鍨庢禒搴ㄧ彯閸掗缍? },
      { key: 'hot', label: '閻戭參妫崗鎴炲床' }
    ],
    
    // 閸忔垶宕查崯鍡楁惂閸掓銆?    exchangeList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false,
    isEmpty: false,
    
    // 缁涙盯鈧鑴婄粣?    showFilter: false
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    this.loadCurrentPoints();
    this.loadExchangeList();
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
      this.loadMoreExchangeList();
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
   * 閸旂姾娴囬崗鎴炲床閸熷棗鎼ч崚妤勩€?   */
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
        console.error('閼惧嘲褰囬崗鎴炲床閸掓銆冩径杈Е', err);
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
   * 閸旂姾娴囬弴鏉戭樋閸忔垶宕查崯鍡楁惂
   */
  loadMoreExchangeList: function() {
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadExchangeList();
    });
  },

  /**
   * 閸掗攱鏌婇弫鐗堝祦
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
   * 閸掑洦宕查崚鍡欒閺嶅洨顒?   */
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
   * 閺勫墽銇氱粵娑⑩偓澶婅剨缁?   */
  onShowFilter: function() {
    this.setData({
      showFilter: true
    });
  },

  /**
   * 闂呮劘妫岀粵娑⑩偓澶婅剨缁?   */
  onHideFilter: function() {
    this.setData({
      showFilter: false
    });
  },

  /**
   * 闁瀚ㄩ幒鎺戠碍閺傜懓绱?   */
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
   * 閺屻儳婀呴崗鎴炲床鐠囷附鍎?   */
  onViewDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/pointsExchangeDetail?id=${id}`
    });
  },

  /**
   * 缁斿宓嗛崗鎴炲床
   */
  onExchange: function(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.exchangeList.find(item => item.id === id);
    
    if (!item) return;
    
    // 濡偓閺屻儳袧閸掑棙妲搁崥锕佸喕婢?    if (this.data.currentPoints < item.points) {
      wx.showToast({
        title: '缁夘垰鍨庢稉宥堝喕',
        icon: 'none'
      });
      return;
    }
    
    // 濡偓閺屻儱绨辩€?    if (item.stock <= 0) {
      wx.showToast({
        title: '鎼存挸鐡ㄦ稉宥堝喕',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '绾喛顓婚崗鎴炲床',
      content: `绾喖鐣炬担璺ㄦ暏${item.points}缁夘垰鍨庨崗鎴炲床${item.name}閸氭绱礰,
      success: (res) => {
        if (res.confirm) {
          this.confirmExchange(id);
        }
      }
    });
  },

  /**
   * 绾喛顓婚崗鎴炲床
   */
  confirmExchange: function(id) {
    wx.showLoading({
      title: '閸忔垶宕叉稉?..'
    });
    
    pointsService.exchangePoints(id)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 0) {
          wx.showToast({
            title: '閸忔垶宕查幋鎰',
            icon: 'success'
          });
          
          // 閸掗攱鏌婅ぐ鎾冲缁夘垰鍨庨崪灞藉灙鐞?          this.loadCurrentPoints();
          this.refreshData();
          
          // 婵″倹鐏夐弰顖欑喘閹姴鍩滈敍宀冪儲鏉烆剙鍩屾导妯诲劕閸掔鍨悰?          const item = this.data.exchangeList.find(item => item.id === id);
          if (item && item.category === 'coupon') {
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/user/coupon/list/list'
              });
            }, 1500);
          }
        } else {
          wx.showToast({
            title: res.message || '閸忔垶宕叉径杈Е',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('閸忔垶宕叉径杈Е', err);
        wx.showToast({
          title: '閸忔垶宕叉径杈Е閿涘矁顕柌宥堢槸',
          icon: 'none'
        });
      });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡樻缂佸棝銆夐棃?   */
  onGoToDetail: function() {
    wx.navigateTo({
      url: '/pages/user/pointsDetail'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡曟崲閸旓繝銆夐棃?   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks'
    });
  }
});
