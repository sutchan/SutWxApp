/**
 * 积分任务页面
 */
const app = getApp();
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 任务类型
    activeTab: 'all', // all/daily/weekly/monthly/special
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'daily', name: '每日任务' },
      { key: 'weekly', name: '每周任务' },
      { key: 'monthly', name: '每月任务' },
      { key: 'special', name: '特殊任务' }
    ],
    
    // 任务列表
    taskList: [],
    
    // 加载状态
    loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    
    // 分页参数
    page: 1,
    pageSize: 20,
    
    // 任务统计
    taskStats: {
      total: 0,
      completed: 0,
      pending: 0,
      totalPoints: 0
    }
  },

  /**
   * 页面加载
   */
  onLoad: function(options) {
    // 从参数中获取初始标签
    if (options && options.tab) {
      this.setData({
        activeTab: options.tab
      });
    }
    
    this.loadTaskStats();
    this.loadTaskList(true);
  },

  /**
   * 页面显示
   */
  onShow: function() {
    // 每次显示页面时刷新数据
    this.refreshData();
  },

  /**
   * 页面隐藏
   */
  onHide: function() {
    // 页面隐藏时的处理
  },

  /**
   * 页面卸载
   */
  onUnload: function() {
    // 页面卸载时的处理
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.refreshData();
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function() {
    if (!this.data.loadingMore && this.data.hasMore) {
      this.loadTaskList(false);
    }
  },

  /**
   * 刷新数据
   */
  refreshData: function() {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    
    this.loadTaskStats();
    this.loadTaskList(true);
  },

  /**
   * 加载任务统计
   */
  loadTaskStats: function() {
    const self = this;
    
    pointsService.getTaskStats()
      .then(res => {
        if (res.success) {
          self.setData({
            taskStats: res.data
          });
        }
      })
      .catch(err => {
        console.error('获取任务统计失败:', err);
      });
  },

  /**
   * 加载任务列表
   * @param {Boolean} refresh 是否刷新
   */
  loadTaskList: function(refresh = false) {
    const self = this;
    
    // 设置加载状态
    if (refresh) {
      this.setData({
        loading: true,
        page: 1,
        taskList: []
      });
    } else {
      this.setData({
        loadingMore: true
      });
    }
    
    // 构建查询参数
    const params = {
      type: this.data.activeTab === 'all' ? undefined : this.data.activeTab,
      page: this.data.page,
      pageSize: this.data.pageSize
    };
    
    // 调用服务获取任务列表
    pointsService.getTasks(params)
      .then(res => {
        if (res.success) {
          const taskList = res.data.list || [];
          const hasMore = taskList.length >= this.data.pageSize;
          
          // 处理任务数据
          const processedTasks = taskList.map(task => {
            return {
              ...task,
              progress: this.calculateTaskProgress(task),
              canReceive: this.canReceiveReward(task),
              isExpired: this.isTaskExpired(task)
            };
          });
          
          // 更新数据
          if (refresh) {
            self.setData({
              taskList: processedTasks,
              hasMore: hasMore,
              page: hasMore ? 2 : 1,
              loading: false,
              refreshing: false
            });
          } else {
            self.setData({
              taskList: self.data.taskList.concat(processedTasks),
              hasMore: hasMore,
              page: hasMore ? self.data.page + 1 : self.data.page,
              loadingMore: false
            });
          }
        } else {
          wx.showToast({
            title: res.message || '获取任务列表失败',
            icon: 'none'
          });
          
          self.setData({
            loading: false,
            loadingMore: false,
            refreshing: false
          });
        }
      })
      .catch(err => {
        console.error('获取任务列表失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        
        self.setData({
          loading: false,
          loadingMore: false,
          refreshing: false
        });
      });
  },

  /**
   * 计算任务进度
   * @param {Object} task 任务对象
   * @returns {Number} 进度百分比
   */
  calculateTaskProgress: function(task) {
    if (!task.targetCount || task.targetCount <= 0) {
      return 0;
    }
    
    const progress = Math.floor((task.currentCount / task.targetCount) * 100);
    return Math.min(progress, 100);
  },

  /**
   * 判断是否可以领取奖励
   * @param {Object} task 任务对象
   * @returns {Boolean} 是否可以领取
   */
  canReceiveReward: function(task) {
    return task.status === 'completed' && !task.rewardReceived;
  },

  /**
   * 判断任务是否已过期
   * @param {Object} task 任务对象
   * @returns {Boolean} 是否已过期
   */
  isTaskExpired: function(task) {
    if (!task.expireTime) {
      return false;
    }
    
    return new Date(task.expireTime).getTime() < Date.now();
  },

  /**
   * 标签切换
   * @param {Object} e 事件对象
   */
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === this.data.activeTab) {
      return;
    }
    
    this.setData({
      activeTab: tab,
      page: 1,
      taskList: [],
      hasMore: true,
      loading: true
    });
    
    this.loadTaskList(true);
  },

  /**
   * 执行任务
   * @param {Object} e 事件对象
   */
  onTaskAction: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task) {
      return;
    }
    
    // 根据任务类型执行不同操作
    switch (task.actionType) {
      case 'navigate':
        this.navigateToTask(task);
        break;
      case 'popup':
        this.showTaskPopup(task);
        break;
      case 'share':
        this.shareTask(task);
        break;
      default:
        wx.showToast({
          title: '未知任务类型',
          icon: 'none'
        });
    }
  },

  /**
   * 导航到任务页面
   * @param {Object} task 任务对象
   */
  navigateToTask: function(task) {
    if (!task.actionUrl) {
      wx.showToast({
        title: '任务链接无效',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: task.actionUrl,
      fail: () => {
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 显示任务弹窗
   * @param {Object} task 任务对象
   */
  showTaskPopup: function(task) {
    wx.showModal({
      title: task.name || '任务详情',
      content: task.description || '暂无任务描述',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        // 标记任务为已查看
        this.markTaskAsViewed(task.id);
      }
    });
  },

  /**
   * 分享任务
   * @param {Object} task 任务对象
   */
  shareTask: function(task) {
    // 触发分享
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        // 标记任务为已分享
        this.markTaskAsShared(task.id);
      }
    });
  },

  /**
   * 领取任务奖励
   * @param {Object} e 事件对象
   */
  onReceiveReward: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task || !this.canReceiveReward(task)) {
      return;
    }
    
    const self = this;
    
    wx.showLoading({
      title: '领取中...',
      mask: true
    });
    
    pointsService.receiveTaskReward(taskId)
      .then(res => {
        wx.hideLoading();
        
        if (res.success) {
          // 更新任务状态
          const updatedTaskList = self.data.taskList.map(item => {
            if (item.id === taskId) {
              return {
                ...item,
                rewardReceived: true,
                status: 'claimed'
              };
            }
            return item;
          });
          
          self.setData({
            taskList: updatedTaskList
          });
          
          // 显示奖励弹窗
          self.showRewardPopup(task);
          
          // 刷新任务统计
          self.loadTaskStats();
        } else {
          wx.showToast({
            title: res.message || '领取失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('领取任务奖励失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      });
  },

  /**
   * 显示奖励弹窗
   * @param {Object} task 任务对象
   */
  showRewardPopup: function(task) {
    wx.showModal({
      title: '恭喜获得奖励',
      content: `获得 ${task.points} 积分`,
      showCancel: false,
      confirmText: '知道了',
      success: () => {
        // 可以添加其他操作，如跳转到积分明细页面
      }
    });
  },

  /**
   * 标记任务为已查看
   * @param {String} taskId 任务ID
   */
  markTaskAsViewed: function(taskId) {
    pointsService.markTaskAsViewed(taskId)
      .then(res => {
        if (res.success) {
          // 更新任务状态
          const updatedTaskList = this.data.taskList.map(item => {
            if (item.id === taskId) {
              return {
                ...item,
                viewed: true
              };
            }
            return item;
          });
          
          this.setData({
            taskList: updatedTaskList
          });
        }
      })
      .catch(err => {
        console.error('标记任务为已查看失败:', err);
      });
  },

  /**
   * 标记任务为已分享
   * @param {String} taskId 任务ID
   */
  markTaskAsShared: function(taskId) {
    pointsService.markTaskAsShared(taskId)
      .then(res => {
        if (res.success) {
          // 更新任务状态
          const updatedTaskList = this.data.taskList.map(item => {
            if (item.id === taskId) {
              return {
                ...item,
                shared: true,
                currentCount: (item.currentCount || 0) + 1
              };
            }
            return item;
          });
          
          this.setData({
            taskList: updatedTaskList
          });
          
          // 刷新任务统计
          this.loadTaskStats();
        }
      })
      .catch(err => {
        console.error('标记任务为已分享失败:', err);
      });
  },

  /**
   * 查看任务详情
   * @param {Object} e 事件对象
   */
  onViewTaskDetail: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task) {
      return;
    }
    
    wx.showModal({
      title: task.name || '任务详情',
      content: task.description || '暂无任务描述',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 页面分享
   */
  onShareAppMessage: function() {
    return {
      title: '快来完成积分任务，赢取丰厚奖励！',
      path: '/pages/user/pointsTasks/pointsTasks',
      imageUrl: '/images/share-points-tasks.jpg'
    };
  }
});