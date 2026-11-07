/**
 * 文件名: privacy.js
 * 版本号: 3.5.14
 * 更新日期: 2026-11-07
 * 描述: 微信用户隐私保护指引统一接入层（COM-001 / FE-010）。
 *       - 维护本小程序实际调用的隐私接口清单；
 *       - 对基础库 < 2.32.3 做能力探测与降级（不阻断业务）；
 *       - 提供「调用前确认授权」统一入口，拒绝时由业务走兜底。
 *
 * 官方约束：同意按钮必须是 <button open-type="agreePrivacyAuthorization">，
 * 且 resolve 时需回传该按钮的 buttonId，见 pages/privacy/index。
 */

const MIN_SDK_VERSION = "2.32.3";

/**
 * 本小程序实际使用/预留的隐私相关接口清单（与 mp 后台《用户隐私保护指引》字段逐一对应）。
 * 新增调用必须同步维护本表与 docs/specs/ops/spec.md 的合规清单。
 */
const PRIVACY_APIS = [
  { api: "wx.getUserProfile", scene: "完善用户资料", location: "helpers-auth.js", reason: "头像、昵称" },
  { api: "chooseAvatar", scene: "用户中心选择头像", location: "pages/user/index", reason: "头像（用户主动选择）" },
  { api: "input[type=nickname]", scene: "用户中心填写昵称", location: "pages/user/index", reason: "昵称（用户主动填写）" },
  { api: "wx.makePhoneCall", scene: "帮助中心联系客服", location: "pages/help/index.js", reason: "拨打电话（不上传号码）" },
  { api: "wx.openCustomerServiceChat", scene: "商品页客服会话", location: "behaviors/product-actions.js", reason: "客服会话" },
  { api: "wx.setClipboardData", scene: "复制链接", location: "behaviors/product-actions.js", reason: "剪贴板（不读取内容）" },
];

/** 版本比较：返回 a-b 的符号（按数值段逐位比较）。 */
function compareVersion(a, b) {
  const left = String(a || "0").split(".").map(Number);
  const right = String(b || "0").split(".").map(Number);
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i += 1) {
    const l = left[i] || 0;
    const r = right[i] || 0;
    if (l !== r) return l > r ? 1 : -1;
  }
  return 0;
}

/** 当前基础库是否支持隐私校验接口（2.32.3+）。 */
function isPrivacySupported() {
  if (typeof wx === "undefined" || !wx.getPrivacySetting || !wx.requirePrivacyAuthorize) {
    return false;
  }
  try {
    const info = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {};
    return compareVersion(info.SDKVersion, MIN_SDK_VERSION) >= 0;
  } catch (e) {
    return false;
  }
}

/**
 * 读取当前隐私授权状态。
 * @returns {Promise<{needAuthorization: boolean, privacyContractName: string}>}
 */
function getPrivacySetting() {
  return new Promise((resolve) => {
    if (!isPrivacySupported()) {
      resolve({ needAuthorization: false, privacyContractName: "" });
      return;
    }
    wx.getPrivacySetting({
      success: (res) => resolve({
        needAuthorization: !!res.needAuthorization,
        privacyContractName: res.privacyContractName || "",
      }),
      fail: () => resolve({ needAuthorization: false, privacyContractName: "" }),
    });
  });
}

/**
 * 注册全局「需要隐私授权」监听。回调收到官方 resolve，需转交授权页中的同意按钮。
 * @param {(resolve: Function) => void} onNeed 处理函数
 * @returns {boolean} 是否注册成功（低版本返回 false）
 */
function registerNeedPrivacyAuthorization(onNeed) {
  if (!isPrivacySupported() || !wx.onNeedPrivacyAuthorization) return false;
  wx.onNeedPrivacyAuthorization(onNeed);
  return true;
}

/**
 * 业务调用隐私接口前的统一前置检查。
 * 已授权 / 低版本基础库 → true；未授权 → 触发官方授权流程，用户同意为 true，拒绝为 false。
 * @returns {Promise<boolean>}
 */
function ensurePrivacyAuthorization() {
  return getPrivacySetting().then((setting) => {
    if (!setting.needAuthorization) return true;
    return new Promise((resolve) => {
      wx.requirePrivacyAuthorize({
        success: () => resolve(true),
        fail: () => resolve(false),
      });
    });
  });
}

/**
 * 包装隐私接口调用：授权通过才执行，拒绝时执行兜底。
 * @param {() => void} invoke 实际接口调用
 * @param {() => void} [onRejected] 用户拒绝或授权失败时的兜底
 * @returns {Promise<boolean>} 是否执行了接口调用
 */
function withPrivacy(invoke, onRejected) {
  return ensurePrivacyAuthorization().then((ok) => {
    if (ok) {
      invoke();
    } else if (onRejected) {
      onRejected();
    } else {
      wx.showToast({ title: "需同意隐私指引后使用", icon: "none" });
    }
    return ok;
  });
}

/** 打开官方《用户隐私保护指引》（低版本静默失败）。 */
function openPrivacyContract() {
  if (!wx.openPrivacyContract) {
    wx.showToast({ title: "当前微信版本不支持", icon: "none" });
    return;
  }
  wx.openPrivacyContract({
    fail: () => wx.showToast({ title: "指引暂不可用", icon: "none" }),
  });
}

/** 打开微信设置页，供用户自行管理系统授权。 */
function openAuthorizationSetting() {
  if (!wx.openSetting) return;
  wx.openSetting({ fail: () => wx.showToast({ title: "设置页暂不可用", icon: "none" }) });
}

module.exports = {
  MIN_SDK_VERSION,
  PRIVACY_APIS,
  compareVersion,
  isPrivacySupported,
  getPrivacySetting,
  registerNeedPrivacyAuthorization,
  ensurePrivacyAuthorization,
  withPrivacy,
  openPrivacyContract,
  openAuthorizationSetting,
};
