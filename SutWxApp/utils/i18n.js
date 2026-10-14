/**
 * 文件名: i18n.js
 * 版本号: 3.5.1
 * 更新日期: 2026-10-14
 * 描述: 轻量级 i18n 运行时（FE-002）。内置 zh-CN / en-US 资源，支持 {var} 插值、
 *       按系统语言或本地偏好自动选择 locale。其余语种资源待专业翻译后补充（阻塞项）。
 *
 * 用法：const { t, setLocale, getLocale } = require("./utils/i18n");
 *       t("loading") / t("offlineTip") / t("welcome", { name: "苏小糖" })
 */

const zhCN = require("../locales/zh-CN.json");
const enUS = require("../locales/en-US.json");

const RESOURCES = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

const DEFAULT_LOCALE = "zh-CN";
let currentLocale = DEFAULT_LOCALE;

/** 规范化 locale：精确匹配 → 前缀匹配 → 回退默认 */
function normalizeLocale(loc) {
  if (!loc) return DEFAULT_LOCALE;
  const normalized = String(loc).replace("_", "-");
  if (RESOURCES[normalized]) return normalized;
  const base = normalized.split("-")[0].toLowerCase();
  const hit = Object.keys(RESOURCES).find((k) =>
    k.toLowerCase().startsWith(base),
  );
  return hit || DEFAULT_LOCALE;
}

/** 读取当前 locale */
function getLocale() {
  return currentLocale;
}

/** 设置 locale 并持久化 */
function setLocale(loc) {
  currentLocale = normalizeLocale(loc);
  try {
    if (typeof wx !== "undefined" && wx.setStorageSync) {
      wx.setStorageSync("locale", currentLocale);
    }
  } catch (e) {
    // 忽略存储异常
  }
  return currentLocale;
}

/** 初始化：优先本地偏好，其次系统语言 */
function initLocale() {
  try {
    if (typeof wx !== "undefined" && wx.getStorageSync) {
      const saved = wx.getStorageSync("locale");
      if (saved) {
        currentLocale = normalizeLocale(saved);
        return currentLocale;
      }
      const sys =
        wx.getSystemInfoSync && wx.getSystemInfoSync().language
          ? wx.getSystemInfoSync().language
          : "";
      if (sys) currentLocale = normalizeLocale(sys);
    }
  } catch (e) {
    // 忽略初始化异常
  }
  return currentLocale;
}

/** 取翻译；缺失时回退默认 locale，再缺失时返回 key */
function t(key, vars) {
  const dict = RESOURCES[currentLocale] || RESOURCES[DEFAULT_LOCALE];
  let str = dict[key];
  if (str === undefined) {
    str =
      (RESOURCES[DEFAULT_LOCALE] && RESOURCES[DEFAULT_LOCALE][key]) || key;
  }
  if (vars && typeof str === "string") {
    str = str.replace(/\{(\w+)\}/g, (m, name) =>
      vars[name] !== undefined ? vars[name] : m,
    );
  }
  return str;
}

module.exports = {
  t,
  getLocale,
  setLocale,
  initLocale,
  normalizeLocale,
  DEFAULT_LOCALE,
  RESOURCES,
};
