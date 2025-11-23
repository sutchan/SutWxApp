/**
 * 关注列表页面
 */
const userService = require('../../../services/userService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 0, // 当前激活的标签 0-我关注的 1-关注我的
    tabs: ['我关注的', '关注我的'],
    followingList: [], // 我关注的列表
    followersList: [], // 关注我的列表
    loading: false, // 加载状态
    noMoreData: false, // 是否没有更多数据
    isEmpty: false, // 是否为空
    page: 1, // 当前页码
    pageSize: 20, // 每页数量
    editMode: false, // 是否处于编辑模式
    selectedItems: [], // 选中的项目
    searchKeyword: '', // 搜索关键词
    searchResults: [], // 搜索结果
    showSearchResults: false // 是否显示搜索结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadFollowingList(true);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 刷新数据
    this.refreshCurrentTab();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refreshCurrentTab();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.loading && !this.data.noMoreData && !this.data.showSearchResults) {
      this.loadMoreData();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我的关注',
      path: '/pages/user/following/following'
    };
  },

  /**
   * 切换标签
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
   * 刷新当前标签页数据
   */
  refreshCurrentTab: function() {
    if (this.data.activeTab === 0) {
      this.loadFollowingList(true);
    } else {
      this.loadFollowersList(true);
    }
  },

  /**
   * 加载更多数据
   */
  loadMoreData: function() {
    if (this.data.activeTab === 0) {
      this.loadFollowingList(false);
    } else {
      this.loadFollowersList(false);
    }
  },

  /**
   * 加载我关注的列表
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
          title: err.message || '加载失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 加载关注我的列表
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
          title: err.message || '加载失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 切换编辑模式
   */
  toggleEditMode: function() {
    this.setData({
      editMode: !this.data.editMode,
      selectedItems: []
    });
  },

  /**
   * 选择/取消选择项目
   */
  onSelectItem: function(e) {
    const { id } = e.currentTarget.dataset;
    const { selectedItems } = this.data;
    const index = selectedItems.indexOf(id);
    
    if (index > -1) {
      // 已选中，取消选中
      selectedItems.splice(index, 1);
    } else {
      // 未选中，添加选中
      selectedItems.push(id);
    }
    
    this.setData({ selectedItems });
  },

  /**
   * 全选/取消全选
   */
  toggleSelectAll: function() {
    const { editMode, selectedItems, activeTab, followingList, followersList } = this.data;
    if (!editMode) return;
    
    const currentList = activeTab === 0 ? followingList : followersList;
    const allIds = currentList.map(item => item.id);
    
    if (selectedItems.length === allIds.length) {
      // 已全选，取消全选
      this.setData({ selectedItems: [] });
    } else {
      // 未全选，执行全选
      this.setData({ selectedItems: allIds });
    }
  },

  /**
   * 取消关注
   */
  unfollowUsers: function() {
    const { selectedItems, activeTab } = this.data;
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择要取消关注的用户',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '提示',
      content: `确定要取消关注选中的${selectedItems.length}个用户吗？`,
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          // 批量取消关注
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
                title: '取消关注成功',
                icon: 'success'
              });
              
              // 刷新列表
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
                title: err.message || '操作失败',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  /**
   * 关注用户
   */
  followUser: function(e) {
    const { id } = e.currentTarget.dataset;
    
    this.setData({ loading: true });
    
    userService.followUser({
      userId: id,
      success: () => {
        this.setData({ loading: false });
        wx.showToast({
          title: '关注成功',
          icon: 'success'
        });
        
        // 刷新关注我的列表
        if (this.data.activeTab === 1) {
          this.loadFollowersList(true);
        }
      },
      fail: (err) => {
        this.setData({ loading: false });
        wx.showToast({
          title: err.message || '关注失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 搜索输入
   */
  onSearchInput: function(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
    
    // 清空搜索框时显示原列表
    if (!keyword) {
      this.setData({
        showSearchResults: false,
        searchResults: []
      });
    }
  },

  /**
   * 执行搜索
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
          title: err.message || '搜索失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 清空搜索
   */
  clearSearch: function() {
    this.setData({
      searchKeyword: '',
      searchResults: [],
      showSearchResults: false
    });
  },

  /**
   * 查看用户详情
   */
  viewUserDetail: function(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/userDetail/userDetail?id=${id}`
    });
  }
});