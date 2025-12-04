/**
 * 文件名 tasks.js
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 
 */

// 缁夘垰鍨庢禒璇插妞ょ敻娼?const pointsService = require('../../../services/pointsService.js');

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    // 娴犺濮熺猾璇茬€风粵娑⑩偓?    taskTypes: [
      { key: 'all', name: '閸忋劑鍎存禒璇插', count: 0 },
      { key: 'once', name: '閺傜増澧滄禒璇插', count: 0 },
      { key: 'daily', name: '濮ｅ繑妫╂禒璇插', count: 0 },
      { key: 'weekly', name: '濮ｅ繐鎳嗘禒璇插', count: 0 },
      { key: 'monthly', name: '濮ｅ繑婀€娴犺濮?, count: 0 }
    ],
    currentType: 'all',
    
    // 娴犺濮熼悩鑸碘偓浣虹摣闁?    taskStatuses: [
      { key: 'all', name: '閸忋劑鍎撮悩鑸碘偓? },
      { key: 'pending', name: '閺堫亜鐣幋? },
      { key: 'completed', name: '瀹告彃鐣幋? },
      { key: 'unclaimed', name: '瀵板懘顣崣? }
    ],
    currentStatus: 'all',
    
    // 娴犺濮熼崚妤勩€?    taskList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    
    // 閻劍鍩涚粔顖氬瀻娣団剝浼?    userPoints: {
      availablePoints: 0,
      todayEarned: 0
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    // 閸旂姾娴囬悽銊﹀煕缁夘垰鍨庢穱鈩冧紖
    this.loadUserPoints();
    
    // 閸旂姾娴囨禒璇插閸掓銆?    this.loadTaskList(true);
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸掓繃顐煎〒鍙夌厠鐎瑰本鍨?   */
  onReady: function () {
    // 鐠佸墽鐤嗙€佃壈鍩呴弽蹇旂垼妫?    wx.setNavigationBarTitle({
      title: '缁夘垰鍨庢禒璇插'
    });
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 妞ょ敻娼伴弰鍓с仛閺冭泛鍩涢弬鐗堟殶閹?    this.loadUserPoints();
    this.loadTaskList(true);
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
    this.loadTaskList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadTaskList(false);
    }
  },

  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   */
  onShareAppMessage: function () {
    return {
      title: '閸嬫矮鎹㈤崝陇绂嬬粔顖氬瀻閿涘苯銈界粈鑲╃搼娴ｇ姵娼甸幏?,
      path: '/pages/user/points/tasks/tasks'
    };
  },

  /**
   * 閸旂姾娴囬悽銊﹀煕缁夘垰鍨庢穱鈩冧紖
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
      console.error('閸旂姾娴囬悽銊﹀煕缁夘垰鍨庢穱鈩冧紖婢惰精瑙?', error);
    }
  },

  /**
   * 閸旂姾娴囨禒璇插閸掓銆?   */
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
        
        // 閺囧瓨鏌婃禒璇插缁鐎风拋鈩冩殶
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
          title: result.message || '閸旂姾娴囨禒璇插婢惰精瑙?,
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('閸旂姾娴囨禒璇插閸掓銆冩径杈Е:', error);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸',
        icon: 'none'
      });
    }
  },

  /**
   * 閸掑洦宕叉禒璇插缁鐎?   */
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
   * 閸掑洦宕叉禒璇插閻樿埖鈧?   */
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
   * 鐎瑰本鍨氭禒璇插
   */
  completeTask: async function(e) {
    const taskId = e.currentTarget.dataset.id;
    
    try {
      wx.showLoading({
        title: '濮濓絽婀€瑰本鍨氭禒璇插...',
      });
      
      const result = await pointsService.completeTask(taskId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: '娴犺濮熺€瑰本鍨?,
          icon: 'success'
        });
        
        // 閸掗攱鏌婃禒璇插閸掓銆?        this.loadTaskList(true);
        
        // 閸掗攱鏌婇悽銊﹀煕缁夘垰鍨?        this.loadUserPoints();
      } else {
        wx.showToast({
          title: result.message || '鐎瑰本鍨氭禒璇插婢惰精瑙?,
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('鐎瑰本鍨氭禒璇插婢惰精瑙?', error);
      wx.showToast({
        title: '缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸',
        icon: 'none'
      });
    }
  },

  /**
   * 妫板棗褰囨禒璇插婵傛牕濮?   */
  claimTaskReward: async function(e) {
    const taskId = e.currentTarget.dataset.id;
    
    try {
      wx.showLoading({
        title: '濮濓絽婀０鍡楀絿婵傛牕濮?..',
      });
      
      const result = await pointsService.claimTaskReward(taskId);
      
      wx.hideLoading();
      
      if (result.success) {
        wx.showToast({
          title: `閼惧嘲绶?{result.data.points}缁夘垰鍨巂,
          icon: 'success'
        });
        
        // 閸掗攱鏌婃禒璇插閸掓銆?        this.loadTaskList(true);
        
        // 閸掗攱鏌婇悽銊﹀煕缁夘垰鍨?        this.loadUserPoints();
      } else {
        wx.showToast({
          title: result.message || '妫板棗褰囨總鏍уС婢惰精瑙?,
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('妫板棗褰囨禒璇插婵傛牕濮虫径杈Е:', error);
      wx.showToast({
        title: '缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸',
        icon: 'none'
      });
    }
  },

  /**
   * 鐠哄疇娴嗛崚棰佹崲閸斅ゎ嚊閹懘銆?   */
  goToTaskDetail: function(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/points/taskDetail/taskDetail?id=${taskId}`
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡涖€夐棃?   */
  goToPoints: function() {
    wx.switchTab({
      url: '/pages/user/points/points'
    });
  },

  /**
   * 閺嶇厧绱￠崠鏍︽崲閸斅ょ箻鎼?   */
  formatTaskProgress: function(current, target) {
    return `${current}/${target}`;
  },

  /**
   * 鐠侊紕鐣绘禒璇插鏉╂稑瀹抽惂鎯у瀻濮?   */
  getTaskProgressPercent: function(current, target) {
    if (!target || target <= 0) return 0;
    const percent = (current / target) * 100;
    return Math.min(percent, 100);
  }
});
