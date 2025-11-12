/**
 * global.js - 全局工具函数模块
 * 提供微信小程序中常用的全局工具函数
 */

/**
 * 显示提示信息
 * @param {string} title - 提示信息标题
 * @param {string} icon - 图标类型，可选值: 'success', 'loading', 'none'
 * @param {number} duration - 显示时长，默认2000毫秒
 * @param {function} success - 成功回调函数
 */
function showToast(title, icon = 'none', duration = 2000, success = () => {}) {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration,
    success: success
  });
}

/**
 * 显示加载提示
 * @param {string} title - 提示信息标题，默认'加载中'
 * @param {boolean} mask - 是否显示遮罩，默认true
 */
function showLoading(title = '加载中', mask = true) {
  wx.showLoading({
    title: title,
    mask: mask
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示模态对话框
 * @param {Object} options - 对话框配置选项
 * @param {string} options.title - 对话框标题
 * @param {string} options.content - 对话框内容
 * @param {boolean} options.showCancel - 是否显示取消按钮，默认true
 * @param {string} options.cancelText - 取消按钮文字，默认'取消'
 * @param {string} options.confirmText - 确认按钮文字，默认'确定'
 * @param {string} options.cancelColor - 取消按钮颜色，默认'#000000'
 * @param {string} options.confirmColor - 确认按钮颜色，默认'#3CC51F'
 * @param {function} options.success - 成功回调函数
 * @param {function} options.fail - 失败回调函数
 * @param {function} options.complete - 完成回调函数
 */
function showModal(options = {}) {
  const defaultOptions = {
    title: '提示',
    content: '',
    showCancel: true,
    cancelText: '取消',
    confirmText: '确定',
    cancelColor: '#000000',
    confirmColor: '#3CC51F'
  };
  
  const modalOptions = { ...defaultOptions, ...options };
  
  wx.showModal(modalOptions);
}

/**
 * 显示操作菜单
 * @param {Object} options - 菜单配置选项
 * @param {Array} options.itemList - 按钮数组
 * @param {function} options.success - 成功回调函数
 * @param {function} options.fail - 失败回调函数
 * @param {function} options.complete - 完成回调函数
 */
function showActionSheet(options = {}) {
  wx.showActionSheet(options);
}

/**
 * 获取本地存储数据
 * @param {string} key - 存储键名
 * @returns {*} 存储的数据
 */
function getStorage(key) {
  try {
    return wx.getStorageSync(key);
  } catch (e) {
    console.error(`获取本地存储[${key}]失败:`, e);
    return null;
  }
}

/**
 * 设置本地存储数据
 * @param {string} key - 存储键名
 * @param {*} value - 存储数据
 * @returns {boolean} 是否存储成功
 */
function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error(`设置本地存储[${key}]失败:`, e);
    return false;
  }
}

/**
 * 移除本地存储数据
 * @param {string} key - 存储键名
 * @returns {boolean} 是否移除成功
 */
function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error(`移除本地存储[${key}]失败:`, e);
    return false;
  }
}

/**
 * 清除所有本地存储数据
 * @returns {boolean} 是否清除成功
 */
function clearStorage() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('清除所有本地存储失败:', e);
    return false;
  }
}

/**
 * 判断是否为空对象
 * @param {Object} obj - 要判断的对象
 * @returns {boolean} 是否为空对象
 */
function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (typeof obj !== 'object') return false;
  return Object.keys(obj).length === 0;
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 格式化时间戳为日期字符串
 * @param {number} timestamp - 时间戳
 * @param {string} format - 格式化模板，默认为'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化数字为货币形式
 * @param {number} amount - 金额
 * @param {number} decimals - 小数位数，默认2位
 * @param {string} decimalSeparator - 小数点分隔符，默认'.'
 * @param {string} thousandsSeparator - 千位分隔符，默认','
 * @returns {string} 格式化后的货币字符串
 */
function formatCurrency(amount, decimals = 2, decimalSeparator = '.', thousandsSeparator = ',') {
  if (amount === null || amount === undefined) return '0.00';
  
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  
  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  return parts.join(decimalSeparator);
}

/**
 * 获取随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间，单位毫秒
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间，单位毫秒
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const context = this;
    const args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 检查是否为微信环境
 * @returns {boolean} 是否为微信环境
 */
function isWechatEnv() {
  // 小程序环境判断
  return typeof wx !== 'undefined' && typeof wx.getSystemInfo !== 'undefined';
}

