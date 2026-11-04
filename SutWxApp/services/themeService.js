/**
 * 文件名: themeService.js
 * 版本号: 3.5.10
 * 更新日期: 2026-09-12
 * 描述: 主题服务层：从 WordPress 后端 /api/theme 拉取主题配置并应用全局。
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");
const themeModel = require("../models/theme");

const THEME_STORAGE_KEY = "appTheme";
// 主题缓存时间戳（独立 key，避免改变 appTheme 的数据结构）。
const THEME_FETCHED_AT_KEY = "appThemeFetchedAt";
// 缓存有效期 6 小时：后台改主题后小程序能自动刷新，又不会每次启动都请求。
const THEME_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// 读取本地缓存主题（同步）
function getCachedTheme() {
  try {
    if (typeof wx !== "undefined" && wx.getStorageSync) {
      return wx.getStorageSync(THEME_STORAGE_KEY) || null;
    }
  } catch (e) {}
  return null;
}

/** 本地主题缓存是否已过期 */
function isThemeCacheStale() {
  try {
    if (typeof wx === "undefined" || !wx.getStorageSync) return true;
    const at = Number(wx.getStorageSync(THEME_FETCHED_AT_KEY)) || 0;
    return !at || Date.now() - at > THEME_CACHE_TTL_MS;
  } catch (e) {
    return true;
  }
}

/** 记录本次主题刷新时间 */
function markThemeFetched() {
  try {
    if (typeof wx !== "undefined" && wx.setStorageSync) {
      wx.setStorageSync(THEME_FETCHED_AT_KEY, Date.now());
    }
  } catch (e) {}
}

// 从后端拉取主题配置，失败回退默认预设
async function fetchTheme() {
  try {
    const raw = await request.get("/api/theme", {}, { needAuth: false });
    const config = unwrap(raw) || {};
    return themeModel.resolveTheme(config);
  } catch (error) {
    console.warn("主题配置获取失败，使用默认主题:", error);
    return themeModel.getPreset(themeModel.getDefaultThemeId()).colors;
  }
}

// 加载主题（缓存优先，后端拉取，再回退默认）
async function loadTheme() {
  let colors = getCachedTheme();
  // 无缓存或已过期都重新拉取；拉取失败时 fetchTheme 内部回退默认主题。
  if (!colors || isThemeCacheStale()) {
    colors = await fetchTheme();
    markThemeFetched();
  }
  try {
    if (typeof wx !== "undefined" && wx.setStorageSync) {
      wx.setStorageSync(THEME_STORAGE_KEY, colors);
    }
  } catch (e) {}
  return colors;
}

// 将主题写入 globalData 并下发给导航栏 / tabBar / 当前已渲染页面
function applyTheme(app, colors) {
  const themeStyle = themeModel.toCssVars(colors);
  app.globalData.theme = colors;
  app.globalData.themeStyle = themeStyle;

  if (typeof wx !== "undefined") {
    try {
      wx.setNavigationBarColor(
        Object.assign({ animation: { duration: 0 } }, themeModel.toNavBarColor()),
      );
    } catch (e) {}
    try {
      wx.setTabBarStyle(themeModel.toTabBarStyle(colors));
    } catch (e) {}
    if (wx.getCurrentPages) {
      wx.getCurrentPages().forEach((page) => {
        if (page && typeof page.setData === "function") {
          page.setData({ themeStyle });
        }
      });
    }
  }
  return themeStyle;
}

// 供 app.js 调用：加载并应用主题
async function loadAndApplyTheme(app) {
  const colors = await loadTheme();
  return applyTheme(app, colors);
}

module.exports = {
  THEME_STORAGE_KEY,
  loadTheme,
  loadAndApplyTheme,
  applyTheme,
  getCachedTheme,
  getDefaultThemeStyle: themeModel.getDefaultThemeStyle,
  getPresetList: themeModel.getPresetList,
};
