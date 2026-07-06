/**
 * 文件名: authService.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: 认证与用户服务层，提供登录、用户信息、收货地址管理功能
 *        所有方法返回 Promise；若传入 { success, fail } 回调则同时调用回调。
 *        Promise resolve 的值与 success 回调参数一致。
 */

// 修复 H-002：引入安全工具类，用于加密存储敏感数据
const securityUtil = require('../utils/security').default;

const STORAGE_KEY_ADDRESSES = "address_list";
const STORAGE_KEY_TOKEN = "token";
const STORAGE_KEY_USERINFO = "userInfo";

const defaultAddresses = [
  {
    id: 1,
    name: "张三",
    phone: "13800138000",
    province: "北京市",
    city: "北京市",
    district: "朝阳区",
    detail: "某某街道123号",
    isDefault: 1
  },
  {
    id: 2,
    name: "李四",
    phone: "13900139000",
    province: "上海市",
    city: "上海市",
    district: "浦东新区",
    detail: "某某路456号",
    isDefault: 0
  }
];

/**
 * 检查是否为生产环境
 * 修复 M-002：生产环境下不输出敏感信息
 */
function isProduction() {
  try {
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV === "production";
    }
  } catch (e) {
    // 忽略
  }
  return false;
}

/**
 * 安全日志输出
 * 修复 M-002：生产环境下移除敏感信息的 console.error
 */
function safeLog(level, message) {
  if (isProduction()) {
    if (level === "error") {
      console.error("[AuthService] " + message);
    }
    return;
  }
  var prefix = "[AuthService]";
  var args = Array.prototype.slice.call(arguments, 2);
  switch (level) {
    case "log":
      console.log.apply(console, [prefix, message].concat(args));
      break;
    case "warn":
      console.warn.apply(console, [prefix, message].concat(args));
      break;
    case "error":
      console.error.apply(console, [prefix, message].concat(args));
      break;
  }
}

/**
 * 验证手机号格式
 * 修复 M-003：添加输入验证
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== "string") {
    return false;
  }
  var phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证姓名格式
 * 修复 M-003：添加输入验证
 * @param {string} name 姓名
 * @returns {boolean} 是否有效
 */
function validateName(name) {
  if (!name || typeof name !== "string") {
    return false;
  }
  var trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 20;
}

/**
 * 验证地址详情格式
 * 修复 M-003：添加输入验证
 * @param {string} detail 详细地址
 * @returns {boolean} 是否有效
 */
function validateAddressDetail(detail) {
  if (!detail || typeof detail !== "string") {
    return false;
  }
  var trimmed = detail.trim();
  return trimmed.length >= 1 && trimmed.length <= 200;
}

function getAddressesFromStorage() {
  try {
    const data = wx.getStorageSync(STORAGE_KEY_ADDRESSES);
    return data && data.length > 0 ? data : defaultAddresses;
  } catch (e) {
    return defaultAddresses;
  }
}

function saveAddressesToStorage(list) {
  try {
    wx.setStorageSync(STORAGE_KEY_ADDRESSES, list);
  } catch (e) {
    safeLog("error", "保存地址数据失败");
  }
}

/**
 * 统一回调处理：返回 Promise，并在传入回调时调用
 */
function withCallbacks(promiseFactory, options) {
  const promise = promiseFactory();
  if (options && typeof options.success === "function") {
    promise.then(
      (res) => options.success(res),
      (err) => {
        if (typeof options.fail === "function") {
          options.fail(err);
        }
      }
    );
  }
  return promise;
}

/**
 * 获取收货地址列表
 * @param {Object} [options] { success, fail }
 * @returns {Promise<Array>} 地址列表
 */
function getAddressList(options) {
  return withCallbacks(async () => {
    try {
      return getAddressesFromStorage();
    } catch (error) {
      safeLog("error", "获取地址列表失败");
      return [];
    }
  }, options);
}

