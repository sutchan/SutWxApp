/**
 * 文件名: handlers.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 地址页交互回调（保存/删除），从 pages/address/index.js 抽离
 */

const authService = require("../../services/authService");

/**
 * 确认并删除地址
 * @param {Object} page 页面实例（this）
 * @param {number|string} id 地址ID
 */
function confirmDeleteAddress(page, id) {
  wx.showModal({
    title: "确认删除",
    content: "确定要删除这个收货地址吗？",
    confirmColor: "#ff4d4f",
    success: function (res) {
      if (res.confirm) {
        wx.showLoading({ title: "删除中..." });
        authService.deleteAddress({
          id: id,
          success: function (deleteRes) {
            wx.hideLoading();
            if (deleteRes.code === 0) {
              wx.showToast({ title: "删除成功", icon: "success" });
              page.loadAddressList();
            } else {
              wx.showToast({ title: deleteRes.message || "删除失败", icon: "none" });
            }
          },
          fail: function (err) {
            wx.hideLoading();
            console.error("删除地址失败:", err);
            wx.showToast({ title: "删除失败", icon: "none" });
          },
        });
      }
    },
  });
}

/**
 * 构造保存地址的成功/失败回调
 * @param {Object} page 页面实例（this）
 * @returns {{success: Function, fail: Function}}
 */
function buildSaveCallbacks(page) {
  return {
    success: function (res) {
      wx.hideLoading();
      if (res.code === 0) {
        wx.showToast({ title: "保存成功", icon: "success" });
        page.setData({ showModal: false });
        page.loadAddressList();
      } else {
        wx.showToast({ title: res.message || "保存失败", icon: "none" });
      }
    },
    fail: function (err) {
      wx.hideLoading();
      console.error("保存地址失败:", err);
      wx.showToast({ title: "保存失败", icon: "none" });
    },
  };
}

module.exports = { confirmDeleteAddress, buildSaveCallbacks };
