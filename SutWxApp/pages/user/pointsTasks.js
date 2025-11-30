/**
 * 文件名: pointsTasks.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 绉垎浠诲姟椤甸潰
 */
const app = getApp();
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 浠诲姟绫诲瀷
    activeTab: 'all', // all/daily/weekly/monthly/special
    tabs: [
      { key: 'all', name: '鍏ㄩ儴' },
      { key: 'daily', name: '姣忔棩浠诲姟' },
      { key: 'weekly', name: '姣忓懆浠诲姟' },
      { key: 'monthly', name: '姣忔湀浠诲姟' },
      { key: 'special', name: '鐗规畩浠诲姟' }
    ],
    
    // 浠诲姟鍒楄〃
    taskList: [],
    
    // 加载状态    loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    
    // 鍒嗛〉鍙傛暟
    page: 1,
    pageSize: 20,
    
    // 浠诲姟缁熻
    taskStats: {
      total: 0,
      completed: 0,
      pending: 0,
      totalPoints: 0
    }
  },

  /**
   * 椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 浠庡弬鏁颁腑鑾峰彇鍒濆鏍囩
    if (options && options.tab) {
      this.setData({
        activeTab: options.tab
      });
    }
    
    this.loadTaskStats();
    this.loadTaskList(true);
  },

  /**
   * 椤甸潰鏄剧ず
   */
  onShow: function() {
    // 姣忔鏄剧ず椤甸潰鏃跺埛鏂版暟鎹?    this.refreshData();
  },

  /**
   * 椤甸潰闅愯棌
   */
  onHide: function() {
    // 椤甸潰闅愯棌鏃剁殑澶勭悊
  },

  /**
   * 椤甸潰鍗歌浇
   */
  onUnload: function() {
    // 椤甸潰鍗歌浇鏃剁殑澶勭悊
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    this.refreshData();
  },

  /**
   * 涓婃媺鍔犺浇鏇村
   */
  onReachBottom: function() {
    if (!this.data.loadingMore && this.data.hasMore) {
      this.loadTaskList(false);
    }
  },

  /**
   * 鍒锋柊鏁版嵁
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
   * 鍔犺浇浠诲姟缁熻
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
        console.error('鑾峰彇浠诲姟缁熻澶辫触:', err);
      });
  },

  /**
   * 鍔犺浇浠诲姟鍒楄〃
   * @param {Boolean} refresh 鏄惁鍒锋柊
   */
  loadTaskList: function(refresh = false) {
    const self = this;
    
    // 璁剧疆加载状态    if (refresh) {
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
    
    // 鏋勫缓鏌ヨ鍙傛暟
    const params = {
      type: this.data.activeTab === 'all' ? undefined : this.data.activeTab,
      page: this.data.page,
      pageSize: this.data.pageSize
    };
    
    // 璋冪敤鏈嶅姟鑾峰彇浠诲姟鍒楄〃
    pointsService.getTasks(params)
      .then(res => {
        if (res.success) {
          const taskList = res.data.list || [];
          const hasMore = taskList.length >= this.data.pageSize;
          
          // 澶勭悊浠诲姟鏁版嵁
          const processedTasks = taskList.map(task => {
            return {
              ...task,
              progress: this.calculateTaskProgress(task),
              canReceive: this.canReceiveReward(task),
              isExpired: this.isTaskExpired(task)
            };
          });
          
          // 鏇存柊鏁版嵁
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
            title: res.message || '鑾峰彇浠诲姟鍒楄〃澶辫触',
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
        console.error('鑾峰彇浠诲姟鍒楄〃澶辫触:', err);
        wx.showToast({
          title: '缃戠粶閿欒锛岃閲嶈瘯',
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
   * 璁＄畻浠诲姟杩涘害
   * @param {Object} task 浠诲姟瀵硅薄
   * @returns {Number} 杩涘害鐧惧垎姣?   */
  calculateTaskProgress: function(task) {
    if (!task.targetCount || task.targetCount <= 0) {
      return 0;
    }
    
    const progress = Math.floor((task.currentCount / task.targetCount) * 100);
    return Math.min(progress, 100);
  },

  /**
   * 鍒ゆ柇鏄惁鍙互棰嗗彇濂栧姳
   * @param {Object} task 浠诲姟瀵硅薄
   * @returns {Boolean} 鏄惁鍙互棰嗗彇
   */
  canReceiveReward: function(task) {
    return task.status === 'completed' && !task.rewardReceived;
  },

  /**
   * 鍒ゆ柇浠诲姟鏄惁宸茶繃鏈?   * @param {Object} task 浠诲姟瀵硅薄
   * @returns {Boolean} 鏄惁宸茶繃鏈?   */
  isTaskExpired: function(task) {
    if (!task.expireTime) {
      return false;
    }
    
    return new Date(task.expireTime).getTime() < Date.now();
  },

  /**
   * 鏍囩鍒囨崲
   * @param {Object} e 浜嬩欢瀵硅薄
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
   * 鎵ц浠诲姟
   * @param {Object} e 浜嬩欢瀵硅薄
   */
  onTaskAction: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task) {
      return;
    }
    
    // 鏍规嵁浠诲姟绫诲瀷鎵ц涓嶅悓鎿嶄綔
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
          title: '鏈煡浠诲姟绫诲瀷',
          icon: 'none'
        });
    }
  },

  /**
   * 瀵艰埅鍒颁换鍔￠〉闈?   * @param {Object} task 浠诲姟瀵硅薄
   */
  navigateToTask: function(task) {
    if (!task.actionUrl) {
      wx.showToast({
        title: '浠诲姟閾炬帴鏃犳晥',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: task.actionUrl,
      fail: () => {
        wx.showToast({
          title: '椤甸潰璺宠浆澶辫触',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 鏄剧ず浠诲姟寮圭獥
   * @param {Object} task 浠诲姟瀵硅薄
   */
  showTaskPopup: function(task) {
    wx.showModal({
      title: task.name || '浠诲姟璇︽儏',
      content: task.description || '鏆傛棤浠诲姟鎻忚堪',
      showCancel: false,
      confirmText: '鎴戠煡閬撲簡',
      success: () => {
        // 鏍囪浠诲姟涓哄凡鏌ョ湅
        this.markTaskAsViewed(task.id);
      }
    });
  },

  /**
   * 鍒嗕韩浠诲姟
   * @param {Object} task 浠诲姟瀵硅薄
   */
  shareTask: function(task) {
    // 瑙﹀彂鍒嗕韩
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        // 鏍囪浠诲姟涓哄凡鍒嗕韩
        this.markTaskAsShared(task.id);
      }
    });
  },

  /**
   * 棰嗗彇浠诲姟濂栧姳
   * @param {Object} e 浜嬩欢瀵硅薄
   */
  onReceiveReward: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task || !this.canReceiveReward(task)) {
      return;
    }
    
    const self = this;
    
    wx.showLoading({
      title: '棰嗗彇涓?..',
      mask: true
    });
    
    pointsService.receiveTaskReward(taskId)
      .then(res => {
        wx.hideLoading();
        
        if (res.success) {
          // 鏇存柊浠诲姟鐘舵€?          const updatedTaskList = self.data.taskList.map(item => {
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
          
          // 鏄剧ず濂栧姳寮圭獥
          self.showRewardPopup(task);
          
          // 鍒锋柊浠诲姟缁熻
          self.loadTaskStats();
        } else {
          wx.showToast({
            title: res.message || '棰嗗彇澶辫触',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('棰嗗彇浠诲姟濂栧姳澶辫触:', err);
        wx.showToast({
          title: '缃戠粶閿欒锛岃閲嶈瘯',
          icon: 'none'
        });
      });
  },

  /**
   * 鏄剧ず濂栧姳寮圭獥
   * @param {Object} task 浠诲姟瀵硅薄
   */
  showRewardPopup: function(task) {
    wx.showModal({
      title: '鎭枩鑾峰緱濂栧姳',
      content: `鑾峰緱 ${task.points} 绉垎`,
      showCancel: false,
      confirmText: '鐭ラ亾浜?,
      success: () => {
        // 鍙互娣诲姞鍏朵粬鎿嶄綔锛屽璺宠浆鍒扮Н鍒嗘槑缁嗛〉闈?      }
    });
  },

  /**
   * 鏍囪浠诲姟涓哄凡鏌ョ湅
   * @param {String} taskId 浠诲姟ID
   */
  markTaskAsViewed: function(taskId) {
    pointsService.markTaskAsViewed(taskId)
      .then(res => {
        if (res.success) {
          // 鏇存柊浠诲姟鐘舵€?          const updatedTaskList = this.data.taskList.map(item => {
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
        console.error('鏍囪浠诲姟涓哄凡鏌ョ湅澶辫触:', err);
      });
  },

  /**
   * 鏍囪浠诲姟涓哄凡鍒嗕韩
   * @param {String} taskId 浠诲姟ID
   */
  markTaskAsShared: function(taskId) {
    pointsService.markTaskAsShared(taskId)
      .then(res => {
        if (res.success) {
          // 鏇存柊浠诲姟鐘舵€?          const updatedTaskList = this.data.taskList.map(item => {
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
          
          // 鍒锋柊浠诲姟缁熻
          this.loadTaskStats();
        }
      })
      .catch(err => {
        console.error('鏍囪浠诲姟涓哄凡鍒嗕韩澶辫触:', err);
      });
  },

  /**
   * 鏌ョ湅浠诲姟璇︽儏
   * @param {Object} e 浜嬩欢瀵硅薄
   */
  onViewTaskDetail: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task) {
      return;
    }
    
    wx.showModal({
      title: task.name || '浠诲姟璇︽儏',
      content: task.description || '鏆傛棤浠诲姟鎻忚堪',
      showCancel: false,
      confirmText: '鎴戠煡閬撲簡'
    });
  },

  /**
   * 椤甸潰鍒嗕韩
   */
  onShareAppMessage: function() {
    return {
      title: '蹇潵瀹屾垚绉垎浠诲姟锛岃耽鍙栦赴鍘氬鍔憋紒',
      path: '/pages/user/pointsTasks/pointsTasks',
      imageUrl: '/images/share-points-tasks.jpg'
    };
  }
});
