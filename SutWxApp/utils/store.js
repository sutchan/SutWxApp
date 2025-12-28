/**
 * 文件名: store.js
 * 版本号: 1.0.1
 * 更新日期: 2025-12-28
 * 描述: 应用状态管理工具，用于存储和管理全局状态
 */

// 初始状态
const initialState = {
  token: null,
  userInfo: null,
  points: 0,
  unreadCount: 0
};

// 状态存储
let state = { ...initialState };

// 安全获取wx对象
function getWx() {
  if (typeof wx !== 'undefined') {
    return wx;
  }
  return null;
}

// 初始化状态，从本地存储加载
function init() {
  const wx = getWx();
  if (!wx) {
    return;
  }

  const storedToken = wx.getStorageSync('token');
  const storedUserInfo = wx.getStorageSync('userInfo');
  const storedPoints = wx.getStorageSync('points');
  const storedUnreadCount = wx.getStorageSync('unreadCount');

  if (storedToken) {
    state.token = storedToken;
  }
  if (storedUserInfo) {
    state.userInfo = storedUserInfo;
  }
  if (storedPoints !== '') {
    state.points = storedPoints;
  }
  if (storedUnreadCount !== '') {
    state.unreadCount = storedUnreadCount;
  }
}

/**
 * 获取当前状态
 * @returns {Object} 当前状态
 */
function getState() {
  return { ...state };
}

/**
 * 修改状态
 * @param {string} mutation - 变更名称
 * @param {*} payload - 变更数据
 */
function commit(mutation, payload) {
  const wx = getWx();
  if (!wx) {
    console.warn('wx对象未定义，跳过状态变更');
    return;
  }

  switch (mutation) {
  case 'SET_TOKEN':
    state.token = payload;
    if (payload) {
      wx.setStorageSync('token', payload);
    } else {
      wx.removeStorageSync('token');
    }
    break;
    
  case 'SET_USER_INFO':
    state.userInfo = payload;
    if (payload) {
      wx.setStorageSync('userInfo', payload);
    } else {
      wx.removeStorageSync('userInfo');
    }
    break;
    
  case 'SET_POINTS':
    state.points = payload;
    wx.setStorageSync('points', payload);
    break;
    
  case 'SET_UNREAD_COUNT':
    state.unreadCount = payload;
    wx.setStorageSync('unreadCount', payload);
    break;
    
  case 'RESET_STATE':
    state = { ...initialState };
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('points');
    wx.removeStorageSync('unreadCount');
    break;
    
  default:
    console.warn(`未知的mutation: ${mutation}`);
  }
}

// 初始化状态
init();

module.exports = {
  getState,
  commit
};
