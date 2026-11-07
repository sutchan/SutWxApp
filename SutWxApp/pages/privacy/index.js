/**
 * 文件名: index.js
 * 版本号: 3.5.14
 * 更新日期: 2026-11-07
 * 描述: 隐私授权页（COM-001）。由 app.js 的 onNeedPrivacyAuthorization 跳转至此，
 *       同意按钮必须为 open-type="agreePrivacyAuthorization"，并用其 id 回传官方 resolve。
 */

const privacy = require("../../utils/privacy");

const AGREE_BUTTON_ID = "privacy-agree-btn";

Page({
  data: {
    contractName: "《用户隐私保护指引》",
    supported: true,
  },

  onLoad: function () {
    this.setData({ supported: privacy.isPrivacySupported() });
    const that = this;
    privacy.getPrivacySetting().then(function (setting) {
      if (setting.privacyContractName) {
        that.setData({ contractName: setting.privacyContractName });
      }
    });
  },

  onUnload: function () {
    // 手势返回 / 未点击按钮离开时也要释放官方回调，避免隐私接口调用永久挂起。
    this.resolvePrivacy({ event: "disagree" });
  },

  /** 统一释放官方 resolve（防止重复调用）。 */
  resolvePrivacy: function (payload) {
    const app = getApp();
    const resolve = app && app.globalData && app.globalData.privacyResolve;
    if (!resolve) return false;
    app.globalData.privacyResolve = null;
    resolve(payload);
    return true;
  },

  onAgree: function () {
    this.resolvePrivacy({ buttonId: AGREE_BUTTON_ID, event: "agree" });
    wx.navigateBack({ delta: 1 });
  },

  onDisagree: function () {
    this.resolvePrivacy({ event: "disagree" });
    wx.navigateBack({ delta: 1 });
  },

  onViewContract: function () {
    privacy.openPrivacyContract();
  },

  onOpenSetting: function () {
    privacy.openAuthorizationSetting();
  },
});