/**
 * 新增收货地址
 * @param {Object} options { name, phone, province, city, district, detail, isDefault, success, fail }
 * @returns {Promise<Object>} { code, message }
 */
function addAddress(options) {
  return withCallbacks(async () => {
    try {
      // 修复 M-003：添加输入验证
      if (!validateName(options.name)) {
        return { code: -1, message: "请输入有效的收货人姓名" };
      }
      if (!validatePhone(options.phone)) {
        return { code: -1, message: "请输入正确的手机号" };
      }
      if (!options.province || !options.city || !options.district) {
        return { code: -1, message: "请选择完整的地区信息" };
      }
      if (!validateAddressDetail(options.detail)) {
        return { code: -1, message: "请输入有效的详细地址" };
      }

      const list = getAddressesFromStorage();
      const data = {
        id: Date.now(),
        name: options.name,
        phone: options.phone,
        province: options.province,
        city: options.city,
        district: options.district,
        detail: options.detail,
        isDefault: options.isDefault ? 1 : 0
      };
      if (data.isDefault) {
        list.forEach((item) => (item.isDefault = 0));
      }
      list.push(data);
      saveAddressesToStorage(list);
      return { code: 0, message: "保存成功" };
    } catch (error) {
      safeLog("error", "新增地址失败");
      return { code: -1, message: "保存失败" };
    }
  }, options);
}

/**
 * 更新收货地址
 * @param {Object} options { id, name, phone, province, city, district, detail, isDefault, success, fail }
 * @returns {Promise<Object>} { code, message }
 */
function updateAddress(options) {
  return withCallbacks(async () => {
    try {
      // 修复 M-003：添加输入验证
      if (!options.id) {
        return { code: -1, message: "地址ID不能为空" };
      }
      if (options.name && !validateName(options.name)) {
        return { code: -1, message: "请输入有效的收货人姓名" };
      }
      if (options.phone && !validatePhone(options.phone)) {
        return { code: -1, message: "请输入正确的手机号" };
      }
      if (options.detail && !validateAddressDetail(options.detail)) {
        return { code: -1, message: "请输入有效的详细地址" };
      }

      const list = getAddressesFromStorage();
      const index = list.findIndex((item) => item.id == options.id);
      if (index < 0) {
        return { code: -1, message: "地址不存在" };
      }
      if (options.isDefault) {
        list.forEach((item) => (item.isDefault = 0));
      }
      list[index] = {
        ...list[index],
        name: options.name !== undefined ? options.name : list[index].name,
        phone: options.phone !== undefined ? options.phone : list[index].phone,
        province: options.province !== undefined ? options.province : list[index].province,
        city: options.city !== undefined ? options.city : list[index].city,
        district: options.district !== undefined ? options.district : list[index].district,
        detail: options.detail !== undefined ? options.detail : list[index].detail,
        isDefault: options.isDefault ? 1 : (options.isDefault === 0 ? 0 : list[index].isDefault)
      };
      saveAddressesToStorage(list);
      return { code: 0, message: "保存成功" };
    } catch (error) {
      safeLog("error", "更新地址失败");
      return { code: -1, message: "保存失败" };
    }
  }, options);
}

/**
 * 删除收货地址
 * @param {Object} options { id, success, fail }
 * @returns {Promise<Object>} { code, message }
 */
function deleteAddress(options) {
  return withCallbacks(async () => {
    try {
      if (!options.id) {
        return { code: -1, message: "地址ID不能为空" };
      }
      let list = getAddressesFromStorage();
      list = list.filter((item) => item.id != options.id);
      saveAddressesToStorage(list);
      return { code: 0, message: "删除成功" };
    } catch (error) {
      safeLog("error", "删除地址失败");
      return { code: -1, message: "删除失败" };
    }
  }, options);
}

/**
 * 退出登录
 * @param {Object} [options] { success, fail }
 * @returns {Promise<Object>} { code }
 */
