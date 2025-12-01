/**
 * 鏂囦欢鍚? pointsTasks.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 缁夘垰鍨庢禒璇插妞ょ敻娼? */
const app = getApp();
const pointsService = require('../../services/pointsService');

Page({
  data: {
    // 娴犺濮熺猾璇茬€?    activeTab: 'all', // all/daily/weekly/monthly/special
    tabs: [
      { key: 'all', name: '閸忋劑鍎? },
      { key: 'daily', name: '濮ｅ繑妫╂禒璇插' },
      { key: 'weekly', name: '濮ｅ繐鎳嗘禒璇插' },
      { key: 'monthly', name: '濮ｅ繑婀€娴犺濮? },
      { key: 'special', name: '閻楄鐣╂禒璇插' }
    ],
    
    // 娴犺濮熼崚妤勩€?    taskList: [],
    
    // 加载状态   loading: true,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    
    // 閸掑棝銆夐崣鍌涙殶
    page: 1,
    pageSize: 20,
    
    // 娴犺濮熺紒鐔活吀
    taskStats: {
      total: 0,
      completed: 0,
      pending: 0,
      totalPoints: 0
    }
  },

  /**
   * 妞ょ敻娼伴崝鐘烘祰
   */
  onLoad: function(options) {
    // 娴犲骸寮弫棰佽厬閼惧嘲褰囬崚婵嗩潗閺嶅洨顒?    if (options && options.tab) {
      this.setData({
        activeTab: options.tab
      });
    }
    
    this.loadTaskStats();
    this.loadTaskList(true);
  },

  /**
   * 妞ょ敻娼伴弰鍓с仛
   */
  onShow: function() {
    // 濮ｅ繑顐奸弰鍓с仛妞ょ敻娼伴弮璺哄煕閺傜増鏆熼幑?    this.refreshData();
  },

  /**
   * 妞ょ敻娼伴梾鎰
   */
  onHide: function() {
    // 妞ょ敻娼伴梾鎰閺冨墎娈戞径鍕倞
  },

  /**
   * 妞ょ敻娼伴崡姝屾祰
   */
  onUnload: function() {
    // 妞ょ敻娼伴崡姝屾祰閺冨墎娈戞径鍕倞
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    this.refreshData();
  },

  /**
   * 娑撳﹥濯洪崝鐘烘祰閺囨潙顦?   */
  onReachBottom: function() {
    if (!this.data.loadingMore && this.data.hasMore) {
      this.loadTaskList(false);
    }
  },

  /**
   * 閸掗攱鏌婇弫鐗堝祦
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
   * 閸旂姾娴囨禒璇插缂佺喕顓?   */
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
        console.error('閼惧嘲褰囨禒璇插缂佺喕顓告径杈Е:', err);
      });
  },

  /**
   * 閸旂姾娴囨禒璇插閸掓銆?   * @param {Boolean} refresh 閺勵垰鎯侀崚閿嬫煀
   */
  loadTaskList: function(refresh = false) {
    const self = this;
    
    // 鐠佸墽鐤嗗姞杞界姸鎬?   if (refresh) {
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
    
    // 閺嬪嫬缂撻弻銉嚄閸欏倹鏆?    const params = {
      type: this.data.activeTab === 'all' ? undefined : this.data.activeTab,
      page: this.data.page,
      pageSize: this.data.pageSize
    };
    
    // 鐠嬪啰鏁ら張宥呭閼惧嘲褰囨禒璇插閸掓銆?    pointsService.getTasks(params)
      .then(res => {
        if (res.success) {
          const taskList = res.data.list || [];
          const hasMore = taskList.length >= this.data.pageSize;
          
          // 婢跺嫮鎮婃禒璇插閺佺増宓?          const processedTasks = taskList.map(task => {
            return {
              ...task,
              progress: this.calculateTaskProgress(task),
              canReceive: this.canReceiveReward(task),
              isExpired: this.isTaskExpired(task)
            };
          });
          
          // 閺囧瓨鏌婇弫鐗堝祦
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
            title: res.message || '閼惧嘲褰囨禒璇插閸掓銆冩径杈Е',
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
        console.error('閼惧嘲褰囨禒璇插閸掓銆冩径杈Е:', err);
        wx.showToast({
          title: '缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸',
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
   * 鐠侊紕鐣绘禒璇插鏉╂稑瀹?   * @param {Object} task 娴犺濮熺€电钖?   * @returns {Number} 鏉╂稑瀹抽惂鎯у瀻濮?   */
  calculateTaskProgress: function(task) {
    if (!task.targetCount || task.targetCount <= 0) {
      return 0;
    }
    
    const progress = Math.floor((task.currentCount / task.targetCount) * 100);
    return Math.min(progress, 100);
  },

  /**
   * 閸掋倖鏌囬弰顖氭儊閸欘垯浜掓０鍡楀絿婵傛牕濮?   * @param {Object} task 娴犺濮熺€电钖?   * @returns {Boolean} 閺勵垰鎯侀崣顖欎簰妫板棗褰?   */
  canReceiveReward: function(task) {
    return task.status === 'completed' && !task.rewardReceived;
  },

  /**
   * 閸掋倖鏌囨禒璇插閺勵垰鎯佸鑼剁箖閺?   * @param {Object} task 娴犺濮熺€电钖?   * @returns {Boolean} 閺勵垰鎯佸鑼剁箖閺?   */
  isTaskExpired: function(task) {
    if (!task.expireTime) {
      return false;
    }
    
    return new Date(task.expireTime).getTime() < Date.now();
  },

  /**
   * 閺嶅洨顒烽崚鍥ㄥ床
   * @param {Object} e 娴滃娆㈢€电钖?   */
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
   * 閹笛嗩攽娴犺濮?   * @param {Object} e 娴滃娆㈢€电钖?   */
  onTaskAction: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task) {
      return;
    }
    
    // 閺嶈宓佹禒璇插缁鐎烽幍褑顢戞稉宥呮倱閹垮秳缍?    switch (task.actionType) {
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
          title: '閺堫亞鐓℃禒璇插缁鐎?,
          icon: 'none'
        });
    }
  },

  /**
   * 鐎佃壈鍩呴崚棰佹崲閸旓繝銆夐棃?   * @param {Object} task 娴犺濮熺€电钖?   */
  navigateToTask: function(task) {
    if (!task.actionUrl) {
      wx.showToast({
        title: '娴犺濮熼柧鐐复閺冪姵鏅?,
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: task.actionUrl,
      fail: () => {
        wx.showToast({
          title: '妞ょ敻娼扮捄瀹犳祮婢惰精瑙?,
          icon: 'none'
        });
      }
    });
  },

  /**
   * 閺勫墽銇氭禒璇插瀵湱鐛?   * @param {Object} task 娴犺濮熺€电钖?   */
  showTaskPopup: function(task) {
    wx.showModal({
      title: task.name || '娴犺濮熺拠锔藉剰',
      content: task.description || '閺嗗倹妫ゆ禒璇插閹诲繗鍫?,
      showCancel: false,
      confirmText: '閹存垹鐓￠柆鎾茬啊',
      success: () => {
        // 閺嶅洩顔囨禒璇插娑撳搫鍑￠弻銉ф箙
        this.markTaskAsViewed(task.id);
      }
    });
  },

  /**
   * 閸掑棔闊╂禒璇插
   * @param {Object} task 娴犺濮熺€电钖?   */
  shareTask: function(task) {
    // 鐟欙箑褰傞崚鍡曢煩
    wx.showShareMenu({
      withShareTicket: true,
      success: () => {
        // 閺嶅洩顔囨禒璇插娑撳搫鍑￠崚鍡曢煩
        this.markTaskAsShared(task.id);
      }
    });
  },

  /**
   * 妫板棗褰囨禒璇插婵傛牕濮?   * @param {Object} e 娴滃娆㈢€电钖?   */
  onReceiveReward: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task || !this.canReceiveReward(task)) {
      return;
    }
    
    const self = this;
    
    wx.showLoading({
      title: '妫板棗褰囨稉?..',
      mask: true
    });
    
    pointsService.receiveTaskReward(taskId)
      .then(res => {
        wx.hideLoading();
        
        if (res.success) {
          // 閺囧瓨鏌婃禒璇插閻樿埖鈧?          const updatedTaskList = self.data.taskList.map(item => {
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
          
          // 閺勫墽銇氭總鏍уС瀵湱鐛?          self.showRewardPopup(task);
          
          // 閸掗攱鏌婃禒璇插缂佺喕顓?          self.loadTaskStats();
        } else {
          wx.showToast({
            title: res.message || '妫板棗褰囨径杈Е',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('妫板棗褰囨禒璇插婵傛牕濮虫径杈Е:', err);
        wx.showToast({
          title: '缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸',
          icon: 'none'
        });
      });
  },

  /**
   * 閺勫墽銇氭總鏍уС瀵湱鐛?   * @param {Object} task 娴犺濮熺€电钖?   */
  showRewardPopup: function(task) {
    wx.showModal({
      title: '閹厼鏋╅懢宄扮繁婵傛牕濮?,
      content: `閼惧嘲绶?${task.points} 缁夘垰鍨巂,
      showCancel: false,
      confirmText: '閻儵浜炬禍?,
      success: () => {
        // 閸欘垯浜掑ǎ璇插閸忔湹绮幙宥勭稊閿涘苯顩х捄瀹犳祮閸掓壆袧閸掑棙妲戠紒鍡涖€夐棃?      }
    });
  },

  /**
   * 閺嶅洩顔囨禒璇插娑撳搫鍑￠弻銉ф箙
   * @param {String} taskId 娴犺濮烮D
   */
  markTaskAsViewed: function(taskId) {
    pointsService.markTaskAsViewed(taskId)
      .then(res => {
        if (res.success) {
          // 閺囧瓨鏌婃禒璇插閻樿埖鈧?          const updatedTaskList = this.data.taskList.map(item => {
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
        console.error('閺嶅洩顔囨禒璇插娑撳搫鍑￠弻銉ф箙婢惰精瑙?', err);
      });
  },

  /**
   * 閺嶅洩顔囨禒璇插娑撳搫鍑￠崚鍡曢煩
   * @param {String} taskId 娴犺濮烮D
   */
  markTaskAsShared: function(taskId) {
    pointsService.markTaskAsShared(taskId)
      .then(res => {
        if (res.success) {
          // 閺囧瓨鏌婃禒璇插閻樿埖鈧?          const updatedTaskList = this.data.taskList.map(item => {
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
          
          // 閸掗攱鏌婃禒璇插缂佺喕顓?          this.loadTaskStats();
        }
      })
      .catch(err => {
        console.error('閺嶅洩顔囨禒璇插娑撳搫鍑￠崚鍡曢煩婢惰精瑙?', err);
      });
  },

  /**
   * 閺屻儳婀呮禒璇插鐠囷附鍎?   * @param {Object} e 娴滃娆㈢€电钖?   */
  onViewTaskDetail: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(item => item.id === taskId);
    
    if (!task) {
      return;
    }
    
    wx.showModal({
      title: task.name || '娴犺濮熺拠锔藉剰',
      content: task.description || '閺嗗倹妫ゆ禒璇插閹诲繗鍫?,
      showCancel: false,
      confirmText: '閹存垹鐓￠柆鎾茬啊'
    });
  },

  /**
   * 妞ょ敻娼伴崚鍡曢煩
   */
  onShareAppMessage: function() {
    return {
      title: '韫囶偅娼电€瑰本鍨氱粔顖氬瀻娴犺濮熼敍宀冭€介崣鏍﹁荡閸樻艾顨涢崝鎲嬬磼',
      path: '/pages/user/pointsTasks/pointsTasks',
      imageUrl: '/images/share-points-tasks.jpg'
    };
  }
});
