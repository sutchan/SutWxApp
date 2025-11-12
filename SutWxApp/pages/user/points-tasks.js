// 积分任务页面逻辑处理
const app = getApp();
const { showToast, showLoading, hideLoading } = app.global;
import { initI18n, t } from '../../utils/i18n';

Page({
  /**
   * 页面数据
   */
  data: {
    tasks: [], // 任务列表
    loading: true, // 加载状态
    error: null, // 错误信息
    taskProcessing: null, // 正在处理的任务ID
    selectedType: 'all', // 选中的任务类型
    taskGroups: { // 任务分组
      once: [], // 一次性任务
      daily: [], // 每日任务
      weekly: [], // 每周任务
      monthly: [] // 每月任务
    },
    t: t // 翻译函数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 初始化国际化
    initI18n();
    
    // 记录页面访问
    if (app.analyticsService && app.analyticsService.track) {
      app.analyticsService.track('page_view', {
        page: 'points_tasks'
      });
    }
    
    // 加载任务列表
    this.loadTasks();
  },
  
  /**
   * 更新翻译
   */
  updateTranslation() {
    this.setData({
      t: t
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时重新加载任务，确保数据最新
    this.loadTasks();
  },

  /**
   * 加载任务列表
   * @param {boolean} forceRefresh - 是否强制刷新（不使用缓存）
   */
  async loadTasks(forceRefresh = false) {
    try {
      // 设置加载状态
      this.setData({ loading: true, error: null });

      // 检查用户是否登录
      if (!app.isLoggedIn()) {
        this.setData({ loading: false, error: t('login_required') });
        return;
      }

      // 记录加载行为
      if (app.analyticsService && app.analyticsService.track) {
        app.analyticsService.track('load_tasks', {
          type: this.data.selectedType,
          forceRefresh
        });
      }

      // 尝试从缓存获取数据（如果不强制刷新）
      const cacheKey = `tasks_${this.data.selectedType}`;
      if (!forceRefresh && app.cacheService && app.cacheService.get) {
        const cachedData = app.cacheService.get(cacheKey);
        if (cachedData) {
          console.log('使用缓存的任务数据');
          this.setData({
            tasks: cachedData.tasks,
            taskGroups: cachedData.taskGroups,
            loading: false
          });
          // 异步更新缓存数据
          this.refreshTasksInBackground(cacheKey);
          return;
        }
      }

      // 构建请求参数
      const params = {
        type: this.data.selectedType === 'all' ? undefined : this.data.selectedType,
        status: 'all',
        page: 1,
        pageSize: 50
      };

      // 调用API获取任务列表
      const result = await app.services.points.getPointsTasks(params);
      const tasks = result.list || [];
      
      // 处理任务数据，转换格式便于展示
      let processedTasks = tasks.map(task => ({
        ...task,
        title: task.name || t('unnamed_task'), // 确保任务名称正确显示
        category: this.getTaskCategory(task.type), // 获取任务分类
        isCompleted: task.status === 'completed',
        isUnclaimed: task.status === 'unclaimed',
        isPending: task.status === 'pending',
        canComplete: task.status === 'unclaimed' || task.status === 'completed',
        progressText: task.totalSteps > 0 ? `${task.progress}/${task.totalSteps}` : '0/1',
        // 排序权重，优先级：可领取 > 可完成 > 进行中 > 已完成
        sortWeight: this.getTaskSortWeight(task)
      }));

      // 按优先级排序
      processedTasks = this.sortTasks(processedTasks);

      // 按类型分组任务并排序
      const taskGroups = {
        once: this.sortTasks(processedTasks.filter(task => task.type === 'once')),
        daily: this.sortTasks(processedTasks.filter(task => task.type === 'daily')),
        weekly: this.sortTasks(processedTasks.filter(task => task.type === 'weekly')),
        monthly: this.sortTasks(processedTasks.filter(task => task.type === 'monthly'))
      };

      // 更新数据
      this.setData({
        tasks: processedTasks,
        taskGroups,
        loading: false
      });

      // 缓存数据（如果有缓存服务）
      if (app.cacheService && app.cacheService.set) {
        app.cacheService.set(cacheKey, {
          tasks: processedTasks,
          taskGroups
        }, 5 * 60 * 1000); // 缓存5分钟
      }

      // 记录加载成功
      if (app.analyticsService && app.analyticsService.track) {
        app.analyticsService.track('tasks_loaded', {
          count: tasks.length,
          type: this.data.selectedType
        });
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
      
      // 记录加载失败
      if (app.analyticsService && app.analyticsService.track) {
        app.analyticsService.track('tasks_load_failed', {
          error: error.message || 'unknown',
          type: this.data.selectedType
        });
      }
      
      this.setData({
        loading: false,
        error: error.message || t('network_error')
      });
    }
  },
  
  /**
   * 获取任务排序权重
   * @param {Object} task - 任务对象
   * @returns {number} 排序权重（数字越小，优先级越高）
   */
  getTaskSortWeight(task) {
    if (task.status === 'unclaimed') return 0; // 可领取奖励
    if (task.status === 'pending') {
      // 计算进度比例，进度高的任务排在前面
      const progressRatio = task.totalSteps > 0 ? (task.progress / task.totalSteps) : 0;
      return 100 - (progressRatio * 100);
    }
    if (task.status === 'completed') return 200; // 已完成
    return 300; // 其他状态
  },
  
  /**
   * 排序任务
   * @param {Array} tasks - 任务列表
   * @returns {Array} 排序后的任务列表
   */
  sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
      // 先按权重排序
      if (a.sortWeight !== b.sortWeight) {
        return a.sortWeight - b.sortWeight;
      }
      // 权重相同时，按创建时间倒序
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  },
  
  /**
   * 在后台刷新任务数据
   * @param {string} cacheKey - 缓存键
   */
  async refreshTasksInBackground(cacheKey) {
    try {
      // 构建请求参数
      const params = {
        type: this.data.selectedType === 'all' ? undefined : this.data.selectedType,
        status: 'all',
        page: 1,
        pageSize: 50
      };

      // 调用API获取任务列表
      const result = await app.services.points.getPointsTasks(params);
      const tasks = result.list || [];
      
      // 处理任务数据
      let processedTasks = tasks.map(task => ({
        ...task,
        title: task.name || t('unnamed_task'),
        category: this.getTaskCategory(task.type),
        isCompleted: task.status === 'completed',
        isUnclaimed: task.status === 'unclaimed',
        isPending: task.status === 'pending',
        canComplete: task.status === 'unclaimed' || task.status === 'completed',
        progressText: task.totalSteps > 0 ? `${task.progress}/${task.totalSteps}` : '0/1',
        sortWeight: this.getTaskSortWeight(task)
      }));

      // 排序
      processedTasks = this.sortTasks(processedTasks);

      // 按类型分组并排序
      const taskGroups = {
        once: this.sortTasks(processedTasks.filter(task => task.type === 'once')),
        daily: this.sortTasks(processedTasks.filter(task => task.type === 'daily')),
        weekly: this.sortTasks(processedTasks.filter(task => task.type === 'weekly')),
        monthly: this.sortTasks(processedTasks.filter(task => task.type === 'monthly'))
      };

      // 更新缓存
      if (app.cacheService && app.cacheService.set) {
        app.cacheService.set(cacheKey, {
          tasks: processedTasks,
          taskGroups
        }, 5 * 60 * 1000); // 缓存5分钟
      }

      // 判断是否需要更新UI（如果发现可领取奖励的任务）
      const hasNewUnclaimedTasks = taskGroups.once.some(t => t.status === 'unclaimed') ||
                                  taskGroups.daily.some(t => t.status === 'unclaimed') ||
                                  taskGroups.weekly.some(t => t.status === 'unclaimed') ||
                                  taskGroups.monthly.some(t => t.status === 'unclaimed');

      if (hasNewUnclaimedTasks) {
        // 使用轻微延迟后更新UI，避免突兀的变化
        setTimeout(() => {
          this.setData({ tasks: processedTasks, taskGroups });
          showToast(t('new_rewards_available'), 'none');
        }, 1000);
      }
    } catch (error) {
      console.warn('后台刷新任务数据失败:', error);
      // 静默失败，不影响用户体验
    }
  },

  /**
   * 根据任务类型获取分类
   * @param {string} type - 任务类型
   * @returns {string} 任务分类
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
   * 切换任务类型筛选
   * @param {Object} e - 事件对象
   */
  switchTaskType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedType: type });
    this.loadTasks();
  },

  /**
   * 获取任务详情
   * @param {string} taskId - 任务ID
   */
  async getTaskDetail(taskId) {
    try {
      showLoading(t('loading'));
      const taskDetail = await app.services.points.getTaskDetail(taskId);
      return taskDetail;
    } catch (error) {
      console.error('获取任务详情失败:', error);
      showToast(error.message || t('get_task_detail_failed'));
      return null;
    } finally {
      hideLoading();
    }
  },

  /**
   * 提交任务进度
   * @param {string} taskId - 任务ID
   * @param {Object} progressData - 进度数据
   * @returns {Promise<Object|null>} 提交结果
   */
  async submitTaskProgress(taskId, progressData = {}) {
    try {
      // 防止重复提交
      if (this.data.taskProcessing === taskId) return null;
      
      this.setData({ taskProcessing: taskId });
      showLoading(t('processing'));
      
      // 记录提交进度行为
      if (app.analyticsService && app.analyticsService.track) {
        app.analyticsService.track('submit_task_progress', {
          taskId,
          progressType: Object.keys(progressData)[0] || 'default'
        });
      }
      
      // 调用API提交进度
      const result = await app.services.points.submitTaskProgress(taskId, progressData);
      
      // 显示成功提示
      showToast(t('task_progress_update_success'));
      
      // 如果任务已完成，自动更新本地任务状态
      if (result && result.status === 'completed') {
        this.updateTaskStatus(taskId, 'completed');
      }
      
      return result;
    } catch (error) {
      console.error('提交任务进度失败:', error);
      showToast(error.message || t('submit_task_progress_failed'));
      return null;
    } finally {
      hideLoading();
      this.setData({ taskProcessing: null });
    }
  },
  
  /**
   * 更新任务状态
   * @param {string} taskId - 任务ID
   * @param {string} status - 新状态
   */
  updateTaskStatus(taskId, status) {
    try {
      const updatedTasks = this.data.tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status,
            isCompleted: status === 'completed',
            isUnclaimed: status === 'completed' && !task.isCompleted,
            canComplete: status !== 'completed'
          };
        }
        return task;
      });
      
      // 更新任务分组
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
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  },

  /**
   * 重试加载
   */
  onRetry() {
    this.loadTasks(true); // 强制刷新，不使用缓存
  },

  /**
   * 处理任务点击事件
   * @param {Object} e - 事件对象
   */
  handleTask(e) {
    try {
      const taskId = e.currentTarget.dataset.id;
      const task = this.data.tasks.find(t => t.id === taskId);
      
      if (!task) {
        showToast(t('task_not_found'));
        return;
      }
      
      // 记录任务点击行为
      if (app.analyticsService && app.analyticsService.track) {
        app.analyticsService.track('task_click', {
          taskId,
          taskType: task.type,
          taskStatus: task.status
        });
      }
      
      // 如果任务已完成且已领取，则提示用户
      if (task.isCompleted && !task.isUnclaimed) {
        showToast(t('task_completed'), 'none');
        return;
      }
      
      // 如果任务可领取，则调用领取奖励方法
      if (task.isUnclaimed || task.status === 'completed') {
        this.claimTaskReward(taskId);
        return;
      }
      
      // 任务导航配置
      const taskNavigation = {
        signin: {
          url: '/pages/user/points-signin',
          label: t('signin_task')
        },
        comment: {
          url: '/pages/category/category',
          label: t('comment_task')
        },
        review: {
          url: '/pages/category/category',
          label: t('review_task')
        },
        profile: {
          url: '/pages/user/profile/profile',
          label: t('profile_task')
        },
        purchase: {
          url: '/pages/shop/index',
          label: t('purchase_task')
        },
        order: {
          url: '/pages/shop/index',
          label: t('order_task')
        },
        follow: {
          url: '/pages/user/following',
          label: t('follow_task')
        },
        favorite: {
          url: '/pages/user/following',
          label: t('favorite_task')
        }
      };
      
      // 根据任务类型执行不同操作
      if (task.type === 'share') {
        // 处理分享任务
        this.handleShareTask(taskId);
      } else if (taskNavigation[task.type]) {
        // 跳转到相应页面
        const navConfig = taskNavigation[task.type];
        wx.navigateTo({
          url: navConfig.url,
          success: () => {
            // 记录导航成功
            if (app.analyticsService && app.analyticsService.track) {
              app.analyticsService.track('task_navigate', {
                taskId,
                taskType: task.type,
                targetUrl: navConfig.url
              });
            }
          },
          fail: (error) => {
            console.error('任务页面导航失败:', error);
            showToast(t('navigation_failed'));
          }
        });
      } else {
        // 直接提交任务进度
        this.submitTaskProgress(taskId);
      }
    } catch (error) {
      console.error('处理任务点击失败:', error);
      showToast(t('operation_failed'));
    }
  },
  
  /**
   * 领取任务奖励
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object|null>} 奖励信息对象，包含points和totalPoints
   */
  async claimTaskReward(taskId) {
    try {
      // 防止重复点击
      if (this.data.taskProcessing === taskId) return null;
      
      this.setData({ taskProcessing: taskId });
      
      // 如果外部调用者已经显示了加载提示，则不再重复显示
      // showLoading(t('loading'));
      
      // 调用API领取奖励
      const result = await app.services.points.claimTaskReward(taskId);
      
      // 记录领取奖励行为
      if (app.analyticsService && app.analyticsService.track) {
        app.analyticsService.track('claim_task_reward', {
          taskId,
          points: result.points
        });
      }
      
      // 显示领取成功提示
      // 在外部调用时，由外部处理提示信息
      if (!wx.getStorageSync('pendingShareTaskId')) {
        showToast(t('points_reward_success', { points: result.points }));
      }
      
      // 更新本地任务状态
      const updatedTasks = this.data.tasks.map(task => {
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
      
      // 更新任务分组
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
      
      // 通知父页面刷新积分
      const eventChannel = this.getOpenerEventChannel();
      if (eventChannel) {
        eventChannel.emit('refreshPoints', { points: result.totalPoints });
      }
      
      // 返回奖励信息
      return {
        points: result.points,
        totalPoints: result.totalPoints
      };
      
    } catch (error) {
      console.error('领取任务奖励失败:', error);
      
      // 在外部调用时，错误处理由外部完成
      if (!wx.getStorageSync('pendingShareTaskId')) {
        showToast(error.message || t('claim_reward_failed'));
      }
      
      return null;
    } finally {
      // hideLoading(); // 由调用者负责隐藏加载提示
      this.setData({ taskProcessing: null });
    }
  },

  /**
   * 处理分享任务
   * @param {string} taskId - 任务ID
   */
  handleShareTask(taskId) {
    try {
      // 保存待完成的分享任务ID
      wx.setStorageSync('pendingShareTaskId', taskId);
      
      // 记录分享行为
      if (app.analyticsService && app.analyticsService.track) {
        app.analyticsService.track('share_task_start', { taskId });
      }
      
      // 显示分享菜单
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      
      // 显示提示信息
      wx.showModal({
        title: t('share_task_title') || '分享任务',
        content: t('share_task_description'),
        showCancel: false
      });
    } catch (error) {
      console.error('处理分享任务失败:', error);
      showToast(t('network_error'));
    }
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function() {
    const pendingTaskId = wx.getStorageSync('pendingShareTaskId');
    
    return {
      title: t('app_slogan') || 'Sut微信小程序',
      path: `/pages/index/index?task_id=${pendingTaskId || ''}`,
      imageUrl: '/images/share-cover.png',
      success: async (res) => {
        // 记录分享成功行为
        if (app.analyticsService && app.analyticsService.track) {
          app.analyticsService.track('share_task_success', {
            taskId: pendingTaskId,
            shareType: 'appMessage'
          });
        }
        
        // 分享成功后处理任务进度和奖励领取
        if (pendingTaskId) {
          try {
            showLoading(t('processing'));
            
            // 更新分享进度
            await this.submitTaskProgress(pendingTaskId, { shared: true });
            
            // 领取分享奖励
            const result = await this.claimTaskReward(pendingTaskId);
            
            // 清除待处理任务ID
            wx.removeStorageSync('pendingShareTaskId');
            
            hideLoading();
            
            // 显示成功提示
            if (result && result.points) {
              showToast(`${t('points_reward_success')} ${result.points} ${t('points_unit')}`);
            } else {
              showToast(t('task_completed'));
            }
          } catch (error) {
            hideLoading();
            console.error('处理分享任务失败:', error);
            showToast(t('operation_failed'));
          }
        }
      },
      fail: (error) => {
        console.error('分享失败:', error);
        
        // 记录分享失败行为
        if (app.analyticsService && app.analyticsService.track) {
          app.analyticsService.track('share_task_failed', {
            taskId: pendingTaskId,
            error: error.errMsg
          });
        }
      }
    };
  },

  /**
   * 跳转到积分商城
   */
  navigateToPointsMall() {
    // 记录用户行为
    if (app.analyticsService && app.analyticsService.track) {
      app.analyticsService.track('navigate_points_mall');
    }
    
    wx.navigateTo({
      url: '/pages/user/points-mall'
    });
  },

  /**
   * 跳转到积分规则页面
   */
  navigateToPointsRules() {
    // 记录用户行为
    if (app.analyticsService && app.analyticsService.track) {
      app.analyticsService.track('navigate_points_rules');
    }
    
    wx.navigateTo({
      url: '/pages/user/points-rules'
    });
  },

  /**
   * 跳转到积分记录页面
   */
  navigateToPointsRecords() {
    // 记录用户行为
    if (app.analyticsService && app.analyticsService.track) {
      app.analyticsService.track('navigate_points_records');
    }
    
    wx.navigateTo({
      url: '/pages/user/points'
    });
  }
});