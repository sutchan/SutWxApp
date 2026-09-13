/**
 * 文件名: themeService.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-12
 * 描述: 主题服务层：从 WordPress 后端 /api/theme 拉取主题配置并应用全局。
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");
const themeModel = require("../models/theme");

const THEME_STORAGE_KEY = "appTheme";

// 读取本地缓存主题（同步）
function getCachedTheme() {
  try {
    if (typeof wx !== "undefined" && wx.getStorageSync) {
      return wx.getStorageSync(THEME_STORAGE_KEY) || null;
    }
  } catch (e) {}
  return null;
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
  if (!colors) {
    colors = await fetchTheme();
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