function logout(options) {
  return withCallbacks(async () => {
    try {
      wx.removeStorageSync(STORAGE_KEY_TOKEN);
      wx.removeStorageSync(STORAGE_KEY_USERINFO);
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.token = null;
        app.globalData.userInfo = null;
      }
      return { code: 0 };
    } catch (error) {
      safeLog("error", "退出登录失败");
      return { code: -1 };
    }
  }, options);
}

/**
 * 获取用户信息
 * 修复 H-002：从加密存储中读取用户信息
 * @returns {Object|null} 用户信息
 */
function getUserInfo() {
  try {
    var encryptedData = wx.getStorageSync(STORAGE_KEY_USERINFO);
    if (!encryptedData) {
      return null;
    }

    try {
      // 修复 H-002：尝试解密（兼容旧版本明文存储）
      if (securityUtil && securityUtil.decrypt) {
        var decrypted = securityUtil.decrypt(encryptedData);
        if (decrypted && decrypted.userInfo) {
          return decrypted.userInfo;
        }
      }
    } catch (e) {
      // 解密失败，说明是旧版本明文存储，直接返回
      if (encryptedData && typeof encryptedData === "object") {
        // 迁移到加密存储
        saveUserInfo(encryptedData);
        return encryptedData;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 保存用户信息（加密存储）
 * 修复 H-002：使用 AES 加密存储敏感数据
 * @param {Object} userInfo 用户信息
 */
function saveUserInfo(userInfo) {
  try {
    if (!userInfo || typeof userInfo !== "object") {
      safeLog("warn", "无效的用户信息格式");
      return;
    }
    // 修复 H-002：使用 securityUtil.encrypt 加密存储
    if (securityUtil && securityUtil.encrypt) {
      var encrypted = securityUtil.encrypt({ userInfo: userInfo });
      wx.setStorageSync(STORAGE_KEY_USERINFO, encrypted);
    } else {
      // 降级：明文存储
      wx.setStorageSync(STORAGE_KEY_USERINFO, userInfo);
    }
  } catch (error) {
    safeLog("error", "保存用户信息失败");
  }
}

/**
 * 是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  try {
    return !!getToken();
  } catch (e) {
    return false;
  }
}

/**
 * 获取 token
 * 修复 H-002：从加密存储中读取 token
 * @returns {string|null}
 */
function getToken() {
  try {
    var encryptedToken = wx.getStorageSync(STORAGE_KEY_TOKEN);
    if (!encryptedToken || typeof encryptedToken !== "string") {
      return null;
    }

    try {
      // 修复 H-002：尝试解密（兼容旧版本明文存储）
      if (securityUtil && securityUtil.decrypt) {
        var decrypted = securityUtil.decrypt(encryptedToken);
        if (decrypted && typeof decrypted.token === "string") {
          return decrypted.token;
        }
      }
    } catch (e) {
      // 解密失败，说明是旧版本明文存储，直接返回
      if (typeof encryptedToken === "string" && encryptedToken.length > 0) {
        // 迁移到加密存储
        saveToken(encryptedToken);
        return encryptedToken;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 保存 token（加密存储）
 * 修复 H-002：使用 AES 加密存储敏感数据
 * @param {string} token Token字符串
 */
function saveToken(token) {
  try {
    if (!token || typeof token !== "string") {
      safeLog("warn", "无效的Token格式");
      return;
    }
    // 修复 H-002：使用 securityUtil.encrypt 加密存储
    if (securityUtil && securityUtil.encrypt) {
      var encrypted = securityUtil.encrypt({ token: token });
      wx.setStorageSync(STORAGE_KEY_TOKEN, encrypted);
    } else {
      // 降级：明文存储
      wx.setStorageSync(STORAGE_KEY_TOKEN, token);
    }
  } catch (error) {
    safeLog("error", "保存Token失败");
  }
}

module.exports = {
  getAddressList,
  addAddress,
  updateAddress,
  deleteAddress,
  logout,
  getUserInfo,
  isLoggedIn,
  getToken,
  saveToken,
  saveUserInfo,
  validatePhone,
  validateName
};
