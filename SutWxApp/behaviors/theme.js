/**
 * 文件名: theme.js
 * 版本号: 3.0.7
 * 更新日期: 2026-09-12
 * 描述: 页面主题 Behavior：从 globalData 读取当前主题 CSS 变量字符串并注入页面根容器。
 */

const themeService = require("../services/themeService");

module.exports = Behavior({
  // 形如 "--primary-color:#xxx; --primary-light:#xxx; ..." 的 CSS 变量声明字符串
  data: {
    themeStyle: "",
  },

  // 页面生命周期（Behavior 内声明，会随页面一同触发）
  onLoad: function () {
    this.applyThemeStyle();
  },

  onShow: function () {
    this.applyThemeStyle();
  },

  methods: {
    // 从 globalData 同步主题样式到本页面根容器
    applyThemeStyle: function () {
      const app = typeof getApp === "function" ? getApp() : null;
      const themeStyle =
        app && app.globalData && app.globalData.themeStyle
          ? app.globalData.themeStyle
          : themeService.getDefaultThemeStyle();
      if (themeStyle && themeStyle !== this.data.themeStyle) {
        this.setData({ themeStyle });
      }
    },
  },
});
