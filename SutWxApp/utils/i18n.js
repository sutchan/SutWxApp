// i18n.js - 澶氳瑷€鏀寔妯″潡
// 鎻愪緵鍥介檯鍖栫炕璇戝姛鑳?
import { getStorage, setStorage } from './global';

// 榛樿璇█璁剧疆
const DEFAULT_LANGUAGE = 'zh_CN';
const SUPPORTED_LANGUAGES = ['zh_CN', 'en_US'];

// 璇█璧勬簮瀛樺偍
let translations = {
  zh_CN: {},
  en_US: {}
};

// 褰撳墠璇█
let currentLanguage = DEFAULT_LANGUAGE;

/**
 * 鍒濆鍖栧璇█妯″潡
 * 鍔犺浇鐢ㄦ埛棣栭€夎瑷€鍜岀炕璇戣祫婧? */
export function initI18n() {
  // 浠庡瓨鍌ㄤ腑鑾峰彇鐢ㄦ埛璇█璁剧疆
  const savedLanguage = getStorage('user_language');
  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    currentLanguage = savedLanguage;
  } else {
    // 鑾峰彇绯荤粺璇█璁剧疆
    const systemLanguage = wx.getSystemInfoSync().language;
    if (systemLanguage === 'en') {
      currentLanguage = 'en_US';
    }
  }
  
  console.log('Current language:', currentLanguage);
}

/**
 * 璁剧疆褰撳墠璇█
 * @param {string} langCode - 璇█浠ｇ爜锛屽 'zh_CN', 'en_US'
 */
export function setLanguage(langCode) {
  if (!SUPPORTED_LANGUAGES.includes(langCode)) {
    console.error('Unsupported language:', langCode);
    return;
  }
  
  currentLanguage = langCode;
  setStorage('user_language', langCode);
}

/**
 * 鑾峰彇褰撳墠璇█
 * @returns {string} 褰撳墠璇█浠ｇ爜
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 鍔犺浇缈昏瘧璧勬簮
 * @param {string} langCode - 璇█浠ｇ爜
 * @param {Object} trans - 缈昏瘧璧勬簮瀵硅薄
 */
export function loadTranslations(langCode, trans) {
  if (SUPPORTED_LANGUAGES.includes(langCode)) {
    translations[langCode] = { ...translations[langCode], ...trans };
  }
}

/**
 * 缈昏瘧鏂囨湰
 * @param {string} key - 缈昏瘧閿? * @param {Object} params - 鏇挎崲鍙傛暟
 * @returns {string} 缈昏瘧鍚庣殑鏂囨湰
 */
export function t(key, params = {}) {
  let translation = translations[currentLanguage][key] || translations[DEFAULT_LANGUAGE][key] || key;
  
  // 鏇挎崲鍙傛暟
  Object.keys(params).forEach(paramKey => {
    translation = translation.replace(new RegExp(`\{\{${paramKey}\}\}`, 'g'), params[paramKey]);
  });
  
  return translation;
}

/**
 * 鑾峰彇鏀寔鐨勮瑷€鍒楄〃
 * @returns {Array} 璇█鍒楄〃
 */
export function getSupportedLanguages() {
  return [...SUPPORTED_LANGUAGES];
}

// 棰勫姞杞藉熀纭€缈昏瘧
const baseTranslations = {
  zh_CN: {
    // 绉垎浠诲姟鐩稿叧
    'points_tasks': '绉垎浠诲姟',
    'task_type_all': '鍏ㄩ儴',
    'task_type_once': '鏂版墜',
    'task_type_daily': '姣忔棩',
    'task_type_weekly': '姣忓懆',
    'task_type_monthly': '姣忔湀',
    'task_status_completed': '宸插畬鎴?,
    'task_status_unclaimed': '寰呴鍙?,
    'task_status_pending': '杩涜涓?,
    'task_claim_reward': '棰嗗彇濂栧姳',
    'task_go_complete': '鍘诲畬鎴?,
    'task_completed': '宸插畬鎴?,
    'task_progress': '杩涘害',
    'points_reward_success': '鎭枩鑾峰緱{{points}}绉垎',
    'loading': '鍔犺浇涓?..',
    'retry': '閲嶈瘯',
    'no_tasks': '鏆傛棤浠诲姟',
    'network_error': '缃戠粶閿欒锛岃绋嶅悗閲嶈瘯',
    
    // 閫氱敤鏂囨湰
    'points': '绉垎',
    'sign_in': '绛惧埌',
    'my_profile': '涓汉涓績',
    'my_orders': '鎴戠殑璁㈠崟',
    'my_favorites': '鎴戠殑鏀惰棌',
    'my_addresses': '鎴戠殑鍦板潃',
    'settings': '璁剧疆',
    'logout': '閫€鍑虹櫥褰?,
    'confirm': '纭',
    'cancel': '鍙栨秷',
    'success': '鎴愬姛',
    'error': '閿欒',
    'ok': '纭畾'
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

// 鍔犺浇鍩虹缈昏瘧
loadTranslations('zh_CN', baseTranslations.zh_CN);
loadTranslations('en_US', baseTranslations.en_US);

// 瀵煎嚭榛樿瀵硅薄
export default {
  init: initI18n,
  setLanguage,
  getCurrentLanguage,
  loadTranslations,
  t,
  getSupportedLanguages
};