
/**
 * 文件名: authService.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-05
 * 描述: 认证与用户服务层，提供登录、用户信息、收货地址管理功能
 *        所有方法返回 Promise；若传入 { success, fail } 回调则同时调用回调。
 *        Promise resolve 的值与 success 回调参数一致。
 */

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
    console.error("保存地址数据失败:", e);
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
      console.error("获取地址列表失败:", error);
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
      console.error("新增地址失败:", error);
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
        name: options.name,
        phone: options.phone,
        province: options.province,
        city: options.city,
        district: options.district,
        detail: options.detail,
        isDefault: options.isDefault ? 1 : 0
      };
      saveAddressesToStorage(list);
      return { code: 0, message: "保存成功" };
    } catch (error) {
      console.error("更新地址失败:", error);
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
      let list = getAddressesFromStorage();
      list = list.filter((item) => item.id != options.id);
      saveAddressesToStorage(list);
      return { code: 0, message: "删除成功" };
    } catch (error) {
      console.error("删除地址失败:", error);
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
      console.error("退出登录失败:", error);
      return { code: -1 };
    }
  }, options);
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息
 */
function getUserInfo() {
  try {
    return wx.getStorageSync(STORAGE_KEY_USERINFO) || null;
  } catch (e) {
    return null;
  }
}

/**
 * 是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  try {
    return !!wx.getStorageSync(STORAGE_KEY_TOKEN);
  } catch (e) {
    return false;
  }
}

/**
 * 获取 token
 * @returns {string|null}
 */
function getToken() {
  try {
    return wx.getStorageSync(STORAGE_KEY_TOKEN) || null;
  } catch (e) {
    return null;
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
  getToken
};
