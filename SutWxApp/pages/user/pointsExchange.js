/**
 * 积分兑换页面
 */
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 当前积分
    currentPoints: 0,
    
    // 分类标签
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'coupon', label: '优惠券' },
      { key: 'product', label: '实物商品' },
      { key: 'vip', label: '会员特权' }
    ],
    
    // 排序方式
    sortType: 'default',
    sortOptions: [
      { key: 'default', label: '默认排序' },
      { key: 'points_asc', label: '积分从低到高' },
      { key: 'points_desc', label: '积分从高到低' },
      { key: 'hot', label: '热门兑换' }
    ],
    
    // 兑换商品列表
    exchangeList: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false,
    isEmpty: false,
    
    // 筛选弹窗
    showFilter: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadCurrentPoints();
    this.loadExchangeList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 从其他页面返回时，刷新当前积分
    this.loadCurrentPoints();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refreshData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadMoreExchangeList();
    }
  },

  /**
   * 加载当前积分
   */
  loadCurrentPoints: function() {
    pointsService.getUserPoints()
      .then(res => {
        this.setData({
          currentPoints: res.data.points || 0
        });
      })
      .catch(err => {
        console.error('获取当前积分失败', err);
      });
  },

  /**
   * 加载兑换商品列表
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
        console.error('获取兑换列表失败', err);
        this.setData({
          isLoading: false
        });
        wx.stopPullDownRefresh();
        
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      });
  },

  /**
   * 加载更多兑换商品
   */
  loadMoreExchangeList: function() {
    this.setData({
      page: this.data.page + 1
    }, () => {
      this.loadExchangeList();
    });
  },

  /**
   * 刷新数据
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
   * 切换分类标签
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
   * 显示筛选弹窗
   */
  onShowFilter: function() {
    this.setData({
      showFilter: true
    });
  },

  /**
   * 隐藏筛选弹窗
   */
  onHideFilter: function() {
    this.setData({
      showFilter: false
    });
  },

  /**
   * 选择排序方式
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
   * 查看兑换详情
   */
  onViewDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/pointsExchangeDetail?id=${id}`
    });
  },

  /**
   * 立即兑换
   */
  onExchange: function(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.exchangeList.find(item => item.id === id);
    
    if (!item) return;
    
    // 检查积分是否足够
    if (this.data.currentPoints < item.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }
    
    // 检查库存
    if (item.stock <= 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认兑换',
      content: `确定使用${item.points}积分兑换${item.name}吗？`,
      success: (res) => {
        if (res.confirm) {
          this.confirmExchange(id);
        }
      }
    });
  },

  /**
   * 确认兑换
   */
  confirmExchange: function(id) {
    wx.showLoading({
      title: '兑换中...'
    });
    
    pointsService.exchangePoints(id)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 0) {
          wx.showToast({
            title: '兑换成功',
            icon: 'success'
          });
          
          // 刷新当前积分和列表
          this.loadCurrentPoints();
          this.refreshData();
          
          // 如果是优惠券，跳转到优惠券列表
          const item = this.data.exchangeList.find(item => item.id === id);
          if (item && item.category === 'coupon') {
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/user/coupon/list/list'
              });
            }, 1500);
          }
        } else {
          wx.showToast({
            title: res.message || '兑换失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('兑换失败', err);
        wx.showToast({
          title: '兑换失败，请重试',
          icon: 'none'
        });
      });
  },

  /**
   * 跳转到积分明细页面
   */
  onGoToDetail: function() {
    wx.navigateTo({
      url: '/pages/user/pointsDetail'
    });
  },

  /**
   * 跳转到积分任务页面
   */
  onGoToTasks: function() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks'
    });
  }
});