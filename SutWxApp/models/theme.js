/**
 * 文件名: theme.js
 * 版本号: 3.0.7
 * 更新日期: 2026-09-12
 * 描述: 主题数据模型：内置多套默认配色预设，并提供后端主题配置的解析与合并能力。
 */

// 主题 CSS 变量字段（与 app.wxss 中 page 选择器定义的变量保持一致）
const THEME_KEYS = [
  "primaryColor",
  "primaryLight",
  "primaryDark",
  "textPrimary",
  "textSecondary",
  "textTertiary",
  "textInverse",
  "borderColor",
  "backgroundPrimary",
  "backgroundSecondary",
  "backgroundTertiary",
];

// 中性色（各预设保持一致，保证文本与背景可读性）
const NEUTRAL_COLORS = {
  textPrimary: "#1D1D1F",
  textSecondary: "#86868B",
  textTertiary: "#AEAEB2",
  textInverse: "#FFFFFF",
  borderColor: "#E8E8ED",
  backgroundPrimary: "#FFFFFF",
  backgroundSecondary: "#F5F5F7",
  backgroundTertiary: "#FAFAFA",
};

// 内置默认主题配色预设（WordPress 后台可切换；小程序自带多种配色）
const THEME_PRESETS = {
  "sut-green": {
    id: "sut-green",
    name: "苏铁绿",
    colors: Object.assign(
      { primaryColor: "#2E7D32", primaryLight: "#F1F8E9", primaryDark: "#1B5E20" },
      NEUTRAL_COLORS,
    ),
  },
  "sky-blue": {
    id: "sky-blue",
    name: "天空蓝",
    colors: Object.assign(
      { primaryColor: "#1976D2", primaryLight: "#E3F2FD", primaryDark: "#0D47A1" },
      NEUTRAL_COLORS,
    ),
  },
  "sunny-orange": {
    id: "sunny-orange",
    name: "暖阳橙",
    colors: Object.assign(
      { primaryColor: "#F57C00", primaryLight: "#FFF3E0", primaryDark: "#E65100" },
      NEUTRAL_COLORS,
    ),
  },
  "violet": {
    id: "violet",
    name: "紫罗兰",
    colors: Object.assign(
      { primaryColor: "#7B1FA2", primaryLight: "#F3E5F5", primaryDark: "#4A148C" },
      NEUTRAL_COLORS,
    ),
  },
  "graphite": {
    id: "graphite",
    name: "石墨黑",
    colors: Object.assign(
      { primaryColor: "#424242", primaryLight: "#ECEFF1", primaryDark: "#212121" },
      NEUTRAL_COLORS,
    ),
  },
};

const DEFAULT_THEME_ID = "sut-green";

function getDefaultThemeId() {
  return DEFAULT_THEME_ID;
}

function getPreset(id) {
  return THEME_PRESETS[id] || THEME_PRESETS[DEFAULT_THEME_ID];
}

function getPresetList() {
  return Object.keys(THEME_PRESETS).map((id) => ({
    id: THEME_PRESETS[id].id,
    name: THEME_PRESETS[id].name,
  }));
}

// 校验十六进制颜色字符串（#RGB 或 #RRGGBB）
function isColorString(value) {
  return typeof value === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

// 合并后端主题配置与内置预设：presetId 选择预设，custom 覆盖指定色值
function resolveTheme(config) {
  config = config || {};
  const preset = getPreset(config.presetId);
  const colors = Object.assign({}, preset.colors);
  const custom = config.custom || {};
  if (custom && typeof custom === "object") {
    THEME_KEYS.forEach((key) => {
      if (custom[key] && isColorString(custom[key])) {
        colors[key] = custom[key].trim();
      }
    });
  }
  return colors;
}

// 驼峰字段转为 CSS 变量名：primaryColor -> --primary-color
function toCssVarName(key) {
  return "--" + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

// 将主题色值转为可绑定到页面根容器的 CSS 变量声明字符串
function toCssVars(colors) {
  return THEME_KEYS.map((key) => `${toCssVarName(key)}: ${colors[key]};`).join(" ");
}

function getDefaultThemeStyle() {
  return toCssVars(getPreset(DEFAULT_THEME_ID).colors);
}

// 导航栏配色（前后端统一白底黑字）
function toNavBarColor() {
  return { frontColor: "#000000", backgroundColor: "#FFFFFF" };
}

// tabBar 动态配色（selectedColor 跟随主题主色）
function toTabBarStyle(colors) {
  return {
    color: NEUTRAL_COLORS.textSecondary,
    selectedColor: colors.primaryColor,
    backgroundColor: NEUTRAL_COLORS.backgroundPrimary,
    borderStyle: "black",
  };
}

module.exports = {
  THEME_KEYS,
  THEME_PRESETS,
  DEFAULT_THEME_ID,
  getDefaultThemeId,
  getPreset,
  getPresetList,
  resolveTheme,
  toCssVars,
  getDefaultThemeStyle,
  toNavBarColor,
  toTabBarStyle,
};