/**
 * 获取系统信息
 * @returns {Object} 系统信息对象
 */
function getSystemInfo() {
  try {
    return wx.getSystemInfoSync();
  } catch (e) {
    console.error('获取系统信息失败:', e);
    return {};
  }
}

/**
 * 检查网络状态
 * @returns {Promise<Object>} 网络状态信息
 */
function checkNetworkStatus() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType;
        resolve({
          isConnected: networkType !== 'none',
          networkType: networkType
        });
      },
      fail: (error) => {
        console.error('检查网络状态失败:', error);
        reject(error);
      }
    });
  });
}

/**
 * 页面跳转
 * @param {string} url - 跳转的页面路径
 * @param {Object} params - 页面参数
 * @param {boolean} replace - 是否替换当前页面，默认false
 */
function navigateTo(url, params = {}, replace = false) {
  // 构建带参数的URL
  const queryString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  if (replace) {
    wx.redirectTo({ url: fullUrl });
  } else {
    wx.navigateTo({ url: fullUrl });
  }
}

/**
 * 返回上一页
 * @param {number} delta - 返回的页面数，默认1
 */
function navigateBack(delta = 1) {
  wx.navigateBack({ delta: delta });
}

/**
 * 切换到标签页
 * @param {string} url - 标签页路径
 */
function switchTab(url) {
  wx.switchTab({ url: url });
}

/**
 * 重加载页面
 */
function reloadPage() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  currentPage.onLoad();
}

/**
 * 获取当前页面实例
 * @returns {Object} 当前页面实例
 */
function getCurrentPage() {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
}

/**
 * 计算文本长度（中文算2个字符，英文算1个字符）
 * @param {string} text - 要计算的文本
 * @returns {number} 文本长度
 */
function getTextLength(text) {
  if (!text || typeof text !== 'string') return 0;
  let length = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      length += 1;
    } else {
      length += 2;
    }
  }
  return length;
}

/**
 * 截取字符串（中文算2个字符，英文算1个字符）
 * @param {string} text - 要截取的文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀，默认'...'
 * @returns {string} 截取后的字符串
 */
function truncateText(text, maxLength, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  if (maxLength <= 0) return '';
  
  let currentLength = 0;
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const charLength = (charCode >= 0 && charCode <= 128) ? 1 : 2;
    
    if (currentLength + charLength > maxLength) {
      result += suffix;
      break;
    }
    
    result += text.charAt(i);
    currentLength += charLength;
  }
  
  return result;
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        resolve(true);
      },
      fail: (error) => {
        console.error('复制到剪贴板失败:', error);
        reject(error);
      }
    });
  });
}

/**
 * 打开地图选择位置
 * @returns {Promise<Object>} 选择的位置信息
 */
function chooseLocation() {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: (res) => {
        resolve(res);
      },
      fail: (error) => {
        console.error('选择位置失败:', error);
        reject(error);
      }
    });
  });
}

/**
 * 处理API响应结果
 * @param {Object} res - API响应结果
 * @returns {Object} 处理后的结果
 */
function handleApiResponse(res) {
  if (!res || typeof res !== 'object') {
    return {
      success: false,
      message: '无效的响应数据'
    };
  }
  
  if (res.code === 0 || res.success === true) {
    return {
      success: true,
      data: res.data || {},
      message: res.message || '操作成功'
    };
  } else {
    return {
      success: false,
      message: res.message || '操作失败',
      code: res.code || -1
    };
  }
}

/**
 * 导出全局工具函数
 */
module.exports = {
  // 提示相关
  showToast,
  showLoading,
  hideLoading,
  showModal,
  showActionSheet,
  
  // 存储相关
  getStorage,
  setStorage,
  removeStorage,
  clearStorage,
  
  // 工具函数
  isEmpty,
  deepClone,
  formatDate,
  formatCurrency,
  getRandomNumber,
  generateUniqueId,
  debounce,
  throttle,
  
  // 环境相关
  isWechatEnv,
  getSystemInfo,
  checkNetworkStatus,
  
  // 路由相关
  navigateTo,
  navigateBack,
  switchTab,
  reloadPage,
  getCurrentPage,
  
  // 文本处理
  getTextLength,
  truncateText,
  
  // 其他功能
  copyToClipboard,
  chooseLocation,
  handleApiResponse
};