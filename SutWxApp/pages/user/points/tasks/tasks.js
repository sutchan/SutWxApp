/**
 * 文件名: tasks.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

// 绉垎浠诲姟椤甸潰
const pointsService = require('../../../services/pointsService.js');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    // 浠诲姟绫诲瀷绛涢€?    taskTypes: [
      { key: 'all', name: '鍏ㄩ儴浠诲姟', count: 0 },
      { key: 'once', name: '鏂版墜浠诲姟', count: 0 },
      { key: 'daily', name: '姣忔棩浠诲姟', count: 0 },
      { key: 'weekly', name: '姣忓懆浠诲姟', count: 0 },
      { key: 'monthly', name: '姣忔湀浠诲姟', count: 0 }
    ],
    currentType: 'all',
    
    // 浠诲姟鐘舵€佺瓫閫?    taskStatuses: [
      { key: 'all', name: '鍏ㄩ儴鐘舵€? },
      { key: 'pending', name: '鏈畬鎴? },
      { key: 'completed', name: '宸插畬鎴? },
      { key: 'unclaimed', name: '寰呴鍙? }
    ],
    currentStatus: 'all',
    
    // 浠诲姟鍒楄〃
    taskList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 鐢ㄦ埛绉垎淇℃伅
    userPoints: {
      availablePoints: 0,
      todayEarned: 0
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    // 鍔犺浇鐢ㄦ埛绉垎淇℃伅
    this.loadUserPoints();
    
    // 鍔犺浇浠诲姟鍒楄〃
    this.loadTaskList(true);
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍒濇娓叉煋瀹屾垚
   */
  onReady: function () {
    // 璁剧疆瀵艰埅鏍忔爣棰?    wx.setNavigationBarTitle({
      title: '绉垎浠诲姟'
    });
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 椤甸潰鏄剧ず鏃跺埛鏂版暟鎹?    this.loadUserPoints();
    this.loadTaskList(true);
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
    this.loadTaskList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadTaskList(false);
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   */
  onShareAppMessage: function () {
    return {
      title: '鍋氫换鍔¤禋绉垎锛屽ソ绀肩瓑浣犳潵鎷?,
      path: '/pages/user/points/tasks/tasks'
    };
  },

  /**
   * 鍔犺浇鐢ㄦ埛绉垎淇℃伅
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
      console.error('鍔犺浇鐢ㄦ埛绉垎淇℃伅澶辫触:', error);
    }
  },

  /**
   * 鍔犺浇浠诲姟鍒楄〃
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
        
        // 鏇存柊浠诲姟绫诲瀷璁℃暟
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
          title: result.message || '鍔犺浇浠诲姟澶辫触',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('鍔犺浇浠诲姟鍒楄〃澶辫触:', error);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '缃戠粶閿欒锛岃閲嶈瘯',
        icon: 'none'
      });
    }
  },

  /**
   * 鍒囨崲浠诲姟绫诲瀷
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
   * 鍒囨崲浠诲姟鐘舵€?   */
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
   * 瀹屾垚浠诲姟
   */
  completeTask: async function(e) {
    const taskId = e.currentTarget.dataset.id;
    
    try {
      wx.showLoading({
        title: '姝ｅ湪瀹屾垚浠诲姟...',
      });
      
      const result = await pointsService.completeTask(taskId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '浠诲姟瀹屾垚',
          icon: 'success'
        });
        
        // 鍒锋柊浠诲姟鍒楄〃
        this.loadTaskList(true);
        
        // 鍒锋柊鐢ㄦ埛绉垎
        this.loadUserPoints();
      } else {
        wx.showToast({
          title: result.message || '瀹屾垚浠诲姟澶辫触',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('瀹屾垚浠诲姟澶辫触:', error);
      wx.showToast({
        title: '缃戠粶閿欒锛岃閲嶈瘯',
        icon: 'none'
      });
    }
  },

  /**
   * 棰嗗彇浠诲姟濂栧姳
   */
  claimTaskReward: async function(e) {
    const taskId = e.currentTarget.dataset.id;
    
    try {
      wx.showLoading({
        title: '姝ｅ湪棰嗗彇濂栧姳...',
      });
      
      const result = await pointsService.claimTaskReward(taskId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: `鑾峰緱${result.data.points}绉垎`,
          icon: 'success'
        });
        
        // 鍒锋柊浠诲姟鍒楄〃
        this.loadTaskList(true);
        
        // 鍒锋柊鐢ㄦ埛绉垎
        this.loadUserPoints();
      } else {
        wx.showToast({
          title: result.message || '棰嗗彇濂栧姳澶辫触',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('棰嗗彇浠诲姟濂栧姳澶辫触:', error);
      wx.showToast({
        title: '缃戠粶閿欒锛岃閲嶈瘯',
        icon: 'none'
      });
    }
  },

  /**
   * 璺宠浆鍒颁换鍔¤鎯呴〉
   */
  goToTaskDetail: function(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/points/taskDetail/taskDetail?id=${taskId}`
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗛〉闈?   */
  goToPoints: function() {
    wx.switchTab({
      url: '/pages/user/points/points'
    });
  },

  /**
   * 鏍煎紡鍖栦换鍔¤繘搴?   */
  formatTaskProgress: function(current, target) {
    return `${current}/${target}`;
  },

  /**
   * 璁＄畻浠诲姟杩涘害鐧惧垎姣?   */
  getTaskProgressPercent: function(current, target) {
    if (!target || target <= 0) return 0;
    const percent = (current / target) * 100;
    return Math.min(percent, 100);
  }
});