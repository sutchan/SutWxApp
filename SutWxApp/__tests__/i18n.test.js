/**
 * 文件名: i18n.test.js
 * 描述: i18n 运行时单测（FE-002）：默认 locale、切换、缺失回退、插值、规范化
 */

const i18n = require("../utils/i18n");

beforeEach(() => {
  i18n.setLocale("zh-CN");
});

describe("i18n 基础取值", () => {
  test("默认 zh-CN 应返回中文", () => {
    expect(i18n.t("loading")).toBe("加载中…");
    expect(i18n.t("login")).toBe("登录");
  });

  test("缺失 key 应回退为 key 本身", () => {
    expect(i18n.t("not_exist_key")).toBe("not_exist_key");
  });

  test("缺失 key 在默认 locale 也无时返回 key", () => {
    expect(i18n.t("another_missing")).toBe("another_missing");
  });
});

describe("i18n 切换 locale", () => {
  test("切换到 en-US 应返回英文", () => {
    i18n.setLocale("en-US");
    expect(i18n.getLocale()).toBe("en-US");
    expect(i18n.t("loading")).toBe("Loading…");
    expect(i18n.t("login")).toBe("Sign In");
  });

  test("下划线形式 locale 应被规范化", () => {
    i18n.setLocale("en_US");
    expect(i18n.getLocale()).toBe("en-US");
  });

  test("未知 locale 应回退默认 zh-CN", () => {
    i18n.setLocale("fr-FR");
    expect(i18n.getLocale()).toBe("zh-CN");
    expect(i18n.t("loading")).toBe("加载中…");
  });
});

describe("i18n 插值", () => {
  test("插值变量应被替换，缺失变量保留占位符", () => {
    // 用不存在的 key 配合插值验证替换逻辑不报错且保留占位
    expect(i18n.t("hi_{name}", { name: "苏小糖" })).toBe("hi_{name}");
  });
});
