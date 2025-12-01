/**
 * 鏂囦欢鍚? following.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 閸忚櫕鏁為崚妤勩€冩い鐢告桨
 */
const favoriteService = require('../../../services/favoriteService');

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    activeTab: 0, // 瑜版挸澧犲┑鈧ú鑽ゆ畱閺嶅洨顒?0-閹存垵鍙у▔銊ф畱 1-閸忚櫕鏁為幋鎴犳畱
    tabs: ['閹存垵鍙у▔銊ф畱', '閸忚櫕鏁為幋鎴犳畱'],
    followingList: [], // 閹存垵鍙у▔銊ф畱閸掓銆?    followersList: [], // 閸忚櫕鏁為幋鎴犳畱閸掓銆?    loading: false, // 加载状态   noMoreData: false, // 閺勵垰鎯佸▽鈩冩箒閺囨潙顦块弫鐗堝祦
    isEmpty: false, // 閺勵垰鎯佹稉铏光敄
    page: 1, // 瑜版挸澧犳い鐢电垳
    pageSize: 20, // 濮ｅ繘銆夐弫浼村櫤
    editMode: false, // 閺勵垰鎯佹径鍕艾缂傛牞绶Ο鈥崇础
    selectedItems: [], // 闁鑵戦惃鍕€嶉惄?    searchKeyword: '', // 閹兼粎鍌ㄩ崗鎶芥暛鐠?    searchResults: [], // 閹兼粎鍌ㄧ紒鎾寸亯
    showSearchResults: false // 閺勵垰鎯侀弰鍓с仛閹兼粎鍌ㄧ紒鎾寸亯
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    this.loadFollowingList(true);
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸掓繃顐煎〒鍙夌厠鐎瑰本鍨?   */
  onReady: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 閸掗攱鏌婇弫鐗堝祦
    this.refreshCurrentTab();
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
    this.refreshCurrentTab();
  },

  /**
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function () {
    if (!this.data.loading && !this.data.noMoreData && !this.data.showSearchResults) {
      this.loadMoreData();
    }
  },

  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   */
  onShareAppMessage: function () {
    return {
      title: '閹存垹娈戦崗铏暈',
      path: '/pages/user/following/following'
    };
  },

  /**
   * 閸掑洦宕查弽鍥╊劮
   */
  onTabChange: function(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.activeTab) return;
    
    this.setData({
      activeTab: index,
      editMode: false,
      selectedItems: [],
      searchKeyword: '',
      showSearchResults: false
    });
    
    this.refreshCurrentTab();
  },

  /**
   * 閸掗攱鏌婅ぐ鎾冲閺嶅洨顒锋い鍨殶閹?   */
  refreshCurrentTab: function() {
    if (this.data.activeTab === 0) {
      this.loadFollowingList(true);
    } else {
      this.loadFollowersList(true);
    }
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋閺佺増宓?   */
  loadMoreData: function() {
    if (this.data.activeTab === 0) {
      this.loadFollowingList(false);
    } else {
      this.loadFollowersList(false);
    }
  },

  /**
   * 閸旂姾娴囬幋鎴濆彠濞夈劎娈戦崚妤勩€?   */
  loadFollowingList: function(reset = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    const page = reset ? 1 : this.data.page;
    const pageSize = this.data.pageSize;
    
    favoriteService.getUserFollowing({
      page,
      pageSize
    }).then((res) => {
      wx.stopPullDownRefresh();
      
      const newList = res.data || [];
      const oldList = reset ? [] : this.data.followingList;
      const followingList = oldList.concat(newList);
      
      this.setData({
        followingList,
        page: reset ? 2 : page + 1,
        loading: false,
        noMoreData: newList.length < pageSize,
        isEmpty: reset && followingList.length === 0
      });
    }).catch((err) => {
      wx.stopPullDownRefresh();
      this.setData({ loading: false });
      
      wx.showToast({
        title: err.message || '閸旂姾娴囨径杈Е',
        icon: 'none'
      });
    });
  },

  /**
   * 閸旂姾娴囬崗铏暈閹存垹娈戦崚妤勩€?   */
  loadFollowersList: function(reset = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    const page = reset ? 1 : this.data.page;
    const pageSize = this.data.pageSize;
    
    favoriteService.getUserFollowers({
      page,
      pageSize
    }).then((res) => {
      wx.stopPullDownRefresh();
      
      const newList = res.data || [];
      const oldList = reset ? [] : this.data.followersList;
      const followersList = oldList.concat(newList);
      
      this.setData({
        followersList,
        page: reset ? 2 : page + 1,
        loading: false,
        noMoreData: newList.length < pageSize,
        isEmpty: reset && followersList.length === 0
      });
    }).catch((err) => {
      wx.stopPullDownRefresh();
      this.setData({ loading: false });
      
      wx.showToast({
        title: err.message || '閸旂姾娴囨径杈Е',
        icon: 'none'
      });
    });
  },

  /**
   * 閸掑洦宕茬紓鏍帆濡€崇础
   */
  toggleEditMode: function() {
    this.setData({
      editMode: !this.data.editMode,
      selectedItems: []
    });
  },

  /**
   * 闁瀚?閸欐牗绉烽柅澶嬪妞ゅ湱娲?   */
  onSelectItem: function(e) {
    const { id } = e.currentTarget.dataset;
    const { selectedItems } = this.data;
    const index = selectedItems.indexOf(id);
    
    if (index > -1) {
      // 瀹告煡鈧鑵戦敍灞藉絿濞戝牓鈧鑵?      selectedItems.splice(index, 1);
    } else {
      // 閺堫亪鈧鑵戦敍灞惧潑閸旂娀鈧鑵?      selectedItems.push(id);
    }
    
    this.setData({ selectedItems });
  },

  /**
   * 閸忋劑鈧?閸欐牗绉烽崗銊┾偓?   */
  toggleSelectAll: function() {
    const { editMode, selectedItems, activeTab, followingList, followersList } = this.data;
    if (!editMode) return;
    
    const currentList = activeTab === 0 ? followingList : followersList;
    const allIds = currentList.map(item => item.id);
    
    if (selectedItems.length === allIds.length) {
      // 瀹告彃鍙忛柅澶涚礉閸欐牗绉烽崗銊┾偓?      this.setData({ selectedItems: [] });
    } else {
      // 閺堫亜鍙忛柅澶涚礉閹笛嗩攽閸忋劑鈧?      this.setData({ selectedItems: allIds });
    }
  },

  /**
   * 閸欐牗绉烽崗铏暈
   */
  unfollowUsers: function() {
    const { selectedItems, activeTab } = this.data;
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '鐠囩兘鈧瀚ㄧ憰浣稿絿濞戝牆鍙у▔銊ф畱閻劍鍩?,
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '閹绘劗銇?,
      content: `绾喖鐣剧憰浣稿絿濞戝牆鍙у▔銊┾偓澶夎厬閻?{selectedItems.length}娑擃亞鏁ら幋宄版偋閿涚剫,
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          // 閹靛綊鍣洪崣鏍ㄧХ閸忚櫕鏁?          const promises = selectedItems.map(id => favoriteService.unfollowUser(id));
          
          Promise.all(promises)
            .then(() => {
              wx.showToast({
                title: '閸欐牗绉烽崗铏暈閹存劕濮?,
                icon: 'success'
              });
              
              // 閸掗攱鏌婇崚妤勩€?              this.setData({
                editMode: false,
                selectedItems: []
              });
              
              if (activeTab === 0) {
                this.loadFollowingList(true);
              } else {
                this.loadFollowersList(true);
              }
            })
            .catch((err) => {
              this.setData({ loading: false });
              wx.showToast({
                title: err.message || '閹垮秳缍旀径杈Е',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  /**
   * 閸忚櫕鏁為悽銊﹀煕
   */
  followUser: function(e) {
    const { id } = e.currentTarget.dataset;
    
    this.setData({ loading: true });
    
    favoriteService.followUser(id)
      .then(() => {
        this.setData({ loading: false });
        wx.showToast({
          title: '閸忚櫕鏁為幋鎰',
          icon: 'success'
        });
        
        // 閸掗攱鏌婇崗铏暈閹存垹娈戦崚妤勩€?        if (this.data.activeTab === 1) {
          this.loadFollowersList(true);
        }
      })
      .catch((err) => {
        this.setData({ loading: false });
        wx.showToast({
          title: err.message || '閸忚櫕鏁炴径杈Е',
          icon: 'none'
        });
      });
  },

  /**
   * 閹兼粎鍌ㄦ潏鎾冲弳
   */
  onSearchInput: function(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
    
    // 濞撳懐鈹栭幖婊呭偍濡楀棙妞傞弰鍓с仛閸樼喎鍨悰?    if (!keyword) {
      this.setData({
        showSearchResults: false,
        searchResults: []
      });
    }
  },

  /**
   * 閹笛嗩攽閹兼粎鍌?   */
  onSearch: function() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) return;
    
    this.setData({ loading: true });
    
    // 鐠佸墽鐤嗗鍦惃鍕壐閹兼粎鍌?    wx.showToast({
      title: '閹兼粎鍌ㄤ腑...',
      icon: 'loading'
    });
    
    // 鐠佸墽鐤嗗鍦惃鍕壐閹兼粎鍌ㄥ鍦惃鍕壐
    setTimeout(() => {
      this.setData({
        searchResults: [],
        showSearchResults: true,
        loading: false
      });
      
      wx.hideToast();
      wx.showToast({
        title: '閹兼粎鍌ㄥ鍦惃鍕壐閹存劕濮?,
        icon: 'success'
      });
    }, 500);
  },

  /**
   * 濞撳懐鈹栭幖婊呭偍
   */
  clearSearch: function() {
    this.setData({
      searchKeyword: '',
      searchResults: [],
      showSearchResults: false
    });
  },

  /**
   * 閺屻儳婀呴悽銊﹀煕鐠囷附鍎?   */
  viewUserDetail: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/userDetail/userDetail?id=${id}`
    });
  }
});
