/**
 * 文件名: theme.mapper.test.js
 * 版本号: 1.0.0
 * 更新日期: 2026-09-12
 * 描述: 主题预设与后端配置解析单元测试
 */

const {
  THEME_PRESETS,
  DEFAULT_THEME_ID,
  getDefaultThemeId,
  getPreset,
  getPresetList,
  resolveTheme,
  toCssVars,
  getDefaultThemeStyle,
} = require("../models/theme");

describe("getPreset / 预设", () => {
  it("默认预设为苏铁绿", () => {
    expect(getDefaultThemeId()).toBe("sut-green");
    expect(getPreset("sut-green").colors.primaryColor).toBe("#2E7D32");
  });

  it("未知 presetId 回退默认", () => {
    expect(getPreset("not-exist").id).toBe(DEFAULT_THEME_ID);
  });

  it("内置 5 套配色预设", () => {
    const list = getPresetList();
    expect(list).toHaveLength(5);
    expect(list.map((i) => i.id)).toContain("sky-blue");
  });
});

describe("resolveTheme - 后端配置合并", () => {
  it("仅 presetId 时取该预设全部色值", () => {
    const colors = resolveTheme({ presetId: "sky-blue" });
    expect(colors.primaryColor).toBe("#1976D2");
    expect(colors.backgroundSecondary).toBe("#F5F5F7");
  });

  it("custom 覆盖指定色值", () => {
    const colors = resolveTheme({ presetId: "sut-green", custom: { primaryColor: "#E91E63" } });
    expect(colors.primaryColor).toBe("#E91E63");
    expect(colors.primaryDark).toBe("#1B5E20"); // 未被覆盖
  });

  it("非法颜色值被忽略", () => {
    const colors = resolveTheme({ custom: { primaryColor: "不是颜色" } });
    expect(colors.primaryColor).toBe(THEME_PRESETS[DEFAULT_THEME_ID].colors.primaryColor);
  });

  it("空配置回退默认预设", () => {
    const colors = resolveTheme({});
    expect(colors.primaryColor).toBe("#2E7D32");
  });
});

describe("toCssVars - CSS 变量字符串", () => {
  it("驼峰字段转 kebab-case 变量名", () => {
    const vars = toCssVars({ primaryColor: "#2E7D32" });
    expect(vars).toContain("--primary-color: #2E7D32;");
    expect(vars).toContain("--primary-light");
    expect(vars).toContain("--background-secondary");
  });

  it("默认主题样式非空且与 app.wxss 变量对应", () => {
    const style = getDefaultThemeStyle();
    expect(style).toContain("--primary-color: #2E7D32;");
    expect(style).toContain("--text-primary: #1D1D1F;");
  });
});
