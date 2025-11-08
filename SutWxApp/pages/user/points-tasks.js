// 绉垎浠诲姟椤甸潰閫昏緫
const app = getApp();
const { showToast, showLoading, hideLoading } = app.global;
import { initI18n, t } from '../../utils/i18n';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    tasks: [], // 浠诲姟鍒楄〃
    loading: true, // 鍔犺浇鐘舵€?    error: null, // 閿欒淇℃伅
    taskProcessing: null, // 姝ｅ湪澶勭悊鐨勪换鍔D锛岄槻姝㈤噸澶嶇偣鍑?    selectedType: 'all', // 褰撳墠閫変腑鐨勪换鍔＄被鍨嬬瓫閫?    taskGroups: { // 浠诲姟鍒嗙粍
      once: [], // 涓€娆℃€т换鍔★紙鏂版墜浠诲姟锛?      daily: [], // 姣忔棩浠诲姟
      weekly: [], // 姣忓懆浠诲姟
      monthly: [] // 姣忔湀浠诲姟
    },
    t: t // 灏嗙炕璇戝嚱鏁版寕杞藉埌data涓緵wxml浣跨敤
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 鍒濆鍖栧璇█
    initI18n();
    
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'points_tasks'
    });
    
    // 鍔犺浇绉垎浠诲姟鏁版嵁
    this.loadTasks();
  },
  
  /**
   * 鏇存柊缈昏瘧鍑芥暟寮曠敤
   */
  updateTranslation() {
    this.setData({
      t: t
    });
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 姣忔鏄剧ず椤甸潰鏃跺埛鏂颁换鍔℃暟鎹?    this.loadTasks();
  },

  /**
   * 鍔犺浇绉垎浠诲姟鍒楄〃
   */
  async loadTasks() {
    try {
      // 鏄剧ず鍔犺浇鐘舵€?      this.setData({ loading: true, error: null });

      // 妫€鏌ョ櫥褰曠姸鎬?      if (!app.isLoggedIn()) {
        this.setData({ loading: false, error: t('login_required') });
        return;
      }

      // 鍑嗗璇锋眰鍙傛暟
      const params = {
        type: this.data.selectedType === 'all' ? undefined : this.data.selectedType,
        status: 'all',
        page: 1,
        pageSize: 50
      };

      // 鑾峰彇绉垎浠诲姟鍒楄〃
      const result = await app.services.points.getPointsTasks(params);
      const tasks = result.list || [];
      
      // 澶勭悊浠诲姟鏁版嵁锛屾坊鍔犲畬鎴愮姸鎬佺瓑淇℃伅
      const processedTasks = tasks.map(task => ({
        ...task,
        title: task.name, // 纭繚涓嶹XML涓娇鐢ㄧ殑瀛楁鍚嶄竴鑷?        category: this.getTaskCategory(task.type), // 灏嗕换鍔＄被鍨嬭浆鎹负鍒嗙被
        isCompleted: task.status === 'completed',
        isUnclaimed: task.status === 'unclaimed',
        isPending: task.status === 'pending',
        canComplete: task.status === 'unclaimed' || task.status === 'completed',
        progressText: task.totalSteps > 0 ? `${task.progress}/${task.totalSteps}` : '0/1'
      }));

      // 鎸夌被鍨嬪垎缁勪换鍔?      const taskGroups = {
        once: processedTasks.filter(task => task.type === 'once'),
        daily: processedTasks.filter(task => task.type === 'daily'),
        weekly: processedTasks.filter(task => task.type === 'weekly'),
        monthly: processedTasks.filter(task => task.type === 'monthly')
      };

      // 鏇存柊鏁版嵁
      this.setData({
        tasks: processedTasks,
        taskGroups,
        loading: false
      });
    } catch (error) {
      console.error('鍔犺浇绉垎浠诲姟澶辫触:', error);
      this.setData({
        loading: false,
        error: error.message || t('network_error')
      });
    }
  },

  /**
   * 鏍规嵁浠诲姟绫诲瀷鑾峰彇浠诲姟鍒嗙被
   * @param {string} type - 浠诲姟绫诲瀷
   * @returns {string} 浠诲姟鍒嗙被
   */
  getTaskCategory(type) {
    const categoryMap = {
      once: 'newbie',
      daily: 'daily',
      weekly: 'weekly',
      monthly: 'monthly'
    };
    return categoryMap[type] || 'other';
  },

  /**
   * 鍒囨崲浠诲姟绫诲瀷绛涢€?   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  switchTaskType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedType: type });
    this.loadTasks();
  },

  /**
   * 鑾峰彇浠诲姟璇︽儏
   * @param {string} taskId - 浠诲姟ID
   */
  async getTaskDetail(taskId) {
    try {
      showLoading(t('loading'));
      const taskDetail = await app.services.points.getTaskDetail(taskId);
      return taskDetail;
    } catch (error) {
      console.error('鑾峰彇浠诲姟璇︽儏澶辫触:', error);
      showToast(error.message || '鑾峰彇浠诲姟璇︽儏澶辫触');
      return null;
    } finally {
      hideLoading();
    }
  },

  /**
   * 鎻愪氦浠诲姟杩涘害
   * @param {string} taskId - 浠诲姟ID
   * @param {Object} progressData - 杩涘害鏁版嵁
   */
  async submitTaskProgress(taskId, progressData = {}) {
    try {
      showLoading(t('loading'));
      const result = await app.services.points.submitTaskProgress(taskId, progressData);
      showToast('浠诲姟杩涘害鏇存柊鎴愬姛');
      return result;
    } catch (error) {
      console.error('鎻愪氦浠诲姟杩涘害澶辫触:', error);
      showToast(error.message || '鎻愪氦浠诲姟杩涘害澶辫触');
      return null;
    } finally {
      hideLoading();
    }
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry() {
    this.loadTasks();
  },

  /**
   * 澶勭悊浠诲姟
   * @param {Object} e - 浜嬩欢瀵硅薄
   */
  handleTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // 濡傛灉浠诲姟宸插畬鎴愪笖涓嶆槸寰呴鍙栫姸鎬侊紝涓嶅仛浠讳綍鎿嶄綔
    if (task.isCompleted && !task.isUnclaimed) {
      showToast(t('task_completed'), 'none');
      return;
    }
    
    // 濡傛灉浠诲姟鍙互棰嗗彇濂栧姳
    if (task.isUnclaimed || task.status === 'completed') {
      this.claimTaskReward(taskId);
      return;
    }
    
    // 鏍规嵁浠诲姟绫诲瀷鎵ц涓嶅悓鎿嶄綔
    switch (task.type) {
      case 'signin':
        // 璺宠浆鍒扮鍒伴〉闈?        wx.navigateTo({
          url: '/pages/user/points-signin'
        });
        break;
      case 'comment':
      case 'review':
        // 璺宠浆鍒版枃绔犲垪琛ㄦ垨璇勮椤甸潰
        wx.navigateTo({
          url: '/pages/category/category'
        });
        break;
      case 'share':
        // 鎵ц鍒嗕韩鎿嶄綔
        this.handleShareTask(taskId);
        break;
      case 'profile':
        // 璺宠浆鍒颁釜浜鸿祫鏂欓〉闈?        wx.navigateTo({
          url: '/pages/user/profile/profile'
        });
        break;
      case 'purchase':
      case 'order':
        // 璺宠浆鍒板晢鍩庨椤?        wx.navigateTo({
          url: '/pages/shop/index'
        });
        break;
      case 'follow':
      case 'favorite':
        // 璺宠浆鍒板叧娉ㄩ〉闈?        wx.navigateTo({
          url: '/pages/user/following'
        });
        break;
      default:
        // 灏濊瘯鎻愪氦浠诲姟杩涘害
        this.submitTaskProgress(taskId);
    }
  },

  /**
   * 棰嗗彇浠诲姟濂栧姳
   * @param {string} taskId - 浠诲姟ID
   */
  async claimTaskReward(taskId) {
    try {
      // 闃叉閲嶅鐐瑰嚮
      if (this.data.taskProcessing === taskId) return;
      
      this.setData({ taskProcessing: taskId });
      showLoading(t('loading'));
      
      // 璋冪敤棰嗗彇濂栧姳API
      const result = await app.services.points.claimTaskReward(taskId);
      
      // 鏄剧ず鎴愬姛鎻愮ず
      showToast(t('points_reward_success', { points: result.points }));
      
      // 鏇存柊浠诲姟鐘舵€?      const updatedTasks = this.data.tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: 'completed',
            isCompleted: true,
            isUnclaimed: false,
            canComplete: false
          };
        }
        return task;
      });
      
      // 鏇存柊鍒嗙粍浠诲姟鍒楄〃
      const taskGroups = {
        once: updatedTasks.filter(task => task.type === 'once'),
        daily: updatedTasks.filter(task => task.type === 'daily'),
        weekly: updatedTasks.filter(task => task.type === 'weekly'),
        monthly: updatedTasks.filter(task => task.type === 'monthly')
      };
      
      this.setData({ 
        tasks: updatedTasks,
        taskGroups
      });
      
      // 瑙﹀彂椤甸潰浜嬩欢锛岄€氱煡鐖堕〉闈㈡洿鏂扮Н鍒嗕俊鎭?      const eventChannel = this.getOpenerEventChannel();
      if (eventChannel) {
        eventChannel.emit('refreshPoints', { points: result.totalPoints });
      }
      
    } catch (error) {
      console.error('棰嗗彇浠诲姟濂栧姳澶辫触:', error);
      showToast(error.message || '棰嗗彇浠诲姟濂栧姳澶辫触锛岃绋嶅悗閲嶈瘯');
    } finally {
      hideLoading();
      this.setData({ taskProcessing: null });
    }
  },

  /**
   * 澶勭悊鍒嗕韩浠诲姟
   * @param {string} taskId - 浠诲姟ID
   */
  handleShareTask(taskId) {
    // 璁剧疆鍒嗕韩鐘舵€侊紝璁板綍褰撳墠瑕佸畬鎴愮殑浠诲姟ID
    wx.setStorageSync('pendingShareTaskId', taskId);
    
    // 瑙﹀彂鍒嗕韩鎿嶄綔
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    showToast(t('share_task_description'), 'none');
  },

  /**
   * 椤甸潰鍒嗕韩
   */
  onShareAppMessage: function() {
    const pendingTaskId = wx.getStorageSync('pendingShareTaskId');
    
    return {
      title: t('app_slogan'),
      path: '/pages/index/index?task_id=' + pendingTaskId,
      imageUrl: '/images/share-cover.png',
      success: async () => {
        // 濡傛灉鏈夊緟瀹屾垚鐨勫垎浜换鍔★紝灏濊瘯棰嗗彇濂栧姳
        if (pendingTaskId) {
          try {
            // 鍏堟彁浜や换鍔¤繘搴?            await this.submitTaskProgress(pendingTaskId, { shared: true });
            // 鍐嶉鍙栧鍔?            await this.claimTaskReward(pendingTaskId);
            wx.removeStorageSync('pendingShareTaskId');
          } catch (error) {
            console.error('鍒嗕韩浠诲姟瀹屾垚澶辫触:', error);
          }
        }
      }
    };
  },

  /**
   * 璺宠浆鍒扮Н鍒嗗晢鍩?   */
  navigateToPointsMall() {
    wx.navigateTo({
      url: '/pages/user/points-mall'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗚鍒?   */
  navigateToPointsRules() {
    wx.navigateTo({
      url: '/pages/user/points-rules'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗘槑缁?   */
  navigateToPointsRecords() {
    wx.navigateTo({
      url: '/pages/user/points'
    });
  }
});
