// utils.js - 工具函数集

/**
 * 节流函数
 * 限制函数在一定时间内只能执行一次，用于优化高频触发的事件处理
 * @param {Function} func - 需要节流的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} - 节流后的函数
 */
const throttle = (func, wait) => {
  let lastCall = 0;
  let timeoutId = null;
  
  return function(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    // 如果距离上次调用时间已超过等待时间，直接执行
    if (timeSinceLastCall >= wait) {
      // 清除可能存在的定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      lastCall = now;
      return func.apply(this, args);
    }
    
    // 如果已经有定时器在等待，直接返回Promise
    if (timeoutId) {
      return Promise.resolve();
    }
    
    // 设置定时器，在剩余等待时间后执行
    const remainingWait = wait - timeSinceLastCall;
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        lastCall = Date.now();
        const result = func.apply(this, args);
        resolve(result);
      }, remainingWait);
    });
  };
};

/**
 * 防抖函数
 * 延迟函数执行，在指定时间内如果再次调用则重新计算延迟时间
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} - 防抖后的函数
 */
const debounce = (func, wait) => {
  let timeoutId = null;
  
  return function(...args) {
    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        const result = func.apply(this, args);
        resolve(result);
      }, wait);
    });
  };

/**
 * 格式化时间戳
 * @param {number} timestamp - 时间戳
 * @param {string} format - 格式化类型 'date', 'time', 'datetime'
 * @returns {string} - 格式化后的时间字符串
 */
const formatTime = (timestamp, format = 'datetime') => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'datetime':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

/**
 * 格式化数字（添加千分位）
 * @param {number} num - 需要格式化的数字
 * @returns {string} - 格式化后的数字字符串
 */
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 截断文本
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀，默认为'...'
 * @returns {string} - 截断后的文本
 */
const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 深度克隆对象
 * @param {Object} obj - 需要克隆的对象
 * @returns {Object} - 克隆后的新对象
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const clonedObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
};

/**
 * 生成唯一ID
 * @returns {string} - 唯一ID
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * 判断对象是否为空
 * @param {Object} obj - 需要判断的对象
 * @returns {boolean} - 是否为空对象
 */
const isEmptyObject = (obj) => {
  return Object.keys(obj || {}).length === 0;
};

/**
 * 数组去重
 * @param {Array} array - 需要去重的数组
 * @param {string} key - 根据指定属性去重
 * @returns {Array} - 去重后的数组
 */
const uniqueArray = (array, key) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      if (!item || typeof item !== 'object') return false;
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }
  
  return [...new Set(array)];
};

/**
 * 计算两个日期之间的天数差
 * @param {Date|number} date1 - 第一个日期
 * @param {Date|number} date2 - 第二个日期
 * @returns {number} - 天数差
 */
const getDaysDiff = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 获取相对时间（如：刚刚、5分钟前、1小时前）
 * @param {number|Date} time - 目标时间
 * @returns {string} - 相对时间描述
 */
const getRelativeTime = (time) => {
  const now = Date.now();
  const diff = now - new Date(time).getTime();
  
  if (diff < 0) return '未来';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
};

// 导出所有工具函数
module.exports = {
  throttle,
  debounce,
  formatTime,
  formatNumber,
  truncateText,
  deepClone,
  generateUniqueId,
  isEmptyObject,
  uniqueArray,
  getDaysDiff,
  getRelativeTime
};
