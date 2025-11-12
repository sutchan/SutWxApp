// i18n.js - 国际化语言翻译工具
// 用于管理应用的多语言支持和文本翻译
const { getStorage, setStorage } = require('./global');

// 默认语言设置
const DEFAULT_LANGUAGE = 'zh_CN';
const SUPPORTED_LANGUAGES = ['zh_CN', 'en_US'];

// 存储翻译内容
let translations = {
  zh_CN: {},
  en_US: {}
};

// 当前使用的语言
let currentLanguage = DEFAULT_LANGUAGE;

/**
 * 初始化国际化设置
 * 加载保存的语言设置或使用系统默认语言
 */
function initI18n() {
  // 尝试从本地存储中获取用户保存的语言设置
  const savedLanguage = getStorage('user_language');
  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    currentLanguage = savedLanguage;
  } else {
    // 获取系统语言并设置
    const systemLanguage = wx.getSystemInfoSync().language;
    if (systemLanguage === 'en') {
      currentLanguage = 'en_US';
    }
  }
  
  console.log('Current language:', currentLanguage);
}

/**
 * 设置当前使用的语言
 * @param {string} langCode - 语言代码，如 'zh_CN', 'en_US'
 */
function setLanguage(langCode) {
  if (!SUPPORTED_LANGUAGES.includes(langCode)) {
    console.error('Unsupported language:', langCode);
    return;
  }
  
  currentLanguage = langCode;
  setStorage('user_language', langCode);
}

/**
 * 获取当前使用的语言
 * @returns {string} 当前语言代码
 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 加载指定语言的翻译内容
 * @param {string} langCode - 语言代码
 * @param {Object} trans - 翻译内容对象
 */
function loadTranslations(langCode, trans) {
  if (SUPPORTED_LANGUAGES.includes(langCode)) {
    translations[langCode] = { ...translations[langCode], ...trans };
  }
}

/**
 * 获取翻译文本
 * @param {string} key - 翻译键
 * @param {Object} params - 替换参数
 * @returns {string} 翻译后的文本
 */
function t(key, params = {}) {
  let translation = translations[currentLanguage][key] || translations[DEFAULT_LANGUAGE][key] || key;
  
  // 替换参数
  Object.keys(params).forEach(paramKey => {
    translation = translation.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), params[paramKey]);
  });
  
  return translation;
}

/**
 * 获取所有支持的语言列表
 * @returns {Array} 语言代码列表
 */
function getSupportedLanguages() {
  return [...SUPPORTED_LANGUAGES];
}

// 基础翻译内容
const baseTranslations = {
  zh_CN: {
    // 积分任务相关
    'points_tasks': '积分任务',
    'task_type_all': '全部',
    'task_type_once': '新手',
    'task_type_daily': '每日',
    'task_type_weekly': '每周',
    'task_type_monthly': '每月',
    'task_status_completed': '已完成',
    'task_status_unclaimed': '待领取',
    'task_status_pending': '进行中',
    'task_claim_reward': '领取奖励',
    'task_go_complete': '去完成',
    'task_completed': '已完成',
    'task_progress': '进度',
    'points_reward_success': '恭喜获得{{points}}积分',
    'loading': '加载中...',
    'retry': '重试',
    'no_tasks': '暂无任务',
    'network_error': '网络异常，请稍后重试',
    
    // 通用文本
    'points': '积分',
    'sign_in': '签到',
    'my_profile': '个人中心',
    'my_orders': '我的订单',
    'my_favorites': '我的收藏',
    'my_addresses': '我的地址',
    'settings': '设置',
    'logout': '退出登录',
    'confirm': '确认',
    'cancel': '取消',
    'success': '成功',
    'error': '错误',
    'ok': '确定'
  },
  en_US: {
    // Points tasks related
    'points_tasks': 'Points Tasks',
    'task_type_all': 'All',
    'task_type_once': 'New User',
    'task_type_daily': 'Daily',
    'task_type_weekly': 'Weekly',
    'task_type_monthly': 'Monthly',
    'task_status_completed': 'Completed',
    'task_status_unclaimed': 'Unclaimed',
    'task_status_pending': 'In Progress',
    'task_claim_reward': 'Claim Reward',
    'task_go_complete': 'Complete',
    'task_completed': 'Completed',
    'task_progress': 'Progress',
    'points_reward_success': 'Congratulations, you got {{points}} points',
    'loading': 'Loading...',
    'retry': 'Retry',
    'no_tasks': 'No tasks available',
    'network_error': 'Network error, please try again later',
    
    // Common text
    'points': 'Points',
    'sign_in': 'Sign In',
    'my_profile': 'My Profile',
    'my_orders': 'My Orders',
    'my_favorites': 'My Favorites',
    'my_addresses': 'My Addresses',
    'settings': 'Settings',
    'logout': 'Logout',
    'confirm': 'Confirm',
    'cancel': 'Cancel',
    'success': 'Success',
    'error': 'Error',
    'ok': 'OK'
  }
};

// 加载基础翻译内容
loadTranslations('zh_CN', baseTranslations.zh_CN);
loadTranslations('en_US', baseTranslations.en_US);

// 导出模块
module.exports = {
  init: initI18n,
  setLanguage,
  getCurrentLanguage,
  loadTranslations,
  t,
  getSupportedLanguages
};
