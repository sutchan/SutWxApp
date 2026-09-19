/**
 * 文件名: handlers.js
 * 版本号: 3.4.1
 * 更新日期: 2026-09-19
 * 描述: 地址页交互回调（删除地址），从 pages/address/index.js 抽离
 */

const addressService = require("../../services/addressService");

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
    success: async function (res) {
      if (!res.confirm) {
        return;
      }
      wx.showLoading({ title: "删除中..." });
      try {
        await addressService.deleteAddress(id);
        wx.hideLoading();
        wx.showToast({ title: "删除成功", icon: "success" });
        page.loadAddressList();
      } catch (err) {
        wx.hideLoading();
        console.error("删除地址失败:", err);
        wx.showToast({ title: "删除失败", icon: "none" });
      }
    },
  });
}

module.exports = { confirmDeleteAddress };
