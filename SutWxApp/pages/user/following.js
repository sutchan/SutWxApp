/**
 * 鏂囦欢鍚? following.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鎻忚堪: 鍏虫敞鍒楄〃椤甸潰
 */
const userService = require('../../../services/userService');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    activeTab: 0, // 褰撳墠婵€娲荤殑鏍囩 0-鎴戝叧娉ㄧ殑 1-鍏虫敞鎴戠殑
    tabs: ['鎴戝叧娉ㄧ殑', '鍏虫敞鎴戠殑'],
    followingList: [], // 鎴戝叧娉ㄧ殑鍒楄〃
    followersList: [], // 鍏虫敞鎴戠殑鍒楄〃
    loading: false, // 鍔犺浇鐘舵€?    noMoreData: false, // 鏄惁娌℃湁鏇村鏁版嵁
    isEmpty: false, // 鏄惁涓虹┖
    page: 1, // 褰撳墠椤电爜
    pageSize: 20, // 姣忛〉鏁伴噺
    editMode: false, // 鏄惁澶勪簬缂栬緫妯″紡
    selectedItems: [], // 閫変腑鐨勯」鐩?    searchKeyword: '', // 鎼滅储鍏抽敭璇?    searchResults: [], // 鎼滅储缁撴灉
    showSearchResults: false // 鏄惁鏄剧ず鎼滅储缁撴灉
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    this.loadFollowingList(true);
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
    // 鍒锋柊鏁版嵁
    this.refreshCurrentTab();
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
    this.refreshCurrentTab();
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    if (!this.data.loading && !this.data.noMoreData && !this.data.showSearchResults) {
      this.loadMoreData();
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   */
  onShareAppMessage: function () {
    return {
      title: '鎴戠殑鍏虫敞',
      path: '/pages/user/following/following'
    };
  },

  /**
   * 鍒囨崲鏍囩
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
   * 鍒锋柊褰撳墠鏍囩椤垫暟鎹?   */
  refreshCurrentTab: function() {
    if (this.data.activeTab === 0) {
      this.loadFollowingList(true);
    } else {
      this.loadFollowersList(true);
    }
  },

  /**
   * 鍔犺浇鏇村鏁版嵁
   */
  loadMoreData: function() {
    if (this.data.activeTab === 0) {
      this.loadFollowingList(false);
    } else {
      this.loadFollowersList(false);
    }
  },

  /**
   * 鍔犺浇鎴戝叧娉ㄧ殑鍒楄〃
   */
  loadFollowingList: function(reset = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    const page = reset ? 1 : this.data.page;
    const pageSize = this.data.pageSize;
    
    userService.getFollowingList({
      page,
      pageSize,
      success: (res) => {
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
      },
      fail: (err) => {
        wx.stopPullDownRefresh();
        this.setData({ loading: false });
        
        wx.showToast({
          title: err.message || '鍔犺浇澶辫触',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 鍔犺浇鍏虫敞鎴戠殑鍒楄〃
   */
  loadFollowersList: function(reset = false) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    const page = reset ? 1 : this.data.page;
    const pageSize = this.data.pageSize;
    
    userService.getFollowersList({
      page,
      pageSize,
      success: (res) => {
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
      },
      fail: (err) => {
        wx.stopPullDownRefresh();
        this.setData({ loading: false });
        
        wx.showToast({
          title: err.message || '鍔犺浇澶辫触',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 鍒囨崲缂栬緫妯″紡
   */
  toggleEditMode: function() {
    this.setData({
      editMode: !this.data.editMode,
      selectedItems: []
    });
  },

  /**
   * 閫夋嫨/鍙栨秷閫夋嫨椤圭洰
   */
  onSelectItem: function(e) {
    const { id } = e.currentTarget.dataset;
    const { selectedItems } = this.data;
    const index = selectedItems.indexOf(id);
    
    if (index > -1) {
      // 宸查€変腑锛屽彇娑堥€変腑
      selectedItems.splice(index, 1);
    } else {
      // 鏈€変腑锛屾坊鍔犻€変腑
      selectedItems.push(id);
    }
    
    this.setData({ selectedItems });
  },

  /**
   * 鍏ㄩ€?鍙栨秷鍏ㄩ€?   */
  toggleSelectAll: function() {
    const { editMode, selectedItems, activeTab, followingList, followersList } = this.data;
    if (!editMode) return;
    
    const currentList = activeTab === 0 ? followingList : followersList;
    const allIds = currentList.map(item => item.id);
    
    if (selectedItems.length === allIds.length) {
      // 宸插叏閫夛紝鍙栨秷鍏ㄩ€?      this.setData({ selectedItems: [] });
    } else {
      // 鏈叏閫夛紝鎵ц鍏ㄩ€?      this.setData({ selectedItems: allIds });
    }
  },

  /**
   * 鍙栨秷鍏虫敞
   */
  unfollowUsers: function() {
    const { selectedItems, activeTab } = this.data;
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '璇烽€夋嫨瑕佸彇娑堝叧娉ㄧ殑鐢ㄦ埛',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '鎻愮ず',
      content: `纭畾瑕佸彇娑堝叧娉ㄩ€変腑鐨?{selectedItems.length}涓敤鎴峰悧锛焋,
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          // 鎵归噺鍙栨秷鍏虫敞
          const promises = selectedItems.map(id => 
            new Promise((resolve, reject) => {
              userService.unfollowUser({
                userId: id,
                success: resolve,
                fail: reject
              });
            })
          );
          
          Promise.all(promises)
            .then(() => {
              wx.showToast({
                title: '鍙栨秷鍏虫敞鎴愬姛',
                icon: 'success'
              });
              
              // 鍒锋柊鍒楄〃
              this.setData({
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
                title: err.message || '鎿嶄綔澶辫触',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  /**
   * 鍏虫敞鐢ㄦ埛
   */
  followUser: function(e) {
    const { id } = e.currentTarget.dataset;
    
    this.setData({ loading: true });
    
    userService.followUser({
      userId: id,
      success: () => {
        this.setData({ loading: false });
        wx.showToast({
          title: '鍏虫敞鎴愬姛',
          icon: 'success'
        });
        
        // 鍒锋柊鍏虫敞鎴戠殑鍒楄〃
        if (this.data.activeTab === 1) {
          this.loadFollowersList(true);
        }
      },
      fail: (err) => {
        this.setData({ loading: false });
        wx.showToast({
          title: err.message || '鍏虫敞澶辫触',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 鎼滅储杈撳叆
   */
  onSearchInput: function(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
    
    // 娓呯┖鎼滅储妗嗘椂鏄剧ず鍘熷垪琛?    if (!keyword) {
      this.setData({
        showSearchResults: false,
        searchResults: []
      });
    }
  },

  /**
   * 鎵ц鎼滅储
   */
  onSearch: function() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) return;
    
    this.setData({ loading: true });
    
    userService.searchUsers({
      keyword,
      success: (res) => {
        this.setData({
          searchResults: res.data || [],
          showSearchResults: true,
          loading: false
        });
      },
      fail: (err) => {
        this.setData({ loading: false });
        wx.showToast({
          title: err.message || '鎼滅储澶辫触',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 娓呯┖鎼滅储
   */
  clearSearch: function() {
    this.setData({
      searchKeyword: '',
      searchResults: [],
      showSearchResults: false
    });
  },

  /**
   * 鏌ョ湅鐢ㄦ埛璇︽儏
   */
  viewUserDetail: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/userDetail/userDetail?id=${id}`
    });
  }
});