/**
 * 文件名: helpers-auth.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: App 登录与带鉴权请求逻辑（从 helpers.js 抽离，自包含不依赖 helpers）
 */

/**
 * 获取用户信息
 * @param {Object} globalData App 全局数据对象
 * @returns {Promise<Object>}
 */
function getUserInfo(globalData) {
  return new Promise((resolve, reject) => {
    if (globalData.userInfo) {
      resolve(globalData.userInfo);
      return;
    }
    wx.getUserProfile({
      desc: "用于完善用户资料",
      success: (res) => {
        try {
          wx.setStorageSync("userInfo", res.userInfo);
          globalData.userInfo = res.userInfo;
        } catch (e) {
          console.error("[App] getUserInfo - 保存失败:", e);
        }
        resolve(res.userInfo);
      },
      fail: (error) => {
        console.error("[App] getUserInfo - 获取用户信息失败:", error);
        reject(error);
      },
    });
  });
}

/**
 * 微信登录获取 code
 * @returns {Promise<string>}
 */
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          resolve(loginRes.code);
        } else {
          reject(new Error("登录凭证获取失败"));
        }
      },
      fail: (error) => {
        console.error("[App] login - 登录失败:", error);
        reject(error);
      },
    });
  });
}

/**
 * 带鉴权的请求
 * @param {Object} globalData App 全局数据对象
 * @param {string} url 接口路径
 * @param {string} [method] 请求方法
 * @param {Object} [data] 请求数据
 * @returns {Promise<*>}
 */
function requestWithToken(globalData, url, method = "GET", data = {}) {
  return new Promise((resolve, reject) => {
    const token = globalData.token;

    if (!token) {
      reject(new Error("未登录，请先登录"));
      return;
    }

    wx.request({
      url: globalData.baseUrl + url,
      method,
      data,
      header: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          console.warn("[App] requestWithToken - Token过期，需要重新登录");
          try {
            wx.removeStorageSync("token");
            wx.removeStorageSync("userInfo");
            wx.removeStorageSync("openid");
            wx.removeStorageSync("cart");
            globalData.token = null;
            globalData.userInfo = null;
            globalData.openid = null;
          } catch (e) {
            console.error("[App] requestWithToken - 清理存储失败:", e);
          }
          wx.redirectTo({ url: "/pages/home/index" });
          reject(new Error("登录已过期"));
        } else {
          reject(new Error(res.data.message || "请求失败"));
        }
      },
      fail: (error) => {
        console.error("[App] requestWithToken - 请求失败:", error);
        reject(error);
      },
    });
  });
}

module.exports = { getUserInfo, login, requestWithToken };
