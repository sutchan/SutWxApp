/**
 * 文件名: tasks.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

// 积分任务页面
const pointsService = require('../../../services/pointsService.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 任务类型筛选
    taskTypes: [
      { key: 'all', name: '全部任务', count: 0 },
      { key: 'once', name: '新手任务', count: 0 },
      { key: 'daily', name: '每日任务', count: 0 },
      { key: 'weekly', name: '每周任务', count: 0 },
      { key: 'monthly', name: '每月任务', count: 0 }
    ],
    currentType: 'all',
    
    // 任务状态筛选
    taskStatuses: [
      { key: 'all', name: '全部状态' },
      { key: 'pending', name: '未完成' },
      { key: 'completed', name: '已完成' },
      { key: 'unclaimed', name: '待领取' }
    ],
    currentStatus: 'all',
    
    // 任务列表
    taskList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 用户积分信息
    userPoints: {
      availablePoints: 0,
      todayEarned: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 加载用户积分信息
    this.loadUserPoints();
    
    // 加载任务列表
    this.loadTaskList(true);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '积分任务'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时刷新数据
    this.loadUserPoints();
    this.loadTaskList(true);
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
    this.loadTaskList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadTaskList(false);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '做任务赚积分，好礼等你来拿',
      path: '/pages/user/points/tasks/tasks'
    };
  },

  /**
   * 加载用户积分信息
   */
  loadUserPoints: async function() {
    try {
      const result = await pointsService.getUserPoints();
      if (result.success) {
        this.setData({
          userPoints: result.data
        });
      }
    } catch (error) {
      console.error('加载用户积分信息失败:', error);
    }
  },

  /**
   * 加载任务列表
   */
  loadTaskList: async function(reset = false) {
    if (this.data.loading) return;
    
    this.setData({
      loading: true
    });
    
    try {
      const page = reset ? 1 : this.data.page;
      const options = {
        type: this.data.currentType,
        status: this.data.currentStatus,
        page: page,
        pageSize: this.data.pageSize
      };
      
      const result = await pointsService.getPointsTasks(options);
      
      if (result.success) {
        const newTasks = result.data.list || [];
        const hasMore = newTasks.length === this.data.pageSize;
        
        // 更新任务类型计数
        if (reset && result.data.typeCounts) {
          const taskTypes = this.data.taskTypes.map(type => {
            const count = result.data.typeCounts[type.key] || 0;
            return { ...type, count };
          });
          this.setData({ taskTypes });
        }
        
        this.setData({
          taskList: reset ? newTasks : [...this.data.taskList, ...newTasks],
          page: hasMore ? page + 1 : page,
          hasMore: hasMore,
          loading: false
        });
      } else {
        this.setData({
          loading: false
        });
        wx.showToast({
          title: result.message || '加载任务失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 切换任务类型
   */
  switchTaskType: function(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.currentType) return;
    
    this.setData({
      currentType: type,
      taskList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadTaskList(true);
  },

  /**
   * 切换任务状态
   */
  switchTaskStatus: function(e) {
    const status = e.currentTarget.dataset.status;
    if (status === this.data.currentStatus) return;
    
    this.setData({
      currentStatus: status,
      taskList: [],
      page: 1,
      hasMore: true
    });
    
    this.loadTaskList(true);
  },

  /**
   * 完成任务
   */
  completeTask: async function(e) {
    const taskId = e.currentTarget.dataset.id;
    
    try {
      wx.showLoading({
        title: '正在完成任务...',
      });
      
      const result = await pointsService.completeTask(taskId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '任务完成',
          icon: 'success'
        });
        
        // 刷新任务列表
        this.loadTaskList(true);
        
        // 刷新用户积分
        this.loadUserPoints();
      } else {
        wx.showToast({
          title: result.message || '完成任务失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('完成任务失败:', error);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 领取任务奖励
   */
  claimTaskReward: async function(e) {
    const taskId = e.currentTarget.dataset.id;
    
    try {
      wx.showLoading({
        title: '正在领取奖励...',
      });
      
      const result = await pointsService.claimTaskReward(taskId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: `获得${result.data.points}积分`,
          icon: 'success'
        });
        
        // 刷新任务列表
        this.loadTaskList(true);
        
        // 刷新用户积分
        this.loadUserPoints();
      } else {
        wx.showToast({
          title: result.message || '领取奖励失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('领取任务奖励失败:', error);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 跳转到任务详情页
   */
  goToTaskDetail: function(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/points/taskDetail/taskDetail?id=${taskId}`
    });
  },

  /**
   * 跳转到积分页面
   */
  goToPoints: function() {
    wx.switchTab({
      url: '/pages/user/points/points'
    });
  },

  /**
   * 格式化任务进度
   */
  formatTaskProgress: function(current, target) {
    return `${current}/${target}`;
  },

  /**
   * 计算任务进度百分比
   */
  getTaskProgressPercent: function(current, target) {
    if (!target || target <= 0) return 0;
    const percent = (current / target) * 100;
    return Math.min(percent, 100);
  }
});