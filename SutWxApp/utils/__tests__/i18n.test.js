/**
 * 文件名: i18n.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 国际化工具单元测试
 */

// 模拟微信小程序API
global.wx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  getSystemInfoSync: jest.fn()
};

const i18n = require('../i18n');

describe('国际化工具测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('应该成功初始化国际化', () => {
      const mockSystemInfo = {
        language: 'zh-cn'
      };
      
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue('zh_CN');

      i18n.init();
      
      expect(wx.getSystemInfoSync).toHaveBeenCalled();
      expect(wx.getStorageSync).toHaveBeenCalledWith('language');
      expect(i18n.getCurrentLocale()).toBe('zh_CN');
    });

    it('应该使用系统语言作为默认语言', () => {
      const mockSystemInfo = {
        language: 'en'
      };
      
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue(null);

      i18n.init();
      
      expect(wx.getSystemInfoSync).toHaveBeenCalled();
      expect(wx.getStorageSync).toHaveBeenCalledWith('language');
      expect(i18n.getCurrentLocale()).toBe('en_US');
    });

    it('应该使用中文作为默认语言', () => {
      const mockSystemInfo = {
        language: 'unknown'
      };
      
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue(null);

      i18n.init();
      
      expect(wx.getSystemInfoSync).toHaveBeenCalled();
      expect(wx.getStorageSync).toHaveBeenCalledWith('language');
      expect(i18n.getCurrentLocale()).toBe('zh_CN');
    });
  });

  describe('setLocale', () => {
    beforeEach(() => {
      // 初始化i18n
      const mockSystemInfo = { language: 'zh-cn' };
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue('zh_CN');
      i18n.init();
    });

    it('应该成功设置语言为中文', () => {
      wx.setStorageSync.mockImplementation((key, data) => {
        console.log(`设置${key}:`, data);
      });

      i18n.setLocale('zh_CN');
      
      expect(wx.setStorageSync).toHaveBeenCalledWith('language', 'zh_CN');
      expect(i18n.getCurrentLocale()).toBe('zh_CN');
    });

    it('应该成功设置语言为英文', () => {
      wx.setStorageSync.mockImplementation((key, data) => {
        console.log(`设置${key}:`, data);
      });

      i18n.setLocale('en_US');
      
      expect(wx.setStorageSync).toHaveBeenCalledWith('language', 'en_US');
      expect(i18n.getCurrentLocale()).toBe('en_US');
    });

    it('应该处理不支持的语言', () => {
      wx.setStorageSync.mockImplementation((key, data) => {
        console.log(`设置${key}:`, data);
      });

      i18n.setLocale('unsupported');
      
      expect(wx.setStorageSync).toHaveBeenCalledWith('language', 'zh_CN');
      expect(i18n.getCurrentLocale()).toBe('zh_CN');
    });
  });

  describe('t', () => {
    beforeEach(() => {
      // 初始化i18n
      const mockSystemInfo = { language: 'zh-cn' };
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue('zh_CN');
      i18n.init();
    });

    it('应该成功翻译中文文本', () => {
      const result = i18n.t('common.confirm');
      expect(result).toBe('确认');
    });

    it('应该成功翻译英文文本', () => {
      i18n.setLocale('en_US');
      const result = i18n.t('common.confirm');
      expect(result).toBe('Confirm');
    });

    it('应该处理不存在的键', () => {
      const result = i18n.t('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('应该支持变量替换', () => {
      const result = i18n.t('common.welcome', { name: '用户' });
      expect(result).toBe('欢迎, 用户');
    });

    it('应该支持英文变量替换', () => {
      i18n.setLocale('en_US');
      const result = i18n.t('common.welcome', { name: 'User' });
      expect(result).toBe('Welcome, User');
    });

    it('应该处理嵌套键', () => {
      const result = i18n.t('error.network');
      expect(result).toBe('网络错误');
    });

    it('应该处理英文嵌套键', () => {
      i18n.setLocale('en_US');
      const result = i18n.t('error.network');
      expect(result).toBe('Network Error');
    });
  });

  describe('getCurrentLocale', () => {
    beforeEach(() => {
      // 初始化i18n
      const mockSystemInfo = { language: 'zh-cn' };
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue('zh_CN');
      i18n.init();
    });

    it('应该返回当前语言', () => {
      const result = i18n.getCurrentLocale();
      expect(result).toBe('zh_CN');
    });

    it('应该返回英文语言', () => {
      i18n.setLocale('en_US');
      const result = i18n.getCurrentLocale();
      expect(result).toBe('en_US');
    });
  });

  describe('getSupportedLocales', () => {
    it('应该返回支持的语言列表', () => {
      const result = i18n.getSupportedLocales();
      expect(result).toEqual(['zh_CN', 'en_US']);
    });
  });

  describe('formatNumber', () => {
    beforeEach(() => {
      // 初始化i18n
      const mockSystemInfo = { language: 'zh-cn' };
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue('zh_CN');
      i18n.init();
    });

    it('应该格式化中文数字', () => {
      const result = i18n.formatNumber(1234.56);
      expect(result).toBe('1,234.56');
    });

    it('应该格式化英文数字', () => {
      i18n.setLocale('en_US');
      const result = i18n.formatNumber(1234.56);
      expect(result).toBe('1,234.56');
    });

    it('应该处理整数', () => {
      const result = i18n.formatNumber(1234);
      expect(result).toBe('1,234');
    });

    it('应该处理小数', () => {
      const result = i18n.formatNumber(1234.567, 2);
      expect(result).toBe('1,234.57');
    });
  });

  describe('formatDate', () => {
    beforeEach(() => {
      // 初始化i18n
      const mockSystemInfo = { language: 'zh-cn' };
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue('zh_CN');
      i18n.init();
    });

    it('应该格式化中文日期', () => {
      const date = new Date('2023-06-17');
      const result = i18n.formatDate(date);
      expect(result).toBe('2023年6月17日');
    });

    it('应该格式化英文日期', () => {
      i18n.setLocale('en_US');
      const date = new Date('2023-06-17');
      const result = i18n.formatDate(date);
      expect(result).toBe('June 17, 2023');
    });

    it('应该处理时间戳', () => {
      const timestamp = new Date('2023-06-17').getTime();
      const result = i18n.formatDate(timestamp);
      expect(result).toBe('2023年6月17日');
    });

    it('应该处理自定义格式', () => {
      const date = new Date('2023-06-17');
      const result = i18n.formatDate(date, 'YYYY-MM-DD');
      expect(result).toBe('2023-06-17');
    });
  });

  describe('formatCurrency', () => {
    beforeEach(() => {
      // 初始化i18n
      const mockSystemInfo = { language: 'zh-cn' };
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue('zh_CN');
      i18n.init();
    });

    it('应该格式化中文货币', () => {
      const result = i18n.formatCurrency(1234.56);
      expect(result).toBe('¥1,234.56');
    });

    it('应该格式化英文货币', () => {
      i18n.setLocale('en_US');
      const result = i18n.formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('应该处理整数货币', () => {
      const result = i18n.formatCurrency(1234);
      expect(result).toBe('¥1,234.00');
    });

    it('应该处理自定义货币符号', () => {
      const result = i18n.formatCurrency(1234.56, '€');
      expect(result).toBe('€1,234.56');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // 初始化i18n
      const mockSystemInfo = { language: 'zh-cn' };
      wx.getSystemInfoSync.mockReturnValue(mockSystemInfo);
      wx.getStorageSync.mockReturnValue('zh_CN');
      i18n.init();
    });

    it('应该格式化中文相对时间', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const result = i18n.formatRelativeTime(oneHourAgo);
      expect(result).toBe('1小时前');
    });

    it('应该格式化英文相对时间', () => {
      i18n.setLocale('en_US');
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const result = i18n.formatRelativeTime(oneHourAgo);
      expect(result).toBe('1 hour ago');
    });

    it('应该处理分钟', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const result = i18n.formatRelativeTime(fiveMinutesAgo);
      expect(result).toBe('5分钟前');
    });

    it('应该处理天', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const result = i18n.formatRelativeTime(twoDaysAgo);
      expect(result).toBe('2天前');
    });
  });
});