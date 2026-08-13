/**
 * 文件名: store.js
 * 版本号: 3.0.1
 * 更新日期: 2026-08-13
 * 描述: 应用状态管理工具，用于存储和管理全局状态
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// 初始状态
const initialState = {
  token: null,
  userInfo: null,
  points: 0,
  unreadCount: 0,
};

// 状态存储
let state = { ...initialState };

// 安全获取wx对象
function getWx() {
  if (typeof wx !== "undefined") {
    return wx;
  }
  return null;
}

// 敏感字段混淆密钥（非加密，仅避免明文落盘被直接读取）
const OBFUSCATE_KEY = "sut-wx-app-secure-2026";

/**
 * 对字符串进行 XOR 混淆并 Base64 编码
 * @param {string} value 原始字符串
 * @returns {string} 混淆后的字符串
 */
function obfuscate(value) {
  if (typeof value !== "string" || value.length === 0) return value;
  let result = "";
  for (let i = 0; i < value.length; i++) {
    result += String.fromCharCode(
      value.charCodeAt(i) ^ OBFUSCATE_KEY.charCodeAt(i % OBFUSCATE_KEY.length),
    );
  }
  try {
    return "enc:" + (typeof btoa !== "undefined" ? btoa(result) : Buffer.from(result, "binary").toString("base64"));
  } catch (e) {
    return "enc:" + result;
  }
}

/**
 * 对混淆字符串进行解码还原
 * @param {string} value 混淆后的字符串
 * @returns {string} 原始字符串
 */
function deobfuscate(value) {
  if (typeof value !== "string" || value.indexOf("enc:") !== 0) return value;
  const payload = value.slice(4);
  let raw = "";
  try {
    raw = typeof atob !== "undefined" ? atob(payload) : Buffer.from(payload, "base64").toString("binary");
  } catch (e) {
    raw = payload;
  }
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    result += String.fromCharCode(
      raw.charCodeAt(i) ^ OBFUSCATE_KEY.charCodeAt(i % OBFUSCATE_KEY.length),
    );
  }
  return result;
}

// 初始化状态，从本地存储加载
function init() {
  const wx = getWx();
  if (!wx) {
    return;
  }

  const storedToken = wx.getStorageSync("token");
  const storedUserInfo = wx.getStorageSync("userInfo");
  const storedPoints = wx.getStorageSync("points");
  const storedUnreadCount = wx.getStorageSync("unreadCount");

  if (storedToken) {
    state.token = deobfuscate(storedToken);
  }
  if (storedUserInfo) {
    state.userInfo = storedUserInfo;
  }
  if (storedPoints !== "") {
    state.points = storedPoints;
  }
  if (storedUnreadCount !== "") {
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
    console.warn("wx对象未定义，跳过状态变更");
    return;
  }

  switch (mutation) {
    case "SET_TOKEN":
      state.token = payload;
      if (payload) {
        wx.setStorageSync("token", obfuscate(payload));
      } else {
        wx.removeStorageSync("token");
      }
      break;

    case "SET_USER_INFO":
      state.userInfo = payload;
      if (payload) {
        wx.setStorageSync("userInfo", payload);
      } else {
        wx.removeStorageSync("userInfo");
      }
      break;

    case "SET_POINTS":
      state.points = payload;
      wx.setStorageSync("points", payload);
      break;

    case "SET_UNREAD_COUNT":
      state.unreadCount = payload;
      wx.setStorageSync("unreadCount", payload);
      break;

    case "RESET_STATE":
      state = { ...initialState };
      wx.removeStorageSync("token");
      wx.removeStorageSync("userInfo");
      wx.removeStorageSync("points");
      wx.removeStorageSync("unreadCount");
      break;

    default:
      console.warn(`未知的mutation: ${mutation}`);
  }
}

// 初始化状态
init();

module.exports = {
  getState,
  commit,
};
