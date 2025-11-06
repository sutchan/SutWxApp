// 全局工具类
// 提供小程序中常用的工具方法

/**
 * 显示提示信息
 * @param {string} title - 提示内容
 * @param {object} options - 选项
 * @param {string} options.icon - 图标类型，可选'none'|'success'|'loading'|'error'
 * @param {number} options.duration - 提示时间，默认2000ms
 * @param {boolean} options.mask - 是否显示透明蒙层，默认false
 */
export function showToast(title, options = {}) {
  const {
    icon = 'none',
    duration = 2000,
    mask = false
  } = options;
  
  wx.showToast({
    title,
    icon,
    duration,
    mask
  });
}

/**
 * 显示加载提示
 * @param {string} title - 提示内容，默认'加载中'
 * @param {boolean} mask - 是否显示透明蒙层，默认true
 */
export function showLoading(title = '加载中', mask = true) {
  wx.showLoading({
    title,
    mask
  });
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @param {object} options - 选项
 * @param {Function} options.success - 确认回调
 * @param {Function} options.fail - 失败回调
 * @param {Function} options.complete - 完成回调
 * @returns {Promise} 返回Promise对象
 */
export function showConfirm(title, content, options = {}) {
  const { success, fail, complete } = options;
  
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        if (success) success(res);
        if (res.confirm) {
          resolve(res);
        } else {
          reject(new Error('用户取消操作'));
        }
      },
      fail: (error) => {
        if (fail) fail(error);
        reject(error);
      },
      complete: (res) => {
        if (complete) complete(res);
      }
    });
  });
}

/**
 * 本地存储 - 存数据
 * @param {string} key - 存储键名
 * @param {*} value - 存储值
 * @returns {boolean} 是否存储成功
 */
export function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error('存储数据失败:', e);
    return false;
  }
}

/**
 * 本地存储 - 取数据
 * @param {string} key - 存储键名
 * @returns {*} 存储的值
 */
export function getStorage(key) {
  try {
    return wx.getStorageSync(key);
  } catch (e) {
    console.error('获取数据失败:', e);
    return null;
  }
}

/**
 * 本地存储 - 删除数据
 * @param {string} key - 存储键名
 * @returns {boolean} 是否删除成功
 */
export function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('删除数据失败:', e);
    return false;
  }
}

/**
 * 本地存储 - 清空所有数据
 * @returns {boolean} 是否清空成功
 */
export function clearStorage() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('清空数据失败:', e);
    return false;
  }
}

/**
 * 格式化时间
 * @param {string|number|Date} date - 时间对象或时间戳
 * @param {string} format - 格式化模板，默认'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化数字
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数，默认2
 * @returns {string} 格式化后的数字
 */
export function formatNumber(num, decimals = 2) {
  if (typeof num !== 'number') {
    return '0';
  }
  
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 检查是否为空对象
 * @param {object} obj - 要检查的对象
 * @returns {boolean} 是否为空对象
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间，默认300ms
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间，默认300ms
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 获取页面路由参数
 * @returns {object} 路由参数对象
 */
export function getPageParams() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  return currentPage ? currentPage.options : {};
}

// 导出所有函数
export default {
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  formatTime,
  formatNumber,
  isEmptyObject,
  deepClone,
  debounce,
  throttle,
  getPageParams
};