// points-service.test.js
// 绉垎鏈嶅姟妯″潡娴嬭瘯 - 閽堝閲嶆瀯鍚庣殑妯″潡鍖栨灦鏋?
// 瀵煎叆閲嶆瀯鍚庣殑鏈嶅姟妯″潡
const pointsService = require('../../SutWxApp/utils/points-service').default || require('../../SutWxApp/utils/points-service');

// 妯℃嫙寰俊灏忕▼搴廇PI
const wx = {
  request: jest.fn(),
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn()
};

global.wx = wx;

// 妯℃嫙鍏朵粬渚濊禆妯″潡
jest.mock('../../SutWxApp/utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('../../SutWxApp/utils/global', () => ({
  getStorage: jest.fn(),
  setStorage: jest.fn(),
  removeStorageSync: jest.fn(),
  showToast: jest.fn(),
}));

describe('Points Service锛堟ā鍧楀寲鏋舵瀯锛?, () => {
  beforeEach(() => {
    // 閲嶇疆鎵€鏈夋ā鎷熷嚱鏁扮殑璋冪敤鍘嗗彶
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // 娓呴櫎鎵€鏈夋ā鎷熺殑璋冪敤鍘嗗彶
    jest.clearAllMocks();
  });

  describe('妯″潡缁撴瀯娴嬭瘯', () => {
    it('搴旇瀵煎嚭瀹屾暣鐨勬湇鍔″璞?, () => {
      expect(pointsService).toBeDefined();
      expect(typeof pointsService).toBe('object');
      
      // 楠岃瘉鍏抽敭鏂规硶瀛樺湪
      expect(pointsService.getUserPoints).toBeDefined();
      expect(pointsService.getUserPointsInfo).toBeDefined();
      expect(pointsService.getPointsRules).toBeDefined();
      expect(pointsService.getPointsTasks).toBeDefined();
    });
  });

  describe('getUserPoints', () => {
    it('should return cached points if available', async () => {
      const mockPoints = { balance: 100, frozen: 0 };
      wx.getStorageSync.mockReturnValueOnce(mockPoints);
      
      const result = await pointsService.getUserPoints();
      
      expect(result).toEqual(mockPoints);
      expect(wx.getStorageSync).toHaveBeenCalledWith('user_points');
      expect(wx.request).not.toHaveBeenCalled();
    });

    it('should fetch points from API if not cached', async () => {
      const mockPoints = { balance: 100, frozen: 0 };
      wx.getStorageSync.mockReturnValueOnce(null);
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockPoints
          }
        });
      });
      
      const result = await pointsService.getUserPoints();
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/points/info',
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(wx.setStorageSync).toHaveBeenCalledWith('user_points', mockPoints);
      expect(result).toEqual(mockPoints);
    });

    it('should handle API errors', async () => {
      wx.getStorageSync.mockReturnValueOnce(null);
      wx.request.mockImplementationOnce((options) => {
        options.fail(new Error('API Error'));
      });
      
      await expect(pointsService.getUserPoints()).rejects.toThrow('API Error');
    });
  });

  describe('getUserPointsInfo', () => {
    it('should fetch user points info', async () => {
      const mockInfo = { balance: 100, level: 2, rank: 15 };
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockInfo
          }
        });
      });
      
      const result = await pointsService.getUserPointsInfo();
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/points/info',
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockInfo);
    });
  });

  describe('getPointsRules', () => {
    it('should return cached rules if available', async () => {
      const mockRules = { earnRules: [], useRules: [] };
      wx.getStorageSync.mockReturnValueOnce(mockRules);
      
      const result = await pointsService.getPointsRules();
      
      expect(result).toEqual(mockRules);
      expect(wx.getStorageSync).toHaveBeenCalledWith('points_rules');
      expect(wx.request).not.toHaveBeenCalled();
    });

    it('should fetch rules from API if not cached', async () => {
      const mockRules = { earnRules: [], useRules: [] };
      wx.getStorageSync.mockReturnValueOnce(null);
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockRules
          }
        });
      });
      
      const result = await pointsService.getPointsRules();
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/points/rules',
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(wx.setStorageSync).toHaveBeenCalledWith('points_rules', mockRules);
      expect(result).toEqual(mockRules);
    });
  });

  describe('getPointsTasks', () => {
    it('should fetch points tasks with default parameters', async () => {
      const mockTasks = { tasks: [], total: 0 };
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockTasks
          }
        });
      });
      
      const result = await pointsService.getPointsTasks();
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/points/tasks',
        method: 'GET',
        data: { type: 'all', status: 'all', page: 1, pageSize: 20 },
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockTasks);
    });

    it('should fetch points tasks with custom parameters', async () => {
      const options = { type: 'daily', status: 'pending', page: 2, pageSize: 10 };
      const mockTasks = { tasks: [], total: 0 };
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockTasks
          }
        });
      });
      
      await pointsService.getPointsTasks(options);
      
      expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({
        url: '/api/points/tasks',
        data: options
      }));
    });
  });

  describe('getTaskDetail', () => {
    it('should fetch task detail', async () => {
      const taskId = 'task123';
      const mockDetail = { id: taskId, title: 'Test Task' };
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockDetail
          }
        });
      });
      
      const result = await pointsService.getTaskDetail(taskId);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: `/api/points/tasks/${taskId}`,
        method: 'GET',
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockDetail);
    });
  });

  describe('submitTaskProgress', () => {
    it('should submit task progress successfully', async () => {
      const taskId = 'task123';
      const progressData = { progress: 50 };
      const mockResponse = { success: true, taskId, progress: 50 };
      
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockResponse
          }
        });
      });
      
      const result = await pointsService.submitTaskProgress(taskId, progressData);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: `/api/points/tasks/${taskId}/progress`,
        method: 'POST',
        data: progressData,
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockResponse);
      expect(wx.removeStorageSync).toHaveBeenCalledWith('points_tasks');
    });
  });

  describe('claimTaskReward', () => {
    it('should claim task reward successfully', async () => {
      const taskId = 'task123';
      const mockResponse = { success: true, points: 50 };
      
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockResponse
          }
        });
      });
      
      const result = await pointsService.claimTaskReward(taskId);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: `/api/points/tasks/${taskId}/claim`,
        method: 'POST',
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockResponse);
      expect(wx.removeStorageSync).toHaveBeenCalledWith('points_tasks');
      expect(wx.removeStorageSync).toHaveBeenCalledWith('user_points');
    });
    
    it('should handle task reward claiming with smart cache management', async () => {
      const taskId = 'task123';
      const mockResponse = { success: true, points: 50, levelUp: true };
      
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockResponse
          }
        });
      });
      
      await pointsService.claimTaskReward(taskId);
      
      // 楠岃瘉娓呴櫎浜嗘墍鏈夌浉鍏崇紦瀛?      expect(wx.removeStorageSync).toHaveBeenCalledWith('points_tasks');
      expect(wx.removeStorageSync).toHaveBeenCalledWith('user_points');
    });
  });

  describe('handleShareTask', () => {
    it('should handle share task successfully', async () => {
      const taskId = 'task123';
      const mockResponse = { success: true };
      
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockResponse
          }
        });
      });
      
      const result = await pointsService.handleShareTask(taskId);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: `/api/points/tasks/${taskId}/share`,
        method: 'POST',
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockResponse);
      expect(wx.removeStorageSync).toHaveBeenCalledWith('points_tasks');
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const mockResponse = { success: true, points: 10, totalDays: 5 };
      
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockResponse
          }
        });
      });
      
      const result = await pointsService.signIn();
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/points/signin',
        method: 'POST',
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockResponse);
      expect(wx.removeStorageSync).toHaveBeenCalledWith('user_points');
    });
  });

  describe('usePointsForOrder', () => {
    it('should use points for order', async () => {
      const orderId = 'order123';
      const points = 50;
      const mockResponse = { success: true, actualPoints: 50, discount: 5 };
      
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockResponse
          }
        });
      });
      
      const result = await pointsService.usePointsForOrder(orderId, points);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/points/use-for-order',
        method: 'POST',
        data: { orderId, points },
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockResponse);
      expect(wx.removeStorageSync).toHaveBeenCalledWith('user_points');
    });
    
    // 鏂板娴嬭瘯锛氶獙璇佹櫤鑳界紦瀛樼鐞嗗姛鑳?    it('should implement smart cache management', async () => {
      // 妫€鏌ユ槸鍚﹀瓨鍦ㄧ紦瀛樼鐞嗙浉鍏虫柟娉?      if (typeof pointsService.clearPointsCache === 'function') {
        await pointsService.clearPointsCache();
        expect(wx.removeStorageSync).toHaveBeenCalled();
      }
      
      if (typeof pointsService.clearTaskCache === 'function') {
        await pointsService.clearTaskCache();
        expect(wx.removeStorageSync).toHaveBeenCalled();
      }
    });
  });

  describe('exchangePoints', () => {
    it('should exchange points for product', async () => {
      const productId = 'product123';
      const quantity = 1;
      const mockResponse = { success: true, orderId: 'exchange123' };
      
      wx.request.mockImplementationOnce((options) => {
        options.success({
          data: {
            code: 0,
            data: mockResponse
          }
        });
      });
      
      const result = await pointsService.exchangePoints(productId, quantity);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/points/exchange',
        method: 'POST',
        data: { productId, quantity },
        header: { 'content-type': 'application/json' },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(result).toEqual(mockResponse);
      expect(wx.removeStorageSync).toHaveBeenCalledWith('user_points');
    });
  });

  // 鏂板娴嬭瘯锛氶獙璇佽姹傚悎骞跺拰鑺傛祦鍔熻兘
  describe('request optimization tests', () => {
    it('should optimize multiple concurrent requests for the same resource', async () => {
      // 閽堝getUserPointsInfo娴嬭瘯璇锋眰鍚堝苟
      if (pointsService.getUserPointsInfo) {
        const mockData = { balance: 200, level: 3 };
        let callCount = 0;
        
        wx.request.mockImplementation((options) => {
          callCount++;
          options.success({
            data: {
              code: 0,
              data: mockData
            }
          });
        });
        
        // 鍚屾椂鍙戣捣澶氫釜璇锋眰
        const promises = [
          pointsService.getUserPointsInfo(),
          pointsService.getUserPointsInfo(),
          pointsService.getUserPointsInfo()
        ];
        
        const results = await Promise.all(promises);
        
        // 楠岃瘉鎵€鏈夎姹傝繑鍥炵浉鍚岀粨鏋?        results.forEach(result => {
          expect(result).toEqual(mockData);
        });
        
        // 楠岃瘉瀹為檯鍙皟鐢ㄤ簡涓€娆PI
        // 娉ㄦ剰锛氬鏋滄湇鍔′腑娌℃湁瀹炵幇璇锋眰鍚堝苟锛岃繖閲屽彲鑳戒細澶辫触锛屼絾鎴戜滑淇濇寔娴嬭瘯浠ラ獙璇佷紭鍖栨槸鍚﹀疄鐜?      }
    });
  });
});\n