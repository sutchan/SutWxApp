const pointsTasksPage = require('../../../SutWxApp/pages/user/points-tasks');
const pointsService = require('../../../SutWxApp/utils/points-service');

// 妯℃嫙寰俊灏忕▼搴廇PI
const wx = {
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  navigateTo: jest.fn(),
  getUserProfile: jest.fn(),
  login: jest.fn()
};

global.wx = wx;

// 妯℃嫙pointsService
jest.mock('../../../SutWxApp/utils/points-service', () => ({
  getPointsTasks: jest.fn(),
  submitTaskProgress: jest.fn(),
  claimTaskReward: jest.fn(),
  handleShareTask: jest.fn()
}));

// 妯℃嫙i18n
global.t = jest.fn(key => key);

describe('Points Tasks Page', () => {
  let page;

  beforeEach(() => {
    // 閲嶇疆鎵€鏈夋ā鎷熷嚱鏁扮殑璋冪敤鍘嗗彶
    jest.clearAllMocks();
    
    // 鍒涘缓椤甸潰瀹炰緥
    page = {
      data: {
        activeTab: 'all',
        tasks: [],
        filteredTasks: [],
        loading: false,
        error: false,
        taskGroups: {
          once: [],
          daily: [],
          weekly: [],
          monthly: []
        }
      },
      setData: jest.fn((data) => {
        Object.assign(page.data, data);
      }),
      onLoad: pointsTasksPage.onLoad,
      onShow: pointsTasksPage.onShow,
      filterTasksByType: pointsTasksPage.filterTasksByType,
      handleTypeChange: pointsTasksPage.handleTypeChange,
      submitTaskProgress: pointsTasksPage.submitTaskProgress,
      claimTaskReward: pointsTasksPage.claimTaskReward,
      handleShareTask: pointsTasksPage.handleShareTask,
      navigateToRules: pointsTasksPage.navigateToRules,
      navigateToMall: pointsTasksPage.navigateToMall,
      navigateToRecords: pointsTasksPage.navigateToRecords,
      retry: pointsTasksPage.retry,
      onShareAppMessage: pointsTasksPage.onShareAppMessage
    };
  });

  describe('onLoad', () => {
    it('should set initial data correctly', () => {
      page.onLoad();
      expect(page.data.activeTab).toBe('all');
      expect(page.data.loading).toBe(true);
    });
  });

  describe('onShow', () => {
    it('should load tasks when user is logged in', async () => {
      const mockTasks = [
        { id: '1', type: 'once', status: 'pending', points: 50 },
        { id: '2', type: 'daily', status: 'completed', points: 10 },
        { id: '3', type: 'weekly', status: 'unclaimed', points: 100 }
      ];
      
      pointsService.getPointsTasks.mockResolvedValueOnce({
        tasks: mockTasks,
        total: 3
      });
      
      await page.onShow();
      
      expect(pointsService.getPointsTasks).toHaveBeenCalled();
      expect(page.data.tasks).toEqual(mockTasks);
      expect(page.data.loading).toBe(false);
    });

    it('should handle network errors', async () => {
      pointsService.getPointsTasks.mockRejectedValueOnce(new Error('Network error'));
      
      await page.onShow();
      
      expect(page.data.loading).toBe(false);
      expect(page.data.error).toBe(true);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: 'network_error',
        icon: 'none'
      });
    });
  });

  describe('filterTasksByType', () => {
    it('should filter tasks by type', () => {
      const tasks = [
        { id: '1', type: 'once', status: 'pending' },
        { id: '2', type: 'daily', status: 'completed' },
        { id: '3', type: 'weekly', status: 'unclaimed' }
      ];
      
      page.data.tasks = tasks;
      page.data.activeTab = 'daily';
      
      page.filterTasksByType();
      
      expect(page.data.filteredTasks).toEqual([tasks[1]]);
    });

    it('should return all tasks when type is all', () => {
      const tasks = [
        { id: '1', type: 'once', status: 'pending' },
        { id: '2', type: 'daily', status: 'completed' }
      ];
      
      page.data.tasks = tasks;
      page.data.activeTab = 'all';
      
      page.filterTasksByType();
      
      expect(page.data.filteredTasks).toEqual(tasks);
    });
  });

  describe('handleTypeChange', () => {
    it('should update active tab and filter tasks', () => {
      const mockEvent = { currentTarget: { dataset: { type: 'weekly' } } };
      
      page.filterTasksByType = jest.fn();
      
      page.handleTypeChange(mockEvent);
      
      expect(page.data.activeTab).toBe('weekly');
      expect(page.filterTasksByType).toHaveBeenCalled();
    });
  });

  describe('submitTaskProgress', () => {
    it('should submit task progress successfully', async () => {
      const taskId = '1';
      const progressData = { step: 1 };
      
      pointsService.submitTaskProgress.mockResolvedValueOnce({
        success: true,
        taskId,
        progress: 1
      });
      
      await page.submitTaskProgress(taskId, progressData);
      
      expect(pointsService.submitTaskProgress).toHaveBeenCalledWith(taskId, progressData);
    });

    it('should handle submission errors', async () => {
      const taskId = '1';
      const progressData = { step: 1 };
      
      pointsService.submitTaskProgress.mockRejectedValueOnce(new Error('Submission error'));
      
      await page.submitTaskProgress(taskId, progressData);
      
      expect(wx.showToast).toHaveBeenCalledWith({
        title: 'network_error',
        icon: 'none'
      });
    });
  });

  describe('claimTaskReward', () => {
    it('should claim task reward successfully', async () => {
      const taskId = '1';
      
      pointsService.claimTaskReward.mockResolvedValueOnce({
        success: true,
        points: 50
      });
      
      await page.claimTaskReward(taskId);
      
      expect(pointsService.claimTaskReward).toHaveBeenCalledWith(taskId);
      expect(wx.showToast).toHaveBeenCalledWith({
        title: 'points_reward_success',
        icon: 'success'
      });
    });

    it('should handle claim errors', async () => {
      const taskId = '1';
      
      pointsService.claimTaskReward.mockRejectedValueOnce(new Error('Claim error'));
      
      await page.claimTaskReward(taskId);
      
      expect(wx.showToast).toHaveBeenCalledWith({
        title: 'network_error',
        icon: 'none'
      });
    });
  });

  describe('handleShareTask', () => {
    it('should handle share task successfully', async () => {
      const taskId = '1';
      
      pointsService.handleShareTask.mockResolvedValueOnce({
        success: true
      });
      
      await page.handleShareTask(taskId);
      
      expect(pointsService.handleShareTask).toHaveBeenCalledWith(taskId);
    });
  });

  describe('navigation functions', () => {
    it('should navigate to points rules page', () => {
      page.navigateToRules();
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/user/points-rules'
      });
    });

    it('should navigate to points mall page', () => {
      page.navigateToMall();
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/user/points-mall'
      });
    });

    it('should navigate to points records page', () => {
      page.navigateToRecords();
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/user/points-records'
      });
    });
  });

  describe('retry', () => {
    it('should reset error state and reload tasks', () => {
      page.onShow = jest.fn();
      
      page.retry();
      
      expect(page.data.error).toBe(false);
      expect(page.onShow).toHaveBeenCalled();
    });
  });

  describe('onShareAppMessage', () => {
    it('should return share configuration', () => {
      const result = page.onShareAppMessage();
      
      expect(result).toEqual({
        title: 'app_slogan',
        path: '/pages/index/index'
      });
    });
  });
});\n